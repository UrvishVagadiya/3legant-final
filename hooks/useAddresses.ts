import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import toast from "react-hot-toast";
import type { DbAddress } from "@/components/account/AddressCard";
import type { AddressData } from "@/components/account/AddressModal";

function dbToFormData(address: DbAddress): AddressData {
    return {
        id: address.id,
        label: address.label || "",
        type: address.type as "shipping" | "billing",
        name: `${address.first_name} ${address.last_name}`.trim(),
        phone: address.phone || "",
        address: `${address.street_address}, ${address.city}, ${address.state} ${address.zip_code}, ${address.country}`,
        street_address: address.street_address,
        city: address.city,
        state: address.state,
        zip_code: address.zip_code,
        country: address.country,
        is_default: address.is_default,
    };
}

export function useAddresses() {
    const [addresses, setAddresses] = useState<DbAddress[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingAddress, setEditingAddress] = useState<AddressData | null>(null);
    const [modalFixedType, setModalFixedType] = useState<"shipping" | "billing" | undefined>(undefined);

    const fetchAddresses = async () => {
        const supabase = createClient();
        const { data: userData } = await supabase.auth.getUser();
        if (!userData?.user) { setLoading(false); return; }

        const { data } = await supabase
            .from("user_addresses")
            .select("*")
            .eq("user_id", userData.user.id)
            .order("is_default", { ascending: false })
            .order("created_at", { ascending: false });

        if (data) setAddresses(data.map((a: any) => ({ ...a, label: a.label ?? null })));
        setLoading(false);
    };

    useEffect(() => { fetchAddresses(); }, []);

    const handleAdd = (type?: "shipping" | "billing") => {
        setEditingAddress(null);
        setModalFixedType(type);
        setModalOpen(true);
    };

    const handleEdit = (address: DbAddress) => {
        setEditingAddress(dbToFormData(address));
        setModalFixedType(address.type as "shipping" | "billing");
        setModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        const supabase = createClient();
        await supabase.from("user_addresses").delete().eq("id", id);
        setAddresses((prev) => prev.filter((a) => a.id !== id));
        toast.success("Address deleted");
    };

    const handleSetDefault = async (address: DbAddress) => {
        const supabase = createClient();
        const { data: userData } = await supabase.auth.getUser();
        if (!userData?.user) return;
        await supabase.from("user_addresses").update({ is_default: false }).eq("user_id", userData.user.id).eq("type", address.type);
        await supabase.from("user_addresses").update({ is_default: true }).eq("id", address.id);
        await fetchAddresses();
        toast.success("Default address updated");
    };

    const handleSave = async (data: AddressData) => {
        const supabase = createClient();
        const { data: userData } = await supabase.auth.getUser();
        if (!userData?.user) return;

        const nameParts = data.name.split(" ");
        const type = data.type || modalFixedType || "shipping";

        const baseRow: Record<string, unknown> = {
            user_id: userData.user.id,
            type,
            first_name: nameParts[0] || "",
            last_name: nameParts.slice(1).join(" ") || "",
            phone: data.phone,
            street_address: data.street_address || data.address,
            city: data.city || "",
            state: data.state || "",
            zip_code: data.zip_code || "",
            country: data.country || "",
        };

        const tryWithLabel = data.label ? { ...baseRow, label: data.label } : baseRow;

        if (data.id) {
            let { error } = await supabase.from("user_addresses").update(tryWithLabel).eq("id", data.id);
            if (error && data.label) {
                const retry = await supabase.from("user_addresses").update(baseRow).eq("id", data.id);
                error = retry.error;
            }
            if (error) { toast.error("Failed to update address"); return; }
        } else {
            const existingOfType = addresses.filter((a) => a.type === type);
            const isDefault = existingOfType.length === 0;
            let { error } = await supabase.from("user_addresses").insert({ ...tryWithLabel, is_default: isDefault });
            if (error) {
                const retry = await supabase.from("user_addresses").insert({ ...baseRow, is_default: isDefault });
                error = retry.error;
            }
            if (error) { toast.error("Failed to add address"); return; }
        }

        await fetchAddresses();
        setModalOpen(false);
        toast.success(data.id ? "Address updated" : "Address added");
    };

    const shippingAddresses = addresses.filter((a) => a.type === "shipping");
    const billingAddresses = addresses.filter((a) => a.type === "billing");

    return {
        loading, modalOpen, editingAddress, modalFixedType,
        shippingAddresses, billingAddresses,
        handleAdd, handleEdit, handleDelete, handleSetDefault, handleSave,
        setModalOpen,
    };
}
