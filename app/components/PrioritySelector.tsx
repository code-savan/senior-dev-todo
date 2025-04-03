import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaStar } from 'react-icons/fa';

type PrioritySelectorProps = {
  onPrioritySelect: (priority: 'low' | 'medium' | 'high') => void;
  selectedPriority?: 'low' | 'medium' | 'high';
};

const priorities = [
  { id: 'low', name: 'Low', color: 'text-gray-500' },
  { id: 'medium', name: 'Medium', color: 'text-blue-500' },
  { id: 'high', name: 'High', color: 'text-warning' },
];

export default function PrioritySelector({ onPrioritySelect, selectedPriority }: PrioritySelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const getStarColor = () => {
    if (!selectedPriority) return 'text-gray-500';

    switch (selectedPriority) {
      case 'low': return 'text-gray-500';
      case 'medium': return 'text-blue-500';
      case 'high': return 'text-warning';
      default: return 'text-gray-500';
    }
  };

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="emoji-btn"
        aria-label="Set priority"
      >
        <FaStar className={getStarColor()} />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="absolute right-0 z-10 mt-2 w-40 rounded-xl bg-white shadow-lg border border-gray-200"
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.2 }}
          >
            <div className="p-2 space-y-1">
              {priorities.map((priority) => (
                <motion.button
                  key={priority.id}
                  whileHover={{ x: 2 }}
                  onClick={() => {
                    onPrioritySelect(priority.id as 'low' | 'medium' | 'high');
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg flex items-center gap-2 ${
                    selectedPriority === priority.id
                      ? 'bg-gray-100'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <FaStar className={priority.color} />
                  <span>{priority.name}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
