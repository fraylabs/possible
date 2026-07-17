import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";

export type RetrievalErrorCode =
  | "NODE_NOT_FOUND"
  | "RETRIEVAL_FAILED";

export interface RetrievalError {
  code: RetrievalErrorCode;
  message: string;
  details?: Record<string, unknown>;
}

export interface SuccessEnvelope<T> {
  ok: true;
  data: T;
}

export interface ErrorEnvelope {
  ok: false;
  error: RetrievalError;
}

function asStructuredContent(value: object): Record<string, unknown> {
  return value as Record<string, unknown>;
}

export function successResult<T>(data: T): CallToolResult {
  const envelope: SuccessEnvelope<T> = { ok: true, data };
  return {
    content: [{ type: "text", text: JSON.stringify(envelope, null, 2) }],
    structuredContent: asStructuredContent(envelope),
  };
}

export function errorResult(
  code: RetrievalErrorCode,
  message: string,
  details?: Record<string, unknown>,
): CallToolResult {
  const error: RetrievalError = details === undefined
    ? { code, message }
    : { code, message, details };
  const envelope: ErrorEnvelope = { ok: false, error };
  return {
    content: [{ type: "text", text: JSON.stringify(envelope, null, 2) }],
    structuredContent: asStructuredContent(envelope),
    isError: true,
  };
}

export function retrievalFailure(error: unknown): CallToolResult {
  const message = error instanceof Error ? error.message : "Unknown retrieval failure";
  return errorResult("RETRIEVAL_FAILED", message);
}
