/** @type {import('next').NextConfig} */
const nextConfig = {
  // `standalone` produces the server.js bundle the Dockerfile expects. It is
  // only enabled for Docker builds because Vercel handles packaging itself.
  output: process.env.DOCKER_BUILD === "1" ? "standalone" : undefined,
  images: {
    remotePatterns: [
      // Google account avatars
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      // Unsplash course covers — `urls.small_s3` points at the S3 host,
      // the documented url fields point at images.unsplash.com.
      { protocol: "https", hostname: "s3.us-west-2.amazonaws.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "plus.unsplash.com" },
    ],
  },
};

module.exports = nextConfig;
