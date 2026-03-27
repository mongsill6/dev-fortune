import React, { useState, useEffect } from 'react';

const SearchBar = ({
  value = '',
  onChange,
  onSearch,
  lang = 'en',
  onLangChange,
}) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  // Debounce logic for search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (onSearch) {
        onSearch(debouncedValue);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [debouncedValue, onSearch]);

  // Update debounced value when external value changes
  useEffect(() => {
    setDebouncedValue(value);
  }, [value]);

  const handleChange = (e) => {
    const newValue = e.target.value;
    setDebouncedValue(newValue);
    if (onChange) {
      onChange(newValue);
    }
  };

  const handleClear = () => {
    setDebouncedValue('');
    if (onChange) {
      onChange('');
    }
  };

  const handleLangChange = (newLang) => {
    if (onLangChange) {
      onLangChange(newLang);
    }
  };

  // Language labels for dropdown
  const langLabels = {
    en: 'English',
    ko: '한국어',
    ja: '日本語',
  };

  return (
    <div className="w-full flex flex-col gap-3 sm:flex-row sm:items-center">
      {/* Search Input Container */}
      <div className="flex-1 relative">
        <div className="relative flex items-center">
          {/* Search Icon */}
          <svg
            className="absolute left-3 w-5 h-5 text-gray-400 dark:text-gray-500 pointer-events-none"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
          </svg>

          {/* Input Field */}
          <input
            type="text"
            value={debouncedValue}
            onChange={handleChange}
            placeholder="Search quotes or authors..."
            className="
              w-full pl-10 pr-10 py-2.5 rounded-lg
              border-2 border-gray-300 dark:border-gray-600
              bg-white dark:bg-gray-800
              text-gray-900 dark:text-gray-100
              placeholder-gray-500 dark:placeholder-gray-400
              transition-all duration-200
              focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200
              dark:focus:border-blue-400 dark:focus:ring-blue-900
              hover:border-gray-400 dark:hover:border-gray-500
            "
          />

          {/* Clear Button */}
          {debouncedValue && (
            <button
              onClick={handleClear}
              className="
                absolute right-3 p-1 text-gray-400 dark:text-gray-500
                hover:text-gray-600 dark:hover:text-gray-300
                transition-colors duration-200
                focus:outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900
                rounded
              "
              aria-label="Clear search"
            >
              <svg
                className="w-5 h-5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Language Selector */}
      <div className="flex items-center gap-2">
        <label htmlFor="language-select" className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
          Language:
        </label>
        <select
          id="language-select"
          value={lang}
          onChange={(e) => handleLangChange(e.target.value)}
          className="
            px-3 py-2.5 rounded-lg
            border-2 border-gray-300 dark:border-gray-600
            bg-white dark:bg-gray-800
            text-gray-900 dark:text-gray-100
            transition-all duration-200
            focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200
            dark:focus:border-blue-400 dark:focus:ring-blue-900
            hover:border-gray-400 dark:hover:border-gray-500
            cursor-pointer
            appearance-none
            pr-8
            bg-no-repeat
            bg-right
            bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%236b7280%22 stroke-width=%222%22><polyline points=%226 9 12 15 18 9%22></polyline></svg>')]
            dark:bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%229ca3af%22 stroke-width=%222%22><polyline points=%226 9 12 15 18 9%22></polyline></svg>')]
          "
        >
          <option value="en">{langLabels.en}</option>
          <option value="ko">{langLabels.ko}</option>
          <option value="ja">{langLabels.ja}</option>
        </select>
      </div>
    </div>
  );
};

export default SearchBar;
