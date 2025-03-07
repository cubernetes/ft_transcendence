import type { FastifyReply, FastifyRequest } from "fastify";
import UserService from "../services/user.service";
import AuthService from "../services/auth.service";
import { BadRequestError, CustomError } from "../utils/errors";
import { UserLoginBody, UserInsertBody } from "../models/types";

export default class UserController {
  constructor(
    private authService: AuthService,
    private userService: UserService
  ) {}

  async register(
    request: FastifyRequest<{ Body: UserInsertBody }>,
    reply: FastifyReply
  ) {
    try {
      const { username, password, displayName } = request.body;

      const user = await this.authService.register(
        username,
        password,
        displayName
      );
      return reply
        .code(201)
        .send({ user, message: `User registered successfully` });
    } catch (error) {
      return error instanceof CustomError
        ? error.send(reply)
        : new CustomError(`Failed to register user`).send(reply);
    }
  }

  async login(
    request: FastifyRequest<{ Body: UserLoginBody }>,
    reply: FastifyReply
  ) {
    try {
      const { username, password } = request.body;
      const user = await this.authService.validateCredentials(
        username,
        password
      );

      const token = this.authService.generateToken(user.id, user.username);
      return reply.send({ token, message: `Login successful` });
    } catch (error) {
      return error instanceof CustomError
        ? error.send(reply)
        : new CustomError(`Login failed`).send(reply);
    }
  }

  async getAllUsers(_: FastifyRequest, reply: FastifyReply) {
    try {
      const users = await this.userService.findAll();
      return reply.send(users);
    } catch (error) {
      return error instanceof CustomError
        ? error.send(reply)
        : new CustomError(`Failed to fetch all users`).send(reply);
    }
  }

  async getUserById(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    try {
      const id = Number(request.params.id);

      if (isNaN(id) || !Number.isInteger(id) || id < 1)
        throw new BadRequestError("Invalid user ID");

      const user = await this.userService.findById(id);
      return reply.send(user);
    } catch (error) {
      return error instanceof CustomError
        ? error.send(reply)
        : new CustomError(`Failed to fetch user by ID`).send(reply);
    }
  }
}
