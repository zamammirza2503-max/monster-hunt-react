import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/monster-hunt-react/",
  plugins: [react()],
});