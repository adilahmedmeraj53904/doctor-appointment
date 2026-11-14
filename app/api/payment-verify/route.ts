import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export async function POST(req: Request) {
  const { sessionId } = await req.json();

  const session = await stripe.checkout.sessions.retrieve(sessionId);

  if (session.payment_status === 'paid') {
    return NextResponse.json({
      paid: true,
      appointmentId: session.metadata?.appointmentId || '',
    });
  }

  return NextResponse.json({ paid: false });
}
