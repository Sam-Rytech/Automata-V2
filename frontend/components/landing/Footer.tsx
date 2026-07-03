export function Footer() {
  const footerLinks = [
    {
      title: 'Model',
      links: [
        { label: 'Gemini 2.5 Flash', href: 'https://aistudio.google.com/api-keys' },
        { label: 'Documentation', href: 'https://github.com/Sam-Rytech/Automata-V2/blob/main/README.md' },
        { label: 'Architecture', href: 'https://github.com/Sam-Rytech/Automata-V2/blob/main/AutomataArchitecture_v2.docx' },
      ],
    },
    {
      title: 'Build',
      links: [
        { label: 'Github', href: 'https://github.com/Sam-Rytech/Automata-V2' },
        { label: 'Postman / API', href: '#' },
        { label: 'Discord', href: '#' },
      ],
    },
    {
      title: 'Legal',
      links: [
        { label: 'Cipher Grids', href: '#' },
        { label: 'Terms', href: '#' },
      ],
    },
  ];

  const renderFooterLinks = (links) => (
    <div className="flex flex-col gap-4">
      <div className="text-white/60 mb-2">{links.title}</div>
      {links.links.map((link) => (
        <a
          key={link.label}
          href={link.href}
          className="text-white/40 hover:text-white transition-colors"
        >
          {link.label}
        </a>
      ))}
    </div>
  );

  return (
    <footer className="border-t border-white/5 bg-[#0F0F1A] py-12 px-8">
      <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        <div>
          <div className="font-syne text-2xl font-bold text-white tracking-widest mb-2">
            AUTOMATA
          </div>
          <div className="font-mono text-xs text-success flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-success"></div>
            V1.0 · VELOCITY LABS
          </div>
        </div>

        <div className="flex gap-16 font-mono text-xs uppercase tracking-widest">
          {footerLinks.map((links) => renderFooterLinks(links))}
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto mt-16 flex justify-between items-center font-mono text-[10px] text-white/30 tracking-widest uppercase">
        <div> 2026 AUTOMATA. ALL RIGHTS RESERVED.</div>
        <div className="flex gap-4">
          <span>SYSTEM: ONLINE</span>
          <span>LATENCY: 42MS</span>
          <span>LAST OUT: NULL</span>
        </div>
      </div>
    </footer>
  );
}
