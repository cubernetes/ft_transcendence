import type { FastifyReply, FastifyRequest } from "fastify";
import UserService from "../services/user.service";
import {
  BadRequestError,
  CustomError,
  UnauthorizedError,
} from "../utils/errors";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export default class UserController {
  constructor(private userService: UserService) {}

  async getAllUsers(_request: FastifyRequest, reply: FastifyReply) {
    try {
      const users = await this.userService.findAll();
      return reply.send(users);
    } catch (error) {
      return error instanceof CustomError
        ? error.send(reply)
        : new CustomError("Failed to fetch all users").send(reply);
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

  async register(
    request: FastifyRequest<{
      Body: { username: string; password: string; displayName: string };
    }>,
    reply: FastifyReply
  ) {
    const { username, password, displayName } = request.body;

    if (!username || !password || !displayName)
      return new BadRequestError("Missing fields").send(reply);

    // Check if user already exists
    const existingUser = await this.userService.findByUsername(username);
    if (existingUser)
      return new BadRequestError("Username already taken").send(reply);

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user into the database
    try {
      await db.run(
        "INSERT INTO users (username, password_hash, salt) VALUES (?, ?, ?, ?)",
        [username, hashedPassword, "salt", displayName]
      );
      return reply.code(201).send({ message: "User registered successfully" });
    } catch (error) {
      return reply.code(500).send({ error: "Database error" });
    }
  }

  // TODO: Need to look into this more, only copied from js version so far
  async login(
    request: FastifyRequest<{
      Body: { username: string | null; password: string | null };
    }>,
    reply: FastifyReply
  ) {
    const { username, password } = request.body;

    // Validate credentials
    if (!username || !password)
      return new BadRequestError("Missing fields").send(reply);

    // Fetch user from the database
    const user = await this.userService.findByUsername(username);
    if (!user || !(await bcrypt.compare(password, user.passwordHash)))
      return new UnauthorizedError("Invalid credentials").send(reply);

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Return the token
    return reply.send({ token, message: "Login successful" });
  }
}
