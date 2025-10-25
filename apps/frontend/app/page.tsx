import Link from 'next/link';

import { NeonCard } from '../components/neon-card';
import { PlansSection } from '../components/plans-section';
import { SecurityHighlights } from '../components/security-highlights';

export default function HomePage() {
  return (
    <main className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-void-100/20 via-black to-black" />
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <span className="uppercase tracking-[0.3em] text-void-500">SkVoid</span>
            <h1 className="text-4xl md:text-6xl font-bold mt-4 text-white drop-shadow-[0_0_20px_rgba(37,99,235,0.4)]">
              Marketplace gamer de alto desempenho
            </h1>
            <p className="mt-6 text-lg text-slate-300 max-w-xl">
              Compre e venda contas e jogos com segurança, auditoria imutável e carteira integrada com Mercado Pago.
              Experiência gamer profissional com tema neon em LED.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/dashboard"
                className="bg-void-600 px-6 py-3 rounded-full text-white font-semibold shadow-neon transition hover:bg-void-500"
              >
                Acessar painel
              </Link>
              <Link href="#planos" className="px-6 py-3 rounded-full border border-void-500 text-void-300 hover:bg-void-500/20">
                Ver planos para vendedores
              </Link>
            </div>
          </div>
          <div className="grid gap-4">
            <NeonCard title="Wallet integrada" description="Controle saldos, saques e histórico em tempo real." icon="wallet" />
            <NeonCard title="Anti-fraude 24/7" description="Monitoramento com score de risco, captchas e auditoria." icon="shield" />
            <NeonCard title="Chat gamer" description="Converse com compradores antes da compra, com moderação avançada." icon="chat" />
          </div>
        </div>
      </section>
      <PlansSection />
      <SecurityHighlights />
    </main>
  );
}
