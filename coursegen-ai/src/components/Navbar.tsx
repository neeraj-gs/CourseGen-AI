import Link from "next/link";
import { Session } from "next-auth";
import SignInButton from "./SignInButton";
import UserAccountNav from "./UserAccountNav";
import NavChrome from "./NavChrome";
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

const LINK =
  "text-sm underline decoration-1 underline-offset-4 opacity-75 transition-opacity hover:opacity-100";

const Navbar = async () => {
  const appLive = isAppConfigured();
  const session = await safeSession();

  return (
    // NavChrome picks the frame from the route; the links below are identical
    // everywhere, so nothing about the app's navigation depends on the theme
    // the landing page happens to be wearing.
    <NavChrome>
      <Link href="/" className="flex shrink-0 items-center gap-2">
        <span className="border border-graphite px-2.5 py-1.5 font-data text-[11px] font-medium uppercase tracking-[0.16em] transition-transform hover:translate-y-px dark:border-white">
          CourseGenX-AI
        </span>
      </Link>

      <div className="flex items-center gap-4 sm:gap-5">
        <Link href="/courses" className={LINK}>
          Courses
        </Link>

        {session?.user && (
          <>
            <Link href="/create" className={LINK}>
              Create Course
            </Link>
            <Link href="/settings" className={LINK}>
              Settings
            </Link>
          </>
        )}

        <ThemeToggle />

        {/* Sign-in is pointless without OAuth credentials, so hide it. */}
        {appLive &&
          (session?.user ? (
            <UserAccountNav user={session.user} />
          ) : (
            <SignInButton />
          ))}
      </div>
    </NavChrome>
  );
};

export default Navbar;
