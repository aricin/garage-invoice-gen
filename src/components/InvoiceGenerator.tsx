"use client";

import { DownloadIcon, Link2Icon } from "@radix-ui/react-icons";
import { type SyntheticEvent, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

function parseDownloadFilename(contentDisposition: string | null) {
  if (!contentDisposition) {
    return "garage-invoice.pdf";
  }

  const utfMatch = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i);

  if (utfMatch?.[1]) {
    return decodeURIComponent(utfMatch[1]);
  }

  const filenameMatch = contentDisposition.match(/filename="([^"]+)"/i);

  return filenameMatch?.[1] ?? "garage-invoice.pdf";
}

async function readErrorMessage(response: Response) {
  const contentType = response.headers.get("content-type");

  if (contentType?.includes("application/json")) {
    const payload = (await response.json()) as { error?: string };
    return payload.error ?? "Unable to generate the invoice PDF.";
  }

  return "Unable to generate the invoice PDF.";
}

export function InvoiceGenerator() {
  const [sourceUrl, setSourceUrl] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const statusMessage = error ?? successMessage;
  const statusToneClass = error ? "text-red-600" : "text-emerald-700";

  async function handleSubmit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();

    setError(null);
    setSuccessMessage(null);
    setIsGenerating(true);

    try {
      const response = await fetch("/api/invoice", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sourceUrl,
        }),
      });

      if (!response.ok) {
        throw new Error(await readErrorMessage(response));
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const filename = parseDownloadFilename(
        response.headers.get("content-disposition"),
      );
      const anchor = document.createElement("a");

      anchor.href = downloadUrl;
      anchor.download = filename;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.URL.revokeObjectURL(downloadUrl);

      setSuccessMessage("Invoice PDF generated and downloaded.");
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to generate the invoice PDF.",
      );
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <section className="w-full space-y-6">
      <div className="max-w-3xl">
        <h1 className="text-3xl font-semibold tracking-tight text-brand-ink sm:text-4xl">
          Garage Invoice Generator
        </h1>
      </div>

      <form className="space-y-3" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="sm:flex-1">
            <Input
              aria-label="Garage listing URL"
              autoCapitalize="none"
              autoCorrect="off"
              placeholder="Paste a listing URL"
              spellCheck={false}
              startIcon={<Link2Icon />}
              value={sourceUrl}
              onChange={(event) => setSourceUrl(event.target.value)}
              wrapperClassName="h-13 rounded-lg bg-white"
            />
          </div>
          <Button
            variant="orange"
            size="default"
            className="h-13 rounded-lg px-6"
            disabled={isGenerating || !sourceUrl.trim()}
            type="submit"
          >
            <span className="mr-2 inline-flex items-center [&_svg]:size-4">
              <DownloadIcon />
            </span>
            {isGenerating ? "Downloading..." : "Download PDF"}
          </Button>
        </div>

        <div
          aria-atomic="true"
          aria-live={error ? "assertive" : "polite"}
          className="min-h-5"
        >
          <p
            className={`text-sm font-medium transition-opacity ${
              statusMessage ? `opacity-100 ${statusToneClass}` : "opacity-0"
            }`}
          >
            {statusMessage ?? ""}
          </p>
        </div>
      </form>
    </section>
  );
}
