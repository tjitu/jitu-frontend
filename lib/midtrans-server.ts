import crypto from "crypto";
import { getDbPool } from "./db";

export interface MidtransSnapParams {
  orderId: string;
  grossAmount: number;
  itemDetails: Array<{
    id: string;
    price: number;
    quantity: number;
    name: string;
  }>;
  customerDetails?: {
    first_name?: string;
    email?: string;
  };
}

export function getMidtransConfig() {
  const serverKey = (
    process.env.MIDTRANS_SERVER_KEY ||
    process.env.SERVER_KEY ||
    ""
  ).replace(/['"\s]/g, "");

  const clientKey = (
    process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY ||
    process.env.CLIENT_KEY ||
    "Mid-client-f_SyejAdwBpQXUPj"
  ).replace(/['"\s]/g, "");

  const merchantId = (
    process.env.MIDTRANS_MERCHANT_ID ||
    process.env.MERCHANT_ID ||
    "G144808749"
  ).replace(/['"\s]/g, "");

  const isProduction =
    process.env.MIDTRANS_IS_PRODUCTION !== "false" &&
    process.env.NODE_ENV === "production"
      ? true
      : String(process.env.MIDTRANS_IS_PRODUCTION || "true").toLowerCase() === "true";

  const snapApiUrl = isProduction
    ? "https://app.midtrans.com/snap/v1/transactions"
    : "https://app.sandbox.midtrans.com/snap/v1/transactions";

  const coreApiUrl = isProduction
    ? "https://api.midtrans.com/v2"
    : "https://api.sandbox.midtrans.com/v2";

  const authHeader = `Basic ${Buffer.from(serverKey + ":").toString("base64")}`;

  if (!serverKey) {
    throw new Error("MIDTRANS_SERVER_KEY belum dikonfigurasi.");
  }

  return {
    serverKey,
    clientKey,
    merchantId,
    isProduction,
    snapApiUrl,
    coreApiUrl,
    authHeader,
  };
}

export async function createSnapTransaction(params: MidtransSnapParams) {
  const config = getMidtransConfig();

  const payload = {
    transaction_details: {
      order_id: params.orderId,
      gross_amount: Math.round(params.grossAmount),
    },
    // Snap exposes GoPay QRIS through the `gopay` payment channel.
    enabled_payments: ["gopay"],
    item_details: params.itemDetails,
    customer_details: params.customerDetails
      ? {
          first_name: params.customerDetails.first_name || "Siswa Jitu",
          email: params.customerDetails.email,
        }
      : undefined,
  };

  const response = await fetch(config.snapApiUrl, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: config.authHeader,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Midtrans API Error: ${response.status} - ${errorText}`);
  }

  return (await response.json()) as { token: string; redirect_url: string };
}

export async function createQrisTransaction(params: MidtransSnapParams) {
  const config = getMidtransConfig();
  const response = await fetch(`${config.coreApiUrl}/charge`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: config.authHeader,
    },
    body: JSON.stringify({
      // GoPay's Core API returns the plain, borderless QR image URL. The
      // merchant has GoPay enabled, while its separate QRIS Core channel may
      // not be enabled.
      payment_type: "gopay",
      transaction_details: {
        order_id: params.orderId,
        gross_amount: Math.round(params.grossAmount),
      },
      item_details: params.itemDetails,
      customer_details: params.customerDetails,
      gopay: { enable_callback: false },
    }),
  });

  const responseText = await response.text();
  let chargeData: {
    id?: string;
    status_code?: string;
    transaction_id?: string;
    expiry_time?: string;
    actions?: Array<{ name?: string; url?: string }>;
    qr_string?: string;
    status_message?: string;
    message?: string;
  };
  try {
    chargeData = JSON.parse(responseText);
  } catch {
    throw new Error(
      `Midtrans mengembalikan respons yang tidak valid (HTTP ${response.status}).`,
    );
  }

  const statusCode = Number(chargeData.status_code || response.status);
  const statusMessage = chargeData.status_message || chargeData.message || "";
  // Midtrans can report a channel rejection in the JSON body even when the
  // transport response is 2xx. Check both before accepting a charge.
  if (!response.ok || statusCode >= 400 || !chargeData.transaction_id) {
    if (
      response.status === 402 ||
      statusCode === 402 ||
      /payment channel.*not activated/i.test(statusMessage)
    ) {
      // Snap and Core API can have different channel activation. Preserve the
      // working checkout if direct GoPay charging is unavailable.
      try {
        const snapResult = await createSnapTransaction(params);
        return {
          token: snapResult.token,
          redirect_url: snapResult.redirect_url,
          expiry_time: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
        };
      } catch (snapError) {
        const fallbackMessage =
          snapError instanceof Error ? snapError.message : "respons tidak diketahui";
        throw new Error(
          `Core API GoPay ditolak dan checkout Snap juga gagal: ${fallbackMessage}`,
        );
      }
    }

    throw new Error(
      statusMessage || `Midtrans menolak pembayaran (HTTP ${response.status}).`,
    );
  }

  const transactionId = chargeData.transaction_id;
  const qrUrl = chargeData.actions?.find(
    (action) => action.name === "generate-qr-code",
  )?.url;

  // The v2 image has an ASPI border. Prefer the plain v2/gopay QR endpoint.
  const resolvedQrUrl =
    qrUrl ||
    (transactionId
      ? `${config.coreApiUrl}/gopay/${encodeURIComponent(transactionId)}/qr-code`
      : undefined);
  if (!resolvedQrUrl) {
    throw new Error(
      chargeData.status_message ||
        chargeData.message ||
        "Midtrans membuat transaksi tetapi tidak mengembalikan data QRIS yang dapat ditampilkan.",
    );
  }

  return {
    token: transactionId || params.orderId,
    redirect_url: resolvedQrUrl,
    qr_string: chargeData.qr_string,
    qr_url: resolvedQrUrl,
    expiry_time:
      chargeData.expiry_time ||
      new Date(Date.now() + 15 * 60 * 1000).toISOString(),
  };
}

export function verifyMidtransSignature(
  orderId: string,
  statusCode: string,
  grossAmount: string | number,
  signatureKey: string
): boolean {
  const config = getMidtransConfig();
  const rawAmount = String(grossAmount);
  // Ensure same format as Midtrans sends (e.g. "89000.00" or integer)
  const hash = crypto
    .createHash("sha512")
    .update(orderId + statusCode + rawAmount + config.serverKey)
    .digest("hex");

  if (hash === signatureKey) return true;

  // Also test integer format if rawAmount has decimal or vice versa
  const intAmount = String(Math.round(Number(grossAmount)));
  const hashInt = crypto
    .createHash("sha512")
    .update(orderId + statusCode + intAmount + config.serverKey)
    .digest("hex");

  return hashInt === signatureKey;
}

export async function getMidtransStatus(orderId: string) {
  const config = getMidtransConfig();
  const url = `${config.coreApiUrl}/${orderId}/status`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: config.authHeader,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    return null;
  }

  return await response.json();
}

export async function cancelMidtransTransaction(orderId: string) {
  const config = getMidtransConfig();
  const url = `${config.coreApiUrl}/${orderId}/cancel`;

  try {
    await fetch(url, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: config.authHeader,
      },
    });
  } catch (err) {
    console.warn("Failed calling Midtrans cancel API:", err);
  }
}

export async function confirmPaymentInDb(orderId: string, rawNotification?: unknown) {
  const pool = getDbPool();

  const paymentRes = await pool.query(
    `SELECT id, "userId", "tokenPackageId", "orderId", amount, "tokenAmount", status, metadata
     FROM "Payment"
     WHERE "orderId" = $1
     LIMIT 1`,
    [orderId]
  );

  const payment = paymentRes.rows[0];
  if (!payment) {
    return { success: false, message: "Payment not found" };
  }

  if (payment.status === "CONFIRMED") {
    return { success: true, message: "Already confirmed", payment };
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // 1. Update payment status
    const currentMetadata = payment.metadata || {};
    const updatedMetadata = {
      ...currentMetadata,
      confirmed_at: new Date().toISOString(),
      notification: rawNotification || null,
    };

    await client.query(
      `UPDATE "Payment"
       SET status = 'CONFIRMED', "updatedAt" = NOW(), metadata = $2
       WHERE id = $1`,
      [payment.id, JSON.stringify(updatedMetadata)]
    );

    // 2. Increment user token balance
    await client.query(
      `UPDATE "user"
       SET "tokenBalance" = "tokenBalance" + $2, "updatedAt" = NOW()
       WHERE id = $1`,
      [payment.userId, payment.tokenAmount]
    );

    // 3. Log token transaction
    const txId = crypto.randomUUID();
    await client.query(
      `INSERT INTO "TokenTransaction" (id, "userId", amount, type, "referenceId", "createdAt")
       VALUES ($1, $2, $3, 'PURCHASE_PACKAGE', $4, NOW())`,
      [txId, payment.userId, payment.tokenAmount, payment.id]
    );

    await client.query("COMMIT");
    return { success: true, message: "Payment confirmed and tokens credited", payment };
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error confirming payment in DB:", err);
    throw err;
  } finally {
    client.release();
  }
}
