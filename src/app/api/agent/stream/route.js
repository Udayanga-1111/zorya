// Force dynamic execution — prevents Next.js from caching this SSE connection
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const PYTHON_API_URL = process.env.PYTHON_API_URL || 'http://127.0.0.1:8000';

/**
 * POST /api/agent/stream
 *
 * Backend-for-Frontend (BFF) proxy that:
 * 1. Accepts a user_profile JSON body from the React client.
 * 2. Forwards the request to the Python FastAPI /stream endpoint.
 * 3. Pipes the SSE stream directly back to the browser.
 *
 * This pattern avoids CORS issues and keeps the Python server address
 * hidden from the browser. The frontend reads this with fetch() +
 * response.body.getReader() since native EventSource only supports GET.
 */
export async function POST(request) {
  try {
    const body = await request.json();

    const pythonResponse = await fetch(`${PYTHON_API_URL}/stream`, {
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
