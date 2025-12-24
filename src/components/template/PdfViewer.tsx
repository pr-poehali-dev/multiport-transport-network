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
    const [editableItems, setEditableItems] = useState<EditableTextItem[]>([]);
    const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
    const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
    const [contextMenu, setContextMenu] = useState<{ x: number; y: number; itemId: string } | null>(null);
    const [textStyles, setTextStyles] = useState<Record<string, { bold?: boolean; italic?: boolean; underline?: boolean; strikethrough?: boolean }>>({});

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

    const handleContextMenu = (e: React.MouseEvent, itemId: string) => {
      e.preventDefault();
      setContextMenu({ x: e.clientX, y: e.clientY, itemId });
    };

    const handleCopyText = () => {
      const selection = window.getSelection();
      if (selection) {
        navigator.clipboard.writeText(selection.toString());
      }
      setContextMenu(null);
    };

    const handleToggleStyle = (itemId: string, style: 'bold' | 'italic' | 'underline' | 'strikethrough') => {
      setTextStyles(prev => ({
        ...prev,
        [itemId]: {
          ...prev[itemId],
          [style]: !prev[itemId]?.[style],
        },
      }));
      setContextMenu(null);
    };

    useEffect(() => {
      const handleClickOutside = () => setContextMenu(null);
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }, []);

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
            className="bg-white rounded-lg border border-border overflow-hidden relative"
            style={{
              width: canvasSize.width || 'auto',
              height: canvasSize.height || 'auto',
              display: canvasSize.width ? 'block' : 'none',
            }}
          >
            <canvas ref={canvasRef} className="hidden" />

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
                  onContextMenu={(e) => handleContextMenu(e, item.id)}
                  className="outline-none px-1 select-text"
                  style={{
                    fontSize: `${item.fontSize}px`,
                    fontFamily: item.fontFamily,
                    textAlign: item.align,
                    lineHeight: `${item.height}px`,
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    fontWeight: textStyles[item.id]?.bold ? 'bold' : 'normal',
                    fontStyle: textStyles[item.id]?.italic ? 'italic' : 'normal',
                    textDecoration: `${textStyles[item.id]?.underline ? 'underline' : ''} ${textStyles[item.id]?.strikethrough ? 'line-through' : ''}`.trim(),
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
                  onClick={() => handleToggleStyle(contextMenu.itemId, 'bold')}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-slate-100 flex items-center gap-2"
                >
                  <Icon name="Bold" size={16} />
                  Полужирный
                </button>
                <button
                  onClick={() => handleToggleStyle(contextMenu.itemId, 'italic')}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-slate-100 flex items-center gap-2"
                >
                  <Icon name="Italic" size={16} />
                  Курсив
                </button>
                <button
                  onClick={() => handleToggleStyle(contextMenu.itemId, 'underline')}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-slate-100 flex items-center gap-2"
                >
                  <Icon name="Underline" size={16} />
                  Подчёркнутый
                </button>
                <button
                  onClick={() => handleToggleStyle(contextMenu.itemId, 'strikethrough')}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-slate-100 flex items-center gap-2"
                >
                  <Icon name="Strikethrough" size={16} />
                  Зачеркнутый
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