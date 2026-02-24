export class BadRequestError extends Error {
  constructor(message = "The request is malformed or missing required data.", details = null) {
    super(message);
    this.name = "BadRequestError";
    this.statusCode = 400;
    this.details = details;
  }
}

export class UnauthorizedError extends Error {
  constructor(message = "Authentication failed. Please log in.", details = null) {
    super(message);
    this.name = "UnauthorizedError";
    this.statusCode = 401;
    this.details = details;
  }
}

export class ForbiddenError extends Error {
  constructor(message = "You do not have permission to perform this action.", details = null) {
    super(message);
    this.name = "ForbiddenError";
    this.statusCode = 403;
    this.details = details;
  }
}

export class NotFoundError extends Error {
  constructor(message = "The requested resource was not found.", details = null) {
    super(message);
    this.name = "NotFoundError";
    this.statusCode = 404;
    this.details = details;
  }
}

export class ConflictError extends Error {
  constructor(message = "The provided data conflicts with existing data.", details = null) {
    super(message);
    this.name = "ConflictError";
    this.statusCode = 409;
    this.details = details;
  }
}

export class InternalServerError extends Error {
  constructor(message = "Internal Server Error", details = null) {
    super(message);
    this.name = "InternalServerError";
    this.status = 500;
    this.details = details;
  }
}
