-- Seed data for development environment
INSERT INTO users (username, password_hash, salt, wins, losses) VALUES 
    ('darren', 'dummy_hash', 'dummy_salt', 5, 2),
    ('luca', 'dummy_hash', 'dummy_salt', 3, 4),
    ('timo', 'dummy_hash', 'dummy_salt', 7, 1);