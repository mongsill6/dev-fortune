const emojiMap = {
  debugging: '🐛',
  architecture: '🏗️',
  teamwork: '👥',
  motivation: '💪',
  humor: '😄',
};

const styles = {
  debugging: {
    active: 'bg-red-500 text-white border-red-500',
    inactive: 'border-red-300 text-red-700 dark:border-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-950',
  },
  architecture: {
    active: 'bg-blue-500 text-white border-blue-500',
    inactive: 'border-blue-300 text-blue-700 dark:border-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950',
  },
  teamwork: {
    active: 'bg-green-500 text-white border-green-500',
    inactive: 'border-green-300 text-green-700 dark:border-green-700 dark:text-green-300 hover:bg-green-50 dark:hover:bg-green-950',
  },
  motivation: {
    active: 'bg-purple-500 text-white border-purple-500',
    inactive: 'border-purple-300 text-purple-700 dark:border-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950',
  },
  humor: {
    active: 'bg-amber-500 text-white border-amber-500',
    inactive: 'border-amber-300 text-amber-700 dark:border-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950',
  },
};

const fallback = {
  active: 'bg-gray-500 text-white border-gray-500',
  inactive: 'border-gray-300 text-gray-700 dark:border-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800',
};

export default function CategoryFilter({ categories = [], selected, onSelect }) {
  return (
    <div className="overflow-x-auto">
      <div className="flex gap-2 pb-2">
        <button
          onClick={() => onSelect(null)}
          className={`px-4 py-2 rounded-full text-sm font-medium border-2 whitespace-nowrap transition-all duration-200 ${
            selected === null
              ? 'bg-gray-800 text-white border-gray-800 dark:bg-white dark:text-gray-900 dark:border-white'
              : 'border-gray-300 text-gray-600 dark:border-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          All
        </button>
        {categories.map((cat) => {
          const s = styles[cat.id] || fallback;
          const isActive = selected === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => onSelect(cat.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium border-2 whitespace-nowrap transition-all duration-200 flex items-center gap-1.5 ${
                isActive ? s.active : s.inactive
              }`}
            >
              <span>{emojiMap[cat.id] || '✨'}</span>
              <span>{cat.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
