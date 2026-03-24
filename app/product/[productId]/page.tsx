"use client";

import { DisplayProduct } from "@/components/product/DisplayProduct";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { initialCartItems } from "@/constants/products";

import { ProductDetailsSkeleton } from "@/components/ui/ProductDetailsSkeleton";
import { useProductStore } from "@/store/productStore";

export default function ProductPage() {
  const { productId } = useParams<{ productId: string }>();
  const router = useRouter();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { getProductById } = useProductStore();
  const supabase = createClient();

  useEffect(() => {
    const fetchProduct = async () => {
      // Try to get from store first
      const cachedProduct = getProductById(productId);
      if (cachedProduct) {
        setProduct({
          ...cachedProduct,
          name: cachedProduct.title,
          oldprice: cachedProduct.mrp || cachedProduct.oldprice || 0,
          validUntil: cachedProduct.validUntil || cachedProduct.valid_until,
          image_url: cachedProduct.img,
        });
        setLoading(false);
        return;
      }

      setLoading(true);
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", productId)
        .maybeSingle();

      if (error) {
        console.error("Error fetching product:", error);
        router.push("/shop");
        return;
      }
      if (!data) {
        router.push("/shop");
        return;
      }
      if (data.status !== "active") {
        router.push("/shop");
        return;
      }
      if (!error && data) {
        setProduct({
          id: data.id,
          name: data.title || data.name,
          description: data.description || "",
          color: Array.isArray(data.color)
            ? data.color
            : data.color
              ? [data.color]
              : ["Black"],
          price: data.price,
          mrp: data.mrp || data.MRP || 0,
          oldprice: data.mrp || data.MRP || data.oldprice || 0,
          quantity: 1,
          sku: data.sku || data.id,
          category: data.category || "",
          isNew: data.isNew ?? data.is_new ?? false,
          validUntil: data.validUntil || data.valid_until,
          img: data.img,
          image_url: data.img,
          measurements: data.measurements || "",
          weight: data.weight || "",
          images: data.images || [],
          stock: data.stock ?? 0,
        });
      } else {
        setProduct(initialCartItems[0]);
      }
      setLoading(false);
    };

    fetchProduct();
  }, [productId]);

  if (loading) {
    return <ProductDetailsSkeleton />;
  }

  if (!product) return null;

  return <DisplayProduct p={product} />;
}
