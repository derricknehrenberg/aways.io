"use client";

import { useEffect, useState } from "react";

export default function StationClock({ timeOnly = false }: { timeOnly?: boolean }) {
  const [now, setNow] = useState<string | null>(null);

  useEffect(() => {
    const tick = () =>
      setNow(new Date().toISOString().slice(0, 19).replace("T", " ") + " UTC");
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  if (!now) return <span>—</span>;
  return <span>{timeOnly ? now.slice(11) : now}</span>;
}
