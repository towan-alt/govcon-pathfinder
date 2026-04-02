import sealDod from "@/assets/seals/dod.png";
import sealUsmc from "@/assets/seals/usmc.png";
import sealArmy from "@/assets/seals/army.png";
import sealVa from "@/assets/seals/va.png";
import sealCommerce from "@/assets/seals/commerce.png";
import sealSba from "@/assets/seals/sba.png";
import sealDhs from "@/assets/seals/dhs.png";
import sealGsa from "@/assets/seals/gsa.png";
import sealHhs from "@/assets/seals/hhs.png";
import sealDoe from "@/assets/seals/doe.png";

const agencies = [
  { name: "Dept. of Defense", seal: sealDod },
  { name: "U.S. Marine Corps", seal: sealUsmc },
  { name: "U.S. Army", seal: sealArmy },
  { name: "Dept. of Veterans Affairs", seal: sealVa },
  { name: "Dept. of Commerce", seal: sealCommerce },
  { name: "Small Business Administration", seal: sealSba },
  { name: "Dept. of Homeland Security", seal: sealDhs },
  { name: "General Services Administration", seal: sealGsa },
  { name: "Dept. of Health & Human Services", seal: sealHhs },
  { name: "Dept. of Energy", seal: sealDoe },
];

const AgencyLogoBar = () => {
  return (
    <section className="py-8 border-y overflow-hidden" style={{ background: "hsl(0 0% 4%)", borderColor: "hsl(0 0% 100% / 0.05)" }}>
      <p className="text-center text-[10px] font-semibold uppercase tracking-[0.2em] text-white/30 mb-6 font-body">
        Contracts Executed With Top Federal Agencies Including
      </p>
      <div className="relative">
        <div className="absolute left-0 top-0 bottom-0 w-24 z-10" style={{ background: "linear-gradient(to right, hsl(0 0% 4%), transparent)" }} />
        <div className="absolute right-0 top-0 bottom-0 w-24 z-10" style={{ background: "linear-gradient(to left, hsl(0 0% 4%), transparent)" }} />

        <div className="flex animate-scroll">
          {[...agencies, ...agencies].map((agency, i) => (
            <div
              key={i}
              className="flex-shrink-0 mx-8 flex items-center gap-3 opacity-50 hover:opacity-90 transition-opacity duration-300"
            >
              <img
                src={agency.seal}
                alt={`${agency.name} seal`}
                className="w-10 h-10 object-contain"
              />
              <span className="text-xs font-medium whitespace-nowrap text-white/70 font-body">
                {agency.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AgencyLogoBar;
