/**
 * Cloudflare Pages Function - Animation AI Chat
 * Calls Claude API to interpret animation commands
 */

interface Env {
  ANTHROPIC_API_KEY: string
}

interface AnimationAction {
  type: 'update_scene' | 'create_scene' | 'delete_scene' | 'play' | 'info' | 'error'
  sceneId?: string
  scrollPercent?: number
  label?: string
  changes?: {
    visible?: boolean
    opacity?: number
    rotationX?: number
    rotationY?: number
    rotationZ?: number
    positionX?: number
    positionY?: number
    scale?: number
    glow?: number
  }
  message: string
}

const SYSTEM_PROMPT = `Sei un assistente per animazioni 3D di un Ferrero Rocher. L'utente ti chiede di modificare le animazioni.

CONTROLLI DISPONIBILI:
- visible: true/false (mostra/nasconde il Ferrero)
- opacity: 0-1 (trasparenza)
- rotationX, rotationY, rotationZ: radianti (-3.14 a 3.14), oppure gradi se l'utente dice "gradi"
- positionX, positionY: -2 a 2 (posizione)
- scale: 0.1 a 3 (dimensione)
- glow: 0 a 3 (effetto luminoso)

SCENE ESISTENTI:
Le scene sono a diverse percentuali di scroll (0%, 10%, 20%, ... 100%).
Ogni scena definisce come appare il Ferrero a quel punto dello scroll.

RISPONDI SEMPRE IN JSON con questo formato:
{
  "type": "update_scene" | "create_scene" | "delete_scene" | "play" | "info",
  "scrollPercent": numero (0-100),
  "label": "nome scena" (opzionale),
  "changes": {
    "visible": boolean,
    "opacity": numero,
    "rotationY": numero in radianti,
    "scale": numero,
    "glow": numero,
    "positionX": numero
  },
  "message": "conferma in italiano di cosa hai fatto"
}

ESEMPI:
- "ruota di 45 gradi" → rotationY: 0.785 (45 * PI/180)
- "fallo brillare" → glow: 2
- "nascondilo" → visible: false
- "a 30% deve essere piccolo" → scrollPercent: 30, scale: 0.5
- "ingrandiscilo" → scale: 1.5

Se non capisci, rispondi con type: "info" e chiedi chiarimenti.`

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
    const { message, currentScenes } = await request.json() as {
      message: string
      currentScenes?: Array<{ scrollPercent: number; label: string }>
    }

    if (!message) {
      return new Response(JSON.stringify({ error: 'Message required' }), { status: 400, headers })
    }

    // Add current scenes context
    let userMessage = message
    if (currentScenes && currentScenes.length > 0) {
      userMessage += `\n\nSCENE ATTUALI:\n${currentScenes.map(s => `- ${s.label} @ ${s.scrollPercent}%`).join('\n')}`
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
