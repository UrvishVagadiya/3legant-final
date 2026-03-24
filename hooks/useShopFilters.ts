import { useState, useMemo, useEffect } from "react";
import { useProductStore } from "@/store/productStore";
import { categories, priceRanges } from "@/constants/shopFilters";

export function useShopFilters() {
    const { products, fetchProducts } = useProductStore();
    const [selectedCategory, setSelectedCategory] = useState("All Rooms");
    const [selectedPrices, setSelectedPrices] = useState<string[]>(["All Price"]);
    const [sortOption, setSortOption] = useState("default");
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);
    const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const handlePriceChange = (priceLabel: string) => {
        if (priceLabel === "All Price") {
            setSelectedPrices(["All Price"]);
            return;
        }
        setSelectedPrices((prev) => {
            const n = prev.filter((p) => p !== "All Price");
            const updated = n.includes(priceLabel)
                ? n.filter((p) => p !== priceLabel)
                : [...n, priceLabel];
            return updated.length === 0 ? ["All Price"] : updated;
        });
    };

    const toggleDropdown = (name: string) =>
        setOpenDropdown((p) => (p === name ? null : name));

    const handleCategorySelect = (cat: string) => {
        setSelectedCategory(cat);
        setOpenDropdown(null);
    };

    const handlePriceSelect = (label: string) => {
        handlePriceChange(label);
        if (label === "All Price") setOpenDropdown(null);
    };

    const filtered = useMemo(() => {
        let r = [...products];
        if (selectedCategory !== "All Rooms")
            r = r.filter((p) =>
                Array.isArray(p.category)
                    ? p.category.includes(selectedCategory)
                    : p.category === selectedCategory,
            );
        if (!selectedPrices.includes("All Price")) {
            const ranges = priceRanges.filter((rr) =>
                selectedPrices.includes(rr.label),
            );
            r = r.filter((p) =>
                ranges.some((rr) => p.price >= rr.min && p.price <= rr.max),
            );
        }
        if (sortOption === "az") r.sort((a, b) => a.title.localeCompare(b.title));
        else if (sortOption === "za")
            r.sort((a, b) => b.title.localeCompare(a.title));
        else if (sortOption === "price-low-high")
            r.sort((a, b) => a.price - b.price);
        else if (sortOption === "price-high-low")
            r.sort((a, b) => b.price - a.price);
        return r;
    }, [products, selectedCategory, selectedPrices, sortOption]);

    const categoryItems = categories.map((c) => ({
        label: c,
        active: selectedCategory === c,
    }));
    const priceItems = priceRanges.map((r) => ({
        label: r.label,
        active: selectedPrices.includes(r.label),
    }));
    const priceDisplay = selectedPrices.includes("All Price")
        ? "All Price"
        : selectedPrices[0];

    return {
        filtered,
        selectedCategory,
        setSelectedCategory,
        selectedPrices,
        handlePriceChange,
        sortOption,
        setSortOption,
        openDropdown,
        setOpenDropdown,
        isMobileFilterOpen,
        setIsMobileFilterOpen,
        toggleDropdown,
        handleCategorySelect,
        handlePriceSelect,
        categoryItems,
        priceItems,
        priceDisplay,
    };
}
