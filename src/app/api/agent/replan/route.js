// Force dynamic execution — prevents Next.js from caching this SSE connection
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const PYTHON_API_URL = process.env.PYTHON_API_URL || 'http://127.0.0.1:8000';

/**
 * POST /api/agent/replan
 *
 * Backend-for-Frontend (BFF) proxy that:
 * 1. Accepts a block JSON body from the React client.
 * 2. Forwards the request to the Python FastAPI /replan endpoint.
 * 3. Pipes the SSE stream directly back to the browser.
 */
export async function POST(request) {
  try {
    const body = await request.json();

    const pythonResponse = await fetch(`${PYTHON_API_URL}/replan`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'text/event-stream',
      },
      body: JSON.stringify(body),
      duplex: 'half',
    });

    if (!pythonResponse.ok) {
      return new Response(
        JSON.stringify({ error: 'Python agent API returned an error', status: pythonResponse.status }),
        { status: 502, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Pipe the SSE stream through to the browser with the required headers
    return new Response(pythonResponse.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
        'X-Accel-Buffering': 'no', // Disables Nginx buffering if deployed
      },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: `Failed to connect to Zorya agent: ${error.message}` }),
      { status: 503, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
