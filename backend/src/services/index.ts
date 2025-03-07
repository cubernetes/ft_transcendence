import { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import UserService from "./user.service";
import GameService from "./game.service";
import TournamentService from "./tournament.service";
import FriendService from "./friend.service";
import AuthService from "./auth.service";
import type { FastifyInstance } from "fastify";

export interface ServiceInstance {
  user: UserService;
  game: GameService;
  tournament: TournamentService;
  friend: FriendService;
  auth: AuthService;
}

export default class Service implements ServiceInstance {
  public user: UserService;
  public game: GameService;
  public tournament: TournamentService;
  public friend: FriendService;
  public auth: AuthService;

  constructor(
    private db: BetterSQLite3Database,
    private fastify: FastifyInstance
  ) {
    this.user = new UserService(this.db);
    this.game = new GameService(this.db);
    this.tournament = new TournamentService(this.db);
    this.friend = new FriendService(this.db);
    this.auth = new AuthService(this.user, this.fastify);
  }
}
