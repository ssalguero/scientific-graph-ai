export type LocalProjectErrorCode =
  | "NOT_FOUND"
  | "QUOTA_EXCEEDED"
  | "CORRUPT"
  | "UNSUPPORTED_STORAGE_VERSION"
  | "STORAGE_UNAVAILABLE"
  | "INVALID_NAME"
  | "DUPLICATE_ID"
  | "HYDRATE_FAILED"
  | "SERIALIZE_FAILED"
  | "TRANSACTION_FAILED";

export type LocalProjectError = {
  code: LocalProjectErrorCode;
  message: string;
  cause?: unknown;
};

export const localProjectError = (
  code: LocalProjectErrorCode,
  message: string,
  cause?: unknown
): LocalProjectError => ({ code, message, cause });

export type LocalProjectResult<T> =
  | { ok: true; value: T }
  | { ok: false; error: LocalProjectError };

export const localProjectOk = <T>(value: T): LocalProjectResult<T> => ({
  ok: true,
  value,
});

export const localProjectFail = <T>(
  error: LocalProjectError
): LocalProjectResult<T> => ({
  ok: false,
  error,
});
