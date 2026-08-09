import { getAuthSession } from "./auth";
import { prisma } from "./db";

const DAY_IN_MS = 1000 * 60 * 60 * 24;

/** True when the signed-in user has an active (or one-day-lapsed) Pro subscription. */
export async function CheckSubscription(): Promise<boolean> {
  const session = await getAuthSession();
  if (!session?.user?.id) {
    return false;
  }

  const userSubscription = await prisma.userSubscription.findUnique({
    where: { userId: session.user.id },
  });

  if (!userSubscription?.stripePriceId || !userSubscription.stripeCurrentPeriodEnd) {
    return false;
  }

  // One day of grace so a slow renewal webhook doesn't lock a paying user out.
  return (
    userSubscription.stripeCurrentPeriodEnd.getTime() + DAY_IN_MS > Date.now()
  );
}
