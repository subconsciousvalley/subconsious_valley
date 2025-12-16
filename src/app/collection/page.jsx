"use client";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Lock, Star, ArrowLeft, ChevronRight, Filter, X } from "lucide-react";
import { motion } from "framer-motion";
import { useLanguage } from "@/components/LanguageProvider";
import { useCurrency } from "@/components/CurrencyConverter";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

export default function Collection() {
  const { t, currentLanguage } = useLanguage();
  const { formatPrice } = useCurrency();
  const { data: authSession } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session");
  
  const [parentSession, setParentSession] = useState(null);
  const [purchases, setPurchases] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedChildren, setExpandedChildren] = useState({});
  const [selectedChild, setSelectedChild] = useState("all");

  useEffect(() => {
    const loadSessionData = async () => {
      if (!sessionId) {
        router.push("/sessions");
        return;
      }

      try {
        const sessionResponse = await fetch(`/api/sessions/${sessionId}`);
        if (sessionResponse.ok) {
          const sessionData = await sessionResponse.json();
          setParentSession(sessionData);
        }

        if (authSession?.user) {
          const purchasesResponse = await fetch("/api/purchases");
          if (purchasesResponse.ok) {
            const purchasesData = await purchasesResponse.json();
            setPurchases(purchasesData);
          }
        }
      } catch (error) {
        console.error("Error loading session data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSessionData();
  }, [sessionId, authSession?.user, router]);

  const hasChildAccess = useCallback((childSession) => {
    // Free child sessions are accessible
    if (!childSession.price || childSession.price === 0) {
      return true;
    }
    
    if (!authSession?.user) {
      return false;
    }
    
    return purchases.some(
      (purchase) =>
        purchase.session_id === parentSession?._id &&
        purchase.child_session_id === childSession._id &&
        purchase.payment_status === "completed"
    );
  }, [authSession?.user, purchases, parentSession]);

  const toggleChildExpansion = useCallback((childId) => {
    
    
    setExpandedChildren(prev => {
      const newState = {
        ...prev,
        [childId]: !prev[childId]
      };
      
      return newState;
    });
  }, [expandedChildren]);

  const handleChildAction = useCallback((child, event, index) => {
    event?.preventDefault();
    event?.stopPropagation();
    
    if (hasChildAccess(child)) {
      // User has access - show sessions or start playing
      if (child.sub_sessions && child.sub_sessions.length > 0) {
        const childKey = child._id || `child-${index}`;
        toggleChildExpansion(childKey);
      } else {
        router.push(`/session-player?session=${parentSession._id}&child=${child._id}`);
      }
    } else {
      // User needs to purchase - redirect to checkout
      if (child.price && child.price > 0) {
        router.push(`/checkout?session=${parentSession._id}&child=${child._id}&price=${child.price}`);
      } else {
        // Free session - should have access (this shouldn't happen)
        router.push(`/session-player?session=${parentSession._id}&child=${child._id}`);
      }
    }
  }, [hasChildAccess, parentSession, router, toggleChildExpansion]);

  const handleSubSessionAction = useCallback((child, subSession) => {
    if (hasChildAccess(child)) {
      router.push(`/session-player?session=${parentSession._id}&child=${child._id}&sub=${subSession._id}`);
    } else {
      router.push(`/checkout?session=${parentSession._id}&child=${child._id}`);
    }
  }, [hasChildAccess, parentSession, router]);

  const filteredChildSessions = useMemo(() => {
    if (!parentSession?.child_sessions) return [];
    
    return parentSession.child_sessions.filter((child) => {
      return selectedChild === "all" || child.title === selectedChild;
    });
  }, [parentSession, selectedChild]);

  const selectChild = useCallback((childTitle) => {
    setSelectedChild(childTitle === selectedChild ? "all" : childTitle);
  }, [selectedChild]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-teal-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array(6).fill(0).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl h-80"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!parentSession) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-teal-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-2xl font-bold text-slate-800 mb-4">Session not found</h1>
          <Button onClick={() => router.push("/sessions")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Sessions
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-teal-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-12"
        >
          <Button 
            onClick={() => router.push("/sessions")}
            variant="outline"
            className="mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Sessions
          </Button>
          
          <h1 className="text-4xl lg:text-5xl font-bold mb-6 text-center">
            <span className="bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">
              {parentSession.title}
            </span>
          </h1>
          <p className="text-md text-slate-600 max-w-3xl text-center text-justify mx-auto">
            {parentSession.description}
          </p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8"
        >
          <div className="flex flex-wrap gap-2 items-center justify-center">
            <Filter className="h-5 w-5 mt-1 text-slate-500" />
            <button
              onClick={() => setSelectedChild("all")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                selectedChild === "all"
                  ? "bg-teal-500 text-white shadow-md"
                  : "bg-white text-slate-600 border border-slate-200 hover:border-teal-300 hover:text-teal-600"
              }`}
            >
              All Programs
            </button>
            {parentSession?.child_sessions?.map((child) => (
              <button
                key={child.title}
                onClick={() => selectChild(child.title)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                  selectedChild === child.title
                    ? "bg-teal-500 text-white shadow-md"
                    : "bg-white text-slate-600 border border-slate-200 hover:border-teal-300 hover:text-teal-600"
                }`}
              >
                {child.title}
                {selectedChild === child.title && (
                  <X className="h-3 w-3" />
                )}
              </button>
            ))}
          </div>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredChildSessions.map((child, index) => (
            <motion.div
              key={child._id || `child-${index}`}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Card className="h-full hover:shadow-2xl transition-all duration-300 border-0 bg-white/95 group">
                <CardHeader className="relative overflow-hidden rounded-t-2xl">
                  <div className="aspect-video bg-gradient-to-br from-teal-100 to-emerald-100 rounded-xl relative overflow-hidden">
                    {child.image_url ? (
                      <img
                        src={child.image_url}
                        alt={child.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Play className="h-12 w-12 text-teal-600 opacity-50" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all duration-300"></div>
                    <div className="absolute top-3 right-3">
                      {!hasChildAccess(child) && child.price && child.price > 0 && (
                        <div className="bg-amber-500 text-white p-2 rounded-full shadow-lg">
                          <Lock className="h-4 w-4" />
                        </div>
                      )}
                      {hasChildAccess(child) && child.price && child.price > 0 && (
                        <div className="bg-green-500 text-white p-2 rounded-full shadow-lg">
                          <Play className="h-4 w-4" />
                        </div>
                      )}
                    </div>
                  </div>
                  <CardTitle className="text-xl font-bold mt-4 text-slate-800 group-hover:text-teal-600 transition-colors">
                    {child.title}
                  </CardTitle>
                </CardHeader>

                <CardContent className="p-6 pt-0">
                  <p className="text-slate-600 mb-4 leading-relaxed h-24 overflow-y-auto" style={{scrollbarWidth: 'thin', scrollbarColor: '#cbd5e1 #f1f5f9'}}>
                    {child.description}
                  </p>

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-1 text-sm text-slate-500">
                      {(() => {
                        const seed = (child.title?.length || 10) + index * 7;
                        const rating = (4.6 + (seed % 40) / 100).toFixed(1);
                        const fullStars = Math.floor(rating);
                        const partialStar = rating - fullStars;
                        
                        return (
                          <>
                            {[...Array(fullStars)].map((_, i) => (
                              <Star key={i} className="h-4 w-4 fill-current text-amber-400" />
                            ))}
                            {partialStar > 0 && (
                              <div className="relative">
                                <Star className="h-4 w-4 text-amber-400" />
                                <div className="absolute inset-0 overflow-hidden" style={{ width: `${partialStar * 100}%` }}>
                                  <Star className="h-4 w-4 fill-current text-amber-400" />
                                </div>
                              </div>
                            )}
                            <span className="ml-1 text-sm">{rating}</span>
                          </>
                        );
                      })()}
                    </div>
                    
                    {/* Price Display - Hide if purchased */}
                    <div className="text-right">
                      {hasChildAccess(child) && child.price && child.price > 0 ? (
                        <Badge variant="secondary" className="bg-blue-100 text-blue-600">
                          PURCHASED
                        </Badge>
                      ) : (
                        <>
                          {child.price && child.price > 0 ? (
                            <>
                              {child.original_price && child.original_price > child.price && (
                                <div className="text-xs text-slate-400 line-through">
                                  {formatPrice(child.original_price)}
                                </div>
                              )}
                              <div className="text-lg font-bold text-teal-600">
                                {formatPrice(child.price)}
                              </div>
                              {child.discount_percentage && child.discount_percentage > 0 && (
                                <Badge variant="secondary" className="text-xs bg-red-100 text-red-600 mt-1">
                                  {child.discount_percentage}% OFF
                                </Badge>
                              )}
                            </>
                          ) : (
                            <Badge variant="secondary" className="bg-green-100 text-green-600">
                              FREE
                            </Badge>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  {child.sub_sessions && child.sub_sessions.length > 0 && (
                    <div className="mb-4">
                      <div className="text-sm text-teal-600">
                        {child.sub_sessions.length} sessions included
                      </div>
                    </div>
                  )}

                  {/* Sub-sessions dropdown - ONLY show when user has purchased AND expanded */}
                  {hasChildAccess(child) && child.sub_sessions && child.sub_sessions.length > 0 && expandedChildren[child._id || `child-${index}`] && (
                    <div className="mb-4 space-y-2 p-3 bg-teal-50 rounded-lg">
                      <h5 className="font-medium text-teal-800 mb-2">Available Sessions:</h5>
                      {child.sub_sessions.map((subSession, subIndex) => (
                        <div key={subSession._id || subIndex} className="bg-white rounded p-2 hover:bg-gray-50 transition-colors">
                          <div className="flex justify-between items-center">
                            <div className="flex-1">
                              <span className="text-sm font-medium">{subSession.title}</span>
                              {subSession.duration && (
                                <span className="text-xs text-gray-500 ml-2">({subSession.duration} min)</span>
                              )}
                            </div>
                            <Button
                              onClick={() => handleSubSessionAction(child, subSession)}
                              size="sm"
                              variant="ghost"
                              className="h-8 px-2 hover:bg-teal-100"
                            >
                              <Play className="h-3 w-3 mr-1" />
                              Play
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="space-y-2">
                    <Button
                      onClick={(e) => handleChildAction(child, e, index)}
                      className="w-full bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white transition-all duration-200"
                    >
                      {hasChildAccess(child) ? (
                        // User has purchased - show appropriate action
                        <>
                          <Play className="mr-2 h-4 w-4" />
                          {child.sub_sessions && child.sub_sessions.length > 0
                            ? expandedChildren[child._id || `child-${index}`] 
                              ? "Hide Sessions" 
                              : "View Sessions"
                            : "Start Session"}
                        </>
                      ) : (
                        // User hasn't purchased - show purchase or lock
                        <>
                          {child.price && child.price > 0 ? (
                            <>
                              <Lock className="mr-2 h-4 w-4" />
                              Purchase for {formatPrice(child.price)}
                            </>
                          ) : (
                            <>
                              <Play className="mr-2 h-4 w-4" />
                              Access Program
                            </>
                          )}
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {filteredChildSessions.length === 0 && !isLoading && (
          <div className="text-center py-16">
            <p className="text-xl text-slate-600">No programs found</p>
            <Button
              onClick={() => setSelectedChild("all")}
              variant="outline"
              className="mt-4"
            >
              Show All Programs
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}