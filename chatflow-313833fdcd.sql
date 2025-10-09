-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: sdb-e.hosting.stackcp.net
-- Generation Time: Oct 09, 2025 at 07:19 AM
-- Server version: 10.6.19-MariaDB-log
-- PHP Version: 8.3.26

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `chatflow-313833fdcd`
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
(6, 1, 'myEMAN', 'Welcome to myEMAN', 1, 1, '2025-10-08 05:50:04', '2025-10-08 05:50:04');

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
(167, 'App\\Models\\User', 1, 'auth_token', '09de399e732929c1ab80e98861c0cfc32e128af7fcd0d634ad9dbd73193d7245', '[\"*\"]', NULL, NULL, '2025-10-09 04:51:28', '2025-10-09 04:51:28');

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
(222, 6, NULL, NULL, 'options', 'Hello there! 👋 Welcome to myEMAN — your trusted UAE partner for business, legal, financial, and lifestyle solutions. How can I assist you today?', NULL, 0, 0, '2025-10-09 04:51:28', '2025-10-09 04:51:28'),
(223, 6, 222, 'Business & Commercial License', 'options', 'Great choice, We help you start or manage your business in the UAE.  Please select your need:', NULL, 1, 0, '2025-10-09 04:51:28', '2025-10-09 04:51:28'),
(224, 6, 223, 'Start a New Company', 'options', 'We’ll assist you with the complete company setup — including registration, documentation, and approvals. Please select your business type:', NULL, 2, 0, '2025-10-09 04:51:28', '2025-10-09 04:51:28'),
(225, 6, 223, 'Renew Existing License', 'text', 'We can renew your trade license quickly and ensure full compliance with UAE laws.  Would you like our team to guide you through the renewal process? [whatsapp-btn]', NULL, 3, 0, '2025-10-09 04:51:28', '2025-10-09 04:51:28'),
(226, 6, 223, 'Trade Name Registration', 'text', 'We help you register your trade name as per UAE regulations.  Would you like to discuss the name registration and documentation with our team? [whatsapp-btn]', NULL, 4, 0, '2025-10-09 04:51:28', '2025-10-09 04:51:28'),
(227, 6, 223, 'Mainland / Free Zone / Offshore Setup', 'text', 'We can guide you in choosing the right business structure for your goals.  Would you like to schedule a quick consultation to find the best setup? [whatsapp-btn]', NULL, 5, 0, '2025-10-09 04:51:28', '2025-10-09 04:51:28'),
(228, 6, 223, 'Business Consultation', 'text', 'Our experts provide business setup and compliance guidance.  Would you like to connect with a consultant directly? [whatsapp-btn]', NULL, 6, 0, '2025-10-09 04:51:28', '2025-10-09 04:51:28'),
(229, 6, 222, 'Legal Affairs', 'options', 'Our legal team offers reliable and confidential support for individuals and companies.  Please choose your service:', NULL, 7, 0, '2025-10-09 04:51:28', '2025-10-09 04:51:28'),
(230, 6, 229, 'Contract Drafting & Review', 'text', 'We help you create and review professional contracts.  Would you like to discuss your requirements with our legal expert? [whatsapp-btn]', NULL, 8, 0, '2025-10-09 04:51:28', '2025-10-09 04:51:28'),
(231, 6, 229, 'Legal Translation', 'text', 'We offer MOJ-certified translations in Arabic, English, and more.  Would you like to discuss translation pricing and timelines? [whatsapp-btn]', NULL, 9, 0, '2025-10-09 04:51:28', '2025-10-09 04:51:28'),
(232, 6, 229, 'Power of Attorney', 'text', 'We prepare and process POA documents for business, property, and vehicles.  Would you like to know the steps for your specific POA type? [whatsapp-btn]', NULL, 10, 0, '2025-10-09 04:51:28', '2025-10-09 04:51:28'),
(233, 6, 229, 'Document Attestation', 'text', 'We handle MOFA, embassy, and notary attestation for your documents.  Would you like to arrange assistance with attestation? [whatsapp-btn]', NULL, 11, 0, '2025-10-09 04:51:28', '2025-10-09 04:51:28'),
(234, 6, 229, 'Corporate Legal Advisory', 'text', 'Our advisors assist with company law, compliance, and restructuring.  Would you like to talk to our legal expert now? [whatsapp-btn]', NULL, 12, 0, '2025-10-09 04:51:28', '2025-10-09 04:51:28'),
(235, 6, 222, 'Financial Services', 'options', 'Our financial experts assist with accounting, tax, and banking solutions.  Select your requirement:', NULL, 13, 0, '2025-10-09 04:51:28', '2025-10-09 04:51:28'),
(236, 6, 235, 'Accounting & Bookkeeping', 'text', 'Would you like to connect with our financial advisor to discuss details? [whatsapp-btn]', NULL, 14, 0, '2025-10-09 04:51:28', '2025-10-09 04:51:28'),
(237, 6, 235, 'Tax & VAT', 'text', 'Would you like to connect with our financial advisor to discuss details? [whatsapp-btn]', NULL, 15, 0, '2025-10-09 04:51:28', '2025-10-09 04:51:28'),
(238, 6, 235, 'Payroll Management', 'text', 'Would you like to connect with our financial advisor to discuss details? [whatsapp-btn]', NULL, 16, 0, '2025-10-09 04:51:28', '2025-10-09 04:51:28'),
(239, 6, 235, 'Business Bank Account', 'text', 'Would you like to connect with our financial advisor to discuss details? [whatsapp-btn]', NULL, 17, 0, '2025-10-09 04:51:28', '2025-10-09 04:51:28'),
(240, 6, 235, 'Audit Services', 'text', 'Would you like to connect with our financial advisor to discuss details? [whatsapp-btn]', NULL, 18, 0, '2025-10-09 04:51:28', '2025-10-09 04:51:28'),
(241, 6, 222, 'Migration Services', 'options', 'We simplify UAE visa and residency processes for individuals and companies.  Please choose one:', NULL, 19, 0, '2025-10-09 04:51:28', '2025-10-09 04:51:28'),
(242, 6, 241, 'Employment Visa', 'text', 'Would you like to discuss your visa requirements with our migration specialist? [whatsapp-btn]', NULL, 20, 0, '2025-10-09 04:51:28', '2025-10-09 04:51:28'),
(243, 6, 241, 'Investor Visa', 'text', 'Would you like to discuss your visa requirements with our migration specialist? [whatsapp-btn]', NULL, 21, 0, '2025-10-09 04:51:28', '2025-10-09 04:51:28'),
(244, 6, 241, 'Family Visa', 'text', 'Would you like to discuss your visa requirements with our migration specialist? [whatsapp-btn]', NULL, 22, 0, '2025-10-09 04:51:28', '2025-10-09 04:51:28'),
(245, 6, 241, 'Golden Visa', 'text', 'Would you like to discuss your visa requirements with our migration specialist? [whatsapp-btn]', NULL, 23, 0, '2025-10-09 04:51:28', '2025-10-09 04:51:28'),
(246, 6, 241, 'Residency & Permits', 'text', 'Would you like to discuss your visa requirements with our migration specialist? [whatsapp-btn]', NULL, 24, 0, '2025-10-09 04:51:28', '2025-10-09 04:51:28'),
(247, 6, 222, 'Mobility', 'options', 'We make travel and transport simple and reliable.  Please choose one:', NULL, 25, 0, '2025-10-09 04:51:28', '2025-10-09 04:51:28'),
(248, 6, 247, 'Car Rentals', 'text', 'Would you like to book or learn more about our mobility services? [whatsapp-btn]', NULL, 26, 0, '2025-10-09 04:51:28', '2025-10-09 04:51:28'),
(249, 6, 247, 'Chauffeur Services', 'text', 'Would you like to book or learn more about our mobility services? [whatsapp-btn]', NULL, 27, 0, '2025-10-09 04:51:28', '2025-10-09 04:51:28'),
(250, 6, 247, 'Airport Transfers', 'text', 'Would you like to book or learn more about our mobility services? [whatsapp-btn]', NULL, 28, 0, '2025-10-09 04:51:28', '2025-10-09 04:51:28'),
(251, 6, 247, 'Vehicle Registration / Renewal', 'text', 'Would you like to book or learn more about our mobility services? [whatsapp-btn]', NULL, 29, 0, '2025-10-09 04:51:28', '2025-10-09 04:51:28'),
(252, 6, 222, 'Housing', 'options', 'We help you find homes and manage properties in the UAE.  Please choose your requirement:', NULL, 30, 0, '2025-10-09 04:51:28', '2025-10-09 04:51:28'),
(253, 6, 252, 'Short-Term Rentals', 'text', 'Would you like to discuss your housing needs with our property consultant? [whatsapp-btn]', NULL, 31, 0, '2025-10-09 04:51:28', '2025-10-09 04:51:28'),
(254, 6, 252, 'Long-Term Leasing', 'text', 'Would you like to discuss your housing needs with our property consultant? [whatsapp-btn]', NULL, 32, 0, '2025-10-09 04:51:28', '2025-10-09 04:51:28'),
(255, 6, 252, 'Buy or Sell Property', 'text', 'Would you like to discuss your housing needs with our property consultant? [whatsapp-btn]', NULL, 33, 0, '2025-10-09 04:51:28', '2025-10-09 04:51:28'),
(256, 6, 252, 'Document Support', 'text', 'Would you like to discuss your housing needs with our property consultant? [whatsapp-btn]', NULL, 34, 0, '2025-10-09 04:51:28', '2025-10-09 04:51:28'),
(257, 6, 222, 'Private Affairs', 'options', 'We handle exclusive lifestyle and personal services.  Please select:', NULL, 35, 0, '2025-10-09 04:51:28', '2025-10-09 04:51:28'),
(258, 6, 257, 'Family Office Support', 'text', 'Would you like to explore our private service packages with a consultant? [whatsapp-btn]', NULL, 36, 0, '2025-10-09 04:51:28', '2025-10-09 04:51:28'),
(259, 6, 257, 'Personal Concierge', 'text', 'Would you like to explore our private service packages with a consultant? [whatsapp-btn]', NULL, 37, 0, '2025-10-09 04:51:28', '2025-10-09 04:51:28'),
(260, 6, 257, 'Lifestyle Management', 'text', 'Would you like to explore our private service packages with a consultant? [whatsapp-btn]', NULL, 38, 0, '2025-10-09 04:51:28', '2025-10-09 04:51:28'),
(261, 6, 257, 'Travel & Event Planning', 'text', 'Would you like to explore our private service packages with a consultant? [whatsapp-btn]', NULL, 39, 0, '2025-10-09 04:51:28', '2025-10-09 04:51:28'),
(262, 6, 222, 'General Enquiry', 'text', 'Sure, Please describe your question or requirement briefly.  Our representative will reach out soon. [whatsapp-btn]', NULL, 40, 0, '2025-10-09 04:51:28', '2025-10-09 04:51:28');

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
(295, 222, 'Business & Commercial License', 0, '2025-10-09 04:51:28', '2025-10-09 04:51:28'),
(296, 222, 'Legal Affairs', 1, '2025-10-09 04:51:28', '2025-10-09 04:51:28'),
(297, 222, 'Financial Services', 2, '2025-10-09 04:51:28', '2025-10-09 04:51:28'),
(298, 222, 'Migration Services', 3, '2025-10-09 04:51:28', '2025-10-09 04:51:28'),
(299, 222, 'Mobility', 4, '2025-10-09 04:51:28', '2025-10-09 04:51:28'),
(300, 222, 'Housing', 5, '2025-10-09 04:51:28', '2025-10-09 04:51:28'),
(301, 222, 'Private Affairs', 6, '2025-10-09 04:51:28', '2025-10-09 04:51:28'),
(302, 222, 'General Enquiry', 7, '2025-10-09 04:51:28', '2025-10-09 04:51:28'),
(303, 223, 'Start a New Company', 0, '2025-10-09 04:51:28', '2025-10-09 04:51:28'),
(304, 223, 'Renew Existing License', 1, '2025-10-09 04:51:28', '2025-10-09 04:51:28'),
(305, 223, 'Trade Name Registration', 2, '2025-10-09 04:51:28', '2025-10-09 04:51:28'),
(306, 223, 'Mainland / Free Zone / Offshore Setup', 3, '2025-10-09 04:51:28', '2025-10-09 04:51:28'),
(307, 223, 'Business Consultation', 4, '2025-10-09 04:51:28', '2025-10-09 04:51:28'),
(308, 224, 'Mainland Company', 0, '2025-10-09 04:51:28', '2025-10-09 04:51:28'),
(309, 224, 'Free Zone Company', 1, '2025-10-09 04:51:28', '2025-10-09 04:51:28'),
(310, 224, 'Offshore Company', 2, '2025-10-09 04:51:28', '2025-10-09 04:51:28'),
(311, 229, 'Contract Drafting & Review', 0, '2025-10-09 04:51:28', '2025-10-09 04:51:28'),
(312, 229, 'Legal Translation', 1, '2025-10-09 04:51:28', '2025-10-09 04:51:28'),
(313, 229, 'Power of Attorney', 2, '2025-10-09 04:51:28', '2025-10-09 04:51:28'),
(314, 229, 'Document Attestation', 3, '2025-10-09 04:51:28', '2025-10-09 04:51:28'),
(315, 229, 'Corporate Legal Advisory', 4, '2025-10-09 04:51:28', '2025-10-09 04:51:28'),
(316, 235, 'Accounting & Bookkeeping', 0, '2025-10-09 04:51:28', '2025-10-09 04:51:28'),
(317, 235, 'Tax & VAT', 1, '2025-10-09 04:51:28', '2025-10-09 04:51:28'),
(318, 235, 'Payroll Management', 2, '2025-10-09 04:51:28', '2025-10-09 04:51:28'),
(319, 235, 'Business Bank Account', 3, '2025-10-09 04:51:28', '2025-10-09 04:51:28'),
(320, 235, 'Audit Services', 4, '2025-10-09 04:51:28', '2025-10-09 04:51:28'),
(321, 241, 'Employment Visa', 0, '2025-10-09 04:51:28', '2025-10-09 04:51:28'),
(322, 241, 'Investor Visa', 1, '2025-10-09 04:51:28', '2025-10-09 04:51:28'),
(323, 241, 'Family Visa', 2, '2025-10-09 04:51:28', '2025-10-09 04:51:28'),
(324, 241, 'Golden Visa', 3, '2025-10-09 04:51:28', '2025-10-09 04:51:28'),
(325, 241, 'Residency & Permits', 4, '2025-10-09 04:51:28', '2025-10-09 04:51:28'),
(326, 247, 'Car Rentals', 0, '2025-10-09 04:51:28', '2025-10-09 04:51:28'),
(327, 247, 'Chauffeur Services', 1, '2025-10-09 04:51:28', '2025-10-09 04:51:28'),
(328, 247, 'Airport Transfers', 2, '2025-10-09 04:51:28', '2025-10-09 04:51:28'),
(329, 247, 'Vehicle Registration / Renewal', 3, '2025-10-09 04:51:28', '2025-10-09 04:51:28'),
(330, 252, 'Short-Term Rentals', 0, '2025-10-09 04:51:28', '2025-10-09 04:51:28'),
(331, 252, 'Long-Term Leasing', 1, '2025-10-09 04:51:28', '2025-10-09 04:51:28'),
(332, 252, 'Buy or Sell Property', 2, '2025-10-09 04:51:28', '2025-10-09 04:51:28'),
(333, 252, 'Document Support', 3, '2025-10-09 04:51:28', '2025-10-09 04:51:28'),
(334, 257, 'Family Office Support', 0, '2025-10-09 04:51:28', '2025-10-09 04:51:28'),
(335, 257, 'Personal Concierge', 1, '2025-10-09 04:51:28', '2025-10-09 04:51:28'),
(336, 257, 'Lifestyle Management', 2, '2025-10-09 04:51:28', '2025-10-09 04:51:28'),
(337, 257, 'Travel & Event Planning', 3, '2025-10-09 04:51:28', '2025-10-09 04:51:28');

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

--
-- Dumping data for table `sessions`
--

INSERT INTO `sessions` (`id`, `user_id`, `ip_address`, `user_agent`, `payload`, `last_activity`) VALUES
('nM4jFeJw2O1Xao7899dhdwn54KksKpEeuZkVVJa5', NULL, '103.66.149.51', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiT1NUd3F2S29yblRuY3pSWmdMTllrS2l5Ukg2TENueDh6ZmZxWEMzciI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6NTI6Imh0dHBzOi8vY2hhdGZsb3ctY29tLnN0YWNrc3RhZ2luZy5jb20vYmFja2VuZC9wdWJsaWMiO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX19', 1759905366);

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
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

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
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=168;

--
-- AUTO_INCREMENT for table `questions`
--
ALTER TABLE `questions`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=263;

--
-- AUTO_INCREMENT for table `question_options`
--
ALTER TABLE `question_options`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=338;

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
