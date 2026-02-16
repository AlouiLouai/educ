"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function TeacherAuthPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/?auth=teacher");
  }, [router]);

  return null;
}
