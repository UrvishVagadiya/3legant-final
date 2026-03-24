"use client";
import { useEffect } from "react";
import { Plus, Search } from "lucide-react";
import ProductFormModal from "@/components/admin/ProductFormModal";
import ProductTableRow from "@/components/admin/ProductTableRow";
import { useAdminProducts } from "@/hooks/useAdminProducts";

export default function AdminProducts() {
  const {
    loading,
    showForm,
    editingId,
    formData,
    setFormData,
    submitting,
    searchQuery,
    setSearchQuery,
    deleting,
    filtered,
    fetchProducts,
    openEditForm,
    openAddForm,
    handleSubmit,
    handleDelete,
    setShowForm,
    setImageFiles,
    imageFiles,
  } = useAdminProducts();

  useEffect(() => {
    fetchProducts();
  }, []);

  if (loading) return <div className="text-[#6C7275]">Loading products...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#141718]"
          />
        </div>
        <button
          onClick={openAddForm}
          className="flex items-center gap-2 bg-[#141718] text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-black transition-colors"
        >
          <Plus size={18} /> Add Product
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-[#6C7275]">
              <tr>
                {["Product", "SKU", "Price", "Stock", "Status", "Actions"].map(
                  (h) => (
                    <th key={h} className="text-left px-6 py-3 font-medium">
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <ProductTableRow
                  key={p.id}
                  product={p}
                  onEdit={openEditForm}
                  onDelete={handleDelete}
                  deleting={deleting === p.id}
                />
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-[#6C7275]"
                  >
                    No products found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <ProductFormModal
          formData={formData}
          setFormData={setFormData}
          editingId={editingId}
          imageFiles={imageFiles}
          submitting={submitting}
          onSubmit={handleSubmit}
          onClose={() => setShowForm(false)}
          onImageChange={setImageFiles}
        />
      )}
    </div>
  );
}
