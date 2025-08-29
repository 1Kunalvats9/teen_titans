import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	// Ensure Next selects this folder as the root even if other lockfiles exist elsewhere
	// Helps avoid ENOENT errors for files like .next/routes-manifest.json
	outputFileTracingRoot: __dirname,
	// Pin Turbopack root as well (used by next dev/build)
	turbopack: {
		root: __dirname,
	} as any,
};

export default nextConfig;
