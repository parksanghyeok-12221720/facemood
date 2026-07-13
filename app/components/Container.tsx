import { ReactNode } from "react";

export default function Container({
  children,
  className = "",
  maxWidth = "max-w-md",
  id,
}: {
  children: ReactNode;
  className?: string;
  maxWidth?: string;
  id?: string;
}) {
  return (
    <div id={id} className={`mx-auto w-full ${maxWidth} px-6 ${className}`}>
      {children}
    </div>
  );
}
