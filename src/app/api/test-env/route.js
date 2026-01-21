export async function GET() {
  return Response.json({
    hasGoogleId: !!process.env.AUTH_GOOGLE_ID,
    hasGoogleSecret: !!process.env.AUTH_GOOGLE_SECRET,
    authUrl: process.env.AUTH_URL,
    nextauthUrl: process.env.NEXTAUTH_URL,
  });
}