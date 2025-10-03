import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import MainLayout from '../layouts/MainLayout';
import ExternalLayout from '../layouts/ExternalLayout';

import PublicRoute from './PublicRoute';
import PrivateRoute from './PrivateRoute';
import RoleRoute from './RoleRoute';
import ProfileRoute from './ProfileRoute';

import LoginPage from '../pages/Login';
import HomePage from '../pages/Home';
import WorkerListPage from '../pages/lists/WorkerList';
import PublicListPage from '../pages/lists/PublicList';

import NotFoundPage from '../pages/NotFound';
import AccessDeniedPage from '../pages/AccessDenied';

import DashBoardUserPage from '../pages/users/DashboardUser';
import DashboardSystemPage from '../pages/system/DashboardSystem';
import DashboardDepartmentPage from '../pages/department/DashboardDepartment';


import PrivacityPage from '../pages/politics/Privacity';
import CookiesPage from '../pages/politics/Cookies';
import CompromisePage from '../pages/politics/Compromise';

/**
 * Encargado de definir las rutas de acceso a las distintas páginas y
 * limitar su acceso dependiendo de los permisos del usuario
 */

const AppRouter = () => {
    return (
        <Routes>
            <Route element={<MainLayout />}>
                <Route path="/" element={<Navigate to="/login" replace />} />
                <Route path="/accessdenied" element={<AccessDeniedPage />} />

                <Route path="/privacity-politic" element={<PrivacityPage />} />
                <Route path="/cookies-politic" element={<CookiesPage />} />
                <Route path="/data-compromise" element={<CompromisePage />} />

                {/* Rutas publicas */}
                <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />

                {/* Rutas privadas */}
                <Route path="/home" element={<PrivateRoute><HomePage /></PrivateRoute>} />

                {/* Rutas privadas por rol */}
                <Route path="/users" element={<RoleRoute allowedRoles={['ADMIN', 'SUPERADMIN', 'DEPARTMENT']}><DashBoardUserPage /></RoleRoute>} />
                <Route path="/departments" element={<RoleRoute allowedRoles={['ADMIN', 'SUPERADMIN', 'DEPARTMENT']}><DashboardDepartmentPage /></RoleRoute>} />
                <Route path="/logs" element={<RoleRoute allowedRoles={['ADMIN', 'SUPERADMIN']}><DashboardSystemPage /></RoleRoute>} />
                {/* Rutas de perfil*/}
                <Route path="/profile" element={<PrivateRoute><ProfileRoute /> </PrivateRoute>} />

                <Route path="*" element={<NotFoundPage />} />
            </Route>
            <Route element={<ExternalLayout />}>
                <Route path="/workers" element={<WorkerListPage />} />
                <Route path="/public" element={<PublicListPage /> } />
            </Route>

        </Routes>
    );
};

export default AppRouter;
