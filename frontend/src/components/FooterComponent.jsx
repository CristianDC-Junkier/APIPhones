import React from 'react';

const FooterComponent = () => {

    return (
        <footer className="bg-dark text-white text-center py-2 mt-auto">
            <small>&copy; {new Date().getFullYear()} </small>
            Ayuntamiento de Almonte. Todos los derechos reservados.
        </footer>
    );
}


export default FooterComponent;