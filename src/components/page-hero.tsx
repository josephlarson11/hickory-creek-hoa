export function PageHero({
  eyebrow,
  title,
  children
}: {
  eyebrow?: string;
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <section className="bg-white">
      <div className="section py-14">
        {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
        <h1 className="mt-3 max-w-4xl font-serif text-4xl font-bold leading-tight text-burgundy sm:text-5xl">
          {title}
        </h1>
        {children ? <div className="mt-5 max-w-3xl text-lg leading-8">{children}</div> : null}
      </div>
    </section>
  );
}
