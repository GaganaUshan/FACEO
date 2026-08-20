import os
import sys
import uuid
import json
from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
import cv2
import numpy as np
from typing import Optional

# Import predictor
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from predictor import predict_age_gender_multi, aggregate_session

app = FastAPI(title="Faceo Analytics — Age & Gender Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory session store
sessions = {}


@app.get("/")
def health_check():
    return {"status": "Age & Gender Service Active", "port": 8001}


@app.post("/analyze-image")
async def analyze_image(
    file: UploadFile = File(...),
    models: Optional[str] = Form(None),   # JSON array string e.g. '["deepface_vgg","deepface_facenet"]'
):
    """
    Analyze a single image for age and gender.
    Accepts an optional `models` form field (JSON array of model IDs).
    If omitted, all available server-side models are used.
    """
    contents = await file.read()
    nparr = np.frombuffer(contents, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    # Parse model list
    model_list = None
    if models:
        try:
            model_list = json.loads(models)
        except (json.JSONDecodeError, ValueError):
            model_list = None  # Fall back to defaults

    result = predict_age_gender_multi(img, models=model_list)
    result["sessionType"] = "upload"
    return {"status": "success", "data": result}


@app.post("/analyze-live-session")
async def analyze_live_session(
    frames: list[UploadFile] = File(...),
    models: Optional[str] = Form(None),   # JSON array string
):
    """
    Analyze a set of live session frames for age and gender.
    Accepts an optional `models` form field (JSON array of model IDs).
    """
    session_id = str(uuid.uuid4())[:8]
    frame_results = []

    # Parse model list
    model_list = None
    if models:
        try:
            model_list = json.loads(models)
        except (json.JSONDecodeError, ValueError):
            model_list = None

    for frame_file in frames:
        contents = await frame_file.read()
        nparr = np.frombuffer(contents, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if img is not None:
            frame_results.append(predict_age_gender_multi(img, models=model_list))

    aggregated = aggregate_session(frame_results)
    aggregated["sessionId"] = session_id
    sessions[session_id] = aggregated

    return {"status": "success", "data": aggregated}


@app.get("/session/{session_id}")
def get_session(session_id: str):
    if session_id in sessions:
        return {"status": "success", "data": sessions[session_id]}
    return {"status": "error", "error": "Session not found"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
