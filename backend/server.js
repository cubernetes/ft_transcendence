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

// // Load SSL certificates (required for WSS)
// const sslOptions = {
//   key: await fs.readFile('/path/to/privkey.pem'), // TODO: Replace with your SSL key path
//   cert: await fs.readFile('/path/to/fullchain.pem') // TODO: Replace with your SSL certificate path
// };

const fastify = Fastify({ 
    logger: true, 
    // https: sslOptions 
});

// Enable CORS
fastify.register(cors, {
    origin: "*", // Allow all origins (use specific origins in production)
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
});

// Enable WebSocket support
fastify.register(fastifyWebsocket);

// Modify Content-Security-Policy header to allow WebSocket connections
fastify.addHook('onSend', (request, reply, payload) => {
  // Ensure that WebSocket connections to localhost are allowed
  reply.header('Content-Security-Policy', "default-src 'self'; connect-src 'self' ws://localhost:8080;");
  return payload;
});
// TODO: Allow wss later here

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

// const players = new Map(); // Stores player positions { id: { x, y, connection } }

// // fastify.register(async function (fastify) {
// fastify.get('/ws', { websocket: true }, (connection, req) => {
//   if (!connection || !connection.socket) {
//     console.error('WebSocket connection is undefined');
//     return;
//   }
//   console.log('connection:', connection);
//   console.log('New WebSocket connection established');

//   console.log('WebSocket is OPEN');
  
//   const playerId = Math.random().toString(36).substring(2);
//   players.set(playerId, { x: 50, y: 50, connection });

//   // Send initial player position after the WebSocket is open
//   connection.send(JSON.stringify({
//     event: 'init',
//     position: { x: 50, y: 50 },
//     allPlayers: Array.from(players.entries()).map(([id, player]) => ({
//       playerId: id,
//       position: { x: player.x, y: player.y }
//     }))
//   }));
  
//   // Handle incoming messages
//   connection.on('message', (message) => {
//     try {
//         const data = JSON.parse(message);

//         if (data.type === 'move') {
//             let player = players.get(playerId);
//             if (!player) return;

//             // Update player position based on direction
//             if (data.direction === 'up') player.y = Math.max(0, player.y - 10);
//             if (data.direction === 'down') player.y = Math.min(380, player.y + 10);
//             if (data.direction === 'left') player.x = Math.max(0, player.x - 10);
//             if (data.direction === 'right') player.x = Math.min(580, player.x + 10);

//             // Update the player in the map
//             players.set(playerId, player);

//             // Broadcast updated position to all other players
//             for (const [id, playerConn] of players) {
//                 if (id !== playerId && playerConn.connection.readyState === 1) {
//                     playerConn.connection.send(JSON.stringify({
//                         event: 'playerMove',
//                         playerId,
//                         position: { x: player.x, y: player.y }
//                     }));
//                 }
//             }
//         }
//     } catch (error) {
//         console.error("Invalid WebSocket message:", error);
//     }
//   });

//   // Handle player disconnect
//   connection.on('close', () => {
//       players.delete(playerId);
//       console.log(`Player ${playerId} disconnected`);
//   });
// });

// Define the WebSocket route
fastify.get('/ws', { fastifyWebsocket: true }, (connection, req) => {
  // console.log('connection:', connection);
  console.log('New WebSocket connection established');
  connection.socket.on('message', message => {
    console.log('Received message:', message);
    // Send a message back to the client
    connection.socket.send('Hello from Fastify WebSocket server!');
  });

  // Optionally, handle the close event
  connection.socket.on('close', () => {
    console.log('Connection closed');
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
