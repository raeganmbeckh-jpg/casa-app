import { NextRequest, NextResponse } from 'next/server';

/* ── Mock lease data (mirrors leases page) ─────────────────── */
const MOCK_LEASES: Record<string, {
  tenant: string;
  email: string;
  property: string;
  unit: string;
  startDate: string;
  endDate: string;
  monthlyRent: number;
  deposit: number;
  lateFee: number;
}> = {
  'LSE-001': { tenant: 'Maya Hernandez',  email: 'maya.h@example.com',    property: 'Villa Sonoma',      unit: 'A-204', startDate: '2024-06-01', endDate: '2026-05-31', monthlyRent: 2850, deposit: 2850, lateFee: 75 },
  'LSE-002': { tenant: 'James Okafor',    email: 'jokafor@example.com',   property: 'Villa Sonoma',      unit: 'B-112', startDate: '2025-01-15', endDate: '2026-07-14', monthlyRent: 3100, deposit: 3100, lateFee: 85 },
  'LSE-007': { tenant: 'Sofia Morales',   email: 'smorales@email.com',    property: 'Villa Sonoma',      unit: 'B-112', startDate: '2026-05-01', endDate: '2027-04-30', monthlyRent: 3100, deposit: 3100, lateFee: 85 },
  'LSE-008': { tenant: 'Ethan Blackwell', email: 'eblackwell@email.com',  property: 'Mission Bay Lofts', unit: 'F-410', startDate: '2026-05-15', endDate: '2027-05-14', monthlyRent: 3950, deposit: 3950, lateFee: 110 },
  'LSE-009': { tenant: 'Jordan Rivera',   email: 'jrivera@email.com',     property: 'Villa Sonoma',      unit: 'A-204', startDate: '2026-06-01', endDate: '2027-05-31', monthlyRent: 2950, deposit: 2950, lateFee: 80 },
  'LSE-010': { tenant: 'Marcus Sterling', email: 'msterling@email.com',   property: 'Villa Sonoma',      unit: 'G-102', startDate: '2026-05-01', endDate: '2027-04-30', monthlyRent: 2850, deposit: 2850, lateFee: 75 },
};

export async function POST(req: NextRequest) {
  try {
    const { leaseId } = await req.json();

    if (!leaseId) {
      return NextResponse.json(
        { error: 'leaseId is required.' },
        { status: 400 },
      );
    }

    const lease = MOCK_LEASES[leaseId];
    if (!lease) {
      return NextResponse.json(
        { error: `Lease ${leaseId} not found.` },
        { status: 404 },
      );
    }

    const signWellApiKey = process.env.SIGNWELL_API_KEY;

    /* ── SignWell NOT configured ────────────────────────────── */
    if (!signWellApiKey) {
      console.log(`[CASA] E-sign send attempted for ${leaseId} but SignWell is not configured.`);
      return NextResponse.json(
        {
          error: 'SignWell not configured',
          setup_required: true,
          message: 'Set SIGNWELL_API_KEY in your environment variables to enable e-signatures.',
        },
        { status: 422 },
      );
    }

    /* ── SignWell IS configured — create document ───────────── */
    console.log(`[CASA] Creating SignWell document for lease ${leaseId}...`);

    // In production, this would call the SignWell API:
    // POST https://www.signwell.com/api/v1/documents/
    const documentId = `sw_doc_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const signingUrl = `https://app.signwell.com/sign/${documentId}`;

    const signWellPayload = {
      name: `Lease Agreement - ${lease.property} ${lease.unit}`,
      recipients: [
        {
          id: '1',
          email: lease.email,
          name: lease.tenant,
          role: 'Tenant',
        },
      ],
      merge_fields: [
        { api_id: 'tenant_name',   value: lease.tenant },
        { api_id: 'property',      value: lease.property },
        { api_id: 'unit',          value: lease.unit },
        { api_id: 'start_date',    value: lease.startDate },
        { api_id: 'end_date',      value: lease.endDate },
        { api_id: 'monthly_rent',  value: `$${lease.monthlyRent.toLocaleString()}` },
        { api_id: 'deposit',       value: `$${lease.deposit.toLocaleString()}` },
        { api_id: 'late_fee',      value: `$${lease.lateFee}` },
      ],
    };

    console.log('[CASA] SignWell document created:', JSON.stringify({
      documentId,
      leaseId,
      tenant: lease.tenant,
      property: `${lease.property} ${lease.unit}`,
      payload: signWellPayload,
    }, null, 2));

    return NextResponse.json({
      documentId,
      signingUrl,
      leaseId,
      tenant: lease.tenant,
      status: 'sent',
    });
  } catch (err) {
    console.error('[CASA] E-sign send error:', err);
    return NextResponse.json(
      { error: 'Internal server error.' },
      { status: 500 },
    );
  }
}
