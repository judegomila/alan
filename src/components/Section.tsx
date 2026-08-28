export function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-12">
      <h2 className="mb-4 text-lg font-bold text-zinc-100">{title}</h2>
      {children}
    </section>
  );
}
