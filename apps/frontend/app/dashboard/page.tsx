import Link from 'next/link';

import { NeonCard } from '../../components/neon-card';

const cards: Array<{
  title: string;
  description: string;
  icon: 'wallet' | 'lightning' | 'chat';
}> = [
  {
    title: 'Saldo da carteira',
    description: 'Gerencie top-ups via Mercado Pago, transações e saques com monitoramento em tempo real.',
    icon: 'wallet'
  },
  {
    title: 'Estatísticas avançadas',
    description: 'Visualize conversões, destaque por planos e histórico completo de vendas.',
    icon: 'lightning'
  },
  {
    title: 'Tickets & disputas',
    description: 'Centralize atendimentos com SLA configurável, prioridade e notas privadas.',
    icon: 'chat'
  }
];

export default function DashboardPage() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-14">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold text-white">Painel SkVoid</h1>
          <p className="mt-2 text-slate-300">Visão centralizada de anúncios, ordens, carteira e segurança antifraude.</p>
        </div>
        <Link href="/" className="px-5 py-2 rounded-full border border-void-500 text-void-300 hover:bg-void-500/20">
          Voltar para home
        </Link>
      </div>
      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {cards.map((card) => (
          <NeonCard key={card.title} title={card.title} description={card.description} icon={card.icon} />
        ))}
      </div>
      <section className="mt-12 rounded-2xl border border-void-500/30 bg-black/40 p-6">
        <h2 className="text-2xl font-semibold text-white">Próximas integrações</h2>
        <ul className="mt-4 space-y-2 text-slate-300 text-sm">
          <li>• Configuração granular de antifraude com thresholds personalizados.</li>
          <li>• Workflow visual de disputas com automação e histórico completo.</li>
          <li>• Relatórios exportáveis e integração com ferramentas externas via webhooks.</li>
        </ul>
      </section>
    </div>
  );
}
