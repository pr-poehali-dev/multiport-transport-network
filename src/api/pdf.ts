import funcUrls from '../../backend/func2url.json';

const GENERATE_PDF_URL = funcUrls['generate-pdf'];

export interface GeneratePdfRequest {
  templateId: number;
  contractId: number;
}

export interface GeneratePdfResponse {
  success: boolean;
  message: string;
  pdfData: string;
  fileName: string;
}

export async function generatePdf(request: GeneratePdfRequest): Promise<GeneratePdfResponse> {
  const response = await fetch(GENERATE_PDF_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Не удалось сгенерировать PDF');
  }

  return response.json();
}

export function openPdfInNewTab(pdfData: string) {
  const byteCharacters = atob(pdfData);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  const blob = new Blob([byteArray], { type: 'application/pdf' });
  
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank');
}