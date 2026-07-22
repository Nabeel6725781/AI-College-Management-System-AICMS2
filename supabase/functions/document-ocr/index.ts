import { serve } from "https://deno.land";

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
  detections?: Array<{
    text: string;
    confidence: number;
  }>;
}

// Function to generate Google OAuth2 Access Token using Service Account JSON
async function getGoogleAccessToken(serviceAccountStr: string): Promise<string> {
  const gcp = JSON.parse(serviceAccountStr);
  
  // Clean the private key formatting
  const pemHeader = "-----BEGIN PRIVATE KEY-----";
  const pemFooter = "-----END PRIVATE KEY-----";
  const pemContents = gcp.private_key
    .replace(pemHeader, "")
    .replace(pemFooter, "")
    .replace(/\s/g, "");
  
  // Convert base64 PEM to binary ArrayBuffer
  const binaryDerString = atob(pemContents);
  const binaryDer = new Uint8Array(binaryDerString.length);
  for (let i = 0; i < binaryDerString.length; i++) {
    binaryDer[i] = binaryDerString.charCodeAt(i);
  }

  // Import the private key into Web Crypto API
  const privateKey = await crypto.subtle.importKey(
    "pkcs8",
    binaryDer.buffer,
    {
      name: "RSASHA256",
      hash: { name: "SHA-256" },
    },
    false,
    ["sign"]
  );

  // Prepare JWT Header & Payload
  const header = btoa(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + 3600; // Token valid for 1 hour

  const payload = btoa(
    JSON.stringify({
      iss: gcp.client_email,
      scope: "https://googleapis.com",
      aud: gcp.token_uri,
      exp: exp,
      iat: iat,
    })
  );

  // Sign JWT
  const textEncoder = new TextEncoder();
  const signatureBuffer = await crypto.subtle.sign(
    "RSASHA256",
    privateKey,
    textEncoder.encode(`${header}.${payload}`)
  );
  
  const signature = btoa(String.fromCharCode(...new Uint8Array(signatureBuffer)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  const jwt = `${header}.${payload}.${signature}`;

  // Request access token from Google OAuth2 Endpoint
  const response = await fetch(gcp.token_uri, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Failed to get Google Access Token: ${errText}`);
  }

  const data = await response.json();
  return data.access_token;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed. Use POST." }),
      { status: 405, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }

  try {
    // Read the Service Account JSON String from environment variables
    const serviceAccountJson = Deno.env.get("GOOGLE_SERVICE_ACCOUNT_JSON");

    if (!serviceAccountJson) {
      return new Response(
        JSON.stringify({ 
          success: false,
          error: "GOOGLE_SERVICE_ACCOUNT_JSON secret is not configured in Supabase" 
        }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Generate OAuth2 Access Token dynamically
    let accessToken: string;
    try {
      accessToken = await getGoogleAccessToken(serviceAccountJson);
    } catch (tokenError) {
      console.error("Token Generation Error:", tokenError);
      return new Response(
        JSON.stringify({ success: false, error: "Authentication failed with Google Cloud", details: tokenError.message }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Parse request body
    const contentType = req.headers.get("content-type") || "";
    let base64Image: string;

    if (contentType.includes("application/json")) {
      const body = await req.json();
      base64Image = body.image;

      if (!base64Image) {
        return new Response(
          JSON.stringify({ success: false, error: "Missing 'image' field in request body." }),
          { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }
    } else if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const fileField = formData.get("file");

      if (!fileField || !(fileField instanceof File)) {
        return new Response(
          JSON.stringify({ success: false, error: "Missing 'file' field in form data" }),
          { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      const buffer = await fileField.arrayBuffer();
      base64Image = btoa(String.fromCharCode(...new Uint8Array(buffer)));
    } else {
      return new Response(
        JSON.stringify({ success: false, error: "Unsupported content type." }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const visionRequest: VisionRequest = {
      image: { content: base64Image },
      features: [{ type: "TEXT_DETECTION", maxResults: 10 }],
    };

    // Call Google Cloud Vision API using Bearer Token Authentication
    const visionResponse = await fetch(
      `https://googleapis.com`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`, // Service account authorization
        },
        body: JSON.stringify({ requests: [visionRequest] }),
      }
    );

    if (!visionResponse.ok) {
      const errorData = await visionResponse.text();
      console.error("Google Vision API error:", errorData);
      return new Response(
        JSON.stringify({ success: false, error: `Google Vision API error: ${visionResponse.status}`, details: errorData }),
        { status: visionResponse.status, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const visionData: VisionResponse = await visionResponse.json();

    if (visionData.responses && visionData.responses.length > 0) {
      const response = visionData.responses[0];

      if (response.error) {
        return new Response(
          JSON.stringify({ success: false, error: response.error.message, code: response.error.code }),
          { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      let extractedText = "";
      let confidence = 0;
      const detections: Array<{ text: string; confidence: number }> = [];

      if (response.fullTextAnnotation?.text) {
        extractedText = response.fullTextAnnotation.text;
        confidence = 0.95;
      }

      if (response.textAnnotations && response.textAnnotations.length > 0) {
        response.textAnnotations.forEach((annotation, index) => {
          if (index === 0) return;
          detections.push({
            text: annotation.description,
            confidence: 0.9,
          });
        });
      }

      const result: OCRResult = {
        success: true,
        extractedText: extractedText || (response.textAnnotations?.[0]?.description || ""),
        confidence,
        detections: detections.length > 0 ? detections : undefined,
      };

      return new Response(JSON.stringify(result), {
        headers: { "Content-Type": "application/json", ...corsHeaders },
        status: 200,
      });
    }

    return new Response(
      JSON.stringify({ success: false, error: "No valid response from Google Vision API" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error) {
    console.error("OCR Function Error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : "Unknown error occurred" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
