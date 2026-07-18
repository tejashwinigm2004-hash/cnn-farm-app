import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Appearance } from 'react-native';
 
const ThemeContext = createContext(null);
 
const LIGHT_COLORS = {
  background: '#ffffff',
  card: '#f7f7f7',
  border: '#eeeeee',
  text: '#1a1a1a',
  textMuted: 'rgba(0,0,0,0.55)',
  textFaint: 'rgba(0,0,0,0.35)',
  inputBg: '#f7f7f7',
  accent: '#E8A33D',
  danger: '#ff4444',
};
 
const DARK_COLORS = {
  background: '#0a0f1e',
  card: 'rgba(255,255,255,0.06)',
  border: 'rgba(255,255,255,0.1)',
  text: '#ffffff',
  textMuted: 'rgba(255,255,255,0.6)',
  textFaint: 'rgba(255,255,255,0.35)',
  inputBg: 'rgba(255,255,255,0.08)',
  accent: '#E8A33D',
  danger: '#ff6b6b',
};
 
export function ThemeProvider({ children }) {
  const [themePref, setThemePrefState] = useState('system'); // 'light' | 'dark' | 'system'
  const [systemScheme, setSystemScheme] = useState(Appearance.getColorScheme() || 'light');
 
  useEffect(() => {
    (async () => {
      const stored = await AsyncStorage.getItem('themePref');
      if (stored) setThemePrefState(stored);
    })();
 
    const sub = Appearance.addChangeListener(({ colorScheme }) => {
      setSystemScheme(colorScheme || 'light');
    });
    return () => sub.remove();
  }, []);
 
  const setThemePref = async (value) => {
    setThemePrefState(value);
    await AsyncStorage.setItem('themePref', value);
  };
 
  const isDark = themePref === 'system' ? systemScheme === 'dark' : themePref === 'dark';
  const colors = isDark ? DARK_COLORS : LIGHT_COLORS;
 
  const value = useMemo(
    () => ({ themePref, setThemePref, isDark, colors }),
    [themePref, isDark]
  );
 
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
 
export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return ctx;
}