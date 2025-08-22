# ClubPulse AI Platform

## Overview

ClubPulse AI is a sophisticated, AI-powered web application for a premium health and wellness club. The platform serves three distinct user experiences: a public-facing website for lead generation, a secure member portal with personalized features, and a staff dashboard for member management and marketing campaigns. The application leverages Google Gemini AI to provide intelligent workout planning, retention strategies, and loyalty campaign generation.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18+ single-page application (SPA) using functional components and hooks
- **Routing**: React Router DOM with role-based protected routes for member and staff areas
- **Styling**: Tailwind CSS with a custom component library inspired by ShadCN UI design system
- **State Management**: Hybrid approach using React Context for global authentication state and local useState hooks for component-specific state
- **AI Integration**: Google Gemini API integration via @google/genai SDK for workout planning and business intelligence features

### Backend Architecture
- **Runtime**: Node.js with Express.js server framework
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Authentication**: Replit Auth integration with OpenID Connect for secure user authentication
- **Session Management**: Express sessions with PostgreSQL storage using connect-pg-simple
- **API Design**: RESTful API structure with role-based access control and comprehensive error handling

### Database Schema
- **Users Table**: Stores user profiles with role-based access (member/staff), membership types, and loyalty points
- **Loyalty System**: Dedicated tables for loyalty offers, redemptions, and point tracking
- **Member Management**: Tables for outreach actions, chat conversations, and workout plans
- **Session Storage**: PostgreSQL-backed session management for authentication persistence

### Authentication & Authorization
- **Authentication Provider**: Replit Auth with OpenID Connect protocol
- **Role-Based Access**: Two-tier system with "member" and "staff" roles
- **Protected Routes**: Client-side route protection with server-side API validation
- **Session Security**: HTTP-only cookies with secure session management

### AI Integration Architecture
- **Primary AI Provider**: Google Gemini API for all AI-powered features
- **Service Architecture**: Centralized AI service layer with mock fallbacks for development
- **AI Features**: 
  - Personalized workout plan generation with structured JSON responses
  - Member retention strategy generation with markdown formatting
  - Loyalty campaign creation with targeted offer generation
  - Public chatbot for lead generation and customer support

## External Dependencies

### Core Technologies
- **Database**: PostgreSQL via Neon serverless connection
- **AI Services**: Google Gemini API for all machine learning capabilities
- **Authentication**: Replit Auth system with OpenID Connect
- **UI Components**: Radix UI primitives for accessible component foundation
- **Development Tools**: Vite for build tooling and development server

### Third-Party Services
- **Neon Database**: Serverless PostgreSQL hosting with connection pooling
- **Google Gemini**: AI/ML service for natural language processing and content generation
- **Replit Platform**: Authentication, hosting, and development environment integration

### Key Libraries
- **Frontend**: React Query for server state management, Wouter for routing, React Hook Form for form handling
- **Backend**: Drizzle ORM for database operations, Passport.js for authentication middleware
- **Styling**: Tailwind CSS with class-variance-authority for component variants
- **Utilities**: Zod for schema validation, date-fns for date manipulation, various Radix UI components