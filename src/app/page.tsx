import { Section } from '@/components/layout/Section';
import { Field } from '@/components/layout/Field';
import { Rail } from '@/components/layout/Rail';
import { SpecTable } from '@/components/type/SpecTable';
import { MetaLabel, CoordinateStamp } from '@/components/type/MetaLabel';
import { MaskUp, MetaIn, Counter, Veil } from '@/lib/motion/primitives';
import { LightFall } from '@/components/media/LightFall';
import { PROJECTS, SERVICES, HERO } from '@/content/projects';
import { Figure } from '@/components/media/Figure';
import Link from 'next/link';

/**
 * FOUNDATIONS GALLERY — temporary.
 *
 * This route exists so the motion primitives and layout components can be
 * built and reviewed before any photography arrives. It is replaced by the
 * real home page once imagery lands (see design/asset-brief.md, sheet C.01).
 *
 * Image slots are marked with their schedule reference so they can be
 * filled without touching layout.
 */


const SPEC = [
  { label: 'Year completed', value: '2025' },
  { label: 'Gross floor area', value: '412 m²' },
  { label: 'Typology', value: 'Residence' },
  { label: 'Ceiling height', value: '5.4 m' },
  { label: 'Status', value: 'Completed' },
];

export default function Page() {
  return (
    <>
      {/* ---- MO.01 mask-up + IM.01 hero slot ---- */}
      <Section>
        <Field>
          <div style={{ gridColumn: '1 / -1' }}>
            <MetaIn>
              <MetaLabel>Foundations · Rev A · no imagery yet</MetaLabel>
            </MetaIn>
            <MaskUp as="h1" className="display-xl" delay={0.1}>
              spaces that feel like they were always meant to be there
            </MaskUp>
          </div>
        </Field>
      </Section>

      {/* ---- IM.01 · W.01: the real hero image drops into src ---- */}
      <Section bleed flush>
        <Veil>
          <div data-veil-inner data-image-slot="IM.01">
            <LightFall label="IM.01 · Home hero · 16:9 · awaiting photography" />
          </div>
        </Veil>
      </Section>

      {/* ---- the Villa Lumière metadata furniture ---- */}
      <Section>
        <Field>
          <div style={{ gridColumn: '1 / -1', display: 'flex', gap: 'var(--s-7)', flexWrap: 'wrap' }}>
            <CoordinateStamp lat={43.7031} lon={5.45} />
            <MetaLabel>Provence, 2025</MetaLabel>
            <MetaLabel>Designed by Jean-Pierre Lefèvre</MetaLabel>
          </div>
          <p className="statement" style={{ gridColumn: '1 / -1', marginTop: 'var(--s-6)' }}>
            A secluded residence surrounded by olive terraces and low stone walls.
          </p>
        </Field>
      </Section>

      {/* ---- MO.06 counter, the Volzhsky slash rail ---- */}
      <Section>
        <Field>
          {[
            { n: 18, label: 'Projects completed', suffix: '' },
            { n: 12, label: 'Years practising', suffix: '' },
            { n: 4, label: 'Countries', suffix: '' },
            { n: 9400, label: 'Square metres delivered', suffix: ' m²' },
          ].map((stat, i) => (
            <div key={stat.label} style={{ gridColumn: 'span 3' }}>
              <MetaLabel>{`/${i + 1}`}</MetaLabel>
              <p className="display-m" style={{ fontVariantNumeric: 'tabular-nums', marginTop: 'var(--s-2)' }}>
                <Counter value={stat.n} suffix={stat.suffix} />
              </p>
              <p className="meta" style={{ marginTop: 'var(--s-2)' }}>{stat.label}</p>
            </div>
          ))}
        </Field>
      </Section>

      {/* ---- selected work · project cards ---- */}
      <Section>
        <Field>
          <div style={{ gridColumn: '1 / -1' }}>
            <MetaLabel>Selected work</MetaLabel>
            <MaskUp as="h2" className="display-l" >
              Three houses, one language
            </MaskUp>
          </div>
          <div className="span-all work-grid">
            {PROJECTS.map((p) => (
              <Link href={`/work`} key={p.slug} className="work-card">
                <Figure image={p.card} sizes="(min-width: 1024px) 33vw, 84vw" />
                <div className="work-card__cap">
                  <MetaLabel>{`${p.place} · ${p.status}`}</MetaLabel>
                  <p className="work-card__title">{p.name}</p>
                </div>
              </Link>
            ))}
          </div>
        </Field>
      </Section>

      {/* ---- MO.04 rail, on the linen inversion ---- */}
      <Section tone="light">
        <Field>
          <div style={{ gridColumn: '1 / -1' }}>
            <MetaLabel>Services</MetaLabel>
            <MaskUp as="h2" className="display-l" >
              Crafting considered space
            </MaskUp>
          </div>
          <div style={{ gridColumn: '1 / -1', marginTop: 'var(--s-7)' }}>
            <Rail label="Services">
              {SERVICES.map((s) => (
                <article key={s.n} data-rail-item className="rail__card">
                  <MetaLabel>{s.n}</MetaLabel>
                  <h3 className="display-m" style={{ marginTop: 'var(--s-3)' }}>{s.title}</h3>
                  <p className="prose" style={{ marginTop: 'var(--s-4)', fontSize: 'var(--t-caption)' }}>{s.body}</p>
                </article>
              ))}
            </Rail>
          </div>
        </Field>
      </Section>

      {/* ---- TerraForma spec table ---- */}
      <Section>
        <Field>
          <div style={{ gridColumn: '1 / -1', maxWidth: '640px' }}>
            <SpecTable rows={SPEC} caption="Project specification" />
          </div>
        </Field>
      </Section>
    </>
  );
}
