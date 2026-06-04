import { ASSETS } from "@/lib/constants/assets";

const SideImage = () => {
  return (
    <div className="relative">
      <div className="absolute -inset-6 -z-10 rounded-[2.5rem] bg-linear-to-br from-primary/10 via-accent/10 to-transparent blur-2xl" />
      <div className="max-w-[590px] overflow-hidden rounded-4xl border border-accent/10 shadow-2xl">
        <img
          className="h-full w-full object-cover select-none pointer-events-none"
          loading="eager"
          src={ASSETS.TCB_4}
          alt="cozybud signup image"
        />
      </div>
    </div>
  );
};

export default SideImage;
