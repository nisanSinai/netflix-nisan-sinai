import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { getMovies } from "./db.js";
import { validateUrl } from "./validateUrl.js";
// const { getMovies } = require("./db");
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

// —— יצירת "דאטה״ מזויפת של סרטים ——

// עזרתון קטן ל"שינה" כדי לדמות רשת איטית
const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

// GET /api/movies?page=1&limit=20&search=...
app.get("/api/movies", async (req, res) => {
  // דמו מציאותית: השהייה קצרה
  await sleep(400 + Math.floor(Math.random() * 400));

  const page = Math.max(parseInt(req.query.page || "1", 10), 1);
  const limit = Math.min(
    Math.max(parseInt(req.query.limit || "20", 10), 1),
    100
  );
  const search = (req.query.search || "").toString().trim().toLowerCase();

  const results = await getMovies(page, limit, search);

  results.data = await Promise.all(
    results.data.map(async (movie) => {
      movie.poster = await validateUrl(movie.poster);
      // וידוא שה-URL של הפוסטר תקין, אחרת להחליף ב-placeholder
      // movie.poster = await validateUrl(movie.poster);
      return movie;
    })
  );

  res.json({
    page: results.page,
    limit: results.limit,
    total: results.total,
    totalPages: results.totalPages,
    items: results.data,
  });
});

// —— פריסה לפרודקשן: הגשת ה-React מהשרת ——
// נניח שהבנייה של הקליינט נמצאת ב client/dist
const clientDist = path.join(__dirname, "../client/dist");
app.use(express.static(clientDist));
app.get("*", (req, res) => {
  res.sendFile(path.join(clientDist, "index.html"));
});

const PORT = process.env.PORT || 5000; // בחר פורט נפרד מ-5173 של Vite
app.listen(PORT, () =>
  console.log(`API + Static server listening on http://localhost:${PORT}`)
);
