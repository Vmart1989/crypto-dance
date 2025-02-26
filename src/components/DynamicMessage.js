"use client";

import { useUser } from "../context/UserContext";
import { usePathname } from "next/navigation";

export default function DynamicMessage() {
  const { user } = useUser();
  const pathname = usePathname();

  if (pathname === "/dashboard" && user) {
    return <h3>Welcome {user.name ? user.name : user.email}!</h3>;
  }
  return <h3>Dive into the Crypto World without risks!</h3>;
}
