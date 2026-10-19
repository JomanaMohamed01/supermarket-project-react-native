export function getErrorMessage(err: unknown, fallback = "Something went wrong") {
  if (err instanceof Error && err.message.trim()) return err.message;
  if (err && typeof err === "object" && "message" in err) {
    const message = (err as { message: unknown }).message;
    if (typeof message === "string" && message.trim()) return message;
  }
  if (typeof err === "string" && err.trim()) return err;
  return fallback;
}
