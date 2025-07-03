import React, { useEffect } from "react";
import { AdminSettingsComponent } from "../../components/AdminSettingsComponent";

export const AdminSettings = () => {
  useEffect(() => {
    const el = document.getElementsByClassName("custom-sidebar")[0];
    if (el) el.scrollTo(0, 0);
  }, []);
  return (

    <AdminSettingsComponent />

  );
};
