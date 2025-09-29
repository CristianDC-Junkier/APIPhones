import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import Swal from "sweetalert2";

/**
 * Genera el PDF basado en el contenido de listRef.
 * - Mantiene el mismo orden vertical-first que en React.
 * - Título en la primera página únicamente.
 * - Rellena columnas en la página hasta que ninguna columna pueda añadir más,
 *   después crea una nueva página y continúa con lo que queda.
 *
 * @param {Object} params
 * @param {number} params.colCount - número de columnas
 * @param {React.RefObject} params.listRef - referencia al DOM que contiene la lista
 * @param {string} params.lastUpdate - fecha de última actualización
 * @param {Function} params.setLoading - callback para setear loading
 */
export const exportPDF = async ({ colCount, listRef, lastUpdate, setLoading }) => {
    setLoading(true);
    try {
        const pdf = new jsPDF("p", "mm", "a4");
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();

        const padding = 4;
        const titleMargin = 6;
        const bottomMargin = 8;
        const columnGap = 2;
        const columnWidth = (pageWidth - padding * 2 - columnGap * (colCount - 1)) / colCount;

        // contenedor temporal oculto
        const tempDiv = document.createElement("div");
        tempDiv.style.position = "absolute";
        tempDiv.style.left = "-9999px";
        tempDiv.style.top = "-9999px";
        tempDiv.style.width = listRef.current.offsetWidth + "px";
        tempDiv.style.height = "100vh";
        tempDiv.style.boxSizing = "border-box";
        document.body.appendChild(tempDiv);

        const clone = listRef.current.cloneNode(true);
        tempDiv.appendChild(clone);

        const columnElements = clone.querySelectorAll(".row > .col-md-4");

        // título
        const drawTitle = () => {
            pdf.setFont("times", "bold");
            pdf.setFontSize(14);
            pdf.text(
                `Ayuntamiento de Almonte - Listín Telefónico - Última Actualización: ${lastUpdate}`,
                pageWidth / 2,
                padding + 2,
                { align: "center" }
            );
        };

        // convertir cada departamento a imágenes, manteniendo columnas
        const columnsImages = [];
        for (let colIdx = 0; colIdx < colCount; colIdx++) {
            const colEl = columnElements[colIdx];
            const depImgs = [];
            for (let dep of colEl.children) {
                const canvas = await html2canvas(dep, {
                    scale: window.devicePixelRatio,
                    backgroundColor: "#ffffff",
                    useCORS: true,
                    width: dep.scrollWidth,
                    height: dep.scrollHeight + 3,
                });
                const imgData = canvas.toDataURL("image/png");
                const imgHeight = (canvas.height * columnWidth) / canvas.width;
                depImgs.push({ imgData, imgHeight });
            }
            columnsImages.push(depImgs);
        }

        // --- Algoritmo de paginado manteniendo columnas vertical-first ---
        let firstPage = true;
        const yStartFirst = padding + titleMargin;
        const yStartOther = padding;
        let yOffsets = Array(colCount).fill(yStartFirst);

        while (columnsImages.some(col => col.length > 0)) {
            if (firstPage) drawTitle();

            let placed = false;

            for (let colIdx = 0; colIdx < colCount; colIdx++) {
                const col = columnsImages[colIdx];
                let y = yOffsets[colIdx];

                while (col.length > 0) {
                    const block = col[0];
                    const available = pageHeight - bottomMargin - y;

                    if (block.imgHeight <= available) {
                        const x = padding + colIdx * (columnWidth + columnGap);
                        pdf.addImage(block.imgData, "PNG", x, y, columnWidth, block.imgHeight);
                        y += block.imgHeight;
                        col.shift();
                        placed = true;
                    } else break;
                }

                yOffsets[colIdx] = y;
            }

            if (!placed) {
                pdf.addPage();
                firstPage = false;
                yOffsets = Array(colCount).fill(yStartOther);
            } else {
                firstPage = false;
            }
        }

        pdf.save("departamentos.pdf");
        tempDiv.remove();

        Swal.fire({
            icon: "success",
            title: "PDF generado",
            text: "La lista telefónica se ha exportado correctamente a descargas.",
            confirmButtonText: "Aceptar",
        });
    } catch (err) {
        console.error("Error exportPDF:", err);
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
