import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { Container, Row, Col, Card, CardBody, CardTitle, CardText, Button } from "reactstrap";
import Spinner from '../../components/utils/SpinnerComponent';
import { useAuth } from "../../hooks/useAuth";
import { deleteUser, userGetProfile, changeUsername, modifyProfile, changePassword } from "../../services/UserService";
import BackButton from "../../components/utils/BackButtonComponent";
import ModifyProfileComponent from '../../components/user/ModifyProfileComponent';


const UserProfile = () => {
    const [profile, setProfile] = useState();
    const [loading, setLoading] = useState(true);


    const navigate = useNavigate();
    const { user, token, logout } = useAuth();

    useEffect(() => {
        const fetchData = async () => {
            if (!token) return;
            setLoading(true);
            let response;
            response = await userGetProfile(token);
            if (response.success) {
                setProfile(response.data);
            } else {
                if (response.error === "Token inválido") {
                    Swal.fire('Error', 'El tiempo de acceso caducó, reinicie sesión', 'error')
                        .then(() => { logout(); navigate('/login'); });
                    return;
                }
            }
            setLoading(false);
        };
        fetchData();
    }, [token, logout, navigate]);

    const handleChangeUsername = async () => {
        const { value: username } = await Swal.fire({
            title: "Cambio de contraseña",
            input: 'text',
            inputLabel: "Introduzca su nuevo nombre de usuario",
            inputPlaceholder: 'Ingrese usuario',
            showCancelButton: true
        });

        if (!username) return;

        const result = await changeUsername({ username }, token);
        if (result.success) {
            Swal.fire('Éxito', 'Usuario modificado correctamente', 'success');
            let response = await userGetProfile(token);
            if (response.success) {
                setProfile(response.data);
            }
        }
        else Swal.fire('Error', result.error || 'No se pudo modificar el nombre de usuario', 'error');
    }

    const handleModify = async () => {
        await ModifyProfileComponent({
            token,
            profile,
            onConfirm: async (formValues) => {
                const result = await modifyProfile(formValues, token);
                if (result.success) {
                    Swal.fire("Éxito", "Perfil modificado correctamente", "success");
                    let response = await userGetProfile(token);
                    if (response.success) {
                        setProfile(response.data);
                    }
                } else {
                    Swal.fire("Error", result.error || "No se pudo modificar el perfil", "error");
                }
            }
        });
    };

    const handleChangePassword = async () => {
        const rowStyle = 'display:flex; align-items:center; margin-bottom:1rem; font-size:1rem;';
        const labelStyle = 'width:180px; font-weight:bold; text-align:left;';
        const inputStyle = 'flex:1; padding:0.35rem; font-size:1rem; border:1px solid #ccc; border-radius:4px;';

        const html = `
<div>
  <div style="${rowStyle}">
    <label style="${labelStyle}">Contraseña actual <span style="color:red">*</span></label>
    <input id="swal-passwordOld" type="password" style="${inputStyle}" placeholder="Contraseña">
  </div>

  <div style="${rowStyle}">
    <label style="${labelStyle}">Nueva contraseña <span style="color:red">*</span></label>
    <input id="swal-passwordNew" type="password" style="${inputStyle}" placeholder="Contraseña">
  </div>
  <div style="font-size:0.75rem; color:red; text-align:right;">* Campos obligatorios</div>
</div>
`;
        const swal = await Swal.fire({
            title: "Cuenta de Usuario",
            html: html,
            focusConfirm: false,
            width: '600px',
            showCancelButton: true,
            cancelButtonText: "Cancelar",
            confirmButtonText: "Aceptar",
            preConfirm: () => {
                const oldPassword = document.getElementById("swal-passwordOld").value.trim();
                const newPassword = document.getElementById("swal-passwordNew").value.trim();

                if (!oldPassword) { Swal.showValidationMessage("La contraseña actual no puede estar vacía"); return false; }
                if (!newPassword) { Swal.showValidationMessage("La contraseña nueva no puede estar vacía"); return false; }

                return { newPassword, oldPassword };
            }
        });

        if (!swal.value) return;

        const result = await changePassword(swal.value, token);
        if (result.success) {
            Swal.fire("Éxito", "Contraseña modificada correctamente", "success");
            logout();
            navigate('/');
        } else {
            Swal.fire("Error", result.error || "No se pudo modificar la contraseña", "error");
        }
    }

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
                let response = deleteUser(profile.id, token);
                if (response.succes) {
                    logout();
                    navigate('/');
                } else {
                    Swal.fire("Error", result.error || "No se eliminar el usuario", "error");
                }
            }
        });
    };

    if (loading) return <Spinner />;

    return (
        <Row className="w-100 justify-content-center">
            <div className="position-absolute top-0 start-0">
                <BackButton back="/home" />
            </div>
            <Col xs="8" sm="8" md="8" lg="5" xl="7">
                <Card>
                    <CardBody className="p-5">
                        <Row className="mb-3 justify-content-start">
                            <h3 className="mb-3">Información de la cuenta</h3>
                            <Col md="4" className="ms-5">
                                <p><strong>{"Nombre de Usuario:"}</strong></p>
                            </Col>
                            <Col md="7" >
                                <p>{profile.username}</p>
                            </Col>
                        </Row>
                        <Row className="mb-3 justify-content-center">
                            <h3 className="mb-4">Acciones sobre la cuenta</h3>
                            <Col md="5">
                                <Button color="primary" outline onClick={() => handleChangeUsername()}>
                                    {"Cambiar nombre de usuario"}
                                </Button>
                            </Col>
                            <Col md="5">
                                <Button color="primary" outline onClick={() => handleChangePassword()}>
                                    {"Cambiar contraseña"}
                                </Button>
                            </Col>
                        </Row>

                        <hr className="my-3 border-3 border-dark py-1" />
                        <h3 className="mb-3">Información del listín telefónico</h3>
                        <h4 className="mb-3 ms-3">Pública</h4>

                        <Row className="mb-2">
                            <Col md="5" className="ms-5">
                                <p><strong>{"Departamento:"}</strong></p>
                            </Col>
                            <Col md="6">
                                <p>{profile.userData.departmentName}</p>
                            </Col>
                        </Row>

                        <Row className="mb-2">
                            <Col md="5" className="ms-5">
                                <p><strong>{"Sub departamento:"}</strong></p>
                            </Col>
                            <Col md="6">
                                <p>{profile.userData.subdepartmentName}</p>
                            </Col>
                        </Row>

                        <Row className="mb-2">
                            <Col md="5" className="ms-5">
                                <p><strong>{"Teléfono: "}</strong>{profile.userData.number}</p>
                            </Col>
                            <Col md="6">
                                <p><strong>{"Extensión: "}</strong>{profile.userData.extension}</p>
                            </Col>
                        </Row>

                        <h4 className="mb-4 ms-3">No Pública</h4>
                        <Row className="mb-2">
                            <Col md="5" className="ms-5">

                                <p><strong>{"Nombre: "}</strong>{profile.userData.name}</p>
                            </Col>
                            <Col md="6">
                                <p><strong>{"Email: "}</strong>{profile.userData.email + "aaaaaaaaaaa"}</p>
                            </Col>
                        </Row>

                        <hr className="my-3 border-3 border-dark py-1" />

                        <Row className="mb-3 justify-content-center">
                            <Col md="4">
                                <Button color="primary" onClick={() => handleModify()}>
                                    {"Modificar Perfil"}
                                </Button>
                            </Col>
                            <Col md="4">
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