import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// ✅ גרסה נקייה ויציבה שמתאימה לכל פרויקט React + Vite
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:5000", // השרת שלך (Express)
        changeOrigin: true, // עוזר לעקוף CORS
        secure: false, // למקרה של HTTP בלבד
      },
    },
  },
});
