"use client";
import Link from "next/link";
import Image from "next/image";
import React, { useState, useEffect, Suspense } from "react";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  Globe,
  ChevronDown,
  User,
  LogOut,
  Instagram,
  Youtube,
  Linkedin,
  DollarSign,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/components/LanguageProvider";
import {
  CurrencyProvider,
  CurrencySelector,
} from "@/components/CurrencyConverter";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOut, useSession } from "next-auth/react";
import SessionManager from "@/components/SessionManager";

const languages = [
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "ar", name: "العربية", flag: "🇦🇪" },
  { code: "hi", name: "हिंदी", flag: "🇮🇳" },
];

function LayoutContent({ children, currentPageName }) {
  const pathname = usePathname();
  const isHomePage = pathname === '/';
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { currentLanguage, changeLanguage, t, isRTL } = useLanguage();
  
  // Single session call for entire layout
  const { data: session, status } = useSession();
  const isLoading = status === "loading";

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      // Small delay to show spinner before signOut
      await new Promise(resolve => setTimeout(resolve, 100));
      await signOut({ callbackUrl: '/' });
    } catch (error) {
      setIsLoggingOut(false);
    }
  };



  const navigationItems = [
    { name: t("home"), href: "/" },
    // { name: t('about'), href: "/about" },
    { name: t("sessions"), href: "/sessions" },
    { name: t('blog'), href: "/blog"},
    // { name: t('contact'), href: "/contact" }
  ];



  return (
    <CurrencyProvider>
      <div
        className={`min-h-screen bg-gradient-to-b from-slate-50 to-white ${
          isRTL ? "rtl" : "ltr"
        }`}
        dir={isRTL ? "rtl" : "ltr"}
      >
        {/* Header */}
        <header className={`bg-white/80 backdrop-blur-md border-b border-teal-100 z-50 ${
          isHomePage ? 'relative' : 'sticky top-0'
        }`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              {/* Logo */}
              <Link href="/">
                <Image
                  src="https://cdn.subconsciousvalley.workers.dev/legend.png"
                  alt="Subconscious Valley Logo"
                  width={120}
                  height={48}
                  className="h-12 w-auto"
                  priority
                  quality={90}
                />
              </Link>

              {/* Desktop Navigation */}
              <nav className="hidden md:flex items-center space-x-8">
                {navigationItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`text-sm font-medium transition-colors duration-200 hover:text-teal-600 ${
                        isActive
                          ? "text-teal-600 border-b-2 border-teal-600 pb-1"
                          : "text-slate-700"
                      }`}
                    >
                      {item.name}
                    </Link>
                  );
                })}
              </nav>

              {/* Right side items */}
              <div className="flex items-center space-x-4">
                {/* Currency Selector */}
                <div className="hidden sm:flex items-center space-x-2 z-99">
                  {/* <DollarSign className="h-4 w-4 text-slate-500" /> */}
                  <CurrencySelector />
                </div>

                {/* Language Switcher */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex items-center space-x-2"
                      disabled={false}
                      style={{ opacity: 1, color: '#000000' }}
                    >
                      <Globe className="h-4 w-4" />
                      <span className="text-sm">
                        {
                          languages.find((l) => l.code === currentLanguage)
                            ?.flag
                        }
                      </span>
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {languages.map((lang) => (
                      <DropdownMenuItem
                        key={lang.code}
                        onClick={() => changeLanguage(lang.code)}
                        className="cursor-pointer hover:bg-teal-50 hover:text-teal-700"
                      >
                        <span className="mr-2">{lang.flag}</span>
                        {lang.name}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* User Menu */}
                {mounted && !isLoading && (session ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex items-center space-x-2 cursor-pointer"
                        style={{ opacity: 1, color: '#000000' }}
                        disabled={isLoggingOut}
                      >
                        <div className="h-6 w-6 rounded-full bg-gradient-to-r from-teal-500 to-emerald-600 flex items-center justify-center">
                          <User className="h-4 w-4 text-white" />
                        </div>
                        <span className="text-sm hidden sm:block">
                          {session.user.name}
                        </span>
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link
                          href="/dashboard"
                          className="flex items-center w-full cursor-pointer hover:bg-teal-50 hover:text-teal-700"
                        >
                          <User className="mr-2 h-4 w-4" />
                          {t("dashboard")}
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={handleLogout} 
                        className="cursor-pointer hover:bg-teal-50 hover:text-teal-700" 
                        disabled={isLoggingOut}
                        onSelect={(e) => {
                          if (isLoggingOut) {
                            e.preventDefault();
                          }
                        }}
                      >
                        {isLoggingOut ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-teal-600 mr-2"></div>
                        ) : (
                          <LogOut className="mr-2 h-4 w-4" />
                        )}
                        {isLoggingOut ? "Logging out..." : t("logout")}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Link href="/login" className="cursor-pointer">
                    <Button
                      size="sm"
                      className="cursor-pointer bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white"
                    >
                      {t("login")}
                    </Button>
                  </Link>
                ))}

                {/* Mobile menu button */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="md:hidden"
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                  {isMenuOpen ? (
                    <X className="h-5 w-5" />
                  ) : (
                    <Menu className="h-5 w-5" />
                  )}
                </Button>
              </div>
            </div>

            {isMenuOpen && (
              <div className="md:hidden py-4 space-y-4 border-t border-teal-100">
                <div className="px-2 pt-2 pb-3 space-y-1">
                  {navigationItems.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:text-teal-600 hover:bg-teal-50"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>

                <div className="pt-4 pb-3 border-t border-teal-100">
                  <div className="px-5 space-y-3">
                    {/* Currency Selector for Mobile */}
                    <div className="flex items-center space-x-2">
                      <DollarSign className="h-4 w-4 text-slate-500" />
                      <CurrencySelector />
                    </div>

                    {/* Language Selector for Mobile */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start"
                          style={{ opacity: 1, color: '#000000' }}
                        >
                          <Globe className="mr-2 h-4 w-4" />
                          {
                            languages.find((l) => l.code === currentLanguage)
                              ?.name
                          }
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="w-56">
                        {languages.map((lang) => (
                          <DropdownMenuItem
                            key={lang.code}
                            onClick={() => {
                              changeLanguage(lang.code);
                              setIsMenuOpen(false);
                            }}
                            className="cursor-pointer hover:bg-teal-50 hover:text-teal-700"
                          >
                            <span className="mr-2">{lang.flag}</span>
                            {lang.name}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {!session && (
                    <div className="mt-6 px-5">
                      <Link href="/login">
                        <Button
                          className="w-full bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          {t("login")}
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Logout Overlay */}
        {isLoggingOut && (
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[9999] flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 shadow-xl flex items-center gap-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-teal-600"></div>
              <span className="text-slate-700 font-medium">Logging out...</span>
            </div>
          </div>
        )}

        {/* Session Manager */}
        <SessionManager />
        
        {/* Main Content */}
        <main className="flex-1">{children}</main>

        {/* Footer */}
        <footer className="bg-slate-800 text-white mt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="md:col-span-2">
                <div className="mb-4">
                  <Link href="/">
                    <Image
                      src="https://cdn.subconsciousvalley.workers.dev/legend.png"
                      alt="Subconscious Valley Logo"
                      width={120}
                      height={48}
                      className="h-12 w-auto bg-white p-1 rounded"
                      priority
                      quality={90}
                    />
                  </Link>
                </div>
                <p className="text-slate-300 mb-4">{t("hero_subtitle")}</p>

                <div className="text-sm text-slate-400 space-y-1 mb-4">
                  <p>📍 Dubai, United Arab Emirates</p>
                  <p>✉️ hello@subconsciousvalley.com</p>
                </div>

                {/* Social Media Links */}
                <div className="flex space-x-4">
                  <a
                    href="https://www.instagram.com/subconsciousvalley/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-300 hover:text-pink-400 transition-colors"
                  >
                    <Instagram className="h-5 w-5" />
                  </a>
                  <a
                    href="https://www.youtube.com/@SubconsciousValley"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-300 hover:text-red-400 transition-colors"
                  >
                    <Youtube className="h-5 w-5" />
                  </a>
                  <a
                    href="https://www.tiktok.com/@subconciousvalley"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-300 hover:text-white transition-colors"
                  >
                    <svg
                      className="h-5 w-5"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-.88-.05A6.33 6.33 0 0 0 5.16 20.5a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.5z" />
                    </svg>
                  </a>
                  <a
                    href="https://www.facebook.com/people/Subconscious-Valley/61581912532657/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-300 hover:text-white transition-colors"
                  >
                    <svg
                      className="h-5 w-5"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                  </a>
                  <a
                    href="https://www.linkedin.com/in/vanita-pande-343032165"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-300 hover:text-blue-400 transition-colors"
                  >
                    <Linkedin className="h-5 w-5" />
                  </a>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-4">{t("quick_links")}</h4>
                <ul className="space-y-2 text-slate-300">
                  <li>
                    <Link href="/" className="hover:text-teal-400">
                      {t("home")}
                    </Link>
                  </li>
                  <li>
                    <Link href="/sessions" className="hover:text-teal-400">
                      {t("sessions")}
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-4">{t("legal")}</h4>
                <ul className="space-y-2 text-slate-300">
                  <li>
                    <Link href="/privacy" className="hover:text-teal-400">
                      {t("privacy_policy")}
                    </Link>
                  </li>
                  <li>
                    <Link href="/terms" className="hover:text-teal-400">
                      {t("terms_conditions")}
                    </Link>
                  </li>
                  {/* <li>
                    <Link href="/admin" className="hover:text-teal-400">
                      {t("admin")}
                    </Link>
                  </li> */}
                </ul>
              </div>
            </div>

            <div className="border-t border-slate-700 mt-8 pt-8 text-center text-slate-400">
              <p>
                &copy; {new Date().getFullYear()} {t("brand_name")}.{" "}
                {t("all_rights_reserved")}
              </p>
            </div>
          </div>
        </footer>
      </div>
    </CurrencyProvider>
  );
}

export default function Layout({ children, currentPageName }) {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-teal-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    }>
      <LayoutContent children={children} currentPageName={currentPageName} />
    </Suspense>
  );
}
