"use client";

import { AdvisorLayout } from "@/components/layouts/AdvisorLayout";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <AdvisorLayout>{children}</AdvisorLayout>;
}
