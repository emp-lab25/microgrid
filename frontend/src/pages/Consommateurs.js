import { useState, useEffect } from "react";
import axios from "axios";
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Edit, Trash2, Plus, Download, MapPin, Users, AlertTriangle, CheckCircle, Search } from 'lucide-react';
import ExportButton from "./ExportButton";

// Configuration des icônes Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Icônes personnalisées pour les types de consommateurs
const criticalIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const nonCriticalIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Composant Modal de Confirmation
function ConfirmationModal({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirmer', cancelText = 'Annuler', type = 'warning' }) {
  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <>
      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.75);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1001;
          animation: fadeIn 0.2s ease-out;
        }

        .confirmation-modal {
          background: white;
          border-radius: 16px;
          padding: 30px;
          width: 90%;
          max-width: 450px;
          box-shadow: 0 25px 80px rgba(0, 0, 0, 0.4);
          animation: slideUp 0.2s ease-out;
          position: relative;
        }

        .modal-header {
          display: flex;
          align-items: center;
          gap: 15px;
          margin-bottom: 20px;
        }

        .modal-icon {
          width: 50px;
          height: 50px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .modal-icon.danger {
          background: linear-gradient(135deg, #ff6b6b, #ee5a24);
          color: white;
        }

        .modal-icon.warning {
          background: linear-gradient(135deg, #f39c12, #e67e22);
          color: white;
        }

        .modal-icon.info {
          background: linear-gradient(135deg, #3498db, #2980b9);
          color: white;
        }

        .modal-content {
          flex: 1;
        }

        .modal-title {
          font-size: 20px;
          font-weight: 700;
          color: #2c3e50;
          margin: 0 0 8px 0;
        }

        .modal-message {
          font-size: 16px;
          color: #7f8c8d;
          line-height: 1.5;
          margin: 0;
        }

        .modal-actions {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #ecf0f1;
        }

        .btn {
          padding: 12px 24px;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          min-width: 100px;
        }

        .btn-cancel {
          background: #ecf0f1;
          color: #7f8c8d;
          border: 2px solid transparent;
        }

        .btn-cancel:hover {
          background: #d5dbdb;
          color: #2c3e50;
        }

        .btn-confirm {
          background: linear-gradient(135deg, #e74c3c, #c0392b);
          color: white;
          box-shadow: 0 4px 15px rgba(231, 76, 60, 0.3);
        }

        .btn-confirm:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(231, 76, 60, 0.4);
        }

        .close-button {
          position: absolute;
          top: 15px;
          right: 15px;
          background: none;
          border: none;
          cursor: pointer;
          padding: 8px;
          border-radius: 6px;
          color: #bdc3c7;
          transition: all 0.3s ease;
        }

        .close-button:hover {
          background: #ecf0f1;
          color: #7f8c8d;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>

      <div className="modal-overlay" onClick={onClose}>
        <div className="confirmation-modal" onClick={(e) => e.stopPropagation()}>
          <button className="close-button" onClick={onClose}>
            ×
          </button>
          
          <div className="modal-header">
            <div className={`modal-icon ${type}`}>
              <AlertTriangle size={24} />
            </div>
            <div className="modal-content">
              <h3 className="modal-title">{title}</h3>
              <p className="modal-message">{message}</p>
            </div>
          </div>

          <div className="modal-actions">
            <button className="btn btn-cancel" onClick={onClose}>
              {cancelText}
            </button>
            <button className="btn btn-confirm" onClick={handleConfirm}>
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// Composant Pagination
function Pagination({ currentPage, totalPages, onPageChange, itemsPerPage, totalItems }) {
  if (totalPages <= 1) return null;

  const getVisiblePages = () => {
    const pages = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      const start = Math.max(1, currentPage - 2);
      const end = Math.min(totalPages, start + maxVisible - 1);
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
    }
    
    return pages;
  };

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <>
      <style jsx>{`
        .pagination-container {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: 25px;
          padding-top: 20px;
          border-top: 2px solid #e2e8f0;
          gap: 20px;
        }

        .pagination-info {
          font-size: 14px;
          color: #718096;
          font-weight: 500;
        }

        .pagination-controls {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-left: auto;
        }

        .pagination-button {
          padding: 8px 12px;
          border: 2px solid #e2e8f0;
          border-radius: 8px;
          background: #f8fafc;
          color: #1a202c;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 14px;
          font-weight: 500;
          min-width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .pagination-button:hover:not(:disabled) {
          border-color: #6a8e4e;
          background: rgba(106, 142, 78, 0.1);
        }

        .pagination-button.active {
          background: linear-gradient(135deg, #6a8e4e, #4a6b3a);
          color: white;
          border-color: #6a8e4e;
        }

        .pagination-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        @media (max-width: 768px) {
          .pagination-container {
            flex-direction: column;
            align-items: center;
            gap: 15px;
          }

          .pagination-controls {
            margin-left: 0;
          }
        }
      `}</style>

      <div className="pagination-container">
        <div className="pagination-info">
          Affichage de {startItem} à {endItem} sur {totalItems} éléments
        </div>

        <div className="pagination-controls">
          <button
            className="pagination-button"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            ‹
          </button>

          {getVisiblePages().map((page) => (
            <button
              key={page}
              className={`pagination-button ${page === currentPage ? 'active' : ''}`}
              onClick={() => onPageChange(page)}
            >
              {page}
            </button>
          ))}

          <button
            className="pagination-button"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            ›
          </button>
        </div>
      </div>
    </>
  );
}

export default function Consommateurs() {
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
  
  const [consumers, setConsumers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingConsumer, setEditingConsumer] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'critique',
    latitude: '',
    longitude: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

  // Confirmation modal states
  const [confirmationModal, setConfirmationModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    type: 'warning'
  });

  // Récupération des données
  useEffect(() => {
    fetchConsumers();
  }, []);

  const fetchConsumers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/consumers/`);
      setConsumers(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des consommateurs:', error);
    } finally {
      setLoading(false);
    }
  };

  // Gestion du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude)
      };

      if (editingConsumer) {
        await axios.put(`${API_URL}/consumers/${editingConsumer.id}`, data);
      } else {
        await axios.post(`${API_URL}/consumers/`, data);
      }

      fetchConsumers();
      resetForm();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    }
  };

  const handleEdit = (consumer) => {
    setEditingConsumer(consumer);
    setFormData({
      name: consumer.name,
      type: consumer.type,
      latitude: consumer.latitude.toString(),
      longitude: consumer.longitude.toString()
    });
    setShowModal(true);
  };

  const handleDelete = (consumer) => {
    setConfirmationModal({
      isOpen: true,
      title: 'Confirmer la suppression',
      message: `Êtes-vous sûr de vouloir supprimer le consommateur "${consumer.name}" ? Cette action est irréversible.`,
      onConfirm: () => deleteConsumer(consumer.id),
      type: 'danger'
    });
  };

  const deleteConsumer = async (id) => {
    try {
      await axios.delete(`${API_URL}/consumers/${id}`);
      fetchConsumers();
      // Reset to first page if current page becomes empty
      const newTotal = consumers.length - 1;
      const newTotalPages = Math.ceil(newTotal / itemsPerPage);
      if (currentPage > newTotalPages && newTotalPages > 0) {
        setCurrentPage(newTotalPages);
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    }
  };

  const resetForm = () => {
    setFormData({ name: '', type: 'critique', latitude: '', longitude: '' });
    setEditingConsumer(null);
    setShowModal(false);
  };

  // Filtrage des données
  const filteredConsumers = consumers.filter(consumer => {
    const matchesSearch = consumer.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || consumer.type === filterType;
    return matchesSearch && matchesFilter;
  });

  // Pagination
  const totalPages = Math.ceil(filteredConsumers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentConsumers = filteredConsumers.slice(startIndex, endIndex);

  // Reset page when search/filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterType]);

  // Statistiques
  const stats = {
    total: consumers.length,
    critique: consumers.filter(c => c.type === 'critique').length,
    nonCritique: consumers.filter(c => c.type === 'non critique').length
  };

  return (
    <>
      <style jsx>{`
        :root {
          --bg-primary: #ffffff;
          --bg-secondary: #f8fafc;
          --text-primary: #1a202c;
          --text-secondary: #718096;
          --border-color: #e2e8f0;
          --shadow: rgba(0, 0, 0, 0.1);
        }


.export-buttons {
  display: flex;
  gap: 5px;
}

.export-buttons button {
  flex: 1;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
}

.export-buttons button:hover {
  background: #6a8e4e;
}

.cancel-button {
  display: flex;
  justify-content: flex-end;


}

.cancel-button button {
  padding: 8px 12px;
  border-radius: 6px;
  background: #6a8e4e;  
font-size: 15px;
  cursor: pointer;
}

.cancel-button button:hover {
  background: #ed1d1dff;
}



        .consumers-container {
           padding: 5%;
           padding-left: 8%;
         background-color: var(--bg-secondary);
          min-height: 100vh;
          color: var(--text-primary);
        }

        .consumers-header {
          margin-bottom: 40px;
          animation: fadeInUp 0.6s ease-out;
        }

        .consumers-title {
            font-size: 32px;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 8px;
          background: linear-gradient(135deg, var(--text-primary), var(--text-secondary));
          background-clip: text;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .consumers-subtitle {
          font-size: 18px;
          color: var(--text-secondary);
          font-weight: 400;
        }

        /* Stats Cards */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 25px;
          margin-bottom: 40px;
        }

        .stat-card {
          background: var(--bg-primary);
          border-radius: 20px;
          padding: 30px;
          box-shadow: 0 10px 40px var(--shadow);
          border: 1px solid var(--border-color);
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          animation: fadeInUp 0.6s ease-out;
          position: relative;
          overflow: hidden;
        }

        .stat-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
        }

        .stat-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, var(--text-secondary), #6a8e4e);
        }

        .stat-card.critical::before {
          background: linear-gradient(90deg, #ff6b6b, #ee5a24);
        }

        .stat-card.non-critical::before {
          background: linear-gradient(90deg, #6a8e4e, #4a6b3a);
        }

        .stat-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 15px;
        }

        .stat-icon {
          width: 60px;
          height: 60px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
        }

        .stat-icon.total {
          background: linear-gradient(135deg, #2d473e, #1a2e23);
        }

        .stat-icon.critical {
          background: linear-gradient(135deg, #ff6b6b, #ee5a24);
        }

        .stat-icon.non-critical {
          background: linear-gradient(135deg, #6a8e4e, #4a6b3a);
        }

        .stat-value {
          font-size: 32px;
          font-weight: 800;
          color: var(--text-primary);
          text-align: right;
        }

        .stat-label {
          font-size: 14px;
          color: var(--text-secondary);
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          margin-top: 8px;
        }

        /* Controls */
        .controls-section {
          background: var(--bg-primary);
          border-radius: 20px;
          padding: 30px;
          margin-bottom: 30px;
          box-shadow: 0 10px 40px var(--shadow);
          border: 1px solid var(--border-color);
        }

        .controls-row {
          display: flex;
          gap: 20px;
          align-items: center;
          flex-wrap: wrap;
        }

        .search-container {
          position: relative;
          flex: 1;
          min-width: 300px;
        }

        .search-input {
          width: 100%;
          padding: 15px 20px 15px 50px;
          border: 2px solid var(--border-color);
          border-radius: 12px;
          background: var(--bg-secondary);
          color: var(--text-primary);
          font-size: 16px;
          transition: all 0.3s ease;
        }

        .search-input:focus {
          outline: none;
          border-color: #6a8e4e;
          box-shadow: 0 0 0 3px rgba(106, 142, 78, 0.1);
        }

        .search-icon {
          position: absolute;
          left: 18px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-secondary);
        }

        .filter-select {
          padding: 15px 20px;
          border: 2px solid var(--border-color);
          border-radius: 12px;
          background: var(--bg-secondary);
          color: var(--text-primary);
          font-size: 16px;
          min-width: 180px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .filter-select:focus {
          outline: none;
          border-color: #6a8e4e;
          box-shadow: 0 0 0 3px rgba(106, 142, 78, 0.1);
        }

        .btn {
          padding: 15px 25px;
          border: none;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 10px;
          white-space: nowrap;
        }

        .btn-primary {
          background: linear-gradient(135deg, #6a8e4e, #4a6b3a);
          color: white;
          box-shadow: 0 8px 25px rgba(106, 142, 78, 0.3);
        }

        .btn-primary:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 35px rgba(106, 142, 78, 0.4);
        }

        .btn-secondary {
          background: var(--bg-secondary);
          color: var(--text-primary);
          border: 2px solid var(--border-color);
        }

        .btn-secondary:hover {
          border-color: #6a8e4e;
          background: rgba(106, 142, 78, 0.1);
        }

        /* Content Grid */
        .content-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 30px;
        }

        /* Table */
        .table-container {
          background: var(--bg-primary);
          border-radius: 20px;
          padding: 2%;
          box-shadow: 0 10px 40px var(--shadow);
          border: 1px solid var(--border-color);
          overflow: hidden;
        }

        .table-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 25px;
          padding-bottom: 20px;
          padding-top: 2% ;
          border-bottom: 2px solid var(--border-color);
        }

        .table-title {
          font-size: 20px;
          font-weight: 700;
          color: var(--text-primary);
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .table {
          width: 100%;
          border-collapse: collapse;
        }

        .table th,
        .table td {
          padding: 16px;
          text-align: left;
          border-bottom: 1px solid var(--border-color);
        }

        .table th {
          background: var(--bg-secondary);
          font-weight: 700;
          color: var(--text-secondary);
          font-size: 14px;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .table td {
          color: var(--text-primary);
          font-size: 15px;
        }

        .table tbody tr {
          transition: all 0.3s ease;
        }

        .table tbody tr:hover {
          background: var(--bg-secondary);
          transform: scale(1.01);
        }

        .type-badge {
          padding: 6px 16px;
          border-radius: 25px;
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.8px;
        }

        .type-badge.critique {
          background: rgba(255, 107, 107, 0.15);
          color: #e74c3c;
          border: 2px solid rgba(255, 107, 107, 0.3);
        }

        .type-badge.non-critique {
          background: rgba(106, 142, 78, 0.15);
          color: #27ae60;
          border: 2px solid rgba(106, 142, 78, 0.3);
        }

        .action-buttons {
          display: flex;
          gap: 10px;
        }

        .btn-icon {
          padding: 10px;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .btn-edit {
          background: rgba(52, 152, 219, 0.15);
          color: #3498db;
          border: 2px solid rgba(52, 152, 219, 0.2);
        }

        .btn-edit:hover {
          background: rgba(52, 152, 219, 0.25);
          transform: scale(1.15);
        }

        .btn-delete {
          background: rgba(231, 76, 60, 0.15);
          color: #e74c3c;
          border: 2px solid rgba(231, 76, 60, 0.2);
        }

        .btn-delete:hover {
          background: rgba(231, 76, 60, 0.25);
          transform: scale(1.15);
        }

        /* Map */
        .map-container {
          background: var(--bg-primary);
          border-radius: 20px;
          padding: 30px;
          box-shadow: 0 10px 40px var(--shadow);
          border: 1px solid var(--border-color);
          height: 100%;
        }

        .map-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 25px;
          padding-bottom: 20px;
          border-bottom: 2px solid var(--border-color);
        }

        .map-title {
          font-size: 20px;
          font-weight: 700;
          color: var(--text-primary);
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .leaflet-container {
          height: 500px;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
        }

        /* Modal */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.75);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          animation: fadeIn 0.3s ease-out;
        }

        .modal {
          background: var(--bg-primary);
          border-radius: 20px;
          padding: 40px;
          width: 90%;
          max-width: 550px;
          box-shadow: 0 25px 80px rgba(0, 0, 0, 0.3);
          animation: slideUp 0.3s ease-out;
        }

        .modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 2px solid var(--border-color);
        }

        .modal-title {
          font-size: 24px;
          font-weight: 700;
          color: var(--text-primary);
        }

        .btn-close {
          background: none;
          border: none;
          font-size: 28px;
          cursor: pointer;
          color: var(--text-secondary);
          padding: 8px;
          border-radius: 8px;
          transition: all 0.3s ease;
        }

        .btn-close:hover {
          background: var(--bg-secondary);
          color: var(--text-primary);
        }

        .form-group {
          margin-bottom: 25px;
        }

        .form-label {
          display: block;
          margin-bottom: 10px;
          font-weight: 600;
          color: var(--text-primary);
          font-size: 16px;
        }

        .form-input, .form-select {
          width: 100%;
          padding: 15px 20px;
          border: 2px solid var(--border-color);
          border-radius: 12px;
          background: var(--bg-secondary);
          color: var(--text-primary);
          font-size: 16px;
          transition: all 0.3s ease;
        }

        .form-input:focus, .form-select:focus {
          outline: none;
          border-color: #6a8e4e;
          box-shadow: 0 0 0 3px rgba(106, 142, 78, 0.1);
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        .modal-actions {
          display: flex;
          gap: 15px;
          justify-content: flex-end;
          margin-top: 35px;
          padding-top: 25px;
          border-top: 2px solid var(--border-color);
        }

        /* Loading */
        .loading {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 250px;
          color: var(--text-secondary);
          font-size: 18px;
          font-weight: 500;
        }

        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 300px;
          color: var(--text-secondary);
          text-align: center;
        }

        .empty-state h3 {
          font-size: 20px;
          margin-bottom: 10px;
          color: var(--text-primary);
        }

        /* Animations */
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(40px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(60px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        /* Responsive */
        @media (max-width: 1200px) {
          .content-grid {
            grid-template-columns: 1fr;
          }
        }
        
        @media (max-width: 768px) {
          .consumers-container {
            padding: 20px;
          }

          .controls-row {
            flex-direction: column;
            align-items: stretch;
          }

          .search-container {
            min-width: auto;
          }

          .form-row {
            grid-template-columns: 1fr;
          }

          .modal {
            width: 95%;
            padding: 30px 20px;
          }

          .table-container {
            overflow-x: auto;
          }

          .stats-grid {
            grid-template-columns: 1fr;
          }

          .consumers-title {
            font-size: 28px;
          }
        }
      `}</style>

      <div className="consumers-container">
        {/* Header */}
        <div className="consumers-header">
          <h1 className="consumers-title">Gestion des Consommateurs</h1>
          <p className="consumers-subtitle">
            Administration et localisation des consommateurs du microgrid
          </p>
        </div>

        {/* Stats */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-header">
              <div className="stat-icon total">
                <Users size={28} />
              </div>
              <div>
                <div className="stat-value">{stats.total}</div>
                <div className="stat-label">Total</div>
              </div>
            </div>
          </div>

          <div className="stat-card critical">
            <div className="stat-header">
              <div className="stat-icon critical">
                <AlertTriangle size={28} />
              </div>
              <div>
                <div className="stat-value">{stats.critique}</div>
                <div className="stat-label">Critiques</div>
              </div>
            </div>
          </div>

          <div className="stat-card non-critical">
            <div className="stat-header">
              <div className="stat-icon non-critical">
                <CheckCircle size={28} />
              </div>
              <div>
                <div className="stat-value">{stats.nonCritique}</div>
                <div className="stat-label">Non Critiques</div>
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="controls-section">
          <div className="controls-row">
            <div className="search-container">
              <Search className="search-icon" size={20} />
              <input
                type="text"
                placeholder="Rechercher un consommateur..."
                className="search-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <select
              className="filter-select"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="all">Tous les types</option>
              <option value="critique">Critique</option>
              <option value="non critique">Non critique</option>
            </select>

            <button
              className="btn btn-primary"
              onClick={() => setShowModal(true)}
            >
              <Plus size={20} />
              Nouveau
            </button>
{/* 
            <button
              className="btn btn-secondary"
              onClick={handleExport}
            >
              <Download size={20} />
              Export 
            </button> */}
            <ExportButton filteredConsumers={filteredConsumers} />

          </div>
        </div>

        {/* Content Grid */}
        <div className="content-grid">
          {/* Table */}
          <div className="table-container">
            <div className="table-header">
              <h3 className="table-title">
                <Users size={24} />
                Liste des Consommateurs
              </h3>
            </div>

            {loading ? (
              <div className="loading">Chargement des données...</div>
            ) : filteredConsumers.length === 0 ? (
              <div className="empty-state">
                <Users size={48} />
                <h3>Aucun consommateur trouvé</h3>
                <p>
                  {searchTerm || filterType !== 'all' 
                    ? 'Aucun résultat ne correspond à vos critères de recherche.' 
                    : 'Ajoutez votre premier consommateur pour commencer.'}
                </p>
              </div>
            ) : (
              <>
                <table className="table">
                  <thead>
                    <tr>
                      <th>Nom</th>
                      <th>Type</th>
                      <th>Position</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentConsumers.map((consumer) => (
                      <tr key={consumer.id}>
                        <td>{consumer.name}</td>
                        <td>
                          <span className={`type-badge ${consumer.type.replace(' ', '-')}`}>
                            {consumer.type}
                          </span>
                        </td>
                        <td>
                          {consumer.latitude.toFixed(4)}, {consumer.longitude.toFixed(4)}
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button
                              className="btn-icon btn-edit"
                              onClick={() => handleEdit(consumer)}
                              title="Modifier"
                            >
                              <Edit size={18} />
                            </button>
                            <button
                              className="btn-icon btn-delete"
                              onClick={() => handleDelete(consumer)}
                              title="Supprimer"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                  itemsPerPage={itemsPerPage}
                  totalItems={filteredConsumers.length}
                />
              </>
            )}
          </div>

          {/* Map */}
          <div className="map-container">
            <div className="map-header">
              <h3 className="map-title">
                <MapPin size={24} />
                Localisation des Consommateurs
              </h3>
            </div>

<MapContainer
  center={[32.2314, -7.9390]} // Coordonnées Green Energy Park
  zoom={13} // Zoom plus proche pour bien voir
  className="leaflet-container"
>

              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              {filteredConsumers.map((consumer) => (
                <Marker
                  key={consumer.id}
                  position={[consumer.latitude, consumer.longitude]}
                  icon={consumer.type === 'critique' ? criticalIcon : nonCriticalIcon}
                >
                  <Popup>
                    <div style={{ textAlign: 'center', padding: '8px' }}>
                      <strong style={{ fontSize: '16px' }}>{consumer.name}</strong>
                      <br />
                      <span style={{ 
                        color: consumer.type === 'critique' ? '#e74c3c' : '#27ae60',
                        fontWeight: 'bold',
                        fontSize: '14px'
                      }}>
                        {consumer.type}
                      </span>
                      <br />
                      <small style={{ color: '#7f8c8d', fontSize: '12px' }}>
                        {consumer.latitude.toFixed(4)}, {consumer.longitude.toFixed(4)}
                      </small>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </div>

        {/* Modal Form */}
        {showModal && (
          <div className="modal-overlay" onClick={resetForm}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3 className="modal-title">
                  {editingConsumer ? 'Modifier le consommateur' : 'Ajouter un consommateur'}
                </h3>
                <button className="btn-close" onClick={resetForm}>
                  ×
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label">Nom du consommateur</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Ex: Hôpital Central, École Primaire..."
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Type de consommateur</label>
                  <select
                    className="form-select"
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                    required
                  >
                    <option value="critique">Critique</option>
                    <option value="non critique">Non critique</option>
                  </select>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Latitude</label>
                    <input
                      type="number"
                      step="any"
                      className="form-input"
                      value={formData.latitude}
                      onChange={(e) => setFormData({...formData, latitude: e.target.value})}
                      placeholder="35.8833"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Longitude</label>
                    <input
                      type="number"
                      step="any"
                      className="form-input"
                      value={formData.longitude}
                      onChange={(e) => setFormData({...formData, longitude: e.target.value})}
                      placeholder="9.1167"
                      required
                    />
                  </div>
                </div>

                <div className="modal-actions">
                  <button type="button" className="btn btn-secondary" onClick={resetForm}>
                    Annuler
                  </button>
                  <button type="submit" className="btn btn-primary">
                    <Plus size={18} />
                    {editingConsumer ? 'Mettre à jour' : 'Créer'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Confirmation Modal */}
        <ConfirmationModal
          isOpen={confirmationModal.isOpen}
          onClose={() => setConfirmationModal(prev => ({ ...prev, isOpen: false }))}
          onConfirm={confirmationModal.onConfirm}
          title={confirmationModal.title}
          message={confirmationModal.message}
          type={confirmationModal.type}
        />
      </div>
    </>
  );
}