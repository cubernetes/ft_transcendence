import type { FastifyReply } from "fastify";

export class CustomError extends Error {
  statusCode: number;
  payload: Record<string, any>;

  constructor(
    message: string,
    statusCode: number = 500,
    payload: Record<string, any> = {}
  ) {
    super(message);
    this.statusCode = statusCode;

    // To be sent to the client via fastify type
    this.payload = { error: message, ...payload };
  }

  send(reply: FastifyReply) {
    reply.status(this.statusCode).send(this.payload);
  }
}

export class BadRequestError extends CustomError {
  constructor(message = "Bad request") {
    super(message, 400);
  }
}

export class UnauthorizedError extends CustomError {
  constructor(message = "Unauthorized") {
    super(message, 401);
  }
}

export class ForbiddenError extends CustomError {
  constructor(message = "Forbidden") {
    super(message, 403);
  }
}

export class NotFoundError extends CustomError {
  constructor(message = "Resource not found") {
    super(message, 404);
  }
}

export class MethodNotAllowedError extends CustomError {
  constructor(message = "Method not allowed") {
    super(message, 405);
  }
}

// There are much more, can be added as we need them
