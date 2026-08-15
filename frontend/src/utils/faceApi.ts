let faceapi: any = null;
if (typeof window !== "undefined") {
  faceapi = require("@vladmandic/face-api");
}

export const loadModels = async () => {
    if (!faceapi) return false;
    const MODEL_URL = '/models';

    try {
        await Promise.all([
            faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
            faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
            faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
            faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
            faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
            faceapi.nets.ageGenderNet.loadFromUri(MODEL_URL),
        ]);
        return true;
    } catch (error) {
        console.error("Error loading face-api models:", error);
        return false;
    }
};

export const detectFaceAndEmotions = async (
    mediaElement: HTMLVideoElement | HTMLImageElement | HTMLCanvasElement,
    useTiny = false
) => {
    if (!mediaElement || !faceapi) return null;

    try {
        const options = useTiny
            ? new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.5 })
            : new faceapi.SsdMobilenetv1Options({ minConfidence: 0.5 });

        const detections = await faceapi.detectAllFaces(mediaElement, options)
            .withFaceLandmarks()
            .withFaceExpressions()
            .withAgeAndGender();

        return detections;
    } catch (error) {
        console.error("Detection error:", error);
        return null;
    }
};

