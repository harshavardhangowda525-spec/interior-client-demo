export type Project = {
  slug: string
  index: string
  title: string
  category: string
  location: string
  year: string
  summary: string
  story: string[]
  palette: { name: string; hex: string }[]
  image: string
  detail: string
  alt: string
  detailAlt: string
}

/**
 * Sample concept projects. Imagery is AI-generated for demonstration and
 * these are not presented as completed commissions — replace with the
 * studio's real portfolio before publishing.
 */
export const projects: Project[] = [
  {
    slug: 'the-solstice-residence',
    index: '01',
    title: 'The Solstice Residence',
    category: 'Residential',
    location: 'Location to be confirmed',
    year: 'Concept',
    summary: 'A contemporary family home shaped around warm timber, natural stone and the path of the sun.',
    story: [
      'The plan follows the day: breakfast in the eastern light, long dinners as the sun drops behind the clerestory.',
      'White oak ceiling slats soften the acoustics of the open plan, while honed limestone walls hold the warmth of the afternoon.',
    ],
    palette: [
      { name: 'White oak', hex: '#c8a77c' },
      { name: 'Limestone', hex: '#d9cbb4' },
      { name: 'Honey', hex: '#b88a4e' },
      { name: 'Ivory', hex: '#efe8dc' },
    ],
    image: 'proj-solstice',
    detail: 'detail-solstice',
    alt: 'Open-plan living and dining room with white oak ceiling slats, limestone walls and a long oak table in low sunlight',
    detailAlt: 'Oak ceiling slats meeting a honed limestone wall with a band of sunlight',
  },
  {
    slug: 'the-ivory-penthouse',
    index: '02',
    title: 'The Ivory Penthouse',
    category: 'Residential',
    location: 'Location to be confirmed',
    year: 'Concept',
    summary: 'A minimalist city penthouse where sculptural furniture and curved plaster frame the skyline.',
    story: [
      'A single tonal palette lets form do the talking: curved walls, rounded bouclé seating, a monolithic marble table.',
      'Indirect light is concealed in every cove so the apartment glows at dusk without a visible fitting.',
    ],
    palette: [
      { name: 'Ivory plaster', hex: '#ece4d6' },
      { name: 'Bouclé', hex: '#e2d9c8' },
      { name: 'Statuario', hex: '#f2efea' },
      { name: 'Dusk', hex: '#6d6a74' },
    ],
    image: 'proj-ivory',
    detail: 'detail-ivory',
    alt: 'Minimalist ivory penthouse lounge with sculptural bouclé chairs, marble table and a panoramic city view at dusk',
    detailAlt: 'Curved ivory plaster wall beside a bouclé chair and marble side table',
  },
  {
    slug: 'the-terra-villa',
    index: '03',
    title: 'The Terra Villa',
    category: 'Residential',
    location: 'Location to be confirmed',
    year: 'Concept',
    summary: 'An earth-toned villa built from clay, timber and linen, opening onto a sunlit courtyard.',
    story: [
      'Clay plaster walls and exposed beams give the villa a quiet, handmade warmth.',
      'Arched openings frame the courtyard olive trees so the garden becomes part of every room.',
    ],
    palette: [
      { name: 'Terracotta', hex: '#b3653f' },
      { name: 'Clay', hex: '#c9946d' },
      { name: 'Jute', hex: '#b9a07a' },
      { name: 'Olive', hex: '#6f7350' },
    ],
    image: 'proj-terra',
    detail: 'detail-terra',
    alt: 'Earth-toned villa living room with terracotta plaster walls, timber beams and arches opening to a courtyard',
    detailAlt: 'Terracotta vessel on a timber bench in front of a clay plaster niche',
  },
  {
    slug: 'the-urban-sanctuary',
    index: '04',
    title: 'The Urban Sanctuary',
    category: 'Apartment',
    location: 'Location to be confirmed',
    year: 'Concept',
    summary: 'A compact city apartment made generous through precise, space-efficient joinery.',
    story: [
      'A single walnut wall hides storage, a fold-out desk and the clutter of daily life.',
      'Sheer linen and a restrained taupe palette keep the small footprint calm and light.',
    ],
    palette: [
      { name: 'Walnut', hex: '#5a3b28' },
      { name: 'Taupe', hex: '#8b7d70' },
      { name: 'Linen', hex: '#d8cfc0' },
      { name: 'Charcoal', hex: '#3a3836' },
    ],
    image: 'proj-urban',
    detail: 'detail-urban',
    alt: 'Compact modern apartment with an integrated walnut joinery wall, fold-out desk and linen curtains',
    detailAlt: 'Walnut cabinet with a flush brass finger pull and fold-out desk',
  },
  {
    slug: 'the-monolith-residence',
    index: '05',
    title: 'The Monolith Residence',
    category: 'Residential',
    location: 'Location to be confirmed',
    year: 'Concept',
    summary: 'A dramatic home anchored by monolithic veined stone and blades of natural light.',
    story: [
      'The kitchen island and feature wall are cut from the same block, so the veining flows uninterrupted.',
      'Smoked oak and bronze temper the stone, while a single slot window draws a moving line of light.',
    ],
    palette: [
      { name: 'Verde stone', hex: '#4b5450' },
      { name: 'Smoked oak', hex: '#4a3a2e' },
      { name: 'Bronze', hex: '#8a6a45' },
      { name: 'Graphite', hex: '#2a2a2a' },
    ],
    image: 'proj-monolith',
    detail: 'detail-monolith',
    alt: 'Double-height kitchen with a monolithic veined marble island and marble wall, bronze pendants and smoked oak floor',
    detailAlt: 'Dark veined marble countertop edge with a brushed bronze tap',
  },
  {
    slug: 'the-atelier-workspace',
    index: '06',
    title: 'The Atelier Workspace',
    category: 'Commercial',
    location: 'Location to be confirmed',
    year: 'Concept',
    summary: 'A premium creative workspace with fluted plaster, oak worktables and a material library.',
    story: [
      'Long oak tables encourage collaboration, while a glazed meeting room keeps sightlines open.',
      'Fluted columns and linear lighting give the commercial space the detail of a private residence.',
    ],
    palette: [
      { name: 'Oak', hex: '#b48d5f' },
      { name: 'Fluted plaster', hex: '#e3dccf' },
      { name: 'Concrete', hex: '#9d9790' },
      { name: 'Steel', hex: '#2f3130' },
    ],
    image: 'proj-atelier',
    detail: 'detail-atelier',
    alt: 'Design studio workspace with long oak worktables, fluted plaster columns and a glazed meeting room',
    detailAlt: 'Fluted plaster column beside an oak worktable with material sample boards',
  },
]

export const getProject = (slug: string | undefined) => projects.find((p) => p.slug === slug)
