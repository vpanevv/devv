"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";

type Props = {
  /** Strings cycled through: typed, held, deleted, then the next one. */
  texts: string[];
  /** Static text rendered before the typed segment. */
  prefix?: string;
  /** Seconds per character while typing. */
  typeSpeed?: number;
  /** Seconds per character while deleting. */
  deleteSpeed?: number;
  /** Seconds a fully-typed string is held before it starts deleting. */
  holdTime?: number;
  cursorChar?: string;
  className?: string;
};

type State = {
  text: string;
  charIndex: number;
  deleting: boolean;
  wordIndex: number;
};

const INITIAL: State = { text: "", charIndex: 0, deleting: false, wordIndex: 0 };

/** Verbatim blink rhythm from the reference: a near-instant opacity flip with
 *  the visible/hidden cadence carried by repeatDelay. */
const cursorVariants: Variants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { duration: 0.01, repeat: Infinity, repeatDelay: 0.4, repeatType: "reverse" },
  },
};

export function Typewriter({
  texts,
  prefix = "",
  typeSpeed = 0.07,
  deleteSpeed = 0.04,
  holdTime = 1.8,
  cursorChar = "_",
  className,
}: Props) {
  const list = texts.filter((t): t is string => typeof t === "string" && t.length > 0);
  const reduced = useReducedMotion();

  const [state, setState] = useState<State>(INITIAL);

  // Reset when the strings themselves change (e.g. switching locale). Adjusting
  // state during render is React's sanctioned pattern here — an effect would
  // render one frame of the stale word first.
  const textsKey = list.join("|");
  const [prevKey, setPrevKey] = useState(textsKey);
  if (prevKey !== textsKey) {
    setPrevKey(textsKey);
    setState(INITIAL);
  }

  // Pause while off-screen so the component isn't re-rendering per character
  // for a headline nobody is looking at.
  const hostRef = useRef<HTMLSpanElement>(null);
  const [onScreen, setOnScreen] = useState(true);
  useEffect(() => {
    const el = hostRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setOnScreen(e.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // One timeout per transition. Every state change happens inside the timeout
  // callback, never synchronously in the effect body.
  useEffect(() => {
    if (reduced || !onScreen || list.length === 0) return;

    const word = list[state.wordIndex] ?? "";
    let delay: number;
    let advance: (s: State) => State;

    if (!state.deleting) {
      if (state.charIndex < word.length) {
        delay = typeSpeed * 1000;
        advance = (s) => ({
          ...s,
          text: s.text + word[s.charIndex],
          charIndex: s.charIndex + 1,
        });
      } else if (list.length > 1) {
        delay = holdTime * 1000;
        advance = (s) => ({ ...s, deleting: true });
      } else {
        return; // single word, fully typed — settle here
      }
    } else if (state.text.length > 0) {
      delay = deleteSpeed * 1000;
      advance = (s) => ({ ...s, text: s.text.slice(0, -1) });
    } else {
      delay = typeSpeed * 1000;
      advance = (s) => ({
        text: "",
        charIndex: 0,
        deleting: false,
        wordIndex: (s.wordIndex + 1) % list.length,
      });
    }

    const id = setTimeout(() => setState(advance), delay);
    return () => clearTimeout(id);
    // `list` is rebuilt each render; textsKey tracks its identity instead.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, textsKey, onScreen, reduced, typeSpeed, deleteSpeed, holdTime]);

  // Reserve the width of the longest entry so the container doesn't resize
  // character by character while typing.
  const longest = list.reduce((a, b) => (b.length > a.length ? b : a), "");

  if (reduced) {
    return (
      <span className={className}>
        {prefix}
        {list[0] ?? ""}
      </span>
    );
  }

  return (
    <span className={className}>
      {/* Full text for assistive tech — the animated characters below would
          otherwise be announced one letter at a time. */}
      <span className="sr-only">
        {prefix}
        {list.join(", ")}
      </span>
      <span aria-hidden="true">
        {prefix}
        <span ref={hostRef} className="relative inline-grid align-bottom">
          <span className="invisible col-start-1 row-start-1">{longest}</span>
          <span className="col-start-1 row-start-1 text-left whitespace-pre">
            {state.text}
            <motion.span
              variants={cursorVariants}
              initial="initial"
              animate="animate"
              className="text-teal"
            >
              {cursorChar}
            </motion.span>
          </span>
        </span>
      </span>
    </span>
  );
}
