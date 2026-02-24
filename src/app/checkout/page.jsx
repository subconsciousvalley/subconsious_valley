"use client";
import React, { useState, useEffect, Suspense } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, CreditCard, Download, Check, Clock, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import { useCurrency } from "@/components/CurrencyConverter";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";

function CheckoutContent() {
  const { data: userSession, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session');
  const childId = searchParams.get('child');
  const stripeSessionId = searchParams.get('session_id');
  const paymentSuccess = searchParams.get('success') === 'true';
  const [purchaseData, setPurchaseData] = useState(null);
  const { formatPrice } = useCurrency();
  
  const [session, setSession] = useState(null);
  const [childSession, setChildSession] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [purchaseComplete, setPurchaseComplete] = useState(paymentSuccess);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push(`/login?callbackUrl=${encodeURIComponent(window.location.href)}`);
      return;
    }

    const loadSession = async () => {
      if (!sessionId) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/sessions`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const sessions = await response.json();
        const foundSession = sessions.find(s => s._id === sessionId);
        
        if (foundSession) {
          setSession(foundSession);
          
          // If childId is provided, find the specific child session
          if (childId && foundSession.child_sessions) {
            const foundChild = foundSession.child_sessions.find(child => child._id === childId);
            if (foundChild) {
              setChildSession(foundChild);
            }
          }
        }

        if (paymentSuccess && stripeSessionId) {
          try {
            const verifyResponse = await fetch('/api/stripe/verify-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                sessionId: stripeSessionId,
                productSessionId: sessionId,
                sessionTitle: childSession?.title || foundSession?.title,
                childId: childId
              })
            });
            
            if (verifyResponse.ok) {
              const verificationData = await verifyResponse.json();
              setPurchaseData(verificationData);
            } else {
              setPurchaseData({ 
                paymentStatus: 'completed',
                sessionId: stripeSessionId,
                message: 'Payment processed successfully'
              });
            }
          } catch (error) {
            setPurchaseData({ 
              paymentStatus: 'completed',
              sessionId: stripeSessionId,
              message: 'Payment processed successfully'
            });
          }
          setPurchaseComplete(true);
        }
      } catch (error) {
        // Handle error silently
      }
      setIsLoading(false);
    };

    if (status === 'authenticated') {
      loadSession();
    }
  }, [sessionId, paymentSuccess, userSession, status]);

  const processPurchase = async () => {
    setIsProcessing(true);
    try {
      const successUrl = `${window.location.origin}/checkout?session=${sessionId}&success=true`;
      const cancelUrl = `${window.location.origin}/checkout?session=${sessionId}&cancelled=true`;

      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: sessionId,
          childId: childId,
          successUrl: successUrl,
          cancelUrl: cancelUrl
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        throw new Error('Failed to create checkout session');
      }
    } catch (error) {
      alert('Error processing purchase. Please try again.');
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-teal-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-teal-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-8 text-center">
            <h2 className="text-xl font-bold mb-4">Session Not Found</h2>
            <Link href="/sessions">
              <Button>Browse Sessions</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (purchaseComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-teal-50 py-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="h-8 w-8 text-emerald-600" />
                </div>
                <h2 className="text-2xl font-bold mb-4 text-slate-800">Payment Successful!</h2>
                <p className="text-slate-600 mb-6">
                  Thank you for purchasing <strong>{session.title}</strong>. 
                  You now have access to all session materials including audio files, worksheets, and guides.
                </p>
                <div className="bg-teal-50 p-4 rounded-lg mb-6">
                  <h3 className="font-semibold text-teal-800 mb-2">What's Included:</h3>
                  <ul className="text-sm text-teal-700 space-y-1 text-left">
                    <li>• Full session audios</li>
                    {session.child_sessions && session.child_sessions.length > 0 && (
                      <li>• {session.child_sessions.length} individual sessions</li>
                    )}
                    <li>• Lifetime access to all materials</li>
                    <li>• Available in multiple languages</li>
                  </ul>
                </div>
                {purchaseData && !purchaseData.error && (
                  <div className="bg-slate-50 p-4 rounded-lg mb-6 text-left">
                    <h3 className="font-semibold text-slate-800 mb-2">Payment Confirmed:</h3>
                    <div className="text-sm text-slate-600 space-y-1">
                      <p><strong>Status:</strong> {purchaseData.paymentStatus}</p>
                      {purchaseData.amountTotal && (
                        <p><strong>Amount:</strong> {purchaseData.currency} {purchaseData.amountTotal}</p>
                      )}
                      {purchaseData.customerEmail && (
                        <p><strong>Email:</strong> {purchaseData.customerEmail}</p>
                      )}
                      {purchaseData.paymentIntent && (
                        <p><strong>Payment ID:</strong> {purchaseData.paymentIntent}</p>
                      )}
                      <p><strong>Access:</strong> Granted to all materials</p>
                    </div>
                  </div>
                )}
                {purchaseData?.error && (
                  <div className="bg-red-50 p-4 rounded-lg mb-6 text-left">
                    <h3 className="font-semibold text-red-800 mb-2">Verification Error:</h3>
                    <p className="text-sm text-red-600">{purchaseData.error}</p>
                  </div>
                )}
                <div className="space-y-3">
                  <Link href="/dashboard">
                    <Button className="w-full bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white">
                      <Download className="mr-2 h-4 w-4" />
                      Access Your Materials
                    </Button>
                  </Link>
                  <Link href="/sessions">
                    <Button variant="outline" className="w-full">
                      Browse More Sessions
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-teal-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/sessions">
            <Button variant="ghost" size="sm" className="cursor-pointer">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Sessions
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-slate-800">Secure Checkout</h1>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg mb-6">
              <CardHeader>
                <CardTitle>Session Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  {session.image_url && (
                    <Image 
                      src={session.image_url} 
                      alt={session.title}
                      width={96}
                      height={96}
                      className="w-24 h-24 object-cover rounded-lg"
                      quality={85}
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{session.title}</h3>
                    <p className="text-slate-600 mt-1">{session.description}</p>
                    <div className="flex gap-2 mt-3">
                      {/* <Badge className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {session.duration || 25} minutes
                      </Badge> */}
                      <Badge variant="outline">{session.category?.replace('_', ' ')}</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle>What You'll Get</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                    <span>Full hypnotherapy session audio</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                    <span>Lifetime access to all materials</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                    <span>Available in multiple languages</span>
                  </div>
                  {session.child_sessions && session.child_sessions.length > 0 && (
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                      <span>{session.child_sessions.length} individual sessions included</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg sticky top-8">
              <CardHeader>
                <CardTitle>Secure Payment</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Use child session pricing if available, otherwise parent session pricing */}
                  {(() => {
                    const currentSession = childSession || session;
                    const price = currentSession?.price || 0;
                    const originalPrice = currentSession?.original_price || 0;
                    const discountPercentage = currentSession?.discount_percentage || 0;
                    
                    return (
                      <>
                        {originalPrice > 0 && discountPercentage > 0 && (
                          <div className="flex justify-between text-slate-500">
                            <span>Original Price</span>
                            <span className="line-through">{formatPrice(originalPrice)}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span>{childSession ? 'Program Price' : 'Session Price'}</span>
                          <span className="font-semibold">{formatPrice(price)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Processing Fee</span>
                          <span className="font-semibold">{formatPrice(0)}</span>
                        </div>
                        {discountPercentage > 0 && (
                          <div className="flex justify-between text-emerald-600">
                            <span>Discount ({discountPercentage}%)</span>
                            <span>-{formatPrice(originalPrice - price)}</span>
                          </div>
                        )}
                        <hr />
                        <div className="flex justify-between text-lg font-bold">
                          <span>Total</span>
                          <span>{formatPrice(price)}</span>
                        </div>
                      </>
                    );
                  })()}
                  
                  <div className="bg-blue-50 p-3 rounded-lg mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-4 bg-blue-600 rounded text-white text-xs flex items-center justify-center font-bold">S</div>
                      <span className="text-sm font-medium text-blue-800">Secured by Stripe</span>
                    </div>
                    <p className="text-xs text-blue-600">
                      Your payment information is encrypted and secure. 
                      We never store your card details.
                    </p>
                  </div>
                  
                  <Button 
                    onClick={processPurchase}
                    disabled={isProcessing}
                    className="w-full bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white"
                    size="lg"
                  >
                    {isProcessing ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Redirecting to Stripe...
                      </div>
                    ) : (
                      <>
                        <CreditCard className="mr-2 h-4 w-4" />
                        Pay Securely with Stripe
                        <ExternalLink className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                  
                  <p className="text-xs text-slate-500 text-center">
                    Secure checkout powered by Stripe. 
                    Instant access to all materials after payment.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Checkout() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-teal-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}