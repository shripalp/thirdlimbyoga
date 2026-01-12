/** @type {import('tailwindcss').Config} */
const config = {
  content: ["./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#5B6D5B",
        secondary: "#E6EFE6",
        accent: "#C89F63",
      },
    },
  },
  plugins: [],
};

export default config;
