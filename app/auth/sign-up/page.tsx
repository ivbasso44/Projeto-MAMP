import { AuthForm } from "@/components/auth-form"
import { signUp } from "@/actions/auth"

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-950">
      {/* Removidos os searchParams e o useEffect, AuthForm lida com isso */}
      <AuthForm type="sign-up" action={signUp} />
    </div>
  )
}
