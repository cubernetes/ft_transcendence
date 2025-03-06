-- Seed data for development environment

-- Example data for users table
INSERT INTO users (username, display_name, password_hash, salt, wins, losses) VALUES 
    ('darren', 'Darren', 'dummy_hash', 'dummy_salt', 5, 2),
    ('luca', 'Luca', 'dummy_hash', 'dummy_salt', 3, 4),
    ('timo', 'Timo', 'dummy_hash', 'dummy_salt', 7, 2),
    ('sonia', 'Sonia', 'dummy_hash', 'dummy_salt', 10, 3),
    ('john', 'John', 'dummy_hash', 'dummy_salt', 8, 4),
    ('ben', 'Ben', 'dummy_hash', 'dummy_salt', 6, 5),
    ('kars', 'Kars', 'dummy_hash', 'dummy_salt', 4, 6),
    ('dan', 'Dan', 'dummy_hash', 'dummy_salt', 2, 7),
    ('lola', 'Lola', 'dummy_hash', 'dummy_salt', 9, 2),
    ('max', 'Max', 'dummy_hash', 'dummy_salt', 1, 9);

-- Example data for tournaments table
INSERT INTO tournaments (name, creator_id, winner_id, finished_at) VALUES
    ('Spring Tournament 2024', 1, 4, '2024-03-01 18:00:00'),
    ('Summer Tournament 2024', 2, 6, '2024-07-15 15:30:00'),
    ('Fall Tournament 2024', 3, 7, '2024-09-22 20:00:00'),
    ('Winter Tournament 2024', 5, 9, '2024-12-10 17:45:00'),
    ('42 Championship', 8, 3, '2025-02-25 12:00:00');

-- Example data for games table
INSERT INTO games (tournament_id, player1_id, player2_id, winner_id, player1_score, player2_score, finished_at) VALUES
    (1, 1, 2, 1, 10, 5, '2024-03-01 18:30:00'),
    (1, 3, 4, 4, 8, 7, '2024-03-01 19:00:00'),
    (2, 2, 6, 6, 6, 3, '2024-07-15 16:00:00'),
    (2, 4, 5, 5, 9, 4, '2024-07-15 16:30:00'),
    (3, 1, 7, 7, 6, 5, '2024-09-22 20:30:00'),
    (3, 2, 8, 2, 7, 6, '2024-09-22 21:00:00'),
    (4, 5, 9, 9, 7, 6, '2024-12-10 18:15:00'),
    (4, 7, 8, 8, 10, 3, '2024-12-10 18:45:00'),
    (5, 6, 3, 3, 11, 6, '2024-11-28 12:30:00'),
    (5, 4, 1, 1, 9, 8, '2024-11-28 13:00:00');

-- Example data for friends table
INSERT INTO friends (user1_id, user2_id, status) VALUES
    (1, 2, 'accepted'),
    (1, 3, 'accepted'),
    (2, 4, 'pending'),
    (3, 5, 'accepted'),
    (4, 6, 'pending'),
    (5, 6, 'accepted'),
    (7, 8, 'accepted'),
    (6, 9, 'pending'),
    (8, 9, 'accepted'),
    (2, 6, 'accepted');
