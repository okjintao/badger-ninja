module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'media',
  theme: {
    extend: {
      colors: {
        mint: '#3bba9c',
        deepsea: '#2e3047',
        foam: '#707793',
        calm: '#43455c',
        badger: '#FFB84D',
        electric: '#04b0e1',
        slate: '#404040',
        cave: '#121212',
        card: '#262626',
        sea: '#91CDFF',
      },
    },
  },
  variants: {
    extend: {
      opacity: ['disabled'],
      cursor: ['disabled'],
    },
  },
  plugins: [],
};
