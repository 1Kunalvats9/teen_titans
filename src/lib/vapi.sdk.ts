import Vapi from "@vapi-ai/web";

// Initialize Vapi with public key
export const vapi = new Vapi(process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY!);

// Helper function to get Vapi instance
export const getVapiInstance = () => {
  if (!process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY) {
    throw new Error('Vapi public key not configured');
  }
  return new Vapi(process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY);
};
