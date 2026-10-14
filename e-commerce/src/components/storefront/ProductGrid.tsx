import type { Category, Product } from "@/lib/types";
import { ProductCard } from "./ProductCard";
import { EmptyState } from "@/components/ui/States";
import { PackageSearch } from "lucide-react";

export function ProductGrid({ products, categories = [] }: { products: Product[]; categories?: Category[] }) {
  if (products.length === 0) {
    return (
      <EmptyState
        icon={PackageSearch}
        title="No products found"
        description="Try a different search or category."
      />
    );
  }

  const categoryName = new Map(categories.map((c) => [c.id, c.name]));

  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          categoryName={product.category ? categoryName.get(product.category) : undefined}
        />
      ))}
    </div>
  );
}
