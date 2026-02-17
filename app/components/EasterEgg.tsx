import { useState } from "react";
import { motion } from "framer-motion";

// A text that reveals hidden content on click
export function Spoiler({ children, hint = "click to reveal" }: { children: React.ReactNode; hint?: string }) {
  const [revealed, setRevealed] = useState(false);
  return (
    <motion.span
      onClick={() => setRevealed(!revealed)}
      style={{
        cursor: "pointer",
        background: revealed ? "transparent" : "var(--text)",
        color: revealed ? "var(--text)" : "var(--text)",
        borderRadius: "4px",
        padding: "0 4px",
        transition: "background 0.3s ease",
      }}
      title={!revealed ? hint : undefined}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && setRevealed(!revealed)}
    >
      {children}
    </motion.span>
  );
}

// A text that types itself out character by character
export function Typewriter({ text, speed = 50 }: { text: string; speed?: number }) {
  const [displayedText, setDisplayedText] = useState("");
  const [started, setStarted] = useState(false);

  const start = () => {
    if (started) return;
    setStarted(true);
    let i = 0;
    const interval = setInterval(() => {
      setDisplayedText(text.slice(0, i + 1));
      i++;
      if (i >= text.length) clearInterval(interval);
    }, speed);
  };

  return (
    <span onClick={start} style={{ cursor: started ? "default" : "pointer", fontStyle: "italic", color: "var(--text-secondary)" }}>
      {started ? displayedText : "▸ click to play"}
      {started && displayedText.length < text.length && (
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.5, repeat: Infinity }}
        >
          |
        </motion.span>
      )}
    </span>
  );
}
