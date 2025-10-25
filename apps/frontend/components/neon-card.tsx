import { BoltIcon, ChatBubbleBottomCenterIcon, ShieldCheckIcon, WalletIcon } from '@heroicons/react/24/outline';

const icons = {
  wallet: WalletIcon,
  shield: ShieldCheckIcon,
  chat: ChatBubbleBottomCenterIcon,
  lightning: BoltIcon
};

export function NeonCard({ title, description, icon = 'lightning' }: { title: string; description: string; icon?: keyof typeof icons }) {
  const Icon = icons[icon];
  return (
    <div className="rounded-2xl bg-black/40 border border-void-500/40 px-6 py-5 shadow-neon backdrop-blur">
      <div className="flex items-center gap-3">
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-void-500/20">
          <Icon className="h-6 w-6 text-void-500" />
        </span>
        <h3 className="text-xl font-semibold text-white">{title}</h3>
      </div>
      <p className="mt-3 text-slate-300">{description}</p>
    </div>
  );
}
