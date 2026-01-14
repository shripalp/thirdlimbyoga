return NextResponse.json({
  hasStripeSecret: !!process.env.STRIPE_SECRET_KEY,
  hasPriceId: !!process.env.STRIPE_PRICE_ID,
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || null,
  nodeEnv: process.env.NODE_ENV || null,
  testEnvWorks: process.env.TEST_ENV_WORKS || null,
});

