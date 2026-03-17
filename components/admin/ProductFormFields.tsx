"use client";
import React, { ChangeEvent } from "react";
import { ProductFormData } from "./ProductFormModal";

const categories = [
  "Living Room",
  "Bedroom",
  "Kitchen",
  "Bathroom",
  "Dinning",
  "Outdoor",
];
const colorOptions = [
  "Black",
  "White",
  "Brown",
  "Gray",
  "Blue",
  "Red",
  "Green",
  "Yellow",
  "Beige",
];

const Input = ({
  label,
  required,
  ...props
}: {
  label: string;
  required?: boolean;
} & React.InputHTMLAttributes<HTMLInputElement>) => (
  <div>
    <label className="block text-xs font-semibold text-[#6C7275] mb-1 uppercase">
      {label}
      {required && " *"}
    </label>
    <input
      {...props}
      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#141718]"
    />
  </div>
);

const CheckboxGroup = ({
  label,
  options,
  selected,
  onChange,
}: {
  label: string;
  options: string[];
  selected: string[];
  onChange: (v: string[]) => void;
}) => (
  <div>
    <label className="block text-xs font-semibold text-[#6C7275] mb-2 uppercase">
      {label}
    </label>
    <div className="grid grid-cols-3 gap-2">
      {options.map((opt) => (
        <label key={opt} className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={selected.includes(opt)}
            onChange={(e) =>
              onChange(
                e.target.checked
                  ? [...selected, opt]
                  : selected.filter((x) => x !== opt),
              )
            }
            className="w-4 h-4 rounded border-gray-300"
          />
          {opt}
        </label>
      ))}
    </div>
  </div>
);

interface Props {
  formData: ProductFormData;
  setFormData: React.Dispatch<React.SetStateAction<ProductFormData>>;
  editingId: string | null;
  onImageChange: (file: File) => void;
}

export default function ProductFormFields({
  formData,
  setFormData,
  editingId,
  onImageChange,
}: Props) {
  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value, type } = e.target;
    setFormData((p) => ({
      ...p,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  return (
    <>
      <div>
        <label className="block text-xs font-semibold text-[#6C7275] mb-1 uppercase">
          Product Image{!editingId && " *"}
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) =>
            e.target.files?.[0] && onImageChange(e.target.files[0])
          }
          className="w-full text-sm"
        />
      </div>
      <Input
        label="Title"
        name="title"
        value={formData.title}
        onChange={handleChange}
        required
      />
      <div>
        <label className="block text-xs font-semibold text-[#6C7275] mb-1 uppercase">
          Description
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={3}
          className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#141718] resize-none"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Price"
          name="price"
          type="number"
          value={formData.price}
          onChange={handleChange}
          required
          min="0"
          step="0.01"
        />
        <Input
          label="MRP (Optional)"
          name="mrp"
          type="number"
          value={formData.mrp}
          onChange={handleChange}
          min="0"
          step="0.01"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Measurements"
          name="measurements"
          value={formData.measurements}
          onChange={handleChange}
          placeholder="e.g. 120x60x45 cm"
        />
        <Input
          label="Weight"
          name="weight"
          value={formData.weight}
          onChange={handleChange}
          placeholder="e.g. 5.2 kg"
        />
      </div>
      <div>
        <Input
          label="Offer Valid Until"
          name="valid_until"
          type="datetime-local"
          value={formData.valid_until}
          onChange={handleChange}
        />
        <p className="text-xs text-[#6C7275] mt-1">
          Leave empty for no offer countdown
        </p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="SKU"
          name="sku"
          value={formData.sku}
          onChange={handleChange}
        />
        <Input
          label="Stock"
          name="stock"
          type="number"
          value={formData.stock}
          onChange={handleChange}
          min="0"
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-[#6C7275] mb-1 uppercase">
          Status
        </label>
        <select
          name="status"
          value={formData.status}
          onChange={handleChange}
          className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#141718]"
        >
          <option value="active">Active</option>
          <option value="draft">Draft</option>
          <option value="archived">Archived</option>
        </select>
      </div>
      <CheckboxGroup
        label="Categories"
        options={categories}
        selected={formData.category}
        onChange={(v) => setFormData((p) => ({ ...p, category: v }))}
      />
      <CheckboxGroup
        label="Colors"
        options={colorOptions}
        selected={formData.color}
        onChange={(v) => setFormData((p) => ({ ...p, color: v }))}
      />
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="isNew"
          checked={formData.isNew}
          onChange={handleChange}
          className="w-4 h-4 rounded border-gray-300"
        />
        Mark as New Arrival
      </label>
    </>
  );
}
