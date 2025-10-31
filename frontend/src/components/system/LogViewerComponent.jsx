import React from 'react';
import { Card, CardBody } from "reactstrap";

/**
 * Componente para visualizar el contenido de un log.
 *
 * Props:
 * - content: String con el contenido completo del log.
 * - isTicketLog: Booleano que indica si el log debe mostrarse como tabla (tickets.log)
 *
 * Funcionalidades:
 * - Renderiza logs normales con colores según [INFO], [WARN], [ERROR].
 * - Renderiza logs de tickets como una tabla con columnas alineadas.
 * - Mantiene formato de texto monoespaciado y scroll vertical.
 */
export default function LogViewerComponent({ content = '', isTicketLog = false }) {

    // Si el contenido está vacío, mostramos mensaje
    if (!content.trim()) {
        return (
            <Card className="d-flex flex-column flex-grow-1" style={{ height: '100%' }}>
                <CardBody className="d-flex justify-content-center align-items-center" style={{ height: '100%' }}>
                    <span style={{ color: '#6c757d' }}>No hay contenido para mostrar</span>
                </CardBody>
            </Card>
        );
    }

    // Renderizado especial para tickets.log como tabla
    if (isTicketLog) {
        const lines = content.split('\n').filter(l => l.trim() !== '');
        if (lines.length === 0) {
            return <div>No hay registros de tickets</div>;
        }

        const headers = lines[0].split('|').map(h => h.trim());
        const rows = lines.slice(1).map(line => line.split('|').map(c => c.trim()));

        return (
            <Card className="d-flex flex-column flex-grow-1" style={{ height: '100%', overflowY: 'auto' }}>
                <CardBody style={{ display: 'flex', flexDirection: 'column', flex: 1, padding: 0 }}>
                    <div style={{ fontFamily: 'monospace', overflowY: 'auto', flex: 1, padding: '1rem' }}>
                        {/* Encabezado */}
                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(4, 1fr)',
                                fontWeight: 'bold',
                                borderBottom: '1px solid #ccc',
                                marginBottom: '0.5rem',
                            }}
                        >
                            {headers.map((h, i) => (
                                <div key={i}>{h}</div>
                            ))}
                        </div>

                        {/* Filas */}
                        {rows.map((row, idx) => (
                            <div
                                key={idx}
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(4, 1fr)',
                                    padding: '2px 0',
                                    borderBottom: '1px solid #eee',
                                }}
                            >
                                {row.map((cell, i) => (
                                    <div key={i}>{cell}</div>
                                ))}
                            </div>
                        ))}
                    </div>
                </CardBody>
            </Card>

        );
    }

    // Renderizado normal para logs que no son tickets
    const renderLine = (line, index) => {
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
                <div style={{
                    whiteSpace: 'pre-wrap',
                    fontFamily: 'monospace',
                    overflowY: 'auto',
                    flex: 1,
                    padding: '1rem',
                }}>
                    {(content || '').split('\n').map((line, index) => renderLine(line, index))}
                </div>
            </CardBody>
        </Card>
    );
}
