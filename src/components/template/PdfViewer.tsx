import { useRef, useEffect, forwardRef, useState } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { FieldMapping, TextItemData } from './types';
import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

// Подавляем предупреждения о шрифтах
const originalConsoleWarn = console.warn;
console.warn = (...args: any[]) => {
  if (args[0]?.includes?.('TT: undefined function')) return;
  originalConsoleWarn(...args);
};

interface PdfViewerProps {
  file: File | null;
  scale: number;
  fieldMappings: FieldMapping[];
  onAssignClick: () => void;
  onTextItemsExtracted: (items: TextItemData[]) => void;
  onSelectionChange: (hasSelection: boolean) => void;
}

interface EditableTextItem extends TextItemData {
  id: string;
  align: 'left' | 'center' | 'right';
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
    const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
    const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);

    useEffect(() => {
      if (file) {
        loadPdf();
      }
    }, [file, scale]);

    useEffect(() => {
      const handleSelectionChange = () => {
        const selection = window.getSelection();
        const hasSelection = selection && selection.toString().length > 0;
        onSelectionChange(hasSelection);
      };

      const handleClickOutside = () => setContextMenu(null);
      
      document.addEventListener('selectionchange', handleSelectionChange);
      document.addEventListener('click', handleClickOutside);
      
      return () => {
        document.removeEventListener('selectionchange', handleSelectionChange);
        document.removeEventListener('click', handleClickOutside);
      };
    }, [onSelectionChange]);

    const handleContextMenu = (e: React.MouseEvent) => {
      e.preventDefault();
      const selection = window.getSelection();
      const hasSelection = selection && selection.toString().length > 0;
      onSelectionChange(hasSelection);
      if (hasSelection) {
        setContextMenu({ x: e.clientX, y: e.clientY });
      }
    };

    const handleCopyText = () => {
      const selection = window.getSelection();
      if (selection) {
        navigator.clipboard.writeText(selection.toString());
      }
      setContextMenu(null);
    };

    const loadPdf = async () => {
      if (!file || !canvasRef.current) return;

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
        setCanvasSize({ width: viewport.width, height: viewport.height });

        // Рендерим PDF на canvas
        await page.render({
          canvasContext: context,
          viewport: viewport,
        }).promise;

        const textContent = await page.getTextContent();
        const extractedItems: TextItemData[] = [];

        textContent.items.forEach((item) => {
          if ('str' in item && 'transform' in item) {
            const textItem = item as any;
            const tx = textItem.transform[4];
            const ty = textItem.transform[5];
            const fontSize = Math.abs(textItem.transform[0]);
            const fontFamily = textItem.fontName || 'sans-serif';

            const x = tx;
            const y = viewport.height - ty - fontSize;
            const width = textItem.width * scale;
            const height = fontSize;

            extractedItems.push({
              text: textItem.str,
              x,
              y,
              width,
              height,
              fontSize,
              fontFamily,
            });
          }
        });

        onTextItemsExtracted(extractedItems);

        // Рендерим текстовый слой для выделения
        if (textLayerRef.current) {
          textLayerRef.current.innerHTML = '';
          textLayerRef.current.style.width = `${viewport.width}px`;
          textLayerRef.current.style.height = `${viewport.height}px`;

          textContent.items.forEach((item) => {
            if ('str' in item && 'transform' in item) {
              const textItem = item as any;
              const tx = textItem.transform[4];
              const ty = textItem.transform[5];
              const fontSize = Math.abs(textItem.transform[0]);

              const textDiv = document.createElement('span');
              textDiv.textContent = textItem.str;
              textDiv.style.position = 'absolute';
              textDiv.style.left = `${tx}px`;
              textDiv.style.top = `${viewport.height - ty - fontSize}px`;
              textDiv.style.fontSize = `${fontSize}px`;
              textDiv.style.fontFamily = textItem.fontName || 'sans-serif';
              textDiv.style.color = 'transparent';
              textDiv.style.whiteSpace = 'pre';
              textLayerRef.current.appendChild(textDiv);
            }
          });
        }
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
            className="bg-white rounded-lg border border-border overflow-hidden relative select-text"
            style={{
              width: canvasSize.width || 'auto',
              height: canvasSize.height || 'auto',
              display: canvasSize.width ? 'block' : 'none',
            }}
            onContextMenu={handleContextMenu}
          >
            <canvas ref={canvasRef} className="block" />
            
            {/* Прозрачный текстовый слой для выделения */}
            <div
              ref={textLayerRef}
              className="absolute top-0 left-0 select-text pointer-events-auto"
              style={{ userSelect: 'text' }}
            />

            {/* Плейсхолдеры назначенных полей (заменяют текст) */}
            {fieldMappings.map((mapping) => (
              <div
                key={mapping.id}
                className="absolute pointer-events-none"
                style={{
                  left: mapping.x * scale,
                  top: mapping.y * scale,
                  width: mapping.width * scale,
                  height: mapping.height * scale,
                  backgroundColor: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: mapping.align === 'center' ? 'center' : mapping.align === 'right' ? 'flex-end' : 'flex-start',
                  paddingLeft: '4px',
                  paddingRight: '4px',
                  textAlign: mapping.align || 'left',
                  flexWrap: mapping.wordWrap ? 'wrap' : 'nowrap',
                  overflow: 'hidden',
                }}
              >
                <span
                  className="font-medium text-[#0ea5e9]"
                  style={{
                    fontSize: `${(mapping.fontSize || 12) * scale}px`,
                    fontFamily: mapping.fontFamily || 'Arial',
                    wordBreak: mapping.wordWrap ? 'break-word' : 'normal',
                    textAlign: mapping.align || 'left',
                    width: '100%',
                  }}
                >
                  &lt;{mapping.fieldLabel}&gt;
                </span>
              </div>
            ))}

            {/* Контекстное меню */}
            {contextMenu && (
              <div
                className="fixed bg-white border border-border rounded-lg shadow-xl py-1 z-50 min-w-56"
                style={{ left: contextMenu.x, top: contextMenu.y }}
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={handleCopyText}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-slate-100 flex items-center gap-2"
                >
                  <Icon name="Copy" size={16} />
                  Копировать
                </button>
                <button
                  onClick={handleCopyText}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-slate-100 flex items-center gap-2"
                >
                  <Icon name="FileText" size={16} />
                  Копировать с форматированием
                </button>
                <div className="h-px bg-border my-1" />

                <button
                  onClick={onAssignClick}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-slate-100 flex items-center gap-2 text-[#0ea5e9]"
                >
                  <Icon name="Link" size={16} />
                  Назначить поле
                </button>
                <button
                  className="w-full px-4 py-2 text-left text-sm hover:bg-slate-100 flex items-center gap-2"
                  onClick={() => setContextMenu(null)}
                >
                  <Icon name="MessageSquare" size={16} />
                  Добавить комментарий
                </button>
                <button
                  className="w-full px-4 py-2 text-left text-sm hover:bg-slate-100 flex items-center gap-2"
                  onClick={() => setContextMenu(null)}
                >
                  <Icon name="Bookmark" size={16} />
                  Добавить закладку
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
);

PdfViewer.displayName = 'PdfViewer';

export default PdfViewer;