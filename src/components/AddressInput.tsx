import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import { suggestAddresses, AddressSuggestion } from '@/api/dadata';

interface AddressInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  disabled?: boolean;
}

export default function AddressInput({ value, onChange, placeholder, disabled }: AddressInputProps) {
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (newValue: string) => {
    onChange(newValue);
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (newValue.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    timeoutRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const response = await suggestAddresses(newValue);
        setSuggestions(response.suggestions);
        setShowSuggestions(true);
      } catch (error) {
        console.error('Ошибка получения подсказок:', error);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 500);
  };

  const handleSelectSuggestion = (suggestion: AddressSuggestion) => {
    onChange(suggestion.value);
    setShowSuggestions(false);
    setSuggestions([]);
  };

  return (
    <div className="relative" ref={inputRef}>
      <Input
        value={value}
        onChange={(e) => handleInputChange(e.target.value)}
        onFocus={() => {
          if (suggestions.length > 0) {
            setShowSuggestions(true);
          }
        }}
        placeholder={placeholder}
        disabled={disabled}
      />
      
      {loading && (
        <Icon 
          name="Loader2" 
          size={16} 
          className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-muted-foreground" 
        />
      )}

      {showSuggestions && suggestions.length > 0 && !disabled && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-border rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleSelectSuggestion(suggestion)}
              className="w-full text-left px-3 py-2 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0"
            >
              <div className="font-medium text-sm">{suggestion.value}</div>
              {suggestion.city && suggestion.region && (
                <div className="text-xs text-muted-foreground">
                  {suggestion.city}, {suggestion.region}
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
