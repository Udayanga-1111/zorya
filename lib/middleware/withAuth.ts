import { NextResponse } from 'next/server';
import { verifyToken } from '../services/auth.service';

type NextRouteHandler = (
  request: Request,
  context: any
) => Promise<Response> | Response;

// Higher Order Function for Route Handlers
export function withAuth(handler: NextRouteHandler) {
  return async (request: Request, context: any) => {
    try {
      const authHeader = request.headers.get('authorization');
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return NextResponse.json(
          { error: 'Unauthorized: No token provided' },
          { status: 401 }
        );
      }

      const token = authHeader.split(' ')[1];
      const decoded = verifyToken(token);

      if (!decoded) {
        return NextResponse.json(
          { error: 'Unauthorized: Invalid or expired token' },
          { status: 401 }
        );
      }

      // We can attach the user to the request headers or pass it via context
      // For Next.js App Router, modifying the Request is preferred
      request.headers.set('x-user-id', decoded.userId);
      request.headers.set('x-user-email', decoded.email);

      return handler(request, context);
    } catch (error) {
      console.error('Auth middleware error:', error);
      return NextResponse.json(
        { error: 'Internal server error during authentication' },
        { status: 500 }
      );
    }
  };
}
