/* ==========================================================================
   Propuesta TuConsumo × iNNpulsa — interacciones
   ========================================================================== */
(() => {
  "use strict";
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const nf = new Intl.NumberFormat("es-CO", { maximumFractionDigits: 0 });
  const fmt = (n) => nf.format(Math.round(n));
  const money = (n) => "$" + fmt(n);
  const fine = matchMedia("(hover:hover) and (pointer:fine)").matches;

  // Parámetros del plan (mismos de la landing)
  const PLAN = { cashback: 0.02, porcentajeUtilidad: 0.40 };

  /* Contadores y máquina de escribir */
  function countUp(el) {
    if (el.dataset.done) return; el.dataset.done = "1";
    const end = parseFloat(el.dataset.count), pre = el.dataset.prefix || "", suf = el.dataset.suffix || "";
    const t0 = performance.now();
    const step = (t) => {
      const p = clamp((t - t0) / 1500, 0, 1), e = 1 - Math.pow(1 - p, 4);
      el.textContent = pre + fmt(end * e) + suf;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }
  function typeInto(el, text) {
    el.textContent = ""; let i = 0;
    const id = setInterval(() => { el.textContent = text.slice(0, ++i); if (i >= text.length) { clearInterval(id); el.classList.add("done"); } }, 22);
  }

  /* Títulos palabra por palabra (mantiene juntas palabra y puntuación) */
  $$(".title, .final__title").forEach((t) => {
    const words = []; let cur = null;
    const push = (n) => { if (!cur) { cur = []; words.push(cur); } cur.push(n); };
    [...t.childNodes].forEach((n) => {
      if (n.nodeType === 3) n.textContent.split(/(\s+)/).forEach((w) => { if (!w) return; if (/^\s+$/.test(w)) { cur = null; words.push(" "); } else push(document.createTextNode(w)); });
      else push(n);
    });
    t.textContent = ""; let i = 0;
    words.forEach((w) => {
      if (w === " ") { t.appendChild(document.createTextNode(" ")); return; }
      const o = document.createElement("span"); o.className = "sw";
      const inn = document.createElement("span"); inn.style.setProperty("--i", i++);
      w.forEach((n) => inn.appendChild(n)); o.appendChild(inn); t.appendChild(o);
    });
  });

  /* Revelado al hacer scroll */
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      const el = en.target; el.classList.add("is-in");
      $$("[data-count]", el).forEach(countUp);
      $$(".type[data-type]", el).forEach((t) => { if (!t.dataset.started) { t.dataset.started = 1; setTimeout(() => typeInto(t, t.dataset.type), 500); } });
      io.unobserve(el);
    });
  }, { threshold: 0.01, rootMargin: "0px 0px -4% 0px" });
  $$(".reveal, .reveal-stagger, .phase").forEach((el) => io.observe(el));
  $$(".hero__title .word").forEach((w, i) => { w.style.animationDelay = 0.15 + i * 0.08 + "s"; });

  /* Progreso, nav y línea del plan */
  const nav = $("#nav"), bar = $("#progressBar"), phases = $("#phases"), navLinks = $$(".nav__links a");
  const sections = navLinks.map((a) => document.querySelector(a.getAttribute("href"))).filter(Boolean);
  let lastY = scrollY;
  function onScroll() {
    const y = scrollY, h = document.documentElement.scrollHeight - innerHeight;
    bar.style.transform = `scaleX(${h > 0 ? y / h : 0})`;
    nav.classList.toggle("is-hidden", y > lastY && y > 400); lastY = y;
    if (phases) {
      const r = phases.getBoundingClientRect();
      phases.style.setProperty("--fill", clamp((innerHeight * 0.75 - r.top) / r.height, 0, 1).toFixed(3));
    }
    let cur = null; sections.forEach((s) => { if (s.getBoundingClientRect().top < innerHeight * 0.4) cur = s.id; });
    navLinks.forEach((a) => a.classList.toggle("is-on", a.getAttribute("href") === "#" + cur));
  }
  let tick = false;
  addEventListener("scroll", () => { if (!tick) { tick = true; requestAnimationFrame(() => { onScroll(); tick = false; }); } }, { passive: true });
  onScroll();

  /* Tilt de la tarjeta de Willy y parallax del hero */
  const tiltEl = $(".tilt"), hero = $(".hero");
  if (fine && tiltEl) {
    hero.addEventListener("pointermove", (e) => {
      const r = tiltEl.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      if (x > -0.2 && x < 1.2 && y > -0.2 && y < 1.2) tiltEl.style.transform = `perspective(900px) rotateY(${(x - 0.5) * 10}deg) rotateX(${(0.5 - y) * 10}deg)`;
      hero.style.setProperty("--hx", (e.clientX / innerWidth - 0.5).toFixed(3));
      hero.style.setProperty("--hy", (e.clientY / innerHeight - 0.5).toFixed(3));
    });
    hero.addEventListener("pointerleave", () => { tiltEl.style.transform = ""; });
  }

  /* Ripple en botones */
  document.addEventListener("pointerdown", (e) => {
    const b = e.target.closest(".btn"); if (!b) return;
    const r = b.getBoundingClientRect(), d = Math.max(r.width, r.height);
    const s = document.createElement("span"); s.className = "ripple";
    s.style.cssText = `width:${d}px;height:${d}px;left:${e.clientX - r.left - d / 2}px;top:${e.clientY - r.top - d / 2}px`;
    b.appendChild(s); setTimeout(() => s.remove(), 700);
  });

  /* WhatsApp con mensaje */
  $$(".js-wa").forEach((a) => { a.href = "https://wa.me/573205640519?text=" + encodeURIComponent(a.dataset.msg || ""); });

  /* Simulador de impacto de una cohorte */
  const iU = $("#iU"), iC = $("#iC"), iB = $("#iB"), iD = $("#iD");
  const o = (id) => document.getElementById(id);
  function fill(r) { r.style.setProperty("--p", ((r.value - r.min) / (r.max - r.min)) * 100 + "%"); }
  let shown = 0, anim;
  function animateTotal(to) {
    cancelAnimationFrame(anim); const from = shown, t0 = performance.now();
    const step = (t) => { const p = clamp((t - t0) / 500, 0, 1); shown = from + (to - from) * (1 - Math.pow(1 - p, 3)); o("oSales").textContent = money(shown); if (p < 1) anim = requestAnimationFrame(step); };
    anim = requestAnimationFrame(step);
  }
  function sim() {
    const u = +iU.value, c = +iC.value, b = +iB.value, d = +iD.value / 100;
    [iU, iC, iB, iD].forEach(fill);
    o("sU").textContent = fmt(u); o("sC").textContent = fmt(c); o("sB").textContent = money(b); o("sD").textContent = iD.value + "%";
    const buyers = u * c, sales = buyers * b;
    const cash = sales * PLAN.cashback;
    const bonus = sales * d * PLAN.porcentajeUtilidad; // 40% del descuento repartido en las 5 capas
    animateTotal(sales);
    o("oPerUnit").textContent = money(c * b);
    o("oYear").textContent = money(sales * 12);
    o("oBuyers").textContent = fmt(buyers);
    o("oCash").textContent = money(cash);
    o("oBonus").textContent = money(bonus);
    o("oHomes").textContent = money((cash + bonus) * 12);
    o("simSays").textContent = `Con ${fmt(u)} unidades y ${fmt(c)} compradores cada una, ${fmt(buyers)} hogares compran productos de la cohorte: ${money(c * b)} al mes para cada emprendedor.`;
    $$(".chip[data-u]").forEach((ch) => ch.classList.toggle("is-on", +ch.dataset.u === u));
  }
  [iU, iC, iB, iD].forEach((r) => r.addEventListener("input", sim));
  $$(".chip[data-u]").forEach((ch) => ch.addEventListener("click", () => { iU.value = ch.dataset.u; sim(); }));
  sim();

  const yr = $("#year"); if (yr) yr.textContent = new Date().getFullYear();
})();
