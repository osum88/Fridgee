export class BadRequestError extends Error {
    constructor(message = "The request is malformed or missing required data.") {
        super(message);
        this.name = "BadRequestError";
        this.statusCode = 400;
    }
}

export class UnauthorizedError extends Error {
    constructor(message = "Authentication failed. Please log in.") {
        super(message);
        this.name = "UnauthorizedError";
        this.statusCode = 401;
    }
}

export class ForbiddenError extends Error {
    constructor(message = "You do not have permission to perform this action.") {
        super(message);
        this.name = "ForbiddenError";
        this.statusCode = 403;
    }
}

export class NotFoundError extends Error {
    constructor(message = "The requested resource was not found.") {
        super(message);
        this.name = "NotFoundError";
        this.statusCode = 404;
    }
}

export class ConflictError extends Error {
    constructor(message = "The provided data conflicts with existing data.") {
        super(message);
        this.name = "ConflictError";
        this.statusCode = 409;
    }
}

export class InternalServerError extends Error {
    constructor(message = "Internal Server Error") {
        super(message);
        this.name = "InternalServerError";
        this.status = 500;
    }
}