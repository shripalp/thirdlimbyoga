const MONTH_IN_MS = 30 * 24 * 60 * 60 * 1000;

export function getMonthlyPriceId() {
  return (
    process.env.STRIPE_MONTHLY_PRICE_ID?.trim() ||
    process.env.STRIPE_PRICE_ID?.trim() ||
    ""
  );
}

export async function getConfiguredMonthlyPrice(stripe) {
  const priceId = getMonthlyPriceId();

  if (!priceId) {
    return {
      ok: false,
      status: 500,
      error: "Missing STRIPE_MONTHLY_PRICE_ID or STRIPE_PRICE_ID",
    };
  }

  const price = await stripe.prices.retrieve(priceId);

  if (!price || price.deleted) {
    return {
      ok: false,
      status: 500,
      error: `Stripe price not found for ${priceId}`,
    };
  }

  return { ok: true, priceId, price };
}

export function getCheckoutModeForPrice(price) {
  return price?.type === "recurring" ? "subscription" : "payment";
}

export function isCheckoutSessionActive(session) {
  if (!session) return false;

  if (session.mode === "subscription") {
    const sub = session.subscription;
    return Boolean(
      sub && (sub.status === "active" || sub.status === "trialing")
    );
  }

  return session.payment_status === "paid" || session.status === "complete";
}

export function getOneTimeAccessUntil(unixSeconds) {
  if (!unixSeconds) return null;
  return Math.floor((unixSeconds * 1000 + MONTH_IN_MS) / 1000);
}
