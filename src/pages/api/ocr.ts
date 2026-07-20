import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
// Use formidable to parse multipart/form-data
const formidable = require('formidable');

import { supabase } from '../../lib/supabase';

export const config = {
  api: {
    bodyParser: false,
  },
};

function parseForm(req: NextApiRequest): Promise<{ fields: any; files: any }> {
  return new Promise((resolve, reject) => {
    const form = new formidable.IncomingForm();
    form.parse(req, (err: any, fields: any, files: any) => {
      if (err) return reject(err);
      resolve({ fields, files });
    });
  });
}

function extractKeyedFields(text: string) {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const res: Array<{ label: string; value: string; confidence: number }> = [];

  const tryMatch = (re: RegExp, label: string) => {
    const m = text.match(re);
    if (m && m[1]) {
      res.push({ label, value: m[1].trim(), confidence: 88 });
      return true;
    }
    return false;
  };

  tryMatch(/Document Type[:\-\s]+(.+)/i, 'Document Type');
  tryMatch(/Student Name[:\-\s]+(.+)/i, 'Student Name');
  tryMatch(/Student ID[:\-\s]+([A-Za-z0-9-]+)/i, 'Student ID');
  tryMatch(/Institution[:\-\s]+(.+)/i, 'Institution');
  tryMatch(/GPA[:\-\s]+([0-9\.\/]*)/i, 'GPA');
  tryMatch(/Graduation Date[:\-\s]+(.+)/i, 'Graduation Date');
  tryMatch(/Degree[:\-\s]+(.+)/i, 'Degree');
  tryMatch(/Issue Date[:\-\s]+(.+)/i, 'Issue Date');

  // fallback heuristics: look for a line that contains 'GPA' or looks like an institution
  for (const line of lines) {
    if (/GPA[:\s]/i.test(line) && !res.find(r => r.label === 'GPA')) {
      const m = line.match(/GPA[:\-\s]*([0-9\.\/]+)/i);
      if (m && m[1]) res.push({ label: 'GPA', value: m[1].trim(), confidence: 80 });
    }
    if (/university|college|institution/i.test(line) && !res.find(r => r.label === 'Institution')) {
      res.push({ label: 'Institution', value: line, confidence: 75 });
    }
    if (/student id|stu[-\s]?\d{4,}/i.test(line) && !res.find(r => r.label === 'Student ID')) {
      const m = line.match(/(STU[-\s]?\d{3,}|Student ID[:\-\s]*([A-Za-z0-9-]+))/i);
      if (m) res.push({ label: 'Student ID', value: (m[1] || m[2]).trim(), confidence: 82 });
    }
  }

  return res;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  if (!process.env.GOOGLE_VISION_API_KEY) {
    return res.status(500).json({ ok: false, error: 'Missing GOOGLE_VISION_API_KEY' });
  }

  try {
    const { files } = await parseForm(req);
    const file = files?.file || files?.uploadedFile;

    if (!file) {
      return res.status(400).json({ ok: false, error: 'No file uploaded' });
    }

    // formidable v2 uses filepath, older versions use path
    const filepath = file.filepath || file.path || file.filePath;
    const buffer = await fs.promises.readFile(filepath);
    const content = buffer.toString('base64');

    // Call Google Vision API
    const visionRes = await fetch(
      `https://vision.googleapis.com/v1/images:annotate?key=${encodeURIComponent(process.env.GOOGLE_VISION_API_KEY as string)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requests: [
            {
              image: { content },
              features: [ { type: 'DOCUMENT_TEXT_DETECTION', maxResults: 5 } ],
            },
          ],
        }),
      }
    );

    if (!visionRes.ok) {
      const txt = await visionRes.text();
      console.error('Vision API error', visionRes.status, txt);
      return res.status(502).json({ ok: false, error: 'Vision API error', details: txt });
    }

    const visionJson = await visionRes.json();
    const annotation = visionJson.responses?.[0]?.fullTextAnnotation || visionJson.responses?.[0]?.textAnnotations?.[0];
    const fullText = annotation?.text || annotation?.description || '';

    // Try to extract structured fields heuristically
    const extracted = extractKeyedFields(fullText);

    // If no structured fields found, include a short excerpt as a single field
    if (extracted.length === 0 && fullText) {
      extracted.push({ label: 'Full Text', value: fullText.slice(0, 1000), confidence: 70 });
    }

    // Save to supabase documents table
    try {
      const insertPayload: any = {
        name: file.originalFilename || file.name || path.basename(filepath),
        file_size: buffer.length,
        mime_type: file.mimetype || file.type || null,
        status: 'verified',
        ocr_text: fullText || null,
        created_at: new Date().toISOString(),
      };

      const { data, error } = await supabase.from('documents').insert(insertPayload).select().single();
      if (error) console.error('Supabase insert error', error);
    } catch (e) {
      console.error('Supabase save error', e);
    }

    return res.status(200).json({ ok: true, extracted, ocr_text: fullText, status: 'verified' });
  } catch (err: any) {
    console.error('OCR handler error', err);
    return res.status(500).json({ ok: false, error: err?.message ?? String(err) });
  }
}
