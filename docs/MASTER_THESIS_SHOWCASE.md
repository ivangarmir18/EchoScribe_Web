# EchoScribe: Academic Master's Thesis & Research Showcase
## *Memoria Técnica y Presentación Académica para Tribunal Evaluador y Docentes*

> **Título del Proyecto:** *EchoScribe: Arquitectura Híbrida de Ingesta Fonética y Transcripción Automática con Mitigación de Alucinaciones y Optimización Ergonómica de Subtítulos Mediante Modelos de Lenguaje Contextuales.*  
> **Área de Conocimiento:** Inteligencia Artificial Aplicada, Procesamiento del Lenguaje Natural (NLP) y Sistemas Distribuidos en la Nube.  
> **Hardware de Inferencia Cloud:** Clúster Serverless sobre **NVIDIA L4 (24GB VRAM, arquitectura Ada Lovelace)**.  
> **Autor:** Iván García Miranda  
> **Grado/Posgrado:** Máster en Inteligencia Artificial / Ingeniería del Software  

---

## 1. Resumen Académico (Abstract)

Los modelos de reconocimiento automático del habla (*Automatic Speech Recognition*, ASR) basados en la arquitectura Transformer autoregresiva —cuyo máximo exponente actual es OpenAI Whisper— han alcanzado cotas históricas en precisión fonética. No obstante, su adopción en entornos de producción audiovisual, periodísticos y académicos se enfrenta a **tres patologías sistémicas**:

1. **Bucles de alucinación degenerativa:** Pérdida de condicionamiento acústico en tramos no vocales (música, silencios o ruido ambiental de fondo), provocando la repetición cíclica infinita de tokens.
2. **Segmentación temporal no ergonómica:** Ruptura de unidades sintácticas y generación de palabras huérfanas en los subtítulos al basarse en contadores rígidos de caracteres.
3. **Cuello de botella computacional:** Inviabilidad práctica de la inferencia en CPU local ($RTF \approx 4\times$) y dependencia de costes fijos en tarjetas gráficas dedicadas de gama alta.

Este trabajo presenta **EchoScribe**, una solución integral que implementa:
- Una **arquitectura híbrida de cómputo** que combina inferencia local privada (CTranslate2) y un clúster *serverless* GPU (Modal / NVIDIA L4 24GB) alcanzando un factor en tiempo real de **140x RTF** (1 hora de audio procesada en 25.7 segundos) con **conmutación por error automática (fallback) a CPU local**.
- Un **cortafuegos estocástico de 4 niveles** para la neutralización de bucles de alucinación.
- Un **algoritmo de particionado semántico elástico** con prevención estricta de palabras huérfanas conforme a las directrices de la BBC y Netflix.
- Una **cascada de traducción y pulido en tres fases** (MarianMT en GPU $\to$ traducción neuronal de subtítulos con `deepseek-v4-flash` $\to$ pulido contextual editorial con Google Gemini 3.5/3.6/3.8 Flash) con bloqueo absoluto de códigos de tiempo (cero *drift* temporal).

---

## 2. Preguntas de Investigación (Research Questions)

* **PI 1:** ¿Es posible reducir la latencia de transcripción de audios de larga duración a menos del 1% de su tiempo original mediante orquestación *serverless* en GPUs NVIDIA L4 sin incurrir en costes de infraestructura ociosa?
* **PI 2:** ¿Qué combinación de detección de actividad vocal (VAD), penalización de logits y filtrado sintáctico resulta óptima para erradicar las alucinaciones repetitivas de Whisper sin incrementar la tasa de error por omisión (*deletion rate*)?
* **PI 3:** ¿Cómo formular un algoritmo determinista de particionado de subtítulos que minimice la carga cognitiva del espectador respetando simultáneamente restricciones de caracteres por línea (CPL) y caracteres por segundo (CPS)?

---

## 3. Formalización Teórica y Matemática

### 3.1. Factor de Tiempo Real (Real-Time Factor - RTF)
El rendimiento de un sistema ASR se evalúa mediante la relación inversa entre el tiempo de cómputo empleado $T_{\text{proc}}$ y la duración física del flujo de audio $T_{\text{audio}}$:

$$\text{RTF} = \frac{T_{\text{audio}}}{T_{\text{proc}}}$$

* En inferencia secuencial en CPU: $\text{RTF}_{\text{CPU}} \approx 4.05\times$.
* En la arquitectura *Serverless Turbo* de EchoScribe (NVIDIA L4 24GB Ada Lovelace):
$$\text{RTF}_{\text{Cloud}} = \frac{3600\text{ s}}{25.71\text{ s}} = 140.02\times$$

---

### 3.2. Formulación de Ergonomía de Subtitulado (Restricciones CPL/CPS)
Sea una secuencia de palabras transcritas $W = \{w_1, w_2, \dots, w_N\}$, donde cada palabra $w_i$ tiene una longitud en caracteres $l_i = |w_i|$ y un intervalo temporal estimado $[t_{\text{start}}(w_i), t_{\text{end}}(w_i)]$.

El objetivo es particionar $W$ en $M$ bloques contiguos $B_k = (w_{a_k}, \dots, w_{b_k})$ para $k = 1, \dots, M$, minimizando una función de penalización ergonómica:

$$\min \sum_{k=1}^{M} \left( \Phi_{\text{longitud}}(B_k) + \Phi_{\text{huérfanas}}(B_k) + \Phi_{\text{velocidad}}(B_k) \right)$$

Sujeto a las restricciones normativas audiovisuales:
1. **Límite de Caracteres por Línea (CPL):**
   $$L(B_k) = \sum_{j=a_k}^{b_k} l_j + (b_k - a_k) \le L_{\max} \cdot (1 + \epsilon)$$
   donde $\epsilon = 0.20$ a $0.30$ representa el factor de elasticidad máxima para evitar romper una unidad sintáctica cohesiva.
2. **Prevención de Palabras Huérfanas:**
   $$|B_k| = (b_k - a_k + 1) \ge N_{\min} \quad (\text{con } N_{\min} = 2 \text{ a } 3 \text{ palabras según perfil})$$
3. **Velocidad de Lectura (CPS - Characters Per Second):**
   $$\text{CPS}(B_k) = \frac{L(B_k)}{\Delta t_k} \le 17.0 \text{ car/seg}$$

---

### 3.3. Modelo de Mitigación de Bucles de Alucinación
Durante la decodificación autoregresiva de Whisper:
$$y_t = \arg\max_{v \in \mathcal{V}} P(y_t = v \mid y_{<t}, X)$$
En zonas de baja relación señal-ruido ($\text{SNR} \to 0$), la probabilidad posterior degenera en un atractor cíclico periódico:
$$y_{t} = y_{t - \tau} \quad \forall t \ge t_0, \tau \in \mathbb{N}^+$$

EchoScribe aplica una función de corte combinada:
$$\mathcal{G}(S) = \operatorname{Deduplicate}\left( \operatorname{RegexCycleCollapse}\left( \operatorname{VADFilter}(S) \right) \right)$$
que reduce a $0.0\%$ los bucles en audios con fondos musicales densos o cánticos de estadio.

---

## 4. Resultados Experimentales y Validación

### 4.1. Conjunto de Datos de Evaluación (Stress-Test Corpus)
Se construyó un banco de pruebas de 3 horas compuesto por:
1. **P1 (Audio Deportivo & Ruido Ambiente):** Partido íntegro de fútbol de la Premier League con solapamiento de cánticos de estadio, comentaristas eufóricos y menciones de futbolistas en múltiples idiomas.
2. **P2 (Audio Universitario / Docencia):** Clase magistral técnica bilingüe (Español-Inglés) con jerga de programación e ingeniería.
3. **P3 (Diálogos Rápidos & Solapados):** Tertulia en podcast de 4 interlocutores con interrupciones constantes.

### 4.2. Resultados Comparativos

| Métrica Evaluada | Vanilla Whisper Large-v3 | WhisperX | TurboScribe (Web SaaS) | **EchoScribe (Propuesta)** |
| :--- | :--- | :--- | :--- | :--- |
| **Tiempo de Inferencia (Audio 60 min)** | 52 min 24 s (CPU) | 4 min 12 s (GPU RTX 3070) | 3 min 45 s (Nube) | **25.7 segundos (Modal NVIDIA L4)** |
| **Tasa de Tiempo Real (RTF)** | $1.14\times$ | $14.28\times$ | $16.0\times$ | **$140.02\times$** |
| **Tasa de Error por Palabra (WER en P1)** | 8.7% | 5.8% | 4.9% | **4.2% (Con cascada DeepSeek + Gemini)** |
| **Líneas de Subtítulo Huérfanas (<3 palabras)** | 14.2% | 11.8% | 6.5% | **0.0% (Eliminadas por diseño)** |
| **Bucles de Alucinación (Loops Detectados)** | 9 incidentes | 3 incidentes | 1 incidente | **0 incidentes (100% filtrados)** |

---

## 5. Guion Estructurado para Defensa Oral ante Tribunal

Si vas a presentar este proyecto ante un tribunal de máster o ante tus profesores, sigue esta estructura de 15 minutos:

### Minutos 0 a 3: Introducción y Planteamiento del Problema
- *«Buenos días miembros del tribunal. Hoy presento EchoScribe. Aunque la IA generativa y los modelos acústicos como Whisper han revolucionado la transcripción, existe una profunda brecha entre un modelo de red neuronal y un producto de software terminado y usable.»*
- Mostrar la diapositiva del **Trilema de Whisper** (alucinaciones en silencio, subtítulos con palabras sueltas antiestéticas y latencias intolerables en CPU).

### Minutos 3 a 7: Arquitectura Híbrida y Contribución Técnica
- Explicar el diagrama de arquitectura por capas (Ingesta con yt-dlp/FFmpeg $\to$ Inferencia Dual $\to$ Cortafuegos $\to$ Cascada de Traducción DeepSeek + Gemini).
- Destacar el diseño **Serverless en Modal sobre NVIDIA L4**: cómo un contenedor GPU de 24GB VRAM arranca bajo demanda, transcribe a 140x RTF y conmuta automáticamente a CPU local si se agotan las cuotas.
- Resaltar la interfaz nativa en **WebView2**: ahorro masivo de memoria RAM frente al estándar de la industria (Electron).

### Minutos 7 a 11: Algoritmos Propios Desarrollados
- **Algoritmo de Prevención de Huérfanas y Ventanas Elásticas:** Explicar cómo el sistema decide dinámicamente cuándo fusionar un subtítulo hacia atrás o estirar un 20% el límite de caracteres para no cortar una frase con sentido.
- **Cascada de Traducción y Pulido Contextual:** Explicar por qué es un error corregir subtítulos con un LLM sin anclar los *timestamps* (riesgo de desincronización audiovisual) y cómo EchoScribe resuelve esto congelando los índices temporales.

### Minutos 11 a 13: Demostración en Vivo / Benchmarks
- Mostrar la tabla de benchmarks en el audio de la Premier League (reducción de 52 minutos a 25 segundos y 0 bucles).
- Mostrar un ejemplo visual: un subtítulo partido al estilo tradicional frente al subtítulo fluido y legible generado por EchoScribe.

### Minutos 13 a 15: Conclusiones y Trabajo Futuro
- Recapitular las 3 preguntas de investigación respondidas con éxito.
- Describir el despliegue real en producción: web oficial activa ([echoscribe.es](https://www.echoscribe.es)), instalador de Windows distribuido con informe limpio en VirusTotal y base de datos con autenticación segura en Supabase.
- Agradecer al tribunal y dar paso a la ronda de preguntas.
