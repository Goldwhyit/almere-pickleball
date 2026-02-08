const express = require("express");
const { Pool } = require("pg");

const app = express();
const port = 3000;

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

app.get("/", async (req, res) => {
  const result = await pool.query("SELECT NOW()");
  res.json({
    status: "ok",
    time: result.rows[0],
  });
});

app.get("/api/docs", (req, res) => {
  res.json({
    message: "API draait",
    endpoints: ["/", "/api/docs"],
  });
});

app.listen(port, () => {
  console.log(`Backend draait op http://localhost:${port}`);
});
