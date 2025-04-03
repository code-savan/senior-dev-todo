import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTag } from 'react-icons/fa';

type CategorySelectorProps = {
  onCategorySelect: (category: string) => void;
  selectedCategory?: string;
};

const categories = [
  { id: 'work', name: 'Work', color: 'bg-blue-100 text-blue-700' },
  { id: 'personal', name: 'Personal', color: 'bg-purple-100 text-purple-700' },
  { id: 'shopping', name: 'Shopping', color: 'bg-green-100 text-green-700' },
  { id: 'health', name: 'Health', color: 'bg-red-100 text-red-700' },
];

export default function CategorySelector({ onCategorySelect, selectedCategory }: CategorySelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="emoji-btn flex items-center gap-1"
        aria-label="Select category"
      >
        <FaTag className={selectedCategory ? 'text-primary' : 'text-gray-500'} />
        {selectedCategory && (
          <span className="text-xs font-medium text-gray-500">{selectedCategory}</span>
        )}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="absolute left-0 z-10 mt-2 w-48 rounded-xl bg-white shadow-lg border border-gray-200"
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.2 }}
          >
            <div className="p-2 space-y-1">
              {categories.map((category) => (
                <motion.button
                  key={category.id}
                  whileHover={{ x: 2 }}
                  onClick={() => {
                    onCategorySelect(category.id);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg flex items-center justify-between ${
                    selectedCategory === category.id
                      ? 'bg-gray-100'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <span>{category.name}</span>
                  <span className={`w-3 h-3 rounded-full ${category.color.split(' ')[0]}`}></span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
