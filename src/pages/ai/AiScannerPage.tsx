// src/pages/ai/AiScannerPage.tsx - Updated OCR Integration Functions

/**
 * Executes OCR on the provided file via Supabase Edge Function 'document-ocr'
 */
async function scanDocumentWithOCR(file: File): Promise<{
  success: boolean;
  extractedText: string;
  confidence: number;
  fields: Array<{ field: string; value: string; confidence: number }>;
  error?: string;
}> {
  try {
    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result.split(',')[1]); // Strip out base64 header prefix
      };
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });

    console.log("Calling OCR API for:", file.name);

    const { data, error } = await supabase.functions.invoke('document-ocr', {
      body: { image: base64, fileName: file.name },
    });

    if (error) {
      console.error("Supabase Function Error:", error);
      throw new Error(error.message);
    }

    if (!data?.success) {
      throw new Error(data?.error || 'OCR processing failed on the server.');
    }

    return {
      success: true,
      extractedText: data.extractedText || 'No text detected',
      confidence: data.confidence ?? 0,
      fields: data.fields || [],
      error: undefined,
    };
  } catch (error) {
    console.error('OCR Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown OCR error occurred';
    return {
      success: false,
      extractedText: errorMessage,
      confidence: 0,
      fields: [],
      error: errorMessage,
    };
  }
}

// Updated startScan callback using the OCR helper result
const startScan = useCallback(async () => {
  if (!selectedFile) return;

  setIsScanning(true);
  resetResults();

  // Keep existing animation / state setup logic here...

  try {
    const result = await scanDocumentWithOCR(selectedFile);

    if (result.success) {
      setExtractedText(result.extractedText);
      // Populate fields from API if available, else fall back to basic doc info
      setExtractedFields(
        result.fields && result.fields.length > 0
          ? result.fields
          : [
              {
                field: 'Document Type',
                value: 'Student Document',
                confidence: result.confidence,
              },
            ]
      );
    } else {
      setExtractedText(`❌ Error: ${result.error}`);
      setExtractedFields([]);
    }

    setScanComplete(true);
  } catch (error) {
    console.error('Scan error:', error);
    const message = error instanceof Error ? error.message : String(error);
    setExtractedText(`❌ Error: ${message}`);
    setExtractedFields([]);
  } finally {
    setIsScanning(false);
  }
}, [selectedFile]);
