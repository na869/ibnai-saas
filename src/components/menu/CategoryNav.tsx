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
    <div className="flex gap-4 overflow-x-auto no-scrollbar mt-4 pb-2 -mx-4 px-4">
      {categories.map((group) => (
        <button
          key={group.category.id}
          onClick={() => onCategoryClick(group.category.id)}
          className={`
            px-6 py-2.5 rounded-2xl text-[10px] font-black whitespace-nowrap transition-all uppercase tracking-[0.2em] border-2
            ${activeCategory === group.category.id
              ? "bg-slate-900 text-white border-slate-900 shadow-xl shadow-slate-200"
              : "bg-white text-slate-400 border-slate-50 hover:border-slate-200 hover:text-slate-600"
            }
          `}
        >
          {group.category.name}
        </button>
      ))}
    </div>
  );
};

export default CategoryNav;