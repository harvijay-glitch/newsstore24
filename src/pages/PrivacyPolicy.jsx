const sections = [
  ["Information we collect", "We may collect information you provide when you contact us or create an account. The site may also store basic preferences, such as language, display settings and saved-news choices, so these features work for you."],
  ["How we use it", "We use this information to operate the website, respond to enquiries, protect the service and improve the reading experience. We do not sell personal information."],
  ["News providers and links", "Headlines and source links may be supplied through GNews. When you follow a source link, you leave NewsStore24 and that publisher's privacy policy applies."],
  ["Cookies and local storage", "Your browser may store small local preference files. You can clear or block them in your browser settings, although some saved preferences may no longer work."],
  ["Updates and contact", "We may update this policy when our service changes. For privacy questions or requests, contact us at contact@newsstore24.com."],
];

function PrivacyPolicy() {
  return <main className="mx-auto max-w-4xl px-6 py-14"><p className="text-sm font-bold uppercase tracking-wider text-red-600">Legal</p><h1 className="mt-3 text-4xl font-extrabold text-slate-950">Privacy Policy</h1><p className="mt-4 text-slate-600">Last updated: August 17, 2026</p><div className="mt-8 space-y-7 leading-7 text-slate-600">{sections.map(([title, text]) => <section key={title}><h2 className="text-xl font-bold text-slate-900">{title}</h2><p className="mt-2">{text}</p></section>)}</div></main>;
}
export default PrivacyPolicy;
