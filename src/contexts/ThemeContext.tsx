import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
}

interface ThemeContextType {
  colors: ThemeColors;
  updateColors: (newColors: ThemeColors) => Promise<void>;
}

const defaultColors: ThemeColors = {
  primary: '#EC4899', // rose-500
  secondary: '#F472B6', // rose-400
  accent: '#FDF2F8', // rose-50
};

const ThemeContext = createContext<ThemeContextType>({
  colors: defaultColors,
  updateColors: async () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [colors, setColors] = useState<ThemeColors>(defaultColors);

  useEffect(() => {
    loadUserTheme();
  }, []);

  useEffect(() => {
    // Atualiza as variáveis CSS quando as cores mudam
    document.documentElement.style.setProperty('--color-primary', colors.primary);
    document.documentElement.style.setProperty('--color-secondary', colors.secondary);
    document.documentElement.style.setProperty('--color-accent', colors.accent);
  }, [colors]);

  async function loadUserTheme() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('user_themes')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Erro ao carregar tema:', error);
        return;
      }

      if (data) {
        setColors({
          primary: data.primary_color,
          secondary: data.secondary_color,
          accent: data.accent_color,
        });
      }
    } catch (error) {
      console.error('Erro ao carregar tema:', error);
    }
  }

  async function updateColors(newColors: ThemeColors) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // First try to update
      const { error: updateError } = await supabase
        .from('user_themes')
        .update({
          primary_color: newColors.primary,
          secondary_color: newColors.secondary,
          accent_color: newColors.accent,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);

      // If update fails because the record doesn't exist, then insert
      if (updateError) {
        const { error: insertError } = await supabase
          .from('user_themes')
          .insert([{
            user_id: user.id,
            primary_color: newColors.primary,
            secondary_color: newColors.secondary,
            accent_color: newColors.accent,
          }]);

        if (insertError) {
          console.error('Erro ao salvar tema:', insertError);
          return;
        }
      }

      setColors(newColors);
    } catch (error) {
      console.error('Erro ao salvar tema:', error);
    }
  }

  return (
    <ThemeContext.Provider value={{ colors, updateColors }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);