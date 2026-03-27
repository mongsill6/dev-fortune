import React, { useEffect, useRef } from 'react';
import QuoteCard from './QuoteCard';

export default function QuoteList({ quotes, loading, hasMore, onLoadMore }) {
  const sentinelRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          onLoadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (sentinelRef.current) {
      observer.observe(sentinelRef.current);
    }

    return () => {
      if (sentinelRef.current) {
        observer.unobserve(sentinelRef.current);
      }
    };
  }, [hasMore, loading, onLoadMore]);

  const isEmpty = quotes.length === 0 && !loading;

  return (
    <div className="w-full">
      {isEmpty ? (
        <div className="flex items-center justify-center min-h-96">
          <p className="text-lg text-gray-500 dark:text-gray-400">
            No quotes found
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
          {quotes.map((quote, index) => (
            <div
              key={quote.id || index}
              style={{
                animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`,
              }}
            >
              <QuoteCard
                quote={quote.quote}
                by={quote.by}
                category={quote.category}
                id={quote.id}
                animate
              />
            </div>
          ))}
        </div>
      )}

      {/* Sentinel element for infinite scroll */}
      <div ref={sentinelRef} className="py-8" />

      {/* Loading spinner */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin">
            <div className="h-10 w-10 border-4 border-gray-300 dark:border-gray-600 border-t-blue-500 dark:border-t-blue-400 rounded-full" />
          </div>
        </div>
      )}

      {/* CSS for staggered animation */}
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
