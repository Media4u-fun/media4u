"use client";

import { usePathname } from "next/navigation";
import { Header } from "./header";
import { Footer } from "./footer";
import { TVRHeader } from "./tvr-header";
import { TVRFooter } from "./tvr-footer";
import { ReactNode } from "react";

export function LayoutWrapper({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isAdminPage = pathname?.startsWith("/admin");
  const isPortalPage = pathname?.startsWith("/portal");
  const isTVRPage = pathname?.startsWith("/tvr");
  const hideLayout = isAdminPage || isPortalPage;

  if (isTVRPage) {
    return (
      <>
        <TVRHeader />
        <main className="flex-1">{children}</main>
        <TVRFooter />
      </>
    );
  }

  return (
    <>
      {!hideLayout && <Header />}
      <main className={`flex-1 ${!hideLayout ? "pt-20" : ""}`}>{children}</main>
      {!hideLayout && <Footer />}
    </>
  );
}
