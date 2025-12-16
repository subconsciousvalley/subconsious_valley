"use client";
import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Headphones,
  Download,
  FileText,
  Lock,
  AlertTriangle,
} from "lucide-react";
import FeedbackPopup from "@/components/FeedbackPopup";

const languageNames = {
  english: "English",
  hindi: "हिंदी",
  arabic: "العربية",
};

function SessionPlayerContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session");
  const childId = searchParams.get("child");
  const subId = searchParams.get("sub");
  const { status } = useSession();

  const [sessionData, setSessionData] = useState(null);
  const [hasAccess, setHasAccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState("english");
  const [currentAudioUrl, setCurrentAudioUrl] = useState("");
  const [showFeedback, setShowFeedback] = useState(false);

  useEffect(() => {
    const checkAccessAndLoad = async () => {
      if (!sessionId || status === "loading") {
        return;
      }

      if (status === "unauthenticated") {
        window.location.href = "/login";
        return;
      }

      try {
        // First check if we have any sessions at all
        const allSessionsRes = await fetch("/api/sessions");
        const allSessions = await allSessionsRes.json();

        // Fetch the parent session
        const sessionRes = await fetch(
          `/api/sessions/${sessionId}?` + new Date().getTime(),
          {
            cache: "no-store",
            headers: {
              "Cache-Control": "no-cache",
            },
          }
        );

        if (!sessionRes.ok) {
          setIsLoading(false);
          return;
        }

        const parentSession = await sessionRes.json();

        let foundSession = null;

        if (subId && childId) {
          // Playing a specific sub-session
          const childSession = parentSession.child_sessions?.find(
            (child) => child._id?.toString() === childId
          );

          foundSession = childSession?.sub_sessions?.find(
            (sub) => sub._id?.toString() === subId
          );
        } else if (childId) {
          // Playing a child session
          const childSession = parentSession.child_sessions?.find(
            (child) => child._id?.toString() === childId
          );
          if (childSession) {
            if (childSession.sub_sessions?.length > 0) {
              foundSession = childSession.sub_sessions[0];
            } else {
              foundSession = childSession;
            }
          }
        } else {
          // Playing parent session - use first available
          if (parentSession.child_sessions?.length > 0) {
            const firstChild = parentSession.child_sessions[0];
            if (firstChild.sub_sessions?.length > 0) {
              foundSession = firstChild.sub_sessions[0];
            } else {
              foundSession = firstChild;
            }
          } else {
            foundSession = parentSession;
          }
        }

        // If specific IDs not found, fallback to first available session
        if (!foundSession && parentSession.child_sessions?.length > 0) {
          const firstChild = parentSession.child_sessions[0];
          if (firstChild.sub_sessions?.length > 0) {
            foundSession = firstChild.sub_sessions[0];
          } else {
            foundSession = firstChild;
          }
        }

        if (!foundSession) {
          console.error("Session not found:", {
            sessionId,
            childId,
            subId,
            parentSession,
          });
          setIsLoading(false);
          return;
        }

        // Generate audio URLs if not present
        if (!foundSession.audio_urls && foundSession.title) {
          // Find the actual array indices for proper URL generation
          let childIndex = 0;
          let subIndex = 0;

          if (childId) {
            childIndex =
              parentSession.child_sessions?.findIndex(
                (child) => child._id?.toString() === childId
              ) || 0;
          }

          if (subId && childId) {
            const childSession = parentSession.child_sessions?.find(
              (child) => child._id?.toString() === childId
            );
            subIndex =
              childSession?.sub_sessions?.findIndex(
                (sub) => sub._id?.toString() === subId
              ) || 0;
          } else {
            subIndex = foundSession.order - 1 || 0;
          }

          const baseUrl = "https://cdn.subconsciousvalley.workers.dev/";
          const sessionTitle = foundSession.title
            .toLowerCase()
            .replace(/[^a-z0-9]/g, "-")
            .replace(/-+/g, "-")
            .replace(/^-|-$/g, "");

          foundSession.audio_urls = {
            english: `${baseUrl}session-${sessionId}-child-${childIndex}-english-${sessionTitle}.mp3`,
            hindi: `${baseUrl}session-${sessionId}-child-${childIndex}-hindi-${sessionTitle}.mp3`,
            arabic: `${baseUrl}session-${sessionId}-child-${childIndex}-arabic-${sessionTitle}.mp3`,
          };
        }

        setSessionData(foundSession);

        // Check if user has purchased this session
        const purchasesRes = await fetch("/api/purchases");
        const purchases = await purchasesRes.json();

        // For child sessions, check if the specific child is purchased or free
        let hasAccess = false;
        
        if (childId) {
          // Check if this specific child session is purchased
          const hasPurchasedChild = purchases.some(
            (p) =>
              p.session_id === sessionId &&
              p.child_session_id === childId &&
              p.payment_status === "completed"
          );
          
          // Get the child session to check if it's free
          const childSession = parentSession.child_sessions?.find(
            (child) => child._id?.toString() === childId
          );
          
          hasAccess = hasPurchasedChild || !childSession?.price || childSession?.price === 0;
        } else {
          // For parent sessions, they are always free to browse
          hasAccess = true;
        }

        if (hasAccess || parentSession.is_sample) {
          setHasAccess(true);

          // Get available languages and set the first one
          const availableLanguages = foundSession.audio_urls
            ? Object.keys(foundSession.audio_urls).filter(
                (lang) => foundSession.audio_urls[lang]
              )
            : [];
          const firstLanguage = availableLanguages[0] || "english";
          setSelectedLanguage(firstLanguage);

          // Get audio URL for the first available language
          let audioUrl = "";
          if (
            foundSession.audio_urls &&
            foundSession.audio_urls[firstLanguage]
          ) {
            audioUrl = foundSession.audio_urls[firstLanguage];
          }

          setCurrentAudioUrl(audioUrl);
        } else {
          setHasAccess(false);
        }
      } catch (error) {
        console.error("Error loading session data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAccessAndLoad();
  }, [sessionId, status]);

  const handleLanguageChange = (lang) => {
    setSelectedLanguage(lang);
    if (sessionData && sessionData.audio_urls) {
      let audioUrl = sessionData.audio_urls[lang] || "";
      setCurrentAudioUrl(audioUrl);
    } else {
      console.log("No audio URLs found in session data");
    }
  };

  // Get available languages from audio_urls
  const getAvailableLanguages = () => {
    if (!sessionData?.audio_urls) return [];
    return Object.keys(sessionData.audio_urls).filter(
      (lang) => sessionData.audio_urls[lang]
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-teal-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  if (!sessionData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-teal-50 flex items-center justify-center text-center p-4">
        <Card>
          <CardContent className="p-8">
            <h2 className="text-xl font-bold text-red-600 mb-4">
              Session Not Found
            </h2>
            <p className="text-slate-600 mb-6">
              The session you are looking for does not exist.
            </p>
            <Link href="/sessions">
              <Button className="cursor-pointer">Browse Sessions</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-teal-50 flex items-center justify-center text-center p-4">
        <Card className="max-w-md">
          <CardHeader>
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="h-8 w-8 text-amber-600" />
            </div>
            <CardTitle>Access Denied</CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <p className="text-slate-600 mb-6">
              You need to purchase this session to get access.
            </p>
            <Link href={`/checkout?session=${sessionId}`}>
              <Button className="cursor-pointer">Purchase Now</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-teal-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4">
          <Link
            href={childId ? `/collection?session=${sessionId}` : "/sessions"}
          >
            <Button variant="ghost" size="sm" className="cursor-pointer">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {childId ? "Back to Collection" : "Back to Sessions"}
            </Button>
          </Link>
        </div>

        <div>
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl lg:text-3xl font-bold text-slate-800">
                {sessionData.title}
              </CardTitle>
              <p className="text-slate-600 pt-2">{sessionData.description}</p>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-8 items-start">
                {/* Audio Player */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                      <Headphones className="h-5 w-5 text-teal-600" />
                      Session Audio
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <span>Languages:</span>
                      {getAvailableLanguages().length > 1 ? (
                        <select
                          value={selectedLanguage}
                          onChange={(e) => handleLanguageChange(e.target.value)}
                          className="px-2 py-1 border rounded-md text-sm cursor-pointer"
                        >
                          {getAvailableLanguages().map((lang) => (
                            <option key={lang} value={lang}>
                              {languageNames[lang] || lang}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span>
                          {languageNames[getAvailableLanguages()[0]] ||
                            "English"}
                        </span>
                      )}
                    </div>
                  </div>

                  {currentAudioUrl ? (
                    <audio
                      controls
                      controlsList="nodownload"
                      src={currentAudioUrl}
                      className="w-full"
                      preload="metadata"
                      crossOrigin="anonymous"
                    >
                      Your browser does not support the audio element.
                    </audio>
                  ) : (
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800 p-4 rounded-r-lg">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5" />
                        <p className="font-medium">
                          Audio for '{languageNames[selectedLanguage]}' is not
                          available.
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="bg-blue-50 px-4 rounded-lg text-blue-800 text-sm">
                    <p>
                      <strong>Pro Tip:</strong> For best results, listen in a
                      quiet, comfortable space where you won't be disturbed. Use
                      headphones for an immersive experience.
                    </p>
                  </div>

                  <div className="bg-blue-50 px-4 rounded-lg text-blue-800 text-sm">
                    <p>
                      <strong>Your Feedback Matters:</strong> Let us know how
                      you felt after this session.
                      <button
                        onClick={() => setShowFeedback(true)}
                        className="text-blue-600 hover:text-blue-700 underline font-medium cursor-pointer ml-1"
                      >
                        Share your experience
                      </button>
                    </p>
                  </div>
                </div>

                {/* Downloadable Materials */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <Download className="h-5 w-5 text-teal-600" />
                    Additional Materials
                  </h3>

                  {sessionData.materials && sessionData.materials.length > 0 ? (
                    <div className="space-y-2">
                      {sessionData.materials.map((material, index) => (
                        <a
                          key={index}
                          href={material.link}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button
                            variant="outline"
                            className="w-full justify-start gap-2 cursor-pointer"
                          >
                            <FileText className="h-4 w-4 Upper" />{" "}
                            {material.name.toUpperCase()}
                          </Button>
                        </a>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-500 text-sm">
                      No additional materials available
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <FeedbackPopup
        isOpen={showFeedback}
        onClose={() => setShowFeedback(false)}
        sessionTitle={sessionData?.title}
      />
    </div>
  );
}

export default function SessionPlayer() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-teal-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
        </div>
      }
    >
      <SessionPlayerContent />
    </Suspense>
  );
}
