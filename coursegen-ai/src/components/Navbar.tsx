import Link from "next/link";
import { Session } from "next-auth";
import SignInButton from "./SignInButton";
import UserAccountNav from "./UserAccountNav";
import { ThemeToggle } from "./ThemeToggle";
import { getAuthSession } from "@/lib/auth";
import { isAppConfigured } from "@/lib/demo-mode";

/**
 * Resolves the session without ever letting a configuration problem take the
 * whole site down — the navbar is in the root layout, so an exception here
 * would break the landing page too.
 */
async function safeSession(): Promise<Session | null> {
  if (!isAppConfigured()) return null;

  try {
    return await getAuthSession();
  } catch (error) {
    console.error("Could not resolve the session:", error);
    return null;
  }
}

const Navbar = async () => {
  const appLive = isAppConfigured();
  const session = await safeSession();

  return (
    <nav className="fixed inset-x-0 top-0 bg-paper dark:bg-ink z-[10] h-fit border-b border-rule dark:border-white/10 py-4">
      <div className="flex items-center justify-between h-full gap-4 px-6 mx-auto max-w-7xl">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <p className="rounded-xl border-2 border-black px-2 py-1 text-sm sm:text-lg font-bold transition-all hover:translate-y-[2px] dark:border-white">
            CourseGenX-AI
          </p>
        </Link>

        <div className="flex items-center gap-4 sm:gap-5">
          <Link href="/courses" className="text-sm underline underline-offset-4">
            Courses
          </Link>

          {session?.user && (
            <>
              <Link href="/create" className="text-sm underline underline-offset-4">
                Create Course
              </Link>
              <Link href="/settings" className="text-sm underline underline-offset-4">
                Settings
              </Link>
            </>
          )}

          <ThemeToggle />

          {/* Sign-in is pointless without OAuth credentials, so hide it. */}
          {appLive &&
            (session?.user ? <UserAccountNav user={session.user} /> : <SignInButton />)}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
