export function httpError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

// Converte um ZodError no formato { field, message } para devolver no 400
export function zodDetails(zodError) {
  return zodError.issues.map((issue) => ({
    field: issue.path.join("."),
    message: issue.message,
  }));
}