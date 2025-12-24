import { useRef, useEffect, forwardRef, useState } from 'react';
import Icon from '@/components/ui/icon';
import { FieldMapping, TextItemData } from './types';
import * as pdfjsLib from 'pdfjs-dist';
import 'pdfjs-dist/web/pdf_viewer.css';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

interface PdfViewerProps {
  file: File | null;
  scale: number;
  fieldMappings: FieldMapping[];
  onAssignClick: () => void;
  onTextItemsExtracted: (items: TextItemData[]) => void;
  onSelectionChange: (hasSelection: boolean) => void;
}

const PdfViewer = forwardRef<HTMLDivElement, PdfViewerProps>(
  (
    {
      file,
      scale,
      fieldMappings,
      onAssignClick,
      onTextItemsExtracted,
      onSelectionChange,
    },
    containerRef
  ) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const textLayerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      if (file) {
        loadPdf();
      }
    }, [file, scale]);

    useEffect(() => {
      const handleSelectionChange = () => {
        const selection = window.getSelection();
        const hasText = selection && selection.toString().length > 0;
        onSelectionChange(!!hasText);
      };

      document.addEventListener('selectionchange', handleSelectionChange);
      return () => document.removeEventListener('selectionchange', handleSelectionChange);
    }, [onSelectionChange]);

    const loadPdf = async () => {
      if (!file || !canvasRef.current || !textLayerRef.current) return;

      try {
        const arrayBuffer = await file.arrayBuffer();
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;

        const page = await pdf.getPage(1);
        const viewport = page.getViewport({ scale });
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');

        if (!context) return;

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        // Рендерим PDF на canvas
        await page.render({
          canvasContext: context,
          viewport: viewport,
        }).promise;

        // Создаём текстовый слой
        const textContent = await page.getTextContent();
        const textLayer = textLayerRef.current;
        textLayer.innerHTML = '';
        textLayer.style.width = `${viewport.width}px`;
        textLayer.style.height = `${viewport.height}px`;

        const items: TextItemData[] = [];

        textContent.items.forEach((item) => {
          if ('str' in item && 'transform' in item) {
            const textItem = item as any;
            const tx = textItem.transform[4];
            const ty = textItem.transform[5];
            const fontSize = Math.abs(textItem.transform[0]);
            const fontFamily = textItem.fontName || 'sans-serif';

            const x = tx;
            const y = viewport.height - ty;
            const width = textItem.width * scale;
            const height = fontSize;

            // Создаём элемент для каждого текстового блока
            const span = document.createElement('span');
            span.textContent = textItem.str;
            span.style.position = 'absolute';
            span.style.left = `${x}px`;
            span.style.top = `${y - height}px`;
            span.style.fontSize = `${fontSize}px`;
            span.style.fontFamily = fontFamily;
            span.style.whiteSpace = 'pre';
            span.style.transformOrigin = 'left bottom';
            span.style.transform = `scaleX(${textItem.width / (textItem.str.length * fontSize * 0.6)})`;
            
            textLayer.appendChild(span);

            items.push({
              text: textItem.str,
              x,
              y: y - height,
              width,
              height,
              fontSize,
              fontFamily,
            });
          }
        });

        onTextItemsExtracted(items);
      } catch (error) {
        console.error('Error loading PDF:', error);
      }
    };

    if (!file) {
      return (
        <div className="flex-1 overflow-y-auto bg-slate-50">
          <div className="p-4 lg:p-6">
            <div className="bg-white rounded-lg border border-border p-20 text-center">
              <Icon name="FileText" size={48} className="mx-auto mb-4 opacity-20" />
              <p className="text-muted-foreground">PDF не загружен</p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="flex-1 overflow-y-auto bg-slate-50">
        <div className="p-4 lg:p-6">
          <div
            ref={containerRef}
            className="bg-white rounded-lg border border-border overflow-hidden relative inline-block"
          >
            <canvas
              ref={canvasRef}
              className="block"
            />

            {/* Текстовый слой для выделения */}
            <div
              ref={textLayerRef}
              className="absolute top-0 left-0 text-transparent select-text"
              style={{ 
                mixBlendMode: 'multiply',
                userSelect: 'text',
              }}
            />

            {/* Маркеры назначенных полей */}
            {fieldMappings.map((mapping) => (
              <div
                key={mapping.id}
                className="absolute pointer-events-none border-2 border-[#0ea5e9] rounded bg-[#0ea5e9]/10"
                style={{
                  left: mapping.x * scale,
                  top: mapping.y * scale,
                  width: mapping.width * scale,
                  height: mapping.height * scale,
                }}
              >
                <div className="text-xs font-medium text-[#0ea5e9] px-2 truncate" style={{ lineHeight: `${mapping.height * scale}px` }}>
                  {mapping.fieldLabel}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
);

PdfViewer.displayName = 'PdfViewer';

export default PdfViewer;
