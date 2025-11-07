import React, { useState } from 'react';
import { ListGroup, ListGroupItem, Tooltip } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileAlt, faDownload } from '@fortawesome/free-solid-svg-icons';

/**
 * Componente para listar archivos de log.
 *
 * Props:
 * - logs: Array de nombres de archivos de log.
 * - selectedLog: Nombre del log actualmente seleccionado.
 * - onSelectLog: Función que se llama al seleccionar un log.
 * - onDownloadLog: Función que se llama al descargar un log.
 *
 * Funcionalidades:
 * - Muestra la lista de logs con íconos.
 * - Tooltip con el nombre completo del log.
 * - Highlight del log seleccionado.
 * - Botón de descarga con efecto visual.
 */
export default function LogListComponent({ logs, selectedLog, onSelectLog, onDownloadLog }) {
    const [tooltipOpen, setTooltipOpen] = useState({});

    if (logs.length === 0) return <p className="p-3 text-muted">No existen logs</p>;

    const toggleTooltip = (id) => {
        setTooltipOpen(prev => ({ ...prev, [id]: !prev[id] }));
    };

    return (
        <ListGroup flush style={{ overflowY: 'auto' }} >
            {logs.map((log, index) => {
                const displayName = log.includes('-') ? log.split('-').slice(1).join('-') : log;
                const tooltipId = `tooltip-${index}`;

                const isTicketLog = log === "tickets.log";
                const isActive = selectedLog === log;
                const itemStyle = {
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    backgroundColor: isTicketLog && !isActive ? '#8CFDFF' : undefined,
                };
                const textStyle = {
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    maxWidth: '70%',
                    display: 'inline-block',
                    verticalAlign: 'middle',
                    color: isTicketLog && !isActive ? '#0d3b66' : undefined,
                    fontWeight: isTicketLog ? 'bold' : undefined,
                };

                return (
                    <ListGroupItem
                        key={log}
                        action
                        active={isActive}
                        onClick={() => onSelectLog(log, isTicketLog )}
                        style={itemStyle}
                    >
                        <span id={tooltipId} style={textStyle}>
                            <FontAwesomeIcon icon={faFileAlt} className="me-2" />
                            {displayName}
                        </span>

                        <Tooltip
                            placement="top"
                            isOpen={tooltipOpen[tooltipId]}
                            target={tooltipId}
                            toggle={() => toggleTooltip(tooltipId)}
                        >
                            {log}
                        </Tooltip>

                        <FontAwesomeIcon
                            icon={faDownload}
                            style={{ cursor: 'pointer', color: '#6c757d', transition: 'color 0.3s' }}
                            onClick={e => {
                                e.stopPropagation();
                                if (onDownloadLog) onDownloadLog(log);
                            }}
                            onMouseEnter={e => (e.currentTarget.style.color = '#ff7700')}
                            onMouseLeave={e => (e.currentTarget.style.color = '#6c757d')}
                        />
                    </ListGroupItem>
                );
            })}
        </ListGroup>
    );
}
       