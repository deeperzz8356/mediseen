import { API_BASE_URL } from "../config"

const API_URL = API_BASE_URL

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
  symptoms: string,
  token: string,
): Promise<DiagnoseResponse> {

  const formData = new FormData()
  formData.append("image", image)
  formData.append("symptoms", symptoms)

  const res = await fetch(`${API_URL}/diagnose`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData
  })

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || "Diagnosis request failed")
  }

  return await res.json()
}