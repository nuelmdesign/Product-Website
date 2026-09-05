import { PROJECTS } from '@/content/projects';
import { PanelStack } from '@/components/layout/PanelStack';
import { Figure } from '@/components/media/Figure';
import { MaskUp } from '@/lib/motion/primitives';
import { MetaLabel, CoordinateStamp } from '@/components/type/MetaLabel';

export const metadata = { title: 'Work' };

/**
 * The project index — MO.03 panel-stack, one project per viewport.
 * The Villa Lumière furniture (coordinates, place, status) sits over the
 * image; the description sits bottom-right, where the reference puts it.
 */
export default function Page() {
  return (
    <>
      <h1 className="sr-only">Work</h1>
      <PanelStack>
        {PROJECTS.map((p) => (
          <article className="project-panel" key={p.slug}>
          <Figure image={p.panel} className="project-panel__media" sizes="100vw" showRef={false} />
          <div className="project-panel__grid">
            <div className="project-panel__top">
              <CoordinateStamp lat={p.lat} lon={p.lon} />
              <MetaLabel>{`${p.place} · ${p.country}`}</MetaLabel>
              <MetaLabel>{p.status}</MetaLabel>
            </div>
            <div className="project-panel__bottom">
              <MaskUp as="h2" className="display-l project-panel__title">
                {p.name}
              </MaskUp>
              <p className="project-panel__summary">{p.summary}</p>
            </div>
          </div>
        </article>
        ))}
      </PanelStack>
    </>
  );
}
