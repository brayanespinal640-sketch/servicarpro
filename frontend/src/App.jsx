import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Wrench, 
  LayoutDashboard, 
  Users, 
  Car, 
  CalendarCheck, 
  ClipboardList, 
  Boxes, 
  FileText, 
  Activity,
  CheckCircle2,
  XCircle
} from 'lucide-react';

function App() {
  const [gatewayStatus, setGatewayStatus] = useState({ loading: true, online: false, data: null });

  const checkBackendHealth = async () => {
    setGatewayStatus({ loading: true, online: false, data: null });
    try {
      const response = await axios.get('http://localhost:8000/api/v1/health');
      setGatewayStatus({ loading: false, online: true, data: response.data });
    } catch (error) {
      console.error('Error al conectar con el API Gateway:', error);
      setGatewayStatus({ loading: false, online: false, data: null });
    }
  };

  useEffect(() => {
    checkBackendHealth();
  }, []);

  return (
    <div class="app-layout">
      {/* Sidebar Lateral */}
      <div class="sidebar">
        <div class="brand">
          <Wrench class="brand-icon" size={24} />
          ServicarPro
        </div>
        <ul class="nav-list">
          <li class="nav-item active">
            <Activity size={18} />
            Estado del Sistema
          </li>
          <li class="nav-item">
            <LayoutDashboard size={18} />
            Dashboard
          </li>
          <li class="nav-item">
            <Users size={18} />
            Clientes
          </li>
          <li class="nav-item">
            <Car size={18} />
            Vehículos
          </li>
          <li class="nav-item">
            <CalendarCheck size={18} />
            Citas
          </li>
          <li class="nav-item">
            <ClipboardList size={18} />
            Órdenes de Trabajo
          </li>
          <li class="nav-item">
            <Boxes size={18} />
            Inventario
          </li>
          <li class="nav-item">
            <FileText size={18} />
            Facturación
          </li>
        </ul>
      </div>

      {/* Contenido Principal */}
      <div class="main-content">
        <div class="header">
          <h1>Estructura Base Frontend - ServicarPro</h1>
          <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
            Sprint 1 | Responsable: <b>Allison Izaguirre</b>
          </span>
        </div>

        {/* Card de Diagnóstico de Salud de Microservicios */}
        <div class="card">
          <h2 style={{ color: 'var(--accent-yellow)', marginBottom: '15px' }}>
            Verificación de Conexión con Backend (API Gateway)
          </h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>
            Este módulo consume el endpoint <code>/api/v1/health</code> para validar que el API Gateway en Node.js y Docker se encuentren operativos.
          </p>

          {gatewayStatus.loading ? (
            <p style={{ color: 'var(--accent-yellow)' }}>Consultando el estado de los servicios...</p>
          ) : gatewayStatus.online ? (
            <div>
              <div class="status-badge status-online">
                <CheckCircle2 size={16} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'text-bottom' }} />
                API Gateway CONECTADO Y ONLINE
              </div>
              <div style={{ marginTop: '15px', background: '#121212', padding: '15px', borderRadius: '4px', border: '1px solid #333' }}>
                <p><b>Servicio:</b> {gatewayStatus.data?.service}</p>
                <p><b>Estado:</b> {gatewayStatus.data?.status}</p>
                <p><b>Timestamp:</b> {gatewayStatus.data?.timestamp}</p>
              </div>
            </div>
          ) : (
            <div>
              <div class="status-badge status-offline">
                <XCircle size={16} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'text-bottom' }} />
                API Gateway DESCONECTADO (Revisar Docker / Puerto 8000)
              </div>
            </div>
          )}

          <button class="btn-refresh" onClick={checkBackendHealth}>
            Recomprobar Conexión
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;