import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabase } from '@/lib/supabase';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export async function POST(req: Request) {
  const { sessionId } = await req.json();

  const session = await stripe.checkout.sessions.retrieve(sessionId);

  if (session.payment_status === 'paid') {
    const appointmentId = session.metadata?.appointmentId || '';

    if (appointmentId) {
      await supabase
        .from('appointments')
        .update({ payment_status: 'paid' })
        .eq('id', appointmentId);
    }

    return NextResponse.json({
      paid: true,
      appointmentId,
    });
  }

  return NextResponse.json({ paid: false });
}
