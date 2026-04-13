import { auth } from "@/auth";
import { redirect } from "next/navigation";
import VaultPage from "./VaultPage";

export default async function Page() {
  const session = await auth();
  if (!session) redirect("/login?callbackUrl=/vault");

  return <VaultPage role={session.user.role} userId={session.user.id} />;
}