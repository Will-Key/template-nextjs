// hooks/useDownload.ts
import { useState } from 'react';
import { toast } from 'sonner';

interface Docs {
  id: string;
  name: string;
  filename?: string;
}

export function useDownload() {
  const [isDownloading, setIsDownloading] = useState(false);

  const downloadDoc = async (doc: Docs) => {
    if (!doc) {
      toast.error("Aucun document sélectionné");
      return;
    }

    setIsDownloading(true);

    try {
      const response = await fetch(`/api/docs/${doc.id}/download`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Erreur HTTP: ${response.status}`);
      }

      // Récupérer le nom du fichier depuis les en-têtes si disponible
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = doc.name;
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success("Téléchargement commencé");
      
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
      toast.error(error instanceof Error ? error.message : "Erreur lors du téléchargement");
    } finally {
      setIsDownloading(false);
    }
  };

  return {
    downloadDoc,
    isDownloading,
  };
}