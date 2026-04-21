import { renderToBuffer } from "@react-pdf/renderer";
import {
  GarageApiError,
  extractGarageListingId,
  fetchGarageListing,
} from "@/lib/garage";
import {
  buildInvoiceDocumentData,
  createInvoiceFilename,
} from "@/lib/invoice";
import { createGarageInvoiceDocument } from "@/lib/pdf/GarageInvoiceDocument";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RequestBody = {
  sourceUrl?: string;
};

export async function POST(request: Request) {
  let body: RequestBody;

  try {
    body = (await request.json()) as RequestBody;
  } catch {
    return Response.json(
      {
        error: "Send the Garage listing URL as JSON in the request body.",
      },
      { status: 400 },
    );
  }

  const sourceUrl = body.sourceUrl?.trim();

  if (!sourceUrl) {
    return Response.json(
      {
        error: "Paste a Garage listing URL or raw listing UUID first.",
      },
      { status: 400 },
    );
  }

  try {
    const listingId = extractGarageListingId(sourceUrl);
    const listing = await fetchGarageListing(listingId);
    const invoice = buildInvoiceDocumentData(listing);
    const pdfBuffer = await renderToBuffer(createGarageInvoiceDocument(invoice));
    const filename = createInvoiceFilename(invoice);

    return new Response(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Cache-Control": "no-store",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Type": "application/pdf",
      },
    });
  } catch (error) {
    if (error instanceof GarageApiError) {
      return Response.json({ error: error.message }, { status: error.status });
    }

    if (error instanceof Error) {
      return Response.json({ error: error.message }, { status: 400 });
    }

    return Response.json(
      {
        error: "Unable to generate the invoice right now.",
      },
      { status: 500 },
    );
  }
}
