# carlosjohnson.github.io

Sitio web trilingüe (alemán / español / inglés) del violinista **Carlos Johnson**, construido con Hugo, editable por el propio cliente a través de un CMS git-based y desplegado gratis en GitHub Pages.

Forma parte del proyecto **profi-web**: páginas web para músicos con plantillas reutilizables y un panel de administración para que ellos mismos mantengan el contenido.

- **Producción:** https://profi-web-de.github.io/carlos-johnson/
- **Panel de administración:** `/admin` (por ejemplo, https://profi-web-de.github.io/carlos-johnson/admin/)
- **Manual para el cliente:** [user-manual.md](user-manual.md)
- **Dar de alta a otro artista:** [onboarding.md](onboarding.md)

---

## Stack

| Pieza | Tecnología | Detalle |
|---|---|---|
| Generador | **Hugo extended** | Versión fijada en el workflow: `0.159.1` (requiere Dart Sass) |
| Tema | **PaperMod** | Vendorizado dentro del repo (`themes/PaperMod`), **no** es submódulo |
| CMS | **Sveltia CMS** | `static/admin/`, backend GitHub, config compatible con Decap/Netlify CMS |
| Hosting | **GitHub Pages** | Deploy vía GitHub Actions |
| Formulario | **formsubmit.co** | Envío AJAX, sin backend propio |
| Analítica | **Google Analytics 4** | Con banner de consentimiento propio (Consent Mode) |
| Idiomas | `de` (por defecto) + `es` + `en` | `i18n.structure: multiple_files` |

---

## Estructura del repositorio

```
.
├── .github/workflows/hugo.yml     # Build + deploy a GitHub Pages
├── hugo.toml                      # Config del sitio, idiomas y menús
├── archetypes/                    # Plantillas de front matter (concerts.md, default.md)
├── assets/
│   ├── css/extended/              # CSS extra a nivel de proyecto (footer-menu.css)
│   ├── fonts/                     # Tipografías autoalojadas (woff2)
│   └── images/                    # Media del CMS (pasa por el pipeline de imágenes)
├── content/                       # Contenido en .md, un archivo por idioma
├── data/site_settings.yml         # Ajustes globales editables desde el CMS
├── i18n/                          # (vacío: las traducciones viven en el tema)
├── layouts/                       # Overrides de proyecto (ganan sobre el tema)
│   ├── partials/footer.html
│   ├── partials/responsive-image.html   # Pipeline de imágenes (srcset + WebP)
│   ├── partials/image-url.html          # URL de una imagen procesada
│   ├── partials/section-visible.html    # Regla de visibilidad de secciones
│   ├── partials/extend_head.html        # @font-face de las fuentes autoalojadas
│   └── shortcodes/analytics-consent-manage.html
├── static/
│   ├── admin/                     # Sveltia CMS (index.html + config.yml)
│   ├── favicon.svg                # Monograma CJ sobre el color de acento
│   └── og-default.jpg             # Imagen 1200x630 al compartir el sitio
├── themes/PaperMod/               # Tema + TODAS las customizaciones
└── user-manual.md                 # Manual de uso para el cliente
```

> **Ojo con la precedencia:** existen dos `footer.html` (uno en `layouts/partials/` y otro en `themes/PaperMod/layouts/partials/`). Hugo usa siempre el de la raíz del proyecto.

---

## Contenido y modelo de datos

### Multilingüe

Alemán es el idioma por defecto y **omite el sufijo** en el nombre de archivo; español e inglés lo llevan explícito:

```
content/about.md       → alemán  (/about/)
content/about.es.md    → español (/es/about/)
content/about.en.md    → inglés  (/en/about/)
```

Toda página nueva debe crearse en **los tres** idiomas.

> **Trampa de TOML que costó un rato:** `defaultContentLanguage` tiene que estar
> antes de cualquier cabecera `[tabla]` en `hugo.toml`. Estaba escrita después de
> `[services.googleAnalytics]`, así que TOML la trataba como clave de esa tabla y
> Hugo caía en silencio a `en`. Con solo dos idiomas no se notaba, porque el
> alemán ganaba la raíz por peso; al añadir el inglés, los archivos sin sufijo
> pasaron a considerarse ingleses y el sitio alemán se vació.

### Páginas y secciones

| Ruta | Tipo | Layout que la renderiza |
|---|---|---|
| `content/_index.md` | Home (hero) | `partials/index_profile.html` |
| `content/home/video.md` | Video destacado de la home | leído por `index_profile.html` |
| `content/home/press.md` | Citas de prensa de la home | leído por `index_profile.html` |
| `content/home/cta.md` | Bloque de cierre de la home | leído por `index_profile.html` |
| `content/about.md` | Biografía | `_default/single.html` |
| `content/violin.md` | Violinista | `_default/single.html` |
| `content/conducting.md` | Director | `_default/single.html` |
| `content/teaching/_index.md` | Docencia | `teaching/list.html` |
| `content/concerts/` | Conciertos | `concerts/list.html` + `concerts/single.html` |
| `content/images/_index.md` | Galería de imágenes | `images/list.html` |
| `content/videos/_index.md` | Galería de videos | `videos/list.html` |
| `content/videos/detail.md` | Detalle de video | `videos/single.html` |
| `content/audios/_index.md` | Galería de audios | `audios/list.html` |
| `content/contact.md` | Contacto (`type: contact`) | `contact/single.html` |
| `content/privacy.md` | Política de privacidad | `_default/single.html` |

### Patrón clave: la portada partida en fragmentos

La home no es un solo archivo. El hero vive en `content/_index.{lang}.md`, que es la página real, y cada uno de los demás bloques —video destacado, citas de prensa, bloque de cierre— tiene su propio archivo en `content/home/`.

El motivo es el CMS: **cada entrada del panel corresponde a un archivo**, así que meter todo en `_index.md` obligaba al músico a bajar por un formulario kilométrico. Partido, la colección Homepage muestra cuatro apartados independientes.

Esos archivos son fragmentos, no páginas. `hugo.toml` les aplica `build.render = never` con un cascade:

```toml
[[cascade]]
  [cascade.build]
    render = 'never'
    list = 'never'
  [cascade._target]
    path = '{/home,/home/**}'
```

Dos detalles que costaron una vuelta cada uno:

- El cascade va en `hugo.toml` y no en el front matter de cada archivo **a propósito**: el CMS borra al guardar cualquier clave que no esté declarada en su configuración, y se llevaría por delante el `build`.
- El target necesita `{/home,/home/**}`, no solo `/home/**`: con el segundo, las páginas hijas no se publican pero la **página de sección** `/home/` sí, con su listado y su RSS.

El layout las lee con `site.GetPage` y, si falta el archivo o está vacío, el bloque simplemente no se pinta.

### Patrón clave: el ritmo de bandas de la portada

Como cualquier bloque de la portada puede no renderizarse (conciertos ocultos, sin video, sin citas de prensa), **el tono de fondo no lo fija la sección sino su posición**. `index_profile.html` lleva un contador de las bandas que realmente se pintan y les asigna `home-band--base` (fondo de página) o `home-band--ink` (casi negro) de forma alternada:

```go-html-template
{{- $band = add $band 1 }}{{ $tone = cond (eq (mod $band 2) 1) "base" "ink" }}
<section class="home-band home-band--{{ $tone }} home-video" …>
```

El hero (foto a sangre) y el bloque de cierre (superficie de acento) quedan fuera del ciclo: ahí el color es identidad, no posición.

Cada banda expone sus propios tokens —`--band-fg`, `--band-muted`, `--band-accent`, `--band-hairline`, `--band-card`, `--band-card-shadow`— y las piezas de dentro (tarjetas de evento, marco del video, filetes de las citas) los leen. Por eso **no** hay reglas `:root[data-theme="light"] .home-event-card` y similares: el contraste lo decide la banda, no el tema.

Las bandas van pegadas, sin márgenes entre ellas. Un margen entre dos bandas del mismo tono dejaba ver el fondo de la página como una franja clara suelta en mitad de la portada —que es justo lo que pasaba al ocultar los conciertos—.

### Patrón clave: galerías como listas en el front matter

Las galerías **no** son carpetas de páginas: son arrays dentro del front matter del `_index` de cada sección (`gallery_items`, `gallery_videos`, `gallery_audios`). Esto permite reordenarlas por drag & drop desde el CMS y ocultar elementos sin borrarlos.

Dos flags recurrentes:

- `enabled` (por ítem): si es `false`, el elemento no se renderiza pero se conserva.
- `show_page` (por sección): controla si la sección aparece en el menú principal, en el pie, en su propia página y en los bloques de portada que dependen de ella, **sin borrar el contenido**.

La regla vive en un único sitio, `layouts/partials/section-visible.html`, para que el menú y la página no puedan contradecirse:

1. Si la página de sección define `show_page`, manda ese valor.
2. Si no lo define, las secciones **opt-in** quedan ocultas y el resto visibles.

Hoy la única sección opt-in es `concerts`: **la agenda viene oculta por defecto** y solo aparece cuando el músico la activa con fechas confirmadas. Una agenda vacía o de relleno en la web de un músico es peor que no tener sección. Para hacer opt-in otra sección, añádela a `$optIn` en el partial y expón su flag en el CMS.

> Ojo con `default` en Hugo: `{{ false | default true }}` devuelve `false` (los booleanos están exentos de la regla de "valor vacío"), pero el partial usa `isset` para no depender de esa sutileza.

### Conciertos

Única colección de tipo carpeta. El layout divide automáticamente la agenda comparando `date` con `now`:

- `futureEvents` → sección "Próximos conciertos" (orden ascendente)
- `pastEvents` → sección "Conciertos pasados" (orden descendente)

La home muestra los **3 próximos** eventos. Slug automático: `{{year}}-{{month}}-{{day}}-{{slug}}`.

### Ajustes globales

`data/site_settings.yml` guarda el email de destino del formulario de booking y las URLs de redes sociales. Se consume desde `hugo.Data.site_settings` en `contact/single.html` y desde `site.Data.site_settings` en el footer.

---

## CMS (Sveltia)

`static/admin/index.html` carga el CMS desde CDN:

```html
<script src="https://unpkg.com/@sveltia/cms/dist/sveltia-cms.js"></script>
```

`static/admin/config.yml` (≈380 líneas) define:

- **Backend:** `github`, repo `profi-web-de/carlos-johnson`, branch `main`.
- **Media:** se sube a `assets/images` (así pasa por el pipeline de imágenes) y se referencia como `/images/...`.
- **i18n:** `multiple_files`, locales `[de, es, en]`, default `de`, omitiendo el locale por defecto del nombre de archivo.
- Cada campo declara su comportamiento multilingüe: `i18n: true` (traducible) o `i18n: duplicate` (valor compartido entre idiomas, típico de imágenes, fechas, IDs de YouTube y URLs).

### Colecciones

| Colección | Qué edita |
|---|---|
| **Site Settings** | Email de booking + Facebook / Instagram / YouTube |
| **Homepage** | Hero (eyebrow, título, subtítulo máx. 500 caracteres, carrusel con mín. 3 slides, 3 "profile briefs" con enlace opcional a su sección, segundos de autoplay 3–5), video destacado, citas de prensa y bloque de cierre |
| **Pages** | Biografía, Violinista y Director (las tres con retrato de cabecera opcional) y Docencia (cátedra en Alemania, cátedra en Perú, masterclasses y recursos para alumnos) |
| **Multimedia / Resources** | Galerías de imágenes, videos y audios |
| **Concert Schedule – List Page** | Interruptor `Show Concert Schedule` (apagado por defecto) y textos de la página de agenda |
| **Concert Schedule / Events** | Alta y edición de conciertos (`create: true`) |

### Autenticación

El CMS corre entero en el navegador, así que para escribir en el repo necesita un token de GitHub, y para obtenerlo hace falta canjear un código con el *client secret* de una aplicación OAuth. Ese secreto no puede vivir en el navegador: hace falta una pieza mínima de servidor.

**Cómo está resuelto:** un único Cloudflare Worker para todos los sitios de profi-web, con una aplicación OAuth propia en la organización `profi-web-de` de GitHub. El sitio lo declara en `static/admin/config.yml`:

```yaml
base_url: https://cms-auth.profi-web.workers.dev
```

Sin esa línea, Sveltia cae por defecto en `https://api.netlify.com/auth`, el relay OAuth **compartido** de Netlify, usando su aplicación y no la nuestra: un servicio ajeno que puede cerrarse sin aviso y llevarse por delante el acceso de todos los clientes a la vez. El worker y sus instrucciones viven en su propio repo, `profi-web-de/cms-auth`.

Cómo comprobar por cuál de los dos está entrando un sitio: abre `/admin`, pulsa "Entrar con GitHub" y mira a dónde va la ventana emergente. Si va a `github.com`, está usando el worker; si va a `api.netlify.com`, sigue en el relay compartido.

> La versión de Sveltia está **fijada** en `static/admin/index.html`. Sin fijarla, el panel carga `latest` en cada visita y una versión incompatible lo rompería sin que nadie haya tocado el repo.

### Alta de un músico nuevo

1. Crear el repo en la organización `profi-web`, a partir de esta plantilla.
2. Añadir al músico como colaborador **solo de su repo**.
3. Añadir su dominio a `ALLOWED_DOMAINS` en el repo `cms-auth` y redesplegar el worker.
4. Ajustar en su `config.yml`: `backend.repo` y `base_url`.
5. Ajustar en su `hugo.toml`: `baseURL`, idiomas, menús, `copyright_name`, ID de GA4.
6. Registrar el dominio **a nombre del músico**.
7. Entregar: acceso a `/admin`, el [manual de uso](user-manual.md) y el compromiso de transferir el repo a su cuenta cuando lo pida (GitHub lo hace en un clic y conserva el historial).

El repo vive en la organización y no en la cuenta del músico para que el alta sea simple; la propiedad real se garantiza con el dominio a su nombre y la cláusula de transferencia.

---

## Customizaciones sobre PaperMod

El tema está copiado dentro del repo y **todas las customizaciones viven ahí dentro** (~3.300 líneas propias). Esto implica que actualizar PaperMod desde upstream requiere un merge manual.

### Layouts propios

| Archivo | Función |
|---|---|
| `partials/index_profile.html` | Home completa: hero con carrusel, próximos 3 conciertos, video destacado |
| `partials/header.html` | Reescrito: submenús desplegables, overflow menu, selector de idioma, soporte de `show_page` en entradas de primer nivel y de submenú |
| `partials/footer.html` | Menú de pie con `<details>`, iconos sociales SVG inline, créditos (**el que manda es el de `layouts/` en la raíz**) |
| `partials/google_analytics.html` | Carga GA4 solo en producción y solo con consentimiento |
| `partials/analytics_footer.html` | Banner de consentimiento y tracking de eventos |
| `images/list.html` | Galería con lightbox |
| `videos/list.html` · `videos/single.html` | Listado de videos y página de detalle |
| `audios/list.html` | Biblioteca de audios (YouTube o URL directa) |
| `concerts/list.html` · `concerts/single.html` | Agenda dividida en próximos/pasados y ficha de concierto |
| `teaching/list.html` | Página de docencia con cátedras, masterclasses y recursos |
| `contact/single.html` | Formulario de contacto/booking |

### Assets propios

- **CSS por sección**, inyectado inline con `resources.Get | minify` dentro de cada layout: `homepage.css` (580 líneas), `images.css`, `videos.css`, `audios.css`, `concerts.css`, `teaching.css`, `contact.css`.
- **CSS extendido** (se concatena automáticamente al bundle de PaperMod): `extended/navigation.css`, `extended/analytics-consent.css`, `extended/blank.css`, y a nivel de proyecto `assets/css/extended/footer-menu.css` (sticky footer).
- **JS:** `homepage-carousel.js` (carrusel del hero) e `images-gallery.js` (lightbox).

### Traducciones

Las claves propias se añadieron a `themes/PaperMod/i18n/de.yaml`, `es.yaml` y `en.yaml`, los tres con las mismas 75 claves. El directorio `i18n/` de la raíz está vacío. Familias de claves: `contact_form_*`, `teaching_*`, `analytics_consent_*`, `gallery_*`, `videos_*`, `audios_*`, `menu_*`, `footer_*`, `upcoming_events`, `past_events`, `more_info`, `view_all_events`, `featured_video`, `developed_by`, `privacy_page_link`.

**Ningún layout contiene texto en un idioma concreto**: todo pasa por `i18n`, incluidos los `aria-label`, los estados vacíos de las galerías y el pie. Añadir un idioma nuevo a un sitio es crear su `.yaml` y declararlo en `hugo.toml`; no hay que tocar plantillas. El inglés está traducido aunque este sitio no lo use, como base para los próximos.

---

## Diseño: tipografía y color

### Pareja tipográfica

**Playfair Display** (serif de display) en titulares e **Inter** en el cuerpo. El contraste serif/sans es el lenguaje visual de salas de concierto y sellos clásicos; la sans del sistema que traía PaperMod dejaba el sitio con aspecto de plantilla sin marcar.

Las fuentes están **autoalojadas** en `assets/fonts` y se declaran en `layouts/partials/extend_head.html`, no se piden a Google. Cargarlas desde los servidores de Google transmite la IP del visitante a un tercero: exactamente lo que el banner de consentimiento intenta evitar, y lo que los tribunales alemanes han considerado problemático. Los archivos son los mismos `woff2` oficiales, obtenidos del paquete `@fontsource`.

Cada familia se sirve en los subconjuntos `latin` y `latin-ext` con su `unicode-range`, así que el segundo solo se descarga si la página usa algún glifo de ese rango. Las dos fuentes de primer uso van con `<link rel="preload">`.

### Color de acento

Un único acento, granate de telón, definido como token en `extended/typography.css`:

Hay **tres familias de tokens**, y la distinción importa:

| Token | Para qué | Claro | Oscuro |
|---|---|---|---|
| `--accent` / `--accent-strong` | Tinta: enlaces, filetes, subrayados | `#8a2b34` | `#d08a92` |
| `--accent-surface` / `--on-accent-surface` | Rellenos grandes y su texto | `#8a2b34` sobre `#fdf8f2` | `#5e1d24` sobre `#f7e7e9` |
| `--accent-on-dark` | Bloques negros en ambos temas (el hero) | `#d98f97` | `#d98f97` |

La razón de separarlos: en modo oscuro la **tinta** tiene que aclararse para leerse sobre negro, pero usar ese mismo rosa claro como **superficie** convierte el bloque de cierre en una plancha rosa pálida enorme. La superficie se oscurece donde la tinta se aclara. Y el hero es negro en los dos temas, así que su acento no debe seguir al tema en absoluto.

Se usa con cuentagotas: enlaces del contenido, subrayado del menú activo, numeración de las tarjetas del hero, filete de las citas y fondo del bloque de cierre. También alimenta el `theme_color` del navegador y el favicon.

### Dónde está cada cosa

| Archivo | Qué define |
|---|---|
| `extended/typography.css` | Familias, escala fluida, acento, citas, retrato de página |
| `layouts/partials/extend_head.html` | `@font-face` y `preload` con URLs resueltas por Hugo |
| `homepage.css` (bloque final) | Rediseño de portada: hero a sangre, prensa, cierre, ritmo de bandas |
| `extended/analytics-consent.css` | Barra inferior de consentimiento |

> Un detalle que cuesta depurar: `responsive-image.html` emite los atributos `width`/`height` del HTML, y esa altura es **definitiva**. Cualquier regla que recorte con `aspect-ratio` necesita también `height: auto`, o el `aspect-ratio` se ignora en silencio.

### Modo oscuro

`defaultTheme = 'auto'`: el sitio arranca con la preferencia del sistema del visitante, el interruptor de la cabecera la sobrescribe y la elección se guarda en `localStorage`.

Lo que hace que `auto` sea manejable es que **el script de PaperMod resuelve siempre a un `data-theme` concreto** (`light` o `dark`) antes de pintar, en las cuatro ramas: preferencia guardada, y si no la hay, `prefers-color-scheme`. Por eso todo el CSS del sitio puede seguir escribiéndose contra el atributo, que es una sola señal, en vez de duplicar cada regla en una media query.

La excepción es **sin JavaScript**: ahí el atributo se queda en `auto`, PaperMod aplica sus variables oscuras por `prefers-color-scheme` y cualquier token propio definido solo bajo `[data-theme="dark"]` se quedaría en su versión clara. Por eso los tokens de acento llevan también un bloque `@media (prefers-color-scheme: dark)` con `:root:not([data-theme="light"])`. Si añades tokens de color nuevos, duplícalos igual.

Al revisar un cambio de color conviene mirarlo en los dos temas: PaperMod define `--primary` como **casi negro en claro y gris claro en oscuro**, de modo que cualquier botón con `background: var(--primary)` necesita `color: var(--theme)` y no un blanco fijo como `--primary-light-text`; con blanco fijo el botón queda blanco sobre gris claro.

Escenarios verificados: sistema claro y sistema oscuro sin elección previa, elección explícita contraria al sistema en ambos sentidos, y los dos casos anteriores sin JavaScript.

---

## Pipeline de imágenes

El media vive en `assets/images` (no en `static/`), así que Hugo puede procesarlo en tiempo de build: redimensiona, convierte a **WebP** y genera `srcset` + `width`/`height` (esto último evita saltos de layout / CLS).

Dos partials en `layouts/partials/` encapsulan todo:

| Partial | Devuelve |
|---|---|
| `responsive-image.html` | Un `<img>` completo con `srcset`, `sizes`, dimensiones y `loading` |
| `image-url.html` | Solo la URL de una versión procesada (para lightbox, `data-*`, backgrounds) |

```go-html-template
{{ partial "responsive-image.html" (dict
    "src"   $item.image
    "alt"   $alt
    "class" "gallery-img"
    "sizes" "(max-width: 700px) 100vw, 33vw"
    "widths" (slice 400 600 900 1200)) }}

{{ $url := partial "image-url.html" (dict "src" $item.image "width" 1800) }}
```

Parámetros de `responsive-image.html`: `src` (obligatorio), `alt`, `class`, `id`, `sizes`, `widths`, `loading`, `fetchpriority`, `decoding`, `quality`.

Detalles de comportamiento:

- Solo genera anchos **menores** que el original (nunca escala hacia arriba) y añade siempre el tamaño original como mayor entrada del `srcset`.
- **Degrada con elegancia:** si la imagen es remota (p. ej. la miniatura de YouTube de un video sin portada), no existe en `assets/` o no es procesable (SVG, GIF), emite un `<img>` simple con la URL original.
- La primera slide del hero se marca `loading="eager"` + `fetchpriority="high"`; el resto va en `lazy`.
- Las imágenes escritas en markdown también pasan por el pipeline gracias al render hook `_default/_markup/render-image.html`.

Efecto típico: `cj-violin.jpg` pesa 589 KB; un móvil ahora descarga la variante de 600 px en WebP, de ~22 KB.

Consecuencia práctica: **no hace falta optimizar a mano** antes de subir una imagen desde el CMS. Lo único que sigue importando es subirla con resolución suficiente y en la proporción correcta (ver [user-manual.md](user-manual.md)).

---

## Reutilizar la plantilla en otro sitio

> Para levantar el sitio de un artista nuevo de principio a fin, sigue [onboarding.md](onboarding.md). Esta sección es solo el mapa de qué es configuración y qué no.

Los layouts no contienen datos del cliente. Todo lo específico de un sitio vive en configuración:

| Dónde | Qué |
|---|---|
| `hugo.toml` | `baseURL`, `title` por idioma, idiomas y menús, ID de GA4, `copyright_name`, `[params.developer]` |
| `data/site_settings.yml` | Email de booking y redes sociales (editable desde el CMS) |
| `static/admin/config.yml` | `backend.repo` y `branch` del repositorio destino |
| `static/admin/index.html` | Título de la pestaña del panel (HTML estático, no pasa por Hugo) |
| `content/` + `assets/images/` | Textos e imágenes del músico |

Parámetros del pie:

```toml
[params]
  # Titular del copyright. Si se omite, se usa el title del sitio.
  copyright_name = 'Carlos Johnson'

  # Crédito del desarrollador. Borra el bloque entero para ocultarlo.
  [params.developer]
    name = 'Pablo Johnson'
    url = 'https://github.com/pablo-johnson'
```

Si se borra `[params.developer]`, el crédito desaparece junto con su separador, sin dejar restos en el pie.

---

## Formulario de contacto

`contact/single.html` construye el formulario contra **formsubmit.co** usando el email de `data/site_settings.yml`:

- Acción normal: `https://formsubmit.co/<email>` · Acción AJAX: `https://formsubmit.co/ajax/<email>`
- Envío por `fetch` con estados traducidos (enviando / éxito / error) y `aria-live`.
- Anti-spam: honeypot `_honey` oculto.
- Al enviar con éxito dispara el evento GA4 `contact_form_submit_success`.
- Si `booking_email` está vacío, muestra un aviso en lugar del formulario.

---

## Analítica y consentimiento

Configurado en `hugo.toml`:

```toml
[services]
  [services.googleAnalytics]
    id = 'G-XXXXXXXXXX'
```

Comportamiento:

- Sin `id`, GA4 no se carga y el banner no aparece.
- Solo se activa en producción (`HUGO_ENVIRONMENT=production`).
- `ad_storage` siempre desactivado; `analytics_storage` solo tras aceptar.
- No mide `/admin`.
- Eventos: `page_view`, `outbound_click`, `contact_form_submit_success`, más los `data-analytics-*` declarados en los layouts (`select_content`, `view_item_list`).
- El usuario puede reabrir sus preferencias con el shortcode pareado `{{< analytics-consent-manage >}}Texto del botón{{< /analytics-consent-manage >}}` (usado en `content/privacy.md` y `content/privacy.es.md`).

---

## Sincronización con Instagram

Instagram no tiene RSS y la Basic Display API murió el 4 de diciembre de 2024. La única vía es la **Instagram API with Instagram Login**, que exige cuenta Creator o Business y un token de 60 días.

El feed **no se consulta desde el navegador**. Un workflow programado lo trae al repositorio:

```
.github/workflows/instagram-sync.yml   cron diario + workflow_dispatch
scripts/sync_instagram.py              descarga y escribe los datos
data/instagram.json                    lo escribe la maquina, NO se edita a mano
assets/images/instagram/               las fotos, servidas desde /images/instagram/
content/instagram/_index.{lang}.md     lo editable: ajustes y excepciones
layouts/instagram/list.html            render
```

Tres decisiones que conviene no deshacer:

- **Las imágenes se descargan, no se enlazan.** Las URL que devuelve la API son de un CDN firmado y caducan a los pocos días: enlazadas en caliente, el feed se rompe solo. Descargadas, además pasan por `responsive-image.html` como el resto del sitio y no hay ninguna petición a un tercero en tiempo de carga.
- **El script nunca falla el build.** Sin token, con la API caída o con el token caducado, avisa y sale con código 0 sin tocar nada: la última instantánea buena sigue publicada.
- **Un fichero, un dueño.** `data/instagram.json` es de la máquina; el CMS solo edita `content/instagram/_index.*.md`. Mezclar los dos significa que la siguiente sincronización se come lo que escribió el músico —es la misma lección del front matter que el CMS borraba—.

### Secrets

| Secret | Obligatorio | Para qué |
|---|---|---|
| `IG_ACCESS_TOKEN` | sí | Token de larga duración de la cuenta |
| `IG_TOKEN_WRITER_PAT` | no | PAT con permiso de escritura sobre los secrets, para renovar el token solo |

Sin `IG_TOKEN_WRITER_PAT` el paso de renovación se salta y **hay que renovar el token a mano antes de los 60 días**. El refresco devuelve un token nuevo pero el viejo sigue valido hasta caducar, así que refrescar sin guardar no sirve de nada.

### Por qué la sincronización invoca al despliegue

Un commit hecho con el `GITHUB_TOKEN` **no dispara otros workflows** —es la protección de bucles de GitHub—. Por eso `hugo.yml` expone `workflow_call` y `instagram-sync.yml` lo invoca cuando hubo cambios, en vez de confiar en el `push`.

### Puesta en marcha

1. La cuenta del músico pasa a Creator o Business (gratis y reversible).
2. App en el panel de Meta, producto *Instagram*, permiso `instagram_business_basic`.
3. Con el músico como tester basta para un sitio. **Para varios clientes hace falta App Review de Meta.**
4. Se obtiene el token de larga duración y se guarda como `IG_ACCESS_TOKEN`.
5. Se activa `Show Page in Submenu` en la entrada `Instagram Feed` del CMS.

Mientras no haya token, `data/instagram.json` lleva publicaciones de ejemplo y la sección viene **oculta**, igual que la agenda de conciertos.

## Desarrollo local

Requisitos: **Hugo extended** `0.159.x` y **Dart Sass**.

```bash
hugo server -D                 # servidor de desarrollo con drafts
hugo server --navigateToChanged
hugo --minify                  # build de producción en ./public
```

`public/` está en `.gitignore`: el sitio se compila en CI, nunca se commitea.

Para editar contenido en local con el CMS hace falta el modo local de Sveltia (servir `/admin` sobre el sitio local); en el flujo actual la edición se hace en producción contra el repo de GitHub.

---

## Despliegue

`.github/workflows/hugo.yml`:

1. Se dispara en cada `push` a `main` (o manualmente con `workflow_dispatch`).
2. Instala Hugo extended `0.159.1` + Dart Sass.
3. `checkout` con `submodules: recursive` y `fetch-depth: 0`.
4. Build con `hugo --minify --baseURL "${{ steps.pages.outputs.base_url }}/"` y `HUGO_ENVIRONMENT=production`.
5. Publica `./public` en GitHub Pages.

Cada cambio guardado desde `/admin` es un commit en `main`, así que **publicar desde el CMS dispara automáticamente el deploy** (≈1–2 minutos).

El `baseURL` de `hugo.toml` apunta a la URL de project page, pero el workflow lo sobrescribe con el valor real de Pages. Para un dominio propio habría que añadir `static/CNAME` y configurar el DNS.

---

## Notas de mantenimiento

- **Actualizar PaperMod** implica merge manual: el tema está vendorizado y modificado in situ.
- **El detalle de video es client-side**: `videos/single.html` renderiza todos los videos ocultos y JavaScript muestra el seleccionado. No genera una URL propia por video.
- **Los menús se definen en `hugo.toml`**, no son editables desde el CMS. El cliente solo puede ocultar secciones vía `show_page`. Es config por sitio, no un hardcodeo de layout, pero sigue siendo un archivo que hay que tocar a mano en cada alta.
- **El footer del tema** (`themes/PaperMod/layouts/partials/footer.html`) es código muerto: el override de `layouts/` siempre gana. Conserva el crédito modificado de PaperMod.
- Al mover el media, `static/images/` quedó como carpeta vacía en el disco local: se puede borrar, git no la trackea.
