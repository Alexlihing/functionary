require("dotenv").config();
const express = require("express");
const session = require("express-session");
const passport = require("./auth/googleAuth.js");
const cors = require("cors");
const { exec } = require("child_process");

const app = express();

// Enable CORS for frontend development
app.use(cors({
  origin: "http://localhost:3000", // Make sure this matches your frontend URL
  credentials: true, // Allow cookies to be sent
}));

// Middleware for sessions
app.use(
  session({
    secret: "your_secret_key",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, // Set `true` if using HTTPS
  })
);

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Google OAuth Routes
app.get("/api/auth/google", (req, res, next) => {
  console.log("Google login route triggered");
  passport.authenticate("google", { scope: ["profile", "email"] })(req, res, next);
});

app.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/login",
  }),
  (req, res) => {
    res.redirect("http://localhost:3000"); // Redirect to frontend after login
  }
);

// Check if user is logged in
app.get("/api/auth/user", (req, res) => {
  if (req.isAuthenticated()) {
    res.json({ user: req.user });
  } else {
    res.json({ user: null });
  }
});

// Logout route
app.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) return next(err);
    res.redirect("/");
  });
});

// API to select directory (Windows/MacOS)
app.get("/api/select-directory", (req, res) => {
  let command;
  if (process.platform === "win32") {
    command =
      'powershell -command "Add-Type -AssemblyName System.Windows.Forms; $f=New-Object System.Windows.Forms.FolderBrowserDialog; $f.ShowDialog(); $f.SelectedPath"';
  } else {
    command =
      `osascript -e 'tell application "System Events" to return POSIX path of (choose folder as alias)'`;
  }

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error("❌ Error selecting directory:", error);
      return res.status(500).json({ error: "Failed to select directory" });
    }

    // ✅ Remove "OK\r\n" and trim whitespace
    const cleanedPath = stdout.replace(/^OK\r?\n/, "").trim();

    console.log("📁 Cleaned Selected Directory Path:", cleanedPath); // Debugging output
    res.json({ path: cleanedPath });
  });
});

// Start server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
