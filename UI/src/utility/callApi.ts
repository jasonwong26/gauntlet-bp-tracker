
export type ApiResponse = Record<string, unknown>;

export function callApi(method: string, url: string, path?: string, data?: unknown, token?: string) : Promise<unknown> {
  const headers: HeadersInit = {
    "Accept": "application/json",
    "Content-Type": "application/json"
  };
  if(token) {
    const key = "Authorization";
    headers[key] = `Bearer ${token}`;
  }
  const body: BodyInit | null = data ? JSON.stringify(data) : null;

  const settings: RequestInit = {
    method,
    headers,
    body
  };

  return fetch(url + (path || ""), settings)
    .then(async res => {
      if(!res.ok) {
        const text = await res.text();
        throw new Error(text);
      }

      const respBody = await res.json();
      return respBody;
    });
}
