import numpy as np

DETECTION_LABELS = ["Scar", "Bruise", "Mole"]


def predict_bruises(image: np.ndarray) -> dict:
    """
    Face marks and bruise detection module.
    Currently uses mock bounding box generation.
    Replace with actual YOLO model inference.
    """
    np.random.seed(int(np.sum(image[:30, :30]) % 100000))

    h, w = image.shape[:2]
    num_detections = np.random.choice([0, 1, 2, 3], p=[0.3, 0.35, 0.25, 0.1])

    detections = []
    for _ in range(num_detections):
        label = np.random.choice(DETECTION_LABELS)
        confidence = round(float(np.random.uniform(0.45, 0.95)), 2)
        x = int(np.random.uniform(w * 0.1, w * 0.7))
        y = int(np.random.uniform(h * 0.1, h * 0.7))
        bw = int(np.random.uniform(w * 0.05, w * 0.15))
        bh = int(np.random.uniform(h * 0.05, h * 0.15))

        detections.append({
            "label": label,
            "confidence": round(confidence * 100),
            "bbox": {"x": x, "y": y, "w": bw, "h": bh},
        })

    return {
        "detections": detections,
        "totalDetections": len(detections),
        "sessionType": "upload",
        "imageWidth": w,
        "imageHeight": h,
    }


def aggregate_bruise_session(frame_results: list[dict]) -> dict:
    """Aggregate multi-frame bruise detection results."""
    if not frame_results:
        return {
            "detections": [],
            "totalDetections": 0,
            "avgConfidence": 0,
            "timeline": [],
            "sessionType": "live",
            "duration": 120,
        }

    # Collect all detections
    all_detections = []
    timeline = []
    for r in frame_results:
        timeline.append(r["totalDetections"])
        all_detections.extend(r["detections"])

    # Deduplicate by taking highest confidence per label
    best_by_label = {}
    for det in all_detections:
        label = det["label"]
        if label not in best_by_label or det["confidence"] > best_by_label[label]["confidence"]:
            best_by_label[label] = det

    final_detections = list(best_by_label.values())
    avg_conf = round(sum(d["confidence"] for d in final_detections) / max(len(final_detections), 1))

    # Sample timeline to 7 points
    step = max(1, len(timeline) // 7)
    sampled_timeline = timeline[::step][:7]

    return {
        "detections": final_detections,
        "totalDetections": len(final_detections),
        "avgConfidence": avg_conf,
        "timeline": sampled_timeline,
        "sessionType": "live",
        "duration": 120,
    }
