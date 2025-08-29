declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      emailVerified?: Date | null
      isOnboarded?: boolean
      persona?: string | null
      onboardingStep?: number
    }
  }

  interface User {
    id: string
    name?: string | null
    email?: string | null
    image?: string | null
    emailVerified?: Date | null
    isOnboarded?: boolean
    persona?: string | null
    onboardingStep?: number
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    name?: string | null
    email?: string | null
    image?: string | null
    emailVerified?: Date | null
    isOnboarded?: boolean
    persona?: string | null
    onboardingStep?: number
  }
}
