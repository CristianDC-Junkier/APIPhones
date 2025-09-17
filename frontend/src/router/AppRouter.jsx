import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import MainLayout from '../layouts/MainLayout';
import ExternalLayout from '../layouts/ExternalLayout';

import PublicRoute from '../components/redirect/PublicRoute';
import PrivateRoute from '../components/redirect/PrivateRoute';
import RoleRoute from '../components/redirect/RoleRoute';


import LoginPage from '../pages/Login';
import HomePage from '../pages/Home';

import NotFoundPage from '../pages/NotFound';
import AccessDenied from '../pages/AccessDenied';

import DashBoardUser from '../pages/users/DashboardUser';
import DashboardSystem from '../pages/system/DashboardSystem';
import ExternalWeb from '../pages/ExternalWeb';

/**
 * Encargado de definir las rutas de acceso a las distintas páginas y
 * limitar su acceso dependiendo de los permisos del usuario
 */

const AppRouter = () => {
    return (
        <Routes>
            <Route element={<MainLayout />}>
                <Route path="/" element={<Navigate to="/login" replace />} />
                <Route path="/accessdenied" element={<AccessDenied />} />
                
                {/* Rutas publicas */}
                <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
                {/* Rutas privadas */}
                
                {/* Rutas privadas por rol */}
                <Route path="/home" element={<RoleRoute allowedRoles={['ADMIN', 'SUPERADMIN']}><HomePage /></RoleRoute>} />
                <Route path="/users" element={<RoleRoute allowedRoles={['ADMIN', 'SUPERADMIN']}><DashBoardUser /></RoleRoute>} />
                <Route path="/logs" element={<RoleRoute allowedRoles={['ADMIN', 'SUPERADMIN']}><DashboardSystem /></RoleRoute>} />

                <Route path="*" element={<NotFoundPage />} />
            </Route>
            <Route element={<ExternalLayout />}>
                <Route path="/app" element={<PrivateRoute><ExternalWeb /></PrivateRoute>} />
            </Route>

        </Routes>
    );
};

export default AppRouter;
