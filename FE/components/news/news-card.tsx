import Link from "next/link"
import { ArrowUpRight, Clock } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { formatArticleDate } from "@/lib/format"
import type { NewsArticle } from "@/types"

interface NewsCardProps {
  article: NewsArticle
  featured?: boolean
}

export function NewsCard({ article, featured = false }: NewsCardProps) {
  return (
    <Link
      href={`/news/${article.slug}`}
      className="group relative flex flex-col justify-between gap-6 rounded-2xl border border-border/70 bg-card p-6 transition-colors hover:border-primary/50 hover:bg-card/80"
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3">
          <Badge
            variant="outline"
            className="border-primary/40 bg-primary/10 text-primary"
          >
            {article.category}
          </Badge>
          <ArrowUpRight
            className="size-4 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary"
            aria-hidden="true"
          />
        </div>

        <h3
          className={
            featured
              ? "text-pretty text-2xl md:text-3xl font-semibold leading-tight tracking-tight"
              : "text-pretty text-lg md:text-xl font-semibold leading-snug tracking-tight"
          }
        >
          {article.title}
        </h3>

        <p className="text-pretty text-sm leading-relaxed text-muted-foreground line-clamp-3">
          {article.summary}
        </p>
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{formatArticleDate(article.publishedAt)}</span>
        <span className="inline-flex items-center gap-1.5">
          <Clock className="size-3.5" aria-hidden="true" />
          {article.readMinutes} min read
        </span>
      </div>
    </Link>
  )
}
