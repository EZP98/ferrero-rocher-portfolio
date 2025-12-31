/**
 * AI Chat API - Cloudflare Pages Function
 * Chat with Claude for animation control
 */

interface Env {
  ANTHROPIC_API_KEY: string
}

const SYSTEM_PROMPT = `Sei un assistente per animazioni web. Aiuti a controllare e modificare animazioni CSS, GSAP e Three.js.

Quando l'utente seleziona un elemento, ricevi le sue proprietà. Puoi suggerire modifiche alle animazioni.

RISPONDI IN JSON quando l'utente chiede di modificare qualcosa:
{
  "action": "animate",
  "target": "element-id",
  "changes": {
    "opacity": 0.5,
    "scale": 1.2,
    "rotateY": 45
  },
  "duration": 0.5,
  "message": "Ho modificato l'opacità e la scala"
}

Per domande generali, rispondi normalmente in italiano.
Sii conciso e tecnico.`

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context

  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  }

  try {
    const { messages, selectedElement } = await request.json() as {
      messages: Array<{ role: string; content: string }>
      selectedElement?: { id: string; tag: string; classes: string[]; styles: Record<string, string> }
    }

    // Add context about selected element
    let systemPrompt = SYSTEM_PROMPT
    if (selectedElement) {
      systemPrompt += `\n\nELEMENTO SELEZIONATO:
- ID: ${selectedElement.id || 'nessuno'}
- Tag: ${selectedElement.tag}
- Classi: ${selectedElement.classes.join(', ') || 'nessuna'}
- Stili: ${JSON.stringify(selectedElement.styles, null, 2)}`
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2048,
        stream: true,
        system: systemPrompt,
        messages: messages.map(m => ({
          role: m.role as 'user' | 'assistant',
          content: m.content
        })),
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('Claude API error:', error)
      return new Response(JSON.stringify({ error: 'API Error' }), {
        status: 500,
        headers: { ...headers, 'Content-Type': 'application/json' }
      })
    }

    // Stream the response
    return new Response(response.body, { headers })

  } catch (error) {
    console.error('Error:', error)
    return new Response(JSON.stringify({ error: 'Internal error' }), {
      status: 500,
      headers: { ...headers, 'Content-Type': 'application/json' }
    })
  }
}

export const onRequestOptions: PagesFunction = async () => {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}
