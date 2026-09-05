-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Mar 11, 2024 at 05:31 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `inventorydb`
--

-- --------------------------------------------------------

--
-- Table structure for table `cart`
--

CREATE TABLE `cart` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `quantity` int(11) NOT NULL,
  `price` decimal(25,2) NOT NULL,
  `barcode` varchar(255) NOT NULL,
  `order_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `cart`
--

INSERT INTO `cart` (`id`, `name`, `quantity`, `price`, `barcode`, `order_id`, `product_id`) VALUES
(113, 'baby oil', 3, 2400.00, 'A8662P11', 1841817263, 79),
(114, 'BOSNY Spray Paint Silver Grey', 4, 125.00, '8850747502228', 1320794062, 53),
(115, 'Hardex carburetor and Choke Cleaner', 4, 125.00, '9555134500588', 492572885, 52),
(116, 'baby oil', 3, 2400.00, 'A8662P11', 476877001, 79),
(119, 'Aeropak Electrical Contact Cleaner.jpg', 1, 280.00, '6923432583122', 1284069305, 51),
(124, 'baby oil', 2, 2400.00, 'A8662P11', 1547629088, 79),
(125, 'baby oil', 3, 2400.00, 'A8662P11', 1336981571, 79),
(126, 'Aeropak Electrical Contact Cleaner.jpg', 10, 280.00, '6923432583122', 1336981571, 51),
(127, 'baby oil', 2, 2400.00, 'A8662P11', 362929747, 79),
(128, 'baby oil', 1, 2400.00, 'A8662P11', 672254241, 79),
(129, 'baby oil', 1, 2400.00, 'A8662P11', 1136486507, 79),
(130, 'baby oil', 1, 2400.00, 'A8662P11', 571025148, 79),
(131, 'baby oil', 1, 2400.00, 'A8662P11', 1478246021, 79),
(132, 'baby oil', 1, 2400.00, 'A8662P11', 665380443, 79),
(134, 'baby oil', 8, 2400.00, 'A8662P11', 1580054513, 79),
(135, 'baby oil', 1, 2400.00, 'A8662P11', 1593018953, 79),
(136, 'baby oil', 1, 2400.00, 'A8662P11', 1593178489, 79),
(137, 'baby oil', 1, 2400.00, 'A8662P11', 1900741271, 79),
(138, 'asdf124', 1, 223.00, 'XR75020240143358', 1186636779, 88),
(139, 'brr', 1, 1.00, ' 24010495', 1111697198, 80),
(140, 'coke', 3, 26.00, '4801981116072', 1217367049, 89),
(142, 'coke', 2, 26.00, '4801981116072', 1484752899, 89),
(143, 'C-312 Oil Filter', 2, 300.00, '4971295131204', 674570746, 66),
(144, 'C-312 Oil Filter', 1, 300.00, '4971295131204', 1632254333, 66),
(145, 'C-312 Oil Filter', 1, 300.00, '4971295131204', 456385470, 66),
(146, 'C-312 Oil Filter', 1, 300.00, '4971295131204', 110094801, 66),
(147, 'C-312 Oil Filter', 2, 300.00, '4971295131204', 1474956712, 66),
(148, 'C-312 Oil Filter', 1, 300.00, '4971295131204', 215541171, 66),
(149, 'C-312 Oil Filter', 2, 300.00, '4971295131204', 750261511, 66),
(150, 'C-312 Oil Filter', 1, 300.00, '4971295131204', 286852375, 66),
(151, 'C-312 Oil Filter', 1, 300.00, '4971295131204', 351605429, 66),
(152, 'coke', 1, 26.00, '4801981116072', 1906492653, 89),
(153, 'C-312 Oil Filter', 1, 300.00, '4971295131204', 336465962, 66),
(154, 'C-312 Oil Filter', 2, 300.00, '4971295131204', 2098857185, 66),
(155, 'shell', 1, 122.00, '5011987100411', 1180931264, 90),
(156, 'shell', 3, 122.00, '5011987100411', 821920442, 90),
(157, 'shell', 2, 122.00, '5011987100411', 1238946759, 90),
(158, 'C-312 Oil Filter', 2, 300.00, '4971295131204', 1238946759, 66),
(159, 'C-312 Oil Filter', 1, 300.00, '4971295131204', 1531596166, 66),
(160, 'C-312 Oil Filter', 2, 300.00, '4971295131204', 1334377353, 66),
(161, 'shell', 3, 122.00, '5011987100411', 577554379, 90),
(163, 'C-312 Oil Filter', 2, 1222.00, '4971295131204', 376967565, 97),
(164, 'C-312 Oil Filter', 8, 1222.00, '4971295131204', 493788727, 97),
(167, 'Shell Advance 20W-40 4T 1L', 1, 250.00, '5011987061514', 1206297252, 128),
(168, 'Petron Sprint 4T 1L', 2, 200.00, '4806505973629', 858001436, 126),
(170, 'YAMALUBE AT 4Stroke Motor Oil 20W-40 1L', 1, 300.00, '90793AP42900', 805138662, 121),
(171, 'YAMALUBE AT 4Stroke Motor Oil 20W-40 1L', 1, 300.00, '90793AP42900', 787479505, 121),
(172, 'YAMALUBE AT 4Stroke Motor Oil 20W-40 1L', 1, 300.00, '90793AP42900', 1214983670, 121),
(173, 'YAMALUBE AT 4Stroke Motor Oil 20W-40 1L', 1, 300.00, '90793AP42900', 42525409, 121),
(174, 'Shell Advance 20W-40 4T 1L', 2, 250.00, '5011987061514', 703816930, 128),
(175, 'Shell Advance 20W-40 4T 1L', 2, 250.00, '5011987061514', 791790452, 128),
(176, 'C-110 Oil Filter ', 1, 200.00, '4971295111008', 1944581452, 113),
(177, 'Shell Advance 20W-40 4T 1L', 1, 250.00, '5011987061514', 1944581452, 128),
(178, 'C-110 Oil Filter ', 4, 200.00, '4971295111008', 1877794991, 113),
(179, 'C-110 Oil Filter ', 1, 200.00, '4971295111008', 186955647, 113),
(180, 'C-110 Oil Filter ', 2, 200.00, '4971295111008', 1759608531, 113),
(181, 'C-110 Oil Filter ', 1, 200.00, '4971295111008', 367874470, 113),
(182, 'C-110 Oil Filter ', 1, 200.00, '4971295111008', 979071643, 113),
(183, 'Repsol Motorcycle Oil', 2, 270.00, '8886351385063', 979071643, 131),
(184, 'Repsol Motorcycle Oil', 1, 270.00, '8886351385063', 982389017, 131),
(185, 'C-312 Oil Filter', 2, 230.00, '4971295131204', 1037031935, 105),
(186, 'C-312 Oil Filter', 2, 230.00, '4971295131204', 2111157187, 105);

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
  `id` int(11) UNSIGNED NOT NULL,
  `name` varchar(60) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`id`, `name`) VALUES
(31, 'BOSNY Spray Paint'),
(32, 'C Oil Filter'),
(37, 'Castrol'),
(33, 'Hardex Dexel'),
(38, 'Motul'),
(41, 'oil'),
(39, 'Petron'),
(40, 'repsol'),
(36, 'Yamaha');

-- --------------------------------------------------------

--
-- Table structure for table `media`
--

CREATE TABLE `media` (
  `id` int(11) UNSIGNED NOT NULL,
  `file_name` varchar(255) NOT NULL,
  `file_type` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Dumping data for table `media`
--

INSERT INTO `media` (`id`, `file_name`, `file_type`) VALUES
(39, 'C-312 Oil Filter.jpg', 'image/jpeg'),
(40, 'BOSNY Spray Lemon.png', 'image/png'),
(41, 'BOSNY Spray Paint Black.jpg', 'image/jpeg'),
(42, 'C-306 Oil Filter.jpg', 'image/jpeg'),
(43, 'C-209 Oil Filter.jpg', 'image/jpeg'),
(44, 'C-527 Oil Filter.jpg', 'image/jpeg'),
(45, 'C-529 Oil Filter.jpg', 'image/jpeg'),
(46, 'C-415 Oil Filter.jpg', 'image/jpeg'),
(47, 'C-110 Oil Filter.jpg', 'image/jpeg'),
(48, 'C-809 Oil Filter.jpg', 'image/jpeg'),
(49, 'C-806 OIL FILTER.jpg', 'image/jpeg'),
(50, 'Bosny Spray Paint- Silver Grey.jpg', 'image/jpeg'),
(51, 'BOSNY Spray Flat Black.jpg', 'image/jpeg'),
(52, 'BOSNY Spray Paint- Signal Red.jpg', 'image/jpeg'),
(53, '4T Shell Advance 10W-40.jpg', 'image/jpeg'),
(54, '4T Honda SJ 40 MA Gasoline Motor Oil.png', 'image/png'),
(55, '4T Honda SL 10W-30 MA.jpg', 'image/jpeg'),
(57, 'Hardex Dexel Lite- Fully Synthetic SAE 15W-40.png', 'image/png'),
(58, 'Hardex Dexel Pro Fully Synthetic SAE 10W-40.png', 'image/png'),
(59, 'YAMALUBE AT.png', 'image/png'),
(60, 'YAMALUBE P 20W-50.jpg', 'image/jpeg'),
(61, 'YAMALUBE AT.jpg', 'image/jpeg'),
(62, 'Castrol Activ 20W-40 4T 1L.jpg', 'image/jpeg'),
(63, 'Castrol Power 1 10W-4- 4T 800ml.jpg', 'image/jpeg'),
(64, 'Motul 3000plus 4T.png', 'image/png'),
(65, 'Motul Scooter 4T 1L.jpg', 'image/jpeg'),
(66, 'Petron Sprint 4T.jpg', 'image/jpeg'),
(67, 'Shell Advance 15W-40 4T.jpg', 'image/jpeg'),
(69, 'Master Oil.jpg', 'image/jpeg'),
(70, 'Repsol motorcycle oil rider.jpg', 'image/jpeg');

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `id` int(11) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `quantity` varchar(50) DEFAULT NULL,
  `buy_price` decimal(25,2) DEFAULT NULL,
  `sale_price` decimal(25,2) NOT NULL,
  `categorie_id` int(11) UNSIGNED NOT NULL,
  `media_id` int(11) DEFAULT 0,
  `date` datetime NOT NULL,
  `barcode` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`id`, `name`, `quantity`, `buy_price`, `sale_price`, `categorie_id`, `media_id`, `date`, `barcode`) VALUES
(100, 'C-806 OIL FILTER', '8', 200.00, 230.00, 32, 49, '2024-03-05 01:09:52', '4971295180608'),
(101, 'C-415 Oil Filter', '9', 180.00, 200.00, 32, 46, '2024-03-05 01:12:45', '4971295131808'),
(102, 'C-809 Oil Filter', '10', 220.00, 250.00, 32, 48, '2024-03-05 01:13:27', '4971295180905'),
(103, 'C-529 Oil Filter', '10', 300.00, 320.00, 32, 45, '2024-03-05 01:15:41', '4971295152902'),
(104, 'C-527 Oil Filter', '10', 300.00, 320.00, 32, 44, '2024-03-05 01:18:36', '4971295152704'),
(105, 'C-312 Oil Filter', '6', 200.00, 230.00, 32, 39, '2024-03-05 01:19:56', '4971295131204'),
(106, 'BOSNY Spray Paint-Lemon Yellow', '12', 100.00, 125.00, 31, 40, '2024-03-05 01:21:30', '8850747502259'),
(107, 'BOSNY Spray Paint- Black', '12', 100.00, 125.00, 31, 41, '2024-03-05 01:22:53', '8850747502396'),
(108, 'BOSNY Spray Paint-Silver Grey', '10', 100.00, 125.00, 31, 50, '2024-03-05 01:26:38', '8850747502228'),
(109, 'BOSNY Spray Paint Fat Black', '10', 100.00, 125.00, 31, 51, '2024-03-05 01:29:58', '8850747502044'),
(110, 'BOSNY Spray Paint Signal Red', '15', 100.00, 125.00, 31, 52, '2024-03-05 01:31:01', '8850747502235'),
(111, 'C-209 Oil Filter', '13', 320.00, 350.00, 32, 43, '2024-03-05 01:34:10', '4971295120901'),
(113, 'C-110 Oil Filter ', '11', 180.00, 200.00, 32, 47, '2024-03-05 01:35:20', '4971295111008'),
(117, 'Hardex Dexel Lite- Fully Synthetic SAE 15W-40.', '13', 380.00, 400.00, 33, 57, '2024-03-05 01:51:03', '9555134510273'),
(118, '	Hardex Dexel Pro Fully Synthetic SAE 10W-40', '10', 430.00, 450.00, 33, 58, '2024-03-05 01:54:28', '9555134510266'),
(119, 'YAMALUBE AT 4Stroke Motor Oil 1L', '13', 370.00, 390.00, 36, 59, '2024-03-05 01:59:49', '90793AP42600'),
(120, 'YAMALUBE P 20W-50 1L', '12', 300.00, 320.00, 36, 60, '2024-03-05 02:02:10', '90793AP42700'),
(121, 'YAMALUBE AT 4Stroke Motor Oil 20W-40 1L', '7', 280.00, 300.00, 36, 61, '2024-03-05 02:13:30', '90793AP42900'),
(122, 'Castrol Activ 20W-40 4T 1L', '14', 250.00, 270.00, 37, 62, '2024-03-05 02:15:55', '9556402116616'),
(123, 'Castrol Power 1 10W-4- 4T 800ml', '14', 260.00, 280.00, 37, 63, '2024-03-05 02:16:51', '9556402116593'),
(124, '	Motul 3000plus 4T', '14', 330.00, 350.00, 38, 64, '2024-03-05 02:22:33', '3374650276151'),
(125, 'Motul Scooter 4T 1L', '13', 330.00, 350.00, 38, 65, '2024-03-05 02:24:39', '3374650015941'),
(126, 'Petron Sprint 4T 1L', '11', 180.00, 200.00, 39, 66, '2024-03-05 02:28:51', '4806505973629'),
(131, 'Repsol Motorcycle Oil', '1', 250.00, 270.00, 41, 70, '2024-03-05 12:42:17', '8886351385063');

-- --------------------------------------------------------

--
-- Table structure for table `sales`
--

CREATE TABLE `sales` (
  `id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `qty` int(11) NOT NULL,
  `price` decimal(25,2) NOT NULL,
  `date` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `sales`
--

INSERT INTO `sales` (`id`, `product_id`, `qty`, `price`, `date`) VALUES
(4, 79, 3, 2400.00, '2024-03-03 11:27:42'),
(5, 53, 4, 125.00, '2024-03-03 12:20:50'),
(6, 53, 4, 125.00, '2024-03-03 12:21:24'),
(7, 53, 4, 125.00, '2024-03-03 12:22:27'),
(9, 79, 3, 2400.00, '2024-03-03 12:34:46'),
(10, 51, 1, 280.00, '2024-03-03 14:03:09'),
(11, 79, 2, 2400.00, '2024-03-03 14:34:35'),
(12, 79, 3, 2400.00, '2024-03-03 15:03:32'),
(13, 51, 10, 280.00, '2024-03-03 15:03:32'),
(14, 79, 2, 2400.00, '2024-03-03 15:30:26'),
(15, 79, 1, 2400.00, '2024-03-03 15:31:33'),
(16, 79, 1, 2400.00, '2024-03-03 15:33:03'),
(17, 79, 1, 2400.00, '2024-03-03 15:37:28'),
(18, 79, 1, 2400.00, '2024-03-03 15:38:26'),
(19, 79, 1, 2400.00, '2024-03-03 15:46:54'),
(20, 79, 8, 2400.00, '2024-03-03 16:25:49'),
(21, 79, 1, 2400.00, '2024-03-03 16:26:19'),
(22, 79, 1, 2400.00, '2024-03-03 16:26:48'),
(23, 79, 1, 2400.00, '2024-03-03 16:27:39'),
(24, 80, 1, 1.00, '2024-03-04 10:45:08'),
(25, 89, 3, 26.00, '2024-03-04 10:47:42'),
(26, 66, 2, 300.00, '2024-03-04 12:18:28'),
(27, 66, 1, 300.00, '2024-03-04 12:18:51'),
(28, 66, 1, 300.00, '2024-03-04 12:23:26'),
(29, 66, 1, 300.00, '2024-03-04 12:32:21'),
(30, 66, 2, 300.00, '2024-03-04 12:33:50'),
(31, 66, 1, 300.00, '2024-03-04 12:34:54'),
(32, 66, 2, 300.00, '2024-03-04 12:38:22'),
(33, 66, 1, 300.00, '2024-03-04 12:38:35'),
(34, 66, 1, 300.00, '2024-03-04 12:41:04'),
(35, 89, 1, 26.00, '2024-03-04 12:47:18'),
(36, 66, 1, 300.00, '2024-03-04 13:09:43'),
(37, 66, 2, 300.00, '2024-03-04 13:10:11'),
(38, 90, 1, 122.00, '2024-03-04 13:22:15'),
(39, 90, 3, 122.00, '2024-03-04 13:22:36'),
(40, 90, 2, 122.00, '2024-03-04 13:49:12'),
(41, 66, 2, 300.00, '2024-03-04 13:49:12'),
(42, 66, 1, 300.00, '2024-03-04 14:23:45'),
(43, 66, 2, 300.00, '2024-03-04 14:49:25'),
(44, 90, 3, 122.00, '2024-03-04 14:49:55'),
(45, 97, 2, 1222.00, '2024-03-05 07:34:31'),
(46, 97, 8, 1222.00, '2024-03-05 07:35:33'),
(49, 121, 1, 300.00, '2024-03-05 10:02:28'),
(50, 121, 1, 300.00, '2024-03-05 10:03:01'),
(51, 121, 1, 300.00, '2024-03-05 10:04:13'),
(52, 128, 2, 250.00, '2024-03-05 10:06:49'),
(53, 128, 2, 250.00, '2024-03-05 10:16:36'),
(54, 113, 1, 200.00, '2024-03-05 10:44:18'),
(55, 128, 1, 250.00, '2024-03-05 10:44:18'),
(56, 113, 4, 200.00, '2024-03-05 10:45:38'),
(57, 113, 1, -200.00, '2024-03-05 00:00:00'),
(58, 113, 1, 200.00, '2024-03-05 19:47:20'),
(59, 131, 2, 270.00, '2024-03-05 19:47:20'),
(60, 105, 2, 230.00, '2024-03-09 13:03:37'),
(61, 105, 2, 230.00, '2024-03-09 13:07:28');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) UNSIGNED NOT NULL,
  `name` varchar(60) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `user_level` int(11) NOT NULL,
  `image` varchar(255) DEFAULT 'no_image.jpg',
  `status` int(1) NOT NULL,
  `last_login` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `username`, `password`, `user_level`, `image`, `status`, `last_login`) VALUES
(2, 'admin', 'admin', 'd033e22ae348aeb5660fc2140aec35850c4da997', 1, '54qy2t2c2.jpg', 1, '2024-03-11 04:35:37'),
(5, 'special', 'special', 'ba36b97a41e7faf742ab09bf88405ac04f99599a', 2, 'vpkcj92g5.jpg', 1, '2024-03-05 12:50:17');

-- --------------------------------------------------------

--
-- Table structure for table `user_groups`
--

CREATE TABLE `user_groups` (
  `id` int(11) NOT NULL,
  `group_name` varchar(150) NOT NULL,
  `group_level` int(11) NOT NULL,
  `group_status` int(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Dumping data for table `user_groups`
--

INSERT INTO `user_groups` (`id`, `group_name`, `group_level`, `group_status`) VALUES
(1, 'Owner', 1, 1),
(2, 'Cashier', 2, 1);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `cart`
--
ALTER TABLE `cart`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indexes for table `media`
--
ALTER TABLE `media`
  ADD PRIMARY KEY (`id`),
  ADD KEY `id` (`id`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`),
  ADD KEY `categorie_id` (`categorie_id`),
  ADD KEY `media_id` (`media_id`);

--
-- Indexes for table `sales`
--
ALTER TABLE `sales`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_level` (`user_level`);

--
-- Indexes for table `user_groups`
--
ALTER TABLE `user_groups`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `group_level` (`group_level`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `cart`
--
ALTER TABLE `cart`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=187;

--
-- AUTO_INCREMENT for table `categories`
--
ALTER TABLE `categories`
  MODIFY `id` int(11) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=42;

--
-- AUTO_INCREMENT for table `media`
--
ALTER TABLE `media`
  MODIFY `id` int(11) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=71;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `id` int(11) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=132;

--
-- AUTO_INCREMENT for table `sales`
--
ALTER TABLE `sales`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=62;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `user_groups`
--
ALTER TABLE `user_groups`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `products`
--
ALTER TABLE `products`
  ADD CONSTRAINT `FK_products` FOREIGN KEY (`categorie_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `FK_user` FOREIGN KEY (`user_level`) REFERENCES `user_groups` (`group_level`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
