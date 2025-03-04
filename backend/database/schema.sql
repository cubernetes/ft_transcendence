-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    totp_secret TEXT,
    avatar_url TEXT DEFAULT '/assets/default-avatar.png',
    wins INTEGER DEFAULT 0,
    losses INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Games table
CREATE TABLE IF NOT EXISTS games (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tournament_id INTEGER,  -- can be NULL if not part of a tournament
    player1_id INTEGER NOT NULL,
    player2_id INTEGER NOT NULL,
    winner_id INTEGER,  -- can be NULL if the game didnt end yet
    player1_score INTEGER NOT NULL,
    player2_score INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    finished_at TIMESTAMP,
    FOREIGN KEY (tournament_id) REFERENCES tournaments(id),
    FOREIGN KEY (player1_id) REFERENCES users(id),
    FOREIGN KEY (player2_id) REFERENCES users(id),
    FOREIGN KEY (winner_id) REFERENCES users(id),
    CHECK (winner_id IS NULL OR winner_id = player1_id OR winner_id = player2_id),
    CHECK (player1_id != player2_id),
    CHECK (player1_score >= 0 AND player2_score >= 0)
);

-- Tournaments table
CREATE TABLE IF NOT EXISTS tournaments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    creator_id INTEGER NOT NULL,
    winner_id INTEGER,                          -- can be NULL, if not finished
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    finished_at TIMESTAMP DEFAULT NULL,         -- NULL meaning not finished
    FOREIGN KEY (winner_id) REFERENCES users(id),
    FOREIGN KEY (creator_id) REFERENCES users(id),
    CHECK (winner_id IS NULL AND finished_at IS NULL OR winner_id IS NOT NULL AND finished_at IS NOT NULL)
);

-- Friends table
CREATE TABLE IF NOT EXISTS friends (
    user1_id INTEGER NOT NULL,
    user2_id INTEGER NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user1_id, user2_id),
    FOREIGN KEY (user1_id) REFERENCES users(id),
    FOREIGN KEY (user2_id) REFERENCES users(id),
    CHECK (user1_id != user2_id AND user1_id < user2_id),   -- user1_id < user2_id ensures searching
    CHECK (status in ('pending', 'accepted'))
);