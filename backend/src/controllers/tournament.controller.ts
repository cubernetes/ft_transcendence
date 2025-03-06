import type { FastifyReply, FastifyRequest } from "fastify";
import TournamentService from "../services/tournament.service";
import { BadRequestError, CustomError } from "../utils/errors";

export default class TournamentController {
  constructor(private tournamentService: TournamentService) {}

  async getAllTournaments(_request: FastifyRequest, reply: FastifyReply) {
    try {
      const tournaments = await this.tournamentService.findAll();
      return reply.send(tournaments);
    } catch (error) {
      return error instanceof CustomError
        ? error.send(reply)
        : new CustomError(`Failed to fetch all tournaments`).send(reply);
    }
  }

  async getTournamentById(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    try {
      const id = Number(request.params.id);

      if (isNaN(id) || !Number.isInteger(id) || id < 1)
        throw new BadRequestError("Invalid tournament ID");

      const tournament = await this.tournamentService.findById(id);
      return reply.send(tournament);
    } catch (error) {
      return error instanceof CustomError
        ? error.send(reply)
        : new CustomError(`Failed to fetch tournament by ID`).send(reply);
    }
  }
}
