-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Oct 08, 2025 at 08:26 AM
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
-- Database: `whatsapp_chatbot_v2`
--

-- --------------------------------------------------------

--
-- Table structure for table `allowed_domains`
--

CREATE TABLE `allowed_domains` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `domain` varchar(255) NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `cache`
--

CREATE TABLE `cache` (
  `key` varchar(255) NOT NULL,
  `value` mediumtext NOT NULL,
  `expiration` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `cache_locks`
--

CREATE TABLE `cache_locks` (
  `key` varchar(255) NOT NULL,
  `owner` varchar(255) NOT NULL,
  `expiration` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `chatbots`
--

CREATE TABLE `chatbots` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `enable_whatsapp` tinyint(1) NOT NULL DEFAULT 1,
  `enable_website` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `chatbots`
--

INSERT INTO `chatbots` (`id`, `user_id`, `name`, `description`, `enable_whatsapp`, `enable_website`, `created_at`, `updated_at`) VALUES
(1, 1, 'Initial Testing Bot', 'My first chatbot for testing CRUD', 1, 1, '2025-10-07 05:59:52', '2025-10-07 05:59:52'),
(3, 1, 'Dummy Bot', 'Dummy Bot', 0, 1, '2025-10-07 06:00:34', '2025-10-07 06:00:34'),
(4, 1, 'Acme Corp Lead Bot', 'Bot to qualify new sales leads.', 1, 0, '2025-10-07 06:29:57', '2025-10-07 06:29:57'),
(5, 1, 'New Chatbot', 'New Chatbot', 1, 1, '2025-10-07 23:47:34', '2025-10-07 23:47:34');

-- --------------------------------------------------------

--
-- Table structure for table `failed_jobs`
--

CREATE TABLE `failed_jobs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `uuid` varchar(255) NOT NULL,
  `connection` text NOT NULL,
  `queue` text NOT NULL,
  `payload` longtext NOT NULL,
  `exception` longtext NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `forms`
--

CREATE TABLE `forms` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `chatbot_id` bigint(20) UNSIGNED NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `position` enum('start','end','none') NOT NULL DEFAULT 'none',
  `submit_button_text` varchar(100) NOT NULL DEFAULT 'Submit',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `forms`
--

INSERT INTO `forms` (`id`, `chatbot_id`, `title`, `description`, `position`, `submit_button_text`, `created_at`, `updated_at`) VALUES
(1, 4, 'Contact Details Form', 'Please provide your details so we can follow up.', 'end', 'Send Details', '2025-10-07 06:29:57', '2025-10-07 06:29:57');

-- --------------------------------------------------------

--
-- Table structure for table `form_fields`
--

CREATE TABLE `form_fields` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `form_id` bigint(20) UNSIGNED NOT NULL,
  `field_label` varchar(255) NOT NULL,
  `field_type` enum('text','email','phone','number','date','textarea') NOT NULL,
  `placeholder` varchar(255) DEFAULT NULL,
  `is_required` tinyint(1) NOT NULL DEFAULT 0,
  `display_order` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `form_fields`
--

INSERT INTO `form_fields` (`id`, `form_id`, `field_label`, `field_type`, `placeholder`, `is_required`, `display_order`, `created_at`, `updated_at`) VALUES
(1, 1, 'Full Name', 'text', 'John Doe', 1, 0, '2025-10-07 06:29:57', '2025-10-07 06:29:57'),
(2, 1, 'Work Email', 'email', 'work@acme.com', 1, 1, '2025-10-07 06:29:57', '2025-10-07 06:29:57'),
(3, 1, 'Phone Number', 'phone', '+1 555-555-5555', 0, 2, '2025-10-07 06:29:57', '2025-10-07 06:29:57');

-- --------------------------------------------------------

--
-- Table structure for table `form_submissions`
--

CREATE TABLE `form_submissions` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `chatbot_id` bigint(20) UNSIGNED NOT NULL,
  `user_phone` varchar(50) DEFAULT NULL,
  `submitted_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `form_submission_data`
--

CREATE TABLE `form_submission_data` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `submission_id` bigint(20) UNSIGNED NOT NULL,
  `field_id` bigint(20) UNSIGNED NOT NULL,
  `field_value` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `jobs`
--

CREATE TABLE `jobs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `queue` varchar(255) NOT NULL,
  `payload` longtext NOT NULL,
  `attempts` tinyint(3) UNSIGNED NOT NULL,
  `reserved_at` int(10) UNSIGNED DEFAULT NULL,
  `available_at` int(10) UNSIGNED NOT NULL,
  `created_at` int(10) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `job_batches`
--

CREATE TABLE `job_batches` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `total_jobs` int(11) NOT NULL,
  `pending_jobs` int(11) NOT NULL,
  `failed_jobs` int(11) NOT NULL,
  `failed_job_ids` longtext NOT NULL,
  `options` mediumtext DEFAULT NULL,
  `cancelled_at` int(11) DEFAULT NULL,
  `created_at` int(11) NOT NULL,
  `finished_at` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `migrations`
--

CREATE TABLE `migrations` (
  `id` int(10) UNSIGNED NOT NULL,
  `migration` varchar(255) NOT NULL,
  `batch` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `migrations`
--

INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES
(1, '0001_01_01_000000_create_users_table', 1),
(2, '0001_01_01_000001_create_cache_table', 1),
(3, '0001_01_01_000002_create_jobs_table', 1),
(4, '2025_10_07_074456_create_personal_access_tokens_table', 1),
(5, '2025_10_07_083003_create_chatbots_table', 1),
(6, '2025_10_07_101503_create_questions_table', 1),
(7, '2025_10_07_101801_create_question_options_table', 1),
(8, '2025_10_07_102035_create_forms_table', 1),
(9, '2025_10_07_102206_create_form_fields_table', 1),
(10, '2025_10_07_102332_create_form_submissions_table', 1),
(11, '2025_10_07_102601_create_form_submission_data_table', 1),
(12, '2025_10_08_054616_create_allowed_domains_table', 2);

-- --------------------------------------------------------

--
-- Table structure for table `password_reset_tokens`
--

CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) NOT NULL,
  `token` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `personal_access_tokens`
--

CREATE TABLE `personal_access_tokens` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `tokenable_type` varchar(255) NOT NULL,
  `tokenable_id` bigint(20) UNSIGNED NOT NULL,
  `name` text NOT NULL,
  `token` varchar(64) NOT NULL,
  `abilities` text DEFAULT NULL,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `personal_access_tokens`
--

INSERT INTO `personal_access_tokens` (`id`, `tokenable_type`, `tokenable_id`, `name`, `token`, `abilities`, `last_used_at`, `expires_at`, `created_at`, `updated_at`) VALUES
(105, 'App\\Models\\User', 1, 'auth_token', 'f87a8def0737c4c366a5004eea88c76f57ee8d1bfc4cbb3d25cba3455d2e9dd0', '[\"*\"]', NULL, NULL, '2025-10-07 23:50:32', '2025-10-07 23:50:32');

-- --------------------------------------------------------

--
-- Table structure for table `questions`
--

CREATE TABLE `questions` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `chatbot_id` bigint(20) UNSIGNED NOT NULL,
  `parent_question_id` bigint(20) UNSIGNED DEFAULT NULL,
  `trigger_option` varchar(255) DEFAULT NULL,
  `question_type` enum('text','options') NOT NULL,
  `question_text` text NOT NULL,
  `answer_text` text DEFAULT NULL,
  `display_order` int(11) NOT NULL DEFAULT 0,
  `is_welcome` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `questions`
--

INSERT INTO `questions` (`id`, `chatbot_id`, `parent_question_id`, `trigger_option`, `question_type`, `question_text`, `answer_text`, `display_order`, `is_welcome`, `created_at`, `updated_at`) VALUES
(5, 4, NULL, NULL, 'options', 'Welcome to Acme Corp! I\'m your AI assistant. How can I help you today?', NULL, 0, 0, '2025-10-07 23:43:20', '2025-10-07 23:43:20'),
(6, 4, 5, 'Sales', 'text', 'Great! Please provide a brief summary of your project requirements.', 'A representative will contact you shortly.', 1, 0, '2025-10-07 23:43:20', '2025-10-07 23:43:20'),
(7, 4, 5, 'Support', 'options', 'Is this issue related to Billing or Integration?', NULL, 2, 0, '2025-10-07 23:43:20', '2025-10-07 23:43:20'),
(8, 5, NULL, NULL, 'options', 'How can i help you today', NULL, 0, 0, '2025-10-07 23:48:07', '2025-10-07 23:48:07');

-- --------------------------------------------------------

--
-- Table structure for table `question_options`
--

CREATE TABLE `question_options` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `question_id` bigint(20) UNSIGNED NOT NULL,
  `option_text` varchar(255) NOT NULL,
  `display_order` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `question_options`
--

INSERT INTO `question_options` (`id`, `question_id`, `option_text`, `display_order`, `created_at`, `updated_at`) VALUES
(5, 5, 'Sales', 0, '2025-10-07 23:43:20', '2025-10-07 23:43:20'),
(6, 5, 'Support', 1, '2025-10-07 23:43:20', '2025-10-07 23:43:20'),
(7, 7, 'Billing', 0, '2025-10-07 23:43:20', '2025-10-07 23:43:20'),
(8, 7, 'Integration', 1, '2025-10-07 23:43:20', '2025-10-07 23:43:20'),
(9, 8, 'Web Dev', 0, '2025-10-07 23:48:07', '2025-10-07 23:48:07'),
(10, 8, 'Testing', 1, '2025-10-07 23:48:07', '2025-10-07 23:48:07'),
(11, 8, 'Design', 2, '2025-10-07 23:48:07', '2025-10-07 23:48:07');

-- --------------------------------------------------------

--
-- Table structure for table `sessions`
--

CREATE TABLE `sessions` (
  `id` varchar(255) NOT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `payload` longtext NOT NULL,
  `last_activity` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `remember_token` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `email_verified_at`, `password`, `remember_token`, `created_at`, `updated_at`) VALUES
(1, 'Ali Hassan', 'ali@wistech.biz', NULL, '$2y$12$6zgVoCHOMh8XdxI7j7VkLucQQ2LeS03WoCYdHVLk/QIjq.EqevqCu', NULL, '2025-10-07 05:44:02', '2025-10-07 05:44:02');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `allowed_domains`
--
ALTER TABLE `allowed_domains`
  ADD PRIMARY KEY (`id`),
  ADD KEY `allowed_domains_user_id_foreign` (`user_id`);

--
-- Indexes for table `cache`
--
ALTER TABLE `cache`
  ADD PRIMARY KEY (`key`);

--
-- Indexes for table `cache_locks`
--
ALTER TABLE `cache_locks`
  ADD PRIMARY KEY (`key`);

--
-- Indexes for table `chatbots`
--
ALTER TABLE `chatbots`
  ADD PRIMARY KEY (`id`),
  ADD KEY `1` (`user_id`);

--
-- Indexes for table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`);

--
-- Indexes for table `forms`
--
ALTER TABLE `forms`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_chatbot_id_2` (`chatbot_id`);

--
-- Indexes for table `form_fields`
--
ALTER TABLE `form_fields`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_form_id` (`form_id`);

--
-- Indexes for table `form_submissions`
--
ALTER TABLE `form_submissions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_form_submissions_chatbot_id` (`chatbot_id`),
  ADD KEY `form_submissions_submitted_at_index` (`submitted_at`);

--
-- Indexes for table `form_submission_data`
--
ALTER TABLE `form_submission_data`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_submission_id` (`submission_id`),
  ADD KEY `form_submission_data_field_id_foreign` (`field_id`);

--
-- Indexes for table `jobs`
--
ALTER TABLE `jobs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `jobs_queue_index` (`queue`);

--
-- Indexes for table `job_batches`
--
ALTER TABLE `job_batches`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `migrations`
--
ALTER TABLE `migrations`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  ADD PRIMARY KEY (`email`);

--
-- Indexes for table `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  ADD KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`),
  ADD KEY `personal_access_tokens_expires_at_index` (`expires_at`);

--
-- Indexes for table `questions`
--
ALTER TABLE `questions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_chatbot_id` (`chatbot_id`),
  ADD KEY `idx_parent_chatbot_id` (`parent_question_id`);

--
-- Indexes for table `question_options`
--
ALTER TABLE `question_options`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_question_id` (`question_id`);

--
-- Indexes for table `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sessions_user_id_index` (`user_id`),
  ADD KEY `sessions_last_activity_index` (`last_activity`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `users_email_unique` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `allowed_domains`
--
ALTER TABLE `allowed_domains`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `chatbots`
--
ALTER TABLE `chatbots`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `forms`
--
ALTER TABLE `forms`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `form_fields`
--
ALTER TABLE `form_fields`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `form_submissions`
--
ALTER TABLE `form_submissions`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `form_submission_data`
--
ALTER TABLE `form_submission_data`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `jobs`
--
ALTER TABLE `jobs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `migrations`
--
ALTER TABLE `migrations`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=106;

--
-- AUTO_INCREMENT for table `questions`
--
ALTER TABLE `questions`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `question_options`
--
ALTER TABLE `question_options`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `allowed_domains`
--
ALTER TABLE `allowed_domains`
  ADD CONSTRAINT `allowed_domains_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `chatbots`
--
ALTER TABLE `chatbots`
  ADD CONSTRAINT `1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `forms`
--
ALTER TABLE `forms`
  ADD CONSTRAINT `idx_chatbot_id_2` FOREIGN KEY (`chatbot_id`) REFERENCES `chatbots` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `form_fields`
--
ALTER TABLE `form_fields`
  ADD CONSTRAINT `idx_form_id` FOREIGN KEY (`form_id`) REFERENCES `forms` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `form_submissions`
--
ALTER TABLE `form_submissions`
  ADD CONSTRAINT `idx_form_submissions_chatbot_id` FOREIGN KEY (`chatbot_id`) REFERENCES `chatbots` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `form_submission_data`
--
ALTER TABLE `form_submission_data`
  ADD CONSTRAINT `form_submission_data_field_id_foreign` FOREIGN KEY (`field_id`) REFERENCES `form_fields` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `idx_submission_id` FOREIGN KEY (`submission_id`) REFERENCES `form_submissions` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `questions`
--
ALTER TABLE `questions`
  ADD CONSTRAINT `idx_chatbot_id` FOREIGN KEY (`chatbot_id`) REFERENCES `chatbots` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `idx_parent_chatbot_id` FOREIGN KEY (`parent_question_id`) REFERENCES `questions` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `question_options`
--
ALTER TABLE `question_options`
  ADD CONSTRAINT `idx_question_id` FOREIGN KEY (`question_id`) REFERENCES `questions` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
