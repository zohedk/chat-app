"use client";
import { useRouter } from "next/navigation";
import React from "react";
interface LinkButtonProp {
  title: string;
  iconBefore?: React.ReactNode;
  iconAfter?: React.ReactNode;
  href?: string;
  className?: string;
}

export const LinkButton: React.FC<LinkButtonProp> = (prop) => {
  const navigation = useRouter();
  return (
    <div>
      <button
        onClick={() => {
          prop.href && navigation.push(prop?.href as string);
        }}
        className={prop.className}
      >
        {prop.iconBefore}
        {prop.title}
        {prop.iconAfter}
      </button>
    </div>
  );
};
