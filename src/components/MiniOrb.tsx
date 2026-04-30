"use client";

import { useEffect, useRef } from "react";

declare global {
  interface Window { THREE: any }
}

export default function MiniOrb() {
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let cancelled = false;
    let cleanup: (() => void) | null = null;

    function loadThree(): Promise<any> {
      if (typeof window !== "undefined" && window.THREE) return Promise.resolve(window.THREE);
      return new Promise((resolve, reject) => {
        const s = document.createElement("script");
        s.src = "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js";
        s.async = true;
        s.onload = () => resolve(window.THREE);
        s.onerror = reject;
        document.head.appendChild(s);
      });
    }

    loadThree().then((THREE) => {
      if (cancelled) return;
      const stage = stageRef.current;
      const canvas = canvasRef.current;
      if (!stage || !canvas) return;

      const SIZE = 160;
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
      camera.position.z = 4.2;

      const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(SIZE, SIZE, false);
      renderer.setClearColor(0x000000, 0);

      const COUNT = 900;
      const positions = new Float32Array(COUNT * 3);
      const home = new Float32Array(COUNT * 3);
      const offsets = new Float32Array(COUNT);
      const R = 1.5;

      for (let i = 0; i < COUNT; i++) {
        const u = Math.random(), v = Math.random();
        const theta = 2 * Math.PI * u;
        const phi = Math.acos(2 * v - 1);
        home[i * 3] = R * Math.sin(phi) * Math.cos(theta);
        home[i * 3 + 1] = R * Math.sin(phi) * Math.sin(theta);
        home[i * 3 + 2] = R * Math.cos(phi);
        positions[i * 3] = home[i * 3];
        positions[i * 3 + 1] = home[i * 3 + 1];
        positions[i * 3 + 2] = home[i * 3 + 2];
        offsets[i] = Math.random() * Math.PI * 2;
      }

      const geo = new THREE.BufferGeometry();
      geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));

      const c = document.createElement("canvas");
      c.width = c.height = 64;
      const g = c.getContext("2d")!;
      const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
      grad.addColorStop(0.0, "rgba(249,217,106,1)");
      grad.addColorStop(0.4, "rgba(229,197,86,0.85)");
      grad.addColorStop(1.0, "rgba(229,197,86,0)");
      g.fillStyle = grad;
      g.fillRect(0, 0, 64, 64);
      const sprite = new THREE.CanvasTexture(c);

      const mat = new THREE.PointsMaterial({
        size: 0.07, map: sprite, transparent: true, depthWrite: false,
        blending: THREE.NormalBlending, sizeAttenuation: true,
      });

      const points = new THREE.Points(geo, mat);
      scene.add(points);

      let raf = 0;
      const animate = (now: number) => {
        const t = now * 0.001;
        const breath = 1 + Math.sin(t * 0.6) * 0.04;
        const bounce = Math.sin(t * 0.4) * 0.08;
        const tilt = Math.sin(t * 0.3) * 0.15;

        points.rotation.y += 0.005;
        points.rotation.x = tilt;
        points.position.y = bounce;

        const pos = geo.attributes.position.array as Float32Array;
        for (let i = 0; i < COUNT; i++) {
          const ix = i * 3;
          const wob = Math.sin(t * 1.2 + offsets[i]) * 0.01;
          const f = breath + wob;
          pos[ix] = home[ix] * f;
          pos[ix + 1] = home[ix + 1] * f;
          pos[ix + 2] = home[ix + 2] * f;
        }
        geo.attributes.position.needsUpdate = true;

        renderer.render(scene, camera);
        raf = requestAnimationFrame(animate);
      };
      raf = requestAnimationFrame(animate);

      cleanup = () => {
        cancelAnimationFrame(raf);
        geo.dispose(); mat.dispose(); sprite.dispose(); renderer.dispose();
      };
    });

    return () => { cancelled = true; if (cleanup) cleanup(); };
  }, []);

  return (
    <div ref={stageRef} style={{ width: 88, height: 88, margin: "0 auto 36px", overflow: "hidden" }}>
      <canvas ref={canvasRef} style={{ display: "block", width: 88, height: 88 }} />
    </div>
  );
}
