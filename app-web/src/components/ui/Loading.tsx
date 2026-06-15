"use client";

import { motion } from "framer-motion";
import { Mascot } from "@/components/Mascot";

export function Loading({ label = "Cargando…" }: { label?: string }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3">
      <motion.div
        animate={{ scale: [1, 1.08, 1] }}
        transition={{ repeat: Infinity, duration: 1.2 }}
      >
        <Mascot expression="thinking" size={56} />
      </motion.div>
      <p className="text-sm text-white/60">{label}</p>
    </div>
  );
}
