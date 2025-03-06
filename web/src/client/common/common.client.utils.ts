interface RequestIngredients {
  method: string;
  headers: { [key: string]: string };
  body?: string;
}

export function getIngredients(method: string, bodyObj: object | undefined = undefined) {
  const result: RequestIngredients = { method, headers: { 'Content-Type': 'application/json' } };
  if (bodyObj) {
    result.body = JSON.stringify(bodyObj);
  }
  return result;
}

export interface HttpError {
  statusCode: number;
  message: string;
  timestamp: string;
}

export async function request(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const res = await fetch(input, init);
  if (res.status >= 400) {
    const errInfo = (await res.json()) as HttpError;
    throw new Error(errInfo.message);
  }
  return res;
}
