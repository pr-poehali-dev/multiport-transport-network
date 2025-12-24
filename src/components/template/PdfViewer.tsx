import { useRef, useEffect, forwardRef } from 'react';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { FieldMapping, TextItemData } from './types';
import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

interface PdfViewerProps {
  file: File | null;
  scale: number;
  fieldMappings: FieldMapping[];
  isSelecting: boolean;
  selectionStart: { x: number; y: number };
  selectionEnd: { x: number; y: number };
  hasSelection: boolean;
  selectedTextItems: number[];
  textItems: TextItemData[];
  onMouseDown: (event: React.MouseEvent<HTMLCanvasElement>) => void;
  onMouseMove: (event: React.MouseEvent<HTMLCanvasElement>) => void;
  onMouseUp: () => void;
  onAssignClick: () => void;
  onTextItemsExtracted: (items: TextItemData[]) => void;
}

const PdfViewer = forwardRef<HTMLCanvasElement, PdfViewerProps>(
  (
    {
      file,
      scale,
      fieldMappings,
      isSelecting,
      selectionStart,
      selectionEnd,
      hasSelection,
      selectedTextItems,
      textItems,
      onMouseDown,
      onMouseMove,
      onMouseUp,
      onAssignClick,
      onTextItemsExtracted,
    },
    canvasRef
  ) => {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      if (file && canvasRef && typeof canvasRef !== 'function') {
        loadPdf();
      }
    }, [file]);

    const loadPdf = async () => {
      if (!file || !canvasRef || typeof canvasRef === 'function' || !canvasRef.current) return;

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

        await page.render({
          canvasContext: context,
          viewport: viewport,
        }).promise;

        // Извлекаем текстовые элементы
        const textContent = await page.getTextContent();
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
              onMouseDown={onMouseDown}
              onMouseMove={onMouseMove}
              onMouseUp={onMouseUp}
              className="block"
            />





            {/* Подсветка выделенных текстовых элементов */}
            {selectedTextItems.map((itemIndex) => {
              const item = textItems[itemIndex];
              return (
                <div
                  key={itemIndex}
                  className="absolute bg-[#0ea5e9]/30 pointer-events-none"
                  style={{
                    left: item.x * scale,
                    top: item.y * scale,
                    width: item.width * scale,
                    height: item.height * scale,
                  }}
                />
              );
            })}

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