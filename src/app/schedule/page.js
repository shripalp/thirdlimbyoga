import { client } from "@/sanity/client";

const query = `*[_type == "scheduleItem"] | order(day asc, time asc){
  _id, title, day, time, isOnline, location, notes
}`;

const dayOrder = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function groupByDay(items) {
  const map = new Map();
  for (const d of dayOrder) map.set(d, []);
  for (const item of items) {
    if (!map.has(item.day)) map.set(item.day, []);
    map.get(item.day).push(item);
  }
  return map;
}

export default async function SchedulePage() {
  const items = await client.fetch(query);
  const grouped = groupByDay(items);

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="text-3xl font-bold text-primary">Schedule</h1>
      <p className="mt-3 text-gray-600">
        Weekly classes. Online via Teams + in-person options.
      </p>

      <div className="mt-10 grid gap-6 md:grid-cols-2">
        {dayOrder.map((day) => {
          const list = grouped.get(day) || [];
          return (
            <section key={day} className="rounded-2xl border bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-gray-900">{day}</h2>

              {list.length === 0 ? (
                <p className="mt-3 text-sm text-gray-500">No classes</p>
              ) : (
                <ul className="mt-4 space-y-4">
                  {list.map((s) => (
                    <li key={s._id} className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-medium text-gray-900">{s.title}</p>
                        <p className="mt-1 text-sm text-gray-600">
                          {s.isOnline ? "Online (Teams)" : "In-person"}
                          {!s.isOnline && s.location ? ` • ${s.location}` : ""}
                        </p>
                        {s.notes ? <p className="mt-1 text-xs text-gray-500">{s.notes}</p> : null}
                      </div>
                      <span className="shrink-0 rounded-full bg-secondary px-3 py-1 text-xs text-primary">
                        {s.time}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          );
        })}
      </div>
    </main>
  );
}

