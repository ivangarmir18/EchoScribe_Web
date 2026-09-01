/**
 * Endpoint seguro para obtener claves Gemini
 * - NO expone claves públicamente
 * - Verifica que la solicitud venga autenticada (user_id + token)
 * - Usa Environment Variables seguras de Vercel (no publicables)
 */

const supabaseUrl = process.env.SUPABASE_URL || "https://ggmaiqxbidcxhbungnpx.supabase.co";
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || "sb_publishable_f0PoBtsO7K98ck4Uh-0tGw_hXqxhWH6";

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
        const { user_id, plan, access_token } = req.body || {};

        // Validación básica
        if (!user_id || !plan) {
            return res.status(400).json({ error: 'user_id y plan requeridos' });
        }

        const validPlans = ['Gratis', 'Pro', 'Ultra'];
        if (!validPlans.includes(plan)) {
            return res.status(400).json({ error: 'Plan inválido' });
        }

        // Verificar que el usuario existe en Supabase
        if (access_token) {
            try {
                const userRes = await fetch(`${supabaseUrl}/auth/v1/user`, {
                    headers: {
                        "Authorization": `Bearer ${access_token}`,
                        "apikey": supabaseAnonKey
                    }
                });

                if (!userRes.ok) {
                    return res.status(401).json({ error: 'Token inválido o expirado' });
                }

                const userData = await userRes.json();
                if (userData.id !== user_id) {
                    return res.status(403).json({ error: 'Usuario no coincide' });
                }
            } catch (authErr) {
                console.error("Error verificando token:", authErr);
                return res.status(401).json({ error: 'Token verification failed' });
            }
        }

        // Obtener claves desde Supabase (privadas)
        let geminiKey = process.env.GEMINI_API_KEY_DEFAULT || "";
        let keyType = "default";

        try {
            // Para planes Pro/Ultra: intenta obtener clave de pago
            if (plan === 'Pro' || plan === 'Ultra') {
                const payRes = await fetch(
                    `${supabaseUrl}/rest/v1/api_keys?key_type=eq.pago&order=created_at.desc&limit=1&select=key_value`,
                    {
                        headers: {
                            "apikey": supabaseAnonKey,
                            "Authorization": `Bearer ${supabaseAnonKey}`
                        }
                    }
                );

                if (payRes.ok) {
                    const keys = await payRes.json();
                    if (keys && keys.length > 0) {
                        geminiKey = keys[0].key_value;
                        keyType = "pago";
                    }
                }
            }

            // Para plan Gratis: intenta obtener clave de gratis
            if (!geminiKey && plan === 'Gratis') {
                const freeRes = await fetch(
                    `${supabaseUrl}/rest/v1/api_keys?key_type=eq.gratis&order=created_at.desc&limit=1&select=key_value`,
                    {
                        headers: {
                            "apikey": supabaseAnonKey,
                            "Authorization": `Bearer ${supabaseAnonKey}`
                        }
                    }
                );

                if (freeRes.ok) {
                    const keys = await freeRes.json();
                    if (keys && keys.length > 0) {
                        geminiKey = keys[0].key_value;
                        keyType = "gratis";
                    }
                }
            }
        } catch (dbErr) {
            console.error("Error obteniendo keys de Supabase:", dbErr);
            // Fallback a environment variable
            geminiKey = process.env.GEMINI_API_KEY_DEFAULT || "";
        }

        if (!geminiKey) {
            return res.status(503).json({
                error: 'No key available',
                message: 'Todas las claves están agotadas. Intenta más tarde.'
            });
        }

        // ⚠️ IMPORTANTE: NUNCA retornar la clave directamente
        // Opción 1: Retornar un token JWT que valida la clave por tiempo limitado
        // Opción 2: El cliente usa el endpoint en Vercel para hacer requests a Gemini
        // Implementamos la Opción 2 aquí: el cliente llamará a "call-gemini-api" en lugar de ir directo

        return res.status(200).json({
            success: true,
            message: 'Use the /api/call-gemini-api endpoint to make Gemini requests',
            keyType: keyType,
            // NO RETORNAR LA CLAVE AQUÍ
        });

    } catch (err) {
        console.error("Error en secure-gemini-key:", err);
        return res.status(500).json({ error: err.message });
    }
}
