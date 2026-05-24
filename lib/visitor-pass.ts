import crypto from "crypto";
import { getAppUrl } from "@/lib/app-url";

export function createVisitorPassToken() {
  return crypto.randomBytes(32).toString("base64url");
}

export function createVisitorPassCode() {
  return crypto.randomInt(100000, 1000000).toString();
}

export function getVisitorPassUrl(token: string) {
  return `${getAppUrl()}/visitor-pass/${encodeURIComponent(token)}`;
}
