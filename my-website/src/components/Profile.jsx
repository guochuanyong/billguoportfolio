import profilePic from "../assets/Profilepicture.jpg";

export default function Profile() {
  return (
    <main className="max-w-6xl mx-auto px-6 py-16">
      <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
        
        {/* Profile picture */}
        <div
            className="w-32 h-32 md:w-40 md:h-40 rounded-full shadow-[0_0_25px_rgba(34,197,94,0.8)]">
            <img
                src={profilePic}
                alt="Bill Guo"
                className="w-full h-full rounded-full object-cover 
                        border-4 border-white/10"
            />
        </div>

        {/* Text */}
        <div className="text-center md:text-left">
          <h1 className="text-4xl font-bold mb-4 text-white">Hi, I’m Bill</h1>

          <p className="text-gray-300 max-w-2xl leading-relaxed">
            A data analyst specialized in automation and analytics engineering.
            I build Python-driven data pipelines, SQL models, Excel-based reporting,
            and Power BI dashboards that turn data into actionable insights.
          </p>

          <p className="text-gray-300 max-w-2xl leading-relaxed">
            This site showcases some of my selected projects.
          </p>

          <a
            href="#projects"
            className="
              inline-block mt-6
              px-6 py-3
              rounded-lg
              bg-green-500/20
              text-green-300
              font-medium
              hover:bg-green-500/30
              hover:text-green-200
              transition
            "
          >
            View Projects →
          </a>

        </div>

      </div>
    </main>
  );
}
