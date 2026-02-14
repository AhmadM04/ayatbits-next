const config = {
  plugins: {
    "@tailwindcss/postcss": {
      // Point to our tailwind.config.ts for darkMode: 'class' setting
      config: './tailwind.config.ts',
    },
  },
};

export default config;
