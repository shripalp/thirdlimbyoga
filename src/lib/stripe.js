export function getMonthlyPriceId() {
  return (
    process.env.STRIPE_MONTHLY_PRICE_ID?.trim() ||
    process.env.STRIPE_PRICE_ID?.trim() ||
    ""
  );
}

export async function getValidatedRecurringMonthlyPrice(stripe) {
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

  if (price.type !== "recurring" || !price.recurring) {
    return {
      ok: false,
      status: 500,
      error:
        `Stripe price ${priceId} is not a recurring price. ` +
        "Use a recurring monthly price for subscription checkout.",
    };
  }

  return { ok: true, priceId, price };
}
