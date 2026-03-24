import { useState, FormEvent } from "react";
import { createClient } from "@/utils/supabase/client";
import toast from "react-hot-toast";
import { ProductFormData, emptyProductForm } from "@/components/admin/ProductFormModal";
import { Product } from "@/components/admin/ProductTableRow";

export function useAdminProducts() {
    const supabase = createClient();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState<ProductFormData>(emptyProductForm);
    const [imageFiles, setImageFiles] = useState<(File | null)[]>(new Array(6).fill(null));
    const [submitting, setSubmitting] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [deleting, setDeleting] = useState<string | null>(null);

    const fetchProducts = async () => {
        const { data, error } = await supabase.from("products").select("*").order("created_at", { ascending: false });
        if (!error && data) setProducts(data);
        setLoading(false);
    };

    const openEditForm = (p: Product) => {
        setEditingId(p.id);
        setFormData({
            title: p.title || "", price: String(p.price || ""), mrp: p.mrp ? String(p.mrp) : "",
            category: p.category || [], isNew: p.isNew || false, description: p.description || "",
            sku: p.sku || "", stock: String(p.stock || 0), color: p.color || [],
            status: p.status || "active", measurements: p.measurements || "",
            weight: p.weight || "", valid_until: p.valid_until ? p.valid_until.slice(0, 16) : "",
        });
        setImageFiles(new Array(6).fill(null));
        setShowForm(true);
    };

    const openAddForm = () => {
        setEditingId(null);
        setFormData(emptyProductForm);
        setImageFiles(new Array(6).fill(null));
        setShowForm(true);
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const imageUrls: string[] = [];
            
            // Loop through all 6 image slots
            for (let i = 0; i < imageFiles.length; i++) {
                const file = imageFiles[i];
                if (file) {
                    const fileName = `${Date.now()}-${i}-${file.name}`;
                    const { error: uploadError } = await supabase.storage.from("product_img").upload(fileName, file);
                    if (uploadError) throw uploadError;
                    const publicUrl = supabase.storage.from("product_img").getPublicUrl(fileName).data.publicUrl;
                    imageUrls.push(publicUrl);
                }
            }

            const priceNum = Number(formData.price);
            const mrpNum = formData.mrp ? Number(formData.mrp) : null;
            const productData: any = {
                title: formData.title, price: priceNum, category: formData.category, isNew: formData.isNew,
                discount: mrpNum && mrpNum > priceNum ? `-${Math.round(((mrpNum - priceNum) / mrpNum) * 100)}%` : null,
                description: formData.description || null, sku: formData.sku || null, stock: Number(formData.stock) || 0,
                color: formData.color, status: formData.status, measurements: formData.measurements || null,
                weight: formData.weight || null, valid_until: formData.valid_until ? new Date(formData.valid_until).toISOString() : null,
            };
            if (mrpNum) productData.mrp = mrpNum;
            
            if (imageUrls.length > 0) {
                productData.img = imageUrls[0]; // Maintain primary image column
                productData.images = imageUrls; // Add to new images array
            }

            if (editingId) {
                const { error } = await supabase.from("products").update(productData).eq("id", editingId);
                if (error) throw error;
                toast.success("Product updated!");
            } else {
                if (imageUrls.length === 0) { toast.error("Please select at least one image"); setSubmitting(false); return; }
                const { error } = await supabase.from("products").insert([productData]);
                if (error) throw error;
                toast.success("Product added!");
            }
            setShowForm(false);
            setFormData(emptyProductForm);
            setEditingId(null);
            setImageFiles(new Array(6).fill(null));
            fetchProducts();
        } catch (err: any) {
            toast.error(err.message || "Failed to save product");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this product?")) return;
        setDeleting(id);
        const { error } = await supabase.from("products").delete().eq("id", id);
        if (error) toast.error("Failed to delete product");
        else { toast.success("Product deleted"); setProducts((prev) => prev.filter((p) => p.id !== id)); }
        setDeleting(null);
    };

    const filtered = products.filter((p) =>
        p.title?.toLowerCase().includes(searchQuery.toLowerCase()) || p.sku?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return {
        loading, showForm, editingId, formData, setFormData, submitting, searchQuery, setSearchQuery,
        deleting, filtered, fetchProducts, openEditForm, openAddForm, handleSubmit, handleDelete,
        setShowForm, setImageFiles, imageFiles,
    };
}
