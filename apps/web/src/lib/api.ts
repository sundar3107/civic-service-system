const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000/api";

async function readError(response: Response) {
  try {
    const data = await response.json();
    if (typeof data?.message === "string") {
      return data.message;
    }

    if (Array.isArray(data?.message)) {
      return data.message.join(", ");
    }
  } catch {
    return `Request failed: ${response.status}`;
  }

  return `Request failed: ${response.status}`;
}

export async function apiGet<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    cache: "no-store",
    credentials: "include"
  });

  if (!response.ok) {
    throw new Error(await readError(response));
  }

  return response.json();
}

export async function apiPost<T>(path: string, payload: BodyInit | Record<string, unknown>, isFormData = false): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    credentials: "include",
    headers: isFormData
      ? undefined
      : {
          "Content-Type": "application/json"
        },
    body: isFormData ? (payload as BodyInit) : JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error(await readError(response));
  }

  return response.json();
}

export async function apiPatch<T>(path: string, payload: Record<string, unknown>): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "PATCH",
    credentials: "include",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error(await readError(response));
  }

  return response.json();
}

export async function apiDelete<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "DELETE",
    credentials: "include"
  });

  if (!response.ok) {
    throw new Error(await readError(response));
  }

  return response.json();
}
