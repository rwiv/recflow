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
