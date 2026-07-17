export class EvaluationError extends Error {
  constructor(code, message, details = undefined) {
    super(message);
    this.name = "EvaluationError";
    this.code = code;
    if (details !== undefined) {
      this.details = details;
    }
  }
}

export function fail(code, message, details = undefined) {
  throw new EvaluationError(code, message, details);
}
