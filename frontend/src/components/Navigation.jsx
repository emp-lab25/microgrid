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
      setIsSidebarOpen(false); // en mobile, on peut aussi refermer le menu
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
          transition: all 0.3s ease;
        }

        .navbar {
          position: fixed;
          top: 0;
          // left: 243px;
          left: 19%;
          right: 0;
          // height: 70px;
          height: 15%;

          background-color: var(--bg-primary);
          border-bottom: 1px solid var(--border-color);
          display: flex;
          align-items: center;
          justify-content: flex-end;
          padding: 0 20px;
          z-index: 1000;
          box-shadow: 0 2px 10px var(--shadow);
        }

        .theme-toggle {
          width: 45px;
          height: 45px;
          border: none;
          border-radius: 50%;
          background-color: var(--bg-secondary);
          color: var(--text-secondary);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 2px 8px var(--shadow);
        }

        .theme-toggle:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px var(--shadow);
        }

        .sidebar {
          position: fixed;
          top: 0px;
          left: 0;
          // width: 250px;
          width: 19%;
          height: 100vh;
          background-color: var(--bg-primary);
          border-right: 1px solid var(--border-color);
          z-index: 999;
          overflow-y: auto;
          box-shadow: 2px 0 10px var(--shadow);
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
          // border-radius: 8px;
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
          // padding: 30px 0;
          padding: 7% 0;

        }

        .menu-item {
          display: flex;
          align-items: center;
          // gap: 15px;
          gap: 8%;
          // padding: 15px 20px;
          padding: 8% 10%;
          color: var(--text-primary);
          text-decoration: none;
          transition: all 0.3s ease;
          cursor: pointer;
          border-left: 3px solid transparent;
          margin: 2px 0;
        }

        .menu-item:hover {
          background-color: var(--hover-bg);
          border-left-color: var(--text-secondary);
          padding-left: 25px;
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
          margin-top: 70px;
          margin-left: 280px;
          padding: 30px;
          min-height: calc(100vh - 70px);
        }

        @media (max-width: 768px) {
          .navbar {
            left: 0;
          }
          
          .sidebar {
            left: ${isSidebarOpen ? '0' : '-280px'};
            transition: left 0.3s ease;
          }
          
          .main-content {
            margin-left: ${isSidebarOpen ? '280px' : '0'};
            transition: margin-left 0.3s ease;
          }
        }

        .mobile-menu-toggle {
          display: none;
          position: fixed;
          top: 15px;
          left: 15px;
          width: 40px;
          height: 40px;
          border: none;
          border-radius: 8px;
          background-color: var(--bg-primary);
          color: var(--text-secondary);
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: 1001;
          box-shadow: 0 2px 8px var(--shadow);
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
          transition: all 0.3s ease;
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

        .menu-item {
          animation: fadeIn 0.3s ease forwards;
        }
      `}</style>

      {/* Navbar */}
      <nav className="navbar">
        <button className="theme-toggle" onClick={toggleTheme}>
          {isDark ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </nav>

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

</main>

    </>
  );
};

export default Navigation;