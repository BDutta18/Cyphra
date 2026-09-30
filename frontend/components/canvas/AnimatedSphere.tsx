'use client';

import React, { useEffect, useRef } from 'react';

export function AnimatedSphere() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const chars = '░▒▓█▀▄▌▐│─┤├┴┬╭╮╰╯';
    let time = 0;
    let animId: number;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };

    resize();
    window.addEventListener('resize', resize);

    const render = () => {
      const rect = canvas.getBoundingClientRect();
      ctx.clearRect(0, 0, rect.width, rect.height);

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const radius = Math.min(rect.width, rect.height) * 0.5;

      ctx.font = '11px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Generate sphere points
      for (let phi = 0; phi < Math.PI * 2; phi += 0.22) {
        for (let theta = 0; theta < Math.PI; theta += 0.22) {
          const x = Math.sin(theta) * Math.cos(phi + time * 0.4);
          const y = Math.sin(theta) * Math.sin(phi + time * 0.4);
          const z = Math.cos(theta);

          // Rotate around Y axis
          const rotY = time * 0.25;
          const newX = x * Math.cos(rotY) - z * Math.sin(rotY);
          const newZ = x * Math.sin(rotY) + z * Math.cos(rotY);

          // Rotate around X axis
          const rotX = time * 0.15;
          const newY = y * Math.cos(rotX) - newZ * Math.sin(rotX);
          const finalZ = y * Math.sin(rotX) + newZ * Math.cos(rotX);

          const depth = (finalZ + 1) / 2;
          const charIndex = Math.floor(depth * (chars.length - 1));
          const char = chars[Math.max(0, Math.min(chars.length - 1, charIndex))];

          const screenX = centerX + newX * radius;
          const screenY = centerY + newY * radius;

          // Subtle Cyber-gold to Dark contrast coloring
          if (depth > 0.6) {
            ctx.fillStyle = `rgba(235, 190, 0, ${depth * 0.85})`;
          } else {
            ctx.fillStyle = `rgba(10, 19, 41, ${depth * 0.45})`;
          }

          ctx.fillText(char, screenX, screenY);
        }
      }

      time += 0.015;
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full pointer-events-none select-none"
      style={{ width: '100%', height: '100%' }}
    />
  );
}
