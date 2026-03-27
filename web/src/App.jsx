import { useState, useEffect, useCallback } from 'react'
import { fetchRandom, fetchQuotes, fetchCategories, searchQuotes } from './api'
import QuoteCard from './components/QuoteCard'
import QuoteList from './components/QuoteList'
import CategoryFilter from './components/CategoryFilter'
import SearchBar from './components/SearchBar'
import RandomButton from './components/RandomButton'

function getInitialDarkMode() {
  const stored = localStorage.getItem('darkMode')
  if (stored !== null) return stored === 'true'
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

const LIMIT = 12

function App() {
  const [quotes, setQuotes] = useState([])
  const [randomQuote, setRandomQuote] = useState(null)
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [lang, setLang] = useState('en')
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [loading, setLoading] = useState(false)
  const [randomLoading, setRandomLoading] = useState(false)
  const [darkMode, setDarkMode] = useState(getInitialDarkMode)

  // Dark mode toggle
  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode)
    localStorage.setItem('darkMode', String(darkMode))
  }, [darkMode])

  // Load categories on mount
  useEffect(() => {
    fetchCategories()
      .then((res) => setCategories(res.data || []))
      .catch(console.error)
  }, [])

  // Fetch quotes
  const loadQuotes = useCallback(
    async (currentPage, reset = false) => {
      setLoading(true)
      try {
        let data
        if (searchQuery.trim()) {
          const res = await searchQuotes(searchQuery, lang, selectedCategory)
          data = res.data || []
          setHasMore(false) // search returns all results at once
        } else {
          const res = await fetchQuotes(lang, selectedCategory, currentPage, LIMIT)
          data = res.data || []
          setHasMore(res.pagination?.hasNext ?? false)
        }
        setQuotes((prev) => (reset ? data : [...prev, ...data]))
      } catch (err) {
        console.error('Failed to load quotes:', err)
        setHasMore(false)
      } finally {
        setLoading(false)
      }
    },
    [searchQuery, lang, selectedCategory],
  )

  // Reset on filter change
  useEffect(() => {
    setQuotes([])
    setPage(1)
    setHasMore(true)
    loadQuotes(1, true)
  }, [loadQuotes])

  // Infinite scroll
  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      const next = page + 1
      setPage(next)
      loadQuotes(next, false)
    }
  }, [loading, hasMore, page, loadQuotes])

  // Random quote
  const handleRandom = useCallback(async () => {
    setRandomLoading(true)
    try {
      const quote = await fetchRandom(lang, selectedCategory)
      setRandomQuote(quote)
    } catch (err) {
      console.error('Failed to fetch random quote:', err)
    } finally {
      setRandomLoading(false)
    }
  }, [lang, selectedCategory])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-sm transition-colors duration-300">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
            Dev Fortune
          </h1>
          <button
            onClick={() => setDarkMode((v) => !v)}
            aria-label="Toggle dark mode"
            className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            {darkMode ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m8.66-9h-1M4.34 12h-1m15.07-6.07-.71.71M6.34 17.66l-.71.71M17.66 17.66l.71.71M6.34 6.34l.71-.71M12 7a5 5 0 100 10A5 5 0 0012 7z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 12.79A9 9 0 1111.21 3a7 7 0 009.79 9.79z" />
              </svg>
            )}
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {/* Search + Language */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          <div className="flex-1">
            <SearchBar value={searchQuery} onChange={setSearchQuery} />
          </div>
          <select
            value={lang}
            onChange={(e) => setLang(e.target.value)}
            className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
            aria-label="Language"
          >
            <option value="en">English</option>
            <option value="ko">한국어</option>
            <option value="ja">日本語</option>
          </select>
        </div>

        {/* Category filter */}
        <CategoryFilter
          categories={categories}
          selected={selectedCategory}
          onSelect={(cat) => setSelectedCategory(cat === selectedCategory ? null : cat)}
        />

        {/* Random quote */}
        <div className="flex flex-col items-center gap-4">
          <RandomButton onClick={handleRandom} loading={randomLoading} />
          {randomQuote && (
            <div className="w-full max-w-xl">
              <QuoteCard
                quote={randomQuote.quote}
                by={randomQuote.by}
                category={randomQuote.category}
                id={randomQuote.id}
                featured
                animate
              />
            </div>
          )}
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700" />

        {/* Quote list */}
        <QuoteList quotes={quotes} loading={loading} hasMore={hasMore} onLoadMore={loadMore} />
      </main>

      <footer className="mt-12 py-6 border-t border-gray-200 dark:border-gray-700">
        <p className="text-center text-sm text-gray-400 dark:text-gray-500">
          Powered by Dev Fortune API
        </p>
      </footer>
    </div>
  )
}

export default App
