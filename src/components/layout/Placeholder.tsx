import { Section } from './Section';
import { Field } from './Field';
import { MetaLabel } from '@/components/type/MetaLabel';

/**
 * Temporary route stub. Each of these becomes a real page once photography
 * and copy land — see design/asset-brief.md. Present now so the header
 * navigates somewhere real and prefetch does not 404.
 */
export function Placeholder({ title, sheet }: { title: string; sheet: string }) {
  return (
    <Section>
      <Field>
        <div style={{ gridColumn: '1 / -1' }}>
          <MetaLabel>{sheet}</MetaLabel>
          <h1 className="display-l" style={{ marginTop: 'var(--s-4)' }}>{title}</h1>
          <p className="lede" style={{ marginTop: 'var(--s-6)' }}>
            Awaiting photography and copy. The layout components this page needs
            are built and live in the foundations gallery on the home route.
          </p>
        </div>
      </Field>
    </Section>
  );
}
