AI-Powered Collaborative Knowledge Hub (MERN + Gemini)

A full-stack MERN application enhanced with Google Gemini AI, enabling teams to create, manage, and search knowledge documents with AI-powered summaries, intelligent tags, semantic search, and Q&A capabilities.

🚀 Features
🔐 Authentication & Roles

Email/password authentication using JWT.

Roles:

User → can create, edit, and delete their own documents.

Admin → can edit/delete any document.

📄 Document Management

CRUD operations for documents with fields:
title, content, tags, summary, createdBy, createdAt, updatedAt.

AI-Powered Enhancements:

Automatic summaries on creation.

Intelligent tag generation.

🔍 Search & AI

Regular text-based search.

Semantic search using embeddings (Gemini AI).

Team Q&A: Ask questions, Gemini answers using stored docs as context.

💡 Frontend

Pages:

Login/Register

Dashboard → list of docs

Add/Edit Doc → input title + content

Search Page → regular + semantic results

UI Features:

Each doc card shows title, summary, tags, and author.

Actions:

“Summarize with Gemini”

“Generate Tags with Gemini”

Tag-based filtering (chip-style UI).

Team Q&A tab → Ask AI-powered questions.

🛠 Extra (Optional but Implemented)

Versioning:

Each edit stores a new version.

Document history modal with version + timestamp.

Collaboration Hint:

Sidebar activity feed showing last 5 edited docs and editors.

🏗️ Tech Stack

Frontend: React, TailwindCSS (or your styling choice)

Backend: Node.js, Express.js

Database: MongoDB (Mongoose)

AI Integration: Google Gemini API (@google/generative-ai)

Auth: JWT (JSON Web Tokens)
