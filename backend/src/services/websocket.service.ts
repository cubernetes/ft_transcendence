import { WebSocket } from "ws";
import type { GameState } from "../controllers/websocket.controller";
import { FastifyBaseLogger } from "fastify";

export default class WebsocketService {
  private activeConnections: Map<number, WebSocket>;

  constructor(private readonly log: FastifyBaseLogger) {
    this.activeConnections = new Map();
  }

  registerConnection(conn: WebSocket, id: number) {
    this.log.info(`Registering connection for user ${id}`);
    this.activeConnections.set(id, conn);
  }

  dropConnection(id: number) {
    this.log.info(`Dropping connection for user ${id}`);
    this.activeConnections.delete(id);
  }

  /**
   * "Routes" the message based on the type of some sort?
   * @param socket
   * @param msg
   */
  handleMessage(conn: WebSocket, msg: string, gameState: GameState) {
    const textMessage = msg.toString();
    this.log.info(`Message from client: ${textMessage}`);

    // Later this would be moved to a PongService Class probably
    if (msg === "move up") {
      // Move player 1's paddle up
      this.log.info("Player 1 wants to move paddle up");
      if (gameState.paddlePosition["player-1"].y > 0) {
        gameState.paddlePosition["player-1"].y -= 10; // Move paddle up
      }
    } else if (msg === "move down") {
      // Move player 1's paddle down
      this.log.info("Player 1 wants to move paddle down");
      if (gameState.paddlePosition["player-1"].y < 100) {
        gameState.paddlePosition["player-1"].y += 10; // Move paddle down
      }
    }
    conn.send(JSON.stringify(gameState));
  }
}
