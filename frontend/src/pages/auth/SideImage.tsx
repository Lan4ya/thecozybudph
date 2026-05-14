import sign_up_pic from "@/assets/thecozybud/TCB_4.png";

const SideImage = () => {
  return (
    <div className="relative">
      <div className="absolute -inset-6 -z-10 rounded-[2.5rem] bg-linear-to-br from-primary/10 via-accent/10 to-transparent blur-2xl" />
      <div className="aspect-[3/3.8] max-w-[560px] overflow-hidden rounded-4xl border border-accent/10 shadow-2xl">
        <img
          className="h-full w-full object-cover select-none pointer-events-none"
          loading="eager"
          src={sign_up_pic}
          alt="cozybud signup image"
        />
      </div>
    </div>
  );
};

export default SideImage;
