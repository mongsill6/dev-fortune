import { useState } from 'react';

const categoryColors = {
  debugging: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
  architecture: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
  teamwork: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
  motivation: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300',
  humor: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
};

export default function QuoteCard({ quote, by, category, id, animate = false, featured = false }) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(`${quote} — ${by}`).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const badge = categoryColors[category] || categoryColors.motivation;

  return (
    <div
      key={id}
      className={[
        'group relative rounded-xl border border-gray-200 dark:border-gray-700',
        'bg-white dark:bg-gray-800 p-6 shadow-sm',
        'hover:shadow-lg hover:scale-[1.02] transition-all duration-300',
        featured ? 'ring-2 ring-purple-400 dark:ring-purple-600' : '',
        animate ? 'animate-[fadeIn_0.5s_ease-out]' : '',
      ].join(' ')}
    >
      {/* gradient top accent */}
      <div className="absolute inset-x-0 top-0 h-1 rounded-t-xl bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />

      {/* quotation mark */}
      <span className="block text-5xl leading-none text-blue-500/20 dark:text-purple-400/20 select-none mb-2">"</span>

      {/* quote */}
      <p className="text-lg md:text-xl font-medium text-gray-800 dark:text-gray-100 leading-relaxed mb-4">
        {quote}
      </p>

      {/* author + category */}
      <div className="flex items-center justify-between mt-auto">
        <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">— {by}</span>
        {category && (
          <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${badge}`}>
            {category}
          </span>
        )}
      </div>

      {/* copy button */}
      <button
        onClick={copyToClipboard}
        className="mt-4 w-full py-2 text-sm font-medium rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
      >
        {copied ? '✓ Copied!' : 'Copy Quote'}
      </button>
    </div>
  );
}
