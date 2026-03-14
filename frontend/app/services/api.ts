const API_URL = "http://127.0.0.1:8000"

export interface DiagnoseResponse {
  session_id: string
  diagnosis: string
  confidence: number
  explanation: string
  heatmap_url: string
  report_url: string
}

export async function diagnoseImage(
  image: File,
  symptoms: string
): Promise<DiagnoseResponse> {

  const formData = new FormData()
  formData.append("image", image)
  formData.append("symptoms", symptoms)

  // FIX: Use backticks (`) and the correct variable name (API_URL)
  const res = await fetch(`${API_URL}/diagonse`, {
    method: "POST",
    body: formData
  })

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || "Diagnosis request failed")
  }

  return await res.json()
}