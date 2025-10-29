import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import MainLayout from '../layouts/MainLayout';
import ListLayout from '../layouts/ListLayout';

import PublicRoute from './PublicRoute';
import PrivateRoute from './PrivateRoute';
import RoleRoute from './RoleRoute';

import LoginPage from '../pages/Login';
import HomePage from '../pages/Home';
import WorkerListPage from '../pages/lists/WorkerList';
import PublicListPage from '../pages/lists/PublicList';

import NotFoundPage from '../pages/NotFound';
import AccessDeniedPage from '../pages/AccessDenied';

import DashBoardUserPage from '../pages/users/DashboardUser';
import DashboardSystemPage from '../pages/system/DashboardSystem';
import DashboardDepartmentPage from '../pages/department/DashboardDepartment';
import DashboardTicketPage from '../pages/tickets/DashboardTicket'

import ProfileUserPage from '../pages/users/ProfileUser';

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
                <Route path="/" element={<Navigate to="/public" replace />} />
                <Route path="/accessdenied" element={<AccessDeniedPage />} />

                <Route path="/privacity-politic" element={<PrivacityPage />} />
                <Route path="/cookies-politic" element={<CookiesPage />} />
                <Route path="/data-compromise" element={<CompromisePage />} />

                {/* Rutas publicas */}
                <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />

                {/* Rutas privadas */}
                <Route path="/home" element={<PrivateRoute><HomePage /></PrivateRoute>} />
                <Route path="/profile" element={<PrivateRoute><ProfileUserPage /> </PrivateRoute>} />

                {/* Rutas privadas por rol */}
                <Route path="/users" element={<RoleRoute allowedRoles={['ADMIN', 'SUPERADMIN']}><DashBoardUserPage /></RoleRoute>} />
                <Route path="/departments" element={<RoleRoute allowedRoles={['ADMIN', 'SUPERADMIN']}><DashboardDepartmentPage /></RoleRoute>} />
                <Route path="/logs" element={<RoleRoute allowedRoles={['ADMIN', 'SUPERADMIN']}><DashboardSystemPage /></RoleRoute>} />
                <Route path="/tickets" element={<RoleRoute allowedRoles={['ADMIN', 'SUPERADMIN']}><DashboardTicketPage /></RoleRoute>} />

                <Route path="*" element={<NotFoundPage />} />
            </Route>
            <Route element={<ListLayout />}>
                <Route path="/workers" element={<PrivateRoute> <WorkerListPage /> </PrivateRoute>} />
                <Route path="/public" element={<PublicListPage />} />
            </Route>

        </Routes>
    );
};

export default AppRouter;
