"use client";

import { motion } from "framer-motion";
import { ChevronLeft, Clock, Flame, Search, SearchX } from "lucide-react";
import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { EmptyState, PageBody } from "@/components/ui/primitives";
import { RecipeIcon } from "@/components/recipes/recipe-icon";
import { cx } from "@/lib/cx";
import { RECIPES } from "@/lib/data";
import { fa } from "@/lib/format";

const TAG_FILTERS = ["همه", "کم‌کالری", "گیاهی", "پروتئینی", "سنتی"] as const;

export default function RecipesPage() {
  const [query, setQuery] = useState("");
  const [tag, setTag] = useState<(typeof TAG_FILTERS)[number]>("همه");
  const inputRef = useRef<HTMLInputElement>(null);

  const list = useMemo(() => {
    const q = query.trim();
    return RECIPES.filter((r) => {
      const matchQ = !q || r.name.includes(q) || r.description.includes(q);
      const matchT = tag === "همه" || r.tags.includes(tag);
      return matchQ && matchT;
    });
  }, [query, tag]);

  return (
    <PageBody className="pt-6">
      <div className="mb-4">
        <h1 className="text-2xl font-extrabold">دستور پخت</h1>
        <p className="mt-1 text-sm text-sub">غذاهای سالم و خوش‌طعم، با مقادیر تقریبی</p>
      </div>

      <div className="flex items-center gap-2.5 rounded-2xl border border-border/60 bg-surface px-4 py-3.5 focus-within:border-primary/60">
        <Search className="h-[18px] w-[18px] shrink-0 text-primary" />
        <input
          ref={inputRef}
          type="search"
          inputMode="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setTimeout(() => inputRef.current?.scrollIntoView({ block: "center", behavior: "smooth" }), 250)}
          placeholder="جستجوی دستور پخت"
          className="w-full bg-transparent text-sm outline-none"
        />
      </div>

      <div className="no-scrollbar mt-4 flex gap-2 overflow-x-auto pb-1">
        {TAG_FILTERS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTag(t)}
            className={cx(
              "shrink-0 rounded-full border px-4 py-2 text-xs font-semibold transition-colors",
              tag === t ? "border-primary/60 bg-primary/12 text-primary" : "border-border/70 bg-card text-sub"
            )}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="mt-4 space-y-3.5">
        {list.map((r, i) => (
          <motion.div key={r.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i * 0.04, 0.3) }}>
            <Link
              href={`/recipes/${r.id}`}
              className="flex items-center gap-3.5 rounded-[22px] border border-border/60 bg-card p-3.5 transition-transform active:scale-[0.985]"
            >
              <RecipeIcon tone={r.tone} size={76} iconSize={30} />
              <div className="min-w-0 flex-1">
                <p className="text-[14px] font-bold leading-snug">{r.name}</p>
                <p className="mt-0.5 truncate text-[11px] text-sub">{r.description}</p>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-[10px] text-muted">
                  <span className="flex items-center gap-1 tnum"><Clock className="h-3 w-3 text-blue" />{fa(r.minutes)} دقیقه</span>
                  <span className="flex items-center gap-1 tnum"><Flame className="h-3 w-3 text-orange" />{fa(r.calories)} کالری</span>
                  <span className="rounded-full bg-surface px-2 py-0.5">{r.difficulty}</span>
                </div>
              </div>
              <ChevronLeft className="h-4 w-4 shrink-0 text-muted" />
            </Link>
          </motion.div>
        ))}

        {list.length === 0 && (
          <EmptyState icon={<SearchX className="h-6 w-6" />} title="دستور پختی پیدا نشد" hint="عبارت یا برچسب دیگری را امتحان کن" />
        )}
      </div>
    </PageBody>
  );
}
