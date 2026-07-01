export class NotFoundError extends Error {
  readonly code = "NOT_FOUND";
}

export function notFound(message: string): never {
  throw new NotFoundError(message);
}
