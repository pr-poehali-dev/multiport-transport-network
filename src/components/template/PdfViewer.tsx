import { useRef, useEffect, forwardRef, useState } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { FieldMapping, TextItemData } from './types';
import * as pdfjsLib from 'pdfjs-dist';

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
    const [editableItems, setEditableItems] = useState<EditableTextItem[]>([]);
    const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

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

    const handleTextChange = (id: string, newText: string) => {
      setEditableItems(items =>
        items.map(item => (item.id === id ? { ...item, text: newText } : item))
      );
    };

    const handleFontSizeChange = (id: string, delta: number) => {
      setEditableItems(items =>
        items.map(item =>
          item.id === id
            ? { ...item, fontSize: Math.max(6, item.fontSize + delta), height: Math.max(6, item.fontSize + delta) }
            : item
        )
      );
    };

    const handleAlignChange = (id: string, align: 'left' | 'center' | 'right') => {
      setEditableItems(items =>
        items.map(item => (item.id === id ? { ...item, align } : item))
      );
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

        // Рендерим PDF на canvas
        await page.render({
          canvasContext: context,
          viewport: viewport,
        }).promise;

        const textContent = await page.getTextContent();
        const items: EditableTextItem[] = [];
        const extractedItems: TextItemData[] = [];

        textContent.items.forEach((item, index) => {
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

            const editableItem: EditableTextItem = {
              id: `text_${index}`,
              text: textItem.str,
              x,
              y,
              width,
              height,
              fontSize,
              fontFamily,
              align: 'left',
            };

            items.push(editableItem);
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

        setEditableItems(items);
        onTextItemsExtracted(extractedItems);
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
            <canvas ref={canvasRef} className="block absolute top-0 left-0 pointer-events-none opacity-30" />

            {/* Редактируемые текстовые элементы */}
            {editableItems.map((item) => (
              <div
                key={item.id}
                className={`absolute cursor-text transition-all ${
                  selectedItemId === item.id ? 'ring-2 ring-blue-400 bg-blue-50/50' : ''
                }`}
                style={{
                  left: item.x * scale,
                  top: item.y * scale,
                  width: item.width * scale,
                  minHeight: item.height * scale,
                }}
                onClick={() => setSelectedItemId(item.id)}
              >
                <div
                  contentEditable
                  suppressContentEditableWarning
                  onInput={(e) => handleTextChange(item.id, e.currentTarget.textContent || '')}
                  className="outline-none px-1 select-text"
                  style={{
                    fontSize: `${item.fontSize}px`,
                    fontFamily: item.fontFamily,
                    textAlign: item.align,
                    lineHeight: `${item.height}px`,
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                  }}
                >
                  {item.text}
                </div>

                {/* Панель инструментов при выборе */}
                {selectedItemId === item.id && (
                  <div className="absolute -top-10 left-0 bg-white border border-border rounded shadow-lg px-2 py-1 flex gap-1 z-10">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 w-7 p-0"
                      onClick={() => handleFontSizeChange(item.id, -1)}
                    >
                      <Icon name="Minus" size={14} />
                    </Button>
                    <span className="text-xs flex items-center px-1">{Math.round(item.fontSize)}px</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 w-7 p-0"
                      onClick={() => handleFontSizeChange(item.id, 1)}
                    >
                      <Icon name="Plus" size={14} />
                    </Button>
                    <div className="w-px bg-border mx-1" />
                    <Button
                      size="sm"
                      variant={item.align === 'left' ? 'default' : 'ghost'}
                      className="h-7 w-7 p-0"
                      onClick={() => handleAlignChange(item.id, 'left')}
                    >
                      <Icon name="AlignLeft" size={14} />
                    </Button>
                    <Button
                      size="sm"
                      variant={item.align === 'center' ? 'default' : 'ghost'}
                      className="h-7 w-7 p-0"
                      onClick={() => handleAlignChange(item.id, 'center')}
                    >
                      <Icon name="AlignCenter" size={14} />
                    </Button>
                    <Button
                      size="sm"
                      variant={item.align === 'right' ? 'default' : 'ghost'}
                      className="h-7 w-7 p-0"
                      onClick={() => handleAlignChange(item.id, 'right')}
                    >
                      <Icon name="AlignRight" size={14} />
                    </Button>
                  </div>
                )}
              </div>
            ))}

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