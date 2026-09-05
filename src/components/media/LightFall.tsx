'use client';

import { useEffect, useRef } from 'react';
import { useCapability } from '@/lib/motion/capability';
import { FRAG, VERT } from '@/lib/gl/lightfall.glsl';

/**
 * W.01 — hero light-fall, with the sheet B.02 fallback ladder.
 *
 *   T1  this shader
 *   T2  the CSS gradient underneath, animated
 *   T3  the CSS gradient, static
 *
 * The gradient is always in the DOM. The canvas paints over it only once
 * WebGL2 has actually initialised, so every failure mode lands on a
 * finished-looking panel instead of a hole.
 */
export function LightFall({
  src,
  className,
  ratio = '16 / 9',
  label,
}: {
  /** IM.01 when it lands. Omit for the procedural interior. */
  src?: string;
  className?: string;
  ratio?: string;
  label?: string;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { tier, measured } = useCapability();

  useEffect(() => {
    if (!measured || tier !== 1) return;
    const host = hostRef.current;
    const canvas = canvasRef.current;
    if (!host || !canvas) return;

    let raf = 0;
    let disposed = false;
    const cleanupFns: Array<() => void> = [];

    (async () => {
      const { Renderer, Program, Mesh, Triangle, Texture } = await import('ogl');
      if (disposed) return;

      const renderer = new Renderer({ canvas, alpha: false, dpr: Math.min(window.devicePixelRatio, 2) });
      const gl = renderer.gl;

      const texture = new Texture(gl);
      const program = new Program(gl, {
        vertex: VERT,
        fragment: FRAG,
        uniforms: {
          uTime: { value: 0 },
          uRes: { value: [host.clientWidth, host.clientHeight] },
          uPointer: { value: [0, 0] },
          uHasTex: { value: 0 },
          uTex: { value: texture },
          uReveal: { value: 1 },
        },
      });
      const mesh = new Mesh(gl, { geometry: new Triangle(gl), program });

      if (src) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          if (disposed) return;
          texture.image = img;
          program.uniforms.uHasTex.value = 1;
        };
        img.src = src;
      }

      const resize = () => {
        const w = host.clientWidth;
        const h = host.clientHeight;
        renderer.setSize(w, h);
        program.uniforms.uRes.value = [w, h];
      };
      resize();
      const ro = new ResizeObserver(resize);
      ro.observe(host);
      cleanupFns.push(() => ro.disconnect());

      // Pointer parallax, heavily damped (lerp 0.04) so it drifts rather
      // than tracks. Tracking the cursor exactly reads as a gimmick.
      const target = { x: 0, y: 0 };
      const current = { x: 0, y: 0 };
      const onMove = (e: PointerEvent) => {
        const r = host.getBoundingClientRect();
        target.x = ((e.clientX - r.left) / r.width) * 2 - 1;
        target.y = ((e.clientY - r.top) / r.height) * 2 - 1;
      };
      const onLeave = () => { target.x = 0; target.y = 0; };
      host.addEventListener('pointermove', onMove);
      host.addEventListener('pointerleave', onLeave);
      cleanupFns.push(() => {
        host.removeEventListener('pointermove', onMove);
        host.removeEventListener('pointerleave', onLeave);
      });

      // Pause when off-screen — a hero shader must not burn battery while
      // the visitor is reading the footer.
      let visible = true;
      const io = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; });
      io.observe(host);
      cleanupFns.push(() => io.disconnect());

      const start = performance.now();
      const frame = (now: number) => {
        raf = requestAnimationFrame(frame);
        if (!visible) return;
        current.x += (target.x - current.x) * 0.04;
        current.y += (target.y - current.y) * 0.04;
        program.uniforms.uPointer.value = [current.x, current.y];
        program.uniforms.uTime.value = (now - start) / 1000;
        renderer.render({ scene: mesh });
      };
      raf = requestAnimationFrame(frame);

      canvas.dataset.gl = 'on';
    })().catch(() => {
      // WebGL2 acquired but ogl or the program failed. Stay on the gradient.
      if (canvasRef.current) canvasRef.current.dataset.gl = 'failed';
    });

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      cleanupFns.forEach((fn) => fn());
    };
  }, [measured, tier, src]);

  return (
    <div
      ref={hostRef}
      className={`lightfall ${className ?? ''}`.trim()}
      style={{ aspectRatio: ratio }}
      data-tier={measured ? tier : 3}
    >
      {/* T2/T3 ground. Always present; the canvas paints over it. */}
      <div className="lightfall__ground" aria-hidden="true" />
      {src && <img className="lightfall__img" src={src} alt="" aria-hidden="true" />}
      <canvas ref={canvasRef} className="lightfall__canvas" aria-hidden="true" />
      {label && <span className="lightfall__label meta">{label}</span>}
    </div>
  );
}
