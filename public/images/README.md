# Image drop

Put the photography here, then set `ASSETS_READY = true` in
`src/content/projects.ts`. That single flag swaps every placeholder for the
real file — no layout, ratio or alt-text changes needed.

Expected filenames (from `src/content/projects.ts`):

| Filename | Slot | Ratio | What it is |
|---|---|---|---|
| `pavilion-exterior-dusk.jpg`  | IM.01 / IM.03 | 16:9 | Pavilion at dusk, folding doors open, warm interior glow |
| `pavilion-bedroom.jpg`        | IM.04 / IM.05 | 3:2  | Coffered timber ceiling, platform bed, garden windows |
| `pavilion-bathroom.jpg`       | IM.05         | 1:1  | Curved terracotta bathroom, sunken tub, pergola above |
| `courtyard-entry-street.jpg`  | IM.03         | 1:1  | Board-formed concrete street elevation, pivot gate |
| `courtyard-entry-hall.jpg`    | IM.02 / IM.04 | 2:3  | Entry hall, pivot door, stone wall, olive trees |
| `courtyard-corridor.jpg`      | IM.05         | 2:3  | Deep window seat looking across the courtyard pool |
| `courtyard-lattice-hall.jpg`  | IM.05         | 2:3  | Lattice screen, checkerboard terracotta floor |
| `olive-kitchen-dining.jpg`    | IM.03 / IM.05 | 2:3  | Exposed beams, terracotta floor, rattan pendants |
| `olive-kitchen-island.jpg`    | IM.04         | 4:5  | Travertine island, dome pendants, dark oak |
| `olive-powder-room.jpg`       | IM.05         | 4:5  | Backlit grid screen, stone basin, walnut vanity |

Names are a convenience, not a constraint — rename the entries in
`projects.ts` if you'd rather keep your own filenames.

Originals please: uncropped, ungraded, largest available. The pipeline
handles resizing and AVIF/WebP conversion.
