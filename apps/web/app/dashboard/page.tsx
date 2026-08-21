import { DashboardPage } from "../../src/App";
import { pageMetadata } from "../_metadata";

export const metadata = pageMetadata({
  title: "Dashboard",
  description: "Manage Outcomes, Products, Skills, sources, and account settings.",
  path: "/dashboard",
  noIndex: true,
});

export default function DashboardRoute() {
  return <DashboardPage />;
}
