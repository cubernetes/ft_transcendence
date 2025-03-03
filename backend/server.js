import Fastify from 'fastify';
import { open } from 'sqlite';
import sqlite3 from 'sqlite3';
import { promises as fs } from 'fs';
import cors from "@fastify/cors";
import path from 'path';
import { fileURLToPath } from 'url';

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
    fastify.log.info('Initializing new database...');
    
    // Load and execute schema
    const schema = await fs.readFile(path.join(__dirname, 'database', 'schema.sql'), 'utf8');
    await db.exec(schema);

    // Add seed data in development
    if (process.env.NODE_ENV === 'development') {
      const seed = await fs.readFile(path.join(__dirname, 'database', 'seed.sql'), 'utf8');
      await db.exec(seed);
      fastify.log.info('Development seed data loaded');
    }
  } else {
    fastify.log.info('Using existing database');
  }
}

// Example route for frontend
fastify.get('/users', async () => {
  try {
    const users = await db.all('SELECT id, username, wins, losses FROM users');
    fastify.log.info('Users fetched:', users);
    return users;
  } catch (error) {
    fastify.log.error('Error fetching users:', error);
    throw error;
  }
});

// Start the server
const start = async () => {
  try {
    await setupDatabase();
    await fastify.listen({ 
      port: process.env.BACKEND_PORT || 3000,
      host: '0.0.0.0'
    });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
