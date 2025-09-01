import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	// Ensure Next selects this folder as the root even if other lockfiles exist elsewhere
	// Helps avoid ENOENT errors for files like .next/routes-manifest.json
	outputFileTracingRoot: __dirname,
	// Pin Turbopack root as well (used by next dev/build)
	turbopack: {
		root: __dirname,
	} as any,
	// Environment variables
	env: {
		NEXT_PUBLIC_WEBSOCKET_URL: process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'wss://learnos-websocket-server.onrender.com',
	},
	// Headers for security
	async headers() {
		return [
			{
				source: '/(.*)',
				headers: [
					{
						key: 'X-Frame-Options',
						value: 'DENY',
					},
					{
						key: 'X-Content-Type-Options',
						value: 'nosniff',
					},
					{
						key: 'Referrer-Policy',
						value: 'origin-when-cross-origin',
					},
				],
			},
		];
	},
};

export default nextConfig;
