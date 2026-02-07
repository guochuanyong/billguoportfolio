export default function Projects() {
  const projects = [
    {
      title: "Stock Market Dashboard",
      description:
        "Interactive dashboard for tracking SP500, NASDAQ100, and Dow Jones stocks. Stocked data extracteded from Yahoo Finance and Wikipedia with Python. Dashboard built in Power BI with DAX and Power Query.",
      tags: ["Python", "Power BI"],
      link: "https://github.com/guochuanyong/Trading-Dashboard",
    },
    {
      title: "Custom Data Extraction and Conversion Tool",
      description:
        "Custom SQL script for enrolment data extraction and python script for data conversion into custom XML data format.",
      tags: ["Python", "SQL", "XML"],
      link: "https://github.com/guochuanyong/LERS-Enrolment-Data-Reporting",
    },
    {
      title: "Automated Report Generator For KPI Reporting",
      description:
        "Workflow to log and organize incoming data requests from a shared inbox into a structured tracker.",
      tags: ["Excel", "Python", "VBA"],
      link: "#",
    },
    {
      title: "SQl Training For Analysts",
      description:
        "Workflow to log and organize incoming data requests from a shared inbox into a structured tracker.",
      tags: ["SQL"],
      link: "#",
    },
    {
      title: "Tableau Project",
      description:
        "Workflow to log and organize incoming data requests from a shared inbox into a structured tracker.",
      tags: ["Tableau"],
      link: "#",
    },
    {
      title: "Portfolio Website",
      description:
        "Workflow to log and organize incoming data requests from a shared inbox into a structured tracker.",
      tags: ["Node.js", "React", "Tailwind CSS"],
      link: "#",
    },
  ];

  return (
    <>
      {/* Anchor target for navigation */}
      <div id="projects" style={{ scrollMarginTop: "-175px" }} />

      {/* Visual Projects section */}
      <section className="w-full max-w-6xl mx-auto px-6 pt-72 pb-24 min-h-[calc(100vh-5rem)]">
        <h2 className="text-3xl font-bold">Projects</h2>
        <p className="text-white/70 mt-2 max-w-2xl">
          A few things I’ve built recently — dashboards, automation, and analytics tooling.
        </p>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => (
            <a
              key={p.title}
              href={p.link}
              className="
                group rounded-2xl
                bg-white/5 border border-white/10
                p-6
                flex flex-col
                h-80
                hover:bg-white/10 hover:border-emerald-400/30
                transition
              "
            >
              <h3 className="text-lg font-semibold group-hover:text-emerald-300 transition">
                {p.title}
              </h3>

              <p className="text-sm text-white/70 mt-2 leading-relaxed line-clamp-7">
                {p.description}
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                {p.tags.map((t) => (
                  <span
                    key={t}
                    className="text-xs px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-200 border border-emerald-500/10"
                  >
                    {t}
                  </span>
                ))}
              </div>

              <div className="mt-auto pt-5 text-sm text-emerald-300">
                View →
              </div>
            </a>
          ))}
        </div>
      </section>
    </>
  );
}
