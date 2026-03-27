import React, { useState, useEffect } from 'react';
import { Box, Text } from 'ink';
import SelectInput from 'ink-select-input';
import fs from 'fs';
import path from 'path';
import os from 'os';

const FAVORITES_DIR = path.join(os.homedir(), '.dev-fortune');
const FAVORITES_PATH = path.join(FAVORITES_DIR, 'favorites.json');

function loadFavorites() {
  try {
    if (fs.existsSync(FAVORITES_PATH)) {
      return JSON.parse(fs.readFileSync(FAVORITES_PATH, 'utf8'));
    }
  } catch {
    // ignore
  }
  return [];
}

function saveFavorites(favs) {
  if (!fs.existsSync(FAVORITES_DIR)) {
    fs.mkdirSync(FAVORITES_DIR, { recursive: true });
  }
  fs.writeFileSync(FAVORITES_PATH, JSON.stringify(favs, null, 2));
}

export { loadFavorites, saveFavorites, FAVORITES_PATH };

export default function FavoritesList({ onBack }) {
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    setFavorites(loadFavorites());
  }, []);

  if (favorites.length === 0) {
    return (
      <Box flexDirection="column" padding={1}>
        <Text bold color="cyan">⭐ Favorites</Text>
        <Box marginTop={1}>
          <Text color="gray">No favorites yet. Press [f] on a quote to add it!</Text>
        </Box>
        <Box marginTop={1}>
          <Text dimColor>[esc] Back</Text>
        </Box>
      </Box>
    );
  }

  const items = favorites.map((fav, i) => ({
    label: `"${fav.quote.substring(0, 50)}${fav.quote.length > 50 ? '...' : ''}" — ${fav.by}`,
    value: i,
  }));

  const handleSelect = (item) => {
    const updated = favorites.filter((_, i) => i !== item.value);
    saveFavorites(updated);
    setFavorites(updated);
  };

  return (
    <Box flexDirection="column" padding={1}>
      <Box marginBottom={1}>
        <Text bold color="cyan">⭐ Favorites ({favorites.length})</Text>
      </Box>
      <SelectInput items={items} onSelect={handleSelect} />
      <Box marginTop={1}>
        <Text dimColor>[enter] Remove  [esc] Back</Text>
      </Box>
    </Box>
  );
}
