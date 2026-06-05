export function dashboardPathForRole(role) {
  const dashboards = {
    superadmin: "/super-admin/dashboard",
    admin: "/admin/dashboard",
    employer: "/employer/dashboard",
    student: "/student/dashboard"
  };

  return dashboards[role] || "/login";
}
