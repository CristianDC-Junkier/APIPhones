import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, CardBody, CardTitle, CardText } from 'reactstrap';
import Swal from 'sweetalert2';

import { getLogs, getLog, downloadLog, getSystemMetrics } from '../../services/SystemService';

import BackButtonComponent from '../../components/utils/BackButtonComponent';
import LogListComponent from '../../components/system/LogListComponent';
import LogViewerComponent from '../../components/system/LogViewerComponent';
import SpinnerComponent from '../../components/utils/SpinnerComponent';



/**
 * Función que da formato a una cantidad de tiempo recibida
 * @param {int} totalSeconds - cantidad de tiempo en segundos
 * @returns {String} - tiempo con formato horas:minutos:segundos
 */
function formatUptime(totalSeconds) {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;

    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

/**
 * Página encarga de mostrar los logs y las estadísticas del servidor
 */
export default function DashboardSystem() {
    const [logs, setLogs] = useState([]);
    const [selectedLog, setSelectedLog] = useState(null);
    const [logContent, setLogContent] = useState('Selecciona un archivo para ver su contenido');

    const [loading, setLoading] = useState(false);

    const [cpuUsage, setCpuUsage] = useState(null);
    const [memoryUsed, setMemoryUsed] = useState(null);
    const [threadsCount, setThreadsCount] = useState(null);
    const [uptimeSeconds, setUptimeSeconds] = useState(null);

    //Función encargada de obtener la información para la tabla
    useEffect(() => {
        const fetchLogs = async () => {
            setLoading(true);
            try {
                const res = await getLogs();
                if (res.success) setLogs(res.data);
            } finally {
                setLoading(false);
            }
        };
        fetchLogs();
    }, []);

    //Función encargada de obtener la información del estado del servidor
    useEffect(() => {
        const fetchMetrics = async () => {
                const res = await getSystemMetrics();
                if (res.success) {
                    setCpuUsage(res.data.CpuUsagePercent);
                    setMemoryUsed(res.data.MemoryUsedMB);
                    setThreadsCount(res.data.ThreadsCount);
                    setUptimeSeconds(res.data.UptimeSeconds);
                }
        };

        fetchMetrics();
        const interval = setInterval(fetchMetrics, 1000);
        return () => clearInterval(interval);
    }, []);

    //Función encargada de mostrar la información del log seleccionado
    const handleSelectLog = async (log) => {
        setSelectedLog(log);
        const res = await getLog(log);
        if (res.success) {
            setLogContent(res.data);
        } else {
            setLogContent('Error al cargar el archivo');
        }
    };

    //Función encargada de gestionar la descarga del log seleccionado
    const handleDownloadLog = (log) => {
        downloadLog(log).then(({ success, error }) => {
            if (!success) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: `No se pudo descargar el archivo: ${error.message}`,
                });
            } else {
                Swal.fire({
                    icon: 'success',
                    title: 'Descarga iniciada',
                    text: `El archivo "${log}" se está descargando.`,
                    timer: 2000,
                    showConfirmButton: false
                });
            }
        });
    };

    if (loading) return <SpinnerComponent />;

    return (
        <Container className="mt-4 d-flex flex-column" style={{ minHeight: '70vh' }}>
            <h3 className="text-center mb-4">Estadísticas del Servidor</h3>

            <div className="position-absolute top-0 start-0">
                <BackButtonComponent back="/home" />
            </div>

            {/* Métricas */}
            <Row className="mb-2 mt-4 text-center g-2">
                {[
                    { label: "CPU Usage (%)", value: cpuUsage, type: "warning" },
                    { label: "Memoria Usada (MB)", value: memoryUsed, type: "warning" },
                    { label: "Threads Activos", value: threadsCount, type: "info" },
                    { label: "Uptime", value: uptimeSeconds !== null ? formatUptime(uptimeSeconds) : null, type: "primary" }
                ].map((metric, idx) => (
                    <Col key={idx} xs={6} md={6} lg={3}>
                        <Card className={`border-${metric.type} shadow-sm`}>
                            <CardBody>
                                <CardTitle tag="h6">{metric.label}</CardTitle>
                                <CardText className="fs-4 fw-bold">
                                    {metric.value !== null && metric.value !== undefined
                                        ? (() => {
                                            switch (metric.label) {
                                                case "CPU Usage (%)":
                                                    return `${metric.value.toFixed(2)}%`;
                                                case "Memoria Usada (MB)":
                                                    return `${metric.value.toFixed(2)} MB`;
                                                case "Threads Activos":
                                                    return metric.value;
                                                case "Uptime":
                                                    return metric.value; 
                                                default:
                                                    return metric.value;
                                            }
                                        })()
                                        : "Cargando..."
                                    }
                                </CardText>
                            </CardBody>
                        </Card>
                    </Col>
                ))}
            </Row>

            {/* Escritorio */}
            <Row
                className="d-none d-lg-flex flex-grow-1"
                style={{
                    display: 'flex',
                    flexDirection: 'row',
                    flex: 1,
                    height: 'auto',
                    overflow: 'hidden'
                }}
            >
                <Col
                    lg="3"
                    style={{
                        height: 'calc(55vh)', 
                        overflowY: 'auto',
                        paddingRight: '0.5rem'
                    }}
                >
                    <LogListComponent
                        logs={logs}
                        selectedLog={selectedLog}
                        onSelectLog={handleSelectLog}
                        onDownloadLog={handleDownloadLog}
                    />
                </Col>
                <Col
                    lg="9"
                    style={{
                        height: 'calc(55vh)', 
                        overflowY: 'auto',
                        paddingLeft: '1rem'
                    }}
                >
                    <LogViewerComponent content={logContent} />
                </Col>
            </Row>

            {/* Móvil */}
            <Row className="d-flex d-lg-none flex-column">
                <Col
                    xs="12"
                    style={{
                        marginBottom: '0.5rem',
                        maxHeight: '50vh',
                        overflowY: 'auto'
                    }}
                >
                    <LogViewerComponent content={logContent} />
                </Col>
                <Col xs="12">
                    <hr/>
                </Col>
                <Col
                    xs="12"
                    style={{
                        paddingTop: '0.5rem',
                        marginBottom: '1rem',
                        maxHeight: '50vh',
                        overflowY: 'auto'
                    }}
                >
                    <LogListComponent
                        logs={logs}
                        selectedLog={selectedLog}
                        onSelectLog={handleSelectLog}
                    />
                </Col>
            </Row>
        </Container>
    );
}
