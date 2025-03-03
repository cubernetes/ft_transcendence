import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export default async function userRoutes(fastify, options) {
    const { db } = options;
    console.log('Database object in routes:', db); // This should log the DB object

    // Fetch all users' info
    fastify.get('/users', async (_, reply) => {
        try {
            const users = await db.all("SELECT id, username, wins, losses FROM users");
            return reply.send(users);
        } catch (error) {
            return reply.code(500).send({ error: "Database error" });
        }
    });

    // Fetch a specific user's info by ID
    fastify.get('/users/:id', async (request, reply) => {
        const { id } = request.params;

        // Fetch the user data
        const user = await db.get("SELECT id, username, wins, losses, avatar_url FROM users WHERE id = ?", [id]);
        
        if (!user) {
            return reply.code(404).send({ error: "User not found" });
        }

        // Return the user profile
        return reply.send(user);
    });

    // User registration route
    fastify.post('/register', async (request, reply) => {
        const { username, password, displayName } = request.body;
        if (!username || !password || !displayName) {
            return reply.code(400).send({ error: "Missing fields" });
        }

        // Check if user already exists
        const existingUser = await db.get("SELECT * FROM users WHERE username = ?", [username]);
        if (existingUser) {
            return reply.code(400).send({ error: "Username already taken" });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Insert new user into the database
        try {
            await db.run("INSERT INTO users (username, password_hash, salt) VALUES (?, ?, ?, ?)", 
                [username, hashedPassword, 'salt', displayName]);
            return reply.code(201).send({ message: "User registered successfully" });
        } catch (error) {
            return reply.code(500).send({ error: "Database error" });
        }
    });

    // User login route
    fastify.post('/login', async (request, reply) => {
        const { username, password } = request.body;
        
        // Validate credentials
        if (!username || !password) {
            return reply.code(400).send({ error: "Missing credentials" });
        }

        // Fetch user from the database
        const user = await db.get("SELECT * FROM users WHERE username = ?", [username]);
        if (!user || !(await bcrypt.compare(password, user.password_hash))) {
            return reply.code(401).send({ error: "Invalid credentials" });
        }

        // Generate JWT token
        const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '1h' });
        
        // Return the token
        return reply.send({ token, message: "Login successful" });
    });
}
