import { FastifyInstance } from "fastify";
import type TournamentService from "../services/tournament.service";

const tournamentRoutes = async (
  fastify: FastifyInstance,
  options: { tournamentService: TournamentService }
) => {
  fastify.get("/all", async (_, reply) => {
    try {
      const allTournaments = await options.tournamentService.findAll();
      return reply.send(allTournaments);
    } catch (error) {
      fastify.log.error("Database query error:", error);
      return reply.status(500).send({ error: "Internal server error" });
    }
  });

  fastify.get("/:id", async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const tournament = await options.tournamentService.findById(+id); // TODO: Where to handle wrong format

      if (!tournament)
        return reply.status(404).send({ error: "Tournament not found" });
      return reply.send(tournament);
    } catch (error) {
      fastify.log.error("Database query error:", error);
      return reply.status(500).send({ error: "Internal server error" });
    }
  });
};

export default tournamentRoutes;
