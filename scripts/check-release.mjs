import { readFile } from "node:fs/promises";
const env = Object.fromEntries(
  (await readFile(".env.local", "utf8").catch(() => ""))
    .split(/\r?\n/)
    .filter((s) => s.includes("=") && !s.startsWith("#"))
    .map((s) => [
      s.slice(0, s.indexOf("=")),
      s.slice(s.indexOf("=") + 1).trim(),
    ]),
);
const missing = ["VITE_CONTACT_EMAIL", "VITE_PROFILE_NAME"].filter(
  (key) => !(process.env[key] || env[key]),
);
if (missing.length) {
  console.error(
    `Public-launch configuration missing: ${missing.join(", ")}. Local/private preview is available.`,
  );
  process.exitCode = 1;
} else console.log("Required public profile fields are configured.");
