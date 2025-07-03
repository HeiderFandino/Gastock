import React, { useEffect } from 'react';
import AdminDashboardBB from "../../components/AdminDashboardBB";

export const AdminDashboard = () => {
  useEffect(() => {
    const el = document.getElementsByClassName("custom-sidebar")[0];
    if (el) el.scrollTo(0, 0);
  }, []);

  return <AdminDashboardBB />;
};
