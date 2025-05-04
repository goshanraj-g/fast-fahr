-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost
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
-- Table structure for table `post_images`
--

CREATE TABLE `post_images` (
  `id` int(11) NOT NULL,
  `post_id` int(11) NOT NULL,
  `image_path` varchar(255) NOT NULL,
  `is_main` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `post_images`
--

INSERT INTO `post_images` (`id`, `post_id`, `image_path`, `is_main`) VALUES
(1, 1, '/uploads/m5.jpg', 1),
(2, 2, '/uploads/rs7.jpg', 1),
(4, 4, '/uploads/turbos.jpg', 1),
(5, 5, '/uploads/m4.jpeg', 1),
(6, 6, '/uploads/a3.jpg', 1),
(7, 7, '/uploads/e63.jpg', 1),
(8, 8, '/uploads/cayenne.jpg', 1),
(9, 9, '/uploads/golfr.jpg', 1),
(10, 10, '/uploads/i4.jpg', 1),
(11, 11, '/uploads/rs5.jpg', 1),
(12, 12, '/uploads/c43.jpg', 1),
(13, 13, '/uploads/panamera.jpg', 1),
(14, 14, '/uploads/m2.jpg', 1),
(15, 15, '/uploads/tiguan.jpg', 1),
(17, 17, '/uploads/cls550.jpg', 1),
(18, 18, '/uploads/boxster.jpg', 1),
(19, 19, '/uploads/mk7gti.jpg', 1),
(20, 20, '/uploads/rs4.jpg', 1),
(21, 21, '/uploads/glc300.jpg', 1),
(22, 22, '/uploads/x5m.jpg', 1),
(23, 23, '/uploads/a7.jpg', 1),
(24, 24, '/uploads/cayman.jpg', 1),
(25, 25, '/uploads/passat.jpg', 1),
(47, 26, '/uploads/img_6803f27ad4a202.50761189_maybach1.jpg', 1),
(49, 28, '/uploads/img_6807c94b5fe5f2.54388881_porsche7.jpg', 1),
(50, 28, '/uploads/img_6807c94b609d42.69321011_porsche6.jpg', 0),
(51, 28, '/uploads/img_6807c94b613604.39484290_porsche5.jpg', 0),
(52, 28, '/uploads/img_6807c94b61c2d7.41780942_porsche4.jpg', 0),
(53, 28, '/uploads/img_6807c94b624200.33143626_porsche3.jpg', 0),
(54, 28, '/uploads/img_6807c94b62bbc8.82428400_porsche2.jpg', 0),
(55, 28, '/uploads/img_6807c94b6374f3.23635717_posrche1.jpg', 0),
(56, 27, '/uploads/img_680cb034f12317.65356104_Warm-Gradient.jpg', 1),
(57, 28, '/uploads/img_680cb151a1b598.76427621_Warm-Gradient.jpg', 0),
(58, 28, '/uploads/img_680cb151a24471.32958863_abstract-colorful-background-blue-teal-sky-cold-gradient-color-gradiant-illustration-blue-teal-color-gradiant-background-vector.jpg', 1),
(59, 29, '/uploads/img_680cb1f81f4193.90569308_Honda_CR-V_e-HEV_Elegance_AWD__VI______f_14072024.jpg', 1),
(60, 29, '/uploads/img_680cb1f81fbf67.59776555_Shades-Of-Blue-Gradient.jpg', 0),
(61, 30, '/uploads/img_680cb22f556498.43963967_fish.png', 0),
(62, 30, '/uploads/img_680cb22f55b6b8.51498444_1-26ab2ab8.png', 1),
(67, 33, '/uploads/img_680cbea83034f8.67039794.png', 1),
(68, 32, '/uploads/img_680cc16e55e290.44675404.jpg', 1),
(69, 32, '/uploads/img_680cc16e567a75.49001388.jpg', 0),
(70, 34, '/uploads/img_680cc2458c0513.62979982.jpg', 0),
(71, 34, '/uploads/img_680cc2458c84c7.32554126.jpeg', 0),
(72, 34, '/uploads/img_680cc2458ca780.02311603.jpg', 1),
(73, 34, '/uploads/img_680cc2458cbbc4.51654708.jpg', 0),
(74, 35, '/uploads/img_680d2ac44a81e8.25553419.jpg', 1),
(75, 36, '/uploads/img_680d6017d31c13.43462454.jpg', 1),
(76, 37, '/uploads/img_680d624ea68511.18788304.jpg', 1),
(77, 37, '/uploads/img_680d624ea6cc26.05675976.jpeg', 0),
(78, 37, '/uploads/img_680d624ea6e743.13376741.jpg', 0),
(79, 38, '/uploads/img_680d667654d291.51960691.png', 1);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `post_images`
--
ALTER TABLE `post_images`
  ADD PRIMARY KEY (`id`),
  ADD KEY `post_id` (`post_id`),
  ADD KEY `idx_postimages_main` (`post_id`,`is_main`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `post_images`
--
ALTER TABLE `post_images`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=131;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
