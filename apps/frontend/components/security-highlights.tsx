const highlights = [
  {
    title: 'Score de risco em tempo real',
    description: 'Velocidade, fingerprint e monitoramento de chargebacks com suspensão automática.'
  },
  {
    title: 'Logs imutáveis',
    description: 'Cada ação crítica é registrada com trilha de auditoria pronta para exportação.'
  },
  {
    title: 'Controle administrativo absoluto',
    description: 'Admin Principal gerencia políticas, taxas, banimentos e configurações avançadas.'
  }
];

export function SecurityHighlights() {
  return (
    <section className="max-w-6xl mx-auto px-6 pb-16">
      <h2 className="text-3xl font-semibold text-white mb-10">Segurança e anti-fraude</h2>
      <div className="grid md:grid-cols-3 gap-6">
        {highlights.map((item) => (
          <div key={item.title} className="rounded-2xl border border-void-500/30 bg-black/30 p-6">
            <h3 className="text-xl font-semibold text-white">{item.title}</h3>
            <p className="mt-3 text-slate-300">{item.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
