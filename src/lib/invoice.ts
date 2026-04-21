import type { GarageListing } from "@/lib/garage";

type InvoiceField = {
  label: string;
  value: string;
};

export type InvoiceDocumentData = {
  invoiceNumber: string;
  issueDate: string;
  title: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  taxAmount: number;
  companyName: string;
  companyAddressLines: string[];
  companyPhone: string;
  billToFields: string[];
  listingUrl: string;
  itemDetailLines: string[];
  itemDescription: string | null;
  invoiceDetails: InvoiceField[];
};

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

function formatDate(date: Date | string) {
  return dateFormatter.format(new Date(date));
}

function titleCase(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
}

function formatDeliveryMethod(value: string | null | undefined) {
  if (!value?.trim()) {
    return null;
  }

  return value
    .split("_")
    .map((segment) =>
      segment.length <= 3 ? segment.toUpperCase() : titleCase(segment),
    )
    .join(" ");
}

function resolveInvoiceAmount(listing: GarageListing) {
  if (typeof listing.sellingPrice === "number") {
    return listing.sellingPrice;
  }

  if (typeof listing.auctionStartingPrice === "number") {
    return listing.auctionStartingPrice;
  }

  if (typeof listing.appraisedPrice === "number") {
    return listing.appraisedPrice;
  }

  return null;
}

function compactText(value: string | null | undefined) {
  return value?.trim() || "Not provided";
}

function summarizeDescription(value: string | null | undefined, maxLength = 420) {
  const normalized = value?.replace(/\s+/g, " ").trim();

  if (!normalized) {
    return null;
  }

  if (normalized.length <= maxLength) {
    return normalized;
  }

  return `${normalized.slice(0, maxLength - 3).trimEnd()}...`;
}

function buildInvoiceNumber(issueDate: Date, listing: GarageListing) {
  const dateStamp = issueDate.toISOString().slice(0, 10).replaceAll("-", "");
  const listingReference =
    listing.secondaryId?.toString() ?? listing.id.slice(0, 8).toUpperCase();

  return `INV-${dateStamp}-${listingReference}`;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 72);
}

function buildListingUrl(listing: GarageListing) {
  const titleSlug = slugify(listing.listingTitle?.trim() ?? "");

  if (!titleSlug) {
    return `https://www.shopgarage.com/listing/${listing.id}`;
  }

  return `https://www.shopgarage.com/listing/${titleSlug}-${listing.id}`;
}

function buildItemDetailLines(listing: GarageListing) {
  const location = compactText(listing.address?.state);
  const deliveryMethod = formatDeliveryMethod(listing.deliveryMethod);
  const pickupAvailability = listing.isPickupAvailable ? "Yes" : "No";

  return [
    location !== "Not provided" ? `Location: ${location}` : null,
    deliveryMethod ? `Delivery Method: ${deliveryMethod}` : null,
    `Pickup Available: ${pickupAvailability}`,
  ].filter((line): line is string => Boolean(line));
}

export function formatCurrency(amount: number) {
  return currencyFormatter.format(amount);
}

export function createInvoiceFilename(
  data: Pick<InvoiceDocumentData, "invoiceNumber" | "title">,
) {
  const slug = data.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);

  return `${data.invoiceNumber}-${slug || "garage-listing"}.pdf`;
}

export function buildInvoiceDocumentData(
  listing: GarageListing,
): InvoiceDocumentData {
  const resolvedAmount = resolveInvoiceAmount(listing);

  if (!resolvedAmount) {
    throw new Error(
      "This listing does not include a price we can use for an invoice yet.",
    );
  }

  const issueDate = new Date();
  const title = compactText(listing.listingTitle);
  const invoiceNumber = buildInvoiceNumber(issueDate, listing);

  return {
    invoiceNumber,
    issueDate: formatDate(issueDate),
    title,
    quantity: 1,
    unitPrice: resolvedAmount,
    amount: resolvedAmount,
    taxAmount: 0,
    companyName: "Garage Technologies, Inc.",
    companyAddressLines: [
      "123 Sample Avenue, Suite 000",
      "Example City, NY 99999",
    ],
    companyPhone: "(555) 000-0000",
    billToFields: ["Name", "Address", "Phone"],
    listingUrl: buildListingUrl(listing),
    itemDetailLines: buildItemDetailLines(listing),
    itemDescription: summarizeDescription(listing.listingDescription),
    invoiceDetails: [
      { label: "Date", value: formatDate(issueDate) },
      { label: "Invoice #", value: invoiceNumber },
    ],
  };
}
