require("dotenv").config(); //.env 파일에서 환경 변수 로딩
const express = require("express");
const path = require("path");

const session = require("express-session");
const pgSession = require("connect-pg-simple")(session);

const pool = require("./db"); // db.js 불러오기
const bcrypt = require("bcrypt");
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
//public 폴더를 정적 파일 경로로 지정(html, css, js 등이 있음)
app.use(express.static(path.join(__dirname, "public")));

app.use(
  session({
    store: new pgSession({ pool, tableName: "user_sessions", createTableIfMissing: true }),
    secret: process.env.SESSION_SECRET || "dev-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 7,
      sameSite: process.env.NODE_ENV === "production" ? "lax" : "lax",
      secure: process.env.NODE_ENV === "production", // HTTPS에서만
    },
  })
);

function getUserId(req) {
  return req.session?.userId ?? null;
}

// 인증 필요 미들웨어
function requireAuth(req, res, next) {
  if (getUserId(req)) return next();
  return res.status(401).json({ error: "NO_SESSION" });
}

// 공통: 결과를 { [category]: Task[] }로 묶기
function groupByCategory(rows) {
  const grouped = {};
  for (const t of rows) {
    const cat = t.category || "todolist";
    (grouped[cat] ??= []).push(t);
  }
  return grouped;
}

// (원하면 나중에) ALTER TABLE tasks ADD COLUMN created_at TIMESTAMP NOT NULL DEFAULT NOW();
const SELECT_BASE = `
  SELECT id, text, completed, important, due_date AS "dueDate", category
  FROM tasks
  ORDER BY id ASC
`;

function getTodayString() {
  return new Date().toISOString().split("T")[0];
}

//메인 페이지(라우팅 REST API)
//GET
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

async function buildGroupedTodos(uid) {
  const grouped = {};

  const { rows: cats } = await pool.query(
    `SELECT name FROM categories WHERE user_id = $1 ORDER BY created_at ASC, name ASC`,
    [uid]
  );
  for (const { name } of cats) grouped[name] = [];

  const { rows } = await pool.query(
    `SELECT id, text, completed, important, due_date AS "dueDate", category
     FROM tasks
     WHERE user_id = $1
     ORDER BY created_at ASC, id ASC`,
    [uid]
  );
  for (const t of rows) {
    const c = t.category || "todolist";
    (grouped[c] ??= []).push(t);
  }

  for (const c of ["todolist", "today"]) {
    if (!grouped[c]) grouped[c] = [];
  }
  return grouped;
}

// 전체 할 일 조회
app.get("/api/todos", requireAuth, async (req, res) => {
  try {
    const uid = getUserId(req);
    if (!uid) return res.status(401).json({ error: "NO_SESSION" });

    const { rows: cats } = await pool.query(
      `SELECT name FROM categories WHERE user_id=$1 ORDER BY created_at ASC, name ASC`,
      [uid]
    );
    const grouped = {};
    for (const { name } of cats) grouped[name] = [];

    const { rows } = await pool.query(
      `SELECT id, text, completed, important, due_date AS "dueDate", category
       FROM tasks WHERE user_id=$1 ORDER BY created_at ASC, id ASC`,
      [uid]
    );
    for (const t of rows) (grouped[t.category] ??= []).push(t);

    // 기본 카테고리 보강
    for (const base of ["todolist", "today"]) if (!grouped[base]) grouped[base] = [];

    res.json(grouped);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "DB 조회 실패", detail: e.message });
  }
});

// 새 카테고리 추가
app.post("/addCategory", requireAuth, async (req, res) => {
  try {
    const uid = getUserId(req); // ✅ 세션 id
    const { category } = req.body;
    if (!category) return res.status(400).json({ error: "카테고리 이름 필요" });

    await pool.query(
      `INSERT INTO categories (user_id, name)
       VALUES ($1, $2)
       ON CONFLICT (user_id, name) DO NOTHING`,
      [uid, category]
    );

    const grouped = await buildGroupedTodos(uid); // ✅ 최신 상태 반환
    res.json(grouped);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "카테고리 추가 실패" });
  }
});

// 할 일 추가
app.post("/addTask", requireAuth, async (req, res) => {
  try {
    const uid = getUserId(req);
    if (!uid) return res.status(401).json({ error: "NO_SESSION" });

    const { add, category, dueDate } = req.body;
    if (!add || !category) return res.status(400).json({ error: "BAD_REQUEST" });
    if (["completed", "important"].includes(category)) return res.status(400).json({ error: "VIRTUAL_CAT" });

    // 카테고리 보장
    await pool.query(
      `INSERT INTO categories (user_id, name)
       VALUES ($1, $2)
       ON CONFLICT (user_id, name) DO NOTHING`,
      [uid, category]
    );

    await pool.query(
      `INSERT INTO tasks (user_id, text, completed, important, due_date, category)
       VALUES ($1, $2, false, false, $3, $4)`,
      [uid, add.trim(), dueDate || null, category]
    );

    // 최신 목록 반환 (user_id로 필터)
    const { rows: cats } = await pool.query(
      `SELECT name FROM categories WHERE user_id=$1 ORDER BY created_at ASC, name ASC`,
      [uid]
    );
    const grouped = {};
    for (const { name } of cats) grouped[name] = [];

    const { rows } = await pool.query(
      `SELECT id, text, completed, important, due_date AS "dueDate", category
       FROM tasks WHERE user_id=$1 ORDER BY created_at ASC, id ASC`,
      [uid]
    );
    for (const t of rows) (grouped[t.category] ??= []).push(t);

    res.json(grouped);
  } catch (e) {
    console.error("addTask error:", e);
    res.status(500).json({ error: "DB 추가 실패", detail: e.message });
  }
});

//할 일 삭제
app.post("/deleteTask", requireAuth, async (req, res) => {
  const { id } = req.body;
  const userId = getUserId(req);
  if (!id || !userId) return res.status(400).send("id/userId 필요");
  try {
    await pool.query(`DELETE FROM tasks WHERE id = $1 AND user_id = $2`, [id, userId]);
    const { rows } = await pool.query(
      `SELECT id, text, completed, important, due_date AS "dueDate", category
       FROM tasks WHERE user_id = $1 ORDER BY created_at ASC, id ASC`,
      [userId]
    );
    const grouped = {};
    for (const t of rows) (grouped[t.category] ??= []).push(t);
    res.json(grouped);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "DB 조회 실패", detail: String(e.message || e) });
  }
});

//완료/미완료 토글
app.post("/toggleComplete", requireAuth, async (req, res) => {
  const { id } = req.body;
  const userId = getUserId(req);
  if (!id || !userId) return res.status(400).send("id/userId 필요");
  try {
    await pool.query(`UPDATE tasks SET completed = NOT completed WHERE id = $1 AND user_id = $2`, [id, userId]);
    const { rows } = await pool.query(
      `SELECT id, text, completed, important, due_date AS "dueDate", category
       FROM tasks WHERE user_id = $1 ORDER BY created_at ASC, id ASC`,
      [userId]
    );
    const grouped = {};
    for (const t of rows) (grouped[t.category] ??= []).push(t);
    res.json(grouped);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "DB 조회 실패", detail: String(e.message || e) });
  }
});

//중요 토글
app.post("/toggleImportant", requireAuth, async (req, res) => {
  const { id } = req.body;
  const userId = getUserId(req);
  if (!id || !userId) return res.status(400).send("id/userId 필요");
  try {
    await pool.query(`UPDATE tasks SET important = NOT important WHERE id = $1 AND user_id = $2`, [id, userId]);
    const { rows } = await pool.query(
      `SELECT id, text, completed, important, due_date AS "dueDate", category
       FROM tasks WHERE user_id = $1 ORDER BY created_at ASC, id ASC`,
      [userId]
    );
    const grouped = {};
    for (const t of rows) (grouped[t.category] ??= []).push(t);
    res.json(grouped);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "DB 조회 실패", detail: String(e.message || e) });
  }
});

//텍스트 수정
app.post("/editTask", requireAuth, async (req, res) => {
  const { id, newText } = req.body;
  const userId = getUserId(req);
  if (!id || !newText || !newText.trim() || !userId) {
    return res.status(400).send("잘못된 요청");
  }
  try {
    await pool.query(`UPDATE tasks SET text = $1 WHERE id = $2 AND user_id = $3`, [newText.trim(), id, userId]);
    const { rows } = await pool.query(
      `SELECT id, text, completed, important, due_date AS "dueDate", category
       FROM tasks WHERE user_id = $1 ORDER BY created_at ASC, id ASC`,
      [userId]
    );
    const grouped = {};
    for (const t of rows) (grouped[t.category] ??= []).push(t);
    res.json(grouped);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "DB 조회 실패", detail: String(e.message || e) });
  }
});

app.get("/health/db", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.send("DB OK");
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "DB 조회 실패", detail: String(e.message || e) });
  }
});

// 회원가입 (username + name + password [+ email 옵션])
app.post("/auth/register", async (req, res) => {
  try {
    const { username, name, password, email } = req.body;
    if (!username || !name || !password) {
      return res.status(400).send("아이디, 이름, 비밀번호는 필수입니다.");
    }

    const dup = await pool.query(`SELECT 1 FROM users WHERE username=$1`, [username]);
    if (dup.rowCount > 0) return res.status(409).send("이미 존재하는 아이디입니다.");

    const hash = await bcrypt.hash(password, 10);
    const { rows } = await pool.query(
      `INSERT INTO users (username, name, password_hash, email)
       VALUES ($1, $2, $3, $4)
       RETURNING id, username, name`,
      [username, name, hash, email ?? null]
    );

    req.session.userId = rows[0].id; //userId만 저장

    res.json({ ok: true, user: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).send("회원가입 서버 오류");
  }
});

// 로그인 (username + password)
app.post("/auth/login", async (req, res) => {
  try {
    const { username, password } = req.body || {};
    if (!username || !password) return res.status(400).json({ error: "아이디/비밀번호 필요" });

    const { rows } = await pool.query(`SELECT id, username, name, password_hash FROM users WHERE username=$1`, [
      username,
    ]);
    const u = rows[0];
    if (!u) return res.status(401).json({ error: "존재하지 않는 계정" });

    const ok = await bcrypt.compare(password, u.password_hash);
    if (!ok) return res.status(401).json({ error: "비밀번호 불일치" });

    req.session.userId = u.id; // ✅ 세션은 userId만
    res.json({ user: { id: u.id, username: u.username, name: u.name } });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "로그인 실패" });
  }
});

//프로필
app.get("/auth/me", async (req, res) => {
  const uid = getUserId(req);
  if (!uid) return res.json({ user: null });
  const { rows } = await pool.query(`SELECT id, username, name FROM users WHERE id=$1`, [uid]);
  res.json({ user: rows[0] || null });
});

// 로그아웃
app.post("/auth/logout", (req, res) => {
  req.session.destroy(() => {
    res.clearCookie("connect.sid");
    res.json({ ok: true });
  });
});

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
