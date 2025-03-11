"use client";

import { useUser } from "@/context/UserContext";
import { useRouter } from "next/navigation";

export default function UserHeader() {
  const { user, setUser } = useUser();
  const router = useRouter();

  const handleLogout = async () => {
    // Call logout endpoint and clear user context
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    router.push("/");
  };

  // Only render something if the user is logged in.
  if (!user) return null;

  return (
    <div className="d-flex align-items-baseline ">
      <i className="bi bi-person-fill ms-3 fs-5 "></i>
      <span className="fs-6 me-4">{user.name || user.email}</span>
      <a
        onClick={handleLogout}
        style={{ cursor: "pointer" }}
        className="fs-6 link-offset-2 link-offset-3-hover link-underline-primary link-underline-opacity-0 link-underline-opacity-75-hover me-4"
      >
        <i className="bi bi-box-arrow-right fs-5 me-2"></i>
        Log out
      </a>
      <a
        
        style={{ cursor: "pointer" }}
        className="fs-6 link-offset-2 me-4 link-offset-3-hover link-underline-primary link-underline-opacity-0 link-underline-opacity-75-hover"
      >
        <i className="bi bi-chat-dots fs-5 me-2"></i>
        AI bot
      </a>
    </div>
  );
}
