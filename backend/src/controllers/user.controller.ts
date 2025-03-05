import type { FastifyReply, FastifyRequest } from "fastify";
import UserService from "../services/user.service";

export default class UserController {
  constructor(private userService: UserService) {}

  async getAllUsers(_request: FastifyRequest, reply: FastifyReply) {
    try {
      const users = await this.userService.findAll();
      return reply.send(users);
    } catch (error) {
      return reply.status(500).send({ error: "Failed to fetch users" });
    }
  }

  async getUserById(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    try {
      const { id } = request.params;
      const user = await this.userService.findById(+id); // TODO: Where to handle wrong format
      return reply.send(user);
    } catch (error) {
      // TODO: Use different types of errors
      //   if (error.message === "User not found") {
      //     return reply.status(404).send({ error: "User not found" });
      //   }
      return reply.status(500).send({ error: "Internal server error" });
    }
  }
}
