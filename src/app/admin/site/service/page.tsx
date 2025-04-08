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

export default function Page() {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <AppHeader parent="Site" child="Services" />
      <div className="mt-4 p-5 flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Services</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setOpen(true)}>Add Service</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create a new service</DialogTitle>
            </DialogHeader>

            {/* Step 2: We'll add the form here */}
            <form className="space-y-4">
              <input
                type="text"
                placeholder="Service name"
                className="w-full px-3 py-2 border rounded"
              />
              <input
                type="text"
                placeholder="Description"
                className="w-full px-3 py-2 border rounded"
              />
              <Button type="submit" onClick={() => setOpen(false)}>
                Save
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
