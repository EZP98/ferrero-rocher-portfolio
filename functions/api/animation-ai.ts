/**
 * Cloudflare Pages Function - Animation AI Chat
 * Generic animation assistant for any project
 */

interface Env {
  ANTHROPIC_API_KEY: string
}

interface AnimationAction {
  type: 'animate' | 'info' | 'error'
  elementId?: string
  changes?: Record<string, number | string>
  message: string
}

const SYSTEM_PROMPT = `Sei un assistente per animazioni. Aiuti a controllare elementi DOM, GSAP, Three.js e CSS.

PROPRIETA' CSS COMUNI:
- opacity: 0-1 (trasparenza)
- scale: 0.1-3 (dimensione, es: scale(1.5))
- rotate: gradi (es: rotate(45deg))
- translateX, translateY: pixel (spostamento)
- visibility: visible/hidden

PROPRIETA' GSAP:
- x, y: spostamento in pixel
- rotation: gradi
- scale: dimensione
- opacity: 0-1
- duration: secondi

PROPRIETA' THREE.JS (se canvas):
- camera.position.x/y/z
- camera.rotation.x/y/z
- mesh.rotation.x/y/z

RISPONDI IN JSON:
{
  "type": "animate",
  "elementId": "id dell'elemento da animare",
  "changes": {
    "opacity": 0.5,
    "scale": 1.2,
    "rotate": 45
  },
  "message": "conferma in italiano"
}

ESEMPI:
- "fai apparire l'header lentamente" → { elementId: "header", changes: { opacity: 1 } }
- "ruota il logo di 45 gradi" → { elementId: "logo", changes: { rotate: 45 } }
- "nascondi la sezione hero" → { elementId: "hero", changes: { opacity: 0 } }
- "ingrandisci la card" → { elementId: "card", changes: { scale: 1.5 } }

Se l'utente non specifica un elemento, chiedi quale elemento vuole animare.
Rispondi sempre in italiano e sii conciso.`

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context

  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  }

  try {
    const { message, elements } = await request.json() as {
      message: string
      elements?: Array<{ id: string; name: string; type: string; properties: string[] }>
    }

    if (!message) {
      return new Response(JSON.stringify({ error: 'Message required' }), { status: 400, headers })
    }

    // Add discovered elements context
    let userMessage = message
    if (elements && elements.length > 0) {
      userMessage += `\n\nELEMENTI DISPONIBILI:\n${elements.map(e => `- ${e.name} (${e.type}): ${e.properties.join(', ')}`).join('\n')}`
    }

    // Call Claude API
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        messages: [
          { role: 'user', content: userMessage }
        ],
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('Claude API error:', error)
      return new Response(JSON.stringify({
        type: 'error',
        message: 'Errore API Claude'
      }), { status: 500, headers })
    }

    const data = await response.json() as { content: Array<{ text: string }> }
    const aiResponse = data.content[0]?.text || ''

    // Try to parse JSON from response
    let action: AnimationAction
    try {
      // Extract JSON from response (might be wrapped in markdown)
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        action = JSON.parse(jsonMatch[0])
      } else {
        action = {
          type: 'info',
          message: aiResponse
        }
      }
    } catch {
      action = {
        type: 'info',
        message: aiResponse
      }
    }

    return new Response(JSON.stringify(action), { headers })

  } catch (error) {
    console.error('Error:', error)
    return new Response(JSON.stringify({
      type: 'error',
      message: 'Errore interno'
    }), { status: 500, headers })
  }
}

// Handle CORS preflight
export const onRequestOptions: PagesFunction = async () => {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}
