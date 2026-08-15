# Module 3: Deepfake Identification

## Implementation Details
This module runs via a Python backend using OpenCV. It implements **Error Level Analysis (ELA)** and **Fast Fourier Transform (FFT) Spectral Analysis** to score frame-by-frame media authenticity.

## Model Explanation
We utilize a backend heuristic that detects synthetic compression artifacts and high-frequency noise grids instead of relying solely on biometrically biased classification models.

## Ethnically Unbiased Verification (Sri Lankan Compatibility)
Unlike standard deep learning classification models which can have demographic bias (e.g., higher false alarm rates for specific skin tones or ethnic features), our core backend detector is **unbiased towards human ethnicity**:
- **Error Level Analysis (ELA)**: Evaluates localized JPEG compression ratios. ELA is purely image-signal based and is unaffected by skin tone or facial shape.
- **FFT Spectral Analysis**: Checks the frequency domain representation of the image for periodic noise patterns (grid artifacts) typical of GAN/Diffusion generators. This runs identically regardless of the subject's gender, age, or race.

This design guarantees that Deepfake Identification runs with identical error thresholds and accuracy rates on Sri Lankan faces.

## Dataset References
- FaceForensics++ (For training signal baselines)
- DeepFake Detection Challenge Dataset (DFDC)
