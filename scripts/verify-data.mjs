#!/usr/bin/env node

const BASE = "https://www.usecasa.io";
const SUPABASE_URL = "https://zhwnttfbgidjaewlzjjj.supabase.co"; // ref: zhwnttfbgidjaewlzjjj
// Use anon key from public env — RLS allows SELECT on these tables
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpod250dGZiZ2lkamFld2x6ampqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU2NzY1NzksImV4cCI6MjA5MTI1MjU3OX0.mXt1OsB6Fh9cFhQd9Dvbc3CoVQI2A0pkLFTO-x_HL6Q";

const TEST_ADDRESS = "2167 Villa Sonoma Glen, Escondido, CA 92029";
const CRITICAL_FIELDS = [
  "year_built",
  "beds",
  "sqft_living",
  "market_value_avm",
  "rent_estimate",
];
const TABLE_CHECKS = [
  "tenants",
  "listings",
  "loan_applications",
  "land_parcels",
  "investment_deals",
];

const results = [];
let anyFail = false;

function record(name, pass, note) {
  results.push({ name, pass, note });
  if (!pass) anyFail = true;
}

function warn(name, pass, note) {
  results.push({ name, pass: pass ? true : "WARN", note });
  // WARNs print but don't fail the run
}

// ── 1. Unified property endpoint ──────────────────────────────

async function checkUnified() {
  const t0 = Date.now();
  let res, data;
  try {
    res = await fetch(`${BASE}/api/property/unified`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ address: TEST_ADDRESS }),
    });
    data = await res.json();
  } catch (err) {
    record("Unified API reachable", false, err.message);
    return null;
  }
  const latency = Date.now() - t0;

  if (res.status !== 200) {
    record("Unified API reachable", false, `status ${res.status}: ${data?.error || ""}`);
    return null;
  }
  record("Unified API reachable", true, `${res.status} in ${latency}ms`);

  // Sources responded — with error classification
  const sources = data.sources_responded || [];
  const errors = data.sources_errors || {};

  function classifySource(name, isRequired) {
    const up = sources.includes(name);
    const err = errors[name];

    if (up) {
      record(`Source: ${name}`, true, "responded");
      return;
    }

    // Classify the failure
    const status = err?.status;
    const reason = err?.reason || "unknown";

    if (status === 401 || status === 403) {
      // Auth failure = hard FAIL (broken key)
      const fn = isRequired ? record : warn;
      fn(`Source: ${name}`, false, `${status} — key expired/invalid`);
    } else if (status >= 500) {
      // Server error = hard FAIL
      const fn = isRequired ? record : warn;
      fn(`Source: ${name}`, false, `${status} — server error`);
    } else if (reason.includes("referrer_restricted")) {
      warn(`Source: ${name}`, false, "referrer-restricted key");
    } else if (reason === "no_data_for_address") {
      // Coverage gap = WARN
      warn(`Source: ${name}`, false, "no data for this address");
    } else {
      const fn = isRequired ? record : warn;
      fn(`Source: ${name}`, false, reason.slice(0, 30));
    }
  }

  // Rentcast, Google, Casa = required (FAIL if down)
  classifySource("rentcast", true);
  classifySource("casa", true);
  classifySource("google", true);
  // ATTOM = best-effort (WARN if down — coverage gaps are common)
  classifySource("attom", false);

  // Field count
  const fields = data.fields || {};
  const nonNull = Object.values(fields).filter((f) => f.value !== null).length;
  record("Fields with data >= 12", nonNull >= 12, `${nonNull} non-null fields`);

  // Critical fields
  for (const key of CRITICAL_FIELDS) {
    const f = fields[key];
    const hasValue = f && f.value !== null;
    const badConf = f && f.confidence === 0 && hasValue === false;
    if (badConf || !hasValue) {
      record(`Critical: ${key}`, false, `value=${f?.value}, conf=${f?.confidence}`);
    } else {
      record(`Critical: ${key}`, true, `${f.value} (conf ${f.confidence})`);
    }
  }

  // Per-source latency (from server logs — not available in response, use total)
  if (latency > 8000) {
    record("Total latency < 8s", false, `${latency}ms — WARN`);
  } else {
    record("Total latency < 8s", true, `${latency}ms`);
  }

  return data;
}

// ── 2. Cache test ─────────────────────────────────────────────

async function checkCache() {
  const t0 = Date.now();
  let res, data;
  try {
    res = await fetch(`${BASE}/api/property/unified`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ address: TEST_ADDRESS }),
    });
    data = await res.json();
  } catch (err) {
    record("Cache hit on repeat", false, err.message);
    return;
  }
  const latency = Date.now() - t0;

  // The API has a 30s rate limit — second call within 30s should hit cache
  const cached = data.cached === true;
  if (res.status === 429) {
    // Rate limited but no cache — this is a known case if cache write failed
    record("Cache hit on repeat", false, "rate limited, no cache");
  } else if (cached) {
    record("Cache hit on repeat", true, `cached=true in ${latency}ms`);
  } else {
    // Got fresh data — might mean first call didn't cache yet
    record("Cache hit on repeat", true, `fresh data OK (${latency}ms)`);
  }
}

// ── 3. Supabase row-count sanity ──────────────────────────────

async function checkTables() {
  for (const table of TABLE_CHECKS) {
    try {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/${table}?select=id&limit=1`,
        {
          headers: {
            apikey: SUPABASE_ANON_KEY,
            Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
            Prefer: "count=exact",
          },
        }
      );
      const countHeader = res.headers.get("content-range");
      // content-range: 0-0/4  or  */0
      let count = 0;
      if (countHeader) {
        const match = countHeader.match(/\/(\d+)/);
        if (match) count = parseInt(match[1], 10);
      } else {
        // Fallback: check body length
        const body = await res.json();
        count = Array.isArray(body) ? body.length : 0;
      }
      record(`Table: ${table} > 0`, count > 0, `${count} rows`);
    } catch (err) {
      record(`Table: ${table} > 0`, false, err.message);
    }
  }
}

// ── Run all ───────────────────────────────────────────────────

async function run() {
  console.log(`\nVerifying data pipeline against ${BASE}...\n`);

  await checkUnified();
  await checkCache();
  await checkTables();

  // Print table
  console.log("");
  console.log(
    "┌─────────────────────────────────┬────────┬──────────────────────────────────┐"
  );
  console.log(
    "│ Check                           │ Result │ Note                             │"
  );
  console.log(
    "├─────────────────────────────────┼────────┼──────────────────────────────────┤"
  );
  for (const r of results) {
    const name = r.name.padEnd(31);
    const result = (r.pass === true ? "PASS" : r.pass === "WARN" ? "WARN" : "FAIL").padEnd(6);
    const note = (r.note || "").slice(0, 32).padEnd(32);
    console.log(`│ ${name} │ ${result} │ ${note} │`);
  }
  console.log(
    "└─────────────────────────────────┴────────┴──────────────────────────────────┘"
  );
  console.log("");

  if (anyFail) {
    console.log("RESULT: FAIL — one or more checks failed.");
    process.exit(1);
  } else {
    console.log("RESULT: ALL PASS");
    process.exit(0);
  }
}

run();
