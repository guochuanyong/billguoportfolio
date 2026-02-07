import { useState } from "react";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav
      className="
        fixed top-0 left-0 z-50 w-full
        bg-emerald-950/70 backdrop-blur-sm
        text-white
        border-b border-white/10
      "
    >
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo / Name */}
        <div className="text-xl font-bold leading-tight">
          <div>Bill Guo&apos;s</div>
          <div>Portfolio</div>
        </div>

        {/* Desktop links */}
        <div className="hidden md:flex gap-6 text-sm">
          <a href="#" className="hover:text-green-400 transition">
            About
          </a>
          <a href="#projects" className="hover:text-green-400 transition">
            Projects
          </a>
        </div>

        {/* Mobile menu button */}
        <button
          type="button"
          className="
            md:hidden inline-flex items-center justify-center
            rounded-lg p-2
            hover:bg-white/10
            focus:outline-none focus:ring-2 focus:ring-green-400/60
            transition
          "
          aria-label="Open menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <svg
            className="h-6 w-6"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {open ? (
              <>
                <path d="M18 6 6 18" />
                <path d="M6 6 18 18" />
              </>
            ) : (
              <>
                <path d="M4 6h16" />
                <path d="M4 12h16" />
                <path d="M4 18h16" />
              </>
            )}
          </svg>
        </button>
      </div>

      {/* Mobile dropdown panel */}
      {open && (
        <div className="md:hidden border-t border-white/10">
          <div className="max-w-6xl mx-auto px-6 py-3 flex flex-col gap-2">
            <a
              href="#"
              className="py-2 rounded-lg hover:bg-white/10 hover:text-green-400 transition"
              onClick={() => setOpen(false)}
            >
              About
            </a>
            <a
              href="#projects"
              className="py-2 rounded-lg hover:bg-white/10 hover:text-green-400 transition"
              onClick={() => setOpen(false)}
            >
              Projects
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}
