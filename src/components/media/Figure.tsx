import Image from 'next/image';
import { ASSETS_READY, type ProjectImage } from '@/content/projects';
import { Veil } from '@/lib/motion/primitives';
import { MetaLabel } from '@/components/type/MetaLabel';

/**
 * One image slot.
 *
 * Until the photography lands (ASSETS_READY = false) this renders a gradient
 * built from the tint sampled off that specific reference, so the page reads
 * as the room it will become rather than as a grey box. The alt text, ratio,
 * focal behaviour and reveal are already final — swapping in the file changes
 * nothing about the layout.
 */
export function Figure({
  image,
  className,
  priority = false,
  sizes = '100vw',
  showRef = true,
}: {
  image: ProjectImage;
  className?: string;
  priority?: boolean;
  sizes?: string;
  showRef?: boolean;
}) {
  return (
    <Veil className={className}>
      <div className="figure" style={{ aspectRatio: image.ratio }}>
        {ASSETS_READY ? (
          <Image
            src={image.src}
            alt={image.alt}
            fill
            sizes={sizes}
            priority={priority}
            className="figure__img"
            style={{ objectPosition: image.focal }}
            data-veil-inner
          />
        ) : (
          <div
            className="figure__placeholder"
            data-veil-inner
            role="img"
            aria-label={image.alt}
            style={{
              backgroundImage: `radial-gradient(ellipse 62% 48% at 44% -8%, ${image.tint[0]}55, transparent 68%), linear-gradient(163deg, ${image.tint[0]} 0%, ${image.tint[1]} 78%)`,
            }}
          />
        )}
        {!ASSETS_READY && showRef && (
          <MetaLabel className="figure__ref">{`${image.ref} · awaiting file`}</MetaLabel>
        )}
      </div>
    </Veil>
  );
}
