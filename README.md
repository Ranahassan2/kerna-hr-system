# Kerna - Intelligent HR Management System

![React](https://img.shields.io/badge/React-19.0.0-blue?style=for-the-badge&logo=react)
![Vite](https://img.shields.io/badge/Vite-8.0.0-purple?style=for-the-badge&logo=vite)
![Supabase](https://img.shields.io/badge/Supabase-Backend_as_a_Service-green?style=for-the-badge&logo=supabase)

## Overview
**Kerna HR System** is a next-generation Human Resources Management application tailored specifically for modern architectural and civil engineering enterprises. Built with cutting-edge web technologies, it streamlines employee management, unifies administrative workflows, and fosters seamless communication between HR departments and engineering staff.

## Core Features

### For HR Administrators
- **Comprehensive Dashboard:** A bird's-eye view of all organizational metrics.
- **Employee Lifecycle Management:** Effortlessly onboard new engineering talent with the `AddEmployeeModal`.
- **Deduction & Payroll Tracking:** Manage financial adjustments and deductions transparently using the `DeductionModal`.
- **Request Resolution:** Review, approve, or reject employee leave and administrative requests systematically.
- **Performance Reviews:** Conduct and log periodic evaluations using the `ReviewModal`.

### For Employees
- **Personalized Portal:** Employees can securely log in to track their employment status, view deductions, and submit formal requests directly to the HR department.
- **Real-time Feedback:** Integrated toast notifications ensure users are immediately informed about the status of their actions.

## Technical Architecture

This project is built on a highly optimized, modern React stack designed for scalability and rapid iterations:

- **Frontend Framework:** React 19 powered by Vite for lightning-fast Hot Module Replacement (HMR) and optimized production builds.
- **State Management:** Context API (`AppProvider`) ensuring a predictable and centralized application state.
- **Backend & Database:** Supabase, offering robust PostgreSQL database capabilities, real-time subscriptions, and secure authentication.
- **Styling:** Vanilla CSS customized for a premium, responsive, and glassmorphism-inspired aesthetic.
- **Linting:** Oxc (oxlint) for ultra-fast, Rust-based static code analysis.

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Ranahassan2/kerna-hr-system.git
   cd kerna-hr-system
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Setup:**
   Create a `.env` file in the root directory and configure your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Run the Development Server:**
   ```bash
   npm run dev
   ```
   Open your browser and navigate to `http://localhost:5173`.

## Security
- **Environment Variables:** All sensitive backend credentials (Supabase keys) are securely managed via environment variables and excluded from version control.
- **Authentication:** Secure user login flows managed directly through Supabase Auth.

---
*Designed & Developed with precision for Kerna Engineering.*
