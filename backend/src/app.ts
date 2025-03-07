import Fastify, { FastifyInstance } from "fastify";
import cors from "@fastify/cors";
import websocket from "@fastify/websocket";
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
import websocketRoutes from "./websocket/ws.route";


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
      
      // Register WebSocket plugin FIRST
      this.server.register(websocket, {
        options: {
          maxPayload: 1048576, // 1 MiB
        },
      });

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
      this.server.register(tournamentRoutes, { prefix: "/tournaments", tournamentService, });
      this.server.register(friendRoutes, { prefix: "/friends", friendService });

      // Register the WebSocket game route
      this.server.register(websocketRoutes, { prefix: "/ws" });

      // // WebSocket route
      // this.server.register(async function (fastify) {
      //   fastify.get('/ws', { websocket: true },
      //     (socket /* WebSocket */, _req /* FastifyRequest */) => {
      //       fastify.log.info("New WebSocket connection");

      //       socket.on('message', message => {
      //         // const text = message.toString("utf-8");  // Convert Buffer to string safely
      //         fastify.log.info(`Received: ${message.toString()}`);
      //         message.toString() === 'hi from client'
      //         socket.send(`hi from server`);
      //       });
            
      //       socket.on('ping', () => {
      //         fastify.log.info("Ping received!");
      //         socket.pong();
      //       });

      //       socket.on("close", () => {
      //         fastify.log.info("WebSocket socket closed");
      //       });
            
      //       // Send initial message to verify the socket
      //       socket.send("Welcome to the WebSocket server!");
      //   });
      // });
    } catch (error) {
      this.server.log.error("Error initializing server:", error);
      process.exit(1);
    }
    this.initialized = true;
  }

  public async start(port: number) {
    await this.init();

    try {
      await this.server.listen({ port: 3000, host: "0.0.0.0" });
      this.server.log.info(`Server running at port ${port}!`);
    } catch (error) {
      this.server.log.error("Error starting server:", error);
      process.exit(1);
    }
  }
}
