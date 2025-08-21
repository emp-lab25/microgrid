import { useState, useEffect ,useRef} from "react";
import axios from "axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { Download, Zap, Activity, TrendingUp } from "lucide-react";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export default function QualiteReseau() {
  const API_URL = process.env.REACT_APP_API_URL;
    const chartsRef = useRef(null);
const handleExportPDF = async () => {
  if (!chartsRef.current) return;

  try {
    // ✅ Capture avec meilleure qualité
    const canvas = await html2canvas(chartsRef.current, { 
      scale: 3,  // augmente la netteté
      useCORS: true // évite les problèmes si images externes
    });
    const imgData = canvas.toDataURL("image/png", 1.0); // qualité max

    const pdf = new jsPDF("landscape", "mm", "a4");
    const imgWidth = pdf.internal.pageSize.getWidth() - 20; 
    const pageHeight = pdf.internal.pageSize.getHeight() - 30; 
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    pdf.setFontSize(18);
    pdf.text("Rapport : Qualité Réseau", 15, 15);

    // ✅ Ajout du graphique
    pdf.addImage(
      imgData,
      "PNG",
      10,
      25,
      imgWidth,
      imgHeight > pageHeight ? pageHeight : imgHeight
    );

    // ✅ Sauvegarde
    pdf.save(`qualite_reseau_${new Date().toISOString().split("T")[0]}.pdf`);
  } catch (error) {
    console.error("❌ Erreur export PDF :", error);
  }
};


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

  const [voltageFrequencyData, setVoltageFrequencyData] = useState([]);
  const [predictionData, setPredictionData] = useState([]);
  const [simulationData, setSimulationData] = useState([]);
  const [kpis, setKpis] = useState({
    avg_mg_voltage: 0,
    avg_mg_frequency: 0,
    max_voltage_diff_mccb_bus: 0,
  });

  // États pour la simulation
  const [simulationInput, setSimulationInput] = useState({
    consumption: 100,
    island_mode: false,
    pv_production: 50,
    fc_production: 30,
  });

  useEffect(() => {
    if (!API_URL) {
      console.error("❌ REACT_APP_API_URL est vide. Vérifie ton .env");
      return;
    }

    async function fetchData() {
      try {
        const endpoints = {
          voltageFrequency: `${API_URL}/network_quality/voltage_frequency`,
          kpis: `${API_URL}/network_quality/kpis`,
          predict: `${API_URL}/network_quality/predict`,
        };

        const [
          voltageFrequencyRes,
          kpisRes,
          predictRes,
        ] = await Promise.all([
          axios.get(endpoints.voltageFrequency),
          axios.get(endpoints.kpis),
          axios.get(endpoints.predict),
        ]);

        // Logs pour inspecter la structure
        // console.log("⚡ voltageFrequencyRes:", voltageFrequencyRes);
        // console.log("📊 kpisRes:", kpisRes);
        // console.log("🔮 predictRes:", predictRes);

        setVoltageFrequencyData(formatDataWithHour(voltageFrequencyRes.data));
        setKpis(kpisRes.data);
        
        // Formatage des prédictions
        const formattedPredictions = predictRes.data.map(item => ({
          ...item,
          date: new Date(item.date).toLocaleDateString("fr-FR", {
            day: "2-digit",
            month: "2-digit",
          }),
        }));
        setPredictionData(formattedPredictions);
        // console.log("Nouvelles valeurs KPIs Qualité Réseau:", kpisRes.data);
      } catch (error) {
        console.error("❌ Erreur lors du fetch des données qualité réseau :", error);
      }
    }

    fetchData();
  }, [API_URL]);

  // Fonction de simulation
  const handleSimulation = async () => {
    try {
      const response = await axios.post(`${API_URL}/network_quality/simulate`, simulationInput);
      setSimulationData(response.data);
    //   console.log("Simulation effectuée:", response.data);
    } catch (error) {
      console.error("❌ Erreur lors de la simulation :", error);
    }
  };

  // Animation des KPIs
  const [animatedKpis, setAnimatedKpis] = useState({
    avg_mg_voltage: 0,
    avg_mg_frequency: 0,
    max_voltage_diff_mccb_bus: 0,
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedKpis(kpis);
    }, 100);
    return () => clearTimeout(timer);
  }, [kpis]);

  // Fonction d'export
  const handleExport = () => {
    const exportData = {
      date: todayDate,
      kpis: animatedKpis,
      voltage_frequency_data: voltageFrequencyData,
      prediction_data: predictionData,
      simulation_data: simulationData,
    };

    const jsonString = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    saveAs(blob, `qualite_reseau_${new Date().toISOString().split('T')[0]}.json`);
  };

  // Composant KPI Card
  const KpiCard = ({ title, value, unit, gradientClass, icon }) => (
    <div className="kpi-card">
      <div className="kpi-card-header">
        <div className={`kpi-icon ${gradientClass}`}>
          <span className="kpi-icon-emoji">{icon}</span>
        </div>
        <div className="kpi-values">
          <p className="kpi-value">
            {typeof value === 'string' ? value : `${value.toFixed(2)}${unit}`}
          </p>
          <p className="kpi-title">{title}</p>
        </div>
      </div>
      <div className="kpi-progress-container">
        <div
          className={`kpi-progress ${gradientClass}`}
          style={{ 
            width: typeof value === 'string' ? '100%' : `${Math.min(Math.abs(value), 100)}%` 
          }}
        ></div>
      </div>
    </div>
  );

  // Composant Chart Card
  const ChartCard = ({ title, data, lines, height = 300, children }) => (
    <div className="chart-card">
      <h3 className="chart-title">{title}</h3>
      <p className="chart-date" style={{
        textAlign: "right",
        width: "100%",
        fontSize: "14px",
        color: "var(--text-secondary)",
      }}>{todayDate}</p>

      <div className="chart-container">
        {children || (
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
        )}
      </div>
    </div>
  );



  // Composant Chart Card
  const ChartCard2 = ({ title, data, lines, height = 300, xKey = "timestamp", children }) => (
  <div className="chart-card">
    <h3 className="chart-title">{title}</h3>
    <div className="chart-container">
      {children || (
        <ResponsiveContainer width="100%" height={height}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" opacity={0.3} />
<XAxis
  dataKey={xKey}
  stroke="var(--text-secondary)"
  fontSize={12}
  tickFormatter={(_, index) => {
    const baseDate = new Date();
    baseDate.setDate(baseDate.getDate() + 1 + index); 

    const day = baseDate.getDate();
    const month = baseDate.getMonth() + 1; 

    return `${day}/${month}`;
  }}
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
      )}
    </div>
  </div>
);

  return (
    <>
      <style jsx>{`
        /* Utilise les mêmes variables CSS que les autres pages */
        .network-quality-container {
          padding: 5%;
          padding-left: 8%;
          background-color: var(--bg-secondary);
          min-height: 100vh;
          color: var(--text-primary);
        }

        /* Header Section */
        .network-quality-header {
          margin-bottom: 40px;
          animation: fadeInUp 0.6s ease-out;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .header-content h1 {
          font-size: 32px;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 8px;
          background: linear-gradient(135deg, var(--text-primary), var(--text-secondary));
          background-clip: text;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .header-content p {
          font-size: 16px;
          color: var(--text-secondary);
          font-weight: 400;
        }

        .export-button {
          background: linear-gradient(135deg, #6a8e4e, #4a6b3a);
          color: white;
          border: none;
          border-radius: 12px;
          padding: 12px 24px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.3s ease;
          box-shadow: 0 4px 16px rgba(106, 142, 78, 0.3);
        }

        .export-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(106, 142, 78, 0.4);
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

        .kpi-icon.blue {
          background: linear-gradient(135deg, #2d473e, #1a2e23);
        }

        .kpi-icon.orange {
          background: linear-gradient(135deg, #f4a261, #e76f51);
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

        .kpi-progress.blue {
          background: linear-gradient(90deg, #2d473e, #1a2e23);
        }

        .kpi-progress.orange {
          background: linear-gradient(90deg, #f4a261, #e76f51);
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

        /* Simulation Section */
        .simulation-section {
          background: var(--bg-primary);
          border-radius: 16px;
          padding: 25px;
          margin-bottom: 40px;
          box-shadow: 0 8px 32px var(--shadow);
          border: 1px solid var(--border-color);
        }

        .simulation-controls-section {
          display: flex;
          flex-direction: column;
          margin-bottom: 30px;
        }

        .simulation-title {
          font-size: 18px;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .simulation-controls {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin-bottom: 20px;
        }

        .control-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .control-label {
          font-size: 14px;
          color: var(--text-secondary);
          font-weight: 500;
        }

        .control-input {
          padding: 10px 12px;
          border: 1px solid var(--border-color);
          border-radius: 8px;
          background: var(--bg-secondary);
          color: var(--text-primary);
          font-size: 14px;
        }

        .control-checkbox {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 8px;
        }

        .simulate-button {
          background: linear-gradient(135deg, #f4a261, #e76f51);
          color: white;
          border: none;
          border-radius: 12px;
          padding: 12px 24px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.3s ease;
          box-shadow: 0 4px 16px rgba(244, 162, 97, 0.3);
        }

        .simulate-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(244, 162, 97, 0.4);
        }

        /* Graphiques de simulation séparés */
        .simulation-charts {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 25px;
          margin-top: 20px;
        }

        /* Chart Cards */
        .charts-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 25px;
          margin-bottom: 40px;
        }

        .prediction-chart {
          grid-column: 1 / -1;
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
          .network-quality-container {
            padding: 20px;
          }

          .network-quality-header {
            flex-direction: column;
            gap: 20px;
            align-items: stretch;
          }

          .kpi-grid {
            grid-template-columns: 1fr;
            gap: 20px;
          }

          .charts-grid {
            grid-template-columns: 1fr;
            gap: 20px;
          }

          .simulation-controls {
            grid-template-columns: 1fr;
          }

          .simulation-charts {
            grid-template-columns: 1fr;
            gap: 20px;
          }

          .header-content h1 {
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

      <div className="network-quality-container">
        {/* Header */}
        <div className="network-quality-header">
          <div className="header-content">
            <h1>Qualité du Réseau</h1>
            <p>
              Surveillance de la tension, fréquence et prédictions de performance
            </p>
          </div>
          <button className="export-button" onClick={handleExportPDF}>
            <Download size={18} />
            Exporter les graphes
          </button>
        </div>

        {/* KPIs */}
        <div className="kpi-grid">
          <KpiCard
            title="Tension Moyenne"
            value={animatedKpis.avg_mg_voltage}
            unit="V"
            gradientClass="blue"
            icon="⚡"
          />
          <KpiCard
            title="Fréquence Moyenne"
            value={animatedKpis.avg_mg_frequency}
            unit="Hz"
            gradientClass="orange"
            icon="📊"
          />
          <KpiCard
            title="Écart Max Tension"
            value={animatedKpis.max_voltage_diff_mccb_bus}
            unit="V"
            gradientClass="purple"
            icon="⚠️"
          />
        </div>

        {/* Section Simulation */}
        <div className="simulation-section">
          <div className="simulation-controls-section">
            <h3 className="simulation-title">
              <Activity size={20} />
              Simulation de Qualité Réseau
            </h3>
            
            <div className="simulation-controls">
              <div className="control-group">
                <label className="control-label">Consommation (kW)</label>
                <input
                  type="number"
                  className="control-input"
                  value={simulationInput.consumption}
                  onChange={(e) => setSimulationInput({
                    ...simulationInput,
                    consumption: parseFloat(e.target.value) || 0
                  })}
                />
              </div>

              <div className="control-group">
                <label className="control-label">Production PV (kW)</label>
                <input
                  type="number"
                  className="control-input"
                  value={simulationInput.pv_production}
                  onChange={(e) => setSimulationInput({
                    ...simulationInput,
                    pv_production: parseFloat(e.target.value) || 0
                  })}
                />
              </div>

              <div className="control-group">
                <label className="control-label">Production PAC (kW)</label>
                <input
                  type="number"
                  className="control-input"
                  value={simulationInput.fc_production}
                  onChange={(e) => setSimulationInput({
                    ...simulationInput,
                    fc_production: parseFloat(e.target.value) || 0
                  })}
                />
              </div>

              <div className="control-group">
                <label className="control-checkbox">
                  <input
                    type="checkbox"
                    checked={simulationInput.island_mode}
                    onChange={(e) => setSimulationInput({
                      ...simulationInput,
                      island_mode: e.target.checked
                    })}
                  />
                  Mode Îlot
                </label>
              </div>
            </div>

            <button className="simulate-button" onClick={handleSimulation}>
              <Zap size={18} />
              Lancer Simulation
            </button>
          </div>
          {/* Graphiques de simulation séparés */}
          {simulationData.length > 0 && (
            <div className="simulation-charts">
              {/* Graphique Tension Simulation */}
              <div className="chart-card">
                <h3 className="chart-title">Simulation Tension 24h</h3>
                <div className="chart-container">
                  <ResponsiveContainer width="100%" height={280}>
                    <LineChart data={simulationData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" opacity={0.3} />
                      <XAxis 
                        dataKey="hour" 
                        stroke="var(--text-secondary)" 
                        fontSize={12}
                        label={{ value: "Heure", position: "insideBottom", offset: -5 }}
                      />
                      <YAxis 
                        stroke="var(--text-secondary)" 
                        fontSize={12}
                        label={{ value: "Tension (V)", angle: -90, position: "insideLeft" }}
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
                      <Line
                        type="monotone"
                        dataKey="simulated_voltage"
                        stroke="#814e8e"
                        strokeWidth={3}
                        dot={{ fill: "#814e8e", strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6, stroke: "#814e8e", strokeWidth: 2 }}
                        name="Tension (V)"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Graphique Fréquence Simulation */}
              <div className="chart-card">
                <h3 className="chart-title">Simulation Fréquence 24h</h3>
                <div className="chart-container">
                  <ResponsiveContainer width="100%" height={280}>
                    <LineChart data={simulationData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" opacity={0.3} />
                      <XAxis 
                        dataKey="hour" 
                        stroke="var(--text-secondary)" 
                        fontSize={12}
                        label={{ value: "Heure", position: "insideBottom", offset: -5 }}
                      />
                      <YAxis 
                        stroke="var(--text-secondary)" 
                        fontSize={12}
                        label={{ value: "Fréquence (Hz)", angle: -90, position: "insideLeft" }}
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
                      <Line
                        type="monotone"
                        dataKey="simulated_frequency"
                        stroke="#74f1ff"
                        strokeWidth={3}
                        dot={{ fill: "#74f1ff", strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6, stroke: "#74f1ff", strokeWidth: 2 }}
                        name="Fréquence (Hz)"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}
        </div>
<div ref={chartsRef}>

        {/* Graphiques */}
        <div className="charts-grid">
          <ChartCard
            title="Tensions du Réseau (V)"
            data={voltageFrequencyData}
            lines={[
              { key: "mg_lv_voltage", color: "#90f74fff" },
              { key: "receiving_voltage", color: "#eef607ff" },
              { key: "mccb_voltage", color: "#52f7fcff" },
            ]}
          />

          <ChartCard
            title="Fréquences du Réseau (Hz)"
            data={voltageFrequencyData}
            lines={[
              { key: "mg_lv_frequency", color: "#fd4a4aff" },
              { key: "mccb_frequency", color: "#f3289bff" },
            ]}
          />
        </div>

        {/* Graphique de prédictions seul */}
        <div className="prediction-chart">
          <ChartCard2
            title="Prédictions Tension (5 jours)"
            data={predictionData}
            lines={[
              { key: "mg_lv_voltage_pred", color: "#73fc49ff" },
            ]}
            xKey="date"
          />
        </div>
      </div></div>
    </>
  );
}