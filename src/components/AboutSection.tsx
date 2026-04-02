import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import towanHero from "@/assets/towan-hero.jpg";

const stats = [
  { value: "74", label: "Contracts Executed" },
  { value: "5,893+", label: "Tasks Completed" },
  { value: "6,500+", label: "Businesses Coached" },
  { value: "5", label: "Continents" },
];

const AboutSection = () => {
  return (
    <section id="about" className="bg-background py-20 lg:py-24">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto space-y-14">

          {/* Header */}
          <div className="text-center space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              About Towan Isom
            </p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground leading-[1.15] max-w-3xl mx-auto">
              There's a difference between someone who{" "}
              <span className="text-primary italic">teaches</span> GovCon and someone who{" "}
              <span className="text-primary italic">does</span> it.
            </h2>
          </div>

          {/* Stats bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((s) => (
              <div key={s.label} className="text-center bg-card border border-border rounded-xl py-5 px-3">
                <p className="text-2xl md:text-3xl font-bold text-primary">{s.value}</p>
                <p className="text-xs text-muted-foreground mt-1 uppercase tracking-wide">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Two-column body */}
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-start">

            {/* Left column */}
            <div className="space-y-5">
              <p className="text-base text-muted-foreground leading-relaxed">
                Most GovCon consultants are selling you a course. Towan is selling you access to a
                track record that almost no one in this industry can match.
              </p>
              <p className="text-base text-muted-foreground leading-relaxed">
                She has executed <strong className="text-foreground">74 contracts</strong>. Not proposals. Not bids.{" "}
                <em>Executed contracts</em> — with the U.S. Marine Corps, Army, VA, Department of Commerce,
                and more. She has personally completed over{" "}
                <strong className="text-foreground">5,893 tasks</strong> across those engagements, led teams
                averaging 60+ people, and generated eight figures in revenue doing exactly what she's
                teaching you to do.
              </p>
              <p className="text-base text-foreground font-medium leading-relaxed">
                That's not a credential. That's a career.
              </p>
              <p className="text-base text-muted-foreground leading-relaxed">
                She has stood up government contracting programs for small businesses from the ground
                up — not as a thought experiment, but as operational infrastructure that produced real
                winners. She has trained more than{" "}
                <strong className="text-foreground">1,000 small businesses</strong> on how to start,
                compete, and thrive in the federal marketplace. She coached 6,500+ through SBA and
                national programs. The breadth is unmatched.
              </p>
            </div>

            {/* Right column */}
            <div className="space-y-5">
              <p className="text-base text-muted-foreground leading-relaxed">
                Her operational experience extends to the global stage. She led international
                engagements with <strong className="text-foreground">Fleishman Hillard</strong>, one
                of the most respected PR firms in the world — which means she knows how government
                interfaces with large-scale, high-stakes institutional operations, not just small
                contract vehicles.
              </p>
              <p className="text-base text-muted-foreground leading-relaxed">
                And critically:{" "}
                <strong className="text-foreground">she is still in the game</strong>. She runs an
                active government contracting business today. She is not relying on what worked in
                2005. She knows how AI is reshaping bid preparation for federal and state contracts —
                and she's using it. That currency matters in a market that evolves constantly.
              </p>
              <p className="text-base text-muted-foreground leading-relaxed">
                She is a nationally recognized speaker. She is in the{" "}
                <strong className="text-foreground">top 3% of women-owned businesses</strong> to
                cross $25M in revenue. She has built a firm that now operates across five continents.
              </p>
              <p className="text-base text-muted-foreground leading-relaxed">
                The hard truth about this industry is this: anyone can call themselves a GovCon
                consultant. Very few have won 74 contracts. Very few have led a $10M+ operation.
                Very few have built the programs, written the proposals, managed the teams, and
                delivered the results at scale — then turned around and taught others to do the same.
              </p>
            </div>
          </div>

          {/* Closing quote + CTA */}
          <div className="bg-card border border-primary/20 rounded-2xl p-8 md:p-10 text-center space-y-5">
            <p className="text-lg md:text-xl font-bold text-foreground leading-relaxed max-w-3xl mx-auto">
              "Towan Isom has done all of it. That's not a pitch.{" "}
              <span className="text-primary">That's a record.</span>"
            </p>
            <Link
              to="/book"
              className="btn-gold inline-flex items-center gap-2 px-8 py-4 rounded-lg text-base font-semibold transition-colors"
            >
              Book a Consultation
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

        </div>
      </div>
    </section>
  );
};

export default AboutSection;
