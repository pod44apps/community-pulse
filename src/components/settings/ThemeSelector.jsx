
import React from 'react';
import { Check } from "lucide-react";

const THEME_COLORS = {
  'purple-sage': {
    name: 'Purple Sage',
    colors: {
      primary: '#339085',
      secondary: '#7ABFAB',
      accent: '#684F4F',
      background: '#EDEAE4',
      muted: '#EDD6B3',
      foreground: '#905B40',
      highlight: '#CC7A2F',
      neutral: '#C7A671',
      sectionBg: '#FFFFFF'
    }
  }
};

export default function ThemeSelector({ selectedTheme, onThemeSelect }) {
  return (
    <div className="space-y-4">
      {Object.entries(THEME_COLORS).map(([key, theme]) => (
        <div 
          key={key}
          className={`p-4 rounded-lg border cursor-pointer ${
            selectedTheme === key ? 'ring-2 ring-[#339085]' : ''
          }`}
          onClick={() => onThemeSelect(key)}
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">{theme.name}</h3>
            {selectedTheme === key && (
              <div className="bg-[#339085] text-white p-1 rounded-full">
                <Check className="h-4 w-4" />
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-3 gap-2">
            <div>
              <div 
                className="h-12 rounded-md mb-1"
                style={{ backgroundColor: theme.colors.primary }}
              />
              <p className="text-xs text-gray-600">primary</p>
              <p className="text-xs font-mono text-gray-500">{theme.colors.primary}</p>
            </div>
            <div>
              <div 
                className="h-12 rounded-md mb-1"
                style={{ backgroundColor: theme.colors.secondary }}
              />
              <p className="text-xs text-gray-600">secondary</p>
              <p className="text-xs font-mono text-gray-500">{theme.colors.secondary}</p>
            </div>
            <div>
              <div 
                className="h-12 rounded-md mb-1"
                style={{ backgroundColor: theme.colors.accent }}
              />
              <p className="text-xs text-gray-600">accent</p>
              <p className="text-xs font-mono text-gray-500">{theme.colors.accent}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-2 mt-2">
            <div>
              <div 
                className="h-12 rounded-md mb-1"
                style={{ backgroundColor: theme.colors.background }}
              />
              <p className="text-xs text-gray-600">background</p>
              <p className="text-xs font-mono text-gray-500">{theme.colors.background}</p>
            </div>
            <div>
              <div 
                className="h-12 rounded-md mb-1"
                style={{ backgroundColor: theme.colors.muted }}
              />
              <p className="text-xs text-gray-600">muted</p>
              <p className="text-xs font-mono text-gray-500">{theme.colors.muted}</p>
            </div>
            <div>
              <div 
                className="h-12 rounded-md mb-1"
                style={{ backgroundColor: theme.colors.foreground }}
              />
              <p className="text-xs text-gray-600">foreground</p>
              <p className="text-xs font-mono text-gray-500">{theme.colors.foreground}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-2 mt-2">
            <div>
              <div 
                className="h-12 rounded-md mb-1"
                style={{ backgroundColor: theme.colors.highlight }}
              />
              <p className="text-xs text-gray-600">highlight</p>
              <p className="text-xs font-mono text-gray-500">{theme.colors.highlight}</p>
            </div>
            <div>
              <div 
                className="h-12 rounded-md mb-1"
                style={{ backgroundColor: theme.colors.neutral }}
              />
              <p className="text-xs text-gray-600">neutral</p>
              <p className="text-xs font-mono text-gray-500">{theme.colors.neutral}</p>
            </div>
            <div>
              <div 
                className="h-12 rounded-md mb-1 border"
                style={{ backgroundColor: theme.colors.sectionBg }}
              />
              <p className="text-xs text-gray-600">sectionBg</p>
              <p className="text-xs font-mono text-gray-500">{theme.colors.sectionBg}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
