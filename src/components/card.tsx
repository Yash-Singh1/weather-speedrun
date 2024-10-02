"use client";

import { useIsMobile } from "@/lib/hooks/isMobile";
import clsx from "clsx";
import {
  motion,
  type MotionStyle,
  type MotionValue,
  useMotionTemplate,
  useMotionValue,
} from "framer-motion";
import { useEffect, useState } from "react";

type WrapperStyle = MotionStyle & {
  "--x": MotionValue<string>;
  "--y": MotionValue<string>;
};

// This card component is pulled from the Typehero website

interface CardProps {
  title: string;
  description: string;
  bgClass?: string;
}

export function Card({
  title,
  description,
  bgClass,
  className,
  children,
  header,
}: CardProps & {
  children: React.ReactNode;
  header?: React.ReactNode;
  className?: string;
}) {
  const [mounted, setMounted] = useState(false);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const isMobile = useIsMobile();

  function handleMouseMove({ currentTarget, clientX, clientY }: MouseEvent) {
    if (isMobile || !currentTarget) return;
    // @ts-expect-error weird typescript / react mouseevent clashing interfaces since pulled in from diff codebase
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <motion.div
      className={clsx(`animated-feature-cards relative w-full drop-shadow-[0_0_15px_rgba(49,49,49,0.2)] dark:drop-shadow-[0_0_15px_rgba(49,49,49,0.2)]`, className)}
      // @ts-expect-error weird typescript / react mouseevent clashing interfaces
      onMouseMove={handleMouseMove}
      style={
        {
          "--x": useMotionTemplate`${mouseX}px`,
          "--y": useMotionTemplate`${mouseY}px`,
        } as WrapperStyle
      }
    >
      <div
        className={clsx(
          "group relative w-full overflow-hidden rounded-3xl border bg-gradient-to-b from-neutral-50/90 to-neutral-100/90 transition duration-300 dark:from-neutral-950/90 dark:to-neutral-800/90 h-full",
          "md:hover:border-transparent",
          bgClass
        )}
      >
        {header || null}
        <div className="m-6 min-h-[130px] w-full sm:m-6 sm:mt-0 mt-0 md:min-h-[250px]">
          <div className="flex w-5/6 flex-col gap-3 sm:w-4/6 md:w-4/5 xl:w-4/6">
            <h2 className="text-xl font-bold tracking-tight md:text-xl">
              {title}
            </h2>
            <p className="text-sm leading-5 text-zinc-600 sm:text-base sm:leading-7 dark:text-zinc-400">
              {description}
            </p>
          </div>
          {mounted ? children : null}
        </div>
      </div>
    </motion.div>
  );
}
