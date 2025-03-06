import { FastifyInstance } from "fastify";
import type TournamentService from "../services/tournament.service";
import TournamentController from "../controllers/tournament.controller";

const tournamentRoutes = async (
  fastify: FastifyInstance,
  options: { tournamentService: TournamentService }
) => {
  const controller = new TournamentController(options.tournamentService);

  fastify.get("/all", controller.getAllTournaments.bind(controller));
  fastify.get("/:id", controller.getTournamentById.bind(controller));
};

export default tournamentRoutes;
