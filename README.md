# Paathshala: digital library for Class 9 to 12, JEE Main, NEET and UPSC

**New here? Open `SETUP_GUIDE.md` for the complete step-by-step setup.**

A search-and-browse learning portal in the style of NDLI's School Education section, built on MERN, plus quizzes, a practice-paper maker and an AI teacher.

## Features
- **Library search** with filters (class, subject, resource type, board, language, provider, year), sorting and paging
- **Browse** by subject, type, board, language, provider, year, with counts
- **Resource page** with details, "Open at source", optional in-page preview (PDF/YouTube where the source allows), related items
- **Accounts**: save resources, quiz history, recently viewed
- **Chapter quizzes** with explanations, **paper maker** (easy to hard, with solutions, printable), **AI teacher** (English/Hindi/Hinglish)
- **Admin panel**: add resources, subjects, chapters, questions, notes, and **bulk import from CSV** (resources and questions)
- Rate limiting, security headers, JWT auth, single-server production build

## Run locally (Node 18+, MongoDB)
```bash
cd server && cp .env.example .env     # set MONGO_URI, JWT_SECRET, ANTHROPIC_API_KEY
npm install && npm run seed && npm run dev      # API on :5000

cd ../client && npm install && npm run dev      # site on :5173
```
Make yourself admin: register on the site, then `cd server && npm run make-admin -- you@example.com`, log out and in.

## Fill the library
The seed only adds starter links. To build the real collection:
1. Admin > **Bulk import**, download the sample CSV, fill it in a spreadsheet, upload.
2. Resources must be **links** to the official page/file (NCERT, CBSE Academic, NIOS, DIKSHA, state boards, YouTube). Do not re-host copyrighted PDFs.
3. Questions import creates missing subjects and chapters automatically.

## Deploy (one server, e.g. Render or Railway) 
1. Create a free MongoDB Atlas cluster and copy the connection string.
2. Push this folder to GitHub, create a **Web Service**.
   - Build command: `npm run build`
   - Start command: `npm start`
3. Environment variables: `MONGO_URI`, `JWT_SECRET` (long random string), `ANTHROPIC_API_KEY`, `NODE_ENV=production`.
4. Open the URL, register, then make your account admin (run `npm run make-admin -- email` from the service shell, or use a one-off command).
5. Seed once if you want the starter links: `npm run seed`.

The Express server serves the built React app, so there is no CORS setup in production.

## Copyright
NCERT textbooks are free on ncert.nic.in; CBSE papers, publisher guides and coaching notes are copyrighted. Link to official sources and write your own notes and questions.
