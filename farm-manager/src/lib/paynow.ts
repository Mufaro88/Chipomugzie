import crypto from "crypto";

// Paynow (paynow.co.zw) Express Checkout for mobile money (EcoCash/OneMoney).
// Requires a merchant account: set PAYNOW_INTEGRATION_ID and
// PAYNOW_INTEGRATION_KEY in the environment. Until they are set the app
// falls back to manual activation by the platform admin.

const PAYNOW_REMOTE_URL = "https://www.paynow.co.zw/interface/remotetransaction";

export function paynowConfigured() {
  return Boolean(
    process.env.PAYNOW_INTEGRATION_ID && process.env.PAYNOW_INTEGRATION_KEY
  );
}

export function proPriceUsd() {
  const parsed = Number(process.env.PRO_PRICE_USD);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 10;
}

function hashFields(fields: Record<string, string>, integrationKey: string) {
  const concatenated = Object.values(fields).join("") + integrationKey;
  return crypto.createHash("sha512").update(concatenated).digest("hex").toUpperCase();
}

function parsePaynowResponse(body: string) {
  const out: Record<string, string> = {};
  for (const pair of body.split("&")) {
    const eq = pair.indexOf("=");
    if (eq === -1) continue;
    const k = pair.slice(0, eq).toLowerCase();
    const v = pair.slice(eq + 1);
    out[k] = decodeURIComponent(v.replace(/\+/g, " "));
  }
  return out;
}

export async function initiateMobilePayment(opts: {
  reference: string;
  amountUsd: number;
  phone: string;
  email: string;
  resultUrl: string;
  method?: string;
}) {
  const id = process.env.PAYNOW_INTEGRATION_ID!;
  const key = process.env.PAYNOW_INTEGRATION_KEY!;

  const fields: Record<string, string> = {
    id,
    reference: opts.reference,
    amount: opts.amountUsd.toFixed(2),
    additionalinfo: "Farmer's Pocket Book Pro subscription",
    returnurl: opts.resultUrl,
    resulturl: opts.resultUrl,
    authemail: opts.email,
    phone: opts.phone,
    method: opts.method ?? "ecocash",
    status: "Message",
  };
  fields.hash = hashFields(fields, key);

  const res = await fetch(PAYNOW_REMOTE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(fields).toString(),
  });
  const data = parsePaynowResponse(await res.text());

  if ((data.status ?? "").toLowerCase() !== "ok") {
    throw new Error(data.error || "Payment could not be started");
  }
  return { pollUrl: data.pollurl ?? "", instructions: data.instructions ?? "" };
}

export async function checkPaymentStatus(pollUrl: string) {
  const res = await fetch(pollUrl, { method: "POST" });
  const data = parsePaynowResponse(await res.text());
  const status = (data.status ?? "").toLowerCase();
  return { status, paid: status === "paid" || status === "awaiting delivery" };
}
