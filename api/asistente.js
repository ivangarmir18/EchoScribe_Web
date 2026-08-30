export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { historial } = req.body || {};
        if (!historial || !Array.isArray(historial) || historial.length === 0) {
            return res.status(400).json({ error: 'Historial requerido' });
        }

        const supabaseUrl = "https://ggmaiqxbidcxhbungnpx.supabase.co";
        const supabaseAnonKey = "sb_publishable_f0PoBtsO7K98ck4Uh-0tGw_hXqxhWH6";

        let geminiKey = process.env.GEMINI_API_KEY || "";

        if (!geminiKey) {
            try {
                const sbRes = await fetch(`${supabaseUrl}/rest/v1/api_keys?key_type=eq.gratis&select=key_value`, {
                    headers: {
                        "apikey": supabaseAnonKey,
                        "Authorization": `Bearer ${supabaseAnonKey}`
                    }
                });
                if (sbRes.ok) {
                    const keys = await sbRes.json();
                    if (keys && keys.length > 0) {
                        const randomIndex = Math.floor(Math.random() * keys.length);
                        geminiKey = keys[randomIndex].key_value;
                    }
                }
            } catch (sbErr) {
                console.error("Error obteniendo key de Supabase:", sbErr);
            }
        }

        if (!geminiKey) {
            return res.status(500).json({ error: 'No key available', fallback: true });
        }

        const systemInstruction = `Eres el Asistente Virtual Oficial de Soporte de EchoScribe (desarrollado por Iván García Miranda).
Tu objetivo es resolver dudas de forma concisa, educada, empática y técnicamente precisa.
Reglas clave:
1. Conoces todo el ecosistema de EchoScribe:
   - Plan Gratis (0€): 30 transcripciones IA + 60 básicas/mes, audios hasta 30 min, procesado en CPU local.
   - Plan Pro (9,99€/mes): 100 IA + 150 básicas en GPU Cloud, audios hasta 3 horas, subtítulos .SRT sincronizados.
   - Plan Ultra (19,99€/mes): 250 IA + 500 básicas en GPU Cloud L4 ultrarrápida, audios hasta 12 horas (directos enteros), soporte prioritario.
2. Directos y Streamings (YouTube / Twitch):
   - Si un directo está emitiéndose EN VIVO, la plataforma aún no tiene el archivo de audio cerrado. Hay que esperar a que el directo termine para transcribir el VOD.
   - Si el directo dura más de 3 horas, requiere Plan Ultra (hasta 12 horas).
   - En Twitch, los directos 'Sub-only' (solo suscriptores) no pueden ser descargados por la API.
3. Windows SmartScreen: Es un filtro temporal por ser versión nueva. Se soluciona pulsando 'Más información' -> 'Ejecutar de todas formas'.
4. Privacidad: Borrado automático a las 24 horas (TTL 24h), canal seguro HTTPS/TLS 1.3, cero entrenamiento de modelos de IA con datos de usuarios.
5. Formatos compatibles: MP3, WAV, MP4, M4A, AAC, MKV, FLAC, WebM, enlaces de YouTube, Twitch y X.
6. Subtítulos .SRT: Sincronización milimétrica para Premiere, CapCut, DaVinci Resolve.
7. Si el usuario escribe mensajes cortos de seguimiento (ej: 'era un directo', 'en mp4', 'como lo descargo'), mantén el hilo de la conversación y responde adaptado a su contexto previo de forma natural y clara.
8. Formatea tu respuesta con HTML limpio y legible (usa <strong>, <br>, <li>, etc.), sin emojis informales tipo IA cutre.`;

        const contents = historial.map(msg => ({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.text || '' }]
        }));

        const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${geminiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: contents,
                systemInstruction: {
                    parts: [{ text: systemInstruction }]
                },
                generationConfig: {
                    temperature: 0.35,
                    maxOutputTokens: 750
                }
            })
        });

        if (!geminiRes.ok) {
            const errBody = await geminiRes.text();
            console.error("Gemini API Error:", errBody);
            return res.status(502).json({ error: 'Gemini API error', fallback: true });
        }

        const data = await geminiRes.json();
        const candidate = data.candidates?.[0];
        const replyText = candidate?.content?.parts?.[0]?.text;

        if (!replyText) {
            return res.status(500).json({ error: 'Empty response', fallback: true });
        }

        return res.status(200).json({ respuesta: replyText });
    } catch (err) {
        console.error("Error en handler asistente:", err);
        return res.status(500).json({ error: err.message, fallback: true });
    }
}
