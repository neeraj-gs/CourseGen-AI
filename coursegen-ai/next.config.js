/** @type {import('next').NextConfig} */
const nextConfig = {
    images:{
        remotePatterns:[
            {
                protocol:'https',
                hostname: 'lh3.googleusercontent.com'
            },
            {
                protocol:'https',
                hostname:'s3.us-west-2.amazonaws.com'
            }
        ],
    }
}

module.exports = nextConfig
