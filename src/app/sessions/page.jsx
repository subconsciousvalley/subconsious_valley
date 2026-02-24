"use client";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Lock, Star, Filter, X, Edit, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { useLanguage } from "@/components/LanguageProvider";
import { useCurrency } from "@/components/CurrencyConverter";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";


// Dynamic category names will be generated from sessions

// Memoize language names to prevent recreation
const languageNames = {
  english: "English",
  indian_english: "Indian English",
  hindi: "हिंदी",
  arabic: "العربية",
  tagalog: "Tagalog",
  chinese: "中文",
};



export default function Sessions() {
  const { t, currentLanguage } = useLanguage();
  const { formatPrice } = useCurrency();
  const { data: authSession } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [sessions, setSessions] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [dynamicCategories, setDynamicCategories] = useState({});
  const [deleting, setDeleting] = useState(null);

  const [sessionsLoading, setSessionsLoading] = useState(true);

  const fetchSessions = useCallback(async () => {
    try {
      const response = await fetch(`/api/sessions?t=${Date.now()}`, {
        cache: 'no-store'
      });
      const data = await response.json();
      
      // Ensure data is an array
      const sessionsArray = Array.isArray(data) ? data : [];
      setSessions(sessionsArray);
      
      const categories = {};
      sessionsArray.forEach((session) => {
        if (session.title && session.parent_id === null) {
          categories[session.title] = session.title;
        }
      });
      setDynamicCategories(categories);
    } catch (error) {
      console.error('Error fetching sessions:', error);
      setSessions([]);
      setDynamicCategories({});
    } finally {
      setSessionsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  // Refresh data on window focus (debounced)
  useEffect(() => {
    let focusTimeout;
    
    const handleFocus = () => {
      clearTimeout(focusTimeout);
      focusTimeout = setTimeout(() => {
        if (authSession?.user?.role === "admin") {
          // Admin: refresh sessions
          fetchSessions();
        } else if (authSession?.user) {
          // Non-admin: refresh purchases only
          const refreshPurchases = async () => {
            try {
              const purchasesResponse = await fetch("/api/purchases");
              if (purchasesResponse.ok) {
                const purchasesData = await purchasesResponse.json();
                setPurchases(purchasesData);
              }
            } catch (error) {
              console.error("Error refreshing purchases:", error);
            }
          };
          refreshPurchases();
        }
      }, 1000); // 1 second debounce
    };
    
    if (authSession?.user) {
      window.addEventListener('focus', handleFocus);
      return () => {
        window.removeEventListener('focus', handleFocus);
        clearTimeout(focusTimeout);
      };
    }
  }, [authSession?.user?.role, authSession?.user, fetchSessions]);
  


  useEffect(() => {
    const loadPurchases = async () => {
      if (!sessionsLoading && authSession?.user) {
        try {
          const purchasesResponse = await fetch("/api/purchases");
          if (purchasesResponse.ok) {
            const purchasesData = await purchasesResponse.json();
            setPurchases(purchasesData);
          }
        } catch (error) {
          console.error("Error loading purchases:", error);
        } finally {
          setIsLoading(false);
        }
      } else if (!sessionsLoading) {
        setIsLoading(false);
      }
    };
    
    loadPurchases();
  }, [sessionsLoading, authSession?.user]);

  // Check access for child sessions based on purchases
  const hasChildAccess = useCallback((parentSessionId, childSessionId) => {
    // If user is not logged in, no access to paid child sessions
    if (!authSession?.user) {
      return false;
    }
    
    // Check if user has purchased this child session
    return purchases.some(
      (purchase) =>
        purchase.session_id === parentSessionId &&
        purchase.child_session_id === childSessionId &&
        purchase.payment_status === "completed"
    );
  }, [authSession?.user, purchases]);

  const handleSessionAction = useCallback((session) => {
    // Parent sessions are always accessible - redirect to collection page
    if (session.child_sessions && session.child_sessions.length > 0) {
      router.push(`/collection?session=${session._id}`);
    } else {
      // This shouldn't happen with new structure, but fallback
      router.push(`/session-player?session=${session._id}`);
    }
  }, [router]);

  // Memoize filtered sessions to prevent recalculation on every render
  const filteredSessions = useMemo(() => {
    return sessions.filter((session) => {
      // Only show parent sessions
      const isParent = session.parent_id === null;
      const categoryMatch =
        selectedCategory === "all" ||
        session.title === selectedCategory;
      return isParent && categoryMatch;
    });
  }, [sessions, selectedCategory]);

  const selectCategory = useCallback((category) => {
    setSelectedCategory(category === selectedCategory ? "all" : category);
  }, [selectedCategory]);

  const getTranslated = useCallback((item, field) => {
    return item[`${field}_${currentLanguage}`] || item[field];
  }, [currentLanguage]);

  const handleDeleteSession = useCallback(async (sessionId) => {
    if (!confirm('Are you sure you want to delete this session? This action cannot be undone.')) {
      return;
    }
    
    setDeleting(sessionId);
    try {
      const response = await fetch(`/api/sessions/${sessionId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        setSessions(prev => prev.filter(s => s._id !== sessionId));
        toast({
          title: "Success",
          description: "Session deleted successfully.",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to delete session.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Error deleting session.",
        variant: "destructive",
      });
    } finally {
      setDeleting(null);
    }
  }, [toast]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-teal-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-12"
        >
          <div className="flex justify-between items-center mb-6">
            <div className="flex-1">
              {authSession?.user?.role === "admin" ? (
                <Button
                  onClick={() => router.push('/admin/sessions/create')}
                  className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white"
                >
                  Add New Session
                </Button>
              ) : (
                <div></div>
              )}
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold">
              <span className="bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">
                {t("sessions_title")}
              </span>
            </h1>
            <div className="flex-1"></div>
          </div>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto text-center">
            {t("sessions_desc")}
          </p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-col sm:flex-row gap-4 mb-12"
        >
          <div className="w-full">
            {/* <div className="flex items-center gap-2 mb-3">
              <Filter className="h-5 w-5 text-slate-500" />
              <span className="text-sm font-medium text-slate-600">{t("categories")}</span>
            </div> */}
            <div className="flex flex-wrap gap-2 items-center justify-center">
              <Filter className="h-5 w-5 mt-1 text-slate-500" />
              <button
                onClick={() => setSelectedCategory("all")}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  selectedCategory === "all"
                    ? "bg-teal-500 text-white shadow-md"
                    : "bg-white text-slate-600 border border-slate-200 hover:border-teal-300 hover:text-teal-600"
                }`}
              >
                All Categories
              </button>
              {Object.entries(dynamicCategories).map(([key, name]) => (
                <button
                  key={key}
                  onClick={() => selectCategory(key)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                    selectedCategory === key
                      ? "bg-teal-500 text-white shadow-md"
                      : "bg-white text-slate-600 border border-slate-200 hover:border-teal-300 hover:text-teal-600"
                  }`}
                >
                  {name}
                  {selectedCategory === key && (
                    <X className="h-3 w-3" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* <div className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-slate-500" />
            <Select
              value={selectedLanguage}
              onValueChange={setSelectedLanguage}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder={t("all_languages")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("all_languages")}</SelectItem>
                {Object.entries(languageNames).map(([key, name]) => (
                  <SelectItem key={key} value={key}>
                    {name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div> */}
        </motion.div>

        {/* Sessions Grid */}
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array(6)
              .fill(0)
              .map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-white rounded-2xl h-80"></div>
                </div>
              ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredSessions.map((session, index) => (
              <motion.div
                key={session._id || session.id || index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index < 6 ? index * 0.1 : 0 }}
              >
                <Card className="h-full hover:shadow-2xl transition-all duration-300 border-0 bg-white/95 group">
                  <CardHeader className="relative overflow-hidden rounded-t-2xl">
                    <div className="aspect-video bg-gradient-to-br from-teal-100 to-emerald-100 rounded-xl relative overflow-hidden">
                      {session.image_url ? (
                        <Image
                          src={session.image_url}
                          alt={session.title}
                          width={400}
                          height={225}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          priority={index < 3}
                          quality={85}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Play className="h-12 w-12 text-teal-600 opacity-50" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all duration-300"></div>
                      <div className="absolute bottom-3 left-3">
                        <Badge className="bg-white/90 text-slate-700">
                          {session.category}
                        </Badge>
                      </div>
                      <div className="absolute top-3 right-3">
                        <div className="bg-teal-500 text-white p-2 rounded-full">
                          <Play className="h-4 w-4" />
                        </div>
                      </div>
                    </div>
                    <CardTitle className="text-xl font-bold mt-4 text-slate-800 group-hover:text-teal-600 transition-colors">
                      {getTranslated(session, "title")}
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="p-6">
                    <p className="text-slate-600 mb-4 leading-relaxed h-20 overflow-hidden">
                      {getTranslated(session, "description") ||
                        "Transform your mindset and unlock your potential with this powerful hypnotherapy session."}
                    </p>

                    <div className="flex items-center gap-4 mb-4 text-sm text-slate-500">
                      {/* <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {session.duration || 25} min
                      </div> */}
                      <div className="flex items-center gap-1">
                        {(() => {
                          const seed = (session.title?.length || 10) + index * 7;
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
                    </div>

                    {/* Available Languages */}
                    <div className="mb-6">
                      <p className="text-sm font-medium text-slate-700 mb-2">
                        {t("available_in")}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {session.languages?.slice(0, 3).map((lang) => (
                          <Badge
                            key={lang}
                            variant="outline"
                            className="text-xs bg-white text-slate-700 border-slate-300"
                          >
                            {languageNames[lang]}
                          </Badge>
                        ))}
                        {session.languages?.length > 3 && (
                          <Badge variant="outline" className="text-xs bg-white text-slate-700 border-slate-300">
                            +{session.languages.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>



                    <div className="space-y-2">
                      <Button
                        onClick={() => handleSessionAction(session)}
                        className="cursor-pointer w-full bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white"
                      >
                        <Play className="mr-2 h-4 w-4" />
                        {session.child_sessions && session.child_sessions.length > 0
                          ? t("view_collection")
                          : t("start_session")}
                      </Button>
                      {authSession?.user?.role === "admin" && (
                        <div className="flex gap-2">
                          <Button
                            onClick={() => router.push(`/admin/sessions/edit/${session._id}`)}
                            variant="outline"
                            className="cursor-pointer flex-1 border-teal-300 text-teal-700 hover:bg-teal-50 hover:border-teal-400"
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </Button>
                          <Button
                            onClick={() => handleDeleteSession(session._id)}
                            disabled={deleting === session._id}
                            className="cursor-pointer flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            {deleting === session._id ? 'Deleting...' : 'Delete'}
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {filteredSessions.length === 0 && !isLoading && (
          <div className="text-center py-16">
            <p className="text-xl text-slate-600">{t("no_sessions_found")}</p>
            <Button
              onClick={() => {
                setSelectedCategory("all");
              }}
              variant="outline"
              className="mt-4"
            >
              {t("clear_filters")}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
