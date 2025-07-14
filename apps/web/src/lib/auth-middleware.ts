import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export interface AuthenticatedUser {
  id: string;
  name: string;
  email: string;
  image?: string;
}

export async function getAuthenticatedUser(
  request: NextRequest,
): Promise<AuthenticatedUser | null> {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session?.user?.id) {
    return null;
  }

  return {
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
    image: session.user.image || undefined,
  };
}

type AuthHandler<T extends any[] = any[]> = (
  request: NextRequest,
  user: AuthenticatedUser,
  ...args: T
) => Promise<Response>;

export function withAuth<T extends any[] = any[]>(handler: AuthHandler<T>) {
  return async (request: NextRequest, ...args: T): Promise<Response> => {
    const user = await getAuthenticatedUser(request);

    if (!user) {
      return Response.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    return handler(request, user, ...args);
  };
}

type OptionalAuthHandler<T extends any[] = any[]> = (
  request: NextRequest,
  user: AuthenticatedUser | null,
  ...args: T
) => Promise<Response>;

export function withOptionalAuth<T extends any[] = any[]>(
  handler: OptionalAuthHandler<T>,
) {
  return async (request: NextRequest, ...args: T): Promise<Response> => {
    const user = await getAuthenticatedUser(request);
    return handler(request, user, ...args);
  };
}
