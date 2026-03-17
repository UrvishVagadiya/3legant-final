"use client";

import { Plus } from "lucide-react";
import AddressModal from "./AddressModal";
import AddressCard from "./AddressCard";
import { useAddresses } from "@/hooks/useAddresses";

interface AddressProps {
  fullName: string;
}

const AddressSection = ({
  title,
  type,
  addresses,
  onAdd,
  onEdit,
  onDelete,
  onSetDefault,
}: {
  title: string;
  type: "shipping" | "billing";
  addresses: any[];
  onAdd: (type: "shipping" | "billing") => void;
  onEdit: (address: any) => void;
  onDelete: (id: string) => void;
  onSetDefault: (address: any) => void;
}) => (
  <div className={type === "shipping" ? "mb-8" : ""}>
    <div className="flex justify-between items-center mb-4">
      <h2 className="font-semibold text-[16px] text-gray-900">{title}</h2>
      <button
        onClick={() => onAdd(type)}
        className="flex items-center gap-1.5 text-sm font-semibold text-gray-600 hover:text-black transition-colors"
      >
        <Plus size={16} />
        Add New
      </button>
    </div>
    {addresses.length === 0 ? (
      <p className="text-sm text-[#6C7275]">No {type} addresses saved.</p>
    ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {addresses.map((address) => (
          <AddressCard
            key={address.id}
            address={address}
            onEdit={onEdit}
            onDelete={onDelete}
            onSetDefault={onSetDefault}
          />
        ))}
      </div>
    )}
  </div>
);

const Address = ({ fullName }: AddressProps) => {
  const {
    loading,
    modalOpen,
    editingAddress,
    modalFixedType,
    shippingAddresses,
    billingAddresses,
    handleAdd,
    handleEdit,
    handleDelete,
    handleSetDefault,
    handleSave,
    setModalOpen,
  } = useAddresses();

  if (loading) {
    return (
      <div>
        <h1 className="font-semibold text-[20px] mb-4 md:mb-6">Address</h1>
        <p className="text-[#6C7275]">Loading addresses...</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-semibold text-[20px] mb-4 md:mb-6">Address</h1>

      <AddressSection
        title="Shipping Addresses"
        type="shipping"
        addresses={shippingAddresses}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onSetDefault={handleSetDefault}
      />

      <AddressSection
        title="Billing Addresses"
        type="billing"
        addresses={billingAddresses}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onSetDefault={handleSetDefault}
      />

      <AddressModal
        isOpen={modalOpen}
        title={
          editingAddress?.id
            ? `Edit ${modalFixedType === "billing" ? "Billing" : "Shipping"} Address`
            : `Add ${modalFixedType === "billing" ? "Billing" : "Shipping"} Address`
        }
        defaultValues={editingAddress}
        fixedType={modalFixedType}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
      />
    </div>
  );
};

export default Address;
