import { FastifyInstance } from "fastify";
import UserController from "../controllers/user.controller";
import type { ServiceInstance } from "../services";

const userRoutes = async (fastify: FastifyInstance, options: { service: ServiceInstance }) => {
    const controller = new UserController(options.service.auth, options.service.user);

    fastify.get(`/all`, controller.getAllUsers.bind(controller));
    fastify.get(`/:id`, controller.getUserById.bind(controller));
    fastify.post(`/register`, controller.register.bind(controller));
    fastify.post(`/login`, controller.login.bind(controller));
};

export default userRoutes;
