# Paathshala: complete setup guide for your PC

From a blank Windows PC to a working website, then online. Allow about 45 minutes for the first run.
Commands are for **Windows** (Command Prompt or PowerShell). Mac and Linux notes are in the boxes marked *Mac/Linux*.

---

## What you will have at the end

- A website at `http://localhost:5173` on your PC with: library search, browse, quizzes, paper maker, AI teacher, login, saved items
- Classes 9, 10, 11, 12 and JEE Main, NEET, UPSC
- An admin panel to add content, including CSV bulk import
- Terms and Conditions, Privacy Policy and Disclaimer pages

## What is inside the project folder

```
paathshala/
  server/          the backend (Node + Express + MongoDB)
    .env.example   settings template (you copy it to .env)
    seed.js        loads starter data
    makeAdmin.js   makes an account an admin
  client/          the website (React)
    src/site.js    YOUR name, email, address (edit this first)
    src/styles.css colours and design
  SETUP_GUIDE.md   this guide
```

---

## Part 1. Install the software

### 1.1 Node.js (required)
1. Go to **nodejs.org** and download the **LTS** version (the green button).
2. Run the installer. Keep every default option and click Next until Finish.
3. **Close and reopen** any Command Prompt windows.
4. Check it worked. Open Command Prompt and type:
   ```
   node -v
   npm -v
   ```
   You should see version numbers. Node must be **18 or higher**.

### 1.2 Visual Studio Code (recommended)
Download from **code.visualstudio.com** and install. It makes editing files and opening a terminal easy.

### 1.3 A database: choose ONE option

**Option A. MongoDB Atlas (cloud, free). Recommended.** No install on your PC, and the same database works later when you put the site online.

1. Go to **mongodb.com/atlas** and create a free account.
2. Create a **free (M0) cluster**. Choose the region closest to you (Mumbai if offered).
3. When asked to create a database user: choose a username and a password. **Use only letters and numbers in the password** (special characters cause trouble later). Write both down.
4. Under **Network Access**, click **Add IP Address**, then **Allow access from anywhere** (`0.0.0.0/0`). This is needed so your PC and, later, your hosting service can connect.
5. Go to **Database**, click **Connect**, then **Drivers**. Copy the connection string. It looks like:
   ```
   mongodb+srv://myuser:<password>@cluster0.abcde.mongodb.net/?retryWrites=true&w=majority
   ```
6. Replace `<password>` with your password, and add the database name `paathshala` before the `?`:
   ```
   mongodb+srv://myuser:MyPass123@cluster0.abcde.mongodb.net/paathshala?retryWrites=true&w=majority
   ```
   Keep this line. You will paste it in Part 3.

**Option B. MongoDB on your PC.**
1. Go to **mongodb.com/try/download/community**, pick Windows, and download the MSI installer.
2. Run it. Choose **Complete**. Keep "Install MongoDB as a Service" ticked. Tick **MongoDB Compass** (a window to view your data).
3. Your connection string is simply:
   ```
   mongodb://127.0.0.1:27017/paathshala
   ```
   The database starts automatically with Windows.

---

## Part 2. Put the project on your PC

1. Unzip `paathshala.zip` to a simple path such as **`C:\paathshala`**. Avoid long paths and OneDrive or Desktop folders.
2. Open **VS Code**, choose **File, Open Folder**, and select `C:\paathshala`.
3. Open the terminal inside VS Code: **Terminal, New Terminal**. If PowerShell shows a red "scripts are disabled" error when you run `npm`, either switch the terminal to **Command Prompt** (the small down arrow next to the plus), or run this once and then retry:
   ```
   Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
   ```

---

## Part 3. Configure the server

1. In the terminal:
   ```
   cd server
   copy .env.example .env
   ```
   *Mac/Linux:* `cp .env.example .env`
2. Open the new file **`server/.env`** in VS Code and fill it in:

   | Setting | What to put |
   |---|---|
   | `PORT` | leave as `5000` |
   | `MONGO_URI` | your connection string from Part 1.3 |
   | `JWT_SECRET` | a long random text (see below) |
   | `ANTHROPIC_API_KEY` | key for the AI teacher (see below). Leave empty to switch the AI teacher off for now |
   | `ANTHROPIC_MODEL` | leave as it is |
   | `CLIENT_URL` | leave as `http://localhost:5173` |

3. **Make a JWT secret.** In the terminal run:
   ```
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
   Copy the long text it prints and paste it after `JWT_SECRET=`. Never share it.

4. **Get an AI key (optional but recommended).**
   - Go to **console.anthropic.com**, create an account, add a small amount of credit, and create an API key.
   - Paste it after `ANTHROPIC_API_KEY=`.
   - **Set a monthly spending limit** in the console. The AI teacher costs money for every question students ask. The site already limits each visitor to 40 AI questions per hour.

---

## Part 4. Install and start everything

You need **two terminals** open at the same time (use the plus button in VS Code's terminal).

**Terminal 1: the server**
```
cd C:\paathshala\server
npm install
npm run seed
npm run dev
```
- `npm install` downloads the tools (takes a minute).
- `npm run seed` adds starter data (subjects, JEE Main chapters, links, sample questions). **Run it only once**, because it clears resources, subjects, chapters and questions each time.
- `npm run dev` starts the server. You should see: `Paathshala running on port 5000`.

**Terminal 2: the website**
```
cd C:\paathshala\client
npm install
npm run dev
```
It prints a link. Open **http://localhost:5173** in your browser. You should see the orange Paathshala home page.

To stop either one, click in its terminal and press **Ctrl + C**. To start again later, you only need `npm run dev` in each folder.

---

## Part 5. Make yourself the admin

1. On the website click **Log in**, then **Create a free account**, tick the agreement and register.
2. In Terminal 1, stop the server (Ctrl + C), then run:
   ```
   npm run make-admin -- youremail@example.com
   ```
   (use the email you registered with), then start the server again with `npm run dev`.
3. On the website, **log out and log in again**. An **Admin** link now appears in the top menu.

---

## Part 6. Make the site yours

1. Open **`client/src/site.js`** and replace everything in [square brackets]: your name or company, email, address, city and the Grievance Officer's name. The footer, Terms, Privacy Policy and Disclaimer all update automatically.
2. Open `/terms` and `/privacy` on your site. A yellow "Draft" box shows until all brackets are replaced.
3. **Get a lawyer to review the legal pages before launch.** Your users are mostly under 18, and India's Digital Personal Data Protection Act, 2023 has specific rules for children's data, including parental consent. The pages are a good starting draft, not legal advice.
4. To change colours, open `client/src/styles.css` and edit the values at the top (`--saffron` is the main orange).
5. To change the name, edit `name` in `site.js`.

---

## Part 7. Fill the library with content

The starter data is only a sample. Use **Admin, Bulk import**. Do the imports in this order.

### Step 1. Syllabus (chapters), especially Class 9 and Class 11
Class 9 and Class 11 come with subjects but **no chapter lists**. NCERT revised the Class 9 books for 2026-27 and different websites list different chapters, so copy them from the official source:
- CBSE syllabus: **cbseacademic.nic.in** (Curriculum, then Class 9 or 11)
- Textbook contents: **ncert.nic.in/textbook.php** (the contents page of each book)

In Excel or Google Sheets, make columns `level, subject, chapter_no, chapter`:
```
level,subject,chapter_no,chapter
11,Physics,1,Units and Measurements
11,Physics,2,Motion in a Straight Line
```
Save as **CSV UTF-8**. In Admin, Bulk import, choose **Syllabus (subjects and chapters)** and upload.

**JEE Main** chapters for Physics, Chemistry and Mathematics are already included (based on the NTA syllabus, which follows NCERT Class 11 and 12). NTA publishes the syllabus with each year's information bulletin, so check **jeemain.nta.ac.in** and add or fix chapters in Admin, Subjects and chapters.

### Step 2. Library resources (books, notes, papers, videos)
Choose **Library resources**, click **Download sample CSV**, fill it in and upload. Rules:
- `level` can be 9, 10, 11, 12, JEE, NEET or UPSC
- `type` can be book, notes, paper, solution, video or worksheet
- `url` must start with https:// and should link to the **official** page or file. Do not copy other people's PDFs onto your site
- Importing the same file again updates items instead of duplicating them

### Step 3. Questions for quizzes and papers
Choose **Quiz and paper questions**, download the sample, fill in and upload. Subjects and chapters that do not exist are created automatically. For multiple-choice rows put the correct option in the `correct` column as A, B, C or D. Write your own questions or use properly licensed ones.

Each import handles up to 2,000 rows. The result screen lists any rows that were skipped and why.

---

## Part 8. Test everything (10 minutes)

- [ ] Home page loads and the class buttons change the subject tiles
- [ ] Searching "science" returns results; filters on the left work
- [ ] A resource page opens; "Open at source" goes to the official site
- [ ] You can Save a resource and see it in **My library**
- [ ] A chapter quiz runs and shows explanations
- [ ] The paper maker makes a paper and Print works
- [ ] The AI teacher answers (needs the API key)
- [ ] Terms, Privacy and Disclaimer pages open from the footer
- [ ] On your phone (same Wi-Fi) the site works at `http://YOUR-PC-IP:5173`
- [ ] Admin: add one resource, then delete it

---

## Part 9. Run it as one "production" site on your PC (optional)

This builds the website and serves it from the server alone, the way it will run online.
```
cd C:\paathshala
npm run build
npm start
```
Open **http://localhost:5000**. Your PC must stay on for others to reach it, so for real users use Part 10.

---

## Part 10. Put it online

You need: your MongoDB Atlas database (Part 1.3, Option A), a free **GitHub** account, and a **Render** account (render.com). Railway works in a similar way.

### 10.1 Upload the project to GitHub
1. Install **Git** from git-scm.com. Create a **private** repository on github.com.
2. In the project folder:
   ```
   cd C:\paathshala
   git init
   git add .
   git commit -m "Paathshala"
   git branch -M main
   git remote add origin https://github.com/YOURNAME/paathshala.git
   git push -u origin main
   ```
   The `.gitignore` file keeps your secret `.env` out of GitHub. Never upload `.env`.

### 10.2 Create the service on Render
1. In Render choose **New, Web Service**, and connect your GitHub repository.
2. Settings:
   - **Build Command:** `npm run build`
   - **Start Command:** `npm start`
3. Under **Environment**, add: `MONGO_URI`, `JWT_SECRET`, `ANTHROPIC_API_KEY`, `ANTHROPIC_MODEL`, and `NODE_ENV` = `production`.
4. Click **Create Web Service**. After a few minutes you get a link like `https://paathshala.onrender.com`.

Free Render services go to sleep when unused, so the first visit after a quiet period is slow. A paid plan keeps it awake.

### 10.3 Admin and data for the online site
Because your local `server/.env` already points to the **same Atlas database**, you can run `npm run seed` and `npm run make-admin -- email` from your PC and the online site sees the result at once.

### 10.4 Your own domain
Buy a domain (for example a .in name) from any registrar. In Render open your service, **Settings, Custom Domains**, add it and follow the DNS instructions. HTTPS is set up for you automatically.

---

## Part 11. Before you tell students about it

- [ ] All [brackets] in `site.js` replaced; legal pages reviewed by a lawyer
- [ ] Sample seed data replaced with your real content (re-run no seeds after you add content)
- [ ] Strong, unique `JWT_SECRET` set online
- [ ] Spending limit set on the AI key
- [ ] Every link in the library checked and pointing to an official source
- [ ] Atlas **backups** switched on, or a regular `mongodump` saved
- [ ] A working email at the address you wrote in `site.js`
- [ ] Your own admin account password is strong

---

## Troubleshooting

| What you see | What to do |
|---|---|
| `'npm' is not recognized` | Install Node.js again, then close and reopen the terminal |
| PowerShell says running scripts is disabled | Use Command Prompt, or run `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` |
| Server prints `Set MONGO_URI and JWT_SECRET` | The `.env` file is missing or empty. It must be in the `server` folder and named exactly `.env` |
| `ECONNREFUSED 127.0.0.1:27017` | Local MongoDB is not running. Start the "MongoDB" service, or use Atlas |
| `bad auth` or `ENOTFOUND` with Atlas | Wrong password or username in `MONGO_URI`; a password with symbols; or Network Access does not allow your IP |
| Website loads but shows no data or "Request failed" | The server (Terminal 1) is not running |
| `EADDRINUSE` / port already in use | Another program uses port 5000 (on a Mac, AirPlay does). Change `PORT` in `.env` and the `proxy` address in `client/vite.config.js` to the same number |
| "AI Teacher is not configured" | Add `ANTHROPIC_API_KEY` to `server/.env` and restart the server |
| "Admin access only" | Run `npm run make-admin -- your@email`, then log out and log in |
| CSV import says rows were skipped | Read the reasons listed. Common: wrong `level`, `type`, or a link not starting with https:// |
| Strange characters in imported CSV | Save from Excel as **CSV UTF-8** |
| Library is empty | Run `npm run seed` once, or import your own CSV |
| Changed `.env` but nothing changed | Stop the server (Ctrl + C) and start it again |

## Daily commands

| Task | Command (run inside the folder shown) |
|---|---|
| Start the server | `server`: `npm run dev` |
| Start the website | `client`: `npm run dev` |
| Make someone admin | `server`: `npm run make-admin -- email` |
| Build for production | project folder: `npm run build` |
| Run production build | project folder: `npm start` |

Good luck. Start with Part 1 and do not skip the testing in Part 8.
