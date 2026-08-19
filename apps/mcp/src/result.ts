import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";

export type RetrievalErrorCode =
  | "OUTCOME_NOT_FOUND"
  | "RETRIEVAL_FAILED";

export interface RetrievalError {
  code: RetrievalErrorCode;
  message: string;
  details?: RetrievalDetails;
}

export type RetrievalDetailValue = string | number | boolean | null | readonly string[];
export type RetrievalDetails = Readonly<Record<string, RetrievalDetailValue>>;

export interface SuccessEnvelope<T> {
  ok: true;
  data: T;
}

export interface ErrorEnvelope {
  ok: false;
  error: RetrievalError;
}

export function successResult<T>(data: T): CallToolResult {
  const envelope: SuccessEnvelope<T> = { ok: true, data };
  return {
    content: [{ type: "text", text: JSON.stringify(envelope, null, 2) }],
    structuredContent: { ok: envelope.ok, data: envelope.data },
  };
}

export function errorResult(
  code: RetrievalErrorCode,
  message: string,
  details?: RetrievalDetails,
): CallToolResult {
  const error: RetrievalError = details === undefined
    ? { code, message }
    : { code, message, details };
  const envelope: ErrorEnvelope = { ok: false, error };
  return {
    content: [{ type: "text", text: JSON.stringify(envelope, null, 2) }],
    structuredContent: { ok: envelope.ok, error: envelope.error },
    isError: true,
  };
}

export function retrievalFailure(cause: unknown): CallToolResult {
  const message = cause instanceof Error ? cause.message : "Unknown retrieval failure";
  return errorResult("RETRIEVAL_FAILED", message);
}
