import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    base: '/4-cylinder-engine-Simulation/',
    plugins: [react(), tailwindcss()],
    resolve: {
