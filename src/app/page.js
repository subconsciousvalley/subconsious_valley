"use client";
import { useRef, useState, useEffect, useCallback, useMemo, lazy, Suspense, memo } from "react";
import { CustomTabs } from "./components/CustomTabs";
import { CustomProgress } from "./components/CustomProgress";
import { useLanguage } from "./components/LanguageProvider";

// Lazy load heavy components
const About = lazy(() => import("./about/page"));
const Contact = lazy(() => import("./contact/page"));
const SubscriptionPopup = lazy(() => import("@/components/SubscriptionPopup"));

// Memoized loading dots component
const LoadingDots = memo(() => (
  <div className="flex space-x-2">
    <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce"></div>
    <div className="w-3 h-3 bg-pink-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
    <div className="w-3 h-3 bg-cyan-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
  </div>
));
LoadingDots.displayName = 'LoadingDots';

export default function Home() {
  const videoRef = useRef(null);
  const popupVideoRef = useRef(null);
  const [showPopup, setShowPopup] = useState(false);
  const [showSubscriptionPopup, setShowSubscriptionPopup] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const { t, isRTL } = useLanguage();
  const [isSticky, setIsSticky] = useState(false);
  const [progress, setProgress] = useState(20);
  const [activeTab, setActiveTab] = useState("2");
  const progressRef = useRef(20);
  const timeoutRef = useRef(null);
  const tabsRef = useRef(null);
  const section2Ref = useRef(null);
  const section3Ref = useRef(null);



  // Memoize tab items
  const tabItems = useMemo(() => [
    { key: "2", label: t("about") },
    { key: "3", label: t("contact") },
  ], [t]);

  // Memoize refs and progress values
  const refs = useMemo(() => ({
    2: section2Ref,
    3: section3Ref,
  }), []);

  const progressValues = useMemo(() => ({ 2: 20, 3: 100 }), []);

  // Cache style classes
  const heroContentClass = useMemo(() => 
    `absolute bottom-20 max-w-lg ${isRTL ? "right-8" : "left-8"}`, [isRTL]
  );
  const heroTextClass = useMemo(() => 
    `mb-8 ${isRTL ? "text-right" : "text-left"}`, [isRTL]
  );

  const scrollToSection = useCallback((tabKey) => {
    setProgress(progressValues[tabKey]);

    const targetRef = refs[tabKey];
    if (targetRef.current) {
      const offsetTop = targetRef.current.offsetTop - 120;
      window.scrollTo({
        top: offsetTop,
        behavior: "smooth",
      });
    }
  }, [refs, progressValues]);

  useEffect(() => {
    let ticking = false;
    
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const scrollTop = window.scrollY;
          const firstSection = section2Ref.current;
          
          if (firstSection) {
            const shouldBeSticky = scrollTop >= firstSection.offsetTop - 120;
            
            if (shouldBeSticky !== isSticky) {
              setIsSticky(shouldBeSticky);
            }
            
            // Simplified progress calculation
            const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
            const scrollPercent = Math.min(scrollTop / maxScroll, 1);
            const newProgress = 20 + (scrollPercent * 80); // 20 to 100
            
            if (Math.abs(newProgress - progressRef.current) > 2) {
              progressRef.current = newProgress;
              setProgress(newProgress);
            }
          }
          
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isSticky]);



  // Show subscription popup after 5 seconds (only once per session)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const hasShownPopup = sessionStorage.getItem('subscriptionPopupShown');
    
    if (!hasShownPopup) {
      const subscriptionTimer = setTimeout(() => {
        setShowSubscriptionPopup(true);
        sessionStorage.setItem('subscriptionPopupShown', 'true');
      }, 8000); // Increased to 8 seconds to reduce immediate impact

      return () => clearTimeout(subscriptionTimer);
    }
  }, []);

  // Disable scroll when popup is open
  useEffect(() => {
    document.body.style.overflow = showSubscriptionPopup ? 'hidden' : 'unset';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showSubscriptionPopup]);

  const handleWatchTrailer = useCallback(() => {
    setShowPopup(true);
    timeoutRef.current = setTimeout(async () => {
      if (popupVideoRef.current) {
        try {
          await popupVideoRef.current.play();
        } catch (error) {
          console.log('Autoplay prevented:', error);
          // User will need to click play manually
        }
      }
    }, 100);
  }, []);

  const closePopup = useCallback(() => {
    setShowPopup(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (popupVideoRef.current) {
      popupVideoRef.current.pause();
    }
  }, []);

  return (
    <>
      <div className="relative h-screen">
        {!videoLoaded && (
          <div className="absolute inset-0 bg-gradient-to-br from-teal-900 via-black to-emerald-900 flex items-center justify-center">
            <LoadingDots />
          </div>
        )}
        
        <video
          ref={videoRef}
          className={`w-full h-full object-cover transition-opacity duration-700 ${
            videoLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          onLoadedData={() => setVideoLoaded(true)}
        >
          <source
            src="https://cdn.subconsciousvalley.workers.dev/hero_video.mp4"
            type="video/mp4"
          />
          Your browser does not support the video tag.
        </video>
        <div className="absolute inset-0 bg-black/40 bg-opacity-60"></div>
        {/* <Navbar /> */}
        <div className={heroContentClass}>
          <div className={heroTextClass}>
            <h1 className="text-yellow-400 text-2xl font-bold mb-4">
              {t("hero_title")}
            </h1>
            <p className="text-cyan-300 text-xl font-semibold mb-4">
              {t("hero_sub_title_1")}
            </p>
            <p className="text-white text-lg">{t("hero_sub_title_2")}</p>
          </div>
          <div
            className={`flex z-20 ${
              isRTL ? "space-x-reverse space-x-4 flex-row-reverse" : "space-x-4"
            }`}
          >
            {/* <Link href="/sessions"> */}
            <button
              onClick={handleWatchTrailer}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-3 rounded-full font-bold text-lg transition-all duration-300 cursor-pointer"
            >
              {t("watch_video")}
            </button>
            {/* </Link> */}
            {/* <button
              onClick={handleWatchTrailer}
              className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-black px-8 py-3 rounded-full font-bold text-lg transition-all duration-300 cursor-pointer"
            >
              {t("watch_video")}
            </button> */}
          </div>
        </div>

        {showPopup && (
          <div className="fixed inset-0 bg-black bg-opacity-10 flex items-end justify-center z-50">
            <div className="relative max-w-4xl w-full mx-4">
              <button
                onClick={closePopup}
                className="absolute -top-8 right-0 text-black hover:text-gray-600 text-xl font-bold z-10 bg-white rounded-full w-8 h-8 flex items-center justify-center leading-none"
              >
                X
              </button>
              <div className="bg-black bg-opacity-40 rounded-t-lg p-4 animate-slide-up">
                <video
                  ref={popupVideoRef}
                  className="w-full h-auto rounded"
                  controls
                  preload="auto"
                  poster="https://cdn.subconsciousvalley.workers.dev/main_banner.jpeg"
                >
                  <source src="https://cdn.subconsciousvalley.workers.dev/hero_video.mp4" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Sticky Progress Bar and Tabs (appear when scrolling) */}
      {isSticky && (
        <>
          <div className="fixed top-0 w-full z-[50] bg-white/95 shadow-sm transition-all duration-700 ease-out transform">
            <CustomProgress
              percent={progress}
              showInfo={false}
              strokeColor="#0d9488"
              className="h-1"
            />
            <div className="py-2">
              <CustomTabs
                activeKey={activeTab}
                onChange={(key) => {
                  setActiveTab(key);
                  scrollToSection(key);
                }}
                centered
                items={tabItems}
              />
            </div>
          </div>
        </>
      )}

      {/* Sections */}
      <div className="bg-white">
        {/* Static Progress Bar and Tabs (visible only when not sticky) */}
        {!isSticky && (
          <div ref={tabsRef} className="relative w-full z-20">
            <div className="w-full bg-white/95">
              <CustomProgress
                percent={progress}
                showInfo={false}
                strokeColor="#0d9488"
              />
            </div>
            <div className="w-full bg-white/98">
              <CustomTabs
                activeKey={activeTab}
                onChange={(key) => {
                  setActiveTab(key);
                  scrollToSection(key);
                }}
                centered
                items={tabItems}
              />
            </div>
          </div>
        )}
        {/* <section ref={section1Ref} className="min-h-screen p-8 pt-20">
          <h2 className="text-3xl font-bold mb-6">Sessions</h2>
          <p className="text-lg mb-4">
            Discover our transformative consciousness sessions designed to
            unlock your inner potential.
          </p>
          <p className="text-lg mb-4">
            Experience guided meditation sessions, brainwave entrainment, and
            altered state experiences.
          </p>
          <p className="text-lg mb-4">
            Choose from our variety of session types including Alpha, Theta, and
            Delta frequency programs.
          </p>
          <p className="text-lg">
            Join thousands of participants who have experienced profound
            personal growth and enhanced intuition.
          </p>
        </section> */}

        <section ref={section2Ref} className="min-h-screen p-8  bg-gray-50">
          <Suspense fallback={<div className="flex justify-center p-8"><LoadingDots /></div>}>
            <About t={t} />
          </Suspense>
        </section>

        <section
          ref={section3Ref}
          id="contact-section"
          className="p-8 pb-20 bg-gray-50"
        >
          <Suspense fallback={<div className="flex justify-center p-8"><LoadingDots /></div>}>
            <Contact t={t} />
          </Suspense>
        </section>
      </div>

      {/* Subscription Popup */}
      <Suspense fallback={null}>
        <SubscriptionPopup 
          isOpen={showSubscriptionPopup}
          onClose={() => setShowSubscriptionPopup(false)}
        />
      </Suspense>
    </>
  );
}
