import { MetaLabel } from './MetaLabel';

export interface SpecRow {
  label: string;
  value: string;
}

/**
 * The TerraForma spec table: label left, value right, hairline rules.
 * Used on project detail pages. Values are tabular-figured so columns of
 * areas and years line up.
 */
export function SpecTable({ rows, caption }: { rows: SpecRow[]; caption?: string }) {
  return (
    <div className="spec-table">
      {caption && <MetaLabel className="spec-table__caption">{caption}</MetaLabel>}
      <dl className="spec-table__list">
        {rows.map((r) => (
          <div className="spec-table__row" key={r.label}>
            <dt>{r.label}</dt>
            <dd>{r.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
