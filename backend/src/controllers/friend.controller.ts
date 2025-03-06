import type { FastifyReply, FastifyRequest } from "fastify";
import FriendService from "../services/friend.service";
import { BadRequestError, CustomError } from "../utils/errors";

export default class FriendController {
  constructor(private friendService: FriendService) {}

  async getFriendsById(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    try {
      const id = Number(request.params.id);

      if (isNaN(id) || !Number.isInteger(id) || id < 1)
        throw new BadRequestError("Invalid user ID");

      const friends = await this.friendService.findAllFriendshipsById(id);
      return reply.send(friends);
    } catch (error) {
      return error instanceof CustomError
        ? error.send(reply)
        : new CustomError(`Failed to fetch game by ID`).send(reply);
    }
  }
  async postFriendRequest() {}
  async acceptFriendRequest() {}
}
