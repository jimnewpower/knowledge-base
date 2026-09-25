import type { ComponentProps } from "react";
import { locationHref } from "../lib/navigation";
import type { LocationState, Navigate } from "../lib/navigation";

export default function NavigationLink({ to, navigate, children, ...props }: Omit<ComponentProps<"a">, "href" | "onClick"> & {
  to: LocationState;
  navigate: Navigate;
}) {
  return <a {...props} href={locationHref(to)} onClick={(event) => {
    if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    navigate(to);
  }}>{children}</a>;
}
