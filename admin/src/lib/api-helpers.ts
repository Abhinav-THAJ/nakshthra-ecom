import { type ApiResponse, type PaginationMeta } from "@/types";
import { NextResponse } from "next/server";

export function successResponse<T>(
  data: T,
  meta?: PaginationMeta,
  status = 200
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      meta,
      error: null,
    },
    { status }
  );
}

export function errorResponse(
  message: string,
  status = 500,
  errors?: Record<string, string[]>
): NextResponse<ApiResponse<null>> {
  return NextResponse.json(
    {
      success: false,
      data: null,
      error: message,
      errors,
    },
    { status }
  );
}

export function paginationMeta(
  total: number,
  page: number,
  limit: number
): PaginationMeta {
  const totalPages = Math.ceil(total / limit);
  return {
    page,
    limit,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}

export function getRequestIp(req: Request): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0] ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

export function getRequestUserAgent(req: Request): string {
  return req.headers.get("user-agent") || "unknown";
}
