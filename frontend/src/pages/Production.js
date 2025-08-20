
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

export default function Production() {
  const API_URL = process.env.REACT_APP_API_URL;
    // Formatage date du jour
  const todayDate = new Date().toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  //   garder que l'heure
  const formatDataWithHour = (data) =>
    data.map((d) => ({
      ...d,
      timestamp: new Date(d.timestamp).toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    }));
  // console.log(" API_URL utilisée:", API_URL);

  const [batteryPowerData, setBatteryPowerData] = useState([]);
  const [batteryResponseData, setBatteryResponseData] = useState([]);
  const [pvPowerData, setPvPowerData] = useState([]);
  const [fuelCellData, setFuelCellData] = useState([]);
  const [kpis, setKpis] = useState({
    renewable_percentage: 0,
    battery_efficiency: 0,
    fuel_cell_reliability: 0,
  });

  useEffect(() => {
    if (!API_URL) {
      console.error("❌ NEXT_PUBLIC_API_URL est vide. Vérifie ton .env.local");
      return;
    }

    async function fetchData() {
      try {
        const endpoints = {
          batteryPower: `${API_URL}/production/battery_power`,
          batteryResponse: `${API_URL}/production/battery_set_response`,
          pvPower: `${API_URL}/production/pv_power`,
          fuelCell: `${API_URL}/production/fuel_cell`,
          renewable: `${API_URL}/production/kpi/renewable_percentage`,
          batteryEff: `${API_URL}/production/kpi/battery_efficiency`,
          fuelReliability: `${API_URL}/production/kpi/fuel_cell_reliability`,
        };
    const [
      batteryPowerRes,
      batteryResponseRes,
      pvPowerRes,
      fuelCellRes,
      renewableRes,
      batteryEffRes,
      fuelReliabilityRes,
    ] = await Promise.all([
      axios.get(endpoints.batteryPower),
      axios.get(endpoints.batteryResponse),
      axios.get(endpoints.pvPower),
      axios.get(endpoints.fuelCell),
      axios.get(endpoints.renewable),
      axios.get(endpoints.batteryEff),
      axios.get(endpoints.fuelReliability),
    ]);

    //  Logs pour inspecter la structure
    // console.log("🔋 batteryPowerRes:", batteryPowerRes);
    // console.log("📈 batteryResponseRes:", batteryResponseRes);
    // console.log("☀️ pvPowerRes:", pvPowerRes);
    // console.log("⚡ fuelCellRes:", fuelCellRes);
    // console.log("🌱 renewableRes:", renewableRes);
    // console.log("🔌 batteryEffRes:", batteryEffRes);
    // console.log("🛠 fuelReliabilityRes:", fuelReliabilityRes);

    // setBatteryPowerData(batteryPowerRes.data);
    // setBatteryResponseData(batteryResponseRes.data);
    // setPvPowerData(pvPowerRes.data);
    // setFuelCellData(fuelCellRes.data);

    setBatteryPowerData(formatDataWithHour(batteryPowerRes.data));
    setBatteryResponseData(formatDataWithHour(batteryResponseRes.data));
    setPvPowerData(formatDataWithHour(pvPowerRes.data));
    setFuelCellData(formatDataWithHour(fuelCellRes.data));

    const newKpis = {
      renewable_percentage: renewableRes.data.renewable_percentage,
      battery_efficiency: batteryEffRes.data.battery_efficiency,
      fuel_cell_reliability: fuelReliabilityRes.data.fuel_cell_reliability,
    };

    setKpis(newKpis);
        console.log("Nouvelle valeur KPIs:", newKpis);
      } catch (error) {
        console.error("❌ Erreur lors du fetch des données :", error);
      }
    }

    fetchData();
  }, [API_URL]);

  // Animation des KPIs
  const [animatedKpis, setAnimatedKpis] = useState({
    renewable_percentage: 0,
    battery_efficiency: 0,
    fuel_cell_reliability: 0,
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedKpis(kpis);
    }, 100);
    return () => clearTimeout(timer);
  }, [kpis]);

  useEffect(() => {
    console.log("KPIs mis à jour :", kpis);
  }, [kpis]);

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
      <p className="chart-date"  style={{
    textAlign: "right",
    width: "100%",
    fontSize: "14px",
    color: "var(--text-secondary)",
    // marginTop: "-24px", // optionnel pour remonter si besoin
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
                value: lines[0].key, 
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

  return (
    <>
      <style jsx>{`
        /* Utilise les mêmes variables CSS que Navigation */
        .production-container {
          // padding: 30px;
          padding: 5%;
          padding-left: 8%;
          background-color: var(--bg-secondary);
          min-height: 100vh;
          color: var(--text-primary);
        }

        /* Header Section */
        .production-header {
          margin-bottom: 40px;
          animation: fadeInUp 0.6s ease-out;
        }

        .production-title {
          font-size: 32px;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 8px;
          background: linear-gradient(135deg, var(--text-primary), var(--text-secondary));
          background-clip: text;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .production-subtitle {
          font-size: 16px;
          color: var(--text-secondary);
          font-weight: 400;
        }

        /* KPI Cards 
        .kpi-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 25px;
          margin-bottom: 40px;
        }*/
       .kpi-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr); /* Toujours 3 KPI sur une ligne */
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

        .kpi-icon.blue {
          background: linear-gradient(135deg, #2d473e, #1a2e23);
        }

        .kpi-icon.purple {
          background: linear-gradient(135deg, #5a4a6b, #3a2e4a);
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

        .kpi-progress.purple {
          background: linear-gradient(90deg, #5a4a6b, #3a2e4a);
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
          // grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
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
          .production-container {
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

          .production-title {
            font-size: 24px;
          }

          .kpi-card {
            padding: 20px;
          }

          .chart-card {
            padding: 20px;
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

      <div className="production-container">
        {/* Header */}
        <div className="production-header">
          <h1 className="production-title">Production Énergétique</h1>
          <p className="production-subtitle">
            Surveillance en temps réel de la production et des performances du système
          </p>
        </div>

        {/* KPIs */}
        <div className="kpi-grid">
          <KpiCard
            title="Énergie Renouvelable"
            value={animatedKpis.renewable_percentage}
            unit="%"
            gradientClass="green"
            icon="🌱"
          />
          <KpiCard
            title="Efficacité Batterie"
            value={animatedKpis.battery_efficiency}
            unit="%"
            gradientClass="blue"
            icon="🔋"
          />
          <KpiCard
            // title="Fiabilité Pile à Combustible"
            title="Fiabilité PAC"
            value={animatedKpis.fuel_cell_reliability}
            unit="%"
            gradientClass="purple"
            icon="⚡"
          />
        </div>

        {/* Graphiques */}
        <div className="charts-grid">
          <ChartCard
            title="Puissance Batterie (kW)"
            data={batteryPowerData}
            lines={[{ key: "battery_power", color: "#9ff35fff" }]}
          />

          <ChartCard
            title="Réponse Batterie vs Consigne"
            data={batteryResponseData}
            lines={[
              { key: "battery_power", color: "#c609f6ff" },
              { key: "battery_set_response", color: "#74f1ffff" },
            ]}
          />

          <ChartCard
            title="Production Photovoltaïque (kW)"
            data={pvPowerData}
            lines={[{ key: "pv_power", color: "#ffa860ff" }]}
          />

          <ChartCard
            title="Pile à Combustible - Performance"
            data={fuelCellData}
            lines={[
              { key: "fc_power", color: "#f705dbff" },
              { key: "fc_setpoint", color: "#4e02b2ff" },
              { key: "fc_set_response", color: "#fb3671ff" },
            ]}
          />
        </div>
      </div>
    </>
  );
}
