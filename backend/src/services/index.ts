import UserService from "./user.service";
import GameService from "./game.service";
import TournamentService from "./tournament.service";
import FriendService from "./friend.service";
import AuthService from "./auth.service";
import WebsocketService from "./websocket.service";
import { AppInstance } from "../app";
import { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";

export interface ServiceInstance {
    user: UserService;
    game: GameService;
    tournament: TournamentService;
    friend: FriendService;
    auth: AuthService;
    websocket: WebsocketService;
}

export default class Service implements ServiceInstance {
    public user: UserService;
    public game: GameService;
    public tournament: TournamentService;
    public friend: FriendService;
    public auth: AuthService;
    public websocket: WebsocketService;

    constructor(
        private app: AppInstance,
        db: BetterSQLite3Database
    ) {
        this.user = new UserService(db);
        this.game = new GameService(db);
        this.tournament = new TournamentService(db);
        this.friend = new FriendService(db);
        this.auth = new AuthService(this.user, this.app.server);
        this.websocket = new WebsocketService(this.app.log);
    }
}
