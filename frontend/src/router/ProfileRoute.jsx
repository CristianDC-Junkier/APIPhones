import { useAuth } from "../hooks/useAuth";
import WorkerProfilePage from "../pages/users/WorkerProfile";
import AdminProfilePage from "../pages/users/AdminProfile";
import Spinner from '../components/utils/SpinnerComponent';

const ChooseProfileRoute = () => {
    const { user, loading } = useAuth();

    // Mientras no hay usuario, mostramos el spinner
    if (loading || !user) return <Spinner />;

    return user.usertype === 'WORKER'
        ? <WorkerProfilePage />
        : <AdminProfilePage />;
};

export default ChooseProfileRoute;
