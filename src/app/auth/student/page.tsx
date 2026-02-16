"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function StudentAuthPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/?auth=student");
  }, [router]);

  return null;
}
