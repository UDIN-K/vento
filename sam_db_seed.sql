-- Database creation
CREATE DATABASE IF NOT EXISTS `sam`;
USE `sam`;

-- Drop tables if they exist to allow clean re-seeding
DROP TABLE IF EXISTS `registrations`;
DROP TABLE IF EXISTS `events`;

-- Table structure for `events`
CREATE TABLE `events` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(255) NOT NULL,
  `date` DATETIME NOT NULL,
  `location` VARCHAR(255) NOT NULL,
  `description` TEXT,
  `capacity` INT(11) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table structure for `registrations`
CREATE TABLE `registrations` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `event_id` INT(11) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `event_id_idx` (`event_id`),
  CONSTRAINT `fk_event_id` FOREIGN KEY (`event_id`) REFERENCES `events` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- Seeding Data
-- --------------------------------------------------------

-- Inserting sample events
INSERT INTO `events` (`id`, `title`, `date`, `location`, `description`, `capacity`) VALUES
(1, 'Tech Innovations Summit 2024', '2024-10-15 09:00:00', 'Jakarta Convention Center', 'A premier event for exploring the latest trends in technology, AI, and software development.', 500),
(2, 'Developer Meetup: Web3 & Beyond', '2024-11-05 18:30:00', 'Block71 Jakarta', 'Join us for an evening of networking and talks exploring decentralized applications and smart contracts.', 150),
(3, 'Cloud Native Masterclass', '2024-12-01 10:00:00', 'Online Webinar', 'Deep dive into Kubernetes, Docker, and modern cloud deployment strategies.', 300);

-- Inserting sample registrations
INSERT INTO `registrations` (`event_id`, `name`, `email`) VALUES
(1, 'Budi Santoso', 'budi.santoso@example.com'),
(1, 'Siti Aminah', 'siti.aminah@example.com'),
(2, 'Agus Pratama', 'agus.pratama@example.com');
