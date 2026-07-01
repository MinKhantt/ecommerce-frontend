import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { toast } from 'sonner';
import { useCart, usePlaceOrder, useCreatePaymentIntent } from '../../api/hooks';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Separator } from '../../components/ui/separator';
import { PageLoader, ErrorMessage } from '../../components/ui/deprecated';
import { getOptimizedImageUrl } from '../../utils/images';
import type { CartItem, PaymentIntentResponse } from '../../types';

const stripePromise = loadStripe(
  import.meta.env.VITE_STRIPE_PK || 'pk_test_REPLACE_WITH_YOUR_PUBLISHABLE_KEY'
);

type PaymentMethodType = 'CREDIT_CARD' | 'DIGITAL_WALLET' | 'CASH_ON_DELIVERY';

const PAYMENT_METHODS: { value: PaymentMethodType; label: string; description: string }[] = [
  { value: 'CREDIT_CARD', label: 'Credit / Debit Card', description: 'Pay securely with Stripe' },
  { value: 'DIGITAL_WALLET', label: 'Digital Wallet', description: 'Pay using your digital wallet balance' },
  { value: 'CASH_ON_DELIVERY', label: 'Cash on Delivery', description: 'Pay when you receive your order' },
];

const PAYMENT_PROVIDER_MAP: Record<PaymentMethodType, string> = {
  CREDIT_CARD: 'STRIPE',
  DIGITAL_WALLET: 'K_PAY',
  CASH_ON_DELIVERY: 'CASH_ON_DELIVERY',
};

const ACTION_BUTTON_LABEL: Record<PaymentMethodType, string> = {
  CREDIT_CARD: 'Pay Now',
  DIGITAL_WALLET: 'Confirm Order',
  CASH_ON_DELIVERY: 'Confirm Order',
};

function StripeActionButton({ orderId, amount }: { orderId: string; amount?: number }) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePay = async () => {
    if (!stripe || !elements) return;
    setProcessing(true);
    setError(null);

    const { error: confirmError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/checkout/success/${orderId}`,
      },
    });

    if (confirmError) {
      setError(confirmError.message ?? 'Payment failed. Please try again.');
      setProcessing(false);
    }
  };

  return (
    <>
      {error && <ErrorMessage message={error} />}
      <Button
        variant="default"
        size="lg"
        className="w-full"
        loading={processing}
        disabled={!stripe}
        onClick={handlePay}
      >
        Pay Now — ${amount?.toFixed(2)}
      </Button>
    </>
  );
}

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { data: cart, isLoading } = useCart();
  const placeOrder = usePlaceOrder();
  const createIntent = useCreatePaymentIntent();

  const cartSnapshotRef = useRef<CartItem[]>([]);

  const [address, setAddress] = useState('');
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodType | null>(null);
  const [error, setError] = useState('');
  const [orderId, setOrderId] = useState<string | null>(null);
  const [intentResponse, setIntentResponse] = useState<PaymentIntentResponse | null>(null);
  const [stripeLoading, setStripeLoading] = useState(false);

  const stripeInitiatedRef = useRef(false);

  useEffect(() => {
    if (cart?.cartItems?.length) {
      cartSnapshotRef.current = cart.cartItems;
    }
  }, [cart?.cartItems]);

  useEffect(() => {
    if (selectedMethod !== 'CREDIT_CARD') {
      stripeInitiatedRef.current = false;
      setIntentResponse(null);
      return;
    }
    if (stripeInitiatedRef.current) return;
    if (!address.trim()) return;

    stripeInitiatedRef.current = true;
    setStripeLoading(true);
    setError('');

    let cancelled = false;

    (async () => {
      try {
        let currentOrderId = orderId;
        if (!currentOrderId) {
          const order = await placeOrder.mutateAsync({ shippingAddress: address });
          currentOrderId = order.id;
          if (!cancelled) setOrderId(currentOrderId);
        }

        const intent = await createIntent.mutateAsync({
          orderId: currentOrderId,
          paymentMethod: 'CREDIT_CARD',
          paymentProvider: 'STRIPE',
          currency: 'USD',
        });

        if (!cancelled) setIntentResponse(intent);
      } catch (err: unknown) {
        if (!cancelled) {
          stripeInitiatedRef.current = false;
          const msg =
            (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
            'Failed to initialize payment. Please try again.';
          setError(msg);
        }
      } finally {
        if (!cancelled) setStripeLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [selectedMethod, address]);

  const handleCodWallet = async () => {
    if (!address.trim()) {
      setError('Please enter a shipping address.');
      return;
    }
    if (!selectedMethod) {
      setError('Please select a payment method.');
      return;
    }
    if (!cart?.cartItems?.length) {
      setError('Your cart is empty.');
      return;
    }

    setError('');

    try {
      let currentOrderId = orderId;
      if (!currentOrderId) {
        const order = await placeOrder.mutateAsync({ shippingAddress: address });
        currentOrderId = order.id;
        setOrderId(currentOrderId);
      }

      const provider = PAYMENT_PROVIDER_MAP[selectedMethod];
      await createIntent.mutateAsync({
        orderId: currentOrderId,
        paymentMethod: selectedMethod,
        paymentProvider: provider,
      });

      toast.success('Order placed successfully!');
      navigate(`/checkout/success/${currentOrderId}`);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Something went wrong. Please try again.';
      setError(msg);
    }
  };

  if (isLoading) return <PageLoader />;

  const items: CartItem[] = cart?.cartItems ?? [];
  if (items.length === 0 && !orderId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-mute mb-4">Your cart is empty.</p>
          <Link to="/products">
            <Button variant="default">Browse products</Button>
          </Link>
        </div>
      </div>
    );
  }

  const displayItems: CartItem[] = items.length > 0 ? items : cartSnapshotRef.current;
  const displayTotal = displayItems.reduce((sum, i) => sum + i.totalPrice, 0);

  const isProcessing = stripeLoading || placeOrder.isPending || createIntent.isPending;
  const showStripeElements = selectedMethod === 'CREDIT_CARD' && intentResponse;

  return (
    <div className="min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Steps indicator */}
        <div className="flex items-center gap-2 mb-6 text-sm">
          {['Cart', 'Shipping', 'Payment'].map((step, i) => (
            <span key={step} className="flex items-center gap-2">
              <span
                className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${
                  i <= 1 ? 'bg-primary text-white' : 'bg-surface-card text-ash'
                }`}
              >
                {i + 1}
              </span>
              <span className={i <= 1 ? 'text-ink font-medium' : 'text-ash'}>{step}</span>
              {i < 2 && <span className="text-stone">&gt;</span>}
            </span>
          ))}
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-ink mb-6">Checkout</h1>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {error && <ErrorMessage message={error} />}

            {/* Step 1: Shipping */}
            <div className="bg-canvas rounded-sm border border-hairline p-6">
              <div className="flex items-center gap-3 mb-5">
                <span className="w-7 h-7 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center">
                  1
                </span>
                <h2 className="text-lg font-semibold text-ink">Shipping Details</h2>
              </div>
              <Input
                id="address"
                label="Shipping address"
                placeholder="123 Main St, City, State, ZIP"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
              />
            </div>

            {/* Step 2: Payment Method */}
            <div className="bg-canvas rounded-sm border border-hairline p-6">
              <div className="flex items-center gap-3 mb-5">
                <span className="w-7 h-7 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center">
                  2
                </span>
                <h2 className="text-lg font-semibold text-ink">Payment Method</h2>
              </div>
              <div className="flex flex-col gap-3">
                {PAYMENT_METHODS.map((method) => (
                  <label
                    key={method.value}
                    className={`flex items-center gap-4 p-4 rounded-sm border cursor-pointer ${
                      selectedMethod === method.value
                        ? 'border-ink bg-surface-soft'
                        : 'border-hairline'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={method.value}
                      checked={selectedMethod === method.value}
                      onChange={() => setSelectedMethod(method.value)}
                      className="w-4 h-4"
                    />
                    <div>
                      <p className="font-semibold text-ink text-sm">{method.label}</p>
                      <p className="text-xs text-mute">{method.description}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Step 3: Stripe Elements */}
            {showStripeElements && (
              <Elements stripe={stripePromise} options={{ clientSecret: intentResponse.clientSecret }}>
                <div className="bg-canvas rounded-sm border border-hairline p-6">
                  <div className="flex items-center gap-3 mb-5">
                    <span className="w-7 h-7 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center">
                      3
                    </span>
                    <h2 className="text-lg font-semibold text-ink">Card Details</h2>
                  </div>
                  <PaymentElement />
                </div>
                <StripeActionButton orderId={orderId!} amount={displayTotal} />
              </Elements>
            )}

            {selectedMethod === 'CREDIT_CARD' && stripeLoading && !showStripeElements && (
              <div className="bg-canvas rounded-sm border border-hairline p-6">
                <div className="flex items-center gap-3 mb-5">
                  <span className="w-7 h-7 rounded-full bg-surface-card text-ash text-xs font-bold flex items-center justify-center">
                    3
                  </span>
                  <h2 className="text-lg font-semibold text-ink">Card Details</h2>
                </div>
                <div className="flex items-center justify-center py-8">
                  <p className="text-sm text-mute">Loading payment...</p>
                </div>
              </div>
            )}

            {selectedMethod === 'CREDIT_CARD' && !stripeLoading && !showStripeElements && (
              <div className="bg-canvas rounded-sm border border-hairline p-6">
                <div className="flex items-center gap-3 mb-5">
                  <span className="w-7 h-7 rounded-full bg-surface-card text-ash text-xs font-bold flex items-center justify-center">
                    3
                  </span>
                  <h2 className="text-lg font-semibold text-ink">Confirm & Pay</h2>
                </div>
                <p className="text-sm text-mute mb-4">
                  Fill in your shipping address above, then the card form will appear.
                </p>
                <Button variant="default" size="lg" className="w-full" disabled>
                  Pay Now — ${displayTotal.toFixed(2)}
                </Button>
              </div>
            )}

            {selectedMethod && selectedMethod !== 'CREDIT_CARD' && (
              <div className="bg-canvas rounded-sm border border-hairline p-6">
                <div className="flex items-center gap-3 mb-5">
                  <span className="w-7 h-7 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center">
                    3
                  </span>
                  <h2 className="text-lg font-semibold text-ink">Confirm & Pay</h2>
                </div>
                <Button
                  variant="default"
                  size="lg"
                  className="w-full"
                  loading={isProcessing}
                  onClick={handleCodWallet}
                >
                  {ACTION_BUTTON_LABEL[selectedMethod]} — ${displayTotal.toFixed(2)}
                </Button>
              </div>
            )}
          </div>

          {/* Right Column: Summary */}
          <div>
            <div className="bg-canvas rounded-sm border border-hairline p-6 sticky top-20">
              <h2 className="text-base font-semibold text-ink mb-4">Summary</h2>
              <div className="space-y-3 text-sm">
                {displayItems.map((item) => {
                  const img = getOptimizedImageUrl(item.product.images?.[0]?.downloadUrl, { w: 80, h: 80 });
                  return (
                    <div key={item.id} className="flex items-center gap-3">
                      {img && (
                        <img
                          src={img}
                          loading="lazy"
                          alt={item.product.name}
                          className="w-10 h-10 rounded-sm object-cover flex-shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-body text-xs line-clamp-1">
                          {item.product.name}
                        </p>
                        <p className="text-ash text-xs">×{item.quantity}</p>
                      </div>
                      <p className="font-semibold text-ink text-xs">
                        ${item.totalPrice.toFixed(2)}
                      </p>
                    </div>
                  );
                })}
                <Separator />
                <div className="flex justify-between font-bold text-ink">
                  <span>Total</span>
                  <span>${displayTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
