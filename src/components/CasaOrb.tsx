"use client";

import { useEffect, useRef } from "react";

type CasaOrbProps = {
  height?: number;        // px, defaults to 520
  particleCount?: number; // defaults to 2400
  accent?: string;        // hex without #, defaults to F9D96A (butter yellow)
};

declare global {
  interface Window {
    THREE: any;
  }
}

export default function CasaOrb({
  height = 520,
  particleCount = 2400,
  accent = "F9D96A",
}: CasaOrbProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let cancelled = false;
    let cleanup: (() => void) | null = null;

    function loadThree(): Promise<any> {
      if (typeof window !== "undefined" && window.THREE) {
        return Promise.resolve(window.THREE);
      }
      return new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js";
        script.async = true;
        script.onload = () => resolve(window.THREE);
        script.onerror = reject;
        document.head.appendChild(script);
      });
    }

    loadThree().then((THREE) => {
      if (cancelled) return;
      const stage = stageRef.current;
      const canvas = canvasRef.current;
      if (!stage || !canvas) return;

      let w = stage.clientWidth;
      let h = stage.clientHeight;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(50, w / h, 0.1, 1000);
      camera.position.z = 5.4;

      const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(w, h, false);
      renderer.setClearColor(0xffffff, 1);

      const positions = new Float32Array(particleCount * 3);
      const homePositions = new Float32Array(particleCount * 3);
      const offsets = new Float32Array(particleCount);
      const RADIUS = 1.7;

      for (let i = 0; i < particleCount; i++) {
        const u = Math.random();
        const v = Math.random();
        const theta = 2 * Math.PI * u;
        const phi = Math.acos(2 * v - 1);
        const x = RADIUS * Math.sin(phi) * Math.cos(theta);
        const y = RADIUS * Math.sin(phi) * Math.sin(theta);
        const z = RADIUS * Math.cos(phi);
        homePositions[i * 3] = x;
        homePositions[i * 3 + 1] = y;
        homePositions[i * 3 + 2] = z;
        positions[i * 3] = x;
        positions[i * 3 + 1] = y;
        positions[i * 3 + 2] = z;
        offsets[i] = Math.random() * Math.PI * 2;
      }

      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

      const c = document.createElement("canvas");
      c.width = c.height = 64;
      const g = c.getContext("2d")!;
      const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
      const r = parseInt(accent.slice(0, 2), 16);
      const gC = parseInt(accent.slice(2, 4), 16);
      const b = parseInt(accent.slice(4, 6), 16);
      grad.addColorStop(0.0, `rgba(${r},${gC},${b},1)`);
      grad.addColorStop(0.4, `rgba(${Math.max(0, r - 20)},${Math.max(0, gC - 17)},${Math.max(0, b - 32)},0.85)`);
      grad.addColorStop(1.0, `rgba(${Math.max(0, r - 20)},${Math.max(0, gC - 17)},${Math.max(0, b - 32)},0)`);
      g.fillStyle = grad;
      g.fillRect(0, 0, 64, 64);
      const sprite = new THREE.CanvasTexture(c);

      const material = new THREE.PointsMaterial({
        size: 0.055,
        map: sprite,
        transparent: true,
        depthWrite: false,
        blending: THREE.NormalBlending,
        sizeAttenuation: true,
      });

      const points = new THREE.Points(geometry, material);
      scene.add(points);

      const mouse = { x: 0, y: 0 };
      let breathPhase = 0;
      let pulse = 0;
      let scatter = 0;
      let targetScatter = 0;

      const onMove = (e: MouseEvent) => {
        const rect = stage.getBoundingClientRect();
        mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        targetScatter = 1;
      };
      const onLeave = () => { targetScatter = 0; };
      const onClick = () => { pulse = 1; };
      const onKey = () => { pulse = Math.min(1, pulse + 0.6); };

      stage.addEventListener("mousemove", onMove);
      stage.addEventListener("mouseleave", onLeave);
      stage.addEventListener("click", onClick);
      window.addEventListener("keydown", onKey);

      const onResize = () => {
        w = stage.clientWidth;
        h = stage.clientHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h, false);
      };
      window.addEventListener("resize", onResize);

      let raf = 0;
      let lastTime = performance.now();

      const animate = (now: number) => {
        const dt = Math.min(0.05, (now - lastTime) / 1000);
        lastTime = now;

        breathPhase += dt * 0.6;
        const breath = 1 + Math.sin(breathPhase) * 0.025;
        pulse *= 0.94;
        scatter += (targetScatter - scatter) * 0.06;

        const tiltX = mouse.y * 0.35;
        const tiltY = mouse.x * 0.35;
        points.rotation.x += (tiltX - points.rotation.x) * 0.04;
        points.rotation.y += (tiltY - points.rotation.y) * 0.04 + 0.0015;
        points.rotation.z += 0.0004;

        const pos = geometry.attributes.position.array as Float32Array;
        const t = now * 0.001;
        for (let i = 0; i < particleCount; i++) {
          const ix = i * 3;
          const hx = homePositions[ix];
          const hy = homePositions[ix + 1];
          const hz = homePositions[ix + 2];
          const wob = Math.sin(t * 1.4 + offsets[i]) * 0.012;
          const scatterAmt = scatter * (0.06 + Math.sin(offsets[i] * 1.7) * 0.04);
          const pulseAmt = pulse * 0.18;
          const factor = breath + wob + scatterAmt + pulseAmt;
          pos[ix] = hx * factor;
          pos[ix + 1] = hy * factor;
          pos[ix + 2] = hz * factor;
        }
        geometry.attributes.position.needsUpdate = true;
        material.opacity = 0.85 + pulse * 0.15;

        renderer.render(scene, camera);
        raf = requestAnimationFrame(animate);
      };
      raf = requestAnimationFrame(animate);

      cleanup = () => {
        cancelAnimationFrame(raf);
        stage.removeEventListener("mousemove", onMove);
        stage.removeEventListener("mouseleave", onLeave);
        stage.removeEventListener("click", onClick);
        window.removeEventListener("keydown", onKey);
        window.removeEventListener("resize", onResize);
        geometry.dispose();
        material.dispose();
        sprite.dispose();
        renderer.dispose();
      };
    });

    return () => {
      cancelled = true;
      if (cleanup) cleanup();
    };
  }, [particleCount, accent]);

  return (
    <div
      ref={stageRef}
      style={{
        width: "100%",
        height: `${height}px`,
        position: "relative",
        cursor: "pointer",
        overflow: "hidden",
        background: "#FFFFFF",
      }}
    >
      <canvas ref={canvasRef} style={{ display: "block", width: "100%", height: "100%" }} />
    </div>
  );
}
