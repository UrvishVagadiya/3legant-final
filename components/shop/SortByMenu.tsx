import { RiArrowDropDownLine } from "react-icons/ri";

const defaultSortOptions = [
  { value: "default", label: "Default" },
  { value: "az", label: "A-Z" },
  { value: "za", label: "Z-A" },
  { value: "price-low-high", label: "Price (Low to High)" },
  { value: "price-high-low", label: "Price (High to Low)" },
];

interface SortOption {
  value: string;
  label: string;
}

interface SortByMenuProps {
  onSort: (option: string) => void;
  align?: "left" | "right";
  options?: SortOption[];
}

const SortByMenu = ({
  onSort,
  align = "right",
  options = defaultSortOptions,
}: SortByMenuProps) => {
  return (
    <div className="relative group flex items-center gap-1 cursor-pointer">
      <span className="font-semibold text-sm text-[#141718]">Sort by</span>
      <RiArrowDropDownLine className="text-2xl text-[#141718]" />
      <div
        className={`absolute z-999 ${align === "right" ? "right-0" : "left-0"} top-full mt-2 w-48 bg-white border border-gray-100 shadow-xl rounded-lg overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200`}
      >
        <div className="flex flex-col py-1 text-sm">
          {options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onSort(opt.value)}
              className="text-left px-4 py-2 hover:bg-gray-50"
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SortByMenu;
