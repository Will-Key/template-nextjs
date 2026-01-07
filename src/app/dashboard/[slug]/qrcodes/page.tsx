"use client";

import { useEffect, useState, use, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useStaffAuth } from "@/lib/staff-auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Loader2,
  Download,
  Printer,
  QrCode,
  RefreshCw,
  Copy,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import QRCode from "qrcode";

type Table = {
  id: string;
  number: number;
  capacity: number;
  status: string;
};

type PageParams = { slug: string };

export default function QRCodesPage({ params }: { params: Promise<PageParams> }) {
  const { slug } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { staff, isLoading: authLoading, isAuthenticated } = useStaffAuth();
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [selectedTable, setSelectedTable] = useState<string>("all");
  const [qrCodes, setQrCodes] = useState<{ [key: number]: string }>({});
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState<number | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    async function fetchRestaurant() {
      try {
        const response = await fetch(`/api/restaurants/${slug}`);
        if (!response.ok) throw new Error("Restaurant non trouvé");
        const data = await response.json();
        setRestaurantId(data.id);
      } catch (error) {
        console.error(error);
        toast.error("Restaurant non trouvé");
      }
    }
    fetchRestaurant();
  }, [slug]);

  const fetchTables = async () => {
    if (!restaurantId) return;
    try {
      const response = await fetch(`/api/tables?restaurantId=${restaurantId}`);
      if (!response.ok) throw new Error("Erreur");
      const data = await response.json();
      setTables(data.sort((a: Table, b: Table) => a.number - b.number));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (restaurantId) {
      fetchTables();
    }
  }, [restaurantId]);

  useEffect(() => {
    const tableParam = searchParams.get("table");
    if (tableParam) {
      setSelectedTable(tableParam);
    }
  }, [searchParams]);

  const generateQRCodes = async () => {
    setGenerating(true);
    const codes: { [key: number]: string } = {};

    const tablesToGenerate =
      selectedTable === "all"
        ? tables
        : tables.filter((t) => t.number === parseInt(selectedTable));

    for (const table of tablesToGenerate) {
      const url = `${baseUrl}/r/${slug}/table/${table.number}`;
      try {
        const qrDataUrl = await QRCode.toDataURL(url, {
          width: 300,
          margin: 2,
          color: {
            dark: "#000000",
            light: "#ffffff",
          },
        });
        codes[table.number] = qrDataUrl;
      } catch (error) {
        console.error(`Erreur pour table ${table.number}:`, error);
      }
    }

    setQrCodes(codes);
    setGenerating(false);
    toast.success("QR Codes générés !");
  };

  useEffect(() => {
    if (tables.length > 0 && Object.keys(qrCodes).length === 0) {
      generateQRCodes();
    }
  }, [tables]);

  const downloadQRCode = (tableNumber: number) => {
    const qrCode = qrCodes[tableNumber];
    if (!qrCode) return;

    const link = document.createElement("a");
    link.download = `table-${tableNumber}-qrcode.png`;
    link.href = qrCode;
    link.click();
    toast.success(`QR Code table ${tableNumber} téléchargé`);
  };

  const downloadAllQRCodes = () => {
    Object.keys(qrCodes).forEach((tableNumber) => {
      downloadQRCode(parseInt(tableNumber));
    });
  };

  const copyLink = async (tableNumber: number) => {
    const url = `${baseUrl}/r/${slug}/table/${tableNumber}`;
    await navigator.clipboard.writeText(url);
    setCopied(tableNumber);
    toast.success("Lien copié !");
    setTimeout(() => setCopied(null), 2000);
  };

  const printQRCodes = () => {
    const printContent = printRef.current;
    if (!printContent) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>QR Codes - ${staff?.restaurant.name}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 20px;
            }
            .qr-grid {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 30px;
            }
            .qr-item {
              text-align: center;
              padding: 20px;
              border: 2px solid #e5e7eb;
              border-radius: 12px;
              page-break-inside: avoid;
            }
            .qr-item img {
              width: 200px;
              height: 200px;
            }
            .qr-item h3 {
              margin: 15px 0 5px 0;
              font-size: 24px;
            }
            .qr-item p {
              margin: 5px 0;
              color: #6b7280;
              font-size: 14px;
            }
            .restaurant-name {
              font-size: 12px;
              color: #9ca3af;
            }
            @media print {
              .qr-grid {
                grid-template-columns: repeat(2, 1fr);
              }
            }
          </style>
        </head>
        <body>
          <div class="qr-grid">
            ${Object.entries(qrCodes)
              .map(
                ([tableNumber, qrCode]) => `
                <div class="qr-item">
                  <img src="${qrCode}" alt="QR Code Table ${tableNumber}" />
                  <h3>Table ${tableNumber}</h3>
                  <p>Scannez pour commander</p>
                  <p class="restaurant-name">${staff?.restaurant.name}</p>
                </div>
              `
              )
              .join("")}
          </div>
          <script>
            window.onload = function() {
              window.print();
              window.close();
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated || !staff) {
    return null;
  }

  const displayedTables =
    selectedTable === "all"
      ? tables
      : tables.filter((t) => t.number === parseInt(selectedTable));

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-background border-b sticky top-0 z-30">
        <div className="px-4 md:px-6 py-4 flex items-center justify-between">
          <div className="ml-10 md:ml-0">
            <h1 className="text-xl font-bold">QR Codes</h1>
            <p className="text-sm text-muted-foreground">
              Générer et imprimer les QR codes des tables
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={printQRCodes} disabled={Object.keys(qrCodes).length === 0}>
              <Printer className="h-4 w-4 mr-2" />
              Imprimer
            </Button>
            <Button onClick={downloadAllQRCodes} disabled={Object.keys(qrCodes).length === 0}>
              <Download className="h-4 w-4 mr-2" />
              Tout télécharger
            </Button>
          </div>
        </div>
      </header>

      <main className="px-4 md:px-6 py-6 space-y-6">
        {/* Filters */}
        <Card>
          <CardContent className="py-4">
            <div className="flex flex-wrap items-end gap-4">
              <div className="flex-1 min-w-[200px]">
                <Label htmlFor="tableSelect">Table</Label>
                <Select value={selectedTable} onValueChange={setSelectedTable}>
                  <SelectTrigger>
                    <SelectValue placeholder="Toutes les tables" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les tables</SelectItem>
                    {tables.map((table) => (
                      <SelectItem key={table.id} value={String(table.number)}>
                        Table {table.number}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={generateQRCodes} disabled={generating}>
                {generating ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                Régénérer
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* QR Codes Grid */}
        {tables.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <QrCode className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Aucune table</h3>
              <p className="text-muted-foreground mb-4">
                Créez d'abord des tables pour générer leurs QR codes
              </p>
              <Button onClick={() => router.push(`/dashboard/${slug}/tables`)}>
                Créer des tables
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div ref={printRef} className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {displayedTables.map((table) => (
              <Card key={table.id} className="overflow-hidden">
                <CardHeader className="pb-2 text-center">
                  <CardTitle>Table {table.number}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {table.capacity} places
                  </p>
                </CardHeader>
                <CardContent className="flex flex-col items-center">
                  {qrCodes[table.number] ? (
                    <>
                      <div className="bg-white p-4 rounded-lg shadow-inner mb-4">
                        <img
                          src={qrCodes[table.number]}
                          alt={`QR Code Table ${table.number}`}
                          className="w-48 h-48"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground text-center mb-3 break-all px-2">
                        {baseUrl}/r/{slug}/table/{table.number}
                      </p>
                      <div className="flex gap-2 w-full">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => copyLink(table.number)}
                        >
                          {copied === table.number ? (
                            <Check className="h-4 w-4 mr-1" />
                          ) : (
                            <Copy className="h-4 w-4 mr-1" />
                          )}
                          Copier
                        </Button>
                        <Button
                          size="sm"
                          className="flex-1"
                          onClick={() => downloadQRCode(table.number)}
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Télécharger
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="h-48 w-48 flex items-center justify-center bg-muted rounded-lg">
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
