import { Link } from "react-router-dom";

export default function Projects() {
  const projects = [
    {
      title: "Stock Market Dashboard",
      description:
        "Interactive dashboard for tracking SP500, NASDAQ100, and Dow Jones stocks. Stock data extracted from Yahoo Finance and Wikipedia with Python. Dashboard built in Power BI with DAX and Power Query.",
      tags: ["Python", "Power BI"],
      link: "https://github.com/guochuanyong/Trading-Dashboard",
    },
    {
      title: "Netflix Dashboard",
      description:
        "Interactive dashboard for movies and TV shows on Netflix. Allows users to search for popular titles based on countries and genres, and filter by content type.",
      tags: ["Python", "Tableau"],
      link: "https://public.tableau.com/app/profile/bill.guo6908/viz/NetflixDashboard_17708668260490/DashboardMain",
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
        "Automated report generation for KPI reports. Uses complex Excel formulas to calculate KPI values. Python is used for variable mapping to generate Word report. VBA is used for selective formula removal in Excel.",
      tags: ["Excel", "Python", "VBA"],
      link: "https://github.com/guochuanyong/KPI-Automation",
    },
    {
      title: "Password Strength Analysis With Excel",
      description:
        "Data analysis and visualizations created in Excel. Used to showcase some commonly used Excel formulas and Pivot Tables for data analysis.",
      tags: ["Excel", "Formulas", "Pivot Tables"],
      link: "https://github.com/guochuanyong/password_strength",
    },
    {
      title: "Portfolio Website",
      description:
        "Portfolio website for showcasing my data analytics projects. Website hosted on Hostinger. ",
      tags: ["Node.js", "React", "Tailwind CSS"],
      link: "https://github.com/guochuanyong/billguoportfolio",
    },
    {
      title: "Calgary Property Map (Work In Progress)",
      description:
        "Interactive web map built with React and Leaflet. Displays Calgary with dynamic zoom and pan functionality. Designed as a foundation for parcel-level real estate visualization using open data.",
      tags: ["React", "Leaflet", "Mapping"],
      link: "/calgary-map",
      internal: true,
    },
  ];

  return (
    <>
      {/* Visual Projects section */}
      <section
        id="projects"
        style={{ scrollMarginTop: "-180px" }}
        className="w-full max-w-6xl mx-auto px-6 pt-72 pb-24 min-h-[calc(100vh-5rem)]"
      >
        <h2 className="text-3xl font-bold">Projects</h2>
        <p className="text-white/70 mt-2 max-w-2xl">
          {/* Add subtitle here if needed */}
        </p>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => {
            const Card = (
              <div
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
              </div>
            );

            return p.internal ? (
              <Link key={p.title} to={p.link}>
                {Card}
              </Link>
            ) : (
              <a
                key={p.title}
                href={p.link}
                target="_blank"
                rel="noopener noreferrer"
              >
                {Card}
              </a>
            );
          })}
        </div>
      </section>
    </>
  );
}
