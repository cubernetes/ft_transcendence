import userRoutes from "./user.route";
import gameRoutes from "./game.route";
import tournamentRoutes from "./tournament.route";
import friendRoutes from "./friend.route";
import websocketRoutes from "./ws.route";

// TODO: Should this be an uniform type?
export type Route =
  | typeof userRoutes
  | typeof gameRoutes
  | typeof tournamentRoutes
  | typeof friendRoutes
  | typeof websocketRoutes;

const routes = {
  user: userRoutes,
  game: gameRoutes,
  tournament: tournamentRoutes,
  friend: friendRoutes,
  websocket: websocketRoutes,
};

export default routes;
