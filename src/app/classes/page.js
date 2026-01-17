import { client } from "@/sanity/client";

export const revalidate = 60; // revalidate this page every 60 seconds

const query = `*[_type == "class"] | order(title asc){
  _id, title, level, durationMin, shortDescription
}`;

export default async function ClassesPage() {
  const classes = await client.fetch(query);

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="text-3xl font-bold text-primary">Classes</h1>

      <div className="mt-8 grid gap-6 md:grid-cols-3">
        {classes.map((c) => (
          <div key={c._id} className="rounded-2xl border bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <p className="font-semibold">{c.title}</p>
              {c.level ? (
                <span className="rounded-full bg-secondary px-3 py-1 text-xs text-primary">
                  {c.level}
                </span>
              ) : null}
            </div>

            <p className="mt-2 text-sm text-gray-600">{c.shortDescription}</p>

            {c.durationMin ? (
              <p className="mt-4 text-xs text-gray-500">{c.durationMin} minutes</p>
            ) : null}
          </div>
        ))}
      </div>
    </main>
  );
}
