#!/usr/bin/env node

const BASE = "https://www.usecasa.io";
const BYPASS = "?access=raegan-2026-builder";

const checks = [
  { name: "Homepage", url: `${BASE}/`, method: "GET", expectStatus: 200 },
  { name: "Manager dashboard", url: `${BASE}/workspace/manager${BYPASS}`, method: "GET", expectStatus: 200, rejectBody: "Application error" },
  { name: "Investor dashboard", url: `${BASE}/workspace/investor${BYPASS}`, method: "GET", expectStatus: 200, rejectBody: "Application error" },
  { name: "Developer dashboard", url: `${BASE}/workspace/developer${BYPASS}`, method: "GET", expectStatus: 200, rejectBody: "Application error" },
  { name: "Land dashboard", url: `${BASE}/workspace/land${BYPASS}`, method: "GET", expectStatus: 200, rejectBody: "Application error" },
  { name: "Broker dashboard", url: `${BASE}/workspace/broker${BYPASS}`, method: "GET", expectStatus: 200, rejectBody: "Application error" },
  { name: "Lender dashboard", url: `${BASE}/workspace/lender${BYPASS}`, method: "GET", expectStatus: 200, rejectBody: "Application error" },
  { name: "Unified property API", url: `${BASE}/api/property/unified`, method: "POST", expectStatus: 200, body: JSON.stringify({ address: "412 Maple Ave, San Diego, CA 92103" }), headers: { "Content-Type": "application/json" } },
];

async function run() {
  const results = [];
  let anyFail = false;

  for (const check of checks) {
    try {
      const opts = { method: check.method, redirect: "follow" };
      if (check.body) opts.body = check.body;
      if (check.headers) opts.headers = check.headers;

      const res = await fetch(check.url, opts);
      const status = res.status;
      // For workspace pages, the bypass param sets a cookie and redirects to /select-role
      // Follow that redirect — we accept 200 or 307 (redirect to set cookie then page loads)
      let pass = false;
      let note = "";

      if (check.expectStatus === 200) {
        // Accept 200 directly, or 307 redirect (cookie set flow)
        if (status === 200) {
          if (check.rejectBody) {
            const body = await res.text();
            if (body.includes(check.rejectBody)) {
              pass = false;
              note = `body contains "${check.rejectBody}"`;
            } else {
              pass = true;
            }
          } else {
            pass = true;
          }
        } else if (status === 307) {
          // Redirect is expected for the bypass flow — it sets cookie then redirects
          pass = true;
          note = "redirect (cookie set)";
        } else {
          pass = false;
          note = `status ${status}`;
        }
      }

      results.push({ name: check.name, pass, note: note || `${status}` });
      if (!pass) anyFail = true;
    } catch (err) {
      results.push({ name: check.name, pass: false, note: err.message });
      anyFail = true;
    }
  }

  // Print table
  console.log("");
  console.log("┌─────────────────────────────┬────────┬──────────────────────────┐");
  console.log("│ Check                       │ Result │ Note                     │");
  console.log("├─────────────────────────────┼────────┼──────────────────────────┤");
  for (const r of results) {
    const name = r.name.padEnd(27);
    const result = (r.pass ? "PASS" : "FAIL").padEnd(6);
    const note = (r.note || "").slice(0, 24).padEnd(24);
    console.log(`│ ${name} │ ${result} │ ${note} │`);
  }
  console.log("└─────────────────────────────┴────────┴──────────────────────────┘");
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
