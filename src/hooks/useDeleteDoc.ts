import { Docs } from "@prisma/client"
import { useState } from "react"
import { toast } from "sonner"

export function useDeleteDoc() {
  const [isDeleting, setIsDeleting] = useState(false);

  const deleteDoc = async (doc: Docs, showConfirmation = true) => {
    if (showConfirmation) {
      const confirmed = window.confirm(
        `Êtes-vous sûr de vouloir supprimer "${doc.name}" ?\nCette action est irréversible.`
      );
      
      if (!confirmed) {
        return false;
      }
    }

    setIsDeleting(true);

    try {
      const response = await fetch(`/api/docs/${doc.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Erreur lors de la suppression');
      }

      toast.success("Document supprimé avec succès");
      return true;
      
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast.error(error instanceof Error ? error.message : "Erreur lors de la suppression");
      return false;
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    deleteDoc,
    isDeleting,
  };
}