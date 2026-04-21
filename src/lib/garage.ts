const UUID_PATTERN =
  /[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/i;

const ALLOWED_GARAGE_HOSTS = new Set([
  "shopgarage.com",
  "www.shopgarage.com",
  "garage-backend.onrender.com",
]);

const GARAGE_API_BASE_URL = "https://garage-backend.onrender.com/listings";
const GARAGE_API_TIMEOUT_MS = 8_000;

export type GarageListing = {
  id: string;
  secondaryId: number | null;
  listingTitle: string | null;
  sellingPrice: number | null;
  estimatedPriceMin: number | null;
  estimatedPriceMax: number | null;
  appraisedPrice: number | null;
  auctionStartingPrice: number | null;
  itemBrand: string | null;
  itemAge: number | null;
  listingDescription: string | null;
  deliveryMethod: string | null;
  isAuction: boolean;
  isPickupAvailable: boolean;
  createdAt: string;
  updatedAt: string;
  address: {
    state: string | null;
  } | null;
  category: {
    name: string | null;
    slug: string | null;
  } | null;
  listingImages?: Array<{
    order: number;
    url: string;
  }>;
};

export class GarageApiError extends Error {
  status: number;

  constructor(message: string, status = 500) {
    super(message);
    this.name = "GarageApiError";
    this.status = status;
  }
}

export function extractGarageListingId(input: string) {
  const source = input.trim();

  if (!source) {
    throw new Error("Paste a Garage listing URL or raw listing UUID.");
  }

  if (UUID_PATTERN.test(source) && source.length === 36) {
    return source.match(UUID_PATTERN)?.[0] ?? source;
  }

  let parsedUrl: URL | null = null;

  try {
    parsedUrl = new URL(source);
  } catch {
    parsedUrl = null;
  }

  if (parsedUrl) {
    if (!ALLOWED_GARAGE_HOSTS.has(parsedUrl.hostname)) {
      throw new Error("Please use a Garage listing URL from shopgarage.com.");
    }

    const match = parsedUrl.pathname.match(UUID_PATTERN);

    if (match?.[0]) {
      return match[0];
    }

    throw new Error("We could not find a valid listing UUID in that Garage link.");
  }

  const fallbackMatch = source.match(UUID_PATTERN);

  if (fallbackMatch?.[0]) {
    return fallbackMatch[0];
  }

  throw new Error("We could not find a valid listing UUID in that Garage link.");
}

export async function fetchGarageListing(listingId: string) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), GARAGE_API_TIMEOUT_MS);

  try {
    const response = await fetch(`${GARAGE_API_BASE_URL}/${listingId}`, {
      cache: "no-store",
      headers: {
        Accept: "application/json",
      },
      signal: controller.signal,
    });

    if (response.status === 404) {
      throw new GarageApiError("That listing could not be found in Garage.", 404);
    }

    if (!response.ok) {
      throw new GarageApiError(
        "Garage did not return listing data successfully.",
        502,
      );
    }

    const listing = (await response.json()) as Partial<GarageListing>;

    if (!listing || typeof listing !== "object" || listing.id !== listingId) {
      throw new GarageApiError(
        "Garage returned listing data in an unexpected format.",
        502,
      );
    }

    return listing as GarageListing;
  } catch (error) {
    if (error instanceof GarageApiError) {
      throw error;
    }

    if (error instanceof Error && error.name === "AbortError") {
      throw new GarageApiError("Garage took too long to respond.", 504);
    }

    if (error instanceof SyntaxError) {
      throw new GarageApiError(
        "Garage returned listing data in an unexpected format.",
        502,
      );
    }

    throw new GarageApiError("Unable to reach Garage right now.", 502);
  } finally {
    clearTimeout(timeoutId);
  }
}
