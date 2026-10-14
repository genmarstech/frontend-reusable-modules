import { djangoFetch } from "@/lib/django";
import type { Category, Paginated } from "@/lib/types";
import { CategoryManager } from "@/components/admin/CategoryManager";

export default async function AdminCategoriesPage() {
  const categories = await djangoFetch<Paginated<Category>>("/api/categories/", { cache: "no-store" });

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-2xl font-semibold tracking-tight text-text">Categories</h1>
      <CategoryManager categories={categories.results} />
    </div>
  );
}
