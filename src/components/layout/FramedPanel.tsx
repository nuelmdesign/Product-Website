import type { ReactNode } from 'react';

/**
 * The inset-hero treatment from CasaNueve and Volzhsky Bereg: content sits
 * in a framed panel with the ground visible around it, rather than bleeding
 * to the viewport edge. Optionally with the scrim-blur backdrop — a blurred,
 * darkened copy of the same image behind the frame.
 */
export function FramedPanel({
  children,
  backdrop,
  className,
}: {
  children: ReactNode;
  /** Image URL for the blurred backdrop layer. */
  backdrop?: string;
  className?: string;
}) {
  return (
    <div className={`framed ${className ?? ''}`.trim()}>
      {backdrop && (
        <div
          className="framed__backdrop"
          style={{ backgroundImage: `url(${backdrop})` }}
          aria-hidden="true"
        />
      )}
      <div className="framed__inner">{children}</div>
    </div>
  );
}
