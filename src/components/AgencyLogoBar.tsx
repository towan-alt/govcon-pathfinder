const agencies = [
  "U.S. Marine Corps",
  "U.S. Army",
  "Dept. of Commerce",
  "Dept. of Veterans Affairs",
  "Dept. of Defense",
  "Small Business Administration",
  "Dept. of Homeland Security",
  "General Services Administration",
  "Dept. of Health & Human Services",
  "Dept. of Energy",
];

const AgencyLogoBar = () => {
  return (
    <section className="bg-primary py-8 border-y border-gold/10 overflow-hidden">
      <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-gold/60 mb-6 font-body">
        Contracts Executed With Top Federal Agencies Including
      </p>
      <div className="relative">
        {/* Fade edges */}
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-primary to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-primary to-transparent z-10" />

        <div className="flex animate-scroll">
          {[...agencies, ...agencies].map((name, i) => (
            <div
              key={i}
              className="flex-shrink-0 mx-8 flex items-center gap-3 text-gold-light/50 hover:text-gold/80 transition-colors duration-300"
            >
              <svg
                className="w-8 h-8 flex-shrink-0 opacity-60"
                viewBox="0 0 32 32"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="16" cy="16" r="14" stroke="currentColor" strokeWidth="1.5" />
                <path
                  d="M16 6l2.5 5h5.5l-4.5 3.5 1.5 5.5-5-3.5-5 3.5 1.5-5.5L8 11h5.5L16 6z"
                  fill="currentColor"
                  opacity="0.4"
                />
              </svg>
              <span className="text-sm font-medium whitespace-nowrap font-body">
                {name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AgencyLogoBar;
