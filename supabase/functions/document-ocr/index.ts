// supabase/functions/document-ocr/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, content-type",
};

interface OCRResult {
  success: boolean;
  extractedText?: string;
  confidence?: number;
  error?: string;
  fileName?: string;
  fields?: Array<{
    field: string;
    value: string;
    confidence: number;
  }>;
}

// Direct API Key Call
async function callGoogleVisionAPI(base64Image: string): Promise<any> {
  const apiKey = Deno.env.get("GOOGLE_VISION_API_KEY");

  if (!apiKey) {
    throw new Error("GOOGLE_VISION_API_KEY not configured in Supabase secrets");
  }

  const visionRequest = {
    image: { content: base64Image },
    features: [
      { type: "TEXT_DETECTION", maxResults: 50 },
      { type: "DOCUMENT_TEXT_DETECTION", maxResults: 50 },
    ],
  };

  const response = await fetch(
    `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ requests: [visionRequest] }),
    }
  );

  if (!response.ok) {
    const errorData = await response.text();
    console.error("Vision API Error:", errorData);
    throw new Error(`Vision API error: ${response.status}`);
  }

  return await response.json();
}

// Parse extracted text to detect fields
function parseDocumentFields(
  text: string
): Array<{ field: string; value: string; confidence: number }> {
  const fields: Array<{ field: string; value: string; confidence: number }> = [];

  // Student ID patterns
  const studentIdMatch = text.match(/(?:student\s*(?:id|number)|id\s*number)[:\s]*([A-Za-z0-9-]+)/i);
  if (studentIdMatch) {
    fields.push({
      field: "Student ID",
      value: studentIdMatch[1].trim(),
      confidence: 92,
    });
  }

  // Name patterns
  const nameMatch = text.match(/(?:name)[:\s]*([A-Za-z\s]+?)(?:\n|$)/i);
  if (nameMatch) {
    fields.push({
      field: "Name",
      value: nameMatch[1].trim(),
      confidence: 88,
    });
  }

  // Date patterns (YYYY-MM-DD or DD/MM/YYYY)
  const dateMatch = text.match(/(\d{4}-\d{2}-\d{2}|\d{2}\/\d{2}\/\d{4})/);
  if (dateMatch) {
    fields.push({
      field: "Date",
      value: dateMatch[1],
      confidence: 95,
    });
  }

  // GPA/Marks patterns
  const gpaMatch = text.match(/(?:gpa|cgpa)[:\s]*(\d+\.?\d*)/i);
  if (gpaMatch) {
    fields.push({
      field: "GPA",
      value: gpaMatch[1],
      confidence: 90,
    });
  }

  // University/Institution
  const institutionMatch = text.match(
    /(?:university|college|institution)[:\s]*([A-Za-z\s]+?)(?:\n|$)/i
  );
  if (institutionMatch) {
    fields.push({
      field: "Institution",
      value: institutionMatch[1].trim(),
      confidence: 85,
    });
  }

  return fields;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ success: false, error: "Use POST method" }),
      { status: 405, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }

  try {
    const body = await req.json();
    const { image: rawImage, fileName = "document" } = body;

    if (!rawImage) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing 'image' in request" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Clean base64 string (Strip header like 'data:image/jpeg;base64,' if sent)
    const image = rawImage.replace(/^data:image\/\w+;base64,/, "");

    console.log("Processing OCR for:", fileName);

    // Call Google Vision API
    const visionResponse = await callGoogleVisionAPI(image);

    if (!visionResponse.responses || visionResponse.responses.length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: "No response from Vision API" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const apiResponse = visionResponse.responses[0];

    if (apiResponse.error) {
      console.error("Vision API returned error:", apiResponse.error);
      return new Response(
        JSON.stringify({
          success: false,
          error: `Vision API error: ${apiResponse.error.message}`,
        }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Extract text
    let extractedText = "";
    let confidence = 0;

    if (apiResponse.fullTextAnnotation?.text) {
      extractedText = apiResponse.fullTextAnnotation.text;
      confidence = 98;
    } else if (apiResponse.textAnnotations?.[0]?.description) {
      extractedText = apiResponse.textAnnotations[0].description;
      confidence = 92;
    }

    if (!extractedText) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "No text detected in image",
        }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Parse fields
    const fields = parseDocumentFields(extractedText);

    const result: OCRResult = {
      success: true,
      extractedText: extractedText.trim(),
      confidence: Math.round(confidence),
      fileName,
      fields:
        fields.length > 0
          ? fields
          : [
              {
                field: "Extracted Text",
                value: extractedText.substring(0, 100) + "...",
                confidence: confidence - 5,
              },
            ],
    };

    return new Response(JSON.stringify(result), {
      headers: { "Content-Type": "application/json", ...corsHeaders },
      status: 200,
    });
  } catch (error) {
    console.error("OCR Error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "OCR processing failed",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
