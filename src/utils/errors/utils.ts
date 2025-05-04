export function stacktrace(err: unknown) {
  if (!(err instanceof Error)) {
    throw new TypeError(`Unknown error: ${err}`);
  }

  let stackTrace = err.stack || err.toString();
  let currentError = err.cause;

  while (currentError instanceof Error) {
    stackTrace += '\nCaused by: ' + (currentError.stack || currentError.toString());
    currentError = currentError.cause;
  }

  return stackTrace;
}
