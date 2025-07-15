/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './App.{js,jsx,ts,tsx}',
    './src/**/*.{js,jsx,ts,tsx}',
    './src/components/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      borderWidth: {
        3: '3px',
      },
      colors: {
        primary: '#00B3FF',
        secondary: '#FF3278',
        accent: '#FF7561',
        yellow: {
          light: '#FFFFBE',
          DEFAULT: '#FFF200',
        },
        green: '#00BB98',
        blue: '#0082FC',
      },
      fontFamily: {
        cooper: ['CooperBlack'],
        arial: ['Arial'],

      },
    },
  },
  plugins: [],
};
