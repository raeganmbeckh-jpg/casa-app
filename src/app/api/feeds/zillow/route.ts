import { NextResponse } from "next/server";

/* ═══════════════════════════════════════════════════════════════════
   Mock published listings
   ═══════════════════════════════════════════════════════════════════ */

interface PublishedListing {
  id: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  rent: number;
  beds: number;
  baths: number;
  sqft: number;
  description: string;
  photos: string[];
}

const PUBLISHED_LISTINGS: PublishedListing[] = [
  {
    id: "2167-villa-sonoma-glen",
    address: "2167 Villa Sonoma Glen",
    city: "Austin",
    state: "TX",
    zip: "78738",
    rent: 3200,
    beds: 3,
    baths: 2.5,
    sqft: 2150,
    description:
      "Beautifully maintained 3-bedroom home in Sonoma, Southwest Austin. Open floor plan, quartz countertops, stainless steel appliances, private patio with Hill Country views.",
    photos: [],
  },
  {
    id: "814-crescent-park-dr",
    address: "814 Crescent Park Dr",
    city: "Austin",
    state: "TX",
    zip: "78745",
    rent: 2750,
    beds: 2,
    baths: 2,
    sqft: 1480,
    description:
      "Modern 2-bedroom townhome in Crescent Park. Updated kitchen, in-unit washer/dryer, covered parking, walkable to dining and shopping.",
    photos: [],
  },
  {
    id: "305-magnolia-ct",
    address: "305 Magnolia Ct",
    city: "Round Rock",
    state: "TX",
    zip: "78664",
    rent: 1950,
    beds: 2,
    baths: 1,
    sqft: 1050,
    description:
      "Charming 2-bedroom home on a quiet cul-de-sac in Round Rock. Fenced backyard, updated flooring, convenient access to IH-35 and shopping.",
    photos: [],
  },
];

/* ═══════════════════════════════════════════════════════════════════
   GET — Zillow-compatible XML feed
   ═══════════════════════════════════════════════════════════════════ */

export async function GET() {
  const listings = PUBLISHED_LISTINGS;

  const propertyXml = listings
    .map(
      (l) => `
    <Listing>
      <Location>
        <StreetAddress>${escapeXml(l.address)}</StreetAddress>
        <City>${escapeXml(l.city)}</City>
        <State>${escapeXml(l.state)}</State>
        <Zip>${escapeXml(l.zip)}</Zip>
      </Location>
      <RentalDetails>
        <Price>${l.rent}</Price>
        <PriceFrequency>Monthly</PriceFrequency>
      </RentalDetails>
      <PropertyDetails>
        <Bedrooms>${l.beds}</Bedrooms>
        <Bathrooms>${l.baths}</Bathrooms>
        <LivingArea>${l.sqft}</LivingArea>
        <LivingAreaUnits>squareFeet</LivingAreaUnits>
        <Description>${escapeXml(l.description)}</Description>
      </PropertyDetails>
      <Pictures>
        ${
          l.photos.length > 0
            ? l.photos.map((p) => `<Picture><PictureUrl>${escapeXml(p)}</PictureUrl></Picture>`).join("\n        ")
            : "<!-- No photos available -->"
        }
      </Pictures>
      <ListingUrl>https://casa.com/listing/${l.id}</ListingUrl>
    </Listing>`
    )
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<Listings xmlns="http://www.zillow.com/static/xsd/RentalFeed.xsd">
  <ProviderName>CASA</ProviderName>
  <ProviderUrl>https://casa.com</ProviderUrl>
  <GeneratedAt>${new Date().toISOString()}</GeneratedAt>
${propertyXml}
</Listings>`;

  return new NextResponse(xml, {
    status: 200,
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=3600",
    },
  });
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
