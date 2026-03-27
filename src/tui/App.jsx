import React, { useState, useEffect } from 'react';
import { Box, Text, useInput, useApp } from 'ink';
import { loadQuotes, getRandomQuote } from '../loader.js';
import { filterByCategory } from '../categories.js';
import { detectLocale, loadLocaleQuotes } from '../i18n.js';
import QuoteDisplay from './QuoteDisplay.jsx';
import CategoryMenu from './CategoryMenu.jsx';
import SearchInput from './SearchInput.jsx';
import FavoritesList, { loadFavorites, saveFavorites } from './FavoritesList.jsx';
import StatusBar from './StatusBar.jsx';

export default function App() {
  const { exit } = useApp();
  const [view, setView] = useState('home');
  const [allQuotes, setAllQuotes] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const [currentQuote, setCurrentQuote] = useState(null);
  const [category, setCategory] = useState(null);
  const [language, setLanguage] = useState('en');

  useEffect(() => {
    const lang = detectLocale();
    setLanguage(lang);
    try {
      const q = loadLocaleQuotes(lang);
      setAllQuotes(q);
      setQuotes(q);
      setCurrentQuote(getRandomQuote(q));
    } catch {
      const q = loadQuotes();
      setAllQuotes(q);
      setQuotes(q);
      setCurrentQuote(getRandomQuote(q));
    }
  }, []);

  const getFiltered = (cat) => {
    if (cat) {
      return filterByCategory(allQuotes, cat);
    }
    return allQuotes;
  };

  useInput((input, key) => {
    if (view === 'category' || view === 'search' || view === 'favorites') {
      if (key.escape) {
        setView('home');
        return;
      }
      return;
    }

    if (input === 'q') {
      exit();
      return;
    }

    if (input === 'r') {
      const pool = getFiltered(category);
      if (pool.length > 0) {
        setCurrentQuote(getRandomQuote(pool));
      }
      return;
    }

    if (input === 'c') {
      setView('category');
      return;
    }

    if (input === 's') {
      setView('search');
      return;
    }

    if (input === 'f' && !key.shift) {
      setView('favorites');
      return;
    }

    if (input === 'F' || (input === 'f' && key.shift)) {
      if (currentQuote) {
        const favs = loadFavorites();
        const exists = favs.some(f => f.quote === currentQuote.quote && f.by === currentQuote.by);
        if (!exists) {
          favs.push(currentQuote);
          saveFavorites(favs);
        }
      }
      return;
    }

    if (input === 'l') {
      const langs = ['en', 'ko', 'ja'];
      const idx = langs.indexOf(language);
      const next = langs[(idx + 1) % langs.length];
      setLanguage(next);
      try {
        const q = loadLocaleQuotes(next);
        setAllQuotes(q);
        const filtered = category ? filterByCategory(q, category) : q;
        setQuotes(filtered);
        setCurrentQuote(getRandomQuote(filtered.length > 0 ? filtered : q));
      } catch {
        // keep current quotes
      }
      return;
    }
  });

  const handleCategorySelect = (cat) => {
    setCategory(cat);
    const filtered = getFiltered(cat);
    setQuotes(filtered);
    if (filtered.length > 0) {
      setCurrentQuote(getRandomQuote(filtered));
    }
    setView('home');
  };

  return (
    <Box flexDirection="column" minHeight={15}>
      <Box marginBottom={1} justifyContent="center">
        <Text bold color="cyan">🔮 Dev Fortune — Interactive Mode</Text>
      </Box>

      {view === 'home' && (
        <Box flexDirection="column" flexGrow={1}>
          <QuoteDisplay quote={currentQuote} />
          <Box marginTop={1} justifyContent="center">
            <Text dimColor>
              [r] Random  [c] Category  [s] Search  [f] Favorites  [F] Save  [l] Lang  [q] Quit
            </Text>
          </Box>
        </Box>
      )}

      {view === 'category' && (
        <CategoryMenu
          onSelect={handleCategorySelect}
          onBack={() => setView('home')}
        />
      )}

      {view === 'search' && (
        <SearchInput
          quotes={allQuotes}
          onSelect={(q) => { setCurrentQuote(q); setView('home'); }}
          onBack={() => setView('home')}
        />
      )}

      {view === 'favorites' && (
        <FavoritesList onBack={() => setView('home')} />
      )}

      <StatusBar
        totalQuotes={allQuotes.length}
        category={category}
        language={language}
        view={view}
      />
    </Box>
  );
}
