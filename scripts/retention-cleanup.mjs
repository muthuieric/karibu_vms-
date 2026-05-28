const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || process.env.SITE_URL;
const cronSecret = process.env.CRON_SECRET;

if (!siteUrl || !cronSecret) {
  console.error("Set NEXT_PUBLIC_SITE_URL (or SITE_URL) and CRON_SECRET before running cleanup.");
  process.exit(1);
}

const response = await fetch(`${siteUrl.replace(/\/$/, "")}/api/retention/cleanup`, {
  method: "POST",
  headers: {
    Authorization: `Bearer ${cronSecret}`,
  },
});

const body = await response.json().catch(() => ({}));

if (!response.ok) {
  console.error(body.error || "Retention cleanup failed.");
  process.exit(1);
}

console.log(JSON.stringify(body.data, null, 2));
