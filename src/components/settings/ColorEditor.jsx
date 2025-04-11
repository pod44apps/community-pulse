import React from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export default function ColorEditor({ label, description, colorKey, value, onChange }) {
  // Default color values from the uploaded color scheme
  const getDefaultColor = () => {
    const colorDefaults = {
      primary: '#339085',
      secondary: '#7ABFAB',
      accent: '#6B4F4F',
      background: '#EDEAE4',
      muted: '#EDD6B3',
      foreground: '#905B40',
      highlight: '#CC7A2F',
      neutral: '#C7A671',
      sectionBg: '#FFFFFF'
    };
    
    return colorDefaults[colorKey] || '#000000';
  };
  
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor={`color-${colorKey}`} className="font-medium">{label}</Label>
        <div className="flex items-center gap-2">
          <div 
            className="h-6 w-6 rounded-full border border-gray-300" 
            style={{ backgroundColor: value || getDefaultColor() }}
          ></div>
          <span className="text-xs font-mono text-gray-500">{value || getDefaultColor()}</span>
        </div>
      </div>
      
      <p className="text-xs text-gray-500 mb-1">{description}</p>
      
      <div className="flex space-x-2">
        <Input
          id={`color-${colorKey}`}
          type="color"
          value={value || getDefaultColor()}
          onChange={(e) => onChange(e.target.value)}
          className="w-12 h-8 p-1 border rounded"
        />
        <Input
          type="text"
          value={value || getDefaultColor()}
          onChange={(e) => onChange(e.target.value)}
          className="flex-grow"
          placeholder="#000000"
          pattern="^#[0-9A-Fa-f]{6}$"
        />
        <button
          type="button"
          onClick={() => onChange(getDefaultColor())}
          className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded border border-gray-300 transition-colors"
        >
          Reset
        </button>
      </div>
      
      <div className="text-xs text-gray-500 mt-1">
        CSS Variable: <span className="font-mono">--{colorKey}</span>
      </div>
    </div>
  );
}