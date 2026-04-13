import { useState } from "react";
import { SuperAdminLogin } from "../pages/SuperAdminLogin";
import { SystemAdmin } from "../pages/SystemAdmin";

export function ProtectedSystemAdmin() {
  const [authed, setAuthed] = useState(
    () => sessionStorage.getItem("superAdminAuth") === "true"
  );

  if (!authed) {
    return <SuperAdminLogin onSuccess={() => setAuthed(true)} />;
  }

  return <SystemAdmin />;
}
