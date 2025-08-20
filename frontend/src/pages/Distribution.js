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
  PieChart,
  Pie,
  Cell,
} from "recharts";

export default function Distribution() {
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

  const [consumptionTotalData, setConsumptionTotalData] = useState([]);
  const [consumptionBreakdownData, setConsumptionBreakdownData] = useState([]);
  const [kpis, setKpis] = useState({
    autoconsommation_percent: 0,
    dependance_reseau_percent: 0,
    critical_ratio_percent: 0,
  });

  useEffect(() => {
    if (!API_URL) {
      console.error("❌ REACT_APP_API_URL est vide. Vérifie ton .env");
      return;
    }

    async function fetchData() {
      try {
        const endpoints = {
          consumptionTotal: `${API_URL}/distribution/consumption_total`,
          consumptionBreakdown: `${API_URL}/distribution/consumption_breakdown`,
          kpis: `${API_URL}/distribution/kpis`,
        };

        const [
          consumptionTotalRes,
          consumptionBreakdownRes,
          kpisRes,
        ] = await Promise.all([
          axios.get(endpoints.consumptionTotal),
          axios.get(endpoints.consumptionBreakdown),
          axios.get(endpoints.kpis),
        ]);

        // Logs pour inspecter la structure
        // console.log("📊 consumptionTotalRes:", consumptionTotalRes);
        // console.log("🔄 consumptionBreakdownRes:", consumptionBreakdownRes);
        // console.log("📈 kpisRes:", kpisRes);

        setConsumptionTotalData(formatDataWithHour(consumptionTotalRes.data));
        setConsumptionBreakdownData(formatDataWithHour(consumptionBreakdownRes.data));
        setKpis(kpisRes.data);

        // console.log("Nouvelles valeurs KPIs Distribution:", kpisRes.data);
      } catch (error) {
        console.error("❌ Erreur lors du fetch des données distribution :", error);
      }
    }

    fetchData();
  }, [API_URL]);

  // Animation des KPIs
  const [animatedKpis, setAnimatedKpis] = useState({
    autoconsommation_percent: 0,
    dependance_reseau_percent: 0,
    critical_ratio_percent: 0,
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedKpis(kpis);
    }, 100);
    return () => clearTimeout(timer);
  }, [kpis]);

  useEffect(() => {
    // console.log("KPIs Distribution mis à jour :", kpis);
  }, [kpis]);

  // Données pour le graphique en secteurs
  const pieData = consumptionBreakdownData.length > 0
  ? [
      {
        name: "GE Body",
        value: Math.abs(consumptionBreakdownData[consumptionBreakdownData.length - 1]?.ge_body || 0),
        color: "#6a8e4e",
      },
      {
        name: "Autres Charges",
        value: Math.abs(consumptionBreakdownData[consumptionBreakdownData.length - 1]?.other_loads || 0),
        color: "#f4a261",
      },
    ]
  : [
      { name: "GE Body", value: 50, color: "#6a8e4e" },
      { name: "Autres Charges", value: 50, color: "#f4a261" },
    ];

  // Composant KPI Card
  const KpiCard = ({ title, value, unit, gradientClass, icon }) => (
    <div className="kpi-card">
      <div className="kpi-card-header">
        <div className={`kpi-icon ${gradientClass}`}>
          <span className="kpi-icon-emoji">{icon}</span>
        </div>
        <div className="kpi-values">
          <p className="kpi-value">
            {value.toFixed(1)}{unit}
          </p>
          <p className="kpi-title">{title}</p>
        </div>
      </div>
      <div className="kpi-progress-container">
        <div
          className={`kpi-progress ${gradientClass}`}
          style={{ width: `${Math.min(value, 100)}%` }}
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
              label={{
                value: lines[0].key, // Affiche le nom de la variable
                angle: -90,
                position: "insideLeft",
              }}
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

  // Composant Pie Chart Card
  const PieChartCard = ({ title, data, height = 300 }) => (
  <div className="chart-card">
    <h3 className="chart-title">{title}</h3>
    <p
      className="chart-date"
      style={{
        textAlign: "right",
        width: "100%",
        fontSize: "14px",
        color: "var(--text-secondary)",
      }}
    >
      {todayDate}
    </p>

    <div className="chart-container">
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={5}
            dataKey="value"
            label={({ name, percent }) => 
              `${name}: ${(percent * 100).toFixed(1)}%`
            }
            labelLine={false}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--bg-secondary)",
              border: `2px solid var(--border-color)`,
              borderRadius: "12px",
              color: "var(--text-primary)",
              boxShadow: "0 8px 32px var(--shadow)",
              fontSize: "14px",
            }}
            formatter={(value) => [`${value.toFixed(1)} kW`, "Consommation"]}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="pie-legend">
        {data.map((entry, index) => (
          <div key={index} className="legend-item">
            <div
              className="legend-color"
              style={{ backgroundColor: entry.color }}
            ></div>
            <span className="legend-text">{entry.name}</span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

  return (
    <>
      <style jsx>{`
        /* Utilise les mêmes variables CSS que Production */
        .distribution-container {
          padding: 5%;
          padding-left: 8%;
          background-color: var(--bg-secondary);
          min-height: 100vh;
          color: var(--text-primary);
        }

        /* Header Section */
        .distribution-header {
          margin-bottom: 40px;
          animation: fadeInUp 0.6s ease-out;
        }

        .distribution-title {
          font-size: 32px;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 8px;
          background: linear-gradient(135deg, var(--text-primary), var(--text-secondary));
          background-clip: text;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .distribution-subtitle {
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

        /* Pie Chart Legend */
        .pie-legend {
          display: flex;
          justify-content: center;
          gap: 20px;
          margin-top: 15px;
        }

        .legend-item {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .legend-color {
          width: 12px;
          height: 12px;
          border-radius: 50%;
        }

        .legend-text {
          font-size: 14px;
          color: var(--text-secondary);
          font-weight: 500;
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
          .distribution-container {
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

          .distribution-title {
            font-size: 24px;
          }

          .kpi-card {
            padding: 20px;
          }

          .chart-card {
            padding: 20px;
          }

          .pie-legend {
            flex-direction: column;
            align-items: center;
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
        }
      `}</style>

      <div className="distribution-container">
        {/* Header */}
        <div className="distribution-header">
          <h1 className="distribution-title">Distribution Énergétique</h1>
          <p className="distribution-subtitle">
            Surveillance de la consommation et analyse de la distribution d'énergie
          </p>
        </div>

        {/* KPIs */}
        <div className="kpi-grid">
          <KpiCard
            title="Autoconsommation"
            value={animatedKpis.autoconsommation_percent}
            unit="%"
            gradientClass="green"
            icon="🔄"
          />
          <KpiCard
            title="Dépendance Réseau"
            value={animatedKpis.dependance_reseau_percent}
            unit="%"
            gradientClass="orange"
            icon="🔌"
          />
          <KpiCard
            title="Charges Critiques"
            value={animatedKpis.critical_ratio_percent}
            unit="%"
            gradientClass="red"
            icon="⚠️"
          />
        </div>

        {/* Graphiques */}
        <div className="charts-grid">
          <ChartCard
            title="Consommation Totale (kW)"
            data={consumptionTotalData}
            lines={[{ key: "ge_power_total", color: "#ff8c5fff" }]}
          />

          <PieChartCard
            title="Répartition de la Consommation"
            data={pieData}
          />

          <ChartCard
            title="Évolution des Charges"
            data={consumptionBreakdownData}
            lines={[
              { key: "ge_body", color: "#40fcc7ff" },
              { key: "other_loads", color: "#e148f9ff" },
            ]}
          />

          <div className="chart-card">
            <h3 className="chart-title">Analyse de Performance</h3>
            <p className="chart-date" style={{
              textAlign: "right",
              width: "100%",
              fontSize: "14px",
              color: "var(--text-secondary)",
            }}>{todayDate}</p>
            
            <div style={{ padding: "20px 0" }}>
              <div className="performance-metrics">
                <div className="metric-item">
                  <span className="metric-label">Efficacité Distribution</span>
                  <div className="metric-bar">
                    <div 
                      className="metric-fill green" 
                      style={{ width: `${Math.min(animatedKpis.autoconsommation_percent, 100)}%` }}
                    ></div>
                  </div>
                  <span className="metric-value">{animatedKpis.autoconsommation_percent.toFixed(1)}%</span>
                </div>
                
                <div className="metric-item">
                  <span className="metric-label">Optimisation Réseau</span>
                  <div className="metric-bar">
                    <div 
                      className="metric-fill orange" 
                      style={{ width: `${Math.min(100 - animatedKpis.dependance_reseau_percent, 100)}%` }}
                    ></div>
                  </div>
                  <span className="metric-value">{(100 - animatedKpis.dependance_reseau_percent).toFixed(1)}%</span>
                </div>
                
                <div className="metric-item">
                  <span className="metric-label">Sécurité Charges</span>
                  <div className="metric-bar">
                    <div 
                      className="metric-fill red" 
                      style={{ width: `${Math.min(animatedKpis.critical_ratio_percent, 100)}%` }}
                    ></div>
                  </div>
                  <span className="metric-value">{animatedKpis.critical_ratio_percent.toFixed(1)}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .performance-metrics {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .metric-item {
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .metric-label {
          min-width: 140px;
          font-size: 14px;
          color: var(--text-secondary);
          font-weight: 500;
        }

        .metric-bar {
          flex: 1;
          height: 8px;
          background: var(--border-color);
          border-radius: 4px;
          overflow: hidden;
          position: relative;
        }

        .metric-fill {
          height: 100%;
          border-radius: 4px;
          transition: width 1.2s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .metric-fill.green {
          background: linear-gradient(90deg, #6a8e4e, #4a6b3a);
        }

        .metric-fill.orange {
          background: linear-gradient(90deg, #f4a261, #e76f51);
        }

        .metric-fill.red {
          background: linear-gradient(90deg, #ff6b6b, #ee5a24);
        }

        .metric-value {
          min-width: 50px;
          text-align: right;
          font-size: 14px;
          font-weight: 600;
          color: var(--text-primary);
        }

        @media (max-width: 768px) {
          .metric-item {
            flex-direction: column;
            align-items: stretch;
            gap: 8px;
          }

          .metric-label {
            min-width: auto;
            text-align: center;
          }

          .metric-value {
            text-align: center;
          }
        }
      `}</style>
    </>
  );
}