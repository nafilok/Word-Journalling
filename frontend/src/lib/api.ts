const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  // 1. Ambil JWT Token dari localStorage (jika ada)
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  // 2. Siapkan Header Request
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // 3. Eksekusi Request ke FastAPI
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // 4. Penanganan Error HTTP Global
  if (!response.ok) {
  const errorData = await response.json().catch(() => ({}));
  
  // Ekstraksi teks error agar tidak menjadi Objek
  let errorMessage = "Terjadi kesalahan pada server.";
  
  if (typeof errorData.detail === "string") {
    errorMessage = errorData.detail;
  } else if (Array.isArray(errorData.detail)) {
    // Jika Pydantic validation error (Array of objects)
    errorMessage = errorData.detail.map((err: any) => err.msg).join(", ");
  } else if (typeof errorData.detail === "object" && errorData.detail !== null) {
    errorMessage = JSON.stringify(errorData.detail);
  }

  throw new Error(errorMessage);
}

  return response.json() as Promise<T>;
}