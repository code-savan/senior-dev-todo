import { motion } from 'framer-motion';
import { FaTrash, FaEdit, FaStar } from 'react-icons/fa';
import { useState } from 'react';

type Todo = {
  id: number;
  text: string;
  completed: boolean;
  category?: string;
  priority?: 'low' | 'medium' | 'high';
};

type TodoItemProps = {
  todo: Todo;
  toggleTodo: (id: number) => void;
  deleteTodo: (id: number) => void;
  editTodo: (id: number, text: string) => void;
  togglePriority: (id: number) => void;
};

export default function TodoItem({ todo, toggleTodo, deleteTodo, editTodo, togglePriority }: TodoItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(todo.text);

  const handleEdit = () => {
    if (isEditing) {
      editTodo(todo.id, editText);
      setIsEditing(false);
    } else {
      setIsEditing(true);
    }
  };

  const getColor = (category?: string) => {
    if (!category) return 'bg-gray-200 text-gray-700';

    switch (category.toLowerCase()) {
      case 'work': return 'bg-blue-100 text-blue-700';
      case 'personal': return 'bg-purple-100 text-purple-700';
      case 'shopping': return 'bg-green-100 text-green-700';
      case 'health': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-200 text-gray-700';
    }
  };

  const priorityIcon = todo.priority === 'high' ? (
    <motion.span
      whileHover={{ scale: 1.2 }}
      className="text-warning"
      onClick={() => togglePriority(todo.id)}
    >
      <FaStar />
    </motion.span>
  ) : null;

  return (
    <motion.div
      className="todo-item group"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: 20 }}
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.2 }}
      layout
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <input
          type="checkbox"
          checked={todo.completed}
          onChange={() => toggleTodo(todo.id)}
          className="todo-checkbox"
        />

        {isEditing ? (
          <input
            type="text"
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            className="todo-input flex-1"
            autoFocus
            onBlur={handleEdit}
            onKeyDown={(e) => e.key === 'Enter' && handleEdit()}
          />
        ) : (
          <div className="flex items-center min-w-0">
            <span
              className={`${
                todo.completed ? 'line-through text-gray-500' : 'text-gray-800'
              } truncate flex-1 transition-all duration-200`}
            >
              {todo.text}
            </span>
            {priorityIcon}
            {todo.category && (
              <span className={`category-badge ${getColor(todo.category)}`}>
                {todo.category}
              </span>
            )}
          </div>
        )}
      </div>

      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleEdit}
          className="p-1.5 rounded-full text-info hover:bg-info/10 transition-colors"
        >
          <FaEdit />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => deleteTodo(todo.id)}
          className="p-1.5 rounded-full text-error hover:bg-error/10 transition-colors"
        >
          <FaTrash />
        </motion.button>
      </div>
    </motion.div>
  );
}
