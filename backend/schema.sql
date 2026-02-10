-- MentalSystem Database Schema

CREATE DATABASE IF NOT EXISTS mentalsystem
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE mentalsystem;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE objectives (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status ENUM('active', 'completed', 'archived') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE reflections (
    id INT AUTO_INCREMENT PRIMARY KEY,
    objective_id INT NOT NULL,
    question_1 TEXT,
    question_2 TEXT,
    question_3 TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (objective_id) REFERENCES objectives(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE systems (
    id INT AUTO_INCREMENT PRIMARY KEY,
    objective_id INT NOT NULL,
    purpose TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (objective_id) REFERENCES objectives(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE system_elements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    system_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    FOREIGN KEY (system_id) REFERENCES systems(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE system_interactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    system_id INT NOT NULL,
    element_from_id INT NOT NULL,
    element_to_id INT NOT NULL,
    description TEXT NOT NULL,
    FOREIGN KEY (system_id) REFERENCES systems(id) ON DELETE CASCADE,
    FOREIGN KEY (element_from_id) REFERENCES system_elements(id) ON DELETE CASCADE,
    FOREIGN KEY (element_to_id) REFERENCES system_elements(id) ON DELETE CASCADE
) ENGINE=InnoDB;
