import { FastifyInstance } from "fastify";
import type GameService from "../services/game.service";
import GameController from "../controllers/game.controller";
const gameRoutes = async (
  fastify: FastifyInstance,
  options: { gameService: GameService }
) => {
  const controller = new GameController(options.gameService);

  fastify.get("/all", controller.getAllGames.bind(controller));
  fastify.get("/:id", controller.getGameById.bind(controller));
};

export default gameRoutes;
