import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const address = req.nextUrl.searchParams.get("address");
  if (!address) {
    return NextResponse.json({ error: "address parameter required" }, { status: 400 });
  }

  const key = process.env.GOOGLE_MAPS_API_KEY;
  if (!key) {
    return NextResponse.json({ error: "Google Maps API key not configured" }, { status: 500 });
  }

  const wsKey = process.env.WALK_SCORE_API_KEY;
  const encoded = encodeURIComponent(address);

  // Step 1: Geocode to get lat/lng
  let lat = 0;
  let lng = 0;
  try {
    const geoRes = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encoded}&key=${key}`
    );
    const geoData = await geoRes.json();
    const loc = geoData.results?.[0]?.geometry?.location;
    if (loc) {
      lat = loc.lat;
      lng = loc.lng;
    }
  } catch {
    // geocoding failed, continue with 0,0
  }

  // Step 2: Run all enrichment APIs in parallel
  const streetViewUrl = `https://maps.googleapis.com/maps/api/streetview?size=800x400&location=${encoded}&return_error_code=true&key=${key}`;

  const fetches: Promise<any>[] = [];

  // Solar API
  fetches.push(
    lat && lng
      ? fetch(
          `https://solar.googleapis.com/v1/buildingInsights:findClosest?location.latitude=${lat}&location.longitude=${lng}&key=${key}`
        )
          .then((r) => (r.ok ? r.json() : null))
          .catch(() => null)
      : Promise.resolve(null)
  );

  // Weather API
  fetches.push(
    lat && lng
      ? fetch(
          `https://weather.googleapis.com/v1/currentConditions:lookup?location.latitude=${lat}&location.longitude=${lng}&key=${key}`,
          { method: "GET", headers: { "Content-Type": "application/json" } }
        )
          .then((r) => (r.ok ? r.json() : null))
          .catch(() => null)
      : Promise.resolve(null)
  );

  // Walk Score API
  fetches.push(
    wsKey && lat && lng
      ? fetch(
          `https://api.walkscore.com/score?format=json&address=${encoded}&lat=${lat}&lon=${lng}&transit=1&bike=1&wsapikey=${wsKey}`
        )
          .then((r) => (r.ok ? r.json() : null))
          .catch(() => null)
      : Promise.resolve(null)
  );

  const [solarRaw, weatherRaw, walkScoreRaw] = await Promise.all(fetches);

  // Parse solar data
  let solar = null;
  if (solarRaw) {
    const panels = solarRaw.solarPotential;
    if (panels) {
      solar = {
        maxPanels: panels.maxArrayPanelsCount || null,
        maxArea: panels.maxArrayAreaMeters2
          ? Math.round(panels.maxArrayAreaMeters2 * 10.764)
          : null, // sq ft
        annualSunshineHours:
          panels.maxSunshineHoursPerYear || null,
        annualEnergy: panels.solarPanelConfigs?.[panels.solarPanelConfigs.length - 1]
          ?.yearlyEnergyDcKwh
          ? Math.round(
              panels.solarPanelConfigs[panels.solarPanelConfigs.length - 1]
                .yearlyEnergyDcKwh
            )
          : null,
        carbonOffset: panels.carbonOffsetFactorKgPerMwh
          ? Math.round(panels.carbonOffsetFactorKgPerMwh)
          : null,
      };
    }
  }

  // Parse weather data
  let weather = null;
  if (weatherRaw) {
    weather = {
      temperature: weatherRaw.temperature?.degrees
        ? Math.round(weatherRaw.temperature.degrees)
        : null,
      temperatureUnit: weatherRaw.temperature?.unit === "FAHRENHEIT" ? "°F" : "°C",
      condition: weatherRaw.condition?.description || weatherRaw.condition?.type || null,
      humidity: weatherRaw.humidity?.percent ?? weatherRaw.relativeHumidity ?? null,
      uvIndex: weatherRaw.uvIndex ?? null,
      windSpeed: weatherRaw.wind?.speed?.value
        ? Math.round(weatherRaw.wind.speed.value)
        : null,
    };
  }

  // Parse walk score
  let walkScore = null;
  if (walkScoreRaw && walkScoreRaw.walkscore !== undefined) {
    walkScore = {
      walk: walkScoreRaw.walkscore || 0,
      walkDesc: walkScoreRaw.description || "",
      transit: walkScoreRaw.transit?.score || null,
      transitDesc: walkScoreRaw.transit?.description || "",
      bike: walkScoreRaw.bike?.score || null,
      bikeDesc: walkScoreRaw.bike?.description || "",
    };
  }

  return NextResponse.json({
    streetViewUrl,
    lat,
    lng,
    solar,
    weather,
    walkScore,
    sources: [
      "ATTOM",
      "Google",
      solar ? "Solar" : null,
      weather ? "Weather" : null,
      walkScore ? "WalkScore" : null,
    ].filter(Boolean),
  });
}
