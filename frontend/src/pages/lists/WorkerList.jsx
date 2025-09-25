import React, { useRef, useState } from "react";
import { Row, Col, Button, Spinner } from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFilePdf } from "@fortawesome/free-solid-svg-icons";
import PhoneDepartmentComponent from "../../components/lists/PhoneDepartmentComponent";
import BackButtonComponent from "../../components/utils/BackButtonComponent";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import Swal from "sweetalert2";
import "bootstrap/dist/css/bootstrap.min.css";

const WorkerList = () => {
    const listRef = useRef();
    const [loading, setLoading] = useState(false);
    const lastUpdate = "25/09/2025";

    const generateNumber = () =>
        Math.floor(100000000 + Math.random() * 900000000).toString();
    const generateExtension = () =>
        Math.floor(10000 + Math.random() * 90000).toString();

    const departamentos = Array.from({ length: 20 }, (_, i) => ({
        nombre: `DEPARTAMENTO ${i + 1}`,
        trabajadores: Array.from({ length: 3 }, () => ({
            numero: generateNumber(),
            extension: generateExtension(),
            nombre: "USUARIO PRUEBA",
            email: "usuario@ejemplo.com",
        })),
        subdepartamentos: [
            {
                nombre: `SUBDEP ${i + 1}-A`,
                trabajadores: Array.from({ length: 2 }, () => ({
                    numero: generateNumber(),
                    extension: generateExtension(),
                    nombre: "USUARIO PRUEBA",
                    email: "usuario@ejemplo.com",
                })),
            },
            {
                nombre: `SUBDEP ${i + 1}-B`,
                trabajadores: Array.from({ length: 2 }, () => ({
                    numero: generateNumber(),
                    extension: generateExtension(),
                    nombre: "USUARIO PRUEBA",
                    email: "usuario@ejemplo.com",
                })),
            },
        ],
    }));

    const exportPDF = async () => {
        setLoading(true);
        try {
            // Contenedor temporal invisible
            const tempDiv = document.createElement("div");
            tempDiv.style.position = "absolute";
            tempDiv.style.left = "-9999px";
            document.body.appendChild(tempDiv);

            // Clonar contenido
            const clone = listRef.current.cloneNode(true);

            // Reorganizar columnas a 2 en lugar de 3
            const allDeps = [];
            clone.querySelectorAll(".col-md-4").forEach(col => {
                Array.from(col.children).forEach(dep => allDeps.push(dep));
            });
            clone.innerHTML = ""; // vaciar
            const newRow = document.createElement("div");
            newRow.className = "row";
            clone.appendChild(newRow);

            const col1 = document.createElement("div");
            col1.className = "col-6";
            const col2 = document.createElement("div");
            col2.className = "col-6";

            allDeps.forEach((dep, idx) => {
                if (idx % 2 === 0) col1.appendChild(dep);
                else col2.appendChild(dep);
            });

            newRow.appendChild(col1);
            newRow.appendChild(col2);

            tempDiv.appendChild(clone);

            // Quitar flechas
            clone.querySelectorAll(".pdf-hide").forEach(el => el.remove());

            // Encabezado
            const header = document.createElement("div");
            header.style.textAlign = "center";
            header.style.marginBottom = "10px";
            header.style.fontWeight = "bold";
            header.style.fontSize = "1.5rem";
            header.innerText = `Ayuntamiento de Almonte - Listín Telefónico - Fecha de actualización: ${lastUpdate}`;
            clone.insertBefore(header, clone.firstChild);

            // Canvas
            const canvas = await html2canvas(clone, { scale: 4, backgroundColor: "#ffffff" });
            const imgData = canvas.toDataURL("image/png");

            const pdf = new jsPDF("p", "mm", "a4");
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

            let position = 0;
            const pageHeight = pdf.internal.pageSize.getHeight();
            while (position < pdfHeight) {
                const h = position + pageHeight > pdfHeight ? pdfHeight - position : pageHeight;
                pdf.addImage(imgData, "PNG", 0, -position, pdfWidth, pdfHeight);
                position += pageHeight;
                if (position < pdfHeight) pdf.addPage();
            }

            pdf.save("listin-telefonico.pdf");
            tempDiv.remove();

            Swal.fire({
                icon: "success",
                title: "PDF generado",
                text: "El listín telefónico se ha exportado correctamente.",
                confirmButtonText: "Aceptar",
            });
        } catch (error) {
            console.error(error);
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "Hubo un problema al generar el PDF.",
                confirmButtonText: "Aceptar",
            });
        } finally {
            setLoading(false);
        }
    };

    const columns = [[], [], []];
    departamentos.forEach((dep, idx) => columns[idx % 3].push(dep));

    return (
        <div className="container-fluid my-4">
            {/* Botón atrás */}
            <div style={{ position: "absolute", top: "10px", left: "10px" }}>
                <BackButtonComponent back="/home" />
            </div>

            {/* Fecha */}
            <div className="text-center" style={{ marginTop: "20px", marginBottom: "20px" }}>
                <h2 style={{ fontSize: "1.5rem", fontWeight: "bold" }}>
                    Última actualización: {lastUpdate}
                </h2>
            </div>

            {/* Botón PDF con spinner e icono FontAwesome */}
            <div className="d-flex justify-content-end" style={{ marginRight: "40px", marginBottom: "10px" }}>
                <Button
                    color="secondary"
                    onClick={exportPDF}
                    disabled={loading}
                    style={{ fontWeight: 500, fontSize: "0.9rem", display: "flex", alignItems: "center", gap: "5px" }}
                >
                    {loading ? <Spinner size="sm" color="light" /> : <FontAwesomeIcon icon={faFilePdf} />}
                    {loading ? " Generando..." : " Exportar a PDF"}
                </Button>
            </div>

            {/* Contenedor principal */}
            <div ref={listRef} className="row" style={{ marginLeft: "30px", marginRight: "30px" }}>
                {columns.map((col, colIdx) => (
                    <Col key={colIdx} xs="12" md="4" className={colIdx < 2 ? "pe-1" : ""}>
                        {col.map((dep, depIdx) => (
                            <PhoneDepartmentComponent
                                key={depIdx}
                                nombreDepartamento={dep.nombre}
                                trabajadoresDepartamento={dep.trabajadores}
                                nombresSubdepartamentos={dep.subdepartamentos.map((sd) => sd.nombre)}
                                trabajadoresSubdepartamentos={dep.subdepartamentos.map((sd) => sd.trabajadores)}
                            />
                        ))}
                    </Col>
                ))}
            </div>
        </div>
    );
};

export default WorkerList;
