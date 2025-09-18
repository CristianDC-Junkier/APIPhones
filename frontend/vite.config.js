import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default () => {

    return defineConfig({
        plugins: [react()],
        server: {
            port: 61938,
            proxy: {
                '/listin-telefonico/api': {
                    target: 'http://localhost:5001',  
                    changeOrigin: true,
                    secure: false,
                },
            },
        },
        base: '/listin-telefonico',
    });
};
