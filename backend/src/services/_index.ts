import { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import UserService from "./user.service";
import GameService from "./game.service";
import TournamentService from "./tournament.service";
import FriendService from "./friend.service";

export interface ServiceInstance {
  user: UserService;
  game: GameService;
  tournament: TournamentService;
  friend: FriendService;
}

export default class Service {
  public user: UserService;
  public game: GameService;
  public tournament: TournamentService;
  public friend: FriendService;

  constructor(private db: BetterSQLite3Database) {
    this.user = new UserService(this.db);
    this.game = new GameService(this.db);
    this.tournament = new TournamentService(this.db);
    this.friend = new FriendService(this.db);
  }
}
