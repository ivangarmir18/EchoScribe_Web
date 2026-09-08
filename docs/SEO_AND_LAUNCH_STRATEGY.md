# GitHub Launch & Community Strategy Guide (Anti-Ban Playbook)
## *Estrategia Realista de Lanzamiento, Distribución en Comunidades y Posicionamiento SEO*

> **Filosofía del Desarrollador:** La comunidad técnica en Reddit y Hacker News premia la honestidad radical, el valor técnico real y la humildad de un creador independiente (*indie hacker*). Castiga fulminantemente el spam corporativo, las promesas infladas de marketing y el *open-washing*.

---

## 1. Las 3 Trampas Fatales que Debes Evitar

### Trampa 1: El Baneo Inmediato en `r/MachineLearning`
- **Por qué te banearían:** `r/MachineLearning` tiene una política estricta de admisión exclusiva para **papers científicos y avances teóricos en arquitecturas de ML**. Prohíben terminantemente aplicaciones de escritorio para el usuario final, wrappers comerciales de APIs o anuncios de productos.
- **La regla de oro:** **NUNCA** publiques EchoScribe en `r/MachineLearning`.

### Trampa 2: El "Open-Washing" (Lavado de Código Abierto)
- **Por qué te freirían a negativos:** Si titulas un post como *"Open-Source Speech-to-Text Alternative"* y un desarrollador entra al repo y ve que la app de escritorio completa es freemium/propietaria y en el repo solo está el script del particionador (`quickstart_demo.py`), te acusarán de fraude (*bait-and-switch*).
- **La solución honesta:** Explica con transparencia:
  > *"He liberado en código abierto el script con el algoritmo de particionado de subtítulos sin huérfanas y el limpiador de bucles (`quickstart_demo.py`). Para quienes quieran la herramienta completa lista para usar en Windows con WebView2, he compilado un instalador en Releases."*

### Trampa 3: La Ilusión del "Top 3 en Google en 48 Horas"
- **La realidad del SEO:** GitHub tiene una gran autoridad de dominio (`DA ~96`), lo que facilita que Google **rastree e indexe** el repositorio en pocos días. Sin embargo, posicionarse en los primeros resultados para términos competitivos (*"Whisper Windows"*, *"Fast Whisper Ingestion"*) requiere **semanas o meses** de retención, enlaces entrantes (*backlinks*) y actividad continuada. No te frustres si no apareces en la primera página el martes; el SEO es una carrera de fondo.

---

## 2. Dónde SÍ Publicar (Comunidades Receptivas)

| Comunidad | Audiencia Objetivo | Enfoque Adecuado |
| :--- | :--- | :--- |
| **`r/SideProject`** | Desarrolladores y creadores independientes | Historia honesta de cómo construiste la app para resolver un problema propio |
| **`r/windowsapps` / `r/software`** | Usuarios de Windows en busca de utilidades | Rendimiento nativo con WebView2, bajo consumo de RAM (<180MB) y descarga limpia |
| **`r/editors` / `r/premiere` / `r/videography`** | Editores de vídeo y creadores de contenido | Enfoque puramente audiovisual: cómo solucionar los subtítulos partidos y las palabras huérfanas |
| **`r/Python`** | Desarrolladores de Python | Explicación del algoritmo de ventana elástica en `quickstart_demo.py` y debate técnico |
| **LinkedIn / X (Twitter)** | Profesores, reclutadores y red profesional | Enfoque técnico de arquitectura, proyecto de máster y benchmarks de rendimiento |

---

## 3. Plantillas de Copys Honestos y de Alta Conversión

### 3.1. Para `r/SideProject` (Tono: Creador Independiente)

**Título:**
> *I got tired of Whisper creating broken 1-word subtitle lines and infinite hallucination loops, so I spent the last few months building EchoScribe for Windows.*

**Cuerpo:**
```text
Hey everyone!

I love OpenAI's Whisper, but whenever I tried using it for real video editing or lectures, two things drove me crazy:
1. When there's background music or silence, it gets stuck in infinite repetition loops ("Thank you for watching... Thank you for watching...").
2. Default subtitle splits break text at arbitrary character limits, leaving isolated 1-word orphan lines ("to", "the") that look terrible on video.

To solve this for myself, I built EchoScribe:
- I wrote an elastic semantic windowing algorithm in Python that merges short fragments and respects reading speed (CPL/CPS rules) so you never get orphan lines.
- Designed dedicated profiles for TikTok/Reels (short vertical lines) vs YouTube/Cinema.
- Wrapped it in a native Windows WebView2 interface (<180MB RAM, no heavy Electron).
- Added an ephemeral GPU cloud worker on Modal (NVIDIA L4) that can transcribe 1h of audio in ~25 seconds, with automatic fallback to local CPU if offline.

I open-sourced the core subtitle splitting and loop-breaking algorithm in the repo (quickstart_demo.py) so anyone can use it in their own scripts:
GitHub: https://github.com/ivangarmir18/EchoScribe

The compiled Windows installer (.exe) with verified clean VirusTotal report is available on the website:
https://www.echoscribe.es
(VirusTotal report: https://www.virustotal.com/gui/file/ec0517c1cc365f2dfb43d8715e7aaaa3b8cf6583c63ef8b121f6107fc163f55d/detection)

I'd love any feedback on the subtitle pacing or edge cases where Whisper still hallucinates!
```

---

### 3.2. Para `r/videography`, `r/premiere` o `r/editors` (Tono: Audiovisual)

**Título:**
> *Tired of fixing auto-generated subtitles with single orphan words? I made a Windows tool with dedicated TikTok vs YouTube subtitle profiles.*

**Cuerpo:**
```text
Hi everyone,

If you edit video, you've probably noticed that most AI caption tools slice text by raw character counts, often breaking a line right after "of" or leaving a single word on screen for 0.4 seconds.

I built a lightweight Windows tool called EchoScribe specifically to tackle subtitle ergonomics:
- TikTok/Reels Profile: Dynamic 2-line chunks (15-26 chars) optimized for fast-paced vertical retention.
- YouTube Profile: Natural sentence pacing (27-40 chars).
- Cinema Profile: Broad readability matching standard broadcast rules.
- Interactive Trimmer: Select just the audio snippet you need instead of rendering the whole file.
- Direct Downloader: Extracts high-bitrate MP3 or MP4 directly from YouTube/Twitch links.

The Windows installer is free to try, fully verified on VirusTotal (0/70 detections, hash ec0517c1...), and available here:
https://www.echoscribe.es
(VirusTotal report: https://www.virustotal.com/gui/file/ec0517c1cc365f2dfb43d8715e7aaaa3b8cf6583c63ef8b121f6107fc163f55d/detection)

Hope this saves some of you the headache of manually recombining subtitle blocks in Premiere/DaVinci!
```

---

### 3.3. Para `r/Python` (Tono: Discusión de Algoritmos)

**Título:**
> *Solving Whisper's orphan subtitle problem and hallucination loops with an elastic windowing algorithm in Python [Code included]*

**Cuerpo:**
```text
Hi Python devs,

Whisper's word-level timestamps are great, but converting raw token timestamps into readable SubRip (.srt) cues usually relies on naive greedy chunking. If you hit a 40-char limit right before the last word of a clause, you get an awkward 1-word cue.

I implemented a proportional elastic windowing algorithm:
1. It partitions tokens into soft character and word windows.
2. If a trailing cue contains fewer than 3 words (orphan line), it evaluates a backward merge candidate.
3. If the combined cue fits within an elasticity margin (+20-30% of max_chars), it merges them, preserving semantic flow.
4. Word timestamps are interpolated proportionally to character length.

I also added a multi-pass regex filter to strip cyclical n-gram attractors caused by non-vocal audio.

The standalone script has zero external dependencies (pure Python standard library) and can be tested directly:
https://github.com/ivangarmir18/EchoScribe/blob/main/quickstart_demo.py

Feedback on the dynamic programming merge logic or alternative heuristic approaches is welcome!
```

---

### 3.4. Para LinkedIn (Tono: Profesional, Académico y Portafolio)

```text
Presento EchoScribe: Ingeniería de Voz a Texto de Alto Rendimiento con Whisper, GPUs Serverless y Modelos de Lenguaje Contextuales.

En el desarrollo de aplicaciones basadas en ASR (Automatic Speech Recognition), existen dos retos que los modelos acústicos en bruto no resuelven por sí solos:
1. Los bucles de alucinación periódica en tramos de silencio o ruido ambiente denso.
2. La falta de ergonomía en la partición de subtítulos, que rompe unidades sintácticas y genera palabras huérfanas.

Para abordar esto como proyecto de ingeniería y trabajo de investigación de máster, he desarrollado EchoScribe:
[+] Inferencia híbrida: Modo Local 100% privado en CPU/GPU y Modo Turbo Nube en GPUs NVIDIA L4 (24GB VRAM) a 140x RTF (~25 s por hora de audio) con fallback automático a CPU local.
[+] Cortafuegos de 4 etapas contra bucles de repetición.
[+] Particionado semántico elástico conforme a normas de subtitulado BBC/Netflix (perfiles específicos para TikTok, YouTube y Cine).
[+] Cascada de traducción con DeepSeek Neural y corrección contextual con Google Gemini (3.5 Flash Lite, 3.6 Flash y 3.8 Flash) con bloqueo absoluto de códigos de tiempo.

He publicado el repositorio técnico con la memoria académica para máster, benchmarks y el script algorítmico en abierto:
-> Repositorio GitHub: https://github.com/ivangarmir18/EchoScribe
-> Web oficial e instalador para Windows: https://www.echoscribe.es

#InteligenciaArtificial #MachineLearning #Python #Whisper #NLP #DesarrolloSoftware #OpenSource #DeepLearning
```

---

## 4. Guía Paso a Paso de Comandos Git y GitHub

Sigue estos pasos exactos desde la consola para subir la carpeta a tu GitHub:

### Paso 1: Configurar el Repositorio en GitHub Web
1. Entra en [github.com/new](https://github.com/new).
2. **Repository name:** `EchoScribe` (o `EchoScribe-Desktop`).
3. **Description:**
   ```text
   EchoScribe: Windows Desktop Tool for Fast Whisper Ingestion & Smart SRT Formatting. NVIDIA L4 Serverless GPU (140x RTF), Anti-Hallucination Guardrails & Contextual LLM.
   ```
4. Marca como **Public**.
5. **NO** marques "Add a README file", "Add .gitignore" ni "Choose a license" (ya están creados en tu carpeta local).
6. Haz clic en **Create repository**.

### Paso 2: Ejecutar los Comandos en tu Terminal Local
Abre PowerShell y navega hasta la carpeta del repositorio:

```powershell
# 1. Entrar en la carpeta del repositorio
cd EchoScribe
# (o la ruta donde tengas ubicada la carpeta del proyecto)

# 2. Inicializar git si no estaba inicializado
git init

# 3. Añadir todos los archivos
git add .

# 4. Crear el commit inicial
git commit -m "feat: initial public showcase with architecture whitepaper, benchmarks, and demo"

# 5. Asegurar la rama principal como 'main'
git branch -M main

# 6. Vincular con tu repositorio remoto de GitHub (sustituye con tu URL si es diferente)
git remote add origin https://github.com/ivangarmir18/EchoScribe.git

# 7. Subir a GitHub
git push -u origin main
```

*(Si el repositorio remoto ya contenía commits previos, puedes forzar la sincronización con `git push -u origin main --force` o hacer un rebase).*

### Paso 3: Configurar las 20 Etiquetas (Topics) en GitHub
En la página principal de tu repositorio en GitHub, pulsa en el engranaje de configuración junto a **About** (arriba a la derecha) e introduce:
- **Website:** `https://www.echoscribe.es`
- **Topics:**
   ```text
   whisper, speech-to-text, srt, subtitles, faster-whisper, windows-desktop,
   transcription, audio-to-text, modal-gpu, gemini, ai-subtitles, youtube-transcriber,
   subtitles-generator, nlp, python3, webview2, vtt, deepseek, audio-processing,
   turboscribe-alternative
   ```

---

## 5. Medición de Resultados y Seguimiento

1. **Google Search Console:** Entra en tu panel de Google Search Console para `echoscribe.es`. Con la herramienta de Inspección de URLs, solicita la indexación de las guías enlazadas en el README.
2. **Tráfico de Referencia:** En Google Analytics, monitoriza el tráfico procedente de `github.com` y `reddit.com`.
3. **Estrellas y Forks en GitHub:** Monitoriza la retención y clones desde la pestaña **Insights > Traffic** del repositorio.
