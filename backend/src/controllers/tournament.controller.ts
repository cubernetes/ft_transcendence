import type { FastifyReply, FastifyRequest } from "fastify";
import TournamentService from "../services/tournament.service";

export default class TournamentController {
  constructor(private tournamentService: TournamentService) {}

  async getAllTournaments(_request: FastifyRequest, reply: FastifyReply) {
    try {
      const tournaments = await this.tournamentService.findAll();
      return reply.send(tournaments);
    } catch (error) {
      return reply.status(500).send({ error: "Failed to fetch users" });
    }
  }

  async getTournamentById(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    try {
      const { id } = request.params;

      const tournament = await this.tournamentService.findById(+id); // TODO: Where to handle wrong format
      return reply.send(tournament);
    } catch (error) {
      // TODO: Use different types of errors
      //   if (error.message === "User not found") {
      //     return reply.status(404).send({ error: "User not found" });
      //   }
      return reply.status(500).send({ error: "Internal server error" });
    }
  }
}
