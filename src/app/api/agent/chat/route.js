export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const PYTHON_API_URL = process.env.PYTHON_API_URL || 'http://127.0.0.1:8000';

export async function POST(request) {
  try {
    const body = await request.json();

    const pythonResponse = await fetch(`${PYTHON_API_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'text/event-stream',
      },
      body: JSON.stringify(body),
      // Node.js fetch supports duplex streaming
      duplex: 'half',
    });

    if (!pythonResponse.ok) {
      return new Response(
        JSON.stringify({ error: 'Python chat API returned an error', status: pythonResponse.status }),
        { status: 502, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(pythonResponse.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
        'X-Accel-Buffering': 'no',
      },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: `Failed to connect to Zorya chat agent: ${error.message}` }),
      { status: 503, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
