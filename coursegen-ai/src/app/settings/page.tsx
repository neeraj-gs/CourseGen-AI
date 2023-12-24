import SubsCriptionButton from "@/components/SubsCriptionButton";
import { CheckSubscription } from "@/lib/subscription"

type Props = {}

const SettingsPage = async(props: Props) => {
    const isPro = await CheckSubscription();
  return (
    <div className="py-10 mx-auto max-w-7xl">
        <h1 className="text-3xl font-bold">Settings</h1>
        {isPro ? (
            <p className="text-xl text-secondary-foreground/60">You are a Pro User</p>
        ):(
            <p className="text-xl text-secondary-foreground/60">You are a Free User, SubsCripe to Be Pro User</p>
        )}

        <SubsCriptionButton isPro={isPro} />
    </div>
  )
}

export default SettingsPage