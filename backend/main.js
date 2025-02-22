const { app, BrowserWindow, dialog } = require("electron");
const express = require("express");
const cors = require("cors"); // Optional, for easier development
const path = require("path");

const createServer = () => {
  const server = express();

  // Middleware to allow CORS for Vite's default port
  server.use(cors({ origin: "http://localhost:5173", credentials: true }));

  // Endpoint for directory selection
  server.get("/api/select-directory", async (req, res) => {
    try {
      const result = await dialog.showOpenDialog({
        properties: ["openDirectory"], // Restrict to directories only
        title: "Select Project Directory",
      });

      if (result.canceled || result.filePaths.length === 0) {
        return res.json({ path: null });
      }

      const selectedPath = result.filePaths[0];
      console.log("Selected Directory:", selectedPath);
      res.json({ path: selectedPath });
    } catch (error) {
      console.error("Error in dialog:", error);
      res.status(500).json({ error: "Failed to open directory picker" });
    }
  });

  server.listen(5001, () => {
    console.log("Backend server running on http://localhost:5001");
  });
};

const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: false, // Security best practice
      contextIsolation: true,
    },
  });

  // Load Vite dev server (default port for Vite)
  win.loadURL("http://localhost:5173"); // Updated from 3000 to 5173
};

app.whenReady().then(() => {
  createServer();
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});