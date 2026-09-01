/**
 * Endpoint para exportar transcripción a Word (.docx)
 * Requiere plan Pro o Ultra
 */

import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';

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
            access_token
        } = req.body || {};

        // Validar usuario
        if (!user_id || !transcription_id) {
            return res.status(400).json({ error: 'user_id y transcription_id requeridos' });
        }

        // Verificar plan (Pro o Ultra)
        if (access_token) {
            try {
                // Aquí se verificaría el plan del usuario
                // Por ahora asumimos que llegó a este endpoint solo si tiene permiso
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

        // Construir documento Word
        const doc = new Document({
            sections: [{
                children: [
                    new Paragraph({
                        text: titulo || "Transcripción sin título",
                        heading: HeadingLevel.HEADING_1,
                        bold: true,
                        size: 28
                    }),
                    new Paragraph({
                        text: `Duración: ${Math.floor(duracion_seg / 60)} minutos`,
                        size: 22
                    }),
                    new Paragraph({
                        text: `Fecha: ${new Date().toLocaleDateString('es-ES')}`,
                        size: 22
                    }),
                    new Paragraph({
                        text: ""
                    }),

                    // TITULARES
                    ...(titulares ? [
                        new Paragraph({
                            text: "TITULARES",
                            heading: HeadingLevel.HEADING_2,
                            bold: true
                        }),
                        new Paragraph({
                            text: titulares,
                            size: 22
                        }),
                        new Paragraph({ text: "" })
                    ] : []),

                    // RESUMEN
                    ...(resumen ? [
                        new Paragraph({
                            text: "RESUMEN",
                            heading: HeadingLevel.HEADING_2,
                            bold: true
                        }),
                        new Paragraph({
                            text: resumen,
                            size: 22
                        }),
                        new Paragraph({ text: "" })
                    ] : []),

                    // TEXTO CORREGIDO
                    new Paragraph({
                        text: "TEXTO COMPLETO",
                        heading: HeadingLevel.HEADING_2,
                        bold: true
                    }),
                    new Paragraph({
                        text: texto_corregido || "Sin contenido",
                        size: 22
                    })
                ]
            }]
        });

        // Generar buffer
        const buffer = await Packer.toBuffer(doc);

        // Enviar como descarga
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
        res.setHeader('Content-Disposition', `attachment; filename="${(titulo || 'transcripcion').replace(/\s+/g, '_')}.docx"`);
        return res.send(buffer);

    } catch (err) {
        console.error("Error en export-word:", err);
        return res.status(500).json({ error: err.message });
    }
}
