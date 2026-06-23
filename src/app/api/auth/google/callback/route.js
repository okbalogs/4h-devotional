import { NextResponse } from 'next/server';
import { adminAuth } from '@/utils/firebaseAdmin';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/auth/google/callback`;
  const frontendRedirect = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/today`;

  if (error) {
    return NextResponse.redirect(`${frontendRedirect}?error=${encodeURIComponent(error)}`);
  }

  if (!code) {
    return NextResponse.redirect(`${frontendRedirect}?error=NoCodeProvided`);
  }

  try {
    // 1. Exchange code for Google access token
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    const tokenData = await tokenRes.json();
    if (!tokenRes.ok) {
      throw new Error(tokenData.error_description || 'Failed to get access token');
    }

    // 2. Fetch user profile from Google
    const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    
    const userData = await userRes.json();
    if (!userRes.ok) {
      throw new Error(userData.error?.message || 'Failed to get user profile');
    }

    const email = userData.email;
    const name = userData.name;
    const photoUrl = userData.picture;
    const googleId = userData.id;

    // 3. Find or create the user in Firebase Auth
    let uid;
    try {
      // Check if user exists by email
      const userRecord = await adminAuth.getUserByEmail(email);
      uid = userRecord.uid;
    } catch (err) {
      if (err.code === 'auth/user-not-found') {
        // Create new user
        const newUser = await adminAuth.createUser({
          email,
          displayName: name,
          photoURL: photoUrl,
          emailVerified: true,
        });
        uid = newUser.uid;
      } else {
        throw err;
      }
    }

    // 4. Mint a Firebase Custom Token
    const customToken = await adminAuth.createCustomToken(uid);

    // 5. Redirect back to frontend with the token
    const url = new URL(frontendRedirect);
    url.searchParams.set('customToken', customToken);
    
    return NextResponse.redirect(url.toString());

  } catch (err) {
    console.error('Google OAuth Error:', err);
    return NextResponse.redirect(`${frontendRedirect}?error=${encodeURIComponent(err.message)}`);
  }
}
