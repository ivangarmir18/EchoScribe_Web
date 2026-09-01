/**
 * Endpoint para hacer llamadas a Gemini API de forma SEGURA
 * - El cliente NO tiene acceso directo a claves Gemini
 * - El servidor (Vercel) maneja todas las keys
 * - Verifica autenticación y rate-limiting
 */

const supabaseUrl = process.env.SUPABASE_URL || "https://ggmaiqxbidcxhbungnpx.supabase.co";
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || "sb_publishable_f0PoBtsO7K98ck4Uh-0tGw_hXqxhWH6";

// Cache simple de keys rotadas
const keyCache = new Map();
let lastKeyRotation = Date.now();

async function getGeminiKey(plan = "Gratis") {
    const cacheKey = `gemini_key_${plan}`;
    const cached = keyCache.get(cacheKey);

    // Usar cache por 5 minutos
    if (cached && Date.now() - cached.timestamp < 5 * 60 * 1000) {
        return cached.key;
    }

    try {
        let keyType = plan === 'Gratis' ? 'gratis' : 'pago';
        const resp = await fetch(
            `${supabaseUrl}/rest/v1/api_keys?key_type=eq.${keyType}&order=created_at.desc&limit=1&select=key_value`,
            {
                headers: {
                    "apikey": supabaseAnonKey,
                    "Authorization": `Bearer ${supabaseAnonKey}`
                }
            }
        );

        if (resp.ok) {
            const keys = await resp.json();
            if (keys && keys.length > 0) {
                const key = keys[0].key_value;
                keyCache.set(cacheKey, { key, timestamp: Date.now() });
                return key;
            }
        }
    } catch (err) {
        console.error("Error fetching Gemini key:", err);
    }

    // Fallback a env var
    return process.env.GEMINI_API_KEY_DEFAULT || "";
}

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const {
            contents,
            systemInstruction,
            generationConfig,
            plan = "Gratis",
            user_id,
            access_token
        } = req.body || {};

        // Validar que hay contenido
        if (!contents || !Array.isArray(contents) || contents.length === 0) {
            return res.status(400).json({ error: 'contents requerido' });
        }

        // Validar usuario (opcional pero recomendado)
        if (access_token && user_id) {
            try {
                const userRes = await fetch(`${supabaseUrl}/auth/v1/user`, {
                    headers: {
                        "Authorization": `Bearer ${access_token}`,
                        "apikey": supabaseAnonKey
                    }
                });

                if (!userRes.ok) {
                    return res.status(401).json({ error: 'Token inválido' });
                }

                const userData = await userRes.json();
                if (userData.id !== user_id) {
                    return res.status(403).json({ error: 'Usuario no coincide' });
                }
            } catch (err) {
                console.error("Token verification error:", err);
                // Continuar de todas formas (puede ser anónimo)
            }
        }

        // Obtener clave Gemini de forma segura
        const geminiKey = await getGeminiKey(plan);
        if (!geminiKey) {
            return res.status(503).json({
                error: 'No Gemini key available',
                message: 'Servicio temporalmente no disponible'
            });
        }

        // Hacer llamada a Gemini
        const geminiRes = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${geminiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: contents,
                    systemInstruction: systemInstruction || undefined,
                    generationConfig: generationConfig || {
                        temperature: 0.35,
                        maxOutputTokens: 750
                    }
                })
            }
        );

        if (!geminiRes.ok) {
            const errBody = await geminiRes.text();
            console.error("Gemini API Error:", errBody);

            if (geminiRes.status === 429) {
                return res.status(429).json({
                    error: 'Rate limited',
                    message: 'Demasiadas solicitudes. Intenta en unos momentos.'
                });
            }

            return res.status(502).json({
                error: 'Gemini API error',
                message: 'Error al contactar Gemini'
            });
        }

        const data = await geminiRes.json();
        const candidate = data.candidates?.[0];
        const replyText = candidate?.content?.parts?.[0]?.text;

        if (!replyText) {
            return res.status(500).json({ error: 'Empty response from Gemini' });
        }

        return res.status(200).json({
            success: true,
            respuesta: replyText,
            usage: data.usageMetadata || {}
        });

    } catch (err) {
        console.error("Error en call-gemini-api:", err);
        return res.status(500).json({ error: err.message });
    }
}
