"use client";
import React, { useEffect } from "react";
import { Plus, Search, FileText } from "lucide-react";
import BlogFormModal from "@/components/admin/BlogFormModal";
import BlogTableRow from "@/components/admin/BlogTableRow";
import { useAdminBlogs } from "@/hooks/useAdminBlogs";

export default function AdminBlogs() {
  const {
    loading,
    showForm,
    isPreview,
    setIsPreview,
    editingId,
    formData,
    setFormData,
    submitting,
    searchQuery,
    setSearchQuery,
    deleting,
    filtered,
    fetchBlogs,
    openEditForm,
    openAddForm,
    handleSubmit,
    handleDelete,
    setShowForm,
    handleImageChange,
    imageFile,
    previewUrl,
  } = useAdminBlogs();

  useEffect(() => {
    fetchBlogs();
  }, []);

  if (loading) return <div className="text-[#6C7275]">Loading blogs...</div>;

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
            placeholder="Search blogs by title or author..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#141718]"
          />
        </div>
        <button
          onClick={openAddForm}
          className="flex items-center gap-2 bg-[#141718] text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-black transition-colors"
        >
          <Plus size={18} /> Add Blog
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-[#6C7275]">
              <tr>
                {["Blog", "Author", "Date", "Actions"].map(
                  (h) => (
                    <th key={h} className="text-left px-6 py-3 font-medium">
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {filtered.map((b) => (
                <BlogTableRow
                  key={b.id}
                  blog={b}
                  onEdit={openEditForm}
                  onDelete={handleDelete}
                  deleting={deleting === b.id}
                />
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-12 text-center text-[#6C7275]"
                  >
                    <div className="flex flex-col items-center gap-2">
                        <FileText size={40} className="text-gray-200" />
                        <p>No blogs found</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <BlogFormModal
          formData={formData}
          setFormData={setFormData}
          editingId={editingId}
          imageFile={imageFile}
          submitting={submitting}
          onSubmit={handleSubmit}
          onClose={() => setShowForm(false)}
          onImageChange={handleImageChange}
          isPreview={isPreview}
          setIsPreview={setIsPreview}
          previewUrl={previewUrl}
        />
      )}
    </div>
  );
}
