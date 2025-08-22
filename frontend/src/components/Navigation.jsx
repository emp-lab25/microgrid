import React, { useState, useEffect } from 'react';
import { 
  Home, 
  Package, 
  Truck, 
  Users, 
  Activity,
  Sun,
  Moon,
  Menu,
  X
} from 'lucide-react';
import Production from '../pages/Production';
import Stockage from '../pages/Stockage';
import Distribution from '../pages/Distribution';
import Consommateurs from '../pages/Consommateurs';
import MainContent from '../pages/MainContent';
import QualiteReseau from '../pages/QualiteReseau';

const Navigation = () => {
  const [isDark, setIsDark] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Appliquer le thème au body
  useEffect(() => {
    if (isDark) {
      document.body.classList.add('dark-theme');
      document.body.classList.remove('light-theme');
    } else {
      document.body.classList.add('light-theme');
      document.body.classList.remove('dark-theme');
    }
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const menuItems = [
    { id: 'production', label: 'Production', icon: Home },
    { id: 'stockage', label: 'Stockage', icon: Package },
    { id: 'distribution', label: 'Distribution', icon: Truck },
    { id: 'consommateur', label: 'Consommateur', icon: Users },
    { id: 'qualite', label: 'Qualité Réseau', icon: Activity }
  ];

  const [activeItem, setActiveItem] = useState(null);
  
  const handleLogoClick = () => {
    setActiveItem(null);
    if (isSidebarOpen) {
      setIsSidebarOpen(false);
    }
  };

  return (
    <>
      {/* Styles CSS intégrés */}
      <style jsx>{`
        .light-theme {
          --bg-primary: #f4efe9;
          --bg-secondary: #ffffff;
          --text-primary: #2d473e;
          --text-secondary: #6a8e4e;
          --border-color: #e5e5e5;
          --hover-bg: rgba(106, 142, 78, 0.1);
          --logo-bg: #f4efe9;
          --shadow: rgba(0, 0, 0, 0.1);
          --theme-button-bg: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
          --theme-button-shadow: 0 8px 32px rgba(45, 71, 62, 0.15);
          --theme-button-hover-shadow: 0 12px 40px rgba(45, 71, 62, 0.25);
        }

        .dark-theme {
          --bg-primary: #2d473e;
          --bg-secondary: #1a2e23;
          --text-primary: #f4efe9;
          --text-secondary: #6a8e4e;
          --border-color: #4a5c54;
          --hover-bg: rgba(244, 239, 233, 0.1);
          --logo-bg: #2d473e;
          --shadow: rgba(0, 0, 0, 0.3);
          --theme-button-bg: linear-gradient(135deg, #2d473e 0%, #1a2e23 100%);
          --theme-button-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
          --theme-button-hover-shadow: 0 12px 40px rgba(0, 0, 0, 0.6);
        }

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background-color: var(--bg-secondary);
          color: var(--text-primary);
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .theme-toggle {
          position: fixed;
          top: 24px;
          right: 24px;
          width: 60px;
          height: 60px;
          border: none;
          border-radius: 50%;
          background: var(--theme-button-bg);
          color: var(--text-secondary);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: var(--theme-button-shadow);
          z-index: 1000;
          backdrop-filter: blur(20px);
          border: 1px solid var(--border-color);
        }

        .theme-toggle:hover {
          transform: translateY(-3px) scale(1.05);
          box-shadow: var(--theme-button-hover-shadow);
        }

        .theme-toggle:active {
          transform: translateY(-1px) scale(0.98);
          transition: all 0.1s ease;
        }

        .theme-toggle::before {
          content: '';
          position: absolute;
          inset: -2px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--text-secondary), var(--text-primary));
          opacity: 0;
          transition: opacity 0.3s ease;
          z-index: -1;
        }

        .theme-toggle:hover::before {
          opacity: 0.1;
        }

        .theme-icon {
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .theme-toggle:hover .theme-icon {
          transform: rotate(360deg) scale(1.1);
          filter: drop-shadow(0 2px 8px rgba(106, 142, 78, 0.3));
        }

        .sidebar {
          position: fixed;
          top: 0px;
          left: 0;
          width: 19%;
          height: 100vh;
          background-color: var(--bg-primary);
          border-right: 1px solid var(--border-color);
          z-index: 999;
          overflow-y: auto;
          box-shadow: 2px 0 10px var(--shadow);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .sidebar-header {
          padding: 25px 20px;
          border-bottom: 1px solid var(--border-color);
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .logo-image {
          width: 100%;
          height: 100%;
          transition: all 0.3s ease;
        }

        .logo-image:hover {
          transform: scale(1.05);
        }

        .brand-info {
          flex: 1;
        }

        .sidebar-title {
          font-size: 18px;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 8px;
        }

        .sidebar-subtitle {
          font-size: 14px;
          color: var(--text-secondary);
        }

        .menu-list {
          padding: 7% 0;
        }

        .menu-item {
          display: flex;
          align-items: center;
          gap: 8%;
          padding: 8% 10%;
          color: var(--text-primary);
          text-decoration: none;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: pointer;
          border-left: 3px solid transparent;
          margin: 2px 0;
        }

        .menu-item:hover {
          background-color: var(--hover-bg);
          border-left-color: var(--text-secondary);
          padding-left: 25px;
          transform: translateX(5px);
        }

        .menu-item.active {
          background-color: var(--hover-bg);
          border-left-color: var(--text-secondary);
          color: var(--text-secondary);
          font-weight: 500;
        }

        .menu-icon {
          width: 22px;
          height: 22px;
          transition: transform 0.3s ease;
        }

        .menu-item:hover .menu-icon {
          transform: scale(1.1);
        }

        .menu-text {
          font-size: 16px;
        }

        .main-content {
          margin-left: 19%;
          padding: 30px;
          min-height: 100vh;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        @media (max-width: 768px) {
          .theme-toggle {
            top: 16px;
            right: 16px;
            width: 50px;
            height: 50px;
          }
          
          .sidebar {
            left: ${isSidebarOpen ? '0' : '-280px'};
            width: 280px;
            transition: left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          }
          
          .main-content {
            margin-left: ${isSidebarOpen ? '280px' : '0'};
            transition: margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          }
        }

        .mobile-menu-toggle {
          display: none;
          position: fixed;
          top: 15px;
          left: 15px;
          width: 50px;
          height: 50px;
          border: none;
          border-radius: 12px;
          background: var(--theme-button-bg);
          color: var(--text-secondary);
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: 1001;
          box-shadow: var(--theme-button-shadow);
          backdrop-filter: blur(20px);
          border: 1px solid var(--border-color);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .mobile-menu-toggle:hover {
          transform: translateY(-2px) scale(1.05);
          box-shadow: var(--theme-button-hover-shadow);
        }

        @media (max-width: 768px) {
          .mobile-menu-toggle {
            display: flex;
          }
        }

        .overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          z-index: 998;
          opacity: ${isSidebarOpen ? '1' : '0'};
          visibility: ${isSidebarOpen ? 'visible' : 'hidden'};
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          display: none;
        }

        @media (max-width: 768px) {
          .overlay {
            display: block;
          }
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes pulseGlow {
          0%, 100% { 
            box-shadow: var(--theme-button-shadow); 
          }
          50% { 
            box-shadow: var(--theme-button-hover-shadow); 
          }
        }

        .theme-toggle:focus {
          outline: none;
          animation: pulseGlow 2s infinite;
        }

        .menu-item {
          animation: fadeIn 0.3s ease forwards;
        }
      `}</style>

      {/* Bouton de thème flottant */}
      <button className="theme-toggle" onClick={toggleTheme} title={isDark ? 'Mode clair' : 'Mode sombre'}>
        {isDark ? <Sun size={24} className="theme-icon" /> : <Moon size={24} className="theme-icon" />}
      </button>

      {/* Bouton menu mobile */}
      <button className="mobile-menu-toggle" onClick={toggleSidebar}>
        {isSidebarOpen ? <X size={18} /> : <Menu size={18} />}
      </button>

      {/* Overlay pour mobile */}
      <div className="overlay" onClick={toggleSidebar}></div>

      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header" onClick={handleLogoClick}>
          <img 
            src={isDark ? "/logo-dark.png" : "/light-logo.png"} 
            alt="Logo" 
            className="logo-image"
          />
        </div>
        
        <div className="menu-list">
          {menuItems.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <div
                key={item.id}
                className={`menu-item ${activeItem === item.id ? 'active' : ''}`}
                onClick={() => setActiveItem(item.id)}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <IconComponent className="menu-icon" />
                <span className="menu-text">{item.label}</span>
              </div>
            );
          })}
        </div>
      </aside>

      <main className="main-content">
        {activeItem === null && <MainContent />}
        {activeItem === "production" && <Production />}
        {activeItem === "stockage" && <Stockage />}
        {activeItem === "distribution" && <Distribution />}
        {activeItem === "consommateur" && <Consommateurs />}
        {activeItem === "qualite" && <QualiteReseau />}
      </main>
    </>
  );
};

export default Navigation;