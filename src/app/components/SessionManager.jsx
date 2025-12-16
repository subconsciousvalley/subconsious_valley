"use client";
import { useSession, signOut } from "next-auth/react";
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

export default function SessionManager() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const checkIntervalRef = useRef(null);

  useEffect(() => {
    if (status === "authenticated" && session) {
      // Check session validity every 5 minutes
      checkIntervalRef.current = setInterval(async () => {
        try {
          const response = await fetch('/api/auth/session');
          if (!response.ok || response.status === 401) {
            // Session expired or invalid
            await signOut({ 
              callbackUrl: '/login?expired=true',
              redirect: true 
            });
          }
        } catch (error) {
          // Network error or session invalid
          await signOut({ 
            callbackUrl: '/login?expired=true',
            redirect: true 
          });
        }
      }, 5 * 60 * 1000); // Check every 5 minutes
    }

    return () => {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
    };
  }, [session, status]);

  // Auto-logout 5 minutes before token expires
  useEffect(() => {
    if (status === "authenticated" && session) {
      const tokenExpiry = session.expires ? new Date(session.expires).getTime() : null;
      
      if (tokenExpiry) {
        const now = Date.now();
        const timeUntilExpiry = tokenExpiry - now;
        const logoutTime = timeUntilExpiry - (5 * 60 * 1000); // 5 minutes before expiry
        
        if (logoutTime > 0) {
          const timeoutId = setTimeout(async () => {
            await signOut({ 
              callbackUrl: '/login?expired=true',
              redirect: true 
            });
          }, logoutTime);
          
          return () => clearTimeout(timeoutId);
        }
      }
    }
  }, [session, status]);

  return null;
}