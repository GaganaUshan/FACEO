# Module 2: Age & Gender Detection

## Implementation Details
This module estimates age and gender probabilities on the client side using the `ageGenderNet` weights from `@vladmandic/face-api`.

## Model Explanation
We are utilizing `@vladmandic/face-api` (ageGenderNet) for real-time prediction.
Provides age estimation and gender prediction probability.

## Sri Lankan & South Asian Face Optimization
1. **Diverse Training Sets**: The model relies on **UTKFace**, **IMDB-WIKI**, and **Adience**. UTKFace is specifically annotated with detailed ethnic classifications (including White, Black, Asian, Indian, and Others). The "Indian/South Asian" subset covers the morphological features typical of Sri Lankan faces, ensuring low demographic estimation bias.
2. **Robust Face Detection**: By utilizing **SSD Mobilenet V1** instead of the lightweight Tiny Face Detector, the pipeline obtains a wider, more balanced crop of the face. This makes the demographic estimation highly robust to variations in skin tone, lighting conditions, and facial shadows common in Sri Lankan indoor environments.

## Dataset References
- IMDB-WIKI
- UTKFace (Diverse dataset including Indian/South Asian cohorts)
- Adience

