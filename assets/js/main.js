/* ==========================================================================
   TuConsumo · Landing con Willy — interacciones
   ========================================================================== */
(() => {
  "use strict";
  const CFG = window.TC_CONFIG || {};
  const PLAN = CFG.plan;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const nf = new Intl.NumberFormat("es-CO", { maximumFractionDigits: 0 });
  const fmt = (n) => nf.format(Math.round(n));
  const money = (n) => "$" + fmt(n);

  /* ------------------------------------------------------------------
     1. Medición de campaña (GTM / GA4 / Meta Pixel) + UTMs
     ------------------------------------------------------------------ */
  window.dataLayer = window.dataLayer || [];
  const T = CFG.tracking || {};
  if (T.gtmId) {
    window.dataLayer.push({ "gtm.start": Date.now(), event: "gtm.js" });
    const s = document.createElement("script");
    s.async = true; s.src = "https://www.googletagmanager.com/gtm.js?id=" + encodeURIComponent(T.gtmId);
    document.head.appendChild(s);
  } else if (T.ga4Id) {
    const s = document.createElement("script");
    s.async = true; s.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(T.ga4Id);
    document.head.appendChild(s);
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag("js", new Date()); window.gtag("config", T.ga4Id);
  }
  if (T.metaPixelId) {
    /* Código base estándar de Meta Pixel */
    !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version="2.0";n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,"script","https://connect.facebook.net/en_US/fbevents.js");
    window.fbq("init", T.metaPixelId); window.fbq("track", "PageView");
  }
  const LEAD_EVENTS = /registro|whatsapp|reunion/;
  function track(event, params = {}) {
    const data = Object.assign({ page_chapter: currentChapterTitle() }, utms, params);
    window.dataLayer.push(Object.assign({ event: "tc_" + event }, data));
    if (window.gtag && !T.gtmId) window.gtag("event", "tc_" + event, data);
    if (window.fbq) {
      window.fbq("trackCustom", "tc_" + event, data);
      if (LEAD_EVENTS.test(event)) window.fbq("track", "Lead", { content_name: event });
    }
  }

  // Guarda UTMs/clids de la campaña y los pasa a los enlaces de salida
  const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "gclid", "fbclid", "ttclid", "ref"];
  let utms = {};
  try { utms = JSON.parse(sessionStorage.getItem("tc_utms") || "{}"); } catch (e) { /* sin storage */ }
  const qs = new URLSearchParams(location.search);
  UTM_KEYS.forEach((k) => { if (qs.get(k)) utms[k] = qs.get(k); });
  try { sessionStorage.setItem("tc_utms", JSON.stringify(utms)); } catch (e) { /* sin storage */ }

  function withUtms(url) {
    try {
      const u = new URL(url, location.href);
      Object.entries(utms).forEach(([k, v]) => { if (!u.searchParams.has(k)) u.searchParams.set(k, v); });
      return u.toString();
    } catch (e) { return url; }
  }
  $$(".js-out").forEach((a) => {
    const key = a.dataset.link;
    if (CFG.links && CFG.links[key]) a.href = withUtms(CFG.links[key]);
  });
  const waUrl = (msg) => "https://wa.me/" + (CFG.links.whatsapp || "") + "?text=" + encodeURIComponent(msg);
  $$(".js-wa").forEach((a) => { a.href = waUrl(a.dataset.msg || "Hola, quiero información de TuConsumo."); });

  document.addEventListener("click", (e) => {
    const el = e.target.closest("[data-track]");
    if (el) track(el.dataset.track, { label: (el.textContent || "").trim().slice(0, 60) });
  });

  /* ------------------------------------------------------------------
     2. Utilidades visuales: toast, contadores, máquina de escribir
     ------------------------------------------------------------------ */
  const toastEl = $("#toast");
  let toastTimer;
  function toast(msg) {
    toastEl.textContent = msg; toastEl.classList.add("is-on");
    clearTimeout(toastTimer); toastTimer = setTimeout(() => toastEl.classList.remove("is-on"), 3200);
  }

  function countUp(el) {
    if (el.dataset.done) return; el.dataset.done = "1";
    const end = parseFloat(el.dataset.count), pre = el.dataset.prefix || "", suf = el.dataset.suffix || "";
    if (reduced || end === 0) { el.textContent = pre + fmt(end) + suf; return; }
    const dur = 1600, t0 = performance.now();
    const step = (t) => {
      const p = clamp((t - t0) / dur, 0, 1), e = 1 - Math.pow(1 - p, 4);
      el.textContent = pre + fmt(end * e) + suf;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  const typers = new WeakMap();
  function typeInto(el, text, speed = 22) {
    const prev = typers.get(el); if (prev) clearInterval(prev);
    el.classList.remove("done");
    if (reduced) { el.textContent = text; el.classList.add("done"); return; }
    el.textContent = ""; let i = 0;
    const id = setInterval(() => {
      el.textContent = text.slice(0, ++i);
      if (i >= text.length) { clearInterval(id); el.classList.add("done"); }
    }, speed);
    typers.set(el, id);
  }

  /* ------------------------------------------------------------------
     3. Revelado al hacer scroll
     ------------------------------------------------------------------ */
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      const el = en.target;
      el.classList.add("is-in");
      $$("[data-count]", el).forEach(countUp);
      if (el.matches("[data-count]")) countUp(el);
      $$(".type[data-type]", el).forEach((t) => { if (!t.dataset.started) { t.dataset.started = 1; setTimeout(() => typeInto(t, t.dataset.type), 600); } });
      io.unobserve(el);
    });
  }, { threshold: 0.18, rootMargin: "0px 0px -6% 0px" });
  $$(".reveal, .reveal-stagger, [data-count], .hero__stage").forEach((el) => io.observe(el));

  /* ------------------------------------------------------------------
     4. Hero: palabras animadas y texto rotativo
     ------------------------------------------------------------------ */
  $$(".hero__title .word").forEach((w, i) => { w.style.animationDelay = 0.15 + i * 0.07 + "s"; });
  const rot = $("#rotator");
  const phrases = ["compra tu comunidad.", "compran tus amigos.", "compra tu familia.", "recomiendas hoy."];
  let ri = 0;
  if (rot && !reduced) {
    setInterval(() => {
      rot.classList.add("out");
      setTimeout(() => {
        ri = (ri + 1) % phrases.length; rot.textContent = phrases[ri];
        rot.classList.remove("out"); rot.classList.add("pre");
        void rot.offsetWidth; rot.classList.remove("pre");
      }, 480);
    }, 3200);
  }

  /* Tilt 3D de la tarjeta de Willy */
  const tiltEl = $(".tilt");
  if (tiltEl && matchMedia("(hover:hover)").matches && !reduced) {
    const stage = tiltEl.parentElement;
    stage.addEventListener("pointermove", (e) => {
      const r = tiltEl.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      tiltEl.style.transform = `perspective(900px) rotateY(${(x - 0.5) * 10}deg) rotateX(${(0.5 - y) * 10}deg)`;
      tiltEl.style.setProperty("--mx", x * 100 + "%"); tiltEl.style.setProperty("--my", y * 100 + "%");
    });
    stage.addEventListener("pointerleave", () => { tiltEl.style.transform = ""; });
  }
  /* Botones magnéticos */
  if (matchMedia("(hover:hover)").matches && !reduced) {
    $$(".magnetic").forEach((b) => {
      b.addEventListener("pointermove", (e) => {
        const r = b.getBoundingClientRect();
        b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.15}px, ${(e.clientY - r.top - r.height / 2) * 0.25}px)`;
      });
      b.addEventListener("pointerleave", () => { b.style.transform = ""; });
    });
  }

  /* ------------------------------------------------------------------
     5. Capítulos: puntos laterales, progreso, nav, Willy narrador
     ------------------------------------------------------------------ */
  const chapters = $$("section.chapter");
  const dotsNav = $("#dots");
  chapters.forEach((ch, i) => {
    const a = document.createElement("a");
    a.href = "#" + ch.id; a.setAttribute("aria-label", ch.dataset.title);
    a.innerHTML = `<span>${String(i + 1).padStart(2, "0")} · ${ch.dataset.title}</span>`;
    dotsNav.appendChild(a);
  });
  const dotLinks = $$("a", dotsNav);
  $("#chapTotal").textContent = String(chapters.length).padStart(2, "0");
  let current = -1;
  function currentChapterTitle() { return chapters[current] ? chapters[current].dataset.title : "Inicio"; }

  const dock = $("#willyDock"), wText = $("#willyText"), wChap = $("#willyChapter"), wVideo = $("#willyVideoBtn");
  // Willy aparece en cada capítulo y se oculta solo; si el usuario lo abre, se queda fijo.
  let dockDismissed = false, dockPinned = false, dockTimer;
  function openDock() { dock.classList.add("is-open"); }
  function closeDock() { dock.classList.remove("is-open"); clearTimeout(dockTimer); }
  function autoShow(text) {
    if (dockDismissed) return;
    openDock(); clearTimeout(dockTimer);
    if (!dockPinned) dockTimer = setTimeout(closeDock, 4500 + text.length * 40);
  }
  $("#willyClose").addEventListener("click", () => { dockDismissed = true; dockPinned = false; closeDock(); track("willy_close"); });
  $("#willyAvatar").addEventListener("click", () => {
    if (dock.classList.contains("is-open")) { dockPinned = false; closeDock(); return; }
    dockDismissed = false; dockPinned = true; openDock(); sayChapter(current, true); track("willy_open");
  });
  $("#willyNext").addEventListener("click", () => {
    const next = chapters[current + 1] || chapters[0];
    next.scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
    track("willy_next");
  });
  function chapterVideoKey(ch) {
    const v = $(".video-slot[data-video], .js-video[data-video]", ch);
    return v ? v.dataset.video : null;
  }
  function sayChapter(i, force) {
    const ch = chapters[i]; if (!ch) return;
    wChap.textContent = String(i + 1).padStart(2, "0") + " · " + ch.dataset.title;
    const key = chapterVideoKey(ch);
    wVideo.classList.toggle("is-hidden", !key);
    if (key) wVideo.dataset.video = key;
    const text = ch.dataset.willy || "";
    if (!force && i > 0) autoShow(text);
    if (dock.classList.contains("is-open")) typeInto(wText, text, 16);
    else wText.textContent = text;
  }

  const nav = $("#nav"), bar = $("#progressBar"), chapNow = $("#chapNow"), mobileCta = $("#mobileCta");
  const navLinks = $$(".nav__links a");
  let lastY = scrollY;
  function onScroll() {
    const y = scrollY, h = document.documentElement.scrollHeight - innerHeight;
    bar.style.transform = `scaleX(${h > 0 ? y / h : 0})`;
    nav.classList.toggle("is-hidden", y > lastY && y > 400 && !dock.matches(":hover"));
    lastY = y;
    mobileCta.classList.toggle("is-on", y > innerHeight * 0.7);

    let idx = 0;
    for (let i = 0; i < chapters.length; i++) if (chapters[i].getBoundingClientRect().top < innerHeight * 0.45) idx = i;
    if (idx !== current) {
      current = idx;
      dotLinks.forEach((d, i) => d.classList.toggle("is-on", i === idx));
      chapNow.textContent = String(idx + 1).padStart(2, "0");
      navLinks.forEach((a) => a.classList.toggle("is-on", a.getAttribute("href") === "#" + chapters[idx].id));
      sayChapter(idx);
      track("chapter_view", { chapter: chapters[idx].dataset.title, chapter_index: idx + 1 });
    }
    hScroll(); parallax();
  }
  let ticking = false;
  addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(() => { onScroll(); ticking = false; }); } }, { passive: true });
  addEventListener("resize", () => { setupHScroll(); onScroll(); });

  /* Parallax suave en imágenes */
  const pars = $$(".parallax");
  function parallax() {
    if (reduced) return;
    pars.forEach((p) => {
      const r = p.getBoundingClientRect();
      if (r.bottom < 0 || r.top > innerHeight) return;
      const off = (r.top + r.height / 2 - innerHeight / 2) * -0.05;
      p.style.setProperty("--py", off.toFixed(1) + "px");
    });
  }

  /* ------------------------------------------------------------------
     6. Scroll horizontal "Cómo funciona"
     ------------------------------------------------------------------ */
  const hs = $("#como-funciona"), htrack = $("#htrack"), hbar = $("#hbar");
  let hDist = 0, hActive = false;
  function setupHScroll() {
    hActive = innerWidth > 900 && !reduced;
    if (!hActive) { hs.style.removeProperty("--hs-h"); htrack.style.transform = ""; return; }
    hDist = Math.max(0, htrack.scrollWidth - innerWidth);
    hs.style.setProperty("--hs-h", hDist + innerHeight * 1.15 + "px");
  }
  function hScroll() {
    if (!hActive) {
      if (hbar) { const m = htrack.scrollWidth - htrack.clientWidth; hbar.style.transform = `scaleX(${m > 0 ? htrack.scrollLeft / m : 0})`; }
      return;
    }
    const r = hs.getBoundingClientRect();
    const p = clamp(-r.top / (hs.offsetHeight - innerHeight), 0, 1);
    htrack.style.transform = `translate3d(${-p * hDist}px,0,0)`;
    hbar.style.transform = `scaleX(${p})`;
  }
  htrack.addEventListener("scroll", hScroll, { passive: true });

  /* ------------------------------------------------------------------
     7. La perla de 5 capas (canvas)
     ------------------------------------------------------------------ */
  const LAYER_COLORS = ["#2b6fe0", "#22c3c6", "#ff5b47", "#ffc43d", "#8b6cff"];
  const LAYERS = [
    { n: 4, rings: [62], size: 7 },
    { n: 16, rings: [102], size: 5 },
    { n: 64, rings: [140], size: 3.3 },
    { n: 256, rings: [174, 188], size: 2.4 },
    { n: 1024, rings: [212, 224, 236, 248], size: 1.75 }
  ];
  // rango "derramado": reparte cada capa uniformemente entre las ramas (dígitos base 4 invertidos)
  function rev4(j, digits) { let r = 0; for (let d = 0; d < digits; d++) { r = r * 4 + (j & 3); j >>= 2; } return r; }
  LAYERS.forEach((L, k) => { L.rank = Array.from({ length: L.n }, (_, j) => rev4(j, k + 1)); });
  const capacity = LAYERS.reduce((s, L) => s + L.n, 0); // 1364

  function layerFill(total) {
    let left = Math.max(0, Math.floor(total));
    return LAYERS.map((L) => { const f = Math.min(left, L.n); left -= f; return f; });
  }

  function makePearl(canvas) {
    const ctx = canvas.getContext("2d");
    const S = 560, C = S / 2;
    let dpr = 1, angle = 0, running = false, filled = capacity, highlight = 0, anim = null;
    function size() {
      dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = S * dpr; canvas.height = S * dpr;
    }
    function pos(k, j) {
      const L = LAYERS[k], a = ((j + 0.5) / L.n) * Math.PI * 2 + angle;
      const r = L.rings[j % L.rings.length];
      return [C + Math.cos(a) * r, C + Math.sin(a) * r];
    }
    function draw() {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, S, S);
      const fill = layerFill(filled);
      // guías
      ctx.lineWidth = 1;
      LAYERS.forEach((L) => L.rings.forEach((r) => { ctx.strokeStyle = "rgba(255,255,255,.05)"; ctx.beginPath(); ctx.arc(C, C, r, 0, Math.PI * 2); ctx.stroke(); }));
      // conexiones padre → hijo (capas 1-3)
      for (let k = 0; k < 3; k++) {
        const L = LAYERS[k];
        for (let j = 0; j < L.n; j++) {
          const on = L.rank[j] < fill[k];
          const dim = highlight && highlight !== k + 1;
          ctx.strokeStyle = on ? `rgba(127,240,230,${dim ? 0.06 : 0.28})` : "rgba(255,255,255,.05)";
          const [x, y] = pos(k, j);
          const [px, py] = k === 0 ? [C, C] : pos(k - 1, j >> 2);
          ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(x, y); ctx.stroke();
        }
      }
      // puntos
      LAYERS.forEach((L, k) => {
        const dim = highlight && highlight !== k + 1;
        for (let j = 0; j < L.n; j++) {
          const on = L.rank[j] < fill[k];
          const [x, y] = pos(k, j);
          ctx.globalAlpha = on ? (dim ? 0.18 : 1) : 0.14;
          ctx.fillStyle = on ? LAYER_COLORS[k] : "#ffffff";
          if (on && !dim && L.size > 3) { ctx.shadowColor = LAYER_COLORS[k]; ctx.shadowBlur = 12; } else ctx.shadowBlur = 0;
          ctx.beginPath(); ctx.arc(x, y, highlight === k + 1 && on ? L.size * 1.35 : L.size, 0, Math.PI * 2); ctx.fill();
        }
      });
      ctx.globalAlpha = 1; ctx.shadowBlur = 0;
    }
    function loop() { if (!running) return; if (!reduced) angle += 0.0009; draw(); requestAnimationFrame(loop); }
    size(); draw();
    return {
      start() { if (!running) { running = true; requestAnimationFrame(loop); } },
      stop() { running = false; },
      set(n) { filled = n; if (!running) draw(); },
      get() { return filled; },
      highlight(k) { highlight = k; if (!running) draw(); },
      animateTo(to, ms, onStep) {
        cancelAnimationFrame(anim);
        const from = filled, t0 = performance.now();
        const step = (t) => {
          const p = clamp((t - t0) / ms, 0, 1), e = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
          filled = from + (to - from) * e; if (onStep) onStep(filled); if (!running) draw();
          if (p < 1) anim = requestAnimationFrame(step);
        };
        anim = requestAnimationFrame(step);
      },
      resize() { size(); draw(); }
    };
  }

  const pearlCanvas = $("#pearl");
  if (pearlCanvas) {
    const pearl = makePearl(pearlCanvas);
    const readout = $("#pearlCount");
    new IntersectionObserver(([en]) => { en.isIntersecting ? pearl.start() : pearl.stop(); }).observe(pearlCanvas);
    let played = false;
    const play = () => {
      pearl.set(0); readout.textContent = "0";
      pearl.animateTo(capacity, reduced ? 1 : 5200, (v) => { readout.textContent = fmt(v); });
    };
    new IntersectionObserver(([en], obs) => { if (en.isIntersecting && !played) { played = true; play(); obs.disconnect(); } }, { threshold: 0.4 }).observe(pearlCanvas);
    $(".js-pearl-play").addEventListener("click", play);
    $$("#layerList .layer").forEach((b) => {
      const k = +b.dataset.layer;
      const on = () => { $$("#layerList .layer").forEach((x) => x.classList.toggle("is-on", x === b)); pearl.highlight(k); };
      b.addEventListener("mouseenter", on); b.addEventListener("focus", on);
      b.addEventListener("click", () => { on(); track("pearl_layer", { layer: k }); });
      b.addEventListener("mouseleave", () => { b.classList.remove("is-on"); pearl.highlight(0); });
      b.addEventListener("blur", () => { b.classList.remove("is-on"); pearl.highlight(0); });
    });
    addEventListener("resize", () => pearl.resize());
  }

  /* ------------------------------------------------------------------
     8. Mini calculadora de puntos
     ------------------------------------------------------------------ */
  const ptCompra = $("#ptCompra"), ptDesc = $("#ptDesc"), ptOut = $("#ptOut"), ptDescOut = $("#ptDescOut");
  const parseMoney = (s) => parseInt(String(s).replace(/\D/g, ""), 10) || 0;
  function rangeFill(r) { r.style.setProperty("--p", ((r.value - r.min) / (r.max - r.min)) * 100 + "%"); }
  function updPoints() {
    const v = parseMoney(ptCompra.value);
    ptDescOut.textContent = ptDesc.value + "%";
    ptOut.textContent = fmt(Math.floor((v * ptDesc.value) / 100 / PLAN.pesosPorPunto));
    rangeFill(ptDesc);
  }
  ptCompra.addEventListener("input", () => {
    const v = parseMoney(ptCompra.value);
    ptCompra.value = v ? fmt(Math.min(v, 99999999)) : "";
    updPoints();
  });
  ptDesc.addEventListener("input", updPoints);
  updPoints();

  /* ------------------------------------------------------------------
     9. Calculadora principal
     ------------------------------------------------------------------ */
  const cM = $("#cMembers"), cB = $("#cBuy"), cD = $("#cDisc"), cO = $("#cOwn");
  const out = {
    m: $("#cMembersOut"), b: $("#cBuyOut"), d: $("#cDiscOut"), o: $("#cOwnOut"),
    total: $("#cTotal"), bank: $("#cBank"), rebuy: $("#cRebuy"), net: $("#cNet"), cash: $("#cCash"),
    pts: $("#cPts"), year: $("#cYear"), says: $("#calcSays"), share: $("#calcShare")
  };
  const calcLayers = $("#calcLayers"), calcBars = $("#calcBars");
  LAYERS.forEach((L, k) => {
    calcLayers.insertAdjacentHTML("beforeend",
      `<div class="cl"><span>Capa ${k + 1}</span><div class="cl__track"><div class="cl__fill" style="background:${LAYER_COLORS[k]};transform:scaleX(0)"></div></div><span>0 / ${fmt(L.n)}</span></div>`);
    calcBars.insertAdjacentHTML("beforeend",
      `<div class="cb"><em>$0</em><i style="background:${LAYER_COLORS[k]};height:0%"></i><small>Capa ${k + 1}</small></div>`);
  });
  const clRows = $$(".cl", calcLayers), cbCols = $$(".cb", calcBars);
  let shown = 0, totalAnim;
  function animateTotal(to) {
    cancelAnimationFrame(totalAnim);
    const from = shown, t0 = performance.now();
    const step = (t) => {
      const p = clamp((t - t0) / 500, 0, 1), e = 1 - Math.pow(1 - p, 3);
      shown = from + (to - from) * e; out.total.textContent = money(shown);
      if (p < 1) totalAnim = requestAnimationFrame(step);
    };
    totalAnim = requestAnimationFrame(step);
    out.total.parentElement.classList.remove("bump"); void out.total.offsetWidth; out.total.parentElement.classList.add("bump");
  }
  function willySays(n, total) {
    const fill = layerFill(n), active = fill.filter(Boolean).length;
    if (n === 0) return "Empieza compartiendo tu enlace: tus primeras 4 personas activan tu capa 1.";
    if (n <= 4) return `¡Tu primera capa ya está en marcha! Cuando cada uno traiga a 4 más, se activa la capa 2.`;
    if (n < 84) return `Con ${fmt(n)} personas ya tienes ${active} capas en movimiento. ¡La capa 3 es la que mejor paga por punto!`;
    if (n < 340) return `¡Con ${fmt(n)} personas ya tienes ${active} capas en movimiento! Cada compra suma puntos para ti.`;
    if (n < capacity) return `¡Tu comunidad ya llega a la capa ${active}! Aquí el crecimiento se multiplica por 4.`;
    return `¡Comunidad completa! 1.364 personas comprando: eso es una perla de gran valor. 💎`;
  }
  let calcTouched = false;
  function calc(fromUser) {
    const n = +cM.value, buy = +cB.value, disc = +cD.value / 100, own = +cO.value;
    [cM, cB, cD, cO].forEach(rangeFill);
    out.m.textContent = fmt(n); out.b.textContent = money(buy); out.d.textContent = cD.value + "%"; out.o.textContent = money(own);

    const pts = Math.floor((buy * disc) / PLAN.pesosPorPunto);
    const fill = layerFill(n);
    const per = fill.map((f, k) => f * PLAN.basePorPunto[k] * pts);
    const net = per.reduce((a, b) => a + b, 0);
    const cash = own * PLAN.cashbackPersonal;
    const total = net + cash;

    animateTotal(total);
    out.bank.textContent = money(total * PLAN.retiroBanco);
    out.rebuy.textContent = money(total * PLAN.recompra);
    out.net.textContent = money(net); out.cash.textContent = money(cash);
    out.pts.textContent = fmt(pts); out.year.textContent = money(total * 12);
    out.says.textContent = own === 0
      ? "Recuerda: necesitas una compra personal al mes para mantenerte activo y poder retirar."
      : willySays(n, total);

    const maxPer = Math.max(...per, 1);
    fill.forEach((f, k) => {
      clRows[k].querySelector(".cl__fill").style.transform = `scaleX(${f / LAYERS[k].n})`;
      clRows[k].lastElementChild.textContent = `${fmt(f)} / ${fmt(LAYERS[k].n)}`;
      cbCols[k].querySelector("i").style.height = (per[k] / maxPer) * 100 + "%";
      cbCols[k].querySelector("em").textContent = per[k] >= 1e6 ? "$" + (per[k] / 1e6).toFixed(1).replace(".", ",") + "M" : per[k] >= 1000 ? "$" + Math.round(per[k] / 1000) + "k" : money(per[k]);
    });
    $$(".chips .chip[data-members]").forEach((c) => c.classList.toggle("is-on", +c.dataset.members === n));

    const msg = `Hola, usé la calculadora de Willy en TuConsumo:\n• Comunidad: ${fmt(n)} personas\n• Compra promedio: ${money(buy)} (${cD.value}% de descuento)\n• Mi compra personal: ${money(own)}\n• Estimado mensual: ${money(total)} (${money(total * PLAN.retiroBanco)} a mi banco)\nQuiero saber cómo empezar.`;
    out.share.href = waUrl(msg);
    if (fromUser && !calcTouched) { calcTouched = true; track("calc_start"); }
  }
  let calcDebounce;
  [cM, cB, cD, cO].forEach((r) => r.addEventListener("input", () => {
    calc(true);
    clearTimeout(calcDebounce);
    calcDebounce = setTimeout(() => track("calc_change", { members: +cM.value, buy: +cB.value, disc: +cD.value, own: +cO.value }), 1200);
  }));
  $$(".chips .chip[data-members]").forEach((c) => c.addEventListener("click", () => {
    cM.value = c.dataset.members; calc(true); track("calc_scenario", { members: +c.dataset.members });
  }));
  calc(false);

  /* ------------------------------------------------------------------
     10. Espacios de video de Willy + modal
     ------------------------------------------------------------------ */
  const VIDEOS = CFG.videos || {};
  const POSTER = "assets/img/willy-hero.webp";
  $$(".video-slot[data-video]").forEach((slot) => {
    const key = slot.dataset.video, v = VIDEOS[key] || { title: "Video de Willy" };
    const ready = !!v.src;
    slot.innerHTML = `
      <button class="vcard ${ready ? "is-ready" : "is-soon"} js-video" data-video="${key}" data-track="video_${key}">
        <span class="vcard__thumb"><img src="${v.poster || POSTER}" alt="" loading="lazy"><span class="vcard__btn"><span class="play-ic"></span></span></span>
        <span class="vcard__meta">
          <small>${ready ? "▶ Video de Willy" : "🎬 Video próximamente"}</small>
          <b>${v.title || "Video de Willy"}</b>
          <span>${ready ? (v.duration ? v.duration + " min" : "Reproducir") : "Willy está grabando este video"}</span>
        </span>
      </button>`;
  });

  const modal = $("#videoModal"), frame = $("#videoFrame"), vTitle = $("#videoTitle"), mBox = $(".modal__box", modal);
  let lastFocus = null;
  function embedFor(src) {
    let m;
    if ((m = src.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/|live\/))([\w-]{6,})/)))
      return `<iframe src="https://www.youtube-nocookie.com/embed/${m[1]}?autoplay=1&rel=0&modestbranding=1&playsinline=1" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen title="Video de Willy"></iframe>`;
    if ((m = src.match(/vimeo\.com\/(?:video\/)?(\d+)/)))
      return `<iframe src="https://player.vimeo.com/video/${m[1]}?autoplay=1&title=0&byline=0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen title="Video de Willy"></iframe>`;
    const vid = document.createElement("video");
    vid.src = src; vid.controls = true; vid.autoplay = true; vid.playsInline = true; vid.poster = POSTER;
    return vid.outerHTML;
  }
  function openVideo(key) {
    const v = VIDEOS[key];
    if (!v || !v.src) { toast("🎬 Willy está grabando este video. ¡Muy pronto lo verás aquí!"); return; }
    lastFocus = document.activeElement;
    vTitle.textContent = v.title || "Video de Willy";
    mBox.classList.toggle("is-vertical", !!v.vertical);
    frame.innerHTML = embedFor(v.src);
    modal.hidden = false; document.body.style.overflow = "hidden";
    $(".modal__x", modal).focus();
    track("video_play", { video: key });
  }
  function closeVideo() {
    modal.hidden = true; frame.innerHTML = ""; document.body.style.overflow = "";
    if (lastFocus) lastFocus.focus();
  }
  document.addEventListener("click", (e) => {
    const b = e.target.closest(".js-video");
    if (b) { e.preventDefault(); openVideo(b.dataset.video); }
    if (e.target.closest("[data-close]")) closeVideo();
  });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !modal.hidden) closeVideo(); });

  /* ------------------------------------------------------------------
     11. Pestañas de documentos
     ------------------------------------------------------------------ */
  $$(".tabs .tab").forEach((t) => t.addEventListener("click", () => {
    $$(".tabs .tab").forEach((x) => {
      const on = x === t;
      x.classList.toggle("is-on", on); x.setAttribute("aria-selected", on);
      document.getElementById(x.getAttribute("aria-controls")).hidden = !on;
    });
  }));

  /* FAQ: registra qué preguntas se abren */
  $$(".faq details").forEach((d) => d.addEventListener("toggle", () => {
    if (d.open) track("faq_open", { question: d.querySelector("summary").textContent });
  }));

  $("#year").textContent = new Date().getFullYear();

  /* Arranque */
  setupHScroll();
  onScroll();
  addEventListener("load", () => { setupHScroll(); onScroll(); });
})();
