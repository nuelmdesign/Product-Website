/**
 * Content model.
 *
 * Bound to the ten supplied references, now living in public/images.
 *
 * Two art-direction decisions came out of their actual aspect ratios rather
 * than the original schedule:
 *
 *  1. Project cards moved from 3:4 to 4:5. Every supplied portrait sits
 *     between 0.563 and 0.807, so 4:5 (0.8) crops them far less than 3:4.
 *  2. Olive House's panel is the kitchen island, not the kitchen/dining
 *     shot. The dining image is 0.563 — cropping that to a landscape
 *     viewport would discard about two thirds of it.
 *
 * `focal` is the object-position for each slot, chosen so the crop keeps the
 * subject rather than centring blindly. `tint` is the colour the slot paints
 * while the image decodes.
 */

export const ASSETS_READY = true;

export interface ProjectImage {
  ref: 'IM.01' | 'IM.02' | 'IM.03' | 'IM.04' | 'IM.05' | 'IM.07' | 'IM.09';
  src: string;
  alt: string;
  /** Display ratio for the slot — not the file's native ratio. */
  ratio: string;
  focal: string;
  tint: [string, string];
}

export interface Project {
  slug: string;
  name: string;
  place: string;
  country: string;
  lat: number;
  lon: number;
  typology: string;
  area: string;
  /** Design visualisations, not photographs of completed buildings. */
  status: 'Visualisation' | 'In progress' | 'Completed';
  summary: string;
  body: string[];
  panel: ProjectImage;
  card: ProjectImage;
  gallery: ProjectImage[];
}

export const PROJECTS: Project[] = [
  {
    slug: 'pavilion-house',
    name: 'Pavilion House',
    place: 'Lagos',
    country: 'Nigeria',
    lat: 6.4281,
    lon: 3.4219,
    typology: 'Residence',
    area: '480 m²',
    status: 'Visualisation',
    summary:
      'A single-storey pavilion that opens along its whole length. Folding timber doors dissolve the wall, so the garden becomes the fourth room.',
    body: [
      'The plan is one long bar under a deep slatted eave. Every principal room faces the garden through full-height folding doors, and when they are open the house has no facade at all — only a threshold.',
      'Inside, a coffered timber ceiling carries the light deep into the plan. The bed sits on a raised platform of woven matting, so the floor changes underfoot before the room changes.',
      'The bathroom is the exception: a curved terracotta drum open to the sky, planted at its edge, lit only by what falls through the pergola.',
    ],
    panel: {
      ref: 'IM.03', src: '/images/pavilion-exterior-dusk.png', ratio: '16 / 9', focal: 'center 58%',
      alt: 'The pavilion at dusk, its folding timber doors open along the full length, warm interior light spilling across a planted garden.',
      tint: ['#E0B98A', '#2A2018'],
    },
    card: {
      ref: 'IM.04', src: '/images/pavilion-bathroom.png', ratio: '4 / 5', focal: 'center 45%',
      alt: 'Curved terracotta-tiled bathroom with a sunken tub, a tree growing at its edge, open to the sky through a slatted pergola.',
      tint: ['#C98A66', '#8A4F35'],
    },
    gallery: [
      { ref: 'IM.05', src: '/images/pavilion-bedroom.png', ratio: '3 / 2', focal: 'center center',
        alt: 'Bedroom under a coffered timber ceiling, with a low platform bed and full-height windows onto the garden.', tint: ['#C09664', '#4A3527'] },
      { ref: 'IM.05', src: '/images/pavilion-bathroom.png', ratio: '1 / 1', focal: 'center center',
        alt: 'The terracotta bathroom drum seen from the vanity, planting along the curved wall.', tint: ['#C98A66', '#8A4F35'] },
    ],
  },
  {
    slug: 'courtyard-house',
    name: 'Courtyard House',
    place: 'Marrakesh',
    country: 'Morocco',
    lat: 31.6295,
    lon: -7.9811,
    typology: 'Residence',
    area: '610 m²',
    status: 'Visualisation',
    summary:
      'Board-formed concrete on the street, and a sequence of planted courtyards behind it. The house is entered sideways, never head-on.',
    body: [
      'From the road the house gives almost nothing away: a concrete wall, a pivoting timber gate, and a planted colonnade running back into the site. You arrive along the building rather than at it.',
      'The entry hall is lit from above through a slot cut in the roof, so the olive tree in the courtyard is visible before the door is even open.',
      'A long corridor runs the depth of the plan with one deep window seat cut into it, looking across a still pool to the far wing. It is the only place in the house where both ends are visible at once.',
    ],
    panel: {
      ref: 'IM.03', src: '/images/courtyard-entry-street.png', ratio: '16 / 9', focal: 'center 62%',
      alt: 'Street elevation in board-formed concrete with a pivoting timber gate opening onto a lit, planted colonnade.',
      tint: ['#C4AC85', '#3E3226'],
    },
    card: {
      ref: 'IM.04', src: '/images/courtyard-entry-hall.png', ratio: '4 / 5', focal: 'center 42%',
      alt: 'Entry hall with a pivot door standing open, a rough stone wall, and olive trees in the courtyard beyond.',
      tint: ['#C4A882', '#4A3A28'],
    },
    gallery: [
      { ref: 'IM.05', src: '/images/courtyard-corridor.png', ratio: '2 / 3', focal: 'center center',
        alt: 'Corridor with a deep timber-framed window seat looking across a courtyard pool to an arched opening.', tint: ['#A8825A', '#3A2A20'] },
      { ref: 'IM.05', src: '/images/courtyard-lattice-hall.png', ratio: '2 / 3', focal: 'center center',
        alt: 'Hallway with a full-height lattice screen and a checkerboard terracotta floor.', tint: ['#D6C4A6', '#7A5334'] },
    ],
  },
  {
    slug: 'olive-house',
    name: 'Olive House',
    place: 'Provence',
    country: 'France',
    lat: 43.7031,
    lon: 5.45,
    typology: 'Residence',
    area: '412 m²',
    status: 'Visualisation',
    summary:
      'Reclaimed beams, lime plaster and a terracotta floor. A house organised around the table rather than the view.',
    body: [
      'The kitchen and dining room share one volume under exposed beams, with a roof light cut between them so the table is lit from directly above at midday.',
      'The working kitchen is lined in dark oak and capped with a single travertine slab that runs the full length of the island.',
      'Throughout, the palette holds to four materials: lime plaster, oak, travertine and terracotta. Nothing else is introduced.',
    ],
    panel: {
      ref: 'IM.03', src: '/images/olive-kitchen-island.png', ratio: '16 / 9', focal: 'center 48%',
      alt: 'Kitchen with a long travertine island, dome pendants and dark oak joinery, opening to a garden.',
      tint: ['#C2A882', '#4E3423'],
    },
    card: {
      ref: 'IM.04', src: '/images/olive-powder-room.png', ratio: '4 / 5', focal: 'center center',
      alt: 'Powder room with a backlit grid screen, a stone basin and a walnut vanity.',
      tint: ['#C79A5C', '#4A3020'],
    },
    gallery: [
      { ref: 'IM.05', src: '/images/olive-kitchen-dining.png', ratio: '9 / 16', focal: 'center center',
        alt: 'Kitchen and dining room under exposed beams, with a terracotta floor and rattan pendants.', tint: ['#D8C7AC', '#6A4632'] },
      { ref: 'IM.05', src: '/images/olive-kitchen-island.png', ratio: '4 / 5', focal: 'center center',
        alt: 'The travertine island seen along its length, with turned oak stools.', tint: ['#C2A882', '#4E3423'] },
    ],
  },
];

/** IM.01 / IM.02 — the home hero. */
export const HERO = {
  desktop: {
    ref: 'IM.01' as const,
    src: '/images/pavilion-exterior-dusk.png',
    /** Downscaled derivative — the shader uploads this as a GL texture. */
    texture: '/images/derived/hero-texture.jpg',
    ratio: '16 / 9',
    focal: 'center 58%',
    alt: 'A low timber pavilion at dusk with its folding doors open, warm light spilling across a planted garden.',
    tint: ['#E0B98A', '#241A14'] as [string, string],
  },
  mobile: {
    ref: 'IM.02' as const,
    src: '/images/courtyard-entry-hall.png',
    ratio: '4 / 5',
    focal: 'center 42%',
    alt: 'Entry hall with a pivot door open onto a courtyard of olive trees.',
    tint: ['#C4A882', '#2A2018'] as [string, string],
  },
};

export const SERVICES = [
  { n: '/1', title: 'Architecture',
    body: 'From first sketch to final handover. Residential and hospitality work at every scale.' },
  { n: '/2', title: 'Interior',
    body: 'Materials, light and furniture, resolved as one decision rather than three.' },
  { n: '/3', title: 'Delivery',
    body: 'Consultants, contractors and programme, held to the drawing set.' },
  { n: '/4', title: 'Furniture',
    body: 'Pieces made for a specific room, when nothing off the shelf will sit right.' },
];
