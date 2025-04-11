
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Settings } from '@/api/entities';

const ThemeContext = createContext({
  theme: null,
  setTheme: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}

function adjustColor(color, amount) {
  return '#' + color.replace(/^#/, '').replace(/../g, color => 
    ('0' + Math.min(255, Math.max(0, parseInt(color, 16) + amount)).toString(16)).substr(-2)
  );
}

export default function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(null);

  useEffect(() => {
    async function loadTheme() {
      try {
        const settings = await Settings.list();
        if (settings.length > 0) {
          const root = document.documentElement;
          const colors = settings[0].custom_colors || {
            primary: '#339085',
            secondary: '#7ABFAB',
            accent: '#684F4F',
            background: '#EDEAE4',
            muted: '#EDD6B3',
            foreground: '#905B40',
            highlight: '#CC7A2F',
            neutral: '#C7A671',
            sectionBg: '#FFFFFF'
          };
          
          // Make sure background color is always set
          document.body.style.backgroundColor = '#EDEAE4';
          root.style.setProperty('--background', '#EDEAE4');
          
          // Set other colors
          Object.entries(colors).forEach(([key, value]) => {
            if (key !== 'background') { // Skip background as we set it above
              root.style.setProperty(`--${key}`, value);
            }
            
            // Set derived colors
            if (key === 'primary') {
              root.style.setProperty('--primary-hover', adjustColor(value, -20));
            }
            if (key === 'accent') {
              root.style.setProperty('--accent-hover', adjustColor(value, -20));
            }
            if (key === 'muted') {
              root.style.setProperty('--muted-hover', adjustColor(value, -10));
            }
            if (key === 'sectionBg') {
              root.style.setProperty('--card-hover', adjustColor(value, -5));
            }
          });

          setTheme(colors);
        }
      } catch (error) {
        console.error('Error loading theme:', error);
      }
    }

    loadTheme();
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
