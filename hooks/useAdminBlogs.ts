import { useState, FormEvent } from "react";
import { createClient } from "@/utils/supabase/client";
import toast from "react-hot-toast";
import { BlogFormData, emptyBlogForm, Blog } from "@/types/blog";

export function useAdminBlogs() {
    const supabase = createClient();
    const [blogs, setBlogs] = useState<Blog[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [isPreview, setIsPreview] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [formData, setFormData] = useState<BlogFormData>(emptyBlogForm);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [deleting, setDeleting] = useState<number | null>(null);

    const fetchBlogs = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from("blogs")
            .select("*")
            .order("date", { ascending: false });
        
        if (!error && data) setBlogs(data);
        setLoading(false);
    };

    const openEditForm = (b: Blog) => {
        setEditingId(b.id);
        setFormData({
            title: b.title || "",
            author: b.author || "admin",
            date: b.date || new Date().toISOString(),
            content: b.content || "",
        });
        setImageFile(null);
        setPreviewUrl(b.img);
        setIsPreview(false);
        setShowForm(true);
    };

    const openAddForm = () => {
        setEditingId(null);
        setFormData(emptyBlogForm);
        setImageFile(null);
        setPreviewUrl(null);
        setIsPreview(false);
        setShowForm(true);
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            let imageUrl = editingId ? blogs.find(b => b.id === editingId)?.img : "";
            
            if (imageFile) {
                const fileName = `blog-${Date.now()}-${imageFile.name}`;
                const { error: uploadError } = await supabase.storage
                    .from("product_img")
                    .upload(fileName, imageFile);
                
                if (uploadError) throw uploadError;
                
                imageUrl = supabase.storage
                    .from("product_img")
                    .getPublicUrl(fileName).data.publicUrl;
            }

            if (!editingId && !imageUrl) {
                toast.error("Please upload an image");
                setSubmitting(false);
                return;
            }

            const blogData = {
                title: formData.title,
                author: formData.author,
                date: formData.date || new Date().toISOString(),
                content: formData.content,
                img: imageUrl,
            };

            if (editingId) {
                const { error } = await supabase
                    .from("blogs")
                    .update(blogData)
                    .eq("id", editingId);
                if (error) throw error;
                toast.success("Blog updated!");
            } else {
                // For new blogs, we need a unique ID. 
                // We'll get the max ID and increment, or assume identity/serial handles it.
                // Looking at the schema, it's 'id integer PRIMARY KEY'.
                const { data: maxIdData } = await supabase.from("blogs").select("id").order("id", { ascending: false }).limit(1);
                const nextId = maxIdData && maxIdData.length > 0 ? maxIdData[0].id + 1 : 1;
                
                const { error } = await supabase
                    .from("blogs")
                    .insert([{ ...blogData, id: nextId }]);
                if (error) throw error;
                toast.success("Blog added!");
            }

            setShowForm(false);
            setFormData(emptyBlogForm);
            setEditingId(null);
            setImageFile(null);
            fetchBlogs();
        } catch (err: any) {
            toast.error(err.message || "Failed to save blog");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this blog?")) return;
        setDeleting(id);
        const { error } = await supabase.from("blogs").delete().eq("id", id);
        if (error) toast.error("Failed to delete blog");
        else {
            toast.success("Blog deleted");
            setBlogs((prev) => prev.filter((b) => b.id !== id));
        }
        setDeleting(null);
    };

    const filtered = blogs.filter((b) =>
        b.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
        b.author?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleImageChange = (file: File | null) => {
        setImageFile(file);
        if (file) {
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
        }
    };

    return {
        loading, showForm, isPreview, setIsPreview, editingId, formData, setFormData, submitting, searchQuery, setSearchQuery,
        deleting, filtered, fetchBlogs, openEditForm, openAddForm, handleSubmit, handleDelete,
        setShowForm, handleImageChange, imageFile, previewUrl,
    };
}
