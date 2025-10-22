import React from "react";
import { Button } from "@/lib/ui/__shadcn__/button";

const Hero: React.FC = () => {
  return (
    <section
      className="w-full flex items-center justify-center pt-[90px] pb-10"
      aria-label="Hero"
    >
      <div className="container mx-auto max-w-[1100px] grid lg:grid-cols-2 gap-8 items-center">
        {/* Left: text */}
        <div className="order-2 lg:order-1 flex flex-col gap-6">
          <h1
            className="text-30-bold"
            style={{ color: "var(--color-primary)" }}
          >
            BLOSSOMING ELEGANCE
          </h1>
          <p
            className="text-16-medium max-w-[520px]"
            style={{ color: "var(--color-muted-foreground)" }}
          >
            Fresh, handcrafted arrangements designed to elevate everyday
            moments. Carefully selected blooms, delicate touches and sustainable
            packaging.
          </p>

          <div className="flex items-center gap-3">
            <Button variant="default" size="lg">
              Shop Collections
            </Button>
            <Button variant="minimal" size="auto" className="text-[14px]">
              Learn more
            </Button>
          </div>
        </div>

        {/* Right: decorative plate / hero image */}
        <div className="order-1 lg:order-2 flex justify-center">
          <div
            className="relative w-[330px] h-[330px] rounded-[50%] shadow-xl flex items-center justify-center"
            style={{
              background:
                "radial-gradient(circle at 30% 20%, rgba(255,255,255,0.6), transparent 20%), var(--color-card)",
              border: "8px solid rgba(0,0,0,0.03)",
            }}
          >
            {/* tag over the plate */}
            <div className="absolute -top-6 -left-6 rotate-[-12deg] p-3 bg-[var(--color-primary)] text-[var(--color-primary-foreground)] rounded-md shadow-md font-bold">
              The Cozy Bud
            </div>

            {/* bowl / vase placeholder */}
            <div
              className="w-[220px] h-[220px] rounded-[46%] flex items-center justify-center"
              style={{
                background:
                  "linear-gradient(180deg, rgba(240,224,217,1) 0%, rgba(255,255,255,0.6) 100%)",
                boxShadow: "inset 0 6px 20px rgba(0,0,0,0.06)",
              }}
            >
              {/* a minimal floral svg placeholder */}
              <svg
                width="120"
                height="120"
                viewBox="0 0 120 120"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden
              >
                <circle
                  cx="60"
                  cy="60"
                  r="36"
                  fill="var(--color-primary)"
                  opacity="0.08"
                />
                <g transform="translate(30,30)" fill="var(--color-secondary)">
                  <path d="M15 0 C20 10, 5 16, 10 28 C15 40, 30 36, 32 28 C35 18, 22 10, 15 0 Z" />
                </g>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
