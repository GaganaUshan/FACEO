// Faceo Analytics — Centralized API Client
// Each backend service runs on its own port

const SERVICE_URLS: Record<string, string> = {
  "age-gender": "http://localhost:8001",
  "emotion": "http://localhost:8002",
  "bruise-detection": "http://localhost:8003",
  "deepfake": "http://localhost:8004",
};

export type ServiceName = keyof typeof SERVICE_URLS;

interface ApiResponse<T = any> {
  status: string;
  data?: T;
  error?: string;
}

async function apiRequest<T>(
  service: string,
  endpoint: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  const baseUrl = SERVICE_URLS[service];
  if (!baseUrl) throw new Error(`Unknown service: ${service}`);

  try {
    const res = await fetch(`${baseUrl}${endpoint}`, {
      ...options,
      signal: AbortSignal.timeout(30000),
    });
    const json = await res.json();
    return json;
  } catch (error) {
    console.error(`[ApiClient] ${service}${endpoint} failed:`, error);
    return { status: "error", error: "Service unavailable. Please ensure the backend is running." };
  }
}

export async function analyzeImage(service: string, imageFile: File | Blob): Promise<ApiResponse> {
  const formData = new FormData();
  formData.append("file", imageFile, "image.jpg");

  return apiRequest(service, "/analyze-image", {
    method: "POST",
    body: formData,
  });
}

export async function analyzeLiveSession(
  service: string,
  frames: Blob[]
): Promise<ApiResponse> {
  const formData = new FormData();
  frames.forEach((frame, i) => {
    formData.append("frames", frame, `frame_${i}.jpg`);
  });

  return apiRequest(service, "/analyze-live-session", {
    method: "POST",
    body: formData,
  });
}

export async function getSession(service: string, sessionId: string): Promise<ApiResponse> {
  return apiRequest(service, `/session/${sessionId}`);
}

export default { analyzeImage, analyzeLiveSession, getSession };
