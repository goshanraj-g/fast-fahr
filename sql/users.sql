-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: May 03, 2025 at 08:32 PM
-- Server version: 10.4.28-MariaDB
-- PHP Version: 8.2.4

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
--

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `user_id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `profile_picture` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`user_id`, `username`, `email`, `password_hash`, `created_at`, `profile_picture`) VALUES
(1, 'sampleuser', 'sampleuser@gmail.com', '$2y$10$DZmaFY75hyDpl9gxM1QwjuMNAEInPXwZhQjET38FJScH3HuasdbYG', '2025-04-01 07:46:02', NULL),
(2, 'AliceWonder', 'alice@example.com', '$2y$10$DZmaFY75hyDpl9gxM1QwjuMNAEInPXwZhQjET38FJScH3HuasdbYG', '2025-04-01 13:49:31', 'https://i.pravatar.cc/150?img=1'),
(3, 'BobBuilder', 'bob@example.com', '$2y$10$DZmaFY75hyDpl9gxM1QwjuMNAEInPXwZhQjET38FJScH3HuasdbYG', '2025-04-01 13:49:31', 'https://i.pravatar.cc/150?img=3'),
(4, 'CharlieChap', 'charlie@example.com', '$2y$10$DZmaFY75hyDpl9gxM1QwjuMNAEInPXwZhQjET38FJScH3HuasdbYG', '2025-04-01 13:49:31', 'https://i.pravatar.cc/150?img=5'),
(5, 'DianaPrince', 'diana@example.com', '$2y$10$DZmaFY75hyDpl9gxM1QwjuMNAEInPXwZhQjET38FJScH3HuasdbYG', '2025-04-01 13:49:31', 'https://i.pravatar.cc/150?img=8'),
(6, 'TestUser', 'test@example.com', '$2y$10$PCJR3qS1UYvywFGMuFCWv.Yq4KDPK9zbdvvUHw8XL/4WtTzWFMHa.', '2025-04-01 13:49:31', '/uploads/profile_pictures/6_68159b03e77ca.jpg'),
(7, 'peely', 'banana@gmail.com', '$2y$10$MzGbwE8dCqPUIqj2S5iUT.u2VjKJb6Nbjo.lswa0QEaMvA.aXNXkW', '2025-04-01 09:29:53', NULL),
(8, 'BigBoosy', 'jam@gmail.com', '$2y$10$bfKcP/TGP30s0HhW0H.0jei.YcMUnP/JduPWpoBiS6BFTKcxCRDkO', '2025-04-25 10:50:16', NULL),
(9, 'jvioiaeqq', 'easypeasy@gmail.com', '$2y$10$UuEprUYy07YhC8py39JKpObFCBD6eqEL9GmMXj2r9eDGgbHyBsVaW', '2025-04-25 10:55:03', NULL),
(10, 'arkizzy', 'funky@gmail.com', '$2y$10$wJX94ZJCu7Yxhm8w1fpadeuXSIukVhJxhXVbsXIpYO9Oo19kaUqzG', '2025-04-25 10:55:24', NULL),
(11, 'bunga', 'arkizzy@gmail.com', '$2y$10$VkS48/ptEPLlqTZoT5487.BTUFyPzjVQ4P3WrE2Tn96lYnf.qRiJm', '2025-04-25 10:55:51', NULL),
(12, 'bugha', 'bugha@gmail.com', '$2y$10$jHEpUJpi9lPgQEgWSHF1NOzF7VYwLe.XX2RH8zXefhzAo3G8lnFqy', '2025-04-25 10:59:02', NULL),
(13, 'taco', 'taco@gmail.com', '$2y$10$TDn9ny9Us98Fwa7kfyVRNuvN7eXoCOPWSVfVy/4ZylXimEAizLmwS', '2025-04-25 10:59:38', NULL),
(14, 'bizzlebus', 'bizzle@gmail.com', '$2y$10$J8H3wMqvEYMcsSYIHkB0heZxu80RduhfyZmAqCyg0PSeFpZeX8ns2', '2025-04-25 11:15:23', NULL),
(15, 'peely123', 'banana123@gmail.com', '$2y$10$cEe8BkDL4dLEV7o3sim4CeXCntKxPeW1tV6py3qx7xJKN0Ru0U7Ee', '2025-04-26 20:46:32', NULL),
(16, 'BigBertha', 'bigbertha@gmail.com', '$2y$10$boLZH1.zfPIlPbhgHk1OXOV5CRjv1eUP/6vXMkWANuqUF8llfCfDi', '2025-04-30 23:35:49', NULL),
(17, 'Breeze', 'cheese@example.com', '$2y$10$KPvuNbSDJn1leMlvJunFmOL0GBOZ9tUm4a6Tbfyl.bMvtUZu/mGLi', '2025-05-02 13:26:56', '/uploads/profile_pictures/17_68150c3783e80.jpg'),
(18, 'ziko', 'ziko@gmail.com', '$2y$10$tHv3aLXwiAs/Tv7bsM3kdeQnWe29XCXrGYyXEE.bPOKR4PZUEdVeO', '2025-05-02 23:28:48', NULL),
(19, 'ArkelZ', 'arkel.ziko@gmail.com', '$2y$10$PiDFobg5eh2mpbi.GqGcE.0ih2j6jVFu3ZNT2slZ23aTizqDj7Qpy', '2025-05-03 11:59:58', NULL);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
