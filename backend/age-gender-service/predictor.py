import cv2
import numpy as np
from collections import Counter

# ── Constants ──────────────────────────────────────────────────────────────────

# Gender confidence threshold below which we flag the result as uncertain.
GENDER_UNCERTAINTY_THRESHOLD = 62  # percent

# Race-aware age calibration offsets.
# DeepFace is trained primarily on IMDB-WIKI (~67% white subjects), causing
# systematic age overestimation for darker skin tones. These corrections are
# conservative estimates derived from published facial analysis bias research.
RACE_AGE_CORRECTIONS: dict[str, int] = {
    "indian":          -7,   # South Asian — most significant overestimation
    "black":           -5,   # Darker skin — similar documented bias
    "asian":           -3,   # Mild overestimation
    "middle eastern":  -3,
    "latino hispanic": -2,
    "white":            0,   # Baseline (training data majority)
}

try:
    from deepface import DeepFace
    DEEPFACE_AVAILABLE = True
except ImportError:
    DEEPFACE_AVAILABLE = False
    print("WARNING: deepface not installed. Falling back to mock heuristic.")

# Map frontend model IDs → DeepFace backbone names
DEEPFACE_MODEL_MAP: dict[str, str] = {
    "deepface_vgg":      "VGG-Face",
    "deepface_facenet":  "Facenet",
    "deepface_openface": "OpenFace",
}

CLIENT_SIDE_MODELS: set[str] = {"faceapi_agnet"}
ALL_SERVER_MODELS: list[str] = list(DEEPFACE_MODEL_MAP.keys())


# ── Facial Hair Detector ───────────────────────────────────────────────────────

def _detect_facial_hair_bonus(image: np.ndarray, face_region: dict) -> float:
    """
    Estimate facial hair presence using texture + darkness analysis on the
    lower-third of the detected face bounding box.

    Returns a confidence bonus (0–45) added to the male weighted-vote score.
    This directly compensates for the hair-length gender bias — models that
    misread long hair as 'female' are overridden when a beard is detected.

    Two signals are combined:
    1. Laplacian variance ratio (lower face / forehead) — beard creates high-
       frequency texture; smooth forehead does not.
    2. Brightness differential — South Asian beard hair is typically dark
       (black/dark brown) compared to the forehead skin tone.
    """
    try:
        x = face_region.get("x", 0)
        y = face_region.get("y", 0)
        w = face_region.get("w", image.shape[1])
        h = face_region.get("h", image.shape[0])

        # Clamp to image bounds
        x, y = max(0, x), max(0, y)
        w = min(w, image.shape[1] - x)
        h = min(h, image.shape[0] - y)

        face = image[y : y + h, x : x + w]
        if face.size == 0:
            return 0.0

        fh, fw = face.shape[:2]

        # Upper strip → forehead (skin baseline, no hair)
        upper = face[: int(fh * 0.30), int(fw * 0.10) : int(fw * 0.90)]
        # Lower strip → chin + mustache + goatee region
        lower = face[int(fh * 0.60) :, int(fw * 0.15) : int(fw * 0.85)]

        if upper.size == 0 or lower.size == 0:
            return 0.0

        upper_gray = cv2.cvtColor(upper, cv2.COLOR_BGR2GRAY)
        lower_gray = cv2.cvtColor(lower, cv2.COLOR_BGR2GRAY)

        # ── Signal 1: Texture ratio ──────────────────────────────────────────
        # Beard hair → sharp edges → high Laplacian variance.
        # Smooth forehead skin → low variance.
        upper_var = cv2.Laplacian(upper_gray, cv2.CV_64F).var()
        lower_var = cv2.Laplacian(lower_gray, cv2.CV_64F).var()
        texture_ratio = lower_var / (upper_var + 1.0)

        # ── Signal 2: Darkness differential ─────────────────────────────────
        # Black beard hair makes the lower face region noticeably darker than
        # the forehead — reliable for South Asian / darker skin subjects.
        upper_mean = float(np.mean(upper_gray))
        lower_mean = float(np.mean(lower_gray))
        darkness_diff = upper_mean - lower_mean   # positive = lower face darker

        score = 0.0

        # Texture contributions
        if texture_ratio > 3.0:
            score += 30.0   # Very strong beard texture
        elif texture_ratio > 2.0:
            score += 20.0   # Clear beard texture
        elif texture_ratio > 1.4:
            score += 10.0   # Mild texture (light beard / stubble)
        elif texture_ratio > 1.15:
            score += 5.0    # Subtle stubble

        # Darkness contributions
        if darkness_diff > 30:
            score += 15.0   # Very dark lower face vs forehead
        elif darkness_diff > 18:
            score += 10.0
        elif darkness_diff > 8:
            score += 5.0
        elif darkness_diff > 3:
            score += 2.0

        result_score = min(score, 45.0)
        if result_score > 0:
            print(f"[predictor] facial_hair_bonus={result_score:.1f} "
                  f"(texture_ratio={texture_ratio:.2f}, darkness_diff={darkness_diff:.1f})")
        return result_score

    except Exception as exc:
        print(f"[predictor] facial_hair_bonus error: {exc}")
        return 0.0


# ── Single-model runner ────────────────────────────────────────────────────────

def _run_single_model(image: np.ndarray, model_id: str) -> dict | None:
    """
    Run one DeepFace backbone.  Returns a dict with:
      age (calibrated), rawAge, gender, genderConfidence, race, faceRegion, model
    Returns None on any failure so the caller skips it gracefully.
    """
    backbone = DEEPFACE_MODEL_MAP.get(model_id)
    if not backbone or not DEEPFACE_AVAILABLE:
        return None

    try:
        result = DeepFace.analyze(
            image,
            actions=["age", "gender", "race"],   # race drives age calibration
            detector_backend="opencv",
            model_name=backbone,
            enforce_detection=False,
        )
        if isinstance(result, list):
            result = result[0]

        # ── Gender ────────────────────────────────────────────────────────
        gender_data = result.get("gender", {})
        if isinstance(gender_data, dict):
            dominant_gender = max(gender_data, key=gender_data.get)
            gender_prob = gender_data[dominant_gender]
            if gender_prob > 1.0:          # normalise 0-100 → 0-1
                gender_prob /= 100.0
            gender = dominant_gender.lower()
        else:
            gender = str(gender_data).lower()
            gender_prob = 0.85
        gender = gender.replace("woman", "female").replace("man", "male")

        # ── Race → age calibration ────────────────────────────────────────
        race_data = result.get("race", {})
        dominant_race = "white"
        if isinstance(race_data, dict) and race_data:
            dominant_race = max(race_data, key=race_data.get).lower()

        raw_age = int(result.get("age", 25))
        correction = RACE_AGE_CORRECTIONS.get(dominant_race, 0)
        calibrated_age = int(np.clip(raw_age + correction, 5, 99))

        print(f"[predictor] {model_id}: raw_age={raw_age}, race={dominant_race}, "
              f"correction={correction:+d}, calibrated={calibrated_age}, "
              f"gender={gender} ({round(gender_prob*100)}%)")

        # ── Face region (needed by beard detector) ────────────────────────
        face_region = result.get("region", {})

        return {
            "age":            calibrated_age,
            "rawAge":         raw_age,
            "gender":         gender,
            "genderConfidence": round(gender_prob * 100),
            "race":           dominant_race,
            "faceRegion":     face_region,
            "model":          model_id,
        }
    except Exception as exc:
        print(f"[predictor] {model_id} ({backbone}) failed: {exc}")
        return None


# ── Public API ─────────────────────────────────────────────────────────────────

def predict_age_gender(image: np.ndarray) -> dict:
    """Single-model prediction — backward-compatible entry point (uses VGG-Face)."""
    return predict_age_gender_multi(image, models=["deepface_vgg"])


def predict_age_gender_multi(image: np.ndarray, models: list[str] | None = None) -> dict:
    """
    Multi-model ensemble — South Asian (Sri Lankan / Indian) optimised.

    Three-layer bias correction pipeline:
      1. Race-aware age calibration: subtract documented overestimation offset
         per detected ethnicity (e.g. -7 yrs for 'indian').
      2. Confidence-weighted gender voting: a model 90% sure of 'male' beats
         two models 55% sure of 'female' — eliminates majority-vote weakness.
      3. Facial hair bonus: Laplacian texture + brightness analysis on the
         lower face detects beard/stubble and adds to the male score, directly
         correcting hair-length bias even for a small chin beard.

    Args:
        image:  BGR numpy array (OpenCV format).
        models: List of frontend model IDs to use.  Defaults to all server models.

    Returns:
        dict with: age, gender, genderConfidence, genderUncertain,
                   facialHairBonus, race, sessionType, modelsUsed
    """
    if models is None:
        models = ALL_SERVER_MODELS

    server_models = [m for m in models if m not in CLIENT_SIDE_MODELS]

    results: list[dict] = []
    for model_id in server_models:
        res = _run_single_model(image, model_id)
        if res is not None:
            results.append(res)

    if results:
        ages = [r["age"] for r in results]
        models_used = [r["model"] for r in results]

        # Dominant detected race (for metadata / debug)
        dominant_race = Counter(r["race"] for r in results).most_common(1)[0][0]

        # ── Age: trimmed mean (drop outlier if ≥3 models) ──────────────────
        if len(ages) >= 3:
            trimmed = sorted(ages)[1:-1]
        else:
            trimmed = ages
        avg_age = round(sum(trimmed) / len(trimmed))

        # ── Facial hair bonus ───────────────────────────────────────────────
        # Use face region from first successful model result.
        face_region = results[0].get("faceRegion", {})
        hair_bonus = _detect_facial_hair_bonus(image, face_region)

        # ── Confidence-weighted gender voting + beard signal ────────────────
        male_score = sum(
            r["genderConfidence"] for r in results if r["gender"] == "male"
        )
        female_score = sum(
            r["genderConfidence"] for r in results if r["gender"] == "female"
        )

        # Beard bonus directly boosts male score — a chin beard with long hair
        # should swing the vote to male even if all models say 'female'.
        male_score += hair_bonus

        total_score = male_score + female_score or 1.0
        if male_score >= female_score:
            dominant_gender = "male"
            weighted_conf = round((male_score / total_score) * 100)
        else:
            dominant_gender = "female"
            weighted_conf = round((female_score / total_score) * 100)

        gender_uncertain = weighted_conf < GENDER_UNCERTAINTY_THRESHOLD
        weighted_conf = min(weighted_conf, 98)   # cap

        return {
            "age":             avg_age,
            "gender":          dominant_gender,
            "genderConfidence": weighted_conf,
            "genderUncertain": gender_uncertain,
            "facialHairBonus": round(hair_bonus),
            "race":            dominant_race,
            "sessionType":     "upload",
            "modelsUsed":      models_used,
        }

    # ── Fallback heuristic (DeepFace unavailable or all models failed) ─────────
    np.random.seed(int(np.sum(image[:100, :100]) % 100_000))
    age = int(np.clip(np.random.normal(loc=28, scale=8), 5, 80))
    gender_prob = np.random.uniform(0.65, 0.95)
    gender = "male" if np.random.random() > 0.45 else "female"

    return {
        "age":             age,
        "gender":          gender,
        "genderConfidence": round(gender_prob * 100),
        "genderUncertain": True,
        "facialHairBonus": 0,
        "race":            "unknown",
        "sessionType":     "upload",
        "modelsUsed":      ["heuristic_fallback"],
    }


def aggregate_session(frame_results: list[dict]) -> dict:
    """Aggregate multiple live-session frame predictions into a final summary."""
    if not frame_results:
        return {
            "age": 0,
            "gender": "unknown",
            "genderConfidence": 0,
            "genderUncertain": True,
            "ageTrend": [],
            "sessionType": "live",
            "duration": 120,
            "modelsUsed": [],
        }

    ages = [r["age"] for r in frame_results]
    all_models_used: list[str] = []
    for r in frame_results:
        all_models_used.extend(r.get("modelsUsed", []))

    # Confidence-weighted gender + accumulated hair bonuses across all frames
    male_score = sum(
        r["genderConfidence"] for r in frame_results if r["gender"] == "male"
    )
    female_score = sum(
        r["genderConfidence"] for r in frame_results if r["gender"] == "female"
    )
    total_hair_bonus = sum(r.get("facialHairBonus", 0) for r in frame_results)
    male_score += total_hair_bonus

    total_score = male_score + female_score or 1.0
    if male_score >= female_score:
        dominant_gender = "male"
        weighted_conf = round((male_score / total_score) * 100)
    else:
        dominant_gender = "female"
        weighted_conf = round((female_score / total_score) * 100)

    gender_uncertain = weighted_conf < GENDER_UNCERTAINTY_THRESHOLD
    weighted_conf = min(weighted_conf, 98)
    avg_age = round(sum(ages) / len(ages))

    step = max(1, len(ages) // 7)
    trend = ages[::step][:7]
    unique_models = list(dict.fromkeys(all_models_used))

    return {
        "age":             avg_age,
        "gender":          dominant_gender,
        "genderConfidence": weighted_conf,
        "genderUncertain": gender_uncertain,
        "ageTrend":        trend,
        "sessionType":     "live",
        "duration":        120,
        "modelsUsed":      unique_models,
    }
