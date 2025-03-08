import App from "./app";

const main = async () => {
    try {
        const app = new App();
        const port = process.env.BACKEND_PORT ? +process.env.BACKEND_PORT : 3000;
        await app.start(port);
    } catch (error) {
        console.error(`Failed to start server: `, error);
        process.exit(1);
    }
};

main();
