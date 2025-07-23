import { AuthForm } from "@/components/auth-form"
import { signIn } from "@/actions/auth"

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-950">
      <div className="w-full max-w-md space-y-4">
        {/* Removidos os searchParams e o useEffect, AuthForm lida com isso */}
        <AuthForm type="sign-in" action={signIn} />
      </div>
    </div>
  )
}
