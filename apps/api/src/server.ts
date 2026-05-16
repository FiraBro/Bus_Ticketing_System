import dotenv from "dotenv";
import path from "path";
import fs from "fs";

const rootWorkspacePath = path.resolve(process.cwd(), "apps/api/.env");
const directLocalPath = path.resolve(process.cwd(), ".env");

// 🔴 TEMPORARY DEBUG LOGS
console.log("--------------------------------------------------");
console.log("Current Working Directory (CWD):", process.cwd());
console.log(
  "Looking for Root Path:",
  rootWorkspacePath,
  "Exists?",
  fs.existsSync(rootWorkspacePath),
);
console.log(
  "Looking for Local Path:",
  directLocalPath,
  "Exists?",
  fs.existsSync(directLocalPath),
);
console.log("--------------------------------------------------");

let finalEnvPath = rootWorkspacePath;
if (!fs.existsSync(rootWorkspacePath) && fs.existsSync(directLocalPath)) {
  finalEnvPath = directLocalPath;
}

dotenv.config({ path: finalEnvPath });

import app from "./app.js";

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
