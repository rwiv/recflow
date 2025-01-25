export async function checkResponse(res: Response) {
  if (res.status >= 400) {
    const content = await res.text();
    throw new Error(`Http failure: status=${res.status}, message=${content}`);
  }
}
