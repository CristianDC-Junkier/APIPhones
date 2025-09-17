import React from 'react';
import './styles/Global.css';

import { AuthProvider } from './context/AuthContext';

import AppRouter from './router/AppRouter';

const App = () => {
    return (
        <AuthProvider>
            <AppRouter />
        </AuthProvider>
    );
};

export default App;
