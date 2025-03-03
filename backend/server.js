// Currently serving as an example for the frontend only and in no way is a great usable version

import Fastify from 'fastify';
import { open } from 'sqlite';
import sqlite3 from 'sqlite3';
import { promises as fs } from 'fs';
import cors from "@fastify/cors";
import path from 'path';
import { fileURLToPath } from 'url';

// Route imports
import userRoutes from './routes/userRoutes.js';
import gameRoutes from './routes/gameRoutes.js';
import tournamentRoutes from './routes/tournamentRoutes.js';
import friendRoutes from './routes/friendRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const fastify = Fastify({ logger: true });

// Enable CORS
fastify.register(cors, {
    origin: "*", // Allow all origins (use specific origins in production)
    methods: ["GET", "POST", "PUT", "DELETE"],
});

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




// // Example route for frontend
// fastify.get('/users', async () => {
//   try {
//     const users = await db.all('SELECT id, username, wins, losses FROM users');
//     return users;
//   } catch (error) {
//     throw error;
//   }
// });

// Start the server
const start = async () => {
  try {
    console.log('Connecting to database...');
    await setupDatabase();
    console.log('Database connected');

    // Register routes
    // fastify.register(userRoutes, { db, prefix: '/api' });
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
