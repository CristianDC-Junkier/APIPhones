import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { Container, Row, Col, Card, CardBody, CardTitle, CardText, Button } from "reactstrap";

import { useAuth } from "../../hooks/useAuth";
import { modifyUser, deleteUser } from "../../services/UserService";
import BackButton from "../../components/utils/BackButtonComponent";


const UserProfile = () => {
    const navigate = useNavigate();
    const { user, token, logout } = useAuth();

    const handleError = (result) => {
        if (result.error.response?.data?.message === "Token inválido") {
            return true;
        }
        return false;
    };

    const handleModify = async () => {
        /*const tipos = [
            { label: 'Usuario', value: 'USER' },
            { label: 'Administrador', value: 'ADMIN' }
        ];
        if (currentUser.usertype === 'SUPERADMIN') {
            tipos.push({ label: 'SuperAdmin', value: 'SUPERADMIN' });
        }

        const optionsHtml = tipos
            .map(tipo => `<option value="${tipo.value}" ${userItem.usertype === tipo.value ? 'selected' : ''}>${tipo.label}</option>`)
            .join('');*/

        const { value: formValues } = await Swal.fire({
            title: 'Modificar Usuario',
            html: `
                <select id="swal-department" class="swal2-select">${"optionsHtml"}</select>
                <select id="swal-subdepartment" class="swal2-select">${"optionsHtml"}</select>

                <input id="swal-username" class="swal2-input" placeholder="Usuario" value="${user.username}">
                <input id="swal-email" class="swal2-input" placeholder="Email" value="${""}">
                <input id="swal-name" class="swal2-input" placeholder="Nombre" value="${""}">
                <input id="swal-number" class="swal2-input" placeholder="Teléfono" value="${""}">
                <input id="swal-extension" class="swal2-input" placeholder="Extensión" value="${""}">
                
                <style>
                    .swal2-input, .swal2-select {
                        width: 100%;
                        padding: 0.5em 0.75em;
                        margin: 0.25em 0;
                        border: 1px solid #333;
                        border-radius: 0.25em;
                        font-size: 1em;
                    }
                    .swal2-select {
                        margin-bottom: 1em;
                        appearance: none;
                        background-color: #fff;
                    }
                </style>`,
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: 'Aceptar',
            cancelButtonText: 'Cancelar',
            preConfirm: () => {
                const username = document.getElementById('swal-username').value.trim();
                const email = document.getElementById('swal-email').value.trim();
                const name = document.getElementById('swal-name').value.trim();
                const number = document.getElementById('swal-number').value.trim();
                const extension = document.getElementById('swal-extension').value.trim();

                const department = document.getElementById('swal-department').value;
                const subdepartment = document.getElementById('swal-subdepartment').value;

                if (!username) {
                    Swal.showValidationMessage('El nombre de usuario no puede estar vacío');
                    return false;
                }
                if (!email) {
                    Swal.showValidationMessage('El email no puede estar vacío');
                    return false;
                }
                if (!name) {
                    Swal.showValidationMessage('El nombre no puede estar vacío');
                    return false;
                }
                if (!number) {
                    Swal.showValidationMessage('El teléfono no puede estar vacío');
                    return false;
                }
                if (!extension) {
                    Swal.showValidationMessage('La extensión no puede estar vacía');
                    return false;
                }

                return { username, email, name, number, extension, department, subdepartment };
            }
        });

        if (formValues) {
            const result = await modifyUser({ //comprobar funcion
                id: user.id,
                username: formValues.username,
                email: formValues.email,
                name: formValues.name,
                number: formValues.number,
                extension: formValues.extension,
                department: formValues.department,
                subdepartment: formValues.subdepartment
            }, token);

            if (result.success) {
                Swal.fire('Éxito', 'Perfil modificado correctamente', 'success');
                await logout();
                navigate('/login')

            } else {
                if (handleError(result)) {
                    Swal.fire('Error', 'El tiempo de acceso caducó, reinicie sesión', 'error')
                        .then(() => {
                            logout();
                            navigate('/login');
                        });
                    return;
                }
                else {
                    Swal.fire('Error', 'No se pudo modificar el perfil', 'error');
                }
            }
        }
    };

    const handleDelete = () => {
        Swal.fire({
            title: "Eliminar Ususario",
            html: "¿Está seguro de que quiere eliminar su usuario?<br>Esta acción no se podrá deshacer",
            icon: 'warning',
            iconColor: '#FF3131',
            color: '#FF3131',
            showCancelButton: 'true',
            confirmButtonText: "Aceptar",
            cancelButtonText: "Cancelar"
        }).then((result) => {
            if (result.isConfirmed) {
                deleteUser();
                logout();
                navigate('/');
            }
        });
    };

    return (
        <Row className="w-100 justify-content-center">
            <Col xs="12" sm="8" md="6" lg="5" xl="7">
                <Card>
                    <BackButton back="/home" />
                    <CardBody className="p-5">
                        <Row className="mb-4 justify-content-md-center">
                            <Col md="4">
                                <p><strong>{"Nombre de Usuario: "} </strong>{user.username}</p>
                            </Col>
                            <Col md="4">
                                <Button onClick={() => alert("Cambiar contraseña")}>
                                    {"Cambiar contraseña"}
                                </Button>
                            </Col>
                        </Row>

                        <hr className="my-3 border-3 border-light py-1" />

                        <Row className="mb-3 justify-content-md-center">
                            <Col md="4">
                                <p>{"Departamento: "} { }</p>
                            </Col>
                            <Col md="4"> {/*Poner condicional*/}
                                <p>{"Sub departamento: "} { }</p>
                            </Col>
                        </Row>

                        <Row className="mb-3 justify-content-md-center">
                            <Col md="4">
                                <p>{"Nombre: "} { }</p>
                            </Col>
                            <Col md="4">
                                <p>{"Email: "} { }</p>
                            </Col>
                        </Row>

                        <Row className="mb-3 justify-content-md-center">
                            <Col md="4">
                                <p>{"Teléfono: "} { }</p>
                            </Col>
                            <Col md="4">
                                <p>{"Extensión: "} { }</p>
                            </Col>
                        </Row>

                        <hr className="my-3 border-3 border-light py-1" />

                        <Row className="mb-3 justify-content-md-center">
                            <Col md="4">
                                <Button onClick={() => handleModify()}>
                                    {"Modificar Perfil"}
                                </Button>
                            </Col>
                            <Col md="3">
                                <Button color="danger" onClick={() => handleDelete()}>
                                    {"Eliminar Usuario"}
                                </Button>
                            </Col>
                        </Row>
                    </CardBody>
                </Card>
            </Col>
        </Row>
    );
};

export default UserProfile;