// Creates an error object with a custom HTTP status code.
// Throw this inside any asyncHandler-wrapped controller.
export default function httpError(statusCode, message) {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
}
