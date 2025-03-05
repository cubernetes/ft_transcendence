import App from "./src/app";

const app = new App();
app.start(process.env.BACKEND_PORT ? +process.env.BACKEND_PORT : 3000);
