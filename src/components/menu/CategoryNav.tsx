import React from "react";

interface CategoryNavProps {
  categories: any[];
  activeCategory: string;
  onCategoryClick: (categoryId: string) => void;
}

const CategoryNav: React.FC<CategoryNavProps> = ({
  categories,
  activeCategory,
  onCategoryClick,
}) => {
  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-hide no-scrollbar mt-3 pb-1">
      {categories.map((group) => (
        <button
          key={group.category.id}
          onClick={() => onCategoryClick(group.category.id)}
          className={`px-4 py-1.5 rounded-full text-[11px] font-black whitespace-nowrap transition-all uppercase tracking-wider ${
            activeCategory === group.category.id
              ? "bg-orange-600 text-white shadow-md shadow-orange-600/20"
              : "bg-gray-50 text-gray-500 border border-gray-100"
          }`}
        >
          {group.category.name}
        </button>
      ))}
    </div>
  );
};

export default CategoryNav;
