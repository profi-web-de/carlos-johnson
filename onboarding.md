# Dar de alta a un artista nuevo

Guía de principio a fin para levantar el sitio de un músico a partir de esta plantilla. El sitio de referencia es `profi-web-de/carlos-johnson`.

Tiempo aproximado: **media jornada** si el material del artista está completo. Casi todo el tiempo se va en el contenido, no en la infraestructura.

A lo largo de la guía, sustituye:

| Marcador | Ejemplo |
|---|---|
| `<artista>` | `andres-gitarre` |
| `<Nombre Artista>` | `Andrés Gitarre` |
| `<dominio>` | `andresgitarre.com` |

---

## Antes de empezar: qué pedirle al artista

No arranques sin esto. Levantar el sitio con material a medias significa rehacer el contenido tres veces.

**Imprescindible**

- [ ] Biografía, en un solo idioma. Ya la traduciremos.
- [ ] **Fotos en alta resolución**, mínimo 1600 px en el lado largo. Un retrato apaisado para las cabeceras, una foto fuerte para el hero de la portada y entre seis y diez para la galería.
- [ ] **Quién es el titular de los derechos de cada foto.** Preguntarlo después es peor.
- [ ] Un email de contacto para booking. Puede ser distinto del personal.
- [ ] Enlaces a sus redes y a su canal de vídeo.

**Deseable**

- [ ] Citas de prensa con medio y fecha. Son la prueba social más valiosa de la portada.
- [ ] Un vídeo destacado en YouTube.
- [ ] Agenda de conciertos confirmada. Si no la hay, la sección se queda oculta.
- [ ] Logotipo o un color que ya use en su material.

**Decisiones que hay que cerrar con él**

- [ ] **Idiomas.** La plantilla trae alemán, español e inglés. ¿Los tres? ¿Cuál manda en la raíz del dominio?
- [ ] **Secciones.** Carlos tiene Biografía, Violinista, Director, Docencia, Conciertos, Multimedia y Contacto. Un guitarrista que no dirige ni enseña necesita menos.
- [ ] **Dominio.** ¿Lo compra él? Debe estar **a su nombre**, no al tuyo.
- [ ] **Quién publica.** Si va a editar él, necesita cuenta de GitHub.

---

## Paso 1. Crear el repositorio

El repositorio va en la organización **`profi-web-de`**, no en tu cuenta personal. Así el día que el artista se lleve el sitio se transfiere sin tocar nada tuyo.

1. Abre `github.com/profi-web-de` → **New repository**.
2. Nombre: `<artista>`. En minúsculas y con guiones, igual que `carlos-johnson`.
3. Público. GitHub Pages en repositorios privados exige plan de pago.
4. Sin README, sin `.gitignore`, sin licencia: el contenido llega del clon.

Luego, en tu máquina:

```bash
git clone git@github.com:profi-web-de/carlos-johnson.git <artista>
cd <artista>
git remote set-url origin git@github.com:profi-web-de/<artista>.git
```

> **Se conserva el historial de Carlos a propósito.** Documenta por qué el código está como está, y esa información vale más que un árbol limpio. Si prefieres empezar de cero: `rm -rf .git && git init`.

Empuja tal cual antes de tocar nada, para tener un punto de retorno:

```bash
git push -u origin main
```

---

## Paso 2. Activar GitHub Pages

En el repo → **Settings** → **Pages** → **Source**: **GitHub Actions**. No "Deploy from a branch".

El workflow ya está en `.github/workflows/hugo.yml` y `actions/configure-pages` inyecta la `baseURL` correcta en cada build, así que no hay que tocarlo.

---

## Paso 3. Configuración del sitio

### `hugo.toml`

```toml
baseURL = 'https://profi-web-de.github.io/<artista>/'
defaultContentLanguage = 'de'
```

> ⚠️ **`defaultContentLanguage` tiene que ir antes de cualquier `[tabla]`.** Dentro de una, TOML la trata como clave de esa tabla y Hugo la ignora en silencio, cayendo a `'en'`. El síntoma aparece tarde y despista: el idioma por defecto publica menos páginas que los demás.

Después, por cada idioma: `title`, `languageCode`, `description` y el bloque de menú completo. Y en `[params]`:

```toml
[params]
  copyright_name = '<Nombre Artista>'
  [params.assets]
    theme_color = '#8a2b34'   # el acento del artista
  [params.developer]
    name = 'Pablo Johnson'
    url  = 'https://github.com/pablo-johnson'
```

Borra el bloque `[params.developer]` entero si el artista no quiere el crédito en el pie: desaparece junto con su separador.

### `data/site_settings.yml`

```yaml
booking_email: contacto@<dominio>
social_links:
  facebook: …
  instagram: …
  youtube: …
```

> **El email no es decorativo.** El formulario de contacto se construye contra `formsubmit.co/<ese email>`. Si te dejas el de Carlos, sus mensajes de booking te llegan a ti.

### `static/admin/config.yml`

```yaml
backend:
  name: github
  repo: profi-web-de/<artista>
  branch: main
  base_url: https://cms-auth.profi-web.workers.dev
```

`base_url` es el mismo Worker para todos los sitios; no se despliega uno por artista.

### `static/admin/index.html`

Cambia el `<title>`. Es HTML estático, no pasa por Hugo, así que ninguna variable lo alcanza.

---

## Paso 4. Autorizar el dominio en el Worker

En el repositorio `cms-auth`, añade el dominio a `ALLOWED_DOMAINS` en `wrangler.toml`:

```toml
ALLOWED_DOMAINS = "profi-web-de.github.io,*.github.io,<dominio>,*.<dominio>"
```

Y vuelve a desplegar:

```bash
npx wrangler deploy
```

Sin esto el panel `/admin` deja entrar al artista y falla al guardar, que es el fallo más confuso de todos.

---

## Paso 5. Vaciar el contenido de Carlos

**Textos.** Cada archivo existe por triplicado (`.md` alemán, `.es.md`, `.en.md`):

| Archivo | Qué es |
|---|---|
| `content/_index.*` | Hero de la portada y las tres tarjetas |
| `content/home/video.*` | Vídeo destacado |
| `content/home/press.*` | Citas de prensa |
| `content/home/cta.*` | Bloque de cierre |
| `content/about.*` | Biografía |
| `content/violin.*`, `content/conducting.*` | Facetas. Renómbralas o bórralas según el instrumento |
| `content/teaching/_index.*` | Docencia |
| `content/images/_index.*`, `videos/`, `audios/` | Galerías |
| `content/instagram/_index.*` | Feed de Instagram |
| `content/concerts/` | **Borra los conciertos de demostración**, son inventados |
| `content/contact.*`, `content/privacy.*` | Contacto y privacidad |

> La privacidad **no es copiar y pegar**: menciona la analítica, el formulario y el alojamiento concretos de ese sitio. Si cambia alguno, cambia el texto.

**Imágenes.** Vacía `assets/images/` y mete las del artista. Toda imagen que se referencia como `/images/x.jpg` se lee de `assets/images/x.jpg` y pasa por el pipeline (WebP + srcset).

> ⚠️ **Nada de imágenes en `static/`.** Ahí se sirven tal cual, sin redimensionar ni convertir: una foto de 4 MB llega entera al móvil del visitante. En `static/` solo van `favicon.svg` y `og-default.jpg`.

**Marca.** Sustituye `static/favicon.svg` y `static/og-default.jpg` (1200×630).

**Feed de Instagram.** Deja `data/instagram.json` con los datos de ejemplo y la sección oculta hasta que el artista tenga cuenta Creator y haya token. El detalle está en el README.

---

## Paso 6. Menús y secciones

Los menús se declaran **por idioma** en `hugo.toml`, y hay que tocar los tres. Para quitar una sección, borra sus entradas de menú y su carpeta en `content/`.

Para ocultar una sección **sin borrar el contenido**, usa `show_page: false` en su `_index`. Así viene la agenda de conciertos: oculta hasta que haya fechas reales.

Comprueba que los `weight` quedan en el orden que quieres, y que no hay dos secciones compartiendo número.

---

## Paso 7. Analítica

En `hugo.toml`:

```toml
[services]
  [services.googleAnalytics]
    id = 'G-XXXXXXXXXX'
```

Si el artista no quiere analítica, **borra el bloque entero**: la barra de consentimiento desaparece sola con él. No dejes el ID de Carlos, o sus visitas se mezclan con las de otro.

---

## Paso 8. Dominio propio

1. El artista compra el dominio **a su nombre**.
2. Repo → **Settings** → **Pages** → **Custom domain** → `<dominio>`. Esto crea el archivo `CNAME`.
3. En el registrador, apunta el DNS a GitHub Pages: registros `A` del ápice a las IP de GitHub y un `CNAME` de `www` a `profi-web-de.github.io`.
4. Espera a que GitHub valide el dominio y marca **Enforce HTTPS**.
5. Vuelve a `hugo.toml` y pon `baseURL = 'https://<dominio>/'`.

El certificado tarda un rato en emitirse. Que el sitio se vea roto los primeros minutos es normal.

---

## Paso 9. Dar acceso al artista

Para que `/admin` le funcione necesita **permiso de escritura** sobre el repositorio: el CMS commitea en su nombre.

1. Que se cree una cuenta de GitHub si no la tiene.
2. Repo → **Settings** → **Collaborators and teams** → añadirlo con rol **Write**.
3. Que acepte la invitación por correo. Sin aceptarla, el panel falla al guardar.
4. Pásale `user-manual.md` y enséñale a entrar una vez, en directo. Diez minutos ahorran meses de preguntas.

> ⚠️ **Tu clave SSH es de cuenta, no de repositorio.** Si la registras como *deploy key* en el repo, queda como solo lectura y el push falla con `Permission denied to deploy key`. Va en `github.com/settings/keys`.

---

## Paso 10. Revisión antes de entregar

Levanta el sitio en local con `hugo server` y recorre esta lista:

**Contenido**
- [ ] Ninguna página menciona a Carlos Johnson. `grep -ri "carlos" content/ data/ hugo.toml`
- [ ] Los tres idiomas tienen las mismas páginas. Un idioma con menos suele ser `defaultContentLanguage` mal puesto.
- [ ] No quedan conciertos de demostración.
- [ ] El email de booking es el del artista, y **envía un mensaje de prueba** por el formulario.

**Aspecto**
- [ ] Modo claro y **modo oscuro**. El tema está en `auto`: se hereda del sistema del visitante, así que hay que mirar los dos.
- [ ] A 400 px de ancho. Sin scroll horizontal.
- [ ] Las bandas de la portada alternan sin franjas sueltas.
- [ ] El pie muestra el nombre correcto en el copyright.

**Técnico**
- [ ] El build de Actions termina en verde.
- [ ] `/admin` carga, deja entrar y **guardar de verdad** un cambio pequeño.
- [ ] La imagen de OG aparece al pegar el enlace en WhatsApp o Telegram.
- [ ] Ninguna imagen llega sin pasar por el pipeline: en el HTML publicado todas deben traer `srcset`.

---

## Trampas conocidas

Cosas que ya nos costaron una tarde. Ninguna da un error claro.

**El CMS borra lo que no está declarado.** Al guardar, Sveltia reescribe el front matter con los campos de su configuración: cualquier clave que no esté declarada en `config.yml` desaparece. Por eso el `cascade` de los fragmentos de portada vive en `hugo.toml` y no en el front matter.

**`aspect-ratio` se ignora sin `height: auto`.** `responsive-image.html` emite los atributos `width`/`height` del HTML, y esa altura es definitiva. Cualquier recorte con `aspect-ratio` necesita también `height: auto`.

**Un commit hecho por Actions no dispara otros workflows.** Es la protección de bucles de GitHub. Por eso `instagram-sync.yml` invoca al despliegue con `workflow_call` en vez de confiar en el `push`.

**El primer `wrangler deploy` puede no enganchar la ruta.** Si el subdominio `workers.dev` no existía todavía, el Worker responde 404 en todas las rutas. Vuelve a desplegar; la pista es la línea `Deployed cms-auth triggers`.

**El nombre de la carpeta local no tiene por qué ser el del repo.** El de Carlos sigue llamándose `carlosjohnson.github.io` en disco mientras el repo es `profi-web-de/carlos-johnson`. No pasa nada, pero despista.

---

## Documentos relacionados

- `README.md` — arquitectura, modelo de contenido, decisiones de diseño.
- `user-manual.md` — el manual del artista. Se le entrega a él.
