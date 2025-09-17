import React from 'react';

const AccessDenied = () => {

    /**
     * Página que aparece cuando un usuario intenta acceder a una pagína a la que no tiene permisos
     */

    return (
        <div class="row vh-80 d-flex align-items-center justify-content-center">
            <div class="col">
                <img
                    src="/src/assets/ayto_almonte.png"
                    alt="Logo Ayto"
                    class="mx-auto d-block"
                    style={{
                        width: "50%"
                    }}
                />
            </div>
            <div class="col">
                <h2 class="text-center" style={{ color: "#dc3545" }}>{"Error 403"}</h2>
                <h3 class="text-center" style={{ color: "#666" }}>{"No tienes permisos suficientes para acceder a esta página."}</h3>
            </div>
        </div>
    );
};

export default AccessDenied;