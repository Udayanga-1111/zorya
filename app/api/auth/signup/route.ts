import { signupController } from '../../../../lib/controllers/signup.controller';

export async function POST(request: Request) {
  try {
    const response = await signupController(request);
    return response;
  } catch (error: any) {
    // Catch unexpected runtime errors
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
