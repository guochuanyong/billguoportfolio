export default function Contact() {
  const contact = {
    phoneDisplay: "(780) 667-3088", 
    phoneHref: "tel:+17806673088",  
    email: "billguo94@gmail.com", 
    location: "Fort McMurray, Alberta, Canada", 
  };

  const socials = [
    {
      name: "LinkedIn",
      href: "https://www.linkedin.com/in/bill-guo-18d/", 
      icon: LinkedInIcon,
      scale: "scale-110 translate-x-[1.5px] translate-y-[-2px]",
    },
    {
      name: "GitHub",
      href: "https://github.com/guochuanyong",
      icon: GitHubIcon,
      scale: "scale-110",
    },
    {
      name: "Instagram",
      href: "https://www.instagram.com/billguoo/", 
      icon: InstagramIcon,
      scale: "scale-130",
    },
  ];

  return (
    <section
      id="contact"
      style={{ scrollMarginTop: "-180px" }}
      className="w-full max-w-6xl mx-auto px-6 pt-40 pb-24"
    >
      <h2 className="text-3xl font-bold">Contact</h2>
      <p className="text-white/70 mt-2 max-w-2xl">
        Reach out and connect with me. Let's collaborate, or chat about projects.
      </p>

      <div className="mt-10 grid gap-6 md:grid-cols-2">
        {/* Contact Info */}
        <div
          className="
            group rounded-2xl
            bg-white/5 border border-white/10
            p-6
            hover:bg-white/10 hover:border-emerald-400/30
            transition
          "
        >
          <h3 className="text-lg font-semibold group-hover:text-emerald-300 transition">
            Contact Info
          </h3>

          <div className="mt-5 space-y-4 text-sm">
            {/* Phone */}
            <div className="flex items-start gap-3">
              <span className="mt-[2px] text-emerald-200/80">
                <PhoneIcon className="h-5 w-5" />
              </span>
              <div>
                <div className="text-white/60">Phone</div>
                <a
                  href={contact.phoneHref}
                  className="text-white hover:text-emerald-300 transition"
                >
                  {contact.phoneDisplay}
                </a>
              </div>
            </div>

            {/* Email */}
            <div className="flex items-start gap-3">
              <span className="mt-[2px] text-emerald-200/80">
                <MailIcon className="h-5 w-5" />
              </span>
              <div>
                <div className="text-white/60">Email</div>
                <a
                  href={`mailto:${contact.email}`}
                  className="text-white hover:text-emerald-300 transition break-all"
                >
                  {contact.email}
                </a>
              </div>
            </div>

            {/* Location */}
            <div className="flex items-start gap-3">
              <span className="mt-[2px] text-emerald-200/80">
                <PinIcon className="h-5 w-5" />
              </span>
              <div>
                <div className="text-white/60">Location</div>
                <div className="text-white">{contact.location}</div>
              </div>
            </div>
          </div>

        </div>

        {/* Follow Me */}
        <div
          className="
            group rounded-2xl
            bg-white/5 border border-white/10
            p-6
            hover:bg-white/10 hover:border-emerald-400/30
            transition
          "
        >
          <h3 className="text-lg font-semibold group-hover:text-emerald-300 transition">
            Follow Me
          </h3>

          <p className="text-sm text-white/70 mt-2">
            Find my work and updates here:
          </p>

          <div className="mt-6 flex items-center gap-4">
            {socials.map((s) => {
              const Icon = s.icon;

              return (
                <a
                  key={s.name}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.name}
                  title={s.name}
                  className="
                    inline-flex items-center justify-center
                    h-12 w-12 rounded-2xl
                    bg-emerald-500/10 border border-emerald-500/10
                    text-emerald-200
                    hover:bg-emerald-500/15 hover:border-emerald-400/30 hover:text-emerald-100
                    transition
                  "
                >
                  <Icon className={`h-6 w-6 ${s.scale}`} />
                </a>
              );
            })}
          </div>

          {/* If you prefer image placeholders instead of SVG icons, use this:
              <div className="mt-6 flex items-center gap-4">
                <a ...>
                  <img src="/icons/linkedin.png" alt="LinkedIn" className="h-6 w-6" />
                </a>
                ...
              </div>
          */}

        </div>
      </div>
    </section>
  );
}

/* ---------------- Icons (inline SVG) ---------------- */

function LinkedInIcon({ className = "" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M4.98 3.5C4.98 4.88 3.87 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1 4.98 2.12 4.98 3.5zM.5 23.5h4V7.98h-4V23.5zM8.5 7.98h3.83v2.12h.05c.53-1 1.83-2.12 3.77-2.12 4.03 0 4.77 2.65 4.77 6.1v9.42h-4v-8.36c0-2-.04-4.56-2.78-4.56-2.78 0-3.2 2.17-3.2 4.42v8.5h-4V7.98z" />
    </svg>
  );
}

function GitHubIcon({ className = "" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 .5C5.73.5.75 5.6.75 12c0 5.1 3.29 9.42 7.86 10.95.57.1.78-.25.78-.56v-2c-3.2.7-3.87-1.58-3.87-1.58-.53-1.36-1.3-1.72-1.3-1.72-1.06-.75.08-.74.08-.74 1.17.08 1.79 1.23 1.79 1.23 1.04 1.81 2.73 1.29 3.4.99.1-.77.4-1.29.72-1.59-2.55-.3-5.23-1.31-5.23-5.83 0-1.29.45-2.34 1.19-3.17-.12-.3-.52-1.5.11-3.13 0 0 .97-.32 3.18 1.21.92-.26 1.9-.39 2.88-.39.98 0 1.96.13 2.88.39 2.21-1.53 3.18-1.21 3.18-1.21.63 1.63.23 2.83.11 3.13.74.83 1.19 1.88 1.19 3.17 0 4.53-2.69 5.52-5.26 5.82.41.37.78 1.1.78 2.22v3.29c0 .31.2.67.79.56 4.56-1.53 7.85-5.85 7.85-10.95C23.25 5.6 18.27.5 12 .5z" />
    </svg>
  );
}

function InstagramIcon({ className = "" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M7.5 2h9A5.5 5.5 0 0 1 22 7.5v9A5.5 5.5 0 0 1 16.5 22h-9A5.5 5.5 0 0 1 2 16.5v-9A5.5 5.5 0 0 1 7.5 2zm9 2h-9A3.5 3.5 0 0 0 4 7.5v9A3.5 3.5 0 0 0 7.5 20h9a3.5 3.5 0 0 0 3.5-3.5v-9A3.5 3.5 0 0 0 16.5 4z" />
      <path d="M12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6z" />
      <path d="M17.25 6.5a1 1 0 1 1 0 2 1 1 0 0 1 0-2z" />
    </svg>
  );
}

function PhoneIcon({ className = "" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
      <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.08 4.18 2 2 0 0 1 4.06 2h3a2 2 0 0 1 2 1.72c.12.86.32 1.7.6 2.5a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.58-1.12a2 2 0 0 1 2.11-.45c.8.28 1.64.48 2.5.6A2 2 0 0 1 22 16.92z"
      />
    </svg>
  );
}

function MailIcon({ className = "" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      aria-hidden="true"
    >
      <rect
        x="4"
        y="6"
        width="16"
        height="12"
        rx="2"
        strokeWidth="2"
      />
      <path
        d="M4 6l8 6 8-6"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PinIcon({ className = "" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
      <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        d="M12 21s7-4.35 7-11a7 7 0 1 0-14 0c0 6.65 7 11 7 11z"
      />
      <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        d="M12 10.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z"
      />
    </svg>
  );
}