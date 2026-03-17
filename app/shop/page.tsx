"use client";

import { useState } from "react";
import { BsGrid3X3GapFill, BsGridFill } from "react-icons/bs";
import { PiColumnsFill, PiRowsFill } from "react-icons/pi";
import ShopHeader from "@/components/layout/ShopHeader";
import ShopSidebar from "@/components/layout/ShopSidebar";
import ShopProductGrid from "@/components/sections/ShopProductGrid";
import FilterDropdown from "@/components/shop/FilterDropdown";
import SortByMenu from "@/components/shop/SortByMenu";
import GridIconBar from "@/components/shop/GridIconBar";
import MobileShopFilters from "@/components/shop/MobileShopFilters";
import { useShopFilters } from "@/hooks/useShopFilters";
import { categories, priceRanges } from "@/constants/shopFilters";

const desktopIcons = [
  { icon: <BsGrid3X3GapFill />, grid: 3 },
  { icon: <BsGridFill />, grid: 4 },
  { icon: <PiColumnsFill />, grid: 2 },
  { icon: <PiRowsFill />, grid: 1 },
];
const mobileIcons = [
  { icon: <PiColumnsFill />, grid: 2 },
  { icon: <PiRowsFill />, grid: 1 },
];

const Shop = () => {
  const {
    filtered,
    selectedCategory,
    setSelectedCategory,
    selectedPrices,
    handlePriceChange,
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
  } = useShopFilters();

  const [viewGrid, setViewGrid] = useState(3);
  const [mobileViewGrid, setMobileViewGrid] = useState(2);
  const [visibleCount, setVisibleCount] = useState(9);
  const isSidebarOpen = viewGrid === 3;

  return (
    <div className="max-w-310 mx-auto px-4 sm:px-6 lg:px-8 mb-20 font-poppins">
      <ShopHeader />
      <div className="flex flex-col lg:flex-row gap-8 my-8 md:my-12 relative w-full items-start">
        {isSidebarOpen && (
          <div className="hidden lg:block w-full lg:w-1/4 pb-4">
            <ShopSidebar
              isFilterOpen
              categories={categories}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              priceRanges={priceRanges}
              selectedPrices={selectedPrices}
              handlePriceChange={handlePriceChange}
            />
          </div>
        )}
        <div
          className={`w-full flex-1 transition-all duration-300 ${!isSidebarOpen ? "lg:w-full" : "lg:w-3/4"}`}
        >
          <div className="lg:hidden flex flex-col gap-3 mb-4">
            <MobileShopFilters
              mobileViewGrid={mobileViewGrid}
              setMobileViewGrid={setMobileViewGrid}
              isMobileFilterOpen={isMobileFilterOpen}
              setIsMobileFilterOpen={setIsMobileFilterOpen}
              openDropdown={openDropdown}
              setOpenDropdown={setOpenDropdown}
              selectedCategory={selectedCategory}
              categoryItems={categoryItems}
              priceItems={priceItems}
              priceDisplayValue={priceDisplay}
              onCategorySelect={handleCategorySelect}
              onPriceSelect={handlePriceSelect}
              onToggleDropdown={toggleDropdown}
              onSort={setSortOption}
              mobileIcons={mobileIcons}
            />
          </div>
          <div className="hidden lg:flex flex-row justify-between items-end gap-4 mb-8">
            {isSidebarOpen ? (
              <h1 className="text-2xl font-semibold text-[#141718] pb-2">
                {selectedCategory}
              </h1>
            ) : (
              <div className="flex flex-row gap-4 pb-1">
                <FilterDropdown
                  label="CATEGORIES"
                  displayValue={selectedCategory}
                  items={categoryItems}
                  isOpen={openDropdown === "category"}
                  onToggle={() => toggleDropdown("category")}
                  onSelect={handleCategorySelect}
                  compact={false}
                />
                <FilterDropdown
                  label="PRICE"
                  displayValue={priceDisplay}
                  items={priceItems}
                  isOpen={openDropdown === "price"}
                  onToggle={() => toggleDropdown("price")}
                  onSelect={handlePriceSelect}
                  compact={false}
                />
              </div>
            )}
            <div className="flex items-center gap-6 pb-1">
              <SortByMenu onSort={setSortOption} />
              <GridIconBar
                icons={desktopIcons}
                activeGrid={viewGrid}
                onChange={setViewGrid}
              />
            </div>
          </div>
          <ShopProductGrid
            products={filtered}
            viewGrid={viewGrid}
            mobileViewGrid={mobileViewGrid}
            visibleCount={visibleCount}
            setVisibleCount={setVisibleCount}
            isSidebarOpen={isSidebarOpen}
          />
        </div>
      </div>
    </div>
  );
};

export default Shop;
