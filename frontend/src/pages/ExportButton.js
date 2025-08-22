import { useState } from "react";
import { Download } from "lucide-react";
import { jsPDF } from "jspdf";


export default function ExportButton({ filteredConsumers }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleExport = (format) => {
    const dataToExport = filteredConsumers;

    switch (format) {
      case "pdf":
        exportToPDF(dataToExport);
        break;
      case "csv":
        exportToCSV(dataToExport);
        break;
      case "json":
        exportToJSON(dataToExport);
        break;
      case "markdown":
        exportToMarkdown(dataToExport);
        break;
      default:
        break;
    }
    setIsModalOpen(false); // fermer le modal après le choix
  };


const exportToPDF = (data) => {
  // Crée un nouveau document PDF
  const doc = new jsPDF();

  // Titre du PDF
  doc.setFontSize(16);
  doc.text("Liste des Consommateurs", 10, 20);

  // En-tête du tableau
  doc.setFontSize(12);
  doc.text("Nom", 10, 30);
  doc.text("Type", 60, 30);
  doc.text("Latitude", 110, 30);
  doc.text("Longitude", 160, 30);

  // Données
  let y = 40; // position verticale de départ
  data.forEach((item) => {
    doc.text(item.name, 10, y);
    doc.text(item.type, 60, y);
    doc.text(item.latitude.toString(), 110, y);
    doc.text(item.longitude.toString(), 160, y);
    y += 10; // saut de ligne
  });

  // Téléchargement du PDF
  doc.save("consommateurs.pdf");
};


  const exportToCSV = (data) => {
    const headers = ["Nom", "Type", "Latitude", "Longitude"];
    const csvContent = [
      headers.join(","),
      ...data.map((item) =>
        [`"${item.name}"`, `"${item.type}"`, item.latitude, item.longitude].join(
          ","
        )
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "consommateurs.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToJSON = (data) => {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "consommateurs.json");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToMarkdown = (data) => {
    const mdContent = [
      "# Liste des Consommateurs",
      "",
      `**Total:** ${data.length} consommateurs`,
      "",
      "| Nom | Type | Latitude | Longitude |",
      "|------|------|----------|-----------|",
      ...data.map(
        (item) => `| ${item.name} | ${item.type} | ${item.latitude} | ${item.longitude} |`
      ),
    ].join("\n");

    const blob = new Blob([mdContent], { type: "text/markdown" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "consommateurs.md");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <button
        className="btn btn-secondary flex items-center gap-2"
        onClick={() => setIsModalOpen(true)}
      >
        <Download size={20} />
        Export
      </button>

{/* Modal */}
{isModalOpen && (
  <div className="modal-overlay"
style={{
      zIndex: 9999,
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0,0,0,0.5)", // overlay semi-transparent
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
    }}
    >
    <div className="confirmation-modal"   style={{
        backgroundColor: "white",
        borderRadius: "12px",
        padding: "2%",
        width: "520px",
        // textAlign: "center",
        boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
      }}
>
      <h2 className="modal-header">Choisir le format</h2>

      {/* Boutons d'export côte à côte avec 5px d'espace */}
      <div className="export-buttons">
        <button onClick={() => handleExport("pdf")}>PDF</button>
        <button onClick={() => handleExport("csv")}>CSV</button>
        <button onClick={() => handleExport("json")}>JSON</button>
        <button onClick={() => handleExport("markdown")}>Markdown</button>
      </div>
<br/>
      {/* Bouton Annuler en bas à droite */}
      <div className="cancel-button">
        <button onClick={() => setIsModalOpen(false)}>Annuler</button>
      </div>
    </div>
  </div>
)}



    </>
  );
}
