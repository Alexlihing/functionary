const express = require("express");
const session = require("express-session");
const passport = require("./auth/googleAuth.js"); // Ensure your auth setup is correct
const cors = require("cors");
const { exec } = require("child_process");
const RAG = require("../backend/routes/pinecone");
const { dirAnalysis } = require("./utils/dirAnalysis.js");
require("dotenv").config();

const app = express();
app.use(express.json()); // ✅ Parse JSON requests

// ✅ Enable CORS for frontend communication
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ✅ Middleware for sessions
app.use(
  session({
    secret: process.env.SESSION_SECRET || "your_secret_key",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, httpOnly: true, sameSite: "lax" },
  })
);
app.use("/RAGservice", RAG);

// ✅ Initialize Passport for authentication
app.use(passport.initialize());
app.use(passport.session());

// ✅ Google OAuth Routes
app.get(
  "/api/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  (req, res) => {
    console.log("✅ User authenticated:", req.user);
    res.redirect("http://localhost:5173/dashboard");
  }
);

// ✅ Check if user is logged in
app.get("/api/auth/user", (req, res) => {
  if (req.isAuthenticated()) {
    res.json({ user: req.user });
  } else {
    res.json({ user: null });
  }
});

// ✅ Logout route
app.get("/api/logout", (req, res) => {
  req.logout((err) => {
    if (err) return res.status(500).json({ error: "Logout failed" });
    res.redirect("/");
  });
});

// ✅ Protect API Routes (Ensure User is Logged In)
const ensureAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({ error: "Unauthorized: Please log in" });
};

// ✅ API to select a directory (Returns full path using old GUI)
app.get("/api/select-directory", ensureAuthenticated, (req, res) => {
  let command;

  if (process.platform === "win32") {
    // ✅ Windows: Use PowerShell's Folder Picker
    command =
      'powershell -command "Add-Type -AssemblyName System.Windows.Forms; $f=New-Object System.Windows.Forms.FolderBrowserDialog; $f.ShowDialog(); $f.SelectedPath"';
  } else {
    // ✅ macOS: Use AppleScript's Folder Picker
    command = `osascript -e 'tell application "System Events" to return POSIX path of (choose folder as alias)'`;
  }

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error("❌ Error selecting directory:", error);
      return res.status(500).json({ error: "Failed to select directory" });
    }

    const cleanedPath = stdout.trim(); // ✅ Clean up the full path
    console.log("📁 Selected Directory Path:", cleanedPath);
    res.json({ path: cleanedPath });
  });
});

app.post("/api/dirAnalysis", (req, res) => {
  const files = req.body.files;
  console.log("📁 Directory Path for Analysis:", files);

  dirAnalysis(files);

  res.json({ message: `Directory ${files} analyzed successfully!` });
});

console.log(process.env.OPENAI_API_KEY);

// ✅ Start backend
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
