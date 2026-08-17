const sections = [
  ["Use of NewsStore24", "You may use NewsStore24 for personal news discovery and information. Do not misuse the site, interfere with its operation or attempt to access systems or data without permission."],
  ["Source content and attribution", "NewsStore24 displays headlines, source attribution and links to original reports. Copyright in the underlying reporting remains with the respective publishers and rights holders."],
  ["AI-assisted summaries", "Summaries, key points and contextual notes are generated to make stories easier to understand. They can be incomplete or contain errors, and they are not professional, financial, medical or legal advice. Always check the original source before relying on a story."],
  ["Availability and changes", "News feeds, sources, features and summaries may change, be delayed or become unavailable without notice. We do not guarantee that every item is complete, current or error-free."],
  ["Third-party sites", "Links to original articles and other services are provided for convenience. NewsStore24 is not responsible for third-party content, availability or practices."],
  ["Contact", "For a correction request, source concern or question about these terms, email contact@newsstore24.com."],
];

function Terms() {
  return <main className="mx-auto max-w-4xl px-6 py-14"><p className="text-sm font-bold uppercase tracking-wider text-red-600">Legal</p><h1 className="mt-3 text-4xl font-extrabold text-slate-950">Terms of Use</h1><p className="mt-4 text-slate-600">Last updated: August 17, 2026</p><div className="mt-8 space-y-7 leading-7 text-slate-600">{sections.map(([title, text]) => <section key={title}><h2 className="text-xl font-bold text-slate-900">{title}</h2><p className="mt-2">{text}</p></section>)}</div></main>;
}
export default Terms;
