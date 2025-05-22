"use client";

import AppHeader from "@/components/app-header";
import { News } from "./models";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { newsServices } from "@/lib/api-service";
import { FetchingDataTable } from "@/components/ui/fetching-data-table";
import { toast } from "sonner";
import {
  createActionsColumn,
  createColumn,
  createDateColumn,
} from "@/lib/column-helpers";
import { Eye, Pencil } from "lucide-react";
import DeleteConfirmationDialog from "@/components/ui/delete-confirmation-dialog";
import NewsForm from "./NewsForm";

export default function Page() {
  const [formMode, setFormMode] = useState<"new" | "edit" | "view">("new");
  const [selectedNews, setSelectedNews] = useState<News | null>(null);
  const [open, setOpen] = useState<boolean>(false);
  const [refresh, setRefresh] = useState<number>(0);

  const handleDeleteNews = async (NewsId: string) => {
    try {
      await newsServices.delete(NewsId);
      toast.success("News supprimée avec succès");
      fetchNews();
      setRefresh((prev) => prev + 1);
    } catch (error) {
      toast.error("Erreur lors de la suppression");
    }
  };

  // Définition des colonnes en utilisant les helpers
  const columns = [
    createColumn<News>("label", "Libellé"),

    createColumn<News>("type", "Type d'évènement"),

    createDateColumn<News>("eventDate", "Date de l'évènement", {
      dateStyle: "medium",
      locale: "fr-FR",
    }),

    createActionsColumn<News>([
      {
        label: "Voir",
        icon: Eye,
        onClick: (News) => {
          handleOpenForm(News, "view");
        },
      },
      {
        label: "Modifier",
        icon: Pencil,
        onClick: (News) => {
          handleOpenForm(News, "edit");
        },
      },
      {
        label: "Supprimer",
        renderButton: (News) => (
          <DeleteConfirmationDialog
            itemName={`l'actualité "${News.label}"`}
            onDelete={() => handleDeleteNews(`${News.id}`)}
            buttonLabel="Supprimer"
            buttonVariant="ghost"
            buttonSize="sm"
            showIcon={false}
          />
        ),
      },
    ]),
  ];

  const fetchNews = async () => {
    return await newsServices.getAll();
  };

  const handleOpenForm = (
    News: News | null = null,
    formMode: "new" | "edit" | "view"
  ) => {
    setFormMode(formMode);
    setSelectedNews(News);
    setOpen(true);
  };

  const handleSuccess = () => {
    setOpen(false);
    fetchNews();
    setRefresh(refresh + 1);
  };

  useEffect(() => {
    fetchNews();
  }, []);

  return (
    <div>
      <AppHeader parent="Site" child="Actualités" />
      <div className="mt-4 p-5 flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Actualités</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenForm(null, "new")}>
              Créer une actualité
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[660px] max-h-[660px] overflow-auto">
            <DialogHeader>
              <DialogTitle>
                {formMode === "edit"
                  ? "Modifier"
                  : formMode === "new"
                  ? "Créer"
                  : "Détails"}{" "}
                actualités
              </DialogTitle>
            </DialogHeader>
            <NewsForm
              news={selectedNews}
              mode={formMode}
              onClose={() => setOpen(false)}
              onSuccess={handleSuccess}
            />
          </DialogContent>
        </Dialog>
      </div>
      <div className="mt-4 p-5">
        <FetchingDataTable<News, News>
          key={refresh}
          columns={columns}
          fetchData={fetchNews}
          searchColumn="label"
          searchPlaceholder="Rechercher une actualité"
          emptyMessage="Aucune actualité disponible. Créez votre première actualité en cliquant sur le bouton ci-dessus."
          errorMessage="Impossible de charger les actualités"
        />
      </div>
    </div>
  );
}
