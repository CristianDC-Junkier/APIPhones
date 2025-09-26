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
    const [searchTerm, setSearchTerm] = useState("");
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

    // Distribución vertical-first
    const colCount = 3;
    const columns = Array.from({ length: colCount }, () => []);
    const heights = Array(colCount).fill(0);
    const totalHeight = departamentos.reduce((sum, d) => sum + estimateHeight(d), 0);
    const targetHeight = totalHeight / colCount;

    [...departamentos].reverse().forEach((dep) => {
        const h = estimateHeight(dep);
        let colIdx = colCount - 1;
        while (colIdx > 0 && heights[colIdx] + h > targetHeight) colIdx--;
        columns[colIdx].push(dep);
        heights[colIdx] += h;
    });

    columns.forEach((col, idx) => columns[idx] = col.reverse());

    // Filtrar columnas según búsqueda
    const filteredColumns = columns.map(col =>
        col.filter(dep => dep.nombre.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const exportPDF = async (showEmails = false) => {
        setLoading(true);
        try {
            const pdf = new jsPDF("p", "mm", "a4");
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            const padding = 10; 
            const columnGap = 2;
            const columnWidth =
                (pageWidth - padding * 2 - columnGap * (colCount - 1)) / colCount;

            const titleMargin = 8; // margen extra entre título y primeros departamentos
            // Contenedor temporal
            const tempDiv = document.createElement("div");
            tempDiv.style.position = "absolute";
            tempDiv.style.left = "-9999px";
            tempDiv.style.width = listRef.current.offsetWidth + "px";
            document.body.appendChild(tempDiv);

            const clone = listRef.current.cloneNode(true);
            if (!showEmails) clone.querySelectorAll(".email").forEach(el => el.remove());
            tempDiv.appendChild(clone);

            const columnElements = clone.querySelectorAll(".row > .col-md-4");

            // Dibujar título solo en primera página
            let isFirstPage = true;
            const drawTitle = () => {
                pdf.setFont("trebuchet", "normal");
                pdf.setFontSize(14);
                pdf.text(
                    `Ayuntamiento de Almonte - Listín Telefónico - Última Actualización: ${lastUpdate}`,
                    pageWidth / 2,
                    padding,
                    { align: "center" }
                );
                if (isFirstPage) isFirstPage = false;
            };
            drawTitle();

            // Inicializar offsets por columna, solo con margen entre título y primeros departamentos
            const yOffsets = Array(colCount).fill(padding + titleMargin);

            // Convertir cada departamento a imagen primero
            const columnsImages = [];
            for (let colIdx = 0; colIdx < colCount; colIdx++) {
                const col = columnElements[colIdx];
                const depImgs = [];
                for (let dep of col.children) {
                    const canvas = await html2canvas(dep, {
                        scale: window.devicePixelRatio,
                        backgroundColor: "#ffffff",
                        useCORS: true,
                        width: dep.scrollWidth,
                        height: dep.scrollHeight + 10,
                    });
                    const imgData = canvas.toDataURL("image/png");
                    const imgHeight = (canvas.height * columnWidth) / canvas.width;
                    depImgs.push({ imgData, imgHeight });
                }
                columnsImages.push(depImgs);
            }

            // Dibujar departamentos
            let hasContent = true;
            while (hasContent) {
                hasContent = false;

                const rowImages = columnsImages.map(colImgs => colImgs.shift() || null);
                if (rowImages.some(img => img)) hasContent = true;
                if (!hasContent) break;

                // Calcular altura máxima de esta fila 
                const rowHeight = Math.max(...rowImages.map(img => (img ? img.imgHeight : 0)));

                // Comprobar si cabe en la página
                if (Math.max(...yOffsets) + rowHeight > pageHeight + padding) {
                    pdf.addPage();
                    for (let i = 0; i < colCount; i++) yOffsets[i] = padding ; 
                }

                // Dibujar la fila
                for (let colIdx = 0; colIdx < colCount; colIdx++) {
                    const img = rowImages[colIdx];
                    if (!img) continue;

                    const x = padding + colIdx * (columnWidth + columnGap);
                    const y = yOffsets[colIdx];

                    // Dibujar imagen con padding interno
                    pdf.addImage(img.imgData, "PNG", x , y , columnWidth, img.imgHeight);

                    // Avanzar offset por la altura real ocupada
                    yOffsets[colIdx] += img.imgHeight;
                }
            }

            pdf.save("departamentos.pdf");
            tempDiv.remove();

            Swal.fire({
                icon: "success",
                title: "PDF generado",
                text: `La lista teléfonica se ha exportado correctamente a descargas.`,
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

            {/* Buscador y botón exportar */}
            <div className="d-flex justify-content-between mb-2">
                {/* Input a la izquierda */}
                <input
                    type="text"
                    className="form-control"
                    placeholder="Buscar departamento..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ width: "200px", marginLeft: "26px", }}
                />

                {/* Botón a la derecha */}
                <Button
                    color="secondary"
                    disabled={loading}
                    style={{ fontWeight: 500, fontSize: "0.9rem", display: "flex", alignItems: "center", marginRight: "28px", gap: "5px" }}
                    onClick={async (e) => {
                        e.preventDefault();

                        setSearchTerm("");

                        const { isConfirmed } = await Swal.fire({
                            title: 'Exportar correos?',
                            text: '¿Deseas incluir los correos en el PDF?',
                            icon: 'question',
                            showCancelButton: true,
                            confirmButtonText: 'Sí, incluir correos',
                            cancelButtonText: 'No, excluir correos'
                        });
                        exportPDF(isConfirmed);
                    }}
                >
                    {loading ? <Spinner size="sm" color="light" /> : <FontAwesomeIcon icon={faFilePdf} />}
                    {loading ? " Generando..." : " Exportar a PDF"}
                </Button>
            </div>


            <div ref={listRef} className="row mx-3">
                {filteredColumns.map((col, colIdx) => (
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
