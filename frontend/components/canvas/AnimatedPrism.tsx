"use client";

import { useEffect, useRef } from "react";

export function AnimatedPrism() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let time = 0;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };

    resize();
    window.addEventListener("resize", resize);

    // 3D Triangular Prism Vertices
    // Top triangle (y = 0.85) and Bottom triangle (y = -0.85) + Apex center points for crystal faceting
    const r = 0.95;
    const h = 0.9;
    const vertices = [
      // Top base (0, 1, 2)
      { x: r * Math.cos(0), y: h, z: r * Math.sin(0) },
      { x: r * Math.cos((2 * Math.PI) / 3), y: h, z: r * Math.sin((2 * Math.PI) / 3) },
      { x: r * Math.cos((4 * Math.PI) / 3), y: h, z: r * Math.sin((4 * Math.PI) / 3) },
      // Bottom base (3, 4, 5)
      { x: r * Math.cos(0), y: -h, z: r * Math.sin(0) },
      { x: r * Math.cos((2 * Math.PI) / 3), y: -h, z: r * Math.sin((2 * Math.PI) / 3) },
      { x: r * Math.cos((4 * Math.PI) / 3), y: -h, z: r * Math.sin((4 * Math.PI) / 3) },
      // Top apex & bottom apex for crystal prism symmetry (6, 7)
      { x: 0, y: h * 1.35, z: 0 },
      { x: 0, y: -h * 1.35, z: 0 },
    ];

    const edges = [
      // Top triangle
      [0, 1], [1, 2], [2, 0],
      // Bottom triangle
      [3, 4], [4, 5], [5, 3],
      // Vertical pillars connecting top and bottom
      [0, 3], [1, 4], [2, 5],
      // Diagonals for faceted prism look
      [0, 4], [1, 5], [2, 3],
      // Top apex cap
      [6, 0], [6, 1], [6, 2],
      // Bottom apex cap
      [7, 3], [7, 4], [7, 5],
    ];

    const rotateY = (point: { x: number; y: number; z: number }, angle: number) => ({
      x: point.x * Math.cos(angle) - point.z * Math.sin(angle),
      y: point.y,
      z: point.x * Math.sin(angle) + point.z * Math.cos(angle),
    });

    const rotateX = (point: { x: number; y: number; z: number }, angle: number) => ({
      x: point.x,
      y: point.y * Math.cos(angle) - point.z * Math.sin(angle),
      z: point.y * Math.sin(angle) + point.z * Math.cos(angle),
    });

    const rotateZ = (point: { x: number; y: number; z: number }, angle: number) => ({
      x: point.x * Math.cos(angle) - point.y * Math.sin(angle),
      y: point.x * Math.sin(angle) + point.y * Math.cos(angle),
      z: point.z,
    });

    const render = () => {
      const rect = canvas.getBoundingClientRect();
      ctx.clearRect(0, 0, rect.width, rect.height);

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const scale = Math.min(rect.width, rect.height) * 0.36;

      ctx.font = "12px monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      const points: { x: number; y: number; z: number; char: string; isVertex: boolean }[] = [];

      edges.forEach(([i, j]) => {
        const v1 = vertices[i];
        const v2 = vertices[j];

        // Sample points along edge
        const step = 0.055;
        for (let t = 0; t <= 1; t += step) {
          let p = {
            x: v1.x + (v2.x - v1.x) * t,
            y: v1.y + (v2.y - v1.y) * t,
            z: v1.z + (v2.z - v1.z) * t,
          };

          // 3D rotations
          p = rotateY(p, time * 0.45);
          p = rotateX(p, time * 0.28);
          p = rotateZ(p, time * 0.15);

          const isVertex = t === 0 || t >= 0.95;

          points.push({
            x: centerX + p.x * scale,
            y: centerY + p.y * scale,
            z: p.z,
            char: isVertex ? "◆" : "·",
            isVertex,
          });
        }
      });

      // Depth sort (painter's algorithm)
      points.sort((a, b) => a.z - b.z);

      // Render points in crisp black color with depth opacity
      points.forEach((point) => {
        const alpha = Math.max(0.12, Math.min(0.85, 0.35 + (point.z + 1) * 0.32));
        ctx.fillStyle = `rgba(0, 0, 0, ${alpha})`;
        ctx.fillText(point.char, point.x, point.y);
      });

      time += 0.016;
      frameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(frameRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full"
      style={{ display: "block" }}
    />
  );
}
