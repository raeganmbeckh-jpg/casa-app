import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      propertyId,
      propertyAddress,
      unit,
      rent,
      fullName,
      email,
      phone,
      currentAddress,
      employer,
      monthlyIncome,
      moveInDate,
      references,
    } = body;

    /* ── Validation ─────────────────────────────────────────── */
    const required = [
      'propertyId',
      'fullName',
      'email',
      'phone',
      'currentAddress',
      'employer',
      'monthlyIncome',
      'moveInDate',
    ];

    for (const field of required) {
      if (!body[field]) {
        return NextResponse.json(
          { success: false, error: `Missing required field: ${field}` },
          { status: 400 },
        );
      }
    }

    if (
      !Array.isArray(references) ||
      references.length < 2 ||
      !references[0]?.name ||
      !references[0]?.phone ||
      !references[0]?.relationship ||
      !references[1]?.name ||
      !references[1]?.phone ||
      !references[1]?.relationship
    ) {
      return NextResponse.json(
        { success: false, error: 'Two complete references are required (name, phone, relationship).' },
        { status: 400 },
      );
    }

    if (typeof monthlyIncome !== 'number' || monthlyIncome <= 0) {
      return NextResponse.json(
        { success: false, error: 'Monthly income must be a positive number.' },
        { status: 400 },
      );
    }

    /* ── Simulate insert into rental_applications table ──── */
    const applicationId = `APP-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

    const applicationRecord = {
      id: applicationId,
      propertyId,
      propertyAddress,
      unit,
      rent,
      fullName,
      email,
      phone,
      currentAddress,
      employer,
      monthlyIncome,
      moveInDate,
      references,
      status: 'submitted',
      createdAt: new Date().toISOString(),
    };

    // INSERT into rental_applications — replace with actual DB call
    console.log('[CASA] New rental application submitted:', JSON.stringify(applicationRecord, null, 2));

    /* ── SmartMove screening ────────────────────────────────── */
    const smartMoveConfigured = !!process.env.SMARTMOVE_API_KEY;

    const response: Record<string, unknown> = {
      success: true,
      applicationId,
    };

    if (smartMoveConfigured) {
      response.screening = 'SmartMove screening will be initiated for this applicant.';
      console.log(`[CASA] SmartMove screening initiated for application ${applicationId}`);
    }

    return NextResponse.json(response, { status: 201 });
  } catch (err) {
    console.error('[CASA] Application submission error:', err);
    return NextResponse.json(
      { success: false, error: 'Internal server error.' },
      { status: 500 },
    );
  }
}
