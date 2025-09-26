import React, { useRef, useState } from "react";
import { Col, Button, Spinner } from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFilePdf } from "@fortawesome/free-solid-svg-icons";
import PhoneDepartmentComponent from "../../components/lists/PhoneDepartmentComponent";
import BackButtonComponent from "../../components/utils/BackButtonComponent";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import Swal from "sweetalert2";
import "bootstrap/dist/css/bootstrap.min.css";

// Funciones auxiliares
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomName = () => {
    const firstNames = ["Juan", "María", "Pedro", "Lucía", "Carlos", "Sofía", "Miguel", "Ana", "Luis", "Isabel"];
    const lastNames = ["García", "Rodríguez", "López", "Martínez", "Hernández", "Pérez", "Sánchez", "Ramírez"];
    return `${firstNames[randomInt(0, firstNames.length - 1)]} ${lastNames[randomInt(0, lastNames.length - 1)]}`;
};
const randomDeptName = (idCounter) => {
    const types = ["Administración", "Finanzas", "Servicios", "Recursos Humanos", "Tecnología", "Operaciones"];
    return `${types[randomInt(0, types.length - 1)]} ${idCounter}`;
};

// Función para estimar "altura" de un departamento
const estimateHeight = (dep) =>
    dep.trabajadores.length + dep.subdepartamentos.reduce((acc, sd) => acc + sd.trabajadores.length + 1, 1);

const WorkerList = () => {
    const listRef = useRef();
    const [loading, setLoading] = useState(false);
    const lastUpdate = "25/09/2025";
    let idCounter = 1;

    // Generar departamentos aleatorios
    const departamentos = Array.from({ length: randomInt(15, 25) }, () => ({
        nombre: randomDeptName(idCounter++),
        trabajadores: Array.from({ length: randomInt(1, 5) }, () => ({
            numero: (Math.floor(100000000 + Math.random() * 900000000)).toString(),
            extension: (Math.floor(10000 + Math.random() * 90000)).toString(),
            nombre: randomName(),
            email: `${Math.random().toString(36).substring(2, 8)}@ejemplo.com`,
        })),
        subdepartamentos: Array.from({ length: randomInt(1, 4) }, (_, idx) => ({
            nombre: `Subdep ${idx + 1}`,
            trabajadores: Array.from({ length: randomInt(1, 3) }, () => ({
                numero: (Math.floor(100000000 + Math.random() * 900000000)).toString(),
                extension: (Math.floor(10000 + Math.random() * 90000)).toString(),
                nombre: randomName(),
                email: `${Math.random().toString(36).substring(2, 8)}@ejemplo.com`,
            })),
        })),
    }));

    // Distribución vertical-first, exceso a la izquierda, lista invertida
    const colCount = 3;
    const columns = Array.from({ length: colCount }, () => []);
    const heights = Array(colCount).fill(0);

    const totalHeight = departamentos.reduce((sum, d) => sum + estimateHeight(d), 0);
    const targetHeight = totalHeight / colCount;

    // Iterar desde el final de la lista
    [...departamentos].reverse().forEach((dep) => {
        const h = estimateHeight(dep);

        // Encuentra la última columna posible de derecha a izquierda
        let colIdx = colCount - 1;
        while (colIdx > 0 && heights[colIdx] + h > targetHeight) {
            colIdx--;
        }

        columns[colIdx].push(dep);
        heights[colIdx] += h;
    });

    // Para volver a tener los departamentos en orden original dentro de cada columna
    columns.forEach((col, idx) => columns[idx] = col.reverse());

    // Función para generar PDF
    const exportPDF = async () => {
        setLoading(true);
        try {
            const pdf = new jsPDF("p", "mm", "a4");
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            const padding = 10;
            const columnGap = 2;
            const columnWidth = (pageWidth - padding * 2 - columnGap * (colCount - 1)) / colCount;

            // Contenedor temporal invisible
            const tempDiv = document.createElement("div");
            tempDiv.style.position = "absolute";
            tempDiv.style.left = "-9999px";
            tempDiv.style.width = listRef.current.offsetWidth + "px";
            document.body.appendChild(tempDiv);

            // Clonar contenido original
            const clone = listRef.current.cloneNode(true);
            clone.querySelectorAll(".pdf-hide").forEach(el => el.remove());
            clone.querySelectorAll(".collapse").forEach(c => {
                c.classList.add("show");
                c.style.height = "auto";
            });
            tempDiv.appendChild(clone);

            const columnElements = clone.querySelectorAll(".row > .col-md-4");
            const colHeights = Array(colCount).fill(padding);

            // Solo título en la primera página
            pdf.setFontSize(14);
            pdf.setFont("helvetica", "bold");
            pdf.text(
                `Ayuntamiento de Almonte - Listín Telefónico - Última Actualización: ${lastUpdate}`,
                pageWidth / 2,
                padding,
                { align: "center" }
            );
            const titleOffset = 10;
            colHeights.fill(padding + titleOffset);

            // Número máximo de filas entre columnas
            const maxRows = Math.max(...Array.from(columnElements).map(col => col.children.length));

            for (let rowIdx = 0; rowIdx < maxRows; rowIdx++) {
                for (let colIdx = 0; colIdx < colCount; colIdx++) {
                    const col = columnElements[colIdx];
                    const dep = col.children[rowIdx];
                    if (!dep) continue;

                    // html2canvas con escala más realista
                    const canvas = await html2canvas(dep, {
                        scale: window.devicePixelRatio,
                        backgroundColor: "#ffffff",
                        useCORS: true,
                        width: dep.scrollWidth,
                        height: dep.scrollHeight,
                    });


                    const imgData = canvas.toDataURL("image/png");
                    const imgHeight = (canvas.height * columnWidth) / canvas.width;

                    // Saltar página si se supera altura disponible
                    if (colHeights[colIdx] + imgHeight > pageHeight - padding) {
                        pdf.addPage();
                        colHeights.fill(padding); // nueva página sin título extra
                    }

                    const x = padding + colIdx * (columnWidth + columnGap);
                    const y = colHeights[colIdx];
                    pdf.addImage(imgData, "PNG", x, y, columnWidth, imgHeight);

                    colHeights[colIdx] += imgHeight + 5;
                }
            }

            pdf.save("departamentos.pdf");
            tempDiv.remove();

            Swal.fire({
                icon: "success",
                title: "PDF generado",
                text: "Se ha exportado la sección de departamentos con columnas equilibradas y título solo en la primera página.",
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


    return (
        <div className="container-fluid my-4">
            <div style={{ position: "absolute", top: "10px", left: "10px" }}>
                <BackButtonComponent back="/home" />
            </div>

            <div className="text-center my-4">
                <h2 style={{ fontSize: "1.5rem", fontWeight: "bold" }}>
                    Ayuntamiento de Almonte - Listín Telefónico - Última Actualización: {lastUpdate}
                </h2>
            </div>

            <div className="d-flex justify-content-end mb-2" style={{ marginRight: "40px" }}>
                <input>
                </input>
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

            <div ref={listRef} className="row mx-3">
                {columns.map((col, colIdx) => (
                    <Col key={colIdx} xs="12" md="4" className={colIdx < colCount - 1 ? "pe-1" : ""}>
                        {col.map((dep, depIdx) => (
                            <PhoneDepartmentComponent
                                key={depIdx}
                                nombreDepartamento={dep.nombre}
                                trabajadoresDepartamento={dep.trabajadores}
                                nombresSubdepartamentos={dep.subdepartamentos.map(sd => sd.nombre)}
                                trabajadoresSubdepartamentos={dep.subdepartamentos.map(sd => sd.trabajadores)}
                            />
                        ))}
                    </Col>
                ))}
            </div>
        </div>
    );
};

export default WorkerList;
