// Nova Dynamics Modal AI Provider - Backend Proxy Only
// NEVER expose API keys to the frontend

const MODAL_API_KEY = process.env.MODAL_API_KEY;
const MODAL_BASE_URL = process.env.MODAL_BASE_URL;
const MODAL_MODEL = process.env.MODAL_MODEL || 'qwen2.5:32b';

interface NovaCompletionRequest {
  model: string;
  prompt: string;
  stream: boolean;
}

interface NovaCompletionResponse {
  response?: string;
  error?: string;
}

/**
 * Generate AI chat completion via Nova Dynamics Modal API.
 * This function is server-side only - called from /api/chat backend proxy.
 * Returns null if the API is unavailable, allowing fallback to local rules.
 */
export async function generateNovaCompletion(
  messages: { role: string; content: string }[],
  systemPrompt: string
): Promise<string | null> {
  if (!MODAL_API_KEY || !MODAL_BASE_URL) {
    console.warn('Nova Dynamics Modal API not configured - falling back to local engine');
    return null;
  }

  try {
    // Build the full prompt with system instruction
    const userMessages = messages
      .filter(m => m.role === 'user')
      .map(m => m.content)
      .join('\n\n');
    const fullPrompt = `${systemPrompt}\n\nUser: ${userMessages}`;

    const requestBody: NovaCompletionRequest = {
      model: MODAL_MODEL,
      prompt: fullPrompt,
      stream: false
    };

    const response = await fetch(MODAL_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MODAL_API_KEY}`
      },
      body: JSON.stringify(requestBody),
      signal: AbortSignal.timeout(30000) // 30s timeout
    });

    if (!response.ok) {
      console.error(`Nova API returned status ${response.status}: ${response.statusText}`);
      return null;
    }

    const data: NovaCompletionResponse = await response.json();

    if (data.error) {
      console.error('Nova API error:', data.error);
      return null;
    }

    return data.response || null;
  } catch (error: any) {
    if (error.name === 'AbortError') {
      console.error('Nova API request timed out');
    } else {
      console.error('Failed to call Nova Dynamics Modal API:', error.message);
    }
    return null;
  }
}

/**
 * Check if Nova Dynamics API is properly configured.
 */
export function isNovaConfigured(): boolean {
  return !!(MODAL_API_KEY && MODAL_BASE_URL);
}
