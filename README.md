# TuConsumo · Landing de campaña con Willy

Landing de aterrizaje para la campaña publicitaria de **TuConsumo.com.co**. Willy, el personaje
virtual, guía al visitante en un recorrido por el marketplace y el modelo de bonificaciones
(matriz 4 × 5), con calculadora de ingresos y espacios para sus videos.

El sitio tiene dos páginas, una por público, en el mismo dominio:

| Ruta | Público | Archivo |
|------|---------|---------|
| `/` | Compradores y consultores (12 capítulos) | `index.html` |
| `/proveedores/` | Negocios y marcas que quieren vender (6 capítulos) | `proveedores/index.html` |

Las dos comparten estilos, configuración y scripts de `assets/`. La landing de compradores enlaza a
la de proveedores desde el menú, un aviso antes de “Buenas prácticas”, la FAQ y el pie de página; la
de proveedores enlaza de vuelta con “Soy comprador”.

## Estructura

```
index.html              → landing de compradores (12 capítulos)
proveedores/index.html  → landing de proveedores (6 capítulos)
assets/css/styles.css   → estilos y animaciones
assets/js/config.js     → ⚙️ ÚNICO archivo a editar: videos, enlaces, tracking, parámetros del plan
assets/js/main.js       → interacciones (calculadora, perla, Willy, videos, medición)
assets/img/             → ilustraciones optimizadas (WebP) tomadas de las inducciones
assets/video/           → videos propios de Willy (opcional)
assets/audio/           → audios de Willy (ElevenLabs), usados mientras llegan los videos
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
| — | Aviso a proveedores | Banner que lleva a `/proveedores/` (no es capítulo) |
| 10 | Buenas prácticas | Qué hacer y qué no |
| 11 | Preguntas | FAQ |
| 12 | Empieza | CTA final |

### Recorrido de proveedores (`/proveedores/`)

| # | Capítulo | Contenido |
|---|----------|-----------|
| 1 | Vende con nosotros | Vende, fideliza y crece; audio/video de Willy; $0 inscripción y mensualidad |
| 2 | Por qué funciona | Publicidad vs. modelo TuConsumo; simulador de venta (descuento → 40% → puntos) |
| 3 | Cómo opera | Flujo de 5 pasos, requisitos para publicar, despacho y liquidación |
| 4 | Vincúlate | 5 pasos, responsabilidades de cada parte, Willy y Lina |
| 5 | Preguntas | FAQ de proveedores |
| 6 | Empieza | Agendar reunión comercial por WhatsApp o correo |

Willy acompaña los dos recorridos con un globo flotante que cambia de mensaje en cada capítulo.

## Dominio

Todo usa rutas relativas, así que funciona en cualquier dominio sin cambios. Cuando el dominio esté
listo, conviene poner URL absolutas en `og:image` / `twitter:image` de las dos páginas (las redes
sociales no leen rutas relativas en la vista previa) y en el `url` del bloque `ld+json`.

## Subir los videos de Willy

En `assets/js/config.js` → `videos` hay 9 espacios (`bienvenida`, `ecosistema`, `comoFunciona`,
`comunidad`, `puntos`, `calculadora`, `billetera`, `registro`, `proveedores`). Pega en `src` un enlace
de YouTube, YouTube Shorts, Vimeo o un `.mp4` propio. Usa `vertical: true` para videos 9:16.
Mientras `src` esté vacío, se reproduce el `audio` de Willy (si lo hay) o se muestra “Video próximamente”.

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
