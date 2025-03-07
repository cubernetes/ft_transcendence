import userRoutes from "./user.route";
import gameRoutes from "./game.route";
import tournamentRoutes from "./tournament.route";
import friendRoutes from "./friend.route";

const routes = {
  user: userRoutes,
  game: gameRoutes,
  tournament: tournamentRoutes,
  friend: friendRoutes,
};

export default routes;
