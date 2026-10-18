-- Run only in a dedicated, empty lab schema selected by the connection.
-- Deliberately no DROP, CREATE DATABASE or privilege-management commands.
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'user') NOT NULL DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS phones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    brand VARCHAR(50) NOT NULL,
    price DECIMAL(12,0) NOT NULL,
    storage VARCHAR(20),
    color VARCHAR(50),
    quantity INT NOT NULL DEFAULT 0,
    status ENUM('on', 'off') NOT NULL DEFAULT 'off',
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
