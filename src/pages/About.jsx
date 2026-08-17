const points = [
  ["Fresh stories", "We organise current headlines across India, world, business, technology, sports, crypto and markets."],
  ["AI-assisted summaries", "Each available summary is written to surface the main facts, key points and why the story matters in a quick, readable format."],
  ["Original source first", "Every story keeps its source attribution and a link to the original publisher, so readers can check the full report and context."],
];

function About() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-14">
      <p className="text-sm font-bold uppercase tracking-wider text-red-600">About NewsStore24</p>
      <h1 className="mt-3 text-4xl font-extrabold text-slate-950">News updates, with the context that matters.</h1>
      <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-600">NewsStore24 is a news discovery platform. We collect current headlines from GNews and present them with clear source attribution, category-wise browsing and AI-assisted summaries.</p>
      <div className="mt-10 grid gap-5 sm:grid-cols-3">{points.map(([title, text]) => <section key={title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><h2 className="font-bold text-slate-950">{title}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{text}</p></section>)}</div>
      <div className="mt-10 space-y-5 text-lg leading-8 text-slate-600"><p>Our goal is to help you catch up on the day&apos;s news without losing the connection to the original reporting. AI summaries are created for convenience; they are not a replacement for the complete source article.</p><p>News can develop quickly. For important decisions, please review the linked original report and other reliable sources.</p></div>
    </main>
  );
}
export default About;
