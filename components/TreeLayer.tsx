"use client";

import { useLayoutEffect, useRef } from "react";

function setupCanvas(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext("2d")!;
  function resize() {
    const dpr = Math.min(2, typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1);
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { w, h };
  }
  return { ctx, resize };
}

const rand = (a: number, b: number) => a + Math.random() * (b - a);

export function TreeLayer() {
  const treeRef = useRef<HTMLCanvasElement>(null);
  const groundRef = useRef<HTMLCanvasElement>(null);

  // useLayoutEffect runs before paint so tree/ground first frame is ready sooner.
  useLayoutEffect(() => {
    const treeCanvas = treeRef.current;
    const groundCanvas = groundRef.current;
    if (!treeCanvas || !groundCanvas) return;

    const { ctx: treeCtx, resize: treeResize } = setupCanvas(treeCanvas);
    let W = 0,
      H = 0;
    const edges: [ { x: number; y: number }, { x: number; y: number } ][] = [];
    const sparks: { x: number; y: number; r: number; ph: number; sp: number }[] = [];

    function rebuildTree() {
      edges.length = 0;
      sparks.length = 0;
      const groundY = H * 0.88;
      const trunkTop = groundY - H * 0.3;
      const nodes: { x: number; y: number }[] = [];
      const base = { x: W * 0.5, y: groundY };
      nodes.push(base);

      let prev = base;
      for (let i = 1; i <= 18; i++) {
        const t = i / 18;
        const n = {
          x: W * 0.5 + Math.sin(t * 3) * W * 0.004,
          y: groundY - t * (groundY - trunkTop),
        };
        edges.push([prev, n]);
        prev = n;
        nodes.push(n);
      }

      for (let b = 0; b < 26; b++) {
        const side = b % 2 === 0 ? -1 : 1;
        const start = nodes[Math.floor(rand(7, nodes.length - 1))];
        const len = rand(H * 0.06, H * 0.18);
        const seg = Math.floor(rand(5, 10));
        let p = start;

        for (let s = 1; s <= seg; s++) {
          const tt = s / seg;
          const angle = side * (0.35 + tt * 0.9) + rand(-0.08, 0.08);
          const step = len / seg;
          const n = {
            x: p.x + Math.cos(angle) * step * rand(0.9, 1.15),
            y: p.y - Math.sin(Math.abs(angle)) * step * rand(0.9, 1.15) - step * 0.18,
          };
          edges.push([p, n]);
          p = n;
          if (s > seg * 0.55 && Math.random() < 0.78) {
            sparks.push({
              x: n.x + rand(-W * 0.01, W * 0.01),
              y: n.y + rand(-H * 0.01, H * 0.01),
              r: rand(0.9, 2.2),
              ph: rand(0, Math.PI * 2),
              sp: rand(0.8, 2),
            });
          }
        }
      }

      for (let i = 0; i < 1050; i++) {
        let rx = rand(-1, 1),
          ry = rand(-1, 1);
        if (Math.sqrt(rx * rx + ry * ry) > 1) {
          i--;
          continue;
        }
        const x = W * 0.5 + rx * (W * 0.2) * (0.35 + Math.random() * 0.65);
        const y = H * 0.58 + ry * (H * 0.16) * (0.35 + Math.random() * 0.65);
        sparks.push({ x, y, r: rand(0.7, 2.1), ph: rand(0, Math.PI * 2), sp: rand(0.6, 2.5) });
      }
    }

    function onTreeResize() {
      const s = treeResize();
      W = s.w;
      H = s.h;
      rebuildTree();
    }
    onTreeResize();
    window.addEventListener("resize", onTreeResize);

    function drawTree(t: number) {
      const time = t / 1000;
      treeCtx.clearRect(0, 0, W, H);

      treeCtx.save();
      treeCtx.lineCap = "round";
      treeCtx.globalAlpha = 0.92;
      treeCtx.strokeStyle = "rgba(255,255,255,0.22)";
      treeCtx.lineWidth = 1.35;
      treeCtx.beginPath();
      for (const [a, b] of edges) {
        treeCtx.moveTo(a.x, a.y);
        treeCtx.lineTo(b.x, b.y);
      }
      treeCtx.stroke();

      treeCtx.globalAlpha = 0.48;
      treeCtx.strokeStyle = "rgba(0,255,230,0.38)";
      treeCtx.lineWidth = 4.3;
      treeCtx.beginPath();
      for (const [a, b] of edges) {
        treeCtx.moveTo(a.x, a.y);
        treeCtx.lineTo(b.x, b.y);
      }
      treeCtx.stroke();
      treeCtx.restore();

      treeCtx.save();
      for (const s of sparks) {
        const tw = 0.5 + 0.5 * Math.sin(time * s.sp + s.ph);
        const a = 0.24 + tw * 0.74;
        treeCtx.fillStyle = `rgba(255,255,255,${a * 0.92})`;
        treeCtx.beginPath();
        treeCtx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        treeCtx.fill();
        treeCtx.fillStyle = `rgba(0,255,230,${a * 0.28})`;
        treeCtx.beginPath();
        treeCtx.arc(s.x, s.y, s.r * 3, 0, Math.PI * 2);
        treeCtx.fill();
      }
      treeCtx.restore();

      treeCtx.save();
      treeCtx.globalCompositeOperation = "destination-in";
      const g = treeCtx.createLinearGradient(0, H * 0.45, 0, H);
      g.addColorStop(0, "rgba(0,0,0,0)");
      g.addColorStop(0.3, "rgba(0,0,0,0.08)");
      g.addColorStop(0.62, "rgba(0,0,0,0.98)");
      g.addColorStop(1, "rgba(0,0,0,1)");
      treeCtx.fillStyle = g;
      treeCtx.fillRect(0, 0, W, H);
      treeCtx.restore();

      requestAnimationFrame(drawTree);
    }
    requestAnimationFrame(drawTree);

    // Ground mesh
    const { ctx: groundCtx, resize: groundResize } = setupCanvas(groundCanvas);
    let meshW = 0,
      meshH = 0;
    let meshEdges: [ { x: number; y: number }, { x: number; y: number } ][] = [];

    function buildMesh() {
      meshEdges = [];
      const groundY = meshH * 0.88;
      const pts: { x: number; y: number }[] = [];
      const cols = 36,
        rows = 7;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          pts.push({
            x: (c / (cols - 1)) * meshW,
            y: groundY + r * (meshH * 0.02) + rand(-meshH * 0.01, meshH * 0.01),
          });
        }
      }
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const idx = r * cols + c;
          if (c < cols - 1) meshEdges.push([pts[idx], pts[idx + 1]]);
          if (r < rows - 1) meshEdges.push([pts[idx], pts[idx + cols]]);
          if (c < cols - 1 && r < rows - 1 && Math.random() < 0.34)
            meshEdges.push([pts[idx], pts[idx + cols + 1]]);
        }
      }
    }

    function onGroundResize() {
      const s = groundResize();
      meshW = s.w;
      meshH = s.h;
      buildMesh();
    }
    onGroundResize();
    window.addEventListener("resize", onGroundResize);

    function drawGround() {
      groundCtx.clearRect(0, 0, meshW, meshH);

      groundCtx.save();
      groundCtx.globalAlpha = 0.88;
      groundCtx.lineCap = "round";
      groundCtx.strokeStyle = "rgba(255,255,255,0.17)";
      groundCtx.lineWidth = 1.25;
      groundCtx.beginPath();
      for (const [a, b] of meshEdges) {
        groundCtx.moveTo(a.x, a.y);
        groundCtx.lineTo(b.x, b.y);
      }
      groundCtx.stroke();

      groundCtx.globalAlpha = 0.38;
      groundCtx.strokeStyle = "rgba(0,255,230,0.30)";
      groundCtx.lineWidth = 3.2;
      groundCtx.beginPath();
      for (const [a, b] of meshEdges) {
        groundCtx.moveTo(a.x, a.y);
        groundCtx.lineTo(b.x, b.y);
      }
      groundCtx.stroke();
      groundCtx.restore();

      groundCtx.save();
      groundCtx.globalCompositeOperation = "destination-in";
      const g = groundCtx.createLinearGradient(0, meshH * 0.72, 0, meshH);
      g.addColorStop(0, "rgba(0,0,0,0)");
      g.addColorStop(0.55, "rgba(0,0,0,0.55)");
      g.addColorStop(1, "rgba(0,0,0,1)");
      groundCtx.fillStyle = g;
      groundCtx.fillRect(0, 0, meshW, meshH);
      groundCtx.restore();

      requestAnimationFrame(drawGround);
    }
    requestAnimationFrame(drawGround);

    return () => {
      window.removeEventListener("resize", onTreeResize);
      window.removeEventListener("resize", onGroundResize);
    };
  }, []);

  return (
    <div className="tree-layer" id="treeLayer">
      <div className="ground-plate" />
      <canvas id="treeFx" ref={treeRef} />
      <canvas id="groundFx" ref={groundRef} />
    </div>
  );
}
