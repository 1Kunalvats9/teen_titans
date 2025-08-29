// src/app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth"
import { authOptions } from "@/lib/auth"

const handler = (NextAuth as unknown as (opts: unknown) => (req: Request) => Promise<Response>)(authOptions)
export const GET = handler
export const POST = handler