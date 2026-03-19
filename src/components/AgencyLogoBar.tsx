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
    <section className="bg-primary py-10 border-y border-white/5 overflow-hidden">
      <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-white/40 mb-8 font-body">
        Contracts Executed With Top Federal Agencies Including
      </p>
      <div className="relative">
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-primary to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-primary to-transparent z-10" />

        <div className="flex animate-scroll">
          {[...agencies, ...agencies].map((agency, i) => (
            <div
              key={i}
              className="flex-shrink-0 mx-10 flex items-center gap-4 opacity-60 hover:opacity-100 transition-opacity duration-300"
            >
              <img
                src={agency.seal}
                alt={`${agency.name} seal`}
                className="w-12 h-12 object-contain"
              />
              <span className="text-sm font-medium whitespace-nowrap text-white/80 font-body">
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
