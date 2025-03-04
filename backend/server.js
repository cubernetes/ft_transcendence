// Currently serving as an example for the frontend only and in no way is a great usable version

import Fastify from 'fastify';
import fastifyWebsocket from '@fastify/websocket';
import { open } from 'sqlite';
import sqlite3 from 'sqlite3';
import { promises as fs } from 'fs';
import cors from "@fastify/cors";
import path from 'path';
import { fileURLToPath } from 'url';
import jwt from 'jsonwebtoken';

// Route imports
import userRoutes from './routes/userRoutes.js';
import gameRoutes from './routes/gameRoutes.js';
import tournamentRoutes from './routes/tournamentRoutes.js';
import friendRoutes from './routes/friendRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load SSL certificates (required for WSS)
const sslOptions = {
  key: fs.readFileSync('/path/to/privkey.pem'), // TODO: Replace with your SSL key path
  cert: fs.readFileSync('/path/to/fullchain.pem') // TODO: Replace with your SSL certificate path
};

const fastify = Fastify({ 
    logger: true, 
    https: sslOptions 
});

// Enable CORS
fastify.register(cors, {
    origin: "*", // Allow all origins (use specific origins in production)
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
});

// Enable WebSocket support
fastify.register(fastifyWebsocket);

// Ensure data directory exists
const dataDir = path.join(__dirname, 'data');
fs.mkdir(dataDir, { recursive: true }).catch(console.error);

// Database setup
let db;
async function setupDatabase() {
  const dbPath = path.join(dataDir, 'database.sqlite');
  
  // Check if database file already exists
  const dbExists = await fs.access(dbPath).then(() => true).catch(() => false);
  
  // Open database connection
  db = await open({
    filename: dbPath,
    driver: sqlite3.Database
  });

  // Only initialize if database doesn't exist
  if (!dbExists) {
    // Load and execute schema
    const schema = await fs.readFile(path.join(__dirname, 'database', 'schema.sql'), 'utf8');
    await db.exec(schema);

    // Add seed data in development
    if (process.env.NODE_ENV === 'development') {
      const seed = await fs.readFile(path.join(__dirname, 'database', 'seed.sql'), 'utf8');
      await db.exec(seed);
    }
  }
}

// WebSocket route for real-time Pong game action
const players = new Map(); // Store connected players

fastify.register(async function (fastify) {
    fastify.get('/ws', { websocket: true }, (connection, req) => {
        // Extract and verify JWT token from the query string
        const token = new URL(req.url, 'http://localhost').searchParams.get("token");

        let user;
        try {
            user = jwt.verify(token, process.env.JWT_SECRET); // Validate JWT
            console.log(`User ${user.id} connected via WebSocket`);
        } catch (err) {
            console.error("Invalid WebSocket token");
            connection.socket.close();
            return;
        }

        const playerId = user.id;
        players.set(playerId, connection);

        connection.socket.on('message', (message) => {
            const data = JSON.parse(message);
            console.log(`Player ${playerId} sent:`, data);

            // Broadcast to other players
            for (const [id, playerConn] of players) {
                if (id !== playerId) {
                    playerConn.socket.send(JSON.stringify({ event: 'playerMove', data }));
                }
            }
        });

        connection.socket.on('close', () => {
            players.delete(playerId);
            console.log(`Player ${playerId} disconnected`);
        });
    });
});

// Start the server
const start = async () => {
  try {
    console.log('Connecting to database...');
    await setupDatabase();
    console.log('Database connected');

    // Register routes
    fastify.register(userRoutes, { db });
    fastify.register(gameRoutes, { db });
    fastify.register(tournamentRoutes, { db });
    fastify.register(friendRoutes, { db });
    
    await fastify.listen({ 
      port: process.env.BACKEND_PORT || 3000,
      host: '0.0.0.0'
    });
    console.log(`--> Server is listening on http://localhost:${process.env.BACKEND_PORT || 3000}`);
  } catch (err) {
    console.log(err);
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
