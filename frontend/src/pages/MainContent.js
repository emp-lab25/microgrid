import React from 'react';
import { 
  Battery, 
  Sun, 
  Zap, 
  Users, 
  Activity,
  TrendingUp,
  Shield,
  MapPin,
  BarChart3,
  Gauge,
  Brain,
  Cpu,
  Sparkles
} from 'lucide-react';
import Hero from './Hero';

const MainContent = () => {
  return (
    <>
      {/* Styles CSS intégrés pour MainContent */}
      <style jsx>{`
        .main-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 40px 20px;
        }

        .hero-section {
          text-align: center;
          margin-bottom: 60px;
          padding: 80px 40px;
          background: linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-secondary) 100%);
          border-radius: 24px;
          box-shadow: 0 20px 60px var(--shadow);
          border: 1px solid var(--border-color);
          position: relative;
          overflow: hidden;
        }

        .hero-section::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(45deg, transparent 30%, rgba(106, 142, 78, 0.05) 50%, transparent 70%);
          pointer-events: none;
        }

        .hero-title {
          font-size: 4.5rem;
          font-weight: 900;
          color: var(--text-primary);
          margin-bottom: 32px;
          line-height: 1.1;
          letter-spacing: -0.02em;
          position: relative;
          z-index: 1;
          background: linear-gradient(135deg, var(--text-primary), var(--text-secondary));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .hero-description {
          font-size: 1.4rem;
          color: var(--text-secondary);
          line-height: 1.8;
          max-width: 1000px;
          margin: 0 auto;
          text-align: justify;
          position: relative;
          z-index: 1;
          font-weight: 400;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(450px, 1fr));
          gap: 40px;
          margin-top: 60px;
          align-items: stretch;
        }

        .feature-card {
          background-color: var(--bg-secondary);
          border-radius: 24px;
          padding: 40px;
          box-shadow: 0 15px 40px var(--shadow);
          transition: all 0.4s ease;
          border: 1px solid var(--border-color);
          position: relative;
          overflow: hidden;
          backdrop-filter: blur(10px);
          display: flex;
          flex-direction: column;
          height: 100%;
        }

           .feature-card2 {
          background-color: var(--bg-secondary);
          border-radius: 24px;
          padding: 40px;
          box-shadow: 0 15px 40px var(--shadow);
          transition: all 0.4s ease;
          border: 1px solid var(--border-color);
          position: relative;
          overflow: hidden;
          backdrop-filter: blur(10px);
          display: flex;
          flex-direction: column;
          height: 100%;
        }

        .feature-card:hover {
          transform: translateY(-12px) scale(1.02);
          box-shadow: 0 30px 80px var(--shadow);
        }

        .feature-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 6px;
          background: linear-gradient(90deg, var(--text-secondary), var(--text-primary));
          border-radius: 24px 24px 0 0;
        }

        .feature-card.ai-enhanced::before {
          background: linear-gradient(90deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4);
          height: 8px;
          animation: shimmer 3s ease-in-out infinite;
        }

        @keyframes shimmer {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }

        .feature-card::after {
          content: '';
          position: absolute;
          top: 20px;
          right: 20px;
          width: 80px;
          height: 80px;
          background: radial-gradient(circle, var(--hover-bg) 0%, transparent 70%);
          border-radius: 50%;
          opacity: 0.3;
        }

        .feature-header {
          display: flex;
          align-items: center;
          gap: 24px;
          margin-bottom: 32px;
          position: relative;
          z-index: 2;
        }

        .feature-icon {
          width: 70px;
          height: 70px;
          background: linear-gradient(135deg, var(--hover-bg), var(--bg-primary));
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-secondary);
          box-shadow: 0 10px 25px var(--shadow);
          transition: all 0.4s ease;
          position: relative;
        }

        .ai-enhanced .feature-icon {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .ai-enhanced .feature-icon::before {
          content: '';
          position: absolute;
          top: -2px;
          left: -2px;
          right: -2px;
          bottom: -2px;
          background: linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4);
          border-radius: 22px;
          z-index: -1;
          animation: rotate 4s linear infinite;
        }

        @keyframes rotate {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .feature-card:hover .feature-icon {
          transform: rotate(8deg) scale(1.15);
        }

        .feature-title {
          font-size: 1.8rem;
          font-weight: 800;
          color: var(--text-primary);
          margin: 0;
          line-height: 1.3;
          flex: 1;
        }

        .ai-badge {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
          display: flex;
          align-items: center;
          gap: 6px;
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
          animation: pulse 2s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }

        .feature-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 28px;
        }

        .feature-section {
          position: relative;
          z-index: 2;
        }

        .section-title {
          font-weight: 800;
          color: var(--text-secondary);
          margin-bottom: 18px;
          font-size: 1.1rem;
          text-transform: uppercase;
          letter-spacing: 1.2px;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .section-title::before {
          content: '';
          width: 5px;
          height: 20px;
          background: linear-gradient(180deg, var(--text-secondary), var(--text-primary));
          border-radius: 3px;
        }

        .section-content {
          color: var(--text-primary);
          font-size: 1rem;
          line-height: 1.7;
          text-align: justify;
        }

        .fields-list {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          justify-content: flex-start;
        }

        .field-tag {
          background: linear-gradient(135deg, var(--hover-bg), var(--bg-primary));
          color: var(--text-secondary);
          padding: 10px 18px;
          border-radius: 25px;
          font-size: 0.9rem;
          font-weight: 700;
          border: 1px solid var(--border-color);
          transition: all 0.3s ease;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }

        .field-tag:hover {
          transform: translateY(-3px) scale(1.05);
          box-shadow: 0 8px 20px rgba(0,0,0,0.15);
        }

        .kpi-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
          gap: 16px;
        }

        .kpi-item {
          background: linear-gradient(135deg, var(--bg-primary), var(--hover-bg));
          padding: 20px;
          border-radius: 16px;
          font-size: 0.95rem;
          text-align: center;
          color: var(--text-primary);
          font-weight: 700;
          border: 1px solid var(--border-color);
          transition: all 0.3s ease;
          box-shadow: 0 6px 15px rgba(0,0,0,0.08);
          position: relative;
          overflow: hidden;
        }

        .kpi-item::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, var(--text-secondary), var(--text-primary));
        }

        .kpi-item:hover {
          transform: translateY(-5px) scale(1.03);
          box-shadow: 0 12px 25px rgba(0,0,0,0.12);
        }

        .graph-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 16px;
        }

        .graph-item {
          padding: 18px 24px;
          color: var(--text-primary);
          font-size: 1rem;
          background: linear-gradient(135deg, var(--hover-bg), transparent);
          border-left: 5px solid var(--text-secondary);
          border-radius: 0 12px 12px 0;
          transition: all 0.3s ease;
          font-weight: 600;
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        }

        .graph-item:hover {
          background: linear-gradient(135deg, var(--hover-bg), var(--bg-primary));
          transform: translateX(12px) scale(1.02);
          box-shadow: 0 8px 20px rgba(0,0,0,0.1);
        }

        .ai-features {
          background: linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1));
          border-radius: 16px;
          padding: 24px;
          border: 2px solid rgba(102, 126, 234, 0.2);
          position: relative;
          overflow: hidden;
        }

        .ai-features::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, #667eea, #764ba2);
        }

        .ai-feature-item {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px 20px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 12px;
          margin-bottom: 12px;
          transition: all 0.3s ease;
          border: 1px solid rgba(102, 126, 234, 0.1);
        }

        .ai-feature-item:hover {
          transform: translateX(8px);
          background: rgba(102, 126, 234, 0.1);
          box-shadow: 0 8px 25px rgba(102, 126, 234, 0.2);
        }

        .ai-icon {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #667eea, #764ba2);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
        }

        .ai-feature-text {
          flex: 1;
          font-weight: 600;
          color: var(--text-primary);
        }

        @media (max-width: 768px) {
          .hero-title {
            font-size: 3.2rem;
          }
          
          .hero-section {
            padding: 60px 24px;
          }
          
          .features-grid {
            grid-template-columns: 1fr;
            gap: 30px;
          }
          
          .feature-card {
            padding: 32px 24px;
          }
          
          .kpi-grid, .graph-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 480px) {
          .hero-title {
            font-size: 2.5rem;
          }
          
          .main-container {
            padding: 5%;
            
          }
          
          .fields-list {
            justify-content: center;
          }
        }
      `}</style>

      <div className="main-container" style={{ marginTop: "2%" }}>
            <Hero />

        {/* Section Hero */}
        {/* <div className="hero-section">
          <h1 className="hero-title">Microgrid Monitoring</h1>
          <p className="hero-description">
            Une application de suivi en temps réel d'un microgrid avec les sections : 
            Production, Stockage, Distribution, Consommateurs et Qualité du Réseau. 
            Surveillez et optimisez votre système énergétique avec des données précises, des analyses avancées et de l'intelligence artificielle.
          </p>
        </div> */}

        {/* Grille des fonctionnalités */}
        <div className="features-grid">
          {/* 1. Production d'énergie */}
          <div className="feature-card">
            <div className="feature-header">
              <div className="feature-icon">
                <Sun size={28} />
              </div>
              <h2 className="feature-title">Production d'énergie</h2>
            </div>
            
            <div className="feature-content">
              <div className="feature-section">
                <div className="section-title">Champs surveillés</div>
                <div className="fields-list">
                  <span className="field-tag">battery_power</span>
                  <span className="field-tag">battery_set_response</span>
                  <span className="field-tag">pv_power</span>
                  <span className="field-tag">fc_power</span>
                  <span className="field-tag">fc_setpoint</span>
                  <span className="field-tag">fc_set_response</span>
                  <span className="field-tag">ge_power_total</span>
                </div>
              </div>

              <div className="feature-section">
                <div className="section-title">Graphiques disponibles</div>
                <div className="graph-grid">
                  <div className="graph-item">Battery Power</div>
                  <div className="graph-item">Battery Set Response vs Power</div>
                  <div className="graph-item">PV Power</div>
                  <div className="graph-item">Fuel Cell Power vs Setpoint</div>
                </div>
              </div>

              <div className="feature-section">
                <div className="section-title">Indicateurs clés</div>
                <div className="kpi-grid">
                  <div className="kpi-item">% énergie renouvelable</div>
                  <div className="kpi-item">Rendement batterie</div>
                  <div className="kpi-item">Fiabilité fuel cell</div>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Stockage d'énergie */}
          <div className="feature-card">
            <div className="feature-header">
              <div className="feature-icon">
                <Battery size={28} />
              </div>
              <h2 className="feature-title">Stockage d'énergie</h2>
            </div>
            
            <div className="feature-content">
              <div className="feature-section">
                <div className="section-title">Champs surveillés</div>
                <div className="fields-list">
                  <span className="field-tag">battery_power</span>
                  <span className="field-tag">fc_power</span>
                </div>
              </div>

              <div className="feature-section">
                <div className="section-title">Graphiques disponibles</div>
                <div className="graph-grid">
                  <div className="graph-item">SOC de la batterie</div>
                  <div className="graph-item">Contribution fuel cell</div>
                </div>
              </div>

              <div className="feature-section">
                <div className="section-title">Indicateurs clés</div>
                <div className="kpi-grid">
                  <div className="kpi-item">Autonomie batterie</div>
                  <div className="kpi-item">% contribution fuel cell</div>
                  <div className="kpi-item">Alertes système</div>
                </div>
              </div>
            </div>
          </div>

          {/* 3. Distribution de l'électricité */}
          <div className="feature-card">
            <div className="feature-header">
              <div className="feature-icon">
                <Zap size={28} />
              </div>
              <h2 className="feature-title"> Distribution de l'électricité</h2>
            </div>
            
            <div className="feature-content">
              <div className="feature-section">
                <div className="section-title">Champs surveillés</div>
                <div className="fields-list">
                  <span className="field-tag">ge_power_total</span>
                  <span className="field-tag">ge_power_body</span>
                  <span className="field-tag">mccb_power</span>
                </div>
              </div>

              <div className="feature-section">
                <div className="section-title">Graphiques disponibles</div>
                <div className="graph-grid">
                  <div className="graph-item">Répartition consommation (donut/Sankey)</div>
                  <div className="graph-item">Évolution consommation</div>
                </div>
              </div>

              <div className="feature-section">
                <div className="section-title">Indicateurs clés</div>
                <div className="kpi-grid">
                  <div className="kpi-item">Autoconsommation</div>
                  <div className="kpi-item">Dépendance réseau</div>
                  <div className="kpi-item">Conso critique vs totale</div>
                </div>
              </div>
            </div>
          </div>

          {/* 4. Gestion des consommateurs */}
          <div className="feature-card">
            <div className="feature-header">
              <div className="feature-icon">
                <Users size={28} />
              </div>
              <h2 className="feature-title">Gestion des consommateurs</h2>
            </div>
            
            <div className="feature-content">
              <div className="feature-section">
                <div className="section-title">Champs CRUD</div>
                <div className="fields-list">
                  <span className="field-tag">name</span>
                  <span className="field-tag">type</span>
                  <span className="field-tag">latitude</span>
                  <span className="field-tag">longitude</span>
                </div>
              </div>

              <div className="feature-section">
                <div className="section-title">Fonctionnalités</div>
                <div className="graph-grid">
                  <div className="graph-item">Carte interactive (Leaflet)</div>
                  <div className="graph-item">CRUD complet</div>
                  <div className="graph-item">Détails consommation</div>
                  <div className="graph-item">Export CSV</div>
                </div>
              </div>

              <div className="feature-section">
                <div className="section-title">Outils de gestion</div>
                <div className="kpi-grid">
                  <div className="kpi-item">Localisation GPS</div>
                  <div className="kpi-item">Profils de consommation</div>
                  <div className="kpi-item">Rapports détaillés</div>
                </div>
              </div>
            </div>
          </div>


        </div>
                  {/* 5. Qualité du réseau - VERSION IA AVANCÉE */}
<div className="feature-card2 ai-enhanced" style={{ marginTop: "2%" }}>
            <div className="feature-header">
              <div className="feature-icon">
                <Activity size={28} />
              </div>
              <div style={{ flex: 1 }}>
                <h2 className="feature-title"> Qualité du réseau</h2>
                <div className="ai-badge">
                  <Brain size={14} />
                  IA Avancée
                </div>
              </div>
            </div>
            
            <div className="feature-content">
              <div className="feature-section">
                <div className="section-title">Graphiques temps réel</div>
                <div className="graph-grid">
                  <div className="graph-item">Tension/fréquence (aujourd'hui)</div>
                </div>
              </div>

              <div className="feature-section">
                <div className="section-title">Indicateurs clés</div>
                <div className="kpi-grid">
                  <div className="kpi-item">Tension moyenne</div>
                  <div className="kpi-item">Fréquence moyenne</div>
                  <div className="kpi-item">Écart max tension</div>
                </div>
              </div>

              <div className="feature-section">
                <div className="section-title">Fonctionnalités avancées</div>
                <div className="ai-features">
                  <div className="ai-feature-item">
                    <div className="ai-icon">
                      <Cpu size={20} />
                    </div>
                    <div className="ai-feature-text">
                      Simulation mode îlot - Consommation vs Production
                    </div>
                  </div>
                  <div className="ai-feature-item">
                    <div className="ai-icon">
                      <TrendingUp size={20} />
                    </div>
                    <div className="ai-feature-text">
                      Prédiction voltage sur 5 jours via modèle ML
                    </div>
                  </div>
                  {/* <div className="ai-feature-item">
                    <div className="ai-icon">
                      <Sparkles size={20} />
                    </div>
                    <div className="ai-feature-text">
                      Optimisation automatique des paramètres réseau
                    </div>
                  </div> */}
                </div>
              </div>
            </div>
          </div>
      </div>
    </>
  );
};

export default MainContent;