import Link from "next/link";
import { notFound } from "next/navigation";
import { djangoFetch, ApiRequestError, toQuery } from "@/lib/django";
import type { Category, InventoryRecord, Paginated, Product } from "@/lib/types";
import { ProductForm } from "@/components/admin/ProductForm";
import { Card, CardBody } from "@/components/ui/Card";
import { updateProduct } from "../actions";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let product: Product;
  try {
    product = await djangoFetch<Product>(`/api/products/${id}/`, { cache: "no-store" });
  } catch (error) {
    if (error instanceof ApiRequestError && error.isNotFound) notFound();
    throw error;
  }

  const [categories, inventory] = await Promise.all([
    djangoFetch<Paginated<Category>>("/api/categories/", { next: { revalidate: 300 } }),
    djangoFetch<Paginated<InventoryRecord>>(`/api/inventory/${toQuery({ product: product.id })}`, { cache: "no-store" }),
  ]);
  const record = inventory.results[0];
  const boundUpdate = updateProduct.bind(null, product.id);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight text-text">{product.name}</h1>

      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        <ProductForm product={product} categories={categories.results} action={boundUpdate} />

        <Card className="h-fit">
          <CardBody>
            <h2 className="mb-3 text-sm font-semibold text-text">Inventory</h2>
            {record ? (
              <>
                <p className="text-2xl font-semibold text-text">{record.quantity}</p>
                <p className="text-xs text-text-muted">units in stock</p>
              </>
            ) : (
              <p className="text-sm text-text-muted">No inventory record yet.</p>
            )}
            <Link href="/admin/inventory" className="mt-4 block text-sm font-medium text-accent hover:underline">
              Manage stock →
            </Link>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
