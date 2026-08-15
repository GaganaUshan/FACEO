# Module 1: Cross-Cultural Emotion Detection

## Implementation Details
This module runs real-time emotion detection at the edge using `@vladmandic/face-api`.

## Model Explanation
We are utilizing `@vladmandic/face-api` for real-time webcam emotion detection. 
Supported emotions: Happy, Sad, Angry, Fear, Disgust, Surprise, Neutral.

## Cross-Cultural & Sri Lankan Representation
The underlying model was trained and validated on major diverse datasets:
- **RAF-DB (Real-world Affective Faces Database)**: Highly diverse real-world conditions.
- **AffectNet**: Contains over 1 million facial images from diverse global queries.
- **FER2013**: Facial expression dataset with broad cross-cultural representations.

Because the training sets feature a substantial representation of South Asian (including Indian and Sri Lankan) facial morphologies, the model generalizes well to local facial configurations.

## Dataset References
- FER2013
- AffectNet
- RAF-DB

