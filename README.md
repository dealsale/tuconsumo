# TuConsumo · Landing de campaña con Willy

Landing de aterrizaje para la campaña publicitaria de **TuConsumo.com.co**. Willy, el personaje
virtual, guía al visitante en un recorrido de 13 capítulos por el marketplace y el modelo de
bonificaciones (matriz 4 × 5), con calculadora de ingresos y espacios para sus videos.

## Estructura

```
index.html              → página completa (13 capítulos)
assets/css/styles.css   → estilos y animaciones
assets/js/config.js     → ⚙️ ÚNICO archivo a editar: videos, enlaces, tracking, parámetros del plan
assets/js/main.js       → interacciones (calculadora, perla, Willy, videos, medición)
assets/img/             → ilustraciones optimizadas (WebP) tomadas de las inducciones
assets/video/           → videos propios de Willy (opcional)
```

Es un sitio estático: se puede publicar tal cual en Netlify, Vercel, GitHub Pages, cPanel o
cualquier hosting. Para probarlo localmente: `python3 -m http.server` y abrir http://localhost:8000.

## Recorrido

| # | Capítulo | Contenido |
|---|----------|-----------|
| 1 | Inicio | Titular animado, Willy con video de bienvenida, cifras clave |
| 2 | ¿Qué es? | Marketplace; roles comprador / consultor / proveedor |
| 3 | Cómo funciona | Scroll horizontal: Compra → Usa → Comparte → Recomienda → Gana |
| 4 | Tu comunidad | Perla interactiva de 5 capas (4/16/64/256/1.024 = 1.365) |
| 5 | Los puntos | Mini‑calculadora de puntos, valor por capa, simulación oficial ($1.095.600) |
| 6 | Calculadora | Estimado mensual, 70/30, 12 meses, compartir por WhatsApp |
| 7 | Billetera | 2% personal y regla 70/30 |
| 8 | Mantente activo | Activo vs. en pausa |
| 9 | Regístrate | 6 pasos, documentos, RUT CIIU 8299, $0 |
| 10 | Proveedores | Vende, fideliza y crece; flujo y responsabilidades |
| 11 | Buenas prácticas | Qué hacer y qué no |
| 12 | Preguntas | FAQ |
| 13 | Empieza | CTA final |

Willy acompaña todo el recorrido con un globo flotante que cambia de mensaje en cada capítulo.

## Subir los videos de Willy

En `assets/js/config.js` → `videos` hay 9 espacios (`bienvenida`, `ecosistema`, `comoFunciona`,
`comunidad`, `puntos`, `calculadora`, `billetera`, `registro`, `proveedores`). Pega en `src` un enlace
de YouTube, YouTube Shorts, Vimeo o un `.mp4` propio. Usa `vertical: true` para videos 9:16.
Mientras `src` esté vacío, el espacio muestra “Video próximamente”.

## Campaña: medición y UTMs

- Rellena `tracking.gtmId` (o `ga4Id`) y `tracking.metaPixelId` en `config.js`.
- Eventos enviados a `dataLayer` / GA4 / Meta (prefijo `tc_`): clics en CTA (`nav_registro`,
  `hero_calculadora`, `calc_registro`, `final_registro`…), `calc_start`, `calc_change`,
  `calc_scenario`, `video_play`, `chapter_view`, `faq_open`, `willy_open`. Los clics de registro,
  WhatsApp y reunión de proveedores disparan además el evento estándar **Lead** de Meta.
- Los parámetros `utm_*`, `gclid`, `fbclid`, `ttclid` y `ref` de la URL de llegada se guardan en la
  sesión y se añaden automáticamente a los enlaces de salida hacia tuconsumo.com.co.
- Enlaces de anclaje útiles para anuncios: `#calculadora`, `#comunidad`, `#registro`, `#proveedores`.

## Enlaces pendientes

Los enlaces `registro`, `marketplace` y `proveedores` de `config.js` apuntan por ahora a la página
principal de tuconsumo.com.co. Cámbialos por las URL exactas (por ejemplo, el enlace de registro
“Compra recomienda y gana”) cuando estén disponibles.

## Nota legal

Las cifras usan la liquidación de puntos de TuConsumo: puntos = redondear(compra × descuento × 40% ÷ 360),
pagados por cada persona activa a $50/$100/$150/$30/$30 según la capa; además 2% personal y regla 70/30 y se presentan como simulaciones ilustrativas, sin garantía de ingresos.
Conviene que el área legal de TuConsumo revise los textos antes de pautar.

## Propuesta para iNNpulsa Colombia

`innpulsa.html` es la propuesta de alianza TuConsumo × iNNpulsa (no está enlazada desde la landing: se abre
directo en `/innpulsa.html`). Incluye: lo que entendimos de sus programas (Ruta Milagro, ZASCA, Oportunidades para
Emprender, iNNpulsa Mujeres, Red de Tiendas Solidarias, XISQUA), la necesidad identificada (canal de venta
permanente después de cada programa), la propuesta en 4 pilares, plan de trabajo con piloto de 90 días,
simulador de impacto por cohorte, metas, roles y próximos pasos. Estilos en `assets/css/innpulsa.css` y
lógica en `assets/js/innpulsa.js`. Los logos de iNNpulsa se usan con autorización de la entidad.
