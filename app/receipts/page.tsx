"use client";

import Link from "next/link";
import { useState } from "react";
import { useAction, useMutation, useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { Id } from "@/convex/_generated/dataModel";
import { Header } from "@/components/trackr/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/convex/_generated/api";
import { useTrackrData } from "@/hooks/use-trackr-data";

export default function ReceiptsPage() {
  const data = useTrackrData();
  const router = useRouter();
  const list = useQuery(api.receipts.listRecent, { limit: 50 });
  const generateUploadUrl = useMutation(api.receipts.generateUploadUrl);
  const createUpload = useMutation(api.receipts.createUpload);
  const parseDraft = useMutation(api.receipts.parseDraft);
  const parseUploadedReceipt = useAction(api.ocr.parseUploadedReceipt);
  const markFailed = useMutation(api.receipts.markFailed);
  const [file, setFile] = useState<File | null>(null);
  const [rawText, setRawText] = useState("");
  const [selectedReceiptId, setSelectedReceiptId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [ocrRunning, setOcrRunning] = useState(false);

  const onCreate = async () => {
    if (!file) return;
    setUploading(true);
    try {
      const uploadUrl = await generateUploadUrl({});
      const uploadResult = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type || "application/octet-stream" },
        body: file,
      });
      if (!uploadResult.ok) {
        throw new Error("Failed to upload receipt file");
      }
      const { storageId } = (await uploadResult.json()) as { storageId: Id<"_storage"> };
      const id = await createUpload({
        fileName: file.name,
        contentType: file.type || undefined,
        storageId,
      });
      setSelectedReceiptId(id);
      setFile(null);
    } finally {
      setUploading(false);
    }
  };

  const onParse = async () => {
    if (!selectedReceiptId || !rawText.trim()) return;
    await parseDraft({ receiptId: selectedReceiptId as never, extractedText: rawText });
    setRawText("");
  };

  const onRunOcr = async () => {
    if (!selectedReceiptId) return;
    setOcrRunning(true);
    try {
      await parseUploadedReceipt({ receiptId: selectedReceiptId as never });
    } finally {
      setOcrRunning(false);
    }
  };

  return (
    <div className="min-h-dvh bg-background">
      <Header
        month={data.month}
        onMonthChange={data.setMonth}
        search={data.search}
        onSearchChange={data.setSearch}
        onAddTransaction={() => router.push("/transactions#add-transaction")}
      />
      <main className="mx-auto max-w-5xl space-y-6 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Receipts</h1>
          <p className="text-sm text-muted-foreground">Upload, parse, and prefill transactions from receipt data.</p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Add receipt file</CardTitle>
            <CardDescription>
              Upload a receipt image/PDF first, then run OCR-lite parsing from extracted text.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="receipt-file">Receipt file</Label>
              <Input
                id="receipt-file"
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
            </div>
            <Button onClick={onCreate} disabled={!file || uploading}>
              {uploading ? "Uploading..." : "Upload receipt"}
            </Button>
            <div className="space-y-2">
              <Label htmlFor="receipt-text">Extracted text</Label>
              <Input
                id="receipt-text"
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder="merchant: Koala amount: 120.50 date: 2026-04-20"
              />
            </div>
            <Button onClick={onParse} disabled={!selectedReceiptId}>
              Parse selected receipt
            </Button>
            <Button onClick={onRunOcr} disabled={!selectedReceiptId || ocrRunning} variant="outline">
              {ocrRunning ? "Running OCR..." : "Auto parse uploaded file"}
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Recent receipts</CardTitle>
            <CardDescription>{list?.length ?? 0} items</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {list?.map((receipt) => (
              <div
                key={receipt._id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border p-3"
              >
                <div>
                  <p className="font-medium">{receipt.fileName}</p>
                  <p className="text-xs text-muted-foreground">
                    status: {receipt.status}
                    {receipt.extractedAmountMinor
                      ? ` · amount: ${(receipt.extractedAmountMinor / 100).toFixed(2)}`
                      : ""}
                    {receipt.extractedDate
                      ? ` · date: ${new Date(receipt.extractedDate).toISOString().slice(0, 10)}`
                      : ""}
                    {receipt.extractedMerchant ? ` · merchant: ${receipt.extractedMerchant}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedReceiptId(receipt._id)}
                  >
                    Select
                  </Button>
                  {receipt.status === "parsed" ? (
                    <Button size="sm" asChild>
                      <Link
                        href={`/transactions?amount=${(receipt.extractedAmountMinor ?? 0) / 100}&date=${
                          receipt.extractedDate
                            ? new Date(receipt.extractedDate).toISOString().slice(0, 10)
                            : ""
                        }&merchant=${encodeURIComponent(receipt.extractedMerchant ?? "")}#add-transaction`}
                      >
                        Prefill transaction
                      </Link>
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => markFailed({ receiptId: receipt._id, reason: "Manual mark failed" })}
                    >
                      Mark failed
                    </Button>
                  )}
                </div>
              </div>
            ))}
            {(list?.length ?? 0) === 0 ? (
              <p className="text-sm text-muted-foreground">No receipts yet.</p>
            ) : null}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
