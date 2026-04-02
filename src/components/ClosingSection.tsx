const ClosingSection = () => {
  return (
    <>
      <section className="py-20 lg:py-24" style={{ background: "hsl(0 0% 4%)" }}>
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-[1.15]">
              Ready to win your first federal{" "}
              <em className="text-primary italic">contract?</em>
            </h2>
            <p className="text-base text-white/60 max-w-xl mx-auto leading-relaxed">
              You don't need a team of 50, a fancy office, or a decade of experience. You need the right 
              strategy, the right guidance, and a proven system.
            </p>
            <div className="flex flex-wrap justify-center gap-4 pt-4">
              <a href="/book" className="btn-gold text-sm px-10 py-4 rounded-md">
                Book Your Strategy Call
              </a>
            </div>
            <p className="text-xs text-white/30">
              No cost. No obligation. Limited spots each month.
            </p>
          </div>
        </div>
      </section>

      <footer className="py-8 border-t" style={{ background: "hsl(0 0% 2%)", borderColor: "hsl(0 0% 100% / 0.05)" }}>
        <div className="container mx-auto px-6 text-center">
          <p className="text-xs text-white/30">
            © {new Date().getFullYear()} GoGovCon. All rights reserved.
          </p>
        </div>
      </footer>
    </>
  );
};

export default ClosingSection;
