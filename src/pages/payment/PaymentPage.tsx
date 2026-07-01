import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { useOrder, useCreatePaymentIntent } from '../../api/hooks';
import { PageLoader, Button, ErrorMessage } from '../../components/ui';
import type { PaymentIntentResponse } from '../../types';

const stripePromise = loadStripe(
  import.meta.env.VITE_STRIPE_PK || 'pk_test_REPLACE_WITH_YOUR_PUBLISHABLE_KEY'
);

// ===== Inner Payment Form =====

function PaymentForm({
  clientSecret,
  orderId,
  amount,
  currency,
}: {
  clientSecret: string;
  orderId: string;
  amount: number;
  currency: string;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [succeeded, setSucceeded] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) return;

    setProcessing(true);
    setError(null);

    const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: { card: cardElement },
    });

    if (stripeError) {
      setError(stripeError.message ?? 'Payment failed. Please try again.');
      setProcessing(false);
    } else if (paymentIntent?.status === 'succeeded') {
      setSucceeded(true);
      setProcessing(false);
      setTimeout(() => {
        navigate(`/orders/${orderId}/confirmation`);
      }, 1500);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="bg-canvas rounded-sm border border-hairline p-6">
        <h2 className="text-lg font-bold text-ink mb-1">Payment Details</h2>
        <p className="text-sm text-mute mb-5">
          Amount:{' '}
          <span className="font-bold text-ink">
            ${amount.toFixed(2)} {currency.toUpperCase()}
          </span>
        </p>

        {error && <ErrorMessage message={error} />}

        {succeeded && (
          <div className="rounded-sm border border-hairline bg-surface-soft px-4 py-3 text-sm text-success mb-4">
            Payment successful! Redirecting…
          </div>
        )}

        <div className="mt-4">
          <label className="text-sm font-medium text-body block mb-2">Card information</label>
          <div className="border border-hairline rounded-sm px-4 py-3.5 bg-canvas">
            <CardElement
              options={{
                style: {
                  base: {
                    fontSize: '14px',
                    color: '#201d1d',
                    fontFamily: 'Berkeley Mono, monospace',
                    '::placeholder': { color: '#9a9898' },
                  },
                  invalid: { color: '#ff3b30' },
                },
              }}
            />
          </div>
          <p className="text-xs text-ash mt-2">
            Test card: 4242 4242 4242 4242 · Any future date · Any CVC
          </p>
        </div>
      </div>

      <Button
        type="submit"
        variant="default"
        size="lg"
        loading={processing}
        disabled={!stripe || succeeded}
        className="w-full"
      >
        {succeeded ? '✓ Payment complete' : `Pay $${amount.toFixed(2)}`}
      </Button>
    </form>
  );
}

// ===== Payment Page =====

export default function PaymentPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const { data: order, isLoading: orderLoading } = useOrder(orderId ?? '');
  const createIntent = useCreatePaymentIntent();

  const [intentData, setIntentData] = useState<PaymentIntentResponse | null>(null);
  const [intentError, setIntentError] = useState('');

  useEffect(() => {
    if (!orderId || intentData) return;
    createIntent
      .mutateAsync({ orderId, paymentMethod: 'CREDIT_CARD', paymentProvider: 'STRIPE', currency: 'usd' })
      .then(setIntentData)
      .catch((err) => {
        const msg =
          (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
          'Could not create payment. Please try again.';
        setIntentError(msg);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  if (orderLoading || createIntent.isPending) return <PageLoader />;

  return (
    <div className="min-h-screen bg-canvas">
      <div className="max-w-xl mx-auto px-4 sm:px-6 py-8">
        <Link to={`/orders/${orderId}`} className="text-sm text-ash mb-6">
          {'[<]'} Back to order
        </Link>

        <h1 className="text-2xl font-bold text-ink mb-6">Complete Payment</h1>

        {intentError && <ErrorMessage message={intentError} />}

        {order && (
          <div className="bg-canvas rounded-sm border border-hairline p-4 mb-5 flex items-center justify-between text-sm">
            <div>
              <p className="text-xs text-ash font-mono">{order.id.slice(0, 8)}…</p>
              <p className="font-semibold text-body mt-0.5">
                {order.orderItems.length} item{order.orderItems.length !== 1 ? 's' : ''}
              </p>
            </div>
            <p className="font-bold text-ink text-base">${order.totalAmount.toFixed(2)}</p>
          </div>
        )}

        {intentData && (
          <Elements stripe={stripePromise} options={{ clientSecret: intentData.clientSecret }}>
            <PaymentForm
              clientSecret={intentData.clientSecret}
              orderId={orderId!}
              amount={intentData.amount}
              currency={intentData.currency}
            />
          </Elements>
        )}
      </div>
    </div>
  );
}
