/**
 * Endpoint para exportar transcripción a Markdown (.md)
 * Requiere plan Pro o Ultra
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
        const {
            user_id,
            transcription_id,
            titulo,
            duracion_seg,
            texto_corregido,
            resumen,
            titulares,
            srt_data,
            access_token
        } = req.body || {};

        // Validar usuario
        if (!user_id || !transcription_id) {
            return res.status(400).json({ error: 'user_id y transcription_id requeridos' });
        }

        // Verificar token si se proporciona
        if (access_token) {
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
            } catch (err) {
                console.error("Auth error:", err);
                return res.status(401).json({ error: 'Verificación fallida' });
            }
        }

        // Construir markdown
        let markdown = `# ${titulo || "Transcripción sin título"}\n\n`;
        markdown += `**Duración:** ${Math.floor(duracion_seg / 60)} minutos\n`;
        markdown += `**Fecha:** ${new Date().toLocaleDateString('es-ES')}\n\n`;
        markdown += `---\n\n`;

        if (titulares) {
            markdown += `## Titulares\n\n${titulares}\n\n---\n\n`;
        }

        if (resumen) {
            markdown += `## Resumen\n\n${resumen}\n\n---\n\n`;
        }

        markdown += `## Texto Completo\n\n${texto_corregido || "Sin contenido"}\n\n`;

        if (srt_data) {
            markdown += `---\n\n## Subtítulos (SRT)\n\n\`\`\`\n${srt_data}\n\`\`\`\n`;
        }

        // Enviar como descarga
        res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="${(titulo || 'transcripcion').replace(/\s+/g, '_')}.md"`);
        return res.send(markdown);

    } catch (err) {
        console.error("Error en export-markdown:", err);
        return res.status(500).json({ error: err.message });
    }
}
