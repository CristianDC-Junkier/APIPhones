import React from 'react';
import { Card, CardBody } from "reactstrap";

/**
 * Componente para visualizar el contenido de un log.
 *
 * Props:
 * - content: String con el contenido completo del log.
 *
 * Funcionalidades:
 * - Renderiza cada línea del log.
 * - Colorea las etiquetas [INFO], [WARN], [ERROR] según su nivel.
 * - Mantiene formato de texto monoespaciado y saltos de línea.
 */
export default function LogViewerComponent({ content }) {
    // Función para renderizar cada línea con color según el nivel
    const renderLine = (line, index) => {
        // Buscar patrón de log: [INFO], [WARN], [ERROR]
        const match = line.match(/\[(INFO|WARN|ERROR)\]/i);
        if (!match) return <div key={index}>{line}</div>;

        const level = match[1].toUpperCase();
        const colorMap = { INFO: 'blue', WARN: 'orange', ERROR: 'red' };

        const parts = line.split(`[${match[1]}]`);

        return (
            <div key={index} style={{ display: 'flex', flexWrap: 'wrap' }}>
                <span>{parts[0]}</span>
                <span style={{ color: colorMap[level], fontWeight: 'bold' }}>[{level}]</span>
                <span>{parts[1]}</span>
            </div>
        );
    };

    return (
        <Card className="d-flex flex-column flex-grow-1" style={{ height: '100%', overflowY: 'auto' }}>
            <CardBody style={{ display: 'flex', flexDirection: 'column', flex: 1, padding: 0 }}>
                <div
                    style={{
                        whiteSpace: 'pre-wrap',
                        fontFamily: 'monospace',
                        overflowY: 'auto',
                        flex: 1,
                        padding: '1rem',
                    }}
                >
                    {content.split('\n').map((line, index) => renderLine(line, index))}
                </div>
            </CardBody>
        </Card>
    );
}
