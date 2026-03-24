"use client";
import React, { ChangeEvent } from "react";
import { ProductFormData } from "./ProductFormModal";

import { ProductCategory, ProductColor } from "./ProductTableRow";

const categories: ProductCategory[] = [
  "Living Room",
  "Bedroom",
  "Kitchen",
  "Bathroom",
  "Dinning",
  "Outdoor",
  "Office",
];
const colorOptions: ProductColor[] = [
  "Black",
  "White",
  "Brown",
  "Red",
  "Blue",
  "Green",
  "Gray",
  "Beige",
  "Navy",
  "Pink",
  "Yellow",
  "Orange",
  "Purple",
  "Cream",
  "Walnut",
  "Natural",
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
  imageFiles: (File | null)[];
  onImageChange: (files: (File | null)[]) => void;
}

export default function ProductFormFields({
  formData,
  setFormData,
  editingId,
  imageFiles,
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

  const handleFileChange = (index: number, file: File | null) => {
    const newFiles = [...imageFiles];
    newFiles[index] = file;
    onImageChange(newFiles);
  };

  return (
    <>
      <div className="space-y-4">
        <label className="block text-xs font-semibold text-[#6C7275] mb-2 uppercase">
          Product Images (Min 1, Max 6)
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {new Array(6).fill(0).map((_, i) => (
            <div key={i} className="flex flex-col gap-2 p-3 border border-dashed border-gray-200 rounded-lg bg-gray-50/50">
              <label className="text-[10px] font-bold text-gray-400 uppercase">
                {i === 0 ? "Thumbnail (Main)" : `View ${i}`}
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(i, e.target.files?.[0] || null)}
                className="text-[10px] w-full"
              />
              {imageFiles && imageFiles[i] && (
                <div className="text-[10px] text-green-600 truncate">
                  ✓ {imageFiles[i]?.name}
                </div>
              )}
            </div>
          ))}
        </div>
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
          <option value="inactive">Inactive</option>
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
