"use client";

import { HodLayout } from "@/components/layouts/HodLayout";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <HodLayout>{children}</HodLayout>;
}
