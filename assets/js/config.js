/* ==========================================================================
   CONFIGURACIÓN DE LA LANDING · TuConsumo con Willy
   Este es el ÚNICO archivo que necesitas editar para:
   - Subir / cambiar los videos de Willy
   - Cambiar enlaces de registro, compra y WhatsApp
   - Activar Google Tag Manager / Meta Pixel / GA4 para la campaña
   ========================================================================== */
window.TC_CONFIG = {
  /* ---------- Enlaces principales ---------- */
  links: {
    marketplace: "https://tuconsumo.com.co/",
    // Enlace de "Compra, recomienda y gana" → "Regístrame para recibir bonificación"
    registro: "https://tuconsumo.com.co/",
    // Registro de proveedores (vendedores)
    proveedores: "https://tuconsumo.com.co/",
    whatsapp: "573205640519",
    email: "info@tuconsumo.com.co"
  },

  /* ---------- Videos de Willy ----------
     Cada espacio de video de la página tiene un id. Para activarlo, pon en `src`:
       - Un enlace de YouTube  (https://youtu.be/XXXX o https://www.youtube.com/watch?v=XXXX)
       - Un enlace de YouTube Shorts (https://youtube.com/shorts/XXXX)
       - Un enlace de Vimeo    (https://vimeo.com/123456)
       - Un archivo propio     ("assets/video/bienvenida.mp4")
     Si `src` está vacío, el espacio muestra "Video próximamente".
     `vertical: true` para videos 9:16 (Reels / TikTok / Shorts).          */
  videos: {
    bienvenida:  { src: "", vertical: false, title: "Willy te da la bienvenida",            duration: "1:00" },
    ecosistema:  { src: "", vertical: false, title: "¿Qué es TuConsumo?",                   duration: "1:30" },
    comoFunciona:{ src: "", vertical: false, title: "Compra, usa, comparte y gana",          duration: "1:45" },
    comunidad:   { src: "", vertical: false, title: "Tu comunidad de 5 capas",               duration: "2:00" },
    puntos:      { src: "", vertical: false, title: "¿De dónde salen los puntos?",           duration: "1:30" },
    calculadora: { src: "", vertical: false, title: "Willy usa la calculadora contigo",       duration: "2:00" },
    billetera:   { src: "", vertical: false, title: "Tu billetera: 2% y regla 70/30",       duration: "1:20" },
    registro:    { src: "", vertical: false, title: "Regístrate paso a paso",                duration: "2:30" },
    proveedores: { src: "", vertical: false, title: "Vende, fideliza y crece",               duration: "2:00" }
  },

  /* ---------- Medición de campaña ----------
     Deja vacío lo que no uses. Los clics en botones, uso de la calculadora,
     reproducción de videos y avance por capítulos se envían a dataLayer
     (GTM / GA4) y a Meta Pixel automáticamente.                            */
  tracking: {
    gtmId: "",        // ej: "GTM-XXXXXXX"
    ga4Id: "",        // ej: "G-XXXXXXXXXX" (solo si NO usas GTM)
    metaPixelId: ""   // ej: "123456789012345"
  },

  /* ---------- Parámetros del plan (según material de inducción) ---------- */
  plan: {
    ancho: 4,                              // cada núcleo tiene 4 compradores directos
    capas: 5,
    basePorPunto: [50, 100, 150, 30, 30], // $ por punto en cada capa
    // Liquidación de puntos: puntos = redondear(compra × descuento × 40% ÷ 360)
    // Ej.: $100.000 con 20% → $20.000 × 40% = $8.000 ÷ 360 = 22,22 → 22 puntos
    porcentajeUtilidad: 0.40,              // siempre 40% del descuento
    divisorPuntos: 360,                    // suma de las bases de las 5 capas (50+100+150+30+30)
    cashbackPersonal: 0.02,                // 2% en compras personales
    retiroBanco: 0.70,                     // 70% transferible a banco
    recompra: 0.30                         // 30% para compras en el marketplace
  }
};
