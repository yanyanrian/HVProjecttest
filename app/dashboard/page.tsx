import { redirect } from "next/navigation"

// The Overview dashboard is rendered at the root path.
// This route keeps the `/dashboard` URL from the spec working.
export default function DashboardRedirect() {
  redirect("/")
}
