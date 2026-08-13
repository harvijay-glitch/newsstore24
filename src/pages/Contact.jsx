function Contact() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-14">
      <p className="text-sm font-bold uppercase tracking-wider text-red-600">Contact & corrections</p>
      <h1 className="mt-3 text-4xl font-black">Contact NewsStore24</h1>
      <div className="mt-8 space-y-5 text-lg leading-8 text-slate-600">
        <p>For corrections, source concerns, editorial feedback, or partnership enquiries, contact the NewsStore24 editorial team.</p>
        <p><a className="font-bold text-blue-600 hover:underline" href="mailto:editor@ainews.local">editor@ainews.local</a></p>
        <p>We review correction requests against the linked original source and update stories when verified information changes.</p>
      </div>
    </main>
  );
}

export default Contact;
