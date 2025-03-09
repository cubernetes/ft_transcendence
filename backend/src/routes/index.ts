import userRoutes from "./user.route";
import gameRoutes from "./game.route";
import tournamentRoutes from "./tournament.route";
import friendRoutes from "./friend.route";

// TODO: Should this be an uniform type?
export type Route =
    | typeof userRoutes
    | typeof gameRoutes
    | typeof tournamentRoutes
    | typeof friendRoutes;

const routes = {
    user: userRoutes,
    game: gameRoutes,
    tournament: tournamentRoutes,
    friend: friendRoutes,
};

export default routes;
