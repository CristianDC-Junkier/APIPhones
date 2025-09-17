import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default () => {

    return defineConfig({
        plugins: [react()],
        server: {
            port: 61938,
            proxy: {
                '/visor-sig/api': {
                    target: 'https://localhost:5000',  
                    changeOrigin: true,
                    secure: false,
                },
            },
        },
        base: '/visor-sig',
    });
};
