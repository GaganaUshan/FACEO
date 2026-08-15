import os
import sys

# Ensure backend module is importable from root
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import cv2
import numpy as np

from utils.skin_analysis import analyze_skin
from deepfake_model.predict import predict_authenticity

app = FastAPI(title="Human Authenticity API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For development
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def health_check():
    return {"status": "Backend Active"}

@app.post("/api/analyze-frame")
async def analyze_frame(file: UploadFile = File(...)):
    contents = await file.read()
    nparr = np.frombuffer(contents, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    # Execute Module 4 (Developer 4)
    skin_data = analyze_skin(img)
    
    # Execute Module 3 (Developer 3)
    authenticity_data = predict_authenticity(img)

    return {
        "status": "success",
        "skin_analysis": skin_data,
        "deepfake_analysis": authenticity_data
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
