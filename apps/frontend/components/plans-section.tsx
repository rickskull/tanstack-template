const plans = [
  {
    name: 'Starter',
    price: 'R$15/mês',
    listings: 'Até 25 anúncios',
    commission: '15%',
    perks: ['Dashboard e estatísticas básicas', 'Chat opcional', 'Até 5 imagens por anúncio']
  },
  {
    name: 'Pro',
    price: 'R$30/mês',
    listings: 'Até 15 anúncios',
    commission: '12%',
    perks: ['Estatísticas avançadas', 'Destaque nos filtros', 'Badge “Pro Seller”', 'Prioridade em tickets']
  },
  {
    name: 'Premium',
    price: 'R$60/mês',
    listings: 'Até 30 anúncios',
    commission: '10%',
    perks: ['Destaque na home', 'Badge “Premium”', 'Insights e analytics completos', 'Saques rápidos']
  },
  {
    name: 'Elite',
    price: 'R$120/mês',
    listings: 'Anúncios ilimitados',
    commission: '7%',
    perks: ['Destaque máximo', 'Acesso antecipado a features', 'Selo “Elite Seller”', 'Suporte VIP 24/7', 'Saques instantâneos']
  }
];

export function PlansSection() {
  return (
    <section id="planos" className="bg-black/70 border-t border-void-500/20">
      <div className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-semibold text-white mb-10">Planos para vendedores</h2>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {plans.map((plan) => (
            <div key={plan.name} className="rounded-2xl border border-void-500/40 bg-black/40 p-6 shadow-neon">
              <h3 className="text-2xl font-bold text-void-500">{plan.name}</h3>
              <p className="mt-2 text-slate-300">{plan.price}</p>
              <p className="mt-1 text-sm text-slate-400">{plan.listings}</p>
              <p className="mt-3 text-sm text-slate-300">Comissão: {plan.commission}</p>
              <ul className="mt-4 space-y-2 text-sm text-slate-200">
                {plan.perks.map((perk) => (
                  <li key={perk} className="flex items-start gap-2">
                    <span className="mt-1 h-2 w-2 rounded-full bg-void-500" />
                    <span>{perk}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
