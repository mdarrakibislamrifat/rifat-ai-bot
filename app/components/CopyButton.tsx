"use client";
import { useState, useEffect } from "react";
import { Copy, Check } from "lucide-react";

interface ToastProps {
  visible: boolean;
}

function Toast({ visible }: ToastProps) {
  return (
    <div
      style={{
        position: "fixed",
        bottom: "24px",
        left: "50%",
        transform: `translateX(-50%) translateY(${visible ? "0" : "12px"})`,
        opacity: visible ? 1 : 0,
        transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
        pointerEvents: "none",
        zIndex: 9999,
      }}
    >
      <div className="flex items-center gap-2.5 bg-zinc-900 border border-white/10 text-white text-sm font-medium px-4 py-2.5 rounded-2xl shadow-xl shadow-black/40 backdrop-blur-sm">
        <span className="flex items-center justify-center w-5 h-5 bg-green-500/15 rounded-full">
          <Check size={11} className="text-green-400" strokeWidth={3} />
        </span>
        <span className="text-zinc-200 text-[13px]">Copied to clipboard</span>
      </div>
    </div>
  );
}

export default function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setShowToast(true);
      setTimeout(() => {
        setCopied(false);
        setShowToast(false);
      }, 2200);
    } catch {
      // fallback
    }
  };

  return (
    <>
      <button
        onClick={handleCopy}
        className="relative flex items-center justify-center w-5 h-5 rounded-md transition-all duration-200 text-zinc-300 hover:text-zinc-300 hover:bg-white/8 active:scale-90"
        title="Copy ID"
        aria-label="Copy ID to clipboard"
      >
        <span
          className="absolute inset-0 flex items-center justify-center transition-all duration-200"
          style={{ opacity: copied ? 0 : 1, transform: copied ? "scale(0.7)" : "scale(1)" }}
        >
          <Copy size={11} strokeWidth={2} />
        </span>
        <span
          className="absolute inset-0 flex items-center justify-center transition-all duration-200"
          style={{ opacity: copied ? 1 : 0, transform: copied ? "scale(1)" : "scale(0.7)" }}
        >
          <Check size={11} strokeWidth={2.5} className="text-green-400" />
        </span>
      </button>
      <Toast visible={showToast} />
    </>
  );
}