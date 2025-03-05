import { FastifyInstance } from "fastify";
import type UserService from "../services/user.service";
import UserController from "../controllers/user.controller";

const userRoutes = async (
  fastify: FastifyInstance,
  options: { userService: UserService }
) => {
  const controller = new UserController(options.userService);

  fastify.get("/all", controller.getAllUsers.bind(controller));
  fastify.get("/:id", controller.getUserById.bind(controller));
};

export default userRoutes;
