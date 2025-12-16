"use client";
import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Play,
  LogOut,
  Headphones,
  Facebook,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { motion } from "framer-motion";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const router = useRouter();
  const [session, setSession] = useState(null);
  const [purchases, setPurchases] = useState([]);
  const [siteSettings, setSiteSettings] = useState({});
  const [expandedSessions, setExpandedSessions] = useState({});
  const [expandedChildSessions, setExpandedChildSessions] = useState({});
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const toggleExpanded = (purchaseId) => {
    setExpandedSessions(prev => ({
      ...prev,
      [purchaseId]: !prev[purchaseId]
    }));
  };

  const toggleChildExpanded = (childId) => {
    setExpandedChildSessions(prev => ({
      ...prev,
      [childId]: !prev[childId]
    }));
  };

  const loadDashboardData = useCallback(async (userEmail) => {
    if (!userEmail) return;

    try {
      const purchasesResponse = await fetch(`/api/purchases?user=${encodeURIComponent(userEmail)}`, {
        cache: 'no-store'
      });
      if (purchasesResponse.ok) {
        const purchasesData = await purchasesResponse.json();
        // Filter to only show completed purchases
        const completedPurchases = purchasesData.filter(purchase => 
          purchase.payment_status === 'completed'
        );
        setPurchases(completedPurchases);
      } else {
        console.error('Failed to fetch purchases:', purchasesResponse.status);
        setPurchases([]);
      }

      setSiteSettings({
        facebook_group_url: "https://facebook.com/groups/subconsciousvalley",
      });
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      setPurchases([]);
    }
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/session');
        if (response.ok) {
          const sessionData = await response.json();
          if (sessionData?.user) {
            setSession(sessionData);
            loadDashboardData(sessionData.user.email);
          } else {
            router.push("/login");
          }
        } else {
          router.push("/login");
        }
      } catch (error) {
        router.push("/login");
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, [router, loadDashboardData]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    // Small delay to ensure overlay is visible
    await new Promise(resolve => setTimeout(resolve, 100));
    await signOut({ callbackUrl: "/" });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-teal-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-teal-50 py-8 relative">
      {isLoggingOut && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 shadow-xl flex items-center gap-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-teal-600"></div>
            <span className="text-slate-700 font-medium">Signing Out...</span>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-start mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold text-slate-800">
              Welcome, {session?.user?.name}
            </h1>
            <p className="text-slate-600">
              This is your personal space for transformation.
            </p>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="cursor-pointer"
            disabled={isLoggingOut}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </motion.div>

        {/* Facebook Group CTA */}
        {siteSettings.facebook_group_url && purchases.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <Card className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg">
              <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <Facebook className="h-8 w-8" />
                  <div>
                    <h3 className="font-bold text-lg">
                      Join Our Private Community
                    </h3>
                    <p className="text-sm opacity-90">
                      Connect with others on the same journey in our exclusive
                      Facebook group.
                    </p>
                  </div>
                </div>
                <a
                  href={siteSettings.facebook_group_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button
                    variant="secondary"
                    className="bg-white/90 text-blue-600 hover:bg-white"
                  >
                    Join Now
                  </Button>
                </a>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* My Sessions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Headphones className="h-5 w-5 text-teal-600" />
                My Purchased Sessions
              </CardTitle>
            </CardHeader>
            <CardContent>
              {purchases.length > 0 ? (
                <div className="space-y-4">
                  {purchases.map((purchase) => (
                    <div key={purchase._id} className="space-y-4">
                      <div className="p-4 border rounded-lg flex flex-col sm:flex-row justify-between sm:items-center gap-4 hover:bg-teal-50/50 transition-colors">
                        <div>
                          <h4 className="font-semibold text-slate-800">
                            {purchase.session_title}
                          </h4>
                          <p className="text-sm text-slate-500">
                            Purchased on:{" "}
                            {new Date(purchase.purchase_date).toLocaleDateString()}
                          </p>
                          <p className="text-sm text-slate-400">
                            Amount: {purchase.currency} {purchase.amount_paid.toFixed(2)}
                          </p>
                        </div>
                        {purchase.session?.child_sessions && purchase.session.child_sessions.length > 0 ? (
                          <Button 
                            onClick={() => toggleExpanded(purchase._id)}
                            variant="outline"
                            className="cursor-pointer"
                          >
                            {expandedSessions[purchase._id] ? (
                              <ChevronDown className="h-4 w-4 mr-2" />
                            ) : (
                              <ChevronRight className="h-4 w-4 mr-2" />
                            )}
                            {purchase.session.child_sessions.length} Sessions
                          </Button>
                        ) : (
                          <Link href={`/session-player?session=${purchase.session_id}`}>
                            <Button className="cursor-pointer">
                              <Play className="h-4 w-4 mr-2" />
                              Start Session
                            </Button>
                          </Link>
                        )}
                      </div>
                      
                      {/* Child Sessions - Collapsible */}
                      {purchase.session?.child_sessions && purchase.session.child_sessions.length > 0 && expandedSessions[purchase._id] && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="ml-4 space-y-3"
                        >
                          <h5 className="text-sm font-medium text-slate-600">Program Sessions:</h5>
                          {purchase.session.child_sessions.map((childSession, childIndex) => (
                            <div key={childIndex} className="p-3 bg-slate-50 rounded-lg">
                              <div className="flex justify-between items-center">
                                <div>
                                  <p className="text-sm font-medium text-slate-700">{childSession.title}</p>
                                  <p className="text-xs text-slate-500">{childSession.description}</p>
                                </div>
                                {childSession.sub_sessions && childSession.sub_sessions.length > 0 ? (
                                  <Button 
                                    onClick={() => toggleChildExpanded(childSession._id)}
                                    variant="ghost"
                                    size="sm"
                                    className="cursor-pointer"
                                  >
                                    {expandedChildSessions[childSession._id] ? (
                                      <ChevronDown className="h-4 w-4" />
                                    ) : (
                                      <ChevronRight className="h-4 w-4" />
                                    )}
                                  </Button>
                                ) : (
                                  <Link href={`/session-player?session=${purchase.session_id}&child=${childSession._id}`}>
                                    <Button size="sm" variant="outline" className="cursor-pointer">
                                      <Play className="h-3 w-3 mr-1" />
                                      Start Program
                                    </Button>
                                  </Link>
                                )}
                              </div>
                              
                              {/* Sub-sessions - Collapsible */}
                              {childSession.sub_sessions && childSession.sub_sessions.length > 0 && expandedChildSessions[childSession._id] && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  exit={{ opacity: 0, height: 0 }}
                                  className="ml-3 mt-3 space-y-2"
                                >
                                  {childSession.sub_sessions.map((subSession, subIndex) => (
                                    <div key={subIndex} className="p-2 bg-white rounded border flex justify-between items-center">
                                      <div>
                                        <p className="text-xs font-medium text-slate-600">{subSession.title}</p>
                                        {/* <p className="text-xs text-slate-400">{subSession.duration || 25} minutes</p> */}
                                      </div>
                                      <Link href={`/session-player?session=${purchase.session_id}&child=${childSession._id}&sub=${subSession._id}`}>
                                        <Button size="sm" variant="outline" className="cursor-pointer text-xs px-2 py-1">
                                          <Play className="h-3 w-3 mr-1" />
                                          Play
                                        </Button>
                                      </Link>
                                    </div>
                                  ))}
                                </motion.div>
                              )}
                            </div>
                          ))}
                        </motion.div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-slate-600 mb-4">
                    You haven't purchased any sessions yet.
                  </p>
                  <Link href="/sessions">
                    <Button className="cursor-pointer">Explore Sessions</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
