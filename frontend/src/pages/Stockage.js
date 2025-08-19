import { useState, useEffect } from "react";
import axios from "axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function Stockage() {
  const API_URL = process.env.REACT_APP_API_URL;
  
  // Formatage date du jour
  const todayDate = new Date().toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  // Garder que l'heure
  const formatDataWithHour = (data) =>
    data.map((d) => ({
      ...d,
      timestamp: new Date(d.timestamp).toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    }));

  const [batterySocData, setBatterySocData] = useState([]);
  const [fuelCellContributionData, setFuelCellContributionData] = useState([]);
  const [kpis, setKpis] = useState({
    battery_autonomy_h: 0,
    fuelcell_contribution_percent: 0,
    alerts: {
      low_battery: false,
      fuelcell_failure: false
    }
  });

  useEffect(() => {
    if (!API_URL) {
      console.error("❌ REACT_APP_API_URL est vide. Vérifie ton .env");
      return;
    }

    async function fetchData() {
      try {
        const endpoints = {
          batterySoc: `${API_URL}/storage/battery_soc`,
          fuelCellContribution: `${API_URL}/storage/fuelcell_contribution`,
          kpis: `${API_URL}/storage/kpis`,
        };

        const [
          batterySocRes,
          fuelCellContributionRes,
          kpisRes,
        ] = await Promise.all([
          axios.get(endpoints.batterySoc),
          axios.get(endpoints.fuelCellContribution),
          axios.get(endpoints.kpis),
        ]);

        // Logs pour inspecter la structure
        console.log("🔋 batterySocRes:", batterySocRes);
        console.log("⚡ fuelCellContributionRes:", fuelCellContributionRes);
        console.log("📊 kpisRes:", kpisRes);

        setBatterySocData(formatDataWithHour(batterySocRes.data));
        setFuelCellContributionData(formatDataWithHour(fuelCellContributionRes.data));
        setKpis(kpisRes.data);

        console.log("Nouvelles valeurs KPIs Storage:", kpisRes.data);
      } catch (error) {
        console.error("❌ Erreur lors du fetch des données storage :", error);
      }
    }

    fetchData();
  }, [API_URL]);

  // Animation des KPIs
  const [animatedKpis, setAnimatedKpis] = useState({
    battery_autonomy_h: 0,
    fuelcell_contribution_percent: 0,
    alerts: {
      low_battery: false,
      fuelcell_failure: false
    }
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedKpis(kpis);
    }, 100);
    return () => clearTimeout(timer);
  }, [kpis]);

  useEffect(() => {
    console.log("KPIs Storage mis à jour :", kpis);
  }, [kpis]);

  // Composant KPI Card
  const KpiCard = ({ title, value, unit, gradientClass, icon, isAlert = false }) => (
    <div className={`kpi-card ${isAlert ? 'kpi-alert' : ''}`}>
      <div className="kpi-card-header">
        <div className={`kpi-icon ${gradientClass}`}>
          <span className="kpi-icon-emoji">{icon}</span>
        </div>
        <div className="kpi-values">
          <p className="kpi-value">
            {typeof value === 'string' ? value : `${value.toFixed(1)}${unit}`}
          </p>
          <p className="kpi-title">{title}</p>
        </div>
      </div>
      <div className="kpi-progress-container">
        <div
          className={`kpi-progress ${gradientClass}`}
          style={{ 
            width: typeof value === 'string' ? '100%' : `${Math.min(value, 100)}%` 
          }}
        ></div>
      </div>
    </div>
  );

  // Composant Chart Card
  const ChartCard = ({ title, data, lines, height = 300 }) => (
    <div className="chart-card">
      <h3 className="chart-title">{title}</h3>
      <p className="chart-date" style={{
        textAlign: "right",
        width: "100%",
        fontSize: "14px",
        color: "var(--text-secondary)",
      }}>{todayDate}</p>

      <div className="chart-container">
        <ResponsiveContainer width="100%" height={height}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" opacity={0.3} />
            <XAxis 
              dataKey="timestamp" 
              stroke="var(--text-secondary)" 
              fontSize={12}
            />
            <YAxis 
              stroke="var(--text-secondary)" 
              fontSize={12}
              label={{ value: "Valeur", angle: -90, position: "insideLeft" }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--bg-secondary)",
                border: `2px solid var(--border-color)`,
                borderRadius: "12px",
                color: "var(--text-primary)",
                boxShadow: "0 8px 32px var(--shadow)",
                fontSize: "14px",
              }}
            />
            {lines.map((line, index) => (
              <Line
                key={index}
                type="monotone"
                dataKey={line.key}
                stroke={line.color}
                strokeWidth={3}
                dot={{ fill: line.color, strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: line.color, strokeWidth: 2 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  // Composant Alert Status
  const AlertStatus = ({ alerts }) => {
    const hasAlerts = alerts.low_battery || alerts.fuelcell_failure;
    
    return (
      <div className={`alert-status ${hasAlerts ? 'alert-active' : 'alert-normal'}`}>
        <div className="alert-icon">
          <span>{hasAlerts ? '⚠️' : '✅'}</span>
        </div>
        <div className="alert-content">
          <p className="alert-title">
            {hasAlerts ? 'Alertes Actives' : 'Système Normal'}
          </p>
          <div className="alert-details">
            {alerts.low_battery && <span className="alert-item">🔋 Batterie Faible</span>}
            
            {alerts.fuelcell_failure && <span className="alert-item">⚡ PAC Hors Service</span>}
            
            {!hasAlerts && <span className="alert-item">Tous systèmes opérationnels</span>}
            
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <style jsx>{`
        /* Utilise les mêmes variables CSS que Production */
        .storage-container {
          padding: 5%;
          padding-left: 8%;
          background-color: var(--bg-secondary);
          min-height: 100vh;
          color: var(--text-primary);
        }

        /* Header Section */
        .storage-header {
          margin-bottom: 40px;
          animation: fadeInUp 0.6s ease-out;
        }

        .storage-title {
          font-size: 32px;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 8px;
          background: linear-gradient(135deg, var(--text-primary), var(--text-secondary));
          background-clip: text;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .storage-subtitle {
          font-size: 16px;
          color: var(--text-secondary);
          font-weight: 400;
        }

        /* KPI Cards */
        .kpi-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 25px;
          margin-bottom: 40px;
        }

        .kpi-card {
          background: var(--bg-primary);
          border-radius: 16px;
          padding: 25px;
          box-shadow: 0 8px 32px var(--shadow);
          border: 1px solid var(--border-color);
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          animation: fadeInUp 0.6s ease-out;
          position: relative;
          overflow: hidden;
        }

        .kpi-card.kpi-alert {
          border-color: #ff6b6b;
          box-shadow: 0 8px 32px rgba(255, 107, 107, 0.2);
        }

        .kpi-card:hover {
          transform: translateY(-8px) scale(1.02);
          box-shadow: 0 16px 48px var(--shadow);
        }

        .kpi-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, var(--text-secondary), #6a8e4e);
        }

        .kpi-card.kpi-alert::before {
          background: linear-gradient(90deg, #ff6b6b, #ff8e8e);
        }

        .kpi-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 20px;
        }

        .kpi-icon {
          width: 55px;
          height: 55px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.3s ease;
        }

        .kpi-icon.green {
          background: linear-gradient(135deg, #6a8e4e, #4a6b3a);
        }

        .kpi-icon.blue {
          background: linear-gradient(135deg, #2d473e, #1a2e23);
        }

        .kpi-icon.orange {
          background: linear-gradient(135deg, #f4a261, #e76f51);
        }

        .kpi-icon.red {
          background: linear-gradient(135deg, #ff6b6b, #ee5a24);
        }

        .kpi-card:hover .kpi-icon {
          transform: rotate(10deg) scale(1.1);
        }

        .kpi-icon-emoji {
          font-size: 24px;
          filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
        }

        .kpi-values {
          text-align: right;
        }

        .kpi-value {
          font-size: 28px;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 5px;
          line-height: 1;
        }

        .kpi-title {
          font-size: 14px;
          color: var(--text-secondary);
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .kpi-progress-container {
          width: 100%;
          height: 6px;
          background: var(--border-color);
          border-radius: 3px;
          overflow: hidden;
          position: relative;
        }

        .kpi-progress {
          height: 100%;
          border-radius: 3px;
          transition: width 1.2s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
        }

        .kpi-progress.green {
          background: linear-gradient(90deg, #6a8e4e, #4a6b3a);
        }

        .kpi-progress.blue {
          background: linear-gradient(90deg, #2d473e, #1a2e23);
        }

        .kpi-progress.orange {
          background: linear-gradient(90deg, #f4a261, #e76f51);
        }

        .kpi-progress.red {
          background: linear-gradient(90deg, #ff6b6b, #ee5a24);
        }

        .kpi-progress::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
          animation: shimmer 2s infinite;
        }

        /* Alert Status */
        .alert-status {
          background: var(--bg-primary);
          border-radius: 16px;
          padding: 25px;
          margin-bottom: 40px;
          box-shadow: 0 8px 32px var(--shadow);
          border: 1px solid var(--border-color);
          display: flex;
          align-items: center;
          gap: 20px;
          transition: all 0.4s ease;
        }

        .alert-status.alert-active {
          border-color: #ff6b6b;
          background: linear-gradient(135deg, rgba(255, 107, 107, 0.1), rgba(255, 107, 107, 0.05));
        }

        .alert-status.alert-normal {
          border-color: #6a8e4e;
          background: linear-gradient(135deg, rgba(106, 142, 78, 0.1), rgba(106, 142, 78, 0.05));
        }

        .alert-icon {
          font-size: 32px;
          min-width: 50px;
          text-align: center;
        }

        .alert-title {
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 8px;
          color: var(--text-primary);
        }

        .alert-details {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
        }

        .alert-item {
          background: var(--bg-secondary);
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 14px;
          color: var(--text-secondary);
          border: 1px solid var(--border-color);
        }

        /* Chart Cards */
        .charts-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 25px;
        }

        .chart-card {
          background: var(--bg-primary);
          border-radius: 16px;
          padding: 25px;
          box-shadow: 0 8px 32px var(--shadow);
          border: 1px solid var(--border-color);
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          animation: fadeInUp 0.6s ease-out;
        }

        .chart-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 40px var(--shadow);
        }

        .chart-title {
          font-size: 18px;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 20px;
          padding-bottom: 12px;
          border-bottom: 2px solid var(--border-color);
          position: relative;
        }

        .chart-title::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 0;
          width: 40px;
          height: 2px;
          background: var(--text-secondary);
        }

        .chart-container {
          padding: 10px 0;
        }

        /* Animations */
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .storage-container {
            padding: 20px;
          }

          .kpi-grid {
            grid-template-columns: 1fr;
            gap: 20px;
          }

          .charts-grid {
            grid-template-columns: 1fr;
            gap: 20px;
          }

          .storage-title {
            font-size: 24px;
          }

          .kpi-card {
            padding: 20px;
          }

          .chart-card {
            padding: 20px;
          }

          .alert-status {
            flex-direction: column;
            text-align: center;
          }
        }

        @media (max-width: 480px) {
          .kpi-card-header {
            flex-direction: column;
            text-align: center;
            gap: 15px;
          }

          .kpi-values {
            text-align: center;
          }

          .alert-details {
            justify-content: center;
          }
        }
      `}</style>

      <div className="storage-container">
        {/* Header */}
        <div className="storage-header">
          <h1 className="storage-title">Système de Stockage</h1>
          <p className="storage-subtitle">
            Surveillance en temps réel du stockage d'énergie et des performances
          </p>
        </div>

        {/* Status des alertes */}
        <AlertStatus alerts={animatedKpis.alerts} />

        {/* KPIs */}
        <div className="kpi-grid">
          <KpiCard
            title="Autonomie Batterie"
            value={animatedKpis.battery_autonomy_h === 'Infini' ? 'Infini' : animatedKpis.battery_autonomy_h}
            unit="h"
            gradientClass="blue"
            icon="🔋"
          />
          <KpiCard
            title="Contribution PAC"
            value={animatedKpis.fuelcell_contribution_percent}
            unit="%"
            gradientClass="orange"
            icon="⚡"
          />
          <KpiCard
            title="État Système"
            value={animatedKpis.alerts?.low_battery || animatedKpis.alerts?.fuelcell_failure ? "Alerte" : "Normal"}
            unit=""
            gradientClass={animatedKpis.alerts?.low_battery || animatedKpis.alerts?.fuelcell_failure ? "red" : "green"}
            icon={animatedKpis.alerts?.low_battery || animatedKpis.alerts?.fuelcell_failure ? "⚠️" : "✅"}
            isAlert={animatedKpis.alerts?.low_battery || animatedKpis.alerts?.fuelcell_failure}
          />
        </div>

        {/* Graphiques */}
        <div className="charts-grid">
          <ChartCard
            title="État de Charge Batterie (%)"
            data={batterySocData}
            lines={[{ key: "soc", color: "#081cf8ff" }]}
          />

          <ChartCard
            title="Contribution Pile à Combustible (%)"
            data={fuelCellContributionData}
            lines={[{ key: "fuelcell_contribution", color: "#f4a261" }]}
          />
        </div>
      </div>
    </>
  );
}