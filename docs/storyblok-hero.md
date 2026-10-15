# Landing cinematográfica: configuración en Storyblok

La Story existente **Hero** (`/hero`) utiliza `default-page` como tipo de contenido. Su campo `body` ya contiene un bloque `hero-section`. Conservá estos bloques y sus campos actuales; no crees otra Story ni otra integración React.

## 1. Ampliar `hero-section`

En **Block Library**, abrí el componente existente `hero-section` (Nestable Block) y agregá los campos con estos nombres técnicos exactos:

| Campo | Tipo | Uso |
| --- | --- | --- |
| `intro_video` | Asset | Video ambiental en loop; MP4. |
| `scroll_video` | Asset | Video sincronizado con scroll; MP4. |
| `intro_title` | Text | Título de bienvenida. |
| `intro_subtitle` | Textarea | Subtítulo de bienvenida. |
| `scroll_hint` | Text | Indicación para comenzar el recorrido. |
| `poster_image` | Asset | Fotograma del video ambiental. |
| `cta_text` | Text | Texto de la llamada a la acción final. |
| `cta_link` | Link | Enlace real de la llamada a la acción. |
| `scenes` | Blocks | Permitir únicamente el bloque `scene-item`. |

Campos opcionales recomendados:

| Campo | Tipo | Uso |
| --- | --- | --- |
| `scroll_poster_image` | Asset | Primer fotograma del MP4 de recorrido, especialmente si se cambia por un video distinto. |
| `object_position_desktop` | Text | Encuadre común a video y póster, por ejemplo `50% 50%`. |
| `object_position_mobile` | Text | Encuadre en móvil, por ejemplo `40% 50%`. |

Los porcentajes de encuadre admitidos van de 0 a 100 en los dos ejes. Ante un valor inválido se usa un encuadre seguro. Si los campos Asset están vacíos, el frontend usa los videos y pósters locales de `public/videos/`. Al asignar un Asset válido, ese archivo del CMS tiene prioridad. Para evitar diferencias durante la carga, asigná el póster que corresponde a **cada** video seleccionado.

## 2. Crear `scene-item`

En **Block Library**, creá `scene-item` como **Nestable Block** (no como Content Type), con estos campos:

| Campo | Tipo | Opciones |
| --- | --- | --- |
| `headline` | Text | Requerido para mostrar la escena. |
| `subheadline` | Textarea | Opcional. En la segunda escena se puede revelar palabra por palabra. |
| `start_progress` | Number | Porcentaje entre 0 y 100. |
| `end_progress` | Number | Porcentaje entre 0 y 100, mayor que el inicio. |
| `text_position` | Single Option | Valores técnicos `left`, `center`, `right`. |
| `text_theme` | Single Option | Valores técnicos `light`, `dark`. |

Volvé al campo `scenes` del componente `hero-section` y restringí sus bloques permitidos a `scene-item`. Los tramos no deben superponerse. El frontend los ordena por inicio y, si detecta un intervalo inválido o solapado, muestra las escenas locales predeterminadas. Los huecos son válidos si se quiere un momento sin texto.

## 3. Completar la Story Hero

Abrí la Story **Hero** y editá su `hero-section` en `body`:

- `intro_title`: **Bienvenido a este viaje**
- `intro_subtitle`: **Una experiencia que comienza con una nueva perspectiva.**
- `scroll_hint`: **Deslizá para explorar**
- `scenes`: tres elementos `scene-item`, con estos intervalos iniciales:

| Título | Subtítulo | Inicio | Fin |
| --- | --- | ---: | ---: |
| Descubrí otra perspectiva | — | 5 | 30 |
| Cada detalle cuenta | Una experiencia diseñada para descubrir algo diferente. | 30 | 65 |
| Tu viaje comienza acá | — | 65 | 100 |

La bienvenida se configura con los campos `intro_*`; **no** agregues una cuarta escena para ella. Ajustá los porcentajes tras revisar los fotogramas reales. Elegí `light` y `left` inicialmente, y cambialos donde la imagen lo requiera. La CTA aparece solamente cuando `cta_text` y `cta_link` tengan valores válidos; no se genera un enlace ficticio.

## 4. Continuación editorial en el mismo `hero-section`

La Story muestra una continuación editorial debajo del video **dentro del mismo bloque `hero-section`**. No crees otro bloque ni agregues nada más a `body`. Tiene fondo negro liso, fotografías encuadradas como elementos de la página (nunca como fondo) y títulos que se iluminan palabra por palabra al avanzar o retroceder el scroll. Con movimiento reducido o sin JavaScript, los textos permanecen legibles y las imágenes se muestran sin animación. Si querés editar esta parte desde Storyblok, agregá los siguientes campos opcionales al `hero-section` existente en **Block Library**:

| Campo | Tipo | Uso |
| --- | --- | --- |
| `opening_title` | Text | Título editorial que se ilumina al desplazarse; por defecto «Una nueva perspectiva desde el interior». |
| `opening_image` | Asset | Imagen encuadrada junto al título, extraída del final del recorrido. |
| `detail_title` | Text | Título de la sección editorial. |
| `detail_text` | Textarea | Texto que acompaña el interior del avión. |
| `detail_image` | Asset | Imagen de la sección editorial. |
| `closing_title` | Text | Título de cierre. |
| `closing_text` | Textarea | Texto de cierre. |
| `closing_image` | Asset | Imagen encuadrada del cierre. |

No hay campos de CTA adicionales: `cta_text` y `cta_link` del propio `hero-section` se usan tanto al final del video como en el cierre de la continuación. Si no están completos, no aparece una CTA ficticia. Si dejás vacíos los campos editoriales de la continuación, se mantienen los fotogramas y textos de respaldo sin crear bloques adicionales.

Las imágenes de respaldo son `public/images/flight-last-frame.webp` y `public/images/flight-cabin-detail.webp`, extraídas de `toma-scroll-web.mp4`, más el póster del video ambiental. No se generó contenido audiovisual nuevo. Si elegís otras imágenes en Storyblok, usá fotogramas o fotografías que correspondan al viaje. Cargá texto alternativo descriptivo para `opening_image`, `detail_image` y `closing_image` en los Assets de Storyblok; si falta, una imagen personalizada se tratará como decorativa. Los videos y el control del recorrido no dependen de estas imágenes editoriales.

## Videos y vista previa

Los archivos de referencia para subir a Storyblok son `public/videos/toma-hero-web.mp4`, `public/videos/toma-scroll-web.mp4`, `public/videos/toma-hero-poster.webp` y `public/videos/toma-scroll-poster.webp`. Las copias de los originales están separadas en `media/originals/` y **no se publican** con la web; los archivos entregados en `C:\Users\emams\Downloads` permanecen intactos.

Configurá el entorno del **Visual Editor** en `https://localhost:4321/` y, si corresponde, el **Real path** de la Story en `/hero`. Aceptá el certificado local cuando el navegador lo solicite. El puente de `@storyblok/astro` conserva la selección de bloques y actualiza la página **al guardar**; esta integración no habilita la vista previa instantánea de cada tecla. Los `scene-item` anidados conservan sus atributos para selección editorial. No se necesita `@storyblok/react` ni un token privado en el navegador.

El servidor local consulta la versión `draft`; el build desplegado consulta `published`. **Publicá la Story Hero antes del despliegue**, y usá en producción un token de entrega adecuado para contenido publicado. Hasta entonces, `/hero` puede devolver 404 en producción, aunque funcione en desarrollo.

## Desplegar en Netlify

1. **Publicá la Story Hero en Storyblok**. Podés hacerlo antes de crear los campos de las secciones: la web ya trae contenido e imágenes locales de respaldo. La versión `published` de `/hero` todavía devuelve 404 mientras no la publiques.
2. Subí el proyecto a un repositorio Git y conectalo a Netlify. `netlify.toml` configura `npm run build`, `dist` y Node 22; Netlify activa el adaptador Astro SSR automáticamente. **No uses el desplegado manual de solo `dist`**, porque dejaría fuera la función SSR.
3. En **Site configuration → Environment variables**, agregá `STORYBLOK_DELIVERY_API_TOKEN` con un token de entrega para contenido publicado. Agregá `STORYBLOK_REGION` si el Space no está en la región `eu`; `STORYBLOK_API_BASE_URL` solo si utilizás un endpoint personalizado. No subas `.env` al repositorio.
4. Tras el deploy, comprobá que `/` redirige a `/hero`, que `/hero` carga y que reproducen ambos videos. La Story `Home` del blueprint contiene bloques no implementados; la ruta principal ya no intenta renderizarla. Si querés mostrar `Home` más adelante, habrá que implementar esos bloques.

Esta landing es SSR: al **publicar** cambios de contenido en Storyblok, las siguientes solicitudes consultan la versión publicada sin requerir otro despliegue. La CDN de Storyblok o las cachés del navegador pueden retrasar la actualización brevemente. Los borradores no se muestran en producción. Cambios de código o de archivos locales de `public/` sí requieren otro deploy.

## Ejecutar

```sh
npm install
npm run dev
```

Abrí `https://localhost:4321/hero`. Para comprobar el build de producción: `npm run build`. El proyecto usa SSR y la configuración de despliegue existente. Si la Story no responde, comprobá que el token de entrega del archivo `.env` siga siendo válido, sin compartirlo públicamente.
