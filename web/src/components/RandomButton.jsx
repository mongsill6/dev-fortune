import React from 'react';

export default function RandomButton({ onClick, loading = false }) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={`
        relative px-8 py-4 rounded-full font-semibold text-lg
        bg-gradient-to-r from-purple-500 to-blue-500
        dark:from-purple-600 dark:to-blue-600
        text-white shadow-lg
        transition-all duration-200 ease-out
        hover:scale-105 hover:from-purple-400 hover:to-blue-400
        dark:hover:from-purple-500 dark:hover:to-blue-500
        active:scale-95
        disabled:opacity-75 disabled:cursor-not-allowed disabled:hover:scale-100
        focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2
        dark:focus:ring-offset-gray-900
      `}
    >
      <div className="flex items-center justify-center gap-2">
        {/* Dice/Shuffle Icon */}
        <svg
          className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`}
          fill="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Dice cube */}
          <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 9h-4v4h4v-4zm5-9v4h-4V3h4zm-9 0v4H5V3h5zm0 14v-4h4v4h-4zm5 0v-4h4v4h-4zm5-9h-4v4h4v-4zm0 9h-4v-4h4v4z" />
        </svg>
        {/* Button Text */}
        <span>{loading ? '🎲 Surprise Me!' : 'Random Quote'}</span>
      </div>
    </button>
  );
}
