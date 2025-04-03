'use client';

import { useState, useEffect } from 'react';
import {
  FaSearch, FaPlus, FaEdit, FaTrash, FaTimes, FaClock,
  FaCalendarAlt, FaHourglass, FaExclamationTriangle,
  FaRegCircle, FaCheckCircle, FaTag
} from 'react-icons/fa';

type Todo = {
  id: number;
  text: string;
  completed: boolean;
  category: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  hasTimer?: boolean;
  timerDuration?: number; // in minutes
  timerStarted?: number; // timestamp when timer started
  timerRemaining?: number; // in seconds
  isExpired?: boolean;
};

// Sample data with enhanced time features
const getSampleTodos = (currentDate: string): Todo[] => [
  {
    id: 1,
    text: 'Team Meeting',
    completed: false,
    category: 'meeting',
    description: 'Lorem ipsum dolor sit amet, consectetur elit lddv norem idjsfjf.',
    date: currentDate,
    startTime: '10:30',
    endTime: '12:00',
    isExpired: false
  },
  {
    id: 2,
    text: 'Work on Branding',
    completed: false,
    category: 'branding',
    description: 'Lorem ipsum dolor sit amet, consectetur elit lddv norem idjsfjf.',
    date: currentDate,
    startTime: '13:00',
    endTime: '15:00',
    isExpired: false
  },
  {
    id: 3,
    text: 'Make a Report for client',
    completed: false,
    category: 'client',
    description: 'Lorem ipsum dolor sit amet, consectetur elit lddv norem idjsfjf.',
    date: currentDate,
    startTime: '15:30',
    endTime: '17:00',
    isExpired: false
  },
  {
    id: 4,
    text: 'Create a planer',
    completed: false,
    category: 'planer',
    description: 'Lorem ipsum dolor sit amet, consectetur elit lddv norem idjsfjf.',
    date: formatDate(new Date(Date.now() - 86400000)), // Yesterday
    startTime: '09:00',
    endTime: '11:00',
    isExpired: true
  },
  {
    id: 5,
    text: 'Create Treatment Plan',
    completed: false,
    category: 'treatment',
    description: 'Lorem ipsum dolor sit amet, consectetur elit lddv norem idjsfjf.',
    date: formatDate(new Date(Date.now() + 86400000)), // Tomorrow
    startTime: '10:30',
    endTime: '12:00',
    isExpired: false,
    hasTimer: true,
    timerDuration: 45,
    timerRemaining: 45 * 60
  }
];

// Format date as YYYY-MM-DD for input fields
function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export default function Home() {
  const [activeTab, setActiveTab] = useState('active');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddTodo, setShowAddTodo] = useState(false);
  const [newTodoTitle, setNewTodoTitle] = useState('');
  const [newTodoDescription, setNewTodoDescription] = useState('');
  const [newTodoCategory, setNewTodoCategory] = useState('meeting');
  const [newTodoDate, setNewTodoDate] = useState(formatDate(new Date()));
  const [newTodoStartTime, setNewTodoStartTime] = useState('10:30');
  const [newTodoEndTime, setNewTodoEndTime] = useState('12:00');
  const [newTodoHasTimer, setNewTodoHasTimer] = useState(false);
  const [newTodoTimerDuration, setNewTodoTimerDuration] = useState(15); // Default 15 minutes
  const [currentDate, setCurrentDate] = useState(formatDate(new Date()));
  const [todos, setTodos] = useState<Todo[]>([]);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [selectedDate, setSelectedDate] = useState(currentDate);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [previewTodo, setPreviewTodo] = useState<Todo | null>(null);

  // Load todos from localStorage on initial render
  useEffect(() => {
    const loadTodos = () => {
      if (typeof window !== 'undefined') {
        setIsLoading(true);
        try {
          const storedTodos = localStorage.getItem('todos');
          if (storedTodos) {
            setTodos(JSON.parse(storedTodos));
          } else {
            // Initialize with sample data if no todos stored
            const sampleTodos = getSampleTodos(currentDate);
            setTodos(sampleTodos);
            localStorage.setItem('todos', JSON.stringify(sampleTodos));
          }
        } catch (error) {
          console.error('Error loading todos from localStorage:', error);
          setTodos(getSampleTodos(currentDate));
        }
        setIsInitialized(true);
        setIsLoading(false);
      }
    };

    loadTodos();
  }, [currentDate]);

  // Save todos to localStorage whenever they change
  useEffect(() => {
    if (isInitialized && typeof window !== 'undefined') {
      localStorage.setItem('todos', JSON.stringify(todos));
    }
  }, [todos, isInitialized]);

  // Format date for display
  function formatDateForDisplay(dateStr: string): string {
    const date = new Date(dateStr);
    const today = new Date();

    // Check if date is today
    if (date.toDateString() === today.toDateString()) {
      return "Today";
    }

    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }

  // Get the remaining time in hh:mm format
  function getRemainingTime(todo: Todo): string {
    if (!todo.timerRemaining) return '00:00';

    const minutes = Math.floor(todo.timerRemaining / 60);
    const seconds = todo.timerRemaining % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  // Check if a todo is expired (past due date or time)
  function checkIfExpired(todo: Todo): boolean {
    const today = new Date();
    const todoDate = new Date(todo.date);

    // Different day and in the past
    if (todoDate.toDateString() !== today.toDateString() && todoDate < today) {
      return true;
    }

    // Same day but end time has passed
    if (todoDate.toDateString() === today.toDateString()) {
      const [hours, minutes] = todo.endTime.split(':').map(Number);
      const endTimeToday = new Date();
      endTimeToday.setHours(hours, minutes, 0);

      if (endTimeToday < today) {
        return true;
      }
    }

    return false;
  }

  // Get category label
  function getCategoryLabel(category: string): string {
    const categoryMap: Record<string, string> = {
      'meeting': 'Meeting',
      'branding': 'Branding',
      'client': 'Client',
      'planer': 'Planer',
      'treatment': 'Treatment'
    };

    return categoryMap[category] || category;
  }

  // Check for expired todos every minute
  useEffect(() => {
    if (!isInitialized) return;

    const checkExpiredTodos = () => {
      setTodos(prevTodos =>
        prevTodos.map(todo => ({
          ...todo,
          isExpired: !todo.completed && checkIfExpired(todo)
        }))
      );
    };

    // Run once at start
    checkExpiredTodos();

    // Then set interval
    const intervalId = setInterval(checkExpiredTodos, 60000);

    return () => clearInterval(intervalId);
  }, [isInitialized]);

  // Update timers every second
  useEffect(() => {
    if (!isInitialized) return;

    const updateTimers = () => {
      const now = Date.now();
      let updated = false;

      setTodos(prevTodos => {
        return prevTodos.map(todo => {
          // Only update if timer is running (has a start timestamp)
          if (todo.hasTimer && todo.timerStarted && todo.timerRemaining !== undefined) {
            // Calculate elapsed time since timer was started/continued
            const elapsed = Math.floor((now - todo.timerStarted) / 1000);
            // Calculate new remaining time by subtracting elapsed time from the current remaining time
            const newRemaining = Math.max(0, todo.timerRemaining - elapsed);

            // Only update if the time has actually changed
            if (newRemaining !== todo.timerRemaining) {
              updated = true;

              // If timer reached zero, stop it
              if (newRemaining === 0) {
                return {
                  ...todo,
                  timerRemaining: 0,
                  timerStarted: undefined
                };
              }

              return {
                ...todo,
                timerRemaining: newRemaining,
                // Keep the timer running by updating the start time to now
                // This prevents small drifts over time
                timerStarted: now
              };
            }
          }
          return todo;
        });
      });

      return updated;
    };

    const intervalId = setInterval(() => {
      const updated = updateTimers();
      if (!updated) {
        // Only force re-render if something changed
        setCurrentDate(formatDate(new Date()));
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, [isInitialized]);

  // Close modal when Escape key is pressed
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && showAddTodo) {
        setShowAddTodo(false);
      }
    };

    document.addEventListener('keydown', handleEscKey);

    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [showAddTodo]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (showAddTodo) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [showAddTodo]);

  // Filter todos based on active tab, search query, and selected date
  const filteredTodos = todos.filter(todo => {
    // Tab filter (active/completed)
    const matchesTab = (activeTab === 'active' && !todo.completed) ||
                      (activeTab === 'completed' && todo.completed);

    // Search filter
    const matchesSearch = searchQuery === '' ||
      todo.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      todo.description.toLowerCase().includes(searchQuery.toLowerCase());

    // Date filter
    const matchesDate = todo.date === selectedDate;

    return matchesTab && matchesSearch && matchesDate;
  });

  // Notification state
  const [notification, setNotification] = useState<{message: string, type: 'success'|'error'|'loading'}|null>(null);

  // Show notification
  const showNotification = (message: string, type: 'success'|'error'|'loading' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleAddTodo = () => {
    if (!newTodoTitle.trim()) return;

    showNotification('Adding task...', 'loading');

    const newTodo: Todo = {
      id: Date.now(),
      text: newTodoTitle,
      completed: false,
      category: newTodoCategory,
      description: newTodoDescription || 'No description provided.',
      date: newTodoDate,
      startTime: newTodoStartTime,
      endTime: newTodoEndTime,
      isExpired: false
    };

    // Add timer if enabled
    if (newTodoHasTimer) {
      newTodo.hasTimer = true;
      newTodo.timerDuration = newTodoTimerDuration;
      newTodo.timerRemaining = newTodoTimerDuration * 60;
    }

    const updatedTodos = [...todos, newTodo];
    setTodos(updatedTodos);

    // Save to localStorage immediately
    if (typeof window !== 'undefined') {
      localStorage.setItem('todos', JSON.stringify(updatedTodos));
      showNotification('Task added successfully!');
    }

    resetFormAndCloseModal();
  };

  const handleDeleteTodo = (id: number) => {
    showNotification('Deleting task...', 'loading');

    const updatedTodos = todos.filter(todo => todo.id !== id);
    setTodos(updatedTodos);

    // Save to localStorage immediately
    if (typeof window !== 'undefined') {
      localStorage.setItem('todos', JSON.stringify(updatedTodos));
      showNotification('Task deleted successfully!');
    }
  };

  const handleEditTodo = (todo: Todo) => {
    setEditingTodo(todo);
    setNewTodoTitle(todo.text);
    setNewTodoDescription(todo.description);
    setNewTodoCategory(todo.category);
    setNewTodoDate(todo.date);
    setNewTodoStartTime(todo.startTime);
    setNewTodoEndTime(todo.endTime);
    setNewTodoHasTimer(todo.hasTimer || false);
    setNewTodoTimerDuration(todo.timerDuration || 15);
    setShowAddTodo(true);
  };

  const handleUpdateTodo = () => {
    if (!editingTodo || !newTodoTitle.trim()) return;

    showNotification('Updating task...', 'loading');

    const updatedTodos = todos.map(todo =>
      todo.id === editingTodo.id
        ? {
            ...todo,
            text: newTodoTitle,
            description: newTodoDescription,
            category: newTodoCategory,
            date: newTodoDate,
            startTime: newTodoStartTime,
            endTime: newTodoEndTime,
            hasTimer: newTodoHasTimer,
            timerDuration: newTodoTimerDuration,
            timerRemaining: newTodoHasTimer
              ? (todo.timerStarted ? todo.timerRemaining : newTodoTimerDuration * 60)
              : undefined,
            isExpired: checkIfExpired({
              ...todo,
              date: newTodoDate,
              endTime: newTodoEndTime
            })
          }
        : todo
    );

    setTodos(updatedTodos);

    // Save to localStorage immediately
    if (typeof window !== 'undefined') {
      localStorage.setItem('todos', JSON.stringify(updatedTodos));
      showNotification('Task updated successfully!');
    }

    resetFormAndCloseModal();
  };

  const resetFormAndCloseModal = () => {
    setEditingTodo(null);
    setNewTodoTitle('');
    setNewTodoDescription('');
    setNewTodoDate(formatDate(new Date()));
    setNewTodoStartTime('10:30');
    setNewTodoEndTime('12:00');
    setNewTodoHasTimer(false);
    setNewTodoTimerDuration(15);
    setShowAddTodo(false);
  };

  const openModal = () => {
    setEditingTodo(null);
    setNewTodoTitle('');
    setNewTodoDescription('');
    setNewTodoCategory('meeting');
    setNewTodoDate(formatDate(new Date()));
    setNewTodoStartTime('10:30');
    setNewTodoEndTime('12:00');
    setNewTodoHasTimer(false);
    setNewTodoTimerDuration(15);
    setShowAddTodo(true);
  };

  const toggleTimer = (id: number) => {
    const now = Date.now();

    setTodos(prevTodos => {
      const updatedTodos = prevTodos.map(todo => {
        if (todo.id === id && todo.hasTimer) {
          // If timer already started, pause it
          if (todo.timerStarted) {
            // Calculate remaining time when paused
            const elapsed = Math.floor((now - todo.timerStarted) / 1000);
            const newRemaining = Math.max(0, todo.timerRemaining! - elapsed);

            return {
              ...todo,
              timerStarted: undefined,
              timerRemaining: newRemaining
            };
          } else {
            // Start/continue timer from the current remaining time
            // If timer is at 0 or undefined, reset to full duration
            const remaining =
              todo.timerRemaining === undefined || todo.timerRemaining <= 0
                ? todo.timerDuration! * 60
                : todo.timerRemaining;

            return {
              ...todo,
              timerStarted: now,
              timerRemaining: remaining
            };
          }
        }
        return todo;
      });

      // Save to localStorage immediately
      if (typeof window !== 'undefined') {
        localStorage.setItem('todos', JSON.stringify(updatedTodos));
      }

      return updatedTodos;
    });
  };

  const resetTimer = (id: number) => {
    setTodos(prevTodos => {
      const updatedTodos = prevTodos.map(todo => {
        if (todo.id === id && todo.hasTimer) {
          return {
            ...todo,
            timerStarted: undefined,
            timerRemaining: todo.timerDuration ? todo.timerDuration * 60 : 0
          };
        }
        return todo;
      });

      // Save to localStorage immediately
      if (typeof window !== 'undefined') {
        localStorage.setItem('todos', JSON.stringify(updatedTodos));
      }

      return updatedTodos;
    });
  };

  const addOneMinute = (id: number) => {
    setTodos(prevTodos => {
      const updatedTodos = prevTodos.map(todo => {
        if (todo.id === id && todo.hasTimer) {
          return {
            ...todo,
            timerRemaining: todo.timerRemaining! + 60
          };
        }
        return todo;
      });

      // Save to localStorage immediately
      if (typeof window !== 'undefined') {
        localStorage.setItem('todos', JSON.stringify(updatedTodos));
      }

      return updatedTodos;
    });
  };

  const quitTimer = (id: number) => {
    setTodos(prevTodos => {
      const updatedTodos = prevTodos.map(todo => {
        if (todo.id === id && todo.hasTimer) {
          return {
            ...todo,
            hasTimer: false,
            timerStarted: undefined,
            timerRemaining: undefined,
            timerDuration: undefined
          };
        }
        return todo;
      });

      // Save to localStorage immediately
      if (typeof window !== 'undefined') {
        localStorage.setItem('todos', JSON.stringify(updatedTodos));
      }

      return updatedTodos;
    });
  };

  const categoryOptions = [
    { value: 'meeting', label: 'Meeting' },
    { value: 'branding', label: 'Branding' },
    { value: 'client', label: 'Client' },
    { value: 'planer', label: 'Planer' },
    { value: 'treatment', label: 'Treatment' }
  ];

  // Add scroll event listener to handle modal header styling
  useEffect(() => {
    const handleModalScroll = (event: Event) => {
      const target = event.target as HTMLElement;
      if (target && target.classList.contains('modal-content')) {
        if (target.scrollTop > 10) {
          target.classList.add('scrolled');
        } else {
          target.classList.remove('scrolled');
        }
      }
    };

    // Add the event listener to all modal elements
    const modalElements = document.querySelectorAll('.modal-content');
    modalElements.forEach(modal => {
      modal.addEventListener('scroll', handleModalScroll);
    });

    return () => {
      // Cleanup
      const modalElements = document.querySelectorAll('.modal-content');
      modalElements.forEach(modal => {
        modal.removeEventListener('scroll', handleModalScroll);
      });
    };
  }, [showAddTodo, previewTodo]);

  return (
    <>
    <div className="main-content">
      {/* Safe area padding for iOS devices */}
      <div className="sm:hidden h-safe-top"></div>

      {/* iOS-style Header for Mobile */}
      <div className="sm:hidden mb-5 pt-2">
        <h1 className="text-2xl font-bold text-center text-gray-800">Todo List</h1>
      </div>

      {/* iOS-style Pull to Refresh Indicator (visual only) */}
      <div className="sm:hidden pointer-events-none flex items-center justify-center h-6 mb-2">
        <div className="text-xs text-gray-400">Pull to refresh</div>
      </div>

      {/* Desktop Header */}
      <div className="hidden sm:flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold text-gray-800">Todo List</h1>
        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none sm:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search tasks..."
              className="search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button
            className="add-button whitespace-nowrap"
            onClick={openModal}
          >
            <FaPlus className="text-sm" />
            <span className="hidden sm:inline">Add Task</span>
            <span className="sm:hidden">Add</span>
          </button>
        </div>
      </div>

      {/* Mobile Search */}
      <div className="sm:hidden mb-5">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaSearch className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search tasks..."
            className="search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Notification */}
      {notification && (
        <div
          className={`fixed top-4 right-4 px-4 py-3 rounded-lg shadow-lg transition-all duration-300 transform animate-fade-in z-50 ${
            notification.type === 'success' ? 'bg-green-100 text-green-800' : notification.type === 'error' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
          }`}
        >
          <div className="flex items-center">
            {notification.type === 'success' ? (
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            ) : notification.type === 'error' ? (
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            ) : (
              <div className="animate-spin rounded-full h-5 w-5 border-t-4 border-b-4 border-gray-500"></div>
            )}
            <span className="font-medium">{notification.message}</span>
          </div>
        </div>
      )}

      {/* Date Selection */}
      <div className="flex items-center mb-6">
        <div className="date-select-wrapper">
          <FaCalendarAlt className="text-gray-500 mr-3" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="date-picker"
          />
        </div>
        <div className="ml-4 text-sm text-gray-500">
          {formatDateForDisplay(selectedDate)}
        </div>
      </div>

      {/* Desktop Tabs */}
      <div className="hidden sm:block border-b border-gray-200 mb-8">
        <div className="flex space-x-8">
          <button
            className={`tab-button ${activeTab === 'active' ? 'active' : ''}`}
            onClick={() => setActiveTab('active')}
          >
            Active Tasks
          </button>
          <button
            className={`tab-button ${activeTab === 'completed' ? 'active' : ''}`}
            onClick={() => setActiveTab('completed')}
          >
            Completed
          </button>
        </div>
      </div>

      {/* Mobile Tabs Pills */}
      <div className="sm:hidden mb-5">
        <div className="flex bg-gray-100 p-1 rounded-full">
          <button
            className={`flex-1 py-2 text-sm font-medium rounded-full ${activeTab === 'active' ? 'bg-white shadow text-primary' : 'text-gray-500'}`}
            onClick={() => setActiveTab('active')}
          >
            Active
          </button>
          <button
            className={`flex-1 py-2 text-sm font-medium rounded-full ${activeTab === 'completed' ? 'bg-white shadow text-primary' : 'text-gray-500'}`}
            onClick={() => setActiveTab('completed')}
          >
            Completed
          </button>
        </div>
      </div>

      {/* Todo Cards Grid */}
      {isLoading ? (
        <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="text-gray-400 mb-3">
            <svg className="w-16 h-16 mx-auto animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <p className="text-gray-500 font-medium">Loading tasks...</p>
          <p className="text-sm text-gray-400 mt-2">Please wait while we retrieve your tasks</p>
        </div>
      ) : filteredTodos.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="text-gray-400 mb-3">
            <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <p className="text-gray-500 font-medium">No tasks found</p>
          <p className="text-sm text-gray-400 mt-2">
            {searchQuery
              ? 'Try a different search term'
              : `No ${activeTab} tasks available for ${formatDateForDisplay(selectedDate)}`}
          </p>
          <button
            className="mt-6 px-5 py-2 bg-gray-50 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors"
            onClick={openModal}
          >
            Add a task
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTodos.map(todo => (
            <div
              key={todo.id}
              className={`todo-item-card ${todo.category} ${todo.isExpired && !todo.completed ? 'expired' : ''} ${todo.completed ? 'completed' : ''}`}
              onClick={() => setPreviewTodo(todo)}
            >
              {/* Card Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start flex-1 min-w-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setTodos(
                        todos.map(t => {
                          if (t.id === todo.id) {
                            const completed = !t.completed;
                            // Reset timer if task is completed
                            if (completed && t.hasTimer) {
                              return {
                                ...t,
                                completed,
                                isExpired: false,
                                timerStarted: undefined,
                                timerRemaining: 0
                              };
                            }
                            return { ...t, completed, isExpired: false };
                          }
                          return t;
                        })
                      );
                    }}
                    className="mt-1 mr-3 text-gray-400 hover:text-primary transition-colors"
                    aria-label={todo.completed ? "Mark as incomplete" : "Mark as complete"}
                  >
                    {todo.completed ?
                      <FaCheckCircle className="text-primary text-lg" /> :
                      <FaRegCircle className="text-lg" />
                    }
                  </button>
                  <div className="flex-1 min-w-0">
                    <h3 className="todo-title">
                      {todo.text}
                      {todo.isExpired && !todo.completed && (
                        <FaExclamationTriangle className="text-red-500 ml-2 flex-shrink-0" title="Task has expired" />
                      )}
                    </h3>

                    {/* Category and Time Row */}
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <span className={`category-badge ${todo.category}`}>
                        <FaTag className="mr-1 text-xs" />
                        {getCategoryLabel(todo.category)}
                      </span>

                      <span className="time-display">
                        <FaClock className="mr-1 text-xs" />
                        {todo.startTime} - {todo.endTime}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center ml-2">
                  <button
                    className="card-menu-button mr-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditTodo(todo);
                    }}
                    aria-label="Edit"
                  >
                    <FaEdit />
                  </button>
                  <button
                    className="card-menu-button text-red-500 hover:text-red-700"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteTodo(todo.id);
                    }}
                    aria-label="Delete"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>

              {/* Description */}
              <p className="todo-card-content line-clamp-2">{todo.description}</p>

              {/* Timer Section */}
              {todo.hasTimer && (
                <div className={`timer-section ${!todo.timerStarted && todo.timerRemaining && todo.timerRemaining < todo.timerDuration! * 60 ? 'paused' : ''}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <FaHourglass className={`${todo.timerStarted ? 'text-green-500' : (!todo.timerStarted && todo.timerRemaining && todo.timerRemaining < todo.timerDuration! * 60) ? 'text-amber-500' : 'text-gray-500'} mr-2`} />
                      <span className="font-mono font-medium text-sm">{getRemainingTime(todo)}</span>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleTimer(todo.id);
                        }}
                        className={`timer-button ${todo.timerStarted ? 'pause' : (todo.timerRemaining && todo.timerRemaining < todo.timerDuration! * 60) ? 'continue' : 'start'}`}
                      >
                        {todo.timerStarted
                          ? 'Pause'
                          : (todo.timerRemaining && todo.timerRemaining < todo.timerDuration! * 60)
                            ? 'Continue'
                            : 'Start'}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          resetTimer(todo.id);
                        }}
                        className="timer-button reset"
                      >
                        Reset
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          addOneMinute(todo.id);
                        }}
                        className="timer-button bg-blue-100 text-blue-800 hover:bg-blue-200"
                      >
                        +1m
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          quitTimer(todo.id);
                        }}
                        className="timer-button bg-red-100 text-red-800 hover:bg-red-200"
                      >
                        Quit
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Footer with Date */}
              <p className="todo-card-time">{formatDateForDisplay(todo.date)}</p>
            </div>
          ))}
        </div>
      )}

      {/* Preview Modal */}
      {previewTodo && (
        <div className="modal-overlay" onClick={() => setPreviewTodo(null)}>
          <div className="modal-content modal-enter-active sm:rounded-2xl" onClick={(e) => e.stopPropagation()}>
            {/* iOS style mobile handle */}
            <div className="sm:hidden w-12 h-1 bg-gray-200 rounded-full mb-2 mx-auto"></div>

            <div className="modal-header">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-800">
                  Task Details
                </h2>
                <button
                  className="modal-close-button"
                  onClick={() => setPreviewTodo(null)}
                  aria-label="Close"
                >
                  <FaTimes />
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <div className="mb-3">
                <h3 className="text-lg font-bold text-gray-800 mb-2">{previewTodo.text}</h3>
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className={`category-badge ${previewTodo.category}`}>
                    <FaTag className="mr-1 text-xs" />
                    {getCategoryLabel(previewTodo.category)}
                  </span>
                  <span className={`px-2 py-1 rounded text-xs ${previewTodo.completed ? 'bg-green-100 text-green-800' : previewTodo.isExpired ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>
                    {previewTodo.completed ? 'Completed' : previewTodo.isExpired ? 'Expired' : 'Active'}
                  </span>
                </div>
              </div>

              <div className="bg-gray-50 p-3 rounded-lg">
                <h4 className="font-medium text-gray-700 mb-1">Description</h4>
                <p className="text-gray-600">{previewTodo.description}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <h4 className="font-medium text-gray-700 mb-1">Date</h4>
                  <p className="text-gray-600">{formatDateForDisplay(previewTodo.date)}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <h4 className="font-medium text-gray-700 mb-1">Time</h4>
                  <p className="text-gray-600">{previewTodo.startTime} - {previewTodo.endTime}</p>
                </div>
              </div>

              {previewTodo.hasTimer && (
                <div className={`bg-gray-50 p-3 rounded-lg ${!previewTodo.timerStarted && previewTodo.timerRemaining && previewTodo.timerRemaining < previewTodo.timerDuration! * 60 ? 'bg-amber-50' : ''}`}>
                  <h4 className="font-medium text-gray-700 mb-1">Timer</h4>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <p className="text-gray-600">
                      Duration: {previewTodo.timerDuration} minutes<br />
                      Remaining: {getRemainingTime(previewTodo)}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => toggleTimer(previewTodo.id)}
                        className={`timer-button ${previewTodo.timerStarted ? 'pause' : (previewTodo.timerRemaining && previewTodo.timerRemaining < previewTodo.timerDuration! * 60) ? 'continue' : 'start'}`}
                      >
                        {previewTodo.timerStarted
                          ? 'Pause'
                          : (previewTodo.timerRemaining && previewTodo.timerRemaining < previewTodo.timerDuration! * 60)
                            ? 'Continue'
                            : 'Start'}
                      </button>
                      <button
                        onClick={() => resetTimer(previewTodo.id)}
                        className="timer-button reset"
                      >
                        Reset
                      </button>
                      <button
                        onClick={() => addOneMinute(previewTodo.id)}
                        className="timer-button bg-blue-100 text-blue-800 hover:bg-blue-200"
                      >
                        +1m
                      </button>
                      <button
                        onClick={() => quitTimer(previewTodo.id)}
                        className="timer-button bg-red-100 text-red-800 hover:bg-red-200"
                      >
                        Quit
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex space-x-3 pt-4 sticky bottom-0 bg-white pb-2">
                <button
                  onClick={() => {
                    handleEditTodo(previewTodo);
                    setPreviewTodo(null);
                  }}
                  className="add-button flex-1"
                >
                  Edit Task
                </button>
                <button
                  onClick={() => {
                    handleDeleteTodo(previewTodo.id);
                    setPreviewTodo(null);
                  }}
                  className="secondary-button flex-1 bg-red-50 text-red-700 hover:bg-red-100"
                >
                  Delete Task
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal for Add/Edit Task */}
      {showAddTodo && (
        <div className="modal-overlay" onClick={() => resetFormAndCloseModal()}>
          <div className="modal-content modal-enter-active sm:rounded-2xl" onClick={(e) => e.stopPropagation()}>
            {/* iOS style mobile handle */}
            <div className="sm:hidden w-12 h-1 bg-gray-200 rounded-full mb-5 mx-auto"></div>

            <div className="modal-header">
              <h2 className="text-xl font-semibold text-gray-800">
                {editingTodo ? 'Edit Task' : 'Add New Task'}
              </h2>
              <button
                className="modal-close-button"
                onClick={() => resetFormAndCloseModal()}
                aria-label="Close"
              >
                <FaTimes />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="todoTitle" className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  id="todoTitle"
                  value={newTodoTitle}
                  onChange={(e) => setNewTodoTitle(e.target.value)}
                  placeholder="Task title"
                  className="todo-input"
                  autoFocus
                />
              </div>
              <div>
                <label htmlFor="todoDescription" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  id="todoDescription"
                  value={newTodoDescription}
                  onChange={(e) => setNewTodoDescription(e.target.value)}
                  placeholder="Task description"
                  className="todo-input"
                  rows={3}
                />
              </div>
              <div>
                <label htmlFor="todoCategory" className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  id="todoCategory"
                  value={newTodoCategory}
                  onChange={(e) => setNewTodoCategory(e.target.value)}
                  className="todo-input"
                >
                  {categoryOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date and Time Fields */}
              <div>
                <label htmlFor="todoDate" className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  id="todoDate"
                  value={newTodoDate}
                  onChange={(e) => setNewTodoDate(e.target.value)}
                  className="todo-input"
                />
              </div>

              <div className="flex space-x-3">
                <div className="flex-1">
                  <label htmlFor="todoStartTime" className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                  <input
                    type="time"
                    id="todoStartTime"
                    value={newTodoStartTime}
                    onChange={(e) => setNewTodoStartTime(e.target.value)}
                    className="todo-input"
                  />
                </div>
                <div className="flex-1">
                  <label htmlFor="todoEndTime" className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                  <input
                    type="time"
                    id="todoEndTime"
                    value={newTodoEndTime}
                    onChange={(e) => setNewTodoEndTime(e.target.value)}
                    className="todo-input"
                  />
                </div>
              </div>

              {/* Timer Option */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                <div className="flex items-center mb-3">
                  <input
                    type="checkbox"
                    id="todoHasTimer"
                    checked={newTodoHasTimer}
                    onChange={(e) => setNewTodoHasTimer(e.target.checked)}
                    className="todo-checkbox"
                  />
                  <label htmlFor="todoHasTimer" className="ml-2 text-sm font-medium text-gray-700">
                    Add Countdown Timer
                  </label>
                </div>

                {newTodoHasTimer && (
                  <div>
                    <label htmlFor="todoTimerDuration" className="block text-sm font-medium text-gray-700 mb-1">
                      Timer Duration (minutes, max 60)
                    </label>
                    <input
                      type="number"
                      id="todoTimerDuration"
                      min="1"
                      max="60"
                      value={newTodoTimerDuration}
                      onChange={(e) => setNewTodoTimerDuration(Math.min(60, Math.max(1, parseInt(e.target.value) || 1)))}
                      className="todo-input"
                    />
                  </div>
                )}
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={editingTodo ? handleUpdateTodo : handleAddTodo}
                  className="add-button flex-1"
                >
                  {editingTodo ? 'Update' : 'Add'} Task
                </button>
                <button
                  onClick={() => resetFormAndCloseModal()}
                  className="secondary-button flex-1"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>

    {/* Mobile Bottom Navigation */}
    <div className="mobile-bottom-nav" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
      <button className="mobile-nav-button active">
        <FaCalendarAlt className="mobile-nav-icon" />
        <span className="mobile-nav-label">Today</span>
      </button>
      <button className="mobile-nav-button" onClick={openModal}>
        <div className="bg-primary w-12 h-12 rounded-full flex items-center justify-center text-white">
          <FaPlus />
        </div>
      </button>
      <button className="mobile-nav-button">
        <FaClock className="mobile-nav-icon" />
        <span className="mobile-nav-label">Timer</span>
      </button>
    </div>
    </>
  );
}
