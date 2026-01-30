/* =========================================================
   1) AURORA WEBGL
========================================================= */
(function aurora(){
  const canvas = document.getElementById("gl");
  const gl = canvas.getContext("webgl", { alpha:true, antialias:true });
  if(!gl){ console.warn("WebGL not supported"); return; }

  const dpr = () => Math.min(2, devicePixelRatio || 1);

  function resize(){
    const r = dpr();
    canvas.width  = Math.floor(innerWidth * r);
    canvas.height = Math.floor(innerHeight * r);
    gl.viewport(0,0,canvas.width,canvas.height);
  }
  resize();
  addEventListener("resize", resize);

  const vs = `attribute vec2 p; void main(){ gl_Position=vec4(p,0.0,1.0);} `;
  const fs = `
    precision highp float;
    uniform float time;
    uniform vec2 resolution;
    uniform float scrollY;

    float rand(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453); }
    float noise(vec2 p){
      vec2 i=floor(p), f=fract(p);
      vec2 u=f*f*(3.0-2.0*f);
      return mix(
        mix(rand(i), rand(i+vec2(1.0,0.0)), u.x),
        mix(rand(i+vec2(0.0,1.0)), rand(i+vec2(1.0,1.0)), u.x),
        u.y
      );
    }
    float fbm(vec2 p){
      float v=0.0, a=0.5;
      for(int i=0;i<5;i++){
        v += a*noise(p);
        p *= 2.0;
        a *= 0.5;
      }
      return v;
    }

    void main(){
      vec2 frag = vec2(gl_FragCoord.x, gl_FragCoord.y + scrollY);
      vec2 uv = frag / resolution.xy;

      uv -= 0.5;
      uv.x *= resolution.x / resolution.y;

      vec2 flow = uv * 2.6;
      flow.y += time * 0.06;

      float n = fbm(flow + fbm(flow + time*0.12));
      float light = smoothstep(0.22, 0.78, n);

      vec3 col1 = vec3(0.02, 0.06, 0.10);
      vec3 col2 = vec3(0.00, 0.85, 0.75);
      vec3 col3 = vec3(0.35, 0.55, 1.00);

      vec3 color = mix(col1, col2, light);
      color = mix(color, col3, n * 0.35);

      float vignette = smoothstep(0.95, 0.15, length(uv));
      color *= vignette;

      gl_FragColor = vec4(color, 1.0);
    }
  `;

  function compile(type, src){
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if(!gl.getShaderParameter(s, gl.COMPILE_STATUS)){
      console.error(gl.getShaderInfoLog(s));
      throw new Error("Shader compile error");
    }
    return s;
  }

  const prog = gl.createProgram();
  gl.attachShader(prog, compile(gl.VERTEX_SHADER, vs));
  gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, fs));
  gl.linkProgram(prog);
  gl.useProgram(prog);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);

  const loc = gl.getAttribLocation(prog, "p");
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

  const timeLoc = gl.getUniformLocation(prog, "time");
  const resLoc  = gl.getUniformLocation(prog, "resolution");
  const scrollLoc = gl.getUniformLocation(prog, "scrollY");

  let scrollY = 0;
  addEventListener("scroll", () => { scrollY = window.scrollY * dpr(); }, { passive:true });

  const start = performance.now();
  function render(){
    gl.uniform1f(timeLoc, (performance.now()-start)/1000);
    gl.uniform2f(resLoc, canvas.width, canvas.height);
    gl.uniform1f(scrollLoc, scrollY);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    requestAnimationFrame(render);
  }
  render();
})();

/* =========================================================
   2) TREE + MESH (2D canvases)
========================================================= */
function setupCanvas(canvas){
  const ctx = canvas.getContext("2d");
  function resize(){
    const dpr = Math.min(2, devicePixelRatio || 1);
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    canvas.width  = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    ctx.setTransform(dpr,0,0,dpr,0,0);
    return { w, h };
  }
  return { ctx, resize };
}

(function treeFX(){
  const canvas = document.getElementById("treeFx");
  const { ctx, resize } = setupCanvas(canvas);
  let W=0,H=0;
  const edges=[], sparks=[];
  const rand=(a,b)=>a+Math.random()*(b-a);

  function rebuild(){
    edges.length=0; sparks.length=0;
    const groundY = H*0.88;
    const trunkTop = groundY - H*0.30;

    const nodes=[];
    const base={x:W*0.5, y:groundY};
    nodes.push(base);

    let prev=base;
    for(let i=1;i<=18;i++){
      const t=i/18;
      const n={x:W*0.5 + Math.sin(t*3.0)*W*0.004, y: groundY - t*(groundY - trunkTop)};
      edges.push([prev,n]); prev=n; nodes.push(n);
    }

    for(let b=0;b<26;b++){
      const side=(b%2===0)?-1:1;
      const start=nodes[Math.floor(rand(7,nodes.length-1))];
      const len=rand(H*0.06,H*0.18);
      const seg=Math.floor(rand(5,10));
      let p=start;

      for(let s=1;s<=seg;s++){
        const tt=s/seg;
        const angle=side*(0.35+tt*0.9)+rand(-0.08,0.08);
        const step=len/seg;
        const n={
          x:p.x+Math.cos(angle)*step*rand(0.9,1.15),
          y:p.y-Math.sin(Math.abs(angle))*step*rand(0.9,1.15)-step*0.18
        };
        edges.push([p,n]); p=n;

        if(s>seg*0.55 && Math.random()<0.78){
          sparks.push({x:n.x+rand(-W*0.01,W*0.01), y:n.y+rand(-H*0.01,H*0.01), r:rand(0.9,2.2), ph:rand(0,Math.PI*2), sp:rand(0.8,2.0)});
        }
      }
    }

    for(let i=0;i<1050;i++){
      let rx=rand(-1,1), ry=rand(-1,1);
      if(Math.sqrt(rx*rx+ry*ry)>1){ i--; continue; }
      const x=W*0.5 + rx*(W*0.20)*(0.35+Math.random()*0.65);
      const y=H*0.58 + ry*(H*0.16)*(0.35+Math.random()*0.65);
      sparks.push({x,y,r:rand(0.7,2.1), ph:rand(0,Math.PI*2), sp:rand(0.6,2.5)});
    }
  }

  function onResize(){
    const s=resize(); W=s.w; H=s.h; rebuild();
  }
  onResize();
  addEventListener("resize", onResize);

  function draw(t){
    const time=t/1000;
    ctx.clearRect(0,0,W,H);

    ctx.save();
    ctx.lineCap="round";
    ctx.globalAlpha=0.92;
    ctx.strokeStyle="rgba(255,255,255,0.22)";
    ctx.lineWidth=1.35;
    ctx.beginPath();
    for(const [a,b] of edges){ ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); }
    ctx.stroke();

    ctx.globalAlpha=0.48;
    ctx.strokeStyle="rgba(0,255,230,0.38)";
    ctx.lineWidth=4.3;
    ctx.beginPath();
    for(const [a,b] of edges){ ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); }
    ctx.stroke();
    ctx.restore();

    ctx.save();
    for(const s of sparks){
      const tw=0.5+0.5*Math.sin(time*s.sp+s.ph);
      const a=0.24+tw*0.74;
      ctx.fillStyle=`rgba(255,255,255,${a*0.92})`;
      ctx.beginPath(); ctx.arc(s.x,s.y,s.r,0,Math.PI*2); ctx.fill();
      ctx.fillStyle=`rgba(0,255,230,${a*0.28})`;
      ctx.beginPath(); ctx.arc(s.x,s.y,s.r*3.0,0,Math.PI*2); ctx.fill();
    }
    ctx.restore();

    ctx.save();
    ctx.globalCompositeOperation="destination-in";
    const g=ctx.createLinearGradient(0,H*0.45,0,H);
    g.addColorStop(0.0,"rgba(0,0,0,0)");
    g.addColorStop(0.30,"rgba(0,0,0,0.08)");
    g.addColorStop(0.62,"rgba(0,0,0,0.98)");
    g.addColorStop(1.0,"rgba(0,0,0,1)");
    ctx.fillStyle=g;
    ctx.fillRect(0,0,W,H);
    ctx.restore();

    requestAnimationFrame(draw);
  }
  requestAnimationFrame(draw);
})();

(function groundFX(){
  const canvas = document.getElementById("groundFx");
  const { ctx, resize } = setupCanvas(canvas);
  let W=0,H=0;
  let meshEdges=[];
  const rand=(a,b)=>a+Math.random()*(b-a);

  function buildMesh(){
    meshEdges=[];
    const groundY=H*0.88;
    const pts=[];
    const cols=36, rows=7;

    for(let r=0;r<rows;r++){
      for(let c=0;c<cols;c++){
        pts.push({ x:(c/(cols-1))*W, y:groundY + r*(H*0.02) + rand(-H*0.01,H*0.01) });
      }
    }
    for(let r=0;r<rows;r++){
      for(let c=0;c<cols;c++){
        const idx=r*cols+c;
        if(c<cols-1) meshEdges.push([pts[idx], pts[idx+1]]);
        if(r<rows-1) meshEdges.push([pts[idx], pts[idx+cols]]);
        if(c<cols-1 && r<rows-1 && Math.random()<0.34) meshEdges.push([pts[idx], pts[idx+cols+1]]);
      }
    }
  }

  function onResize(){
    const s=resize(); W=s.w; H=s.h; buildMesh();
  }
  onResize();
  addEventListener("resize", onResize);

  function draw(){
    ctx.clearRect(0,0,W,H);

    ctx.save();
    ctx.globalAlpha=0.88;
    ctx.lineCap="round";
    ctx.strokeStyle="rgba(255,255,255,0.17)";
    ctx.lineWidth=1.25;
    ctx.beginPath();
    for(const [a,b] of meshEdges){ ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); }
    ctx.stroke();

    ctx.globalAlpha=0.38;
    ctx.strokeStyle="rgba(0,255,230,0.30)";
    ctx.lineWidth=3.2;
    ctx.beginPath();
    for(const [a,b] of meshEdges){ ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); }
    ctx.stroke();
    ctx.restore();

    ctx.save();
    ctx.globalCompositeOperation="destination-in";
    const g=ctx.createLinearGradient(0,H*0.72,0,H);
    g.addColorStop(0.0,"rgba(0,0,0,0)");
    g.addColorStop(0.55,"rgba(0,0,0,0.55)");
    g.addColorStop(1.0,"rgba(0,0,0,1)");
    ctx.fillStyle=g;
    ctx.fillRect(0,0,W,H);
    ctx.restore();

    requestAnimationFrame(draw);
  }
  requestAnimationFrame(draw);
})();

/* =========================================================
   3) FLOW CONTROL
========================================================= */
(function flow(){
  const hero = document.getElementById("hero");
  const story = document.getElementById("story");
  const msg2 = document.getElementById("msg2");
  const exitTrigger = document.getElementById("exitTrigger");

  new IntersectionObserver((entries)=>{
    document.body.classList.toggle("hero-out", !entries[0].isIntersecting);
  }, { threshold: 0.15 }).observe(hero);

  new IntersectionObserver((entries)=>{
    const inStory = entries[0].isIntersecting;
    document.body.classList.toggle("tree-on", inStory);
    if(!inStory){
      document.body.classList.remove("tree-exit", "tree-bright");
    }
  }, { threshold: 0.01 }).observe(story);

  new IntersectionObserver((entries)=>{
    document.body.classList.toggle("tree-bright", entries[0].isIntersecting);
  }, { threshold: 0.55 }).observe(msg2);

  new IntersectionObserver((entries)=>{
    document.body.classList.toggle("tree-exit", entries[0].isIntersecting);
  }, { threshold: 0.55 }).observe(exitTrigger);
})();

/* =========================================================
   4) HERO NAV: burger + Find a Job scroll
========================================================= */
(function heroNav(){
  const burger = document.getElementById("hnBurger");
  const drawer = document.getElementById("hnDrawer");

  if(burger && drawer){
    burger.addEventListener("click", ()=>{
      const open = drawer.classList.toggle("open");
      burger.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  function goStory(){
    document.getElementById("story")?.scrollIntoView({ behavior:"smooth", block:"start" });
  }

  document.getElementById("findJobBtn")?.addEventListener("click", goStory);
  document.getElementById("findJobBtn2")?.addEventListener("click", goStory);
})();

/* =========================================================
   5) ✅ DOMAINS: hover on tab shows techs instantly + images
========================================================= */
(function domainsUI(){
  const tabs = document.getElementById("domTabs");
  const grid = document.getElementById("domGrid");
  const wall = document.getElementById("logoWall");
  const prev = document.getElementById("domPrev");
  const next = document.getElementById("domNext");
  if(!tabs || !grid || !wall) return;

  // ✅ High-quality CDN icons (Simple Icons via jsDelivr)
  // NOTE: These are SVG icons (great quality + light weight)
  const ICON = (slug) => `https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/${slug}.svg`;

  // "big tile" image backgrounds (still icons, but used as the tile cover)
  // We put them on a darker photo-like background with CSS filters.
  const TILE = (slug) => ICON(slug);

  const DATA = {
    aiml: {
      wall: ["python","pytorch","huggingface","openai","fastapi","googlecloud"],
      tiles: [
        ["Python", TILE("python")],
        ["PyTorch", TILE("pytorch")],
        ["Hugging Face", TILE("huggingface")],
        ["OpenAI", TILE("openai")],
        ["FastAPI", TILE("fastapi")],
        ["GCP", TILE("googlecloud")],
      ]
    },
    fullstack: {
      wall: ["react","nextdotjs","nodedotjs","postgresql","docker","amazonaws"],
      tiles: [
        ["React", TILE("react")],
        ["Next.js", TILE("nextdotjs")],
        ["Node.js", TILE("nodedotjs")],
        ["PostgreSQL", TILE("postgresql")],
        ["Docker", TILE("docker")],
        ["AWS", TILE("amazonaws")],
      ]
    },
    datascience: {
      wall: ["pandas","numpy","scikitlearn","jupyter","apachehadoop","apachekafka"],
      tiles: [
        ["Pandas", TILE("pandas")],
        ["NumPy", TILE("numpy")],
        ["Scikit-learn", TILE("scikitlearn")],
        ["Jupyter", TILE("jupyter")],
        ["Hadoop", TILE("apachehadoop")],
        ["Kafka", TILE("apachekafka")],
      ]
    },
    devops: {
      wall: ["docker","kubernetes","terraform","githubactions","prometheus","grafana"],
      tiles: [
        ["Docker", TILE("docker")],
        ["Kubernetes", TILE("kubernetes")],
        ["Terraform", TILE("terraform")],
        ["GitHub Actions", TILE("githubactions")],
        ["Prometheus", TILE("prometheus")],
        ["Grafana", TILE("grafana")],
      ]
    },
    qa: {
      wall: ["selenium","cypress","playwright","postman","jest","linux"],
      tiles: [
        ["Selenium", TILE("selenium")],
        ["Cypress", TILE("cypress")],
        ["Playwright", TILE("playwright")],
        ["Postman", TILE("postman")],
        ["Jest", TILE("jest")],
        ["Linux", TILE("linux")],
      ]
    }
  };

  const tileHTML = (name, imgUrl) => `
    <div class="dom-tile" tabindex="0" aria-label="${name}">
      <img src="${imgUrl}" alt="${name}">
      <div class="dom-label">${name} <small>tech</small></div>
    </div>
  `;

  const wallHTML = (slug) => `
    <div class="logo" title="${slug}">
      <img src="${ICON(slug)}" alt="${slug}">
    </div>
  `;

  // Make icons look like "images" (dark bg + glow) even though they're SVG
  const enhanceTiles = () => {
    // apply styling to images after load
    grid.querySelectorAll("img").forEach(img => {
      img.style.padding = "34px";
      img.style.objectFit = "contain";
      img.style.background =
        "radial-gradient(120% 80% at 30% 20%, rgba(0,255,230,0.10), rgba(0,0,0,0) 58%)," +
        "radial-gradient(120% 90% at 80% 70%, rgba(140,170,255,0.10), rgba(0,0,0,0) 60%)," +
        "rgba(255,255,255,0.03)";
      img.style.filter =
        "invert(1) brightness(1.2) contrast(1.1) drop-shadow(0 0 18px rgba(0,255,230,0.20))";
    });

    wall.querySelectorAll("img").forEach(img => {
      img.style.filter =
        "invert(1) brightness(1.25) drop-shadow(0 0 14px rgba(0,255,230,0.18))";
    });
  };

  const setActive = (key) => {
    [...tabs.querySelectorAll(".dom-tab")].forEach(b => {
      b.classList.toggle("active", b.dataset.dom === key);
    });

    const dom = DATA[key] || DATA.aiml;

    wall.innerHTML = dom.wall.map(wallHTML).join("");
    grid.innerHTML = dom.tiles.map(([n,u]) => tileHTML(n,u)).join("");

    enhanceTiles();
  };

  // ✅ Hover changes instantly (no click required)
  let hoverTimer = null;
  tabs.addEventListener("pointerover", (e) => {
    const btn = e.target.closest(".dom-tab");
    if(!btn) return;
    clearTimeout(hoverTimer);
    hoverTimer = setTimeout(() => setActive(btn.dataset.dom), 30);
  });

  // click still works
  tabs.addEventListener("click", (e) => {
    const btn = e.target.closest(".dom-tab");
    if(!btn) return;
    setActive(btn.dataset.dom);
  });

  // arrows scroll tab row
  const scrollByPx = (dir) => tabs.scrollBy({ left: dir * 300, behavior: "smooth" });
  prev?.addEventListener("click", () => scrollByPx(-1));
  next?.addEventListener("click", () => scrollByPx(1));

  setActive("aiml");
})();

/* =========================================================
   6) ✅ hireU: whole-letter brighten on hover/touch
========================================================= */
(function hireULetterGlow(){
  const wrap = document.getElementById("hireuWrap");
  const word = document.getElementById("hireuWord");
  if(!wrap || !word) return;

  const letters = Array.from(word.querySelectorAll(".hireu-letter"));
  const clear = () => letters.forEach(l => l.classList.remove("is-on"));

  const pick = (clientX, clientY) => {
    const el = document.elementFromPoint(clientX, clientY);
    const letter = el && el.closest && el.closest(".hireu-letter");
    if(!letter) return;
    clear();
    letter.classList.add("is-on");
  };

  word.addEventListener("pointerenter", () => wrap.classList.add("is-hot"));
  word.addEventListener("pointerleave", () => { wrap.classList.remove("is-hot"); clear(); });

  word.addEventListener("pointermove", (e) => {
    wrap.classList.add("is-hot");
    pick(e.clientX, e.clientY);
  });

  let tmr = null;
  word.addEventListener("touchstart", (e) => {
    const t = e.touches && e.touches[0];
    if(!t) return;
    wrap.classList.add("is-hot");
    pick(t.clientX, t.clientY);
    clearTimeout(tmr);
    tmr = setTimeout(() => { wrap.classList.remove("is-hot"); clear(); }, 900);
  }, { passive:true });

  word.addEventListener("touchmove", (e) => {
    const t = e.touches && e.touches[0];
    if(!t) return;
    wrap.classList.add("is-hot");
    pick(t.clientX, t.clientY);
    clearTimeout(tmr);
  }, { passive:true });

  word.addEventListener("touchend", () => {
    clearTimeout(tmr);
    tmr = setTimeout(() => { wrap.classList.remove("is-hot"); clear(); }, 650);
  }, { passive:true });
})();
