# Module 4: Skin Tone & Skin Clearness Detection

## Implementation Details
This module detects the face region, extracts skin regions, and analyzes skin color distribution and texture patterns using OpenCV.

## Model Explanation
Backend-based image processing using color space conversions (HSV) and texture algorithms (e.g., Laplacian variance).

## Sri Lankan Skin Tone Adaptability
Sri Lankan populations exhibit diverse skin tones that broadly align with the **Fitzpatrick Skin Phototypes III, IV, V, and VI** (ranging from olive/light brown to dark brown).
Our backend handles this adaptively:
1. **HSV Space Calibration**: The color classification averages the Value (V) channel in HSV space, which is highly robust to variations in ambient lighting conditions. The thresholds are mapped to Fitzpatrick scales dynamically rather than running fixed RGB color matches, ensuring that olive and brown skin tones are accurately classified.
2. **Laplacian Variance**: Skin texture/blemish scoring evaluates high-frequency edge gradients (roughness/pores) over grayscale blurred matrices. Because it uses edge frequencies rather than absolute skin coloration, it runs with identical precision across all Fitzpatrick skin tones without bias.

## Dataset References
- Fitzpatrick17k (For skin tone scaling alignment)
- Diverse Dermatology Images (DDI) & ACNE04 (For texture gradient baseline calibrations)

