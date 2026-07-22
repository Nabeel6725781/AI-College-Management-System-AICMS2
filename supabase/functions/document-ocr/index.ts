import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, content-type",
};

interface VisionRequest {
  image: {
    content: string; // Base64 encoded image
  };
  features: Array<{
    type: string;
    maxResults?: number;
  }>;
}

interface VisionResponse {
  responses: Array<{
    textAnnotations?: Array<{
      description: string;
      boundingPoly?: {
        vertices: Array<{ x: number; y: number }>;
      };
    }>;
    fullTextAnnotation?: {
      text: string;
      pages?: Array<{
        blocks?: Array<{
          paragraphs?: Array<{
            words?: Array<{
              symbols?: Array<{
                text: string;
              }>;
            }>;
          }>;
        }>;
      }>;
    };
    error?: {
      code: number;
      message: string;
    };
  }>;
}

interface OCRResult {
  success: boolean;
  extractedText?: string;
  confidence?: number;
  error?: string;
  fileName?: string;
  detections?: Array<{
    text: string;
    confidence: number;
  }>;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ success: false, error: "Method not allowed. Use POST." }),
      { status: 405, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }

  try {
    const apiKey = Deno.env.get("GOOGLE_VISION_API_KEY");

    if (!apiKey) {
      return new Response(
        JSON.stringify({ 
          success: false,
          error: "Google Vision API key not configured in Supabase secrets" 
        }),
        { 
          status: 500, 
          headers: { "Content-Type": "application/json", ...corsHeaders } 
        }
      );
    }

    // Parse request body
    const contentType = req.headers.get("content-type") || "";
    let base64Image: string;
    let fileName: string = "document";

    if (contentType.includes("application/json")) {
      // JSON payload with base64 image
      const body = await req.json();
      base64Image = body.image;
      fileName = body.fileName || "document";

      if (!base64Image) {
        return new Response(
          JSON.stringify({ 
            success: false,
            error: "Missing 'image' field in request body. Provide base64 encoded image." 
          }),
          { 
            status: 400, 
            headers: { "Content-Type": "application/json", ...corsHeaders } 
          }
        );
      }
    } else if (contentType.includes("multipart/form-data")) {
      // Multipart form data
      const formData = await req.formData();
      const fileField = formData.get("file");

      if (!fileField || !(fileField instanceof File)) {
        return new Response(
          JSON.stringify({ 
            success: false,
            error: "Missing 'file' field in form data" 
          }),
          { 
            status: 400, 
            headers: { "Content-Type": "application/json", ...corsHeaders } 
          }
        );
      }

      fileName = fileField.name;
      const buffer = await fileField.arrayBuffer();
      base64Image = btoa(String.fromCharCode(...new Uint8Array(buffer)));
    } else {
      return new Response(
        JSON.stringify({ 
          success: false,
          error: "Unsupported content type. Use application/json or multipart/form-data" 
        }),
        { 
          status: 400, 
          headers: { "Content-Type": "application/json", ...corsHeaders } 
        }
      );
    }

    // Prepare Google Vision API request
    const visionRequest: VisionRequest = {
      image: {
        content: base64Image,
      },
      features: [
        {
          type: "TEXT_DETECTION",
          maxResults: 10,
        },
      ],
    };

    // Call Google Cloud Vision API
    const visionResponse = await fetch(
      `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ requests: [visionRequest] }),
      }
    );

    if (!visionResponse.ok) {
      const errorData = await visionResponse.text();
      console.error("Google Vision API error:", errorData);
      return new Response(
        JSON.stringify({ 
          success: false,
          error: `Google Vision API error: ${visionResponse.status}`,
        }),
        { 
          status: visionResponse.status, 
          headers: { "Content-Type": "application/json", ...corsHeaders } 
        }
      );
    }

    const visionData: VisionResponse = await visionResponse.json();

    // Check for API errors in response
    if (visionData.responses && visionData.responses.length > 0) {
      const response = visionData.responses[0];

      if (response.error) {
        return new Response(
          JSON.stringify({ 
            success: false,
            error: response.error.message,
          }),
          { 
            status: 400, 
            headers: { "Content-Type": "application/json", ...corsHeaders } 
          }
        );
      }

      // Extract text from response
      let extractedText = "";
      let confidence = 0;
      const detections: Array<{ text: string; confidence: number }> = [];

      if (response.fullTextAnnotation?.text) {
        extractedText = response.fullTextAnnotation.text;
        confidence = 95; // Full text detection has high confidence
      } else if (response.textAnnotations && response.textAnnotations.length > 0) {
        extractedText = response.textAnnotations[0].description;
        confidence = 90;
      }

      if (response.textAnnotations && response.textAnnotations.length > 1) {
        // Skip the first one as it's the full text, get individual words
        response.textAnnotations.slice(1, 50).forEach((annotation) => {
          detections.push({
            text: annotation.description,
            confidence: 88, // Approximate confidence for individual elements
          });
        });
      }

      const result: OCRResult = {
        success: true,
        extractedText: extractedText || "No text detected in image",
        confidence,
        fileName,
        detections: detections.length > 0 ? detections : undefined,
      };

      return new Response(JSON.stringify(result), {
        headers: { "Content-Type": "application/json", ...corsHeaders },
        status: 200,
      });
    }

    return new Response(
      JSON.stringify({ 
        success: false,
        error: "No valid response from Google Vision API" 
      }),
      { 
        status: 500, 
        headers: { "Content-Type": "application/json", ...corsHeaders } 
      }
    );
  } catch (error) {
    console.error("OCR Function Error:", error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      }),
      { 
        status: 500, 
        headers: { "Content-Type": "application/json", ...corsHeaders } 
      }
    );
  }
});
