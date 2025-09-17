import React from 'react';
import logo from '../assets/ayto_almonte.png';

/**
 * Página comodín usada para aparecer en caso de poner una dirección
 * que no ha sido definida en el AppRouter
 */

const NotFound = () => {

    return (
        <div class="row vh-80 d-flex align-items-center justify-content-center">
            <div class="col">
                <img
                    src={logo}
                    alt="Logo Ayto"
                    className="mx-auto d-block"
                    style={{
                        width: "50%"
                    }}
                />
            </div>
            <div class="col">
                <h2 className="text-center" style={{ color: "#dc3545" }}>{"Error 404"}</h2>
                <h3 className="text-center" style={{ color: "#666" }}>{"La página no existe"}</h3>
            </div>
        </div>
    );
};

export default NotFound;