import { djangoFetch } from "@/lib/django";
import type { Category, Paginated } from "@/lib/types";
import { ProductForm } from "@/components/admin/ProductForm";
import { createProduct } from "../actions";

export default async function NewProductPage() {
  const categories = await djangoFetch<Paginated<Category>>("/api/categories/", { next: { revalidate: 300 } });

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-2xl font-semibold tracking-tight text-text">New product</h1>
      <ProductForm categories={categories.results} action={createProduct} />
    </div>
  );
}
