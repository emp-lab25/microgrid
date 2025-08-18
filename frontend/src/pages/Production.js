"use client"; // 👈 Obligatoire pour activer le mode client

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
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  console.log("🌍 API_URL utilisée:", API_URL);

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
          { data: batteryPowerData },
          { data: batteryResponseData },
          { data: pvPowerData },
          { data: fuelCellData },
          { data: renewable },
          { data: batteryEff },
          { data: fuelReliability },
        ] = await Promise.all([
          axios.get(endpoints.batteryPower),
          axios.get(endpoints.batteryResponse),
          axios.get(endpoints.pvPower),
          axios.get(endpoints.fuelCell),
          axios.get(endpoints.renewable),
          axios.get(endpoints.batteryEff),
          axios.get(endpoints.fuelReliability),
        ]);

        // 🔎 Logs pour debug
        // console.log("🔋 Battery Power Data:", batteryPowerData);
        // console.log("🔋 Battery Response Data:", batteryResponseData);
        // console.log("☀️ PV Power Data:", pvPowerData);
        // console.log("⚡ Fuel Cell Data:", fuelCellData);
        console.log("📊 KPI Renewable %:", renewable);
        console.log("📊 KPI Battery Efficiency:", batteryEff);
        console.log("📊 KPI Fuel Cell Reliability:", fuelReliability);

        // Mise à jour des states
        setBatteryPowerData(batteryPowerData);
        setBatteryResponseData(batteryResponseData);
        setPvPowerData(pvPowerData);
        setFuelCellData(fuelCellData);

        const newKpis = {
          renewable_percentage: renewable.renewable_percentage,
          battery_efficiency: batteryEff.battery_efficiency,
          fuel_cell_reliability: fuelReliability.fuel_cell_reliability,
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
  const KpiCard = ({ title, value, unit, color, icon }) => (
    <div className="bg-card rounded-xl p-6 shadow-lg border border-border animate-fade-in transform hover:scale-105 transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${color}`}>
          <span className="text-2xl">{icon}</span>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-card-foreground">
            {value.toFixed(1)}
            {unit}
          </p>
          <p className="text-sm text-muted-foreground">{title}</p>
        </div>
      </div>
      <div className="w-full bg-muted rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all duration-1000 ease-out ${color.replace(
            "bg-",
            "bg-"
          ).split(" ")[0]}`}
          style={{ width: `${value}%` }}
        ></div>
      </div>
    </div>
  );

  // Composant Chart Card
  const ChartCard = ({ title, data, lines, height = 300 }) => (
    <div className="bg-card rounded-xl p-6 shadow-lg border border-border animate-fade-in">
      <h3 className="text-lg font-semibold text-card-foreground mb-4">
        {title}
      </h3>
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-muted)" />
          <XAxis dataKey="timestamp" stroke="var(--color-muted-foreground)" />
          <YAxis stroke="var(--color-muted-foreground)" />
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--color-card)",
              border: "1px solid var(--color-border)",
              borderRadius: "8px",
              color: "var(--color-card-foreground)",
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
  );

  return (
    <div className="space-y-6">
      {/* Titre de page */}
      <div className="animate-fade-in">
        <h1 className="text-3xl font-bold text-foreground mb-2">Production</h1>
        <p className="text-muted-foreground">
          Surveillance en temps réel de la production énergétique
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <KpiCard
          title="Pourcentage Renouvelable"
          value={animatedKpis.renewable_percentage}
          unit="%"
          color="bg-green-100 dark:bg-green-900"
          icon="🌱"
        />
        <KpiCard
          title="Efficacité Batterie"
          value={animatedKpis.battery_efficiency}
          unit="%"
          color="bg-blue-100 dark:bg-blue-900"
          icon="🔋"
        />
        <KpiCard
          title="Fiabilité Pile à Combustible"
          value={animatedKpis.fuel_cell_reliability}
          unit="%"
          color="bg-purple-100 dark:bg-purple-900"
          icon="⚡"
        />
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="Puissance Batterie"
          data={batteryPowerData}
          lines={[{ key: "battery_power", color: "#00ff88" }]}
        />

        <ChartCard
          title="Réponse Batterie"
          data={batteryResponseData}
          lines={[
            { key: "battery_power", color: "#00ff88" },
            { key: "battery_set_response", color: "#ff6b6b" },
          ]}
        />

        <ChartCard
          title="Puissance Photovoltaïque"
          data={pvPowerData}
          lines={[{ key: "pv_power", color: "#ffd93d" }]}
        />

        <ChartCard
          title="Pile à Combustible"
          data={fuelCellData}
          lines={[
            { key: "fc_power", color: "#6c5ce7" },
            { key: "fc_setpoint", color: "#a29bfe" },
            { key: "fc_set_response", color: "#fd79a8" },
          ]}
        />
      </div>
    </div>
  );
}


// Sample data
// const batteryPowerData = [
//   { timestamp: "00:00", battery_power: 45 },
//   { timestamp: "04:00", battery_power: 52 },
//   { timestamp: "08:00", battery_power: 38 },
//   { timestamp: "12:00", battery_power: 65 },
//   { timestamp: "16:00", battery_power: 58 },
//   { timestamp: "20:00", battery_power: 42 },
// ]

// const batteryResponseData = [
//   { timestamp: "00:00", battery_power: 45, battery_set_response: 48 },
//   { timestamp: "04:00", battery_power: 52, battery_set_response: 55 },
//   { timestamp: "08:00", battery_power: 38, battery_set_response: 40 },
//   { timestamp: "12:00", battery_power: 65, battery_set_response: 62 },
//   { timestamp: "16:00", battery_power: 58, battery_set_response: 60 },
//   { timestamp: "20:00", battery_power: 42, battery_set_response: 45 },
// ]

// const pvPowerData = [
//   { timestamp: "00:00", pv_power: 0 },
//   { timestamp: "04:00", pv_power: 15 },
//   { timestamp: "08:00", pv_power: 45 },
//   { timestamp: "12:00", pv_power: 85 },
//   { timestamp: "16:00", pv_power: 65 },
//   { timestamp: "20:00", pv_power: 10 },
// ]

// const fuelCellData = [
//   { timestamp: "00:00", fc_power: 25, fc_setpoint: 30, fc_set_response: 28 },
//   { timestamp: "04:00", fc_power: 32, fc_setpoint: 35, fc_set_response: 34 },
//   { timestamp: "08:00", fc_power: 28, fc_setpoint: 30, fc_set_response: 29 },
//   { timestamp: "12:00", fc_power: 40, fc_setpoint: 42, fc_set_response: 41 },
//   { timestamp: "16:00", fc_power: 35, fc_setpoint: 38, fc_set_response: 37 },
//   { timestamp: "20:00", fc_power: 30, fc_setpoint: 32, fc_set_response: 31 },
// ]

// const kpis = {
//   renewable_percentage: 78.5,
//   battery_efficiency: 94.2,
//   fuel_cell_reliability: 98.7,
// }
