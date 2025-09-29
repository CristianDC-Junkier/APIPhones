import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import MainLayout from '../layouts/MainLayout';
import ExternalLayout from '../layouts/ExternalLayout';

import PublicRoute from '../components/redirect/PublicRoute';
import PrivateRoute from '../components/redirect/PrivateRoute';
import RoleRoute from '../components/redirect/RoleRoute';

import LoginPage from '../pages/Login';
import HomePage from '../pages/Home';
import WorkerList from '../pages/lists/WorkerList';

import NotFoundPage from '../pages/NotFound';
import AccessDeniedPage from '../pages/AccessDenied';

import DashBoardUserPage from '../pages/users/DashboardUser';
import DashboardSystemPage from '../pages/system/DashboardSystem';
import DashboardDepartmentPage from '../pages/department/DashboardDepartment';
import UserProfilePage from '../pages/users/UserProfile';

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
                <Route path="/profile" element={<RoleRoute allowedRoles={['WORKER', 'DEPARTMENT']}><UserProfilePage /></RoleRoute>} />

                <Route path="*" element={<NotFoundPage />} />
            </Route>
            <Route element={<ExternalLayout />}>
                <Route path="/workers" element={<WorkerList />} />
            </Route>

        </Routes>
    );
};

export default AppRouter;
