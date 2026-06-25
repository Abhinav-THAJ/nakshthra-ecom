import { NextRequest } from "next/server";
import { AuthService } from "@/server/services/auth.service";
import { successResponse, errorResponse } from "@/lib/api-helpers";
import { z, ZodError } from "zod";

const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(12, "Password must be at least 12 characters"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = resetPasswordSchema.parse(body);

    await AuthService.resetPassword(data.token, data.password);
    
    return successResponse({ message: "Password has been successfully reset." });
  } catch (error) {
    if (error instanceof ZodError) {
      return errorResponse("Validation failed", 400, error.flatten().fieldErrors as any);
    }
    if (error instanceof Error) {
      // Safe business errors
      if (error.message.includes("Invalid or expired token")) {
        return errorResponse(error.message, 400);
      }
      if (error.message.includes("User not found")) {
        return errorResponse(error.message, 404);
      }
    }
    console.error("[POST /api/v1/auth/reset-password]", error);
    return errorResponse("Internal server error", 500);
  }
}
