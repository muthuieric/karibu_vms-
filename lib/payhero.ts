export type PayHeroInitiatePaymentInput = {
  amount: number;
  phoneNumber: string;
  channelId: string;
  externalReference: string;
  callbackUrl: string;
};

export type NormalizedPaymentStatus = "pending" | "paid" | "failed" | "cancelled" | "reversed";

const PAYHERO_BASE_URL = "https://backend.payhero.co.ke/api/v2";

function getPayHeroAuthHeader() {
  const username = process.env.PAYHERO_API_USERNAME;
  const password = process.env.PAYHERO_API_PASSWORD;

  if (!username || !password) {
    throw new Error("Missing PayHero API credentials.");
  }

  return `Basic ${Buffer.from(`${username}:${password}`).toString("base64")}`;
}

async function parsePayHeroResponse(response: Response) {
  const text = await response.text();
  const data = text ? JSON.parse(text) : {};

  if (!response.ok) {
    throw new Error(data?.message || data?.error || `PayHero request failed with status ${response.status}`);
  }

  return data;
}

export async function initiatePayHeroPayment(input: PayHeroInitiatePaymentInput) {
  const response = await fetch(`${PAYHERO_BASE_URL}/payments`, {
    method: "POST",
    headers: {
      Authorization: getPayHeroAuthHeader(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: input.amount,
      phone_number: input.phoneNumber,
      channel_id: Number(input.channelId),
      provider: "m-pesa",
      external_reference: input.externalReference,
      callback_url: input.callbackUrl,
    }),
  });

  return parsePayHeroResponse(response);
}

export async function getPayHeroTransactionStatus(checkoutRequestId: string) {
  const url = new URL(`${PAYHERO_BASE_URL}/transaction-status`);
  url.searchParams.set("reference", checkoutRequestId);

  const response = await fetch(url, {
    headers: {
      Authorization: getPayHeroAuthHeader(),
      "Content-Type": "application/json",
    },
  });

  return parsePayHeroResponse(response);
}

export function normalizePayHeroStatus(status?: string | null, resultCode?: string | number | null): NormalizedPaymentStatus {
  const normalized = String(status || "").trim().toUpperCase();
  const code = resultCode === null || resultCode === undefined ? undefined : Number(resultCode);

  if (normalized === "SUCCESS" || normalized === "SUCCESSFUL" || normalized === "PAID" || code === 0) return "paid";
  if (normalized === "QUEUED" || normalized === "PENDING" || normalized === "PROCESSING") return "pending";
  if (normalized === "CANCELLED" || normalized === "CANCELED") return "cancelled";
  if (normalized === "REVERSED" || normalized === "REFUNDED") return "reversed";
  if (normalized === "FAILED" || (code !== undefined && code !== 0)) return "failed";

  return "pending";
}

export function getPayHeroReference(payload: Record<string, unknown>) {
  return String(
    payload.CheckoutRequestID ||
      payload.CheckoutRequestId ||
      payload.checkout_request_id ||
      payload.checkoutRequestId ||
      payload.reference ||
      payload.Reference ||
      ""
  );
}

export function getPayHeroExternalReference(payload: Record<string, unknown>) {
  return String(
    payload.ExternalReference ||
      payload.external_reference ||
      payload.externalReference ||
      payload.MerchantRequestID ||
      payload.merchant_request_id ||
      ""
  );
}
