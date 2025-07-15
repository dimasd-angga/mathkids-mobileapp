import React, { createContext, useContext, ReactNode } from 'react';
import { Text, TextProps, View, ViewProps } from 'react-native';

interface Theme {
  colors: Record<string, string>;
  fonts: {
    regular: string;
    bold: string;
    arial: string;
  };
}

const ThemeContext = createContext<Theme>({
  colors: {},
  fonts: {
    regular: '',
    bold: '',
    arial: '',
  },
});

const themeValues: Theme = {
  colors: {
    primary: '#00B3FF',
    secondary: '#FF3278',
    accent: '#FF7561',
    green: '#00BB98',
    blue: '#0082FC',
    yellow: '#FFF200',
    yellowLight: '#FFFFBE',
    background: '#FFFFFF',
    text: '#333333',
    error: '#FF3B30',
  },
  fonts: {
    regular: 'CooperBlack',
    bold: 'CooperBlack',
    arial: 'Arial',

  },
};

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  return <ThemeContext.Provider value={themeValues}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => useContext(ThemeContext);

export const ThemedText: React.FC<TextProps & { variant?: 'regular' | 'bold' | 'title' }> = ({
  children,
  variant = 'regular',
  className = '',
  style,
  ...props
}) => {
  const theme = useTheme();

  return (
    <Text
      className={` ${className}`}
      style={[{ fontFamily: theme.fonts.regular }, style]}
      {...props}
    >
      {children}
    </Text>
  );
};
