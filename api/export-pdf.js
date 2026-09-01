/**
 * Endpoint para exportar transcripción a PDF
 * Requiere plan Pro o Ultra
 * Usa html2pdf o similar en el cliente (ya que PDF desde backend es pesado)
 * Este endpoint retorna HTML que puede ser convertido a PDF en el cliente
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

        // Construir HTML para PDF
        const html = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${titulo || 'Transcripción'}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
            line-height: 1.6;
            color: #333;
            background: white;
            padding: 2cm;
            max-width: 21cm;
            margin: 0 auto;
        }
        h1 {
            font-size: 32px;
            margin-bottom: 1rem;
            color: #000;
            border-bottom: 3px solid #4f46e5;
            padding-bottom: 0.5rem;
        }
        h2 {
            font-size: 24px;
            margin-top: 2rem;
            margin-bottom: 1rem;
            color: #4f46e5;
        }
        .metadata {
            background: #f3f4f6;
            padding: 1rem;
            border-radius: 8px;
            margin-bottom: 2rem;
            font-size: 14px;
        }
        .metadata p {
            margin: 0.25rem 0;
        }
        .section {
            margin-bottom: 2rem;
        }
        .section p {
            text-align: justify;
            margin-bottom: 0.5rem;
        }
        .srt-block {
            background: #f9fafb;
            padding: 1rem;
            border-left: 4px solid #4f46e5;
            font-family: 'Courier New', monospace;
            font-size: 12px;
            white-space: pre-wrap;
            word-break: break-word;
            margin-top: 1rem;
        }
        .divider {
            border-top: 1px solid #e5e7eb;
            margin: 2rem 0;
        }
        .page-break {
            page-break-after: always;
        }
    </style>
</head>
<body>
    <h1>${(titulo || 'Transcripción').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</h1>
    
    <div class="metadata">
        <p><strong>Duración:</strong> ${Math.floor(duracion_seg / 60)} minutos (${Math.round(duracion_seg)} segundos)</p>
        <p><strong>Fecha de exportación:</strong> ${new Date().toLocaleDateString('es-ES')} a las ${new Date().toLocaleTimeString('es-ES')}</p>
        <p><strong>Fuente:</strong> EchoScribe Transcriptor</p>
    </div>

    ${titulares ? `
    <div class="section">
        <h2>Titulares</h2>
        <p>${titulares.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>')}</p>
    </div>
    <div class="divider"></div>
    ` : ''}

    ${resumen ? `
    <div class="section">
        <h2>Resumen</h2>
        <p>${resumen.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>')}</p>
    </div>
    <div class="divider"></div>
    ` : ''}

    <div class="section">
        <h2>Texto Completo</h2>
        <p>${(texto_corregido || 'Sin contenido').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>')}</p>
    </div>

    ${srt_data ? `
    <div class="page-break"></div>
    <div class="section">
        <h2>Subtítulos (SRT)</h2>
        <div class="srt-block">${srt_data.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
    </div>
    ` : ''}

    <div style="margin-top: 4rem; padding-top: 2rem; border-top: 1px solid #e5e7eb; font-size: 12px; color: #666;">
        <p>Documento generado automáticamente por EchoScribe. Los datos se borran automáticamente tras 24h de la transcripción.</p>
    </div>
</body>
</html>
`;

        // Retornar HTML que puede ser convertido a PDF en el cliente
        return res.status(200).json({
            success: true,
            format: 'html',
            html: html,
            filename: `${(titulo || 'transcripcion').replace(/\s+/g, '_')}.html`,
            message: 'Abre este HTML en el navegador y usa Ctrl+P o Print para guardar como PDF'
        });

    } catch (err) {
        console.error("Error en export-pdf:", err);
        return res.status(500).json({ error: err.message });
    }
}
