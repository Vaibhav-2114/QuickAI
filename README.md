# QuickAI

QuickAI is an AI-powered content generation and productivity platform built for creators, marketers, and job seekers. It combines a modern React frontend with an Express backend to provide tools for generating articles, blog titles, images, and resume feedback using AI services and cloud-based utilities.

## Overview

QuickAI is designed to streamline content creation workflows with a clean dashboard experience and secure access control. Users can log in, explore AI-powered tools, publish creations to the community, and review their historical work from a single application.

The platform includes:

- AI article writing
- Blog title generation
- AI image generation
- Background removal from images
- Object removal from images
- Resume review and improvement suggestions
- User creation history and publishing features

## Tech Stack

### Frontend
- React 19
- Vite
- React Router
- Tailwind CSS
- Lucide React icons
- Axios
- React Hot Toast

### Backend
- Node.js
- Express 5
- PostgreSQL via Neon serverless
- Clerk authentication
- Cloudinary media storage
- OpenAI-compatible Gemini API integration
- Multer for file uploads
- Cloudflare Worker compatibility for server deployment

## Features

### AI Article Generator
Generate complete articles from a topic or prompt with configurable length targets, helping users create polished blog posts and long-form content quickly.

### Blog Title Generator
Create multiple engaging blog title ideas for a keyword and category in a single request.

### AI Image Generation
Generate images from text prompts for premium users using external image generation APIs and securely store them in Cloudinary.

### Image Editing Tools
- Remove background from uploaded images
- Remove selected objects from images
- Save generated media for user workflows

### Resume Review
Upload a resume PDF, extract its text, and receive structured feedback on strengths, weaknesses, and actionable recommendations.

### Community and Dashboard
Users can access their creation history, publish visual results, like content, and track usage from the dashboard.

## Project Structure

```text
QuickAI/
├── client/                  # React frontend application
│   ├── public/
│   ├── src/
│   ├── package.json
│   ├── vite.config.js
│   ├── eslint.config.js
│   └── index.html
│
├── server/                 # Express backend API
│   ├── configs/
│   ├── controllers/
│   ├── middleware/
│   ├── routes/
│   ├── utils/
│   ├── server.js
│   ├── package.json
│   ├── schema.sql
│   └── wrangler.jsonc
│
├── .gitignore
├── README.md
└── package.json (if present in your local setup)
```

## Getting Started

### Prerequisites

Make sure you have the following installed:

- Node.js 18+
- npm or yarn
- A database connection string for Neon
- API keys for Gemini, Cloudinary, and other external services
- Clerk project credentials

### 1. Clone the repository

```bash
git clone https://github.com/Vaibhav-2114/QuickAI.git
cd QuickAI
```

### 2. Install frontend dependencies

```bash
cd client
npm install
```

### 3. Install backend dependencies

```bash
cd ../server
npm install
```

### 4. Configure environment variables

Create a `.env` file in the `server` directory with the following values:

```env
DATABASE_URL=your_neon_database_url
GEMINI_API_KEY=your_google_gemini_api_key
CLERK_SECRET_KEY=your_clerk_secret_key
CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
CLIPDROP_API_KEY=your_clipdrop_api_key
```

For the frontend, set the base URL used by the client app:

```env
# client/.env
VITE_BASE_URL=http://localhost:3000
```

### 5. Start the backend

```bash
cd server
npm run server
```

The backend API runs on:

```text
http://localhost:3000
```

### 6. Start the frontend

```bash
cd client
npm run dev
```

The UI will run in Vite's development mode, typically at:

```text
http://localhost:5173
```

## Available Scripts

### Client

```bash
npm run dev
npm run build
npm run preview
npm run lint
```

### Server

```bash
npm run server
npm start
```

## Core Backend Flow

The server exposes authenticated routes under `/api` and uses middleware to enforce access control and premium checks.

Examples:

- `/api/ai/generate-article`
- `/api/ai/generate-blog-title`
- `/api/ai/generate-image`
- `/api/ai/remove-image-background`
- `/api/ai/remove-image-object`
- `/api/ai/resume-review`
- `/api/user/get-user-creations`
- `/api/user/get-published-creations`

## Authentication and Access Control

QuickAI integrates with Clerk for identity management and role-aware access checks. The backend middleware verifies users and determines whether they are on a premium plan before allowing premium-only features such as AI image generation and resume review.

## Data and Media

- Database: Neon PostgreSQL
- Media storage: Cloudinary
- AI generation: Gemini via OpenAI-compatible endpoint
- File processing: Multer and unpdf for PDF extraction

## Deployment Notes

The server is structured to support deployment in environments compatible with Node.js and Cloudflare Worker-style runtime adapters. The repository includes Wrangler configuration for worker deployment scenarios.

## License

This project currently does not include a custom license file. Please check with the repository owner before production use or redistribution.

## Contributing

Contributions are welcome. To contribute:

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Open a pull request with a clear description of the update

## Contact

For questions or support regarding the project, visit the GitHub repository:

https://github.com/Vaibhav-2114/QuickAI

## Summary

QuickAI is a complete AI content platform that brings together generation, editing, authentication, dashboard tracking, and publishing in a single application. It is ideal for teams and creators who want an all-in-one workspace for AI-assisted content production.
