# LUMORA INTERIORS — premium interior design website (concept demo)

A cinematic, production-ready website concept for a luxury interior design studio, built by
**Infinity Web & Apps** to show what a premium interior design business could have.

**Stack:** React 19 · TypeScript · Vite · Tailwind CSS v4 · GSAP + ScrollTrigger + SplitText ·
`<model-viewer>` (3D) · Vercel serverless function · Supabase (enquiry storage)

## What's inside

| Section | Highlights |
| --- | --- |
| **Hero** | The Soda-style hero adapted for interiors: radial gradient over a looping architectural video, a 3D lounge chair that tilts toward the cursor, three **finish cards** (Walnut / White Oak / Smoked Oak) that trigger a choreographed switch — background morph, 720° chair spin with motion blur, real **texture swap** on the model at the peak, material tiles that implode and burst back out. Floating stone/timber/metal tiles are repelled by the pointer; light motes drift upward. |
| **Scroll sequence** | Pinned GSAP ScrollTrigger section that **scrubs a real video** (`currentTime` mapped to scroll progress, short-GOP H.264 for fast seeking). Four scenes: empty room → blueprint lines drawing + material swatches → sketch-to-photo transformation with a brief before/after split → finished room. Reverses correctly when scrolling up. Falls back to still-image crossfades until the video is ready, or if seeking is too slow on the device. |
| **Portfolio** | Six concept projects; images expand from a crop into full compositions, cursor-following detail preview, dedicated pages at `/projects/<slug>` with palette, story and enquiry CTA. |
| **Before / after** | Draggable, touch and keyboard accessible (`role="slider"`, arrows / Shift / Home / End) with matched compositions. |
| **Services, Materials, Studio** | Editorial services with sticky crossfading image; floating material gallery with cursor parallax + interactive material explorer; architectural wireframe that draws itself before the photograph takes over. |
| **Trust** | Clearly labelled *demonstration placeholder* testimonials; stats, credentials, memberships and media render only when real entries are configured. |
| **Consultation** | Validated enquiry form (client + server), honeypot, minimum fill time, rate limiting, idempotency key against duplicates, honest success/error states, privacy notice. |
| **Extras** | WhatsApp button (single configurable number), vertical scroll progress rail, custom pointer ring, View Transitions page fades, film grain, reduced-motion support, mobile menu with focus trap. |

## Getting started

```bash
npm install
cp .env.example .env.local   # fill in what you have
npm run dev                  # http://localhost:5173
```

`npm run dev` serves the site only. To exercise the enquiry API locally use the Vercel CLI:
`npx vercel dev`.

Other scripts: `npm run build` (typecheck + production build), `npm run preview`, `npm run lint`.

## Configuration

Everything business-specific lives in **`src/config/site.ts`** and environment variables
(see `.env.example`). Nothing is invented — empty fields are hidden.

| Setting | Where |
| --- | --- |
| Domain (canonical, OG, sitemap, robots) | `VITE_SITE_URL` |
| WhatsApp number (single setting) | `VITE_WHATSAPP_NUMBER` — digits, international format |
| Email / phone / Instagram | `VITE_CONTACT_EMAIL`, `VITE_CONTACT_PHONE`, `VITE_INSTAGRAM_URL` |
| Address, service area, opening hours (local SEO + JSON-LD) | `site.address`, `site.serviceArea`, `site.openingHours` in `src/config/site.ts` |
| Verified stats / credentials / memberships / media | `trust` in `src/config/site.ts` |
| Real testimonials | `demoTestimonials` in `src/data/content.ts`, then set `trust.testimonialsAreVerified = true` |
| Projects | `src/data/projects.ts` (+ images in `public/images`) |
| Budget bands / project types | `src/lib/enquiry.ts` |

## Activating real enquiries (Supabase + Vercel)

1. Create a Supabase project and run `supabase/schema.sql` in the SQL editor (RLS on, no public access).
2. In Vercel → Project → Settings → Environment Variables add:
   - `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (server-only — never prefix with `VITE_`)
   - optional `ALLOWED_ORIGIN` (your domain)
   - optional email alerts via Resend: `RESEND_API_KEY`, `ENQUIRY_NOTIFY_EMAIL`, `ENQUIRY_FROM_EMAIL`
3. Redeploy. Until the Supabase variables exist the API returns **503** and the form tells visitors
   their message was *not* sent — it never shows a false success.

Submissions appear in Supabase → Table editor → `enquiries`.

## Deploying

**Vercel (recommended):** import the repo, framework preset *Vite*, add the env vars above, deploy.
`vercel.json` handles SPA routes, long-term caching for media and security headers.

Any static host works for the front end (`dist/`), but `/api/enquiry` needs Vercel — or point
`VITE_ENQUIRY_ENDPOINT` at another backend that accepts the same JSON.

## Assets & licensing

- **Imagery:** AI-generated in Floot for this demo (hero, scenes, projects, services, textures).
  Projects are concept studies, not completed commissions — replace with the studio's real work.
- **Videos:** `hero-1280.*` and `transformation-*.mp4` are rendered from the Floot stills (camera
  moves, light sweeps and the sketch-to-photo wipe); `studio-ambient.mp4` is free stock footage from
  [Mixkit](https://mixkit.co/license/#videoFree).
- **3D chair:** Khronos glTF Sample Assets “SheenChair” (CC0), optimised (WebP textures, neutral sheen).
- **Fonts:** Cormorant Garamond + Manrope (Google Fonts, OFL).

## Performance & accessibility notes

- `<model-viewer>` (incl. three.js) is lazy-loaded after first paint; the scroll video loads only when
  its section approaches; off-screen videos pause; images are WebP with small-screen variants.
- On screens under 1024px, or with `prefers-reduced-motion`, the pinned sequence becomes a stacked,
  lightweight version; reduced motion also disables spins, drift, grain and reveals.
- Semantic landmarks, skip link, visible focus styles, labelled form fields with inline errors,
  keyboard-operable slider, menu and finish selector.
