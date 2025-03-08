import { FastifyServerOptions } from "fastify";
import { PinoLoggerOptions } from "fastify/types/logger";

const isDev = process.env.NODE_ENV === "development";

export const devLoggerConfig: PinoLoggerOptions = {
    level: "debug", // More detailed logs in dev
    transport: {
        target: "pino-pretty",
        options: {
            colorize: true, // Enables colors for better readability
            translateTime: "HH:MM:ss Z", // Formats timestamps
            ignore: "pid,hostname", // Hides unnecessary fields
        },
    },
    serializers: {
        err: (error) => ({
            type: error.name,
            message: error.message,
            stack: error.stack || "No stack trace available",
        }),
    },
};

export const prodLoggerConfig: PinoLoggerOptions = {
    level: "info",
};

export const appConfig: FastifyServerOptions = {
    logger: isDev ? devLoggerConfig : prodLoggerConfig,
};
