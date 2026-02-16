const BASE_URL = '/api';

export class NexusApiError extends Error {
  readonly status: number;
  readonly detail?: string;

  constructor(err: { status: number; message: string; detail?: string }) {
    super(err.message);
    this.status = err.status;
    this.detail = err.detail;
  }
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new NexusApiError({
      status: res.status,
      message: body.message ?? `HTTP ${res.status}`,
      detail: body.detail,
    });
  }
  return res.json() as Promise<T>;
}

export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
  });
  return handleResponse<T>(res);
}

export async function apiPost<TBody, TResponse>(path: string, body: TBody): Promise<TResponse> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return handleResponse<TResponse>(res);
}
