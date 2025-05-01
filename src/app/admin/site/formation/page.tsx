"use client";

import AppHeader from "@/components/app-header";
import { Button } from "@/components/ui/button";
import { DialogHeader } from "@/components/ui/dialog";
import { Formation } from "@prisma/client";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
} from "@radix-ui/react-dialog";
import { useState } from "react";

export default function Page() {
  const [open, setOpen] = useState(false);
  const [formationToEdit, setFormationToEdit] = useState<Formation | null>(
    null
  );
  const [formations, setFormations] = useState<Formation[]>([]);

  const handleOpenForm = (formation: Formation | null = null) => {
    setFormationToEdit(formation);
    setOpen(true);
  };

  return (
    <div>
      <AppHeader parent="Site" child="Formations" />
      <div className="mt-4 p-5 flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Formations</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenForm(null)}>
              Créer une formation
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {formationToEdit ? "Modifier" : "Créer"} une formation
              </DialogTitle>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
