import { faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button } from 'reactstrap';

import '../../styles/user/UserComponents.css';


/**
 * Botón de cierre de sesión.
 *
 * Props:
 * - onClick: Función que se ejecuta al hacer clic en el botón.
 * - loading: Boolean que indica si la acción está en proceso, deshabilitando el botón.
 *
 */
const LogoutButtonComponent = ({ onClick, loading }) => {
    return (
        <Button
            onClick={onClick}
            disabled={loading}
            className="logout-button btn btn-danger"
            style={{ cursor: loading ? 'not-allowed' : 'pointer' }}
        >
            <div className="logout-content">
                <FontAwesomeIcon icon={faSignOutAlt} color="white" />
                <span className="logout-text">Cerrar sesión</span>
            </div>
        </Button>
    );
};

export default LogoutButtonComponent;
