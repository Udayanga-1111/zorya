import { loginController } from '../../../../lib/controllers/login.controller';

export async function POST(request: Request) {
  try {
    const response = await loginController(request);
    return response;
  } catch (error: any) {
    // Catch unexpected runtime errors
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
