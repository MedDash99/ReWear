import {NextResponse} from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

interface RequestBody {
  item: {
    id: number;
    name: string;
    imageUrl: string;
    price: number;
  };
}

export async function POST(req: Request) {
  try {
    const body: RequestBody = await req.json();

    const {item} = body;

    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: item.name,
              images: [item.imageUrl],
            },
            unit_amount: item.price * 100, // Amount in cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${req.headers.get('origin')}/success`,
      cancel_url: `${req.headers.get('origin')}/cancel`,
    });

    return NextResponse.json({sessionId: session.id});
  } catch (e: any) {
    console.log('Stripe session error', e);
    return new NextResponse(
      JSON.stringify({
        error: {
          statusCode: 500,
          message: e.message,
        },
      })
    );
  }
}
