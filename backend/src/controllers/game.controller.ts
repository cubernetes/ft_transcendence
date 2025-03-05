import type { FastifyReply, FastifyRequest } from "fastify";
import GameService from "../services/game.service";

export default class GameController {
  constructor(private gameService: GameService) {}

  async getAllGames(_request: FastifyRequest, reply: FastifyReply) {
    try {
      const games = await this.gameService.findAll();
      return reply.send(games);
    } catch (error) {
      return reply.status(500).send({ error: "Failed to fetch games" });
    }
  }

  async getGameById(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    try {
      const { id } = request.params;

      const game = await this.gameService.findById(+id); // TODO: Where to handle wrong format
      return reply.send(game);
    } catch (error) {
      // TODO: Use different types of errors
      //   if (error.message === "User not found") {
      //     return reply.status(404).send({ error: "User not found" });
      //   }
      return reply.status(500).send({ error: "Internal server error" });
    }
  }
}
