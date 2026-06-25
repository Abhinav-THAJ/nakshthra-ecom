import { NextRequest } from "next/server";
import { AuthService } from "@/server/services/auth.service";
import { successResponse, errorResponse } from "@/lib/api-helpers";
import { z, ZodError } from "zod";

const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = forgotPasswordSchema.parse(body);

    await AuthService.createPasswordResetToken(data.email);
    
    // Always return success to prevent email enumeration
    return successResponse({ message: "If the email exists, a password reset link has been sent." });
  } catch (error) {
    if (error instanceof ZodError) {
      return errorResponse("Validation failed", 400, error.flatten().fieldErrors as any);
    }
    console.error("[POST /api/v1/auth/forgot-password]", error);
    return errorResponse("Internal server error", 500);
  }
}
