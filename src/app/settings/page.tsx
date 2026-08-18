import { redirect } from "next/navigation";
import SubsCriptionButton from "@/components/SubsCriptionButton";
import { getAuthSession } from "@/lib/auth";
import { CheckSubscription } from "@/lib/subscription";
import { isStripeConfigured } from "@/lib/env";
import { FREE_CREDITS } from "@/lib/constants";
import { isAppConfigured } from "@/lib/demo-mode";
import DemoModeNotice from "@/components/DemoModeNotice";

export const dynamic = "force-dynamic";

const SettingsPage = async () => {
  if (!isAppConfigured()) {
    return <DemoModeNotice feature="Account settings" />;
  }

  const session = await getAuthSession();
  if (!session?.user) {
    return redirect("/courses");
  }

  const isPro = await CheckSubscription();
  const stripeEnabled = isStripeConfigured();

  return (
    <div className="px-4 py-10 mx-auto max-w-7xl">
      <h1 className="text-3xl font-bold">Settings</h1>

      {isPro ? (
        <p className="mt-2 text-xl text-secondary-foreground/60">
          You are a Pro user — unlimited course generations.
        </p>
      ) : (
        <p className="mt-2 text-xl text-secondary-foreground/60">
          You are on the free plan. You have {session.user.credits} of{" "}
          {FREE_CREDITS} free generations left.
        </p>
      )}

      {stripeEnabled ? (
        <SubsCriptionButton isPro={isPro} />
      ) : (
        <p className="mt-4 text-sm text-secondary-foreground/60">
          Subscriptions are not enabled on this deployment.
        </p>
      )}
    </div>
  );
};

export default SettingsPage;
