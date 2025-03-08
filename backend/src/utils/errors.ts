import type { FastifyReply } from "fastify";

export class CustomError extends Error {
    statusCode: number;
    payload: Record<string, any>;

    constructor(
        message: string,
        statusCode: number = 500,
        name: string = "Error",
        payload: Record<string, any> = {}
    ) {
        super(message);
        this.name = name;
        this.statusCode = statusCode;

        // To be sent to the client via fastify reply
        this.payload = { error: message, ...payload };
    }

    send(reply: FastifyReply) {
        reply.status(this.statusCode).send(this.payload);
    }
}

export class BadRequestError extends CustomError {
    constructor(message = "Bad request") {
        super(message, 400, "Bad request");
    }
}

export class UnauthorizedError extends CustomError {
    constructor(message = "Unauthorized") {
        super(message, 401, "Unauthorized");
    }
}

export class ForbiddenError extends CustomError {
    constructor(message = "Forbidden") {
        super(message, 403, "Forbidden");
    }
}

export class NotFoundError extends CustomError {
    constructor(message = "Resource not found") {
        super(message, 404, "Resource not found");
    }
}

export class MethodNotAllowedError extends CustomError {
    constructor(message = "Method not allowed") {
        super(message, 405, "Method not allowed");
    }
}

export class InternalServerError extends CustomError {
    constructor(message = "Internal server error") {
        super(message, 500, "Internal server error");
    }
}

// There are much more, can be added as we need them
