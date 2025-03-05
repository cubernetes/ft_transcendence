import { FastifyInstance } from "fastify";
import type UserService from "../services/user.service";

const userRoutes = async (
  fastify: FastifyInstance,
  options: { userService: UserService }
) => {
  fastify.get("/all", async (_, reply) => {
    try {
      const allUsers = await options.userService.findAll();
      return reply.send(allUsers);
    } catch (error) {
      fastify.log.error("Database query error:", error);
      return reply.status(500).send({ error: "Internal server error" });
    }
  });

  fastify.get("/:id", async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const user = await options.userService.findById(+id); // TODO: Where to handle wrong format

      if (!user) return reply.status(404).send({ error: "User not found" });
      return reply.send(user);
    } catch (error) {
      fastify.log.error("Database query error:", error);
      return reply.status(500).send({ error: "Internal server error" });
    }
  });
};

export default userRoutes;
