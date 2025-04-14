"use client";

import { useState } from "react";
import AppHeader from "@/components/app-header";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ServiceForm } from "./ServiceForm";

export default function Page() {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <AppHeader parent="Site" child="Services" />
      <div className="mt-4 p-5 flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Services</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setOpen(true)}>Créer un service</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Créer / Modifier un service</DialogTitle>
            </DialogHeader>
            <ServiceForm />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
