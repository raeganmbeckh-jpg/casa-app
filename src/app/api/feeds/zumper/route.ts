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
  availableDate: string;
  petPolicy: string;
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
    availableDate: "2026-05-01",
    petPolicy: "Dogs and cats allowed",
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
    availableDate: "2026-06-01",
    petPolicy: "Dogs and cats allowed",
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
    availableDate: "2026-05-15",
    petPolicy: "Cats only",
  },
];

/* ═══════════════════════════════════════════════════════════════════
   GET — Zumper-compatible XML feed
   ═══════════════════════════════════════════════════════════════════ */

export async function GET() {
  const listings = PUBLISHED_LISTINGS;

  const propertyXml = listings
    .map(
      (l) => `
    <property>
      <external_id>${escapeXml(l.id)}</external_id>
      <street_address>${escapeXml(l.address)}</street_address>
      <city>${escapeXml(l.city)}</city>
      <state>${escapeXml(l.state)}</state>
      <zipcode>${escapeXml(l.zip)}</zipcode>
      <price>${l.rent}</price>
      <price_frequency>monthly</price_frequency>
      <bedrooms>${l.beds}</bedrooms>
      <bathrooms>${l.baths}</bathrooms>
      <sqft>${l.sqft}</sqft>
      <description>${escapeXml(l.description)}</description>
      <available_date>${l.availableDate}</available_date>
      <pet_policy>${escapeXml(l.petPolicy)}</pet_policy>
      <photos>
        ${
          l.photos.length > 0
            ? l.photos.map((p) => `<photo><url>${escapeXml(p)}</url></photo>`).join("\n        ")
            : "<!-- No photos available -->"
        }
      </photos>
      <listing_url>https://casa.com/listing/${l.id}</listing_url>
    </property>`
    )
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<feed>
  <provider>
    <name>CASA</name>
    <website>https://casa.com</website>
    <generated_at>${new Date().toISOString()}</generated_at>
  </provider>
  <properties>
${propertyXml}
  </properties>
</feed>`;

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
