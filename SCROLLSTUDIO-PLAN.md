# Piano: ScrollStudio - Piattaforma Animazione Scroll-Based

## Vision
Trasformare l'editor di animazioni Ferrero Rocher in un prodotto SaaS per designer/creativi che vogliono creare siti web animati scroll-based senza codice.

## Target
- **Utente**: Designer/Creativi (no-code)
- **Business Model**: SaaS mensile
- **Cosa anima**: Tutto (3D, testi, immagini, video, particelle)

---

## Roadmap Prodotto

```
┌─────────────────────────────────────────────────────────────────┐
│  FASE 1 (MVP)          FASE 2              FASE 3              │
│  Template + Swap 3D    Section Builder     Figma Import        │
│  ─────────────────     ───────────────     ────────────        │
│  • Template gallery    • Drag & drop       • Figma plugin      │
│  • Upload .glb         • Component lib     • Layer → Element   │
│  • Edit testi/colori   • Custom sections   • Auto-animate      │
│  • Animation editor    • Animation tracks  • Sync changes      │
│  • Export/Publish      • Multi-object      • Team collab       │
└─────────────────────────────────────────────────────────────────┘
```

---

## FASE 1: MVP - Template + Swap 3D

### Architettura

```
┌─────────────────────────────────────────────────────────────────┐
│                         SCROLLSTUDIO                            │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │  TEMPLATES  │  │   EDITOR    │  │  DASHBOARD  │             │
│  │  Gallery    │→ │  Animation  │→ │  Projects   │             │
│  │  Preview    │  │  Content    │  │  Publish    │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
├─────────────────────────────────────────────────────────────────┤
│                        PROJECT CONFIG                           │
│  {                                                              │
│    "template": "luxury-product",                                │
│    "model3d": "user-uploaded.glb",                             │
│    "sections": [...],                                           │
│    "animations": [...],                                         │
│    "content": { texts, colors, images }                        │
│  }                                                              │
└─────────────────────────────────────────────────────────────────┘
```

### Flusso Utente MVP

```
1. SIGNUP/LOGIN
   └→ Dashboard progetti

2. NEW PROJECT
   └→ Scegli template (Luxury Product, Portfolio, Landing...)
   └→ Preview interattiva

3. CONTENT EDITOR
   ├→ Upload modello 3D (.glb/.gltf)
   ├→ Modifica testi (titoli, descrizioni, CTA)
   ├→ Cambia colori (palette picker)
   └→ Upload immagini/logo

4. ANIMATION EDITOR (il nostro DebugPage evoluto)
   ├→ Timeline scroll con sezioni
   ├→ Drag keyframes per timing
   ├→ Edit transform 3D (rot/pos/scale)
   ├→ Edit animazioni testo (fade, slide, reveal)
   └→ Preview real-time

5. PUBLISH
   ├→ Preview link temporaneo
   ├→ Custom domain (premium)
   └→ Export codice (premium)
```

### Schema Dati - ProjectConfig

```typescript
interface ProjectConfig {
  id: string
  userId: string
  name: string
  template: string

  // 3D Model
  model: {
    url: string           // uploaded .glb path
    scale: number
    initialRotation: [number, number, number]
  }

  // Page Sections
  sections: Section[]

  // Scroll Animations
  animations: {
    model3d: AnimationStage[]
    texts: TextAnimation[]
    elements: ElementAnimation[]
  }

  // Content
  content: {
    brand: { name: string, tagline: string, logo?: string }
    colors: { primary: string, secondary: string, background: string }
    texts: Record<string, string>
    images: Record<string, string>
  }

  // Settings
  settings: {
    smoothScroll: boolean
    scrollSpeed: number
    customCursor: boolean
  }
}

interface Section {
  id: string
  type: 'hero' | 'features' | 'gallery' | 'cta' | 'footer' | 'custom'
  scrollStart: number  // 0-1
  scrollEnd: number    // 0-1
  content: Record<string, any>
}

interface AnimationStage {
  id: string
  name: string
  scrollStart: number
  scrollEnd: number
  easing: 'linear' | 'easeIn' | 'easeOut' | 'easeInOut'
  transform: {
    rotation: [number, number, number]
    position: [number, number, number]
    scale: number
  }
}

interface TextAnimation {
  elementId: string
  type: 'fadeIn' | 'slideUp' | 'reveal' | 'typewriter'
  scrollStart: number
  scrollEnd: number
  easing: string
}
```

### Templates Iniziali

1. **Luxury Product** (basato su Ferrero)
   - Hero con titolo grande
   - 3 sezioni feature con info cards
   - Spin finale
   - Footer elegante

2. **Portfolio 3D**
   - Hero con nome/titolo
   - Gallery progetti
   - About section
   - Contact

3. **Product Launch**
   - Countdown/teaser
   - Feature showcase
   - Pricing
   - CTA finale

### Componenti da Creare (MVP)

```
src/
├── app/                          # Next.js App Router
│   ├── (auth)/
│   │   ├── login/
│   │   └── signup/
│   ├── (dashboard)/
│   │   ├── projects/
│   │   └── settings/
│   ├── editor/[projectId]/       # Animation Editor
│   └── preview/[projectId]/      # Live Preview
│
├── components/
│   ├── editor/
│   │   ├── AnimationTimeline.tsx
│   │   ├── ContentPanel.tsx
│   │   ├── Preview3D.tsx
│   │   ├── SectionManager.tsx
│   │   └── TransformControls.tsx
│   ├── templates/
│   │   ├── LuxuryProduct/
│   │   ├── Portfolio3D/
│   │   └── ProductLaunch/
│   └── ui/
│
├── lib/
│   ├── animation-engine.ts       # Core animation logic
│   ├── project-config.ts         # Config validation
│   └── export.ts                 # Code export
│
└── stores/
    └── editor-store.ts           # Zustand state
```

### Database Schema (Supabase)

```sql
-- Users (handled by Supabase Auth)

-- Projects
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  template TEXT NOT NULL,
  config JSONB NOT NULL,
  thumbnail_url TEXT,
  published_url TEXT,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Assets (uploaded files)
CREATE TABLE assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id),
  type TEXT NOT NULL, -- 'model', 'image', 'video'
  url TEXT NOT NULL,
  filename TEXT,
  size_bytes INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Published Sites
CREATE TABLE published_sites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id),
  subdomain TEXT UNIQUE, -- user.scrollstudio.app
  custom_domain TEXT,
  build_config JSONB,
  published_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Tech Stack MVP

- **Frontend**: Next.js 14 + React 18 + TypeScript
- **3D**: Three.js + React Three Fiber + Drei
- **Animation**: Framer Motion + GSAP
- **State**: Zustand
- **Styling**: Tailwind CSS + shadcn/ui
- **Backend**: Supabase (Auth, DB, Storage)
- **Hosting**: Vercel (app) + Cloudflare Pages (published sites)
- **Payments**: Stripe

---

## FASE 2: Section Builder

### Nuove Funzionalità

1. **Component Library**
   - Hero variants (centered, split, video background)
   - Feature sections (cards, accordion, tabs)
   - Gallery (grid, masonry, carousel)
   - Testimonials
   - Pricing tables
   - CTA sections
   - Custom HTML/embed

2. **Drag & Drop Builder**
   - Reorder sections
   - Add/remove sections
   - Duplicate sections
   - Section templates

3. **Multi-Object Animation**
   - Multiple 3D models
   - Staggered animations
   - Animation groups
   - Triggers (scroll, click, hover)

4. **Advanced Timeline**
   - Multiple tracks (3D, text, elements)
   - Keyframe editing
   - Curve editor for easing
   - Animation preview scrubber

---

## FASE 3: Figma Import

### Funzionalità

1. **Figma Plugin**
   - Export frames as sections
   - Preserve layer structure
   - Export assets automatically
   - Sync changes bidirectionally

2. **Auto-Animation Suggestions**
   - AI suggerisce animazioni basate sul design
   - Pattern recognition (hero, cards, etc.)
   - One-click animation presets

3. **Team Collaboration**
   - Real-time editing
   - Comments
   - Version history
   - Role permissions

---

## Piano Implementazione MVP

### Step 1: Setup Progetto
- [ ] Creare nuovo repo `scrollstudio`
- [ ] Setup Next.js 14 + TypeScript
- [ ] Configurare Supabase (Auth, DB, Storage)
- [ ] Setup Tailwind + shadcn/ui
- [ ] Configurare Stripe

### Step 2: Core Animation Engine
- [ ] Estrarre logica da DebugPage in `animation-engine.ts`
- [ ] Creare `ProjectConfig` interface
- [ ] Implementare loader config → render
- [ ] Test con config Ferrero convertita

### Step 3: Template System
- [ ] Creare struttura template
- [ ] Convertire Ferrero in primo template
- [ ] Template preview component
- [ ] Template selection UI

### Step 4: Content Editor
- [ ] Upload 3D model
- [ ] Text editor per contenuti
- [ ] Color picker per palette
- [ ] Image upload per assets

### Step 5: Animation Editor
- [ ] Portare DebugPage come base
- [ ] Collegare a ProjectConfig
- [ ] Save/load animazioni
- [ ] Presets animazione

### Step 6: Dashboard & Auth
- [ ] Login/Signup flow
- [ ] Projects list
- [ ] Project CRUD
- [ ] User settings

### Step 7: Publishing
- [ ] Preview link generation
- [ ] Subdomain publishing
- [ ] Custom domain (premium)
- [ ] Export code (premium)

### Step 8: Payments
- [ ] Stripe integration
- [ ] Plans (Free, Pro, Team)
- [ ] Usage limits
- [ ] Billing portal

---

## Pricing (Draft)

| Plan | Prezzo | Limiti |
|------|--------|--------|
| **Free** | €0 | 1 progetto, watermark, no custom domain |
| **Pro** | €19/mese | 10 progetti, no watermark, custom domain, export |
| **Team** | €49/mese | Unlimited, collaboration, priority support |

---

## Metriche Successo MVP

- [ ] 100 utenti registrati primo mese
- [ ] 20 progetti pubblicati
- [ ] 5 utenti paganti
- [ ] <3s tempo di load preview
- [ ] NPS > 40
