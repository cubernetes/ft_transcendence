import { FastifyInstance } from "fastify";
import type FriendService from "../services/friend.service";
import FriendController from "../controllers/friend.controller";

const friendRoutes = async (
  fastify: FastifyInstance,
  options: { friendService: FriendService }
) => {
  const controller = new FriendController(options.friendService);

  // TODO: Business logic for friends should be reconsidered?
  // Involves auth middleware probably?
  // But will refactor for now
  fastify.get("/:id", controller.getFriendsById.bind(controller));
  fastify.post("/", controller.postFriendRequest.bind(controller));
  fastify.put("/accept", controller.acceptFriendRequest.bind(controller));
};

export default friendRoutes;
