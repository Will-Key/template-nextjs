"use client";

import AppHeader from "@/components/app-header";
import { Button } from "@/components/ui/button";
import { DialogHeader } from "@/components/ui/dialog";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { useEffect, useState } from "react";
import { FormationForm } from "./FormationForm";
import { FetchingDataTable } from "@/components/ui/fetching-data-table";
import {
  createActionsColumn,
  createBadgeColumn,
  createColumn,
  createCurrencyColumn,
  createDateColumn,
} from "@/lib/column-helpers";
import { Eye, Pencil, Trash } from "lucide-react";
import { formationsService } from "@/lib/api-service";
import { Formation } from "./model";
import DeleteConfirmationDialog from "@/components/ui/delete-confirmation-dialog";
import { toast } from "sonner";

export default function Page() {
  const [open, setOpen] = useState(false);
  const [refresh, setRefresh] = useState(0);
  const [formMode, setFormMode] = useState<"new" | "edit" | "view">("new");
  const [selectedFormation, setSelectedFormation] = useState<Formation | null>(
    null
  );

  const handleDeleteFormation = async (formationId: string) => {
    try {
      await formationsService.delete(formationId);
      toast.success("Formation supprimée avec succès");
      fetchFormations();
      setRefresh((prev) => prev + 1);
    } catch (error) {
      toast.error("Erreur lors de la suppression");
    }
  };

  // Définition des colonnes en utilisant les helpers
  const columns = [
    createColumn<Formation>("label", "Libellé"),

    createColumn<Formation>("days", "Jours", { enableSorting: true }),

    createColumn<Formation>("maxParticipants", "Participants Max"),

    createCurrencyColumn<Formation>("amount", "Montant", {
      currency: "XOF",
      locale: "fr-FR",
    }),

    createBadgeColumn<Formation>("modules", "Modules", {
      maxBadges: 2,
    }),

    createBadgeColumn<Formation>("status", "Statut", {
      variantMap: {
        published: "default",
        draft: "secondary",
        archived: "outline",
      },
    }),

    createDateColumn<Formation>("createdAt", "Date de création", {
      dateStyle: "medium",
      locale: "fr-FR",
    }),

    createActionsColumn<Formation>([
      {
        label: "Voir",
        icon: Eye,
        onClick: (formation) => {
          handleOpenForm(formation, "view");
        },
      },
      {
        label: "Modifier",
        icon: Pencil,
        onClick: (formation) => {
          handleOpenForm(formation, "edit");
        },
      },
      {
        label: "Supprimer",
        icon: Trash,
        renderButton: (formation) => (
          <DeleteConfirmationDialog
            itemName={`la formation "${formation.label}"`}
            onDelete={() => handleDeleteFormation(`${formation.id}`)}
            buttonLabel="Supprimer"
            buttonVariant="ghost"
            buttonSize="sm"
            showIcon={false}
          />
        ),
      },
    ]),
  ];

  // Fonction pour charger les données
  const fetchFormations = async () => {
    return await formationsService.getAll();
  };

  const handleOpenForm = (
    formation: Formation | null = null,
    formMode: "new" | "edit" | "view"
  ) => {
    setFormMode(formMode);
    setSelectedFormation(formation);
    setOpen(true);
  };

  const handleSuccess = () => {
    setOpen(false);
    fetchFormations();
    setRefresh(refresh + 1);
  };

  useEffect(() => {
    fetchFormations();
  }, []);

  return (
    <div>
      <AppHeader parent="Site" child="Formations" />
      <div className="mt-4 p-5 flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Formations</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenForm(null, "new")}>
              Créer une formation
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
              <DialogTitle>
                {formMode === "edit"
                  ? "Modifier"
                  : formMode === "new"
                  ? "Créer"
                  : "Détails"}{" "}
                formation
              </DialogTitle>
            </DialogHeader>
            <FormationForm
              formation={selectedFormation}
              mode={formMode}
              onClose={() => setOpen(false)}
              onSuccess={handleSuccess}
            />
          </DialogContent>
        </Dialog>
      </div>
      <div className="mt-4 p-5">
        <FetchingDataTable<Formation, Formation>
          key={refresh}
          columns={columns}
          fetchData={fetchFormations}
          searchColumn="label"
          searchPlaceholder="Rechercher une formation..."
          emptyMessage="Aucune formation disponible. Créez votre première formation en cliquant sur le bouton ci-dessus."
          errorMessage="Impossible de charger les formations"
        />
      </div>
    </div>
  );
}
