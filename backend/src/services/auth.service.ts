import bcrypt from "bcrypt";
import { BadRequestError, UnauthorizedError } from "../utils/errors";
import UserService from "./user.service";
import type { FastifyInstance } from "fastify";

export interface JwtPayload {
  id: number;
  username: string;
  iat?: number; // Issued at (automatically added by jwt.sign)
  exp?: number; // Expiration time (automatically added by jwt.sign)
}

export default class AuthService {
  private readonly SALT_ROUNDS = 12;

  constructor(
    private readonly userService: UserService,
    private readonly fastify: FastifyInstance
  ) {}

  /**
   * Hash the password using bcrypt, there is no need to save the salt because it is included in the hash
   * by bcrypt.hash().
   */
  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.SALT_ROUNDS);
  }

  /**
   * Validate the credentials of a user.
   * Return a JWT token? Meh, depends on the login scheme.
   */
  async validateCredentials(username: string, password: string) {
    if (!username || !password)
      throw new BadRequestError("Missing credentials");

    const user = await this.userService.findByUsername(username);
    if (!user || !(await bcrypt.compare(password, user.passwordHash)))
      throw new UnauthorizedError("Invalid credentials");

    return user;
  }

  /**
   * Generate a JWT token for the user.
   */
  generateToken(id: number, username: string): string {
    return this.fastify.jwt.sign({ id, username });
  }

  /**
   * Verify a JWT token.
   */
  verifyToken(token: string): JwtPayload {
    return this.fastify.jwt.verify(token);
    // try {
    //   return this.fastify.jwt.verify(
    //     token,
    //     this.jwtConfig.secret
    //   ) as JwtPayload;
    // } catch (error) {
    //   if (error instanceof this.fastify.jwt.TokenExpiredError)
    //     throw new UnauthorizedError("Token expired");
    //   if (error instanceof this.fastify.jwt.JsonWebTokenError)
    //     throw new UnauthorizedError("Invalid token");
    //   throw error;
    // }
  }

  async register(username: string, password: string, displayName: string) {
    if (!username || !password || !displayName)
      throw new BadRequestError("Missing fields");

    const existingUser = await this.userService.findByUsername(username);
    if (existingUser) throw new BadRequestError("Username already taken");

    const passwordHash = await this.hashPassword(password);
    return await this.userService.create({
      username,
      displayName,
      passwordHash,
    });
  }

  async login(username: string, password: string) {
    const user = await this.validateCredentials(username, password);
    return this.generateToken(user.id, user.username);
  }
}
