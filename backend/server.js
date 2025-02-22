const express = require("express");
const cors = require("cors");
const { exec } = require("child_process");

const app = express();
app.use(cors());

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

const PORT = 5000;
app.listen(PORT, () => console.log(`✅ Backend running on http://localhost:${PORT}`));
