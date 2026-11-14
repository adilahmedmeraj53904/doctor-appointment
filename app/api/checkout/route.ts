import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export async function POST(req: Request) {
  const { appointmentId } = await req.json();
  const origin = req.headers.get('origin') || 'http://localhost:3000';

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    currency: 'usd',
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Doctor Appointment - Dr. Adil Ahmed Meraj',
          },
          unit_amount: 500,
        },
        quantity: 1,
      },
    ],
    success_url: `${origin}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/book`,
    metadata: {
      appointmentId: appointmentId || '',
    },
  });

  return NextResponse.json({ url: session.url });
}
