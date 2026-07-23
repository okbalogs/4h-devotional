/** @type {import('next').NextConfig} */
const nextConfig = {
  // Prevent Next.js from bundling firebase-admin — it must run as native Node.js
  // to avoid the jose ESM/CJS conflict on Node 24
  serverExternalPackages: ['firebase-admin', 'firebase-admin/app', 'firebase-admin/auth', 'firebase-admin/firestore'],
};

export default nextConfig;
