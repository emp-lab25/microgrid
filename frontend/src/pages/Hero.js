import React from "react";
import { Zap } from "lucide-react";

const Hero = () => {
  return (
    <>
      <style jsx>{`
        .hero-card {
          background: linear-gradient(135deg, var(--bg-secondary), var(--bg-primary));
          border-radius: 24px;
          padding: 60px 30px;
          text-align: center;
          position: relative; /* nécessaire pour positionner le badge */
          overflow: hidden;
          border: 1px solid var(--border-color);
          box-shadow: 0 20px 50px var(--shadow);
          animation: fadeIn 1.2s ease-in-out;
        }

        .hero-title {
          font-size: 2.8rem;
          font-weight: 800;
          background: linear-gradient(135deg, var(--text-primary), var(--text-secondary));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin-bottom: 18px;
        }

        .hero-subtitle {
          font-size: 1.2rem;
          color: var(--text-secondary);
          max-width: 700px;
          margin: 0 auto;
          line-height: 1.6;
        }

        .ai-badge2 {
          position: absolute;
          top: 20px;
          left: 20px;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          border-radius: 20px;
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          font-size: 0.85rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="hero-card">
        <div className="ai-badge2">
          <Zap size={16} /> Suivi en temps réel
        </div>
        <h1 className="hero-title">Microgrid Monitoring</h1>
        <p className="hero-subtitle">
          Surveillez en temps réel la production, le stockage et la distribution
          d’énergie de votre système Microgrid.
        </p>
      </div>
    </>
  );
};

export default Hero;
