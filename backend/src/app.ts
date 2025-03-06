import Fastify, { FastifyInstance } from "fastify";
import cors from "@fastify/cors";
import initDatabase from "./database/index";
import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import userRoutes from "./routes/user.route";
import gameRoutes from "./routes/game.route";
import UserService from "./services/user.service";
import GameService from "./services/game.service";
import TournamentService from "./services/tournament.service";
import tournamentRoutes from "./routes/tournament.route";
import FriendService from "./services/friend.service";
import friendRoutes from "./routes/friend.route";

export default class App {
  private server: FastifyInstance;
  private db: BetterSQLite3Database | null = null;
  private initialized = false;

  constructor() {
    this.server = Fastify({ logger: true });
  }

  private async init() {
    if (this.initialized) return;

    try {
      // Initialize database
      this.db = await initDatabase();

      // Register CORS
      this.server.register(cors, { origin: "*" }); // TODO: Use env variable to switch between production & development?

      // Create services
      const userService = new UserService(this.db);
      const gameService = new GameService(this.db);
      const tournamentService = new TournamentService(this.db);
      const friendService = new FriendService(this.db);

      // Register routes to fastify
      this.server.register(userRoutes, { prefix: "/users", userService });
      this.server.register(gameRoutes, { prefix: "/games", gameService });
      this.server.register(tournamentRoutes, {
        prefix: "/tournaments",
        tournamentService,
      });
      this.server.register(friendRoutes, { prefix: "/friends", friendService });
    } catch (error) {
      this.server.log.error("Error initializing server:", error);
      process.exit(1);
    }
    this.initialized = true;
  }

  public async start(port: number) {
    await this.init();

    try {
      await this.server.listen({ port, host: "0.0.0.0" });
      this.server.log.info(`Server running at port ${port}!`);
    } catch (error) {
      this.server.log.error("Error starting server:", error);
      process.exit(1);
    }
  }
}
