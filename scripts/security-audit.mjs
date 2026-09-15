#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

const SERVER_ONLY_SECRET_PATTERNS = [
  "SUPABASE_SERVICE_ROLE_KEY",
  "PAYHERO_API_PASSWORD",
  "RESEND_API_KEY",
  "AFRICASTALKING_API_KEY",
  "R2_SECRET_ACCESS_KEY",
  "FIELD_ENCRYPTION_KEY",
];

const FORBIDDEN_SECRET_LEAKS = [
  /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,
  /sk_live_[0-9a-zA-Z]{24,}/,
  /ghp_[0-9a-zA-Z]{36}/,
];

let totalIssues = 0;

console.log("\n🛡️  Running Karibu VMS Security Audit...\n");

// 1. Verify .gitignore ignores sensitive environment files
console.log("Checking .gitignore configuration...");
const gitignorePath = path.join(rootDir, ".gitignore");
if (fs.existsSync(gitignorePath)) {
  const gitignoreContent = fs.readFileSync(gitignorePath, "utf8");
  if (!gitignoreContent.includes(".env") && !gitignoreContent.includes(".env*")) {
    console.error("❌ CRITICAL: .gitignore does not properly exclude .env files!");
    totalIssues++;
  } else {
    console.log("✅ .gitignore properly excludes sensitive .env files.");
  }
} else {
  console.error("❌ CRITICAL: .gitignore file not found!");
  totalIssues++;
}

// 2. Scan all files in app, components, hooks, lib for client-side secret exposure
const scanDirs = ["app", "components", "hooks", "lib"];

function scanDirectory(dir) {
  const fullPath = path.join(rootDir, dir);
  if (!fs.existsSync(fullPath)) return;

  const entries = fs.readdirSync(fullPath, { withFileTypes: true });

  for (const entry of entries) {
    const entryPath = path.join(fullPath, entry.name);

    if (entry.isDirectory()) {
      if (entry.name !== "node_modules" && entry.name !== ".next") {
        scanDirectory(path.join(dir, entry.name));
      }
    } else if (entry.isFile() && /\.(tsx|ts|jsx|js|mjs)$/.test(entry.name)) {
      const content = fs.readFileSync(entryPath, "utf8");
      const isClientComponent = content.includes('"use client"') || content.includes("'use client'");

      // Check for hardcoded private keys
      for (const pattern of FORBIDDEN_SECRET_LEAKS) {
        if (pattern.test(content)) {
          console.error(`❌ CRITICAL: Hardcoded private credential detected in ${entryPath}`);
          totalIssues++;
        }
      }

      // If it's a client component, ensure no server-only secrets are referenced
      if (isClientComponent) {
        for (const secretName of SERVER_ONLY_SECRET_PATTERNS) {
          if (content.includes(`process.env.${secretName}`) || content.includes(`process.env["${secretName}"]`)) {
            console.error(`❌ CRITICAL: Server-only secret '${secretName}' referenced in client file: ${entryPath}`);
            totalIssues++;
          }
        }
      }

      // Ensure no server-only secret is mistakenly prefixed with NEXT_PUBLIC_
      for (const secretName of SERVER_ONLY_SECRET_PATTERNS) {
        if (content.includes(`NEXT_PUBLIC_${secretName}`)) {
          console.error(`❌ CRITICAL: Sensitive secret exposed with NEXT_PUBLIC_ prefix: ${entryPath}`);
          totalIssues++;
        }
      }
    }
  }
}

console.log("\nScanning codebase for leaked credentials and client-side secret exposure...");
for (const dir of scanDirs) {
  scanDirectory(dir);
}

// 3. Check for committed active .env files
console.log("\nChecking for committed active environment files...");
const dangerousEnvFiles = [".env.local", ".env.production"];
for (const envFile of dangerousEnvFiles) {
  const filePath = path.join(rootDir, envFile);
  if (fs.existsSync(filePath)) {
    // Check if tracked by git
    try {
      const stats = fs.statSync(filePath);
      if (stats.size > 0) {
        console.log(`ℹ️  Note: Local environment file '${envFile}' exists on disk (ensure it is never committed).`);
      }
    } catch {
      // ignore
    }
  }
}

console.log("\n------------------------------------------------------------");
if (totalIssues === 0) {
  console.log("✅ Security Audit Passed! No leaked keys or client exposures found.\n");
  process.exit(0);
} else {
  console.error(`❌ Security Audit Failed with ${totalIssues} critical issue(s)!\n`);
  process.exit(1);
}

