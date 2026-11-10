import Link from "next/link";
import credits from "@/lib/attribution.json";
import restaurantCredits from "@/lib/attribution-restaurants.json";

export const metadata = { title: "Photo credits · Ultimate Fast Food Lineup" };

type Credit = {
  restaurant: string;
  item: string;
  file: string;
  commonsTitle: string;
  page: string;
  license: string;
  author: string;
  generic?: boolean;
};

export default function CreditsPage() {
  const list = [
    ...(restaurantCredits as { restaurant: string; file: string; page: string; license: string; author: string }[]).map(
      (r) => ({ ...r, item: "Restaurant photo", commonsTitle: "" })
    ),
    ...(credits as Credit[]),
  ] as Credit[];
  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-10">
      <Link href="/" className="btn btn-primary w-fit border-4 border-neutral font-display">
        ← Back to the game
      </Link>
      <div className="diner-card p-6">
        <h1 className="font-display text-4xl">Photo credits</h1>
        <p className="mt-2 opacity-80">
          Food photos come from Wikimedia Commons and are used under their free licenses. Thanks to everyone who
          shared them. Items tagged &ldquo;similar photo&rdquo; use a photo of the same kind of food rather than the exact menu item.
        </p>
        <ul className="mt-5 flex flex-col divide-y-2 divide-dashed divide-neutral/30">
          {list.map((c) => (
            <li key={`${c.restaurant}-${c.file}`} className="py-3 text-sm">
              <div className="font-bold">
                {c.item} <span className="font-normal opacity-60">· {c.restaurant}</span>
                {c.generic && <span className="badge badge-sm badge-outline ml-2">similar photo</span>}
              </div>
              <div className="opacity-80">
                {c.author || "Unknown author"} ·{" "}
                <span className="badge badge-sm badge-secondary">{c.license}</span> ·{" "}
                <a className="link" href={c.page} target="_blank" rel="noreferrer">
                  source
                </a>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
