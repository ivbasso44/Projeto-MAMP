import { getUserSession } from "@/actions/auth"
import { UserProfile } from "@/components/user-profile"
import { redirect } from "next/navigation"

export default async function ProfilePage() {
  const session = await getUserSession()

  if (!session) {
    redirect("/auth/sign-in") // Redireciona para a página de login se não houver sessão
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-gray-100 dark:bg-gray-950 py-8">
      <UserProfile session={session} />
    </div>
  )
}
