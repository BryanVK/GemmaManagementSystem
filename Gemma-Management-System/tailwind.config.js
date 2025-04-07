import daisyui from "daisyui";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"], // Sesuaikan dengan path file proyek
  theme: {
    extend: {},
  },
  plugins: [daisyui], // Memasukkan plugin DaisyUI
  daisyui: {
    themes: ["light"], // Daftar tema yang ingin digunakan
  },
};
