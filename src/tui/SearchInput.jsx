import React, { useState } from 'react';
import { Box, Text } from 'ink';
import TextInput from 'ink-text-input';

export default function SearchInput({ quotes = [], onSelect, onBack }) {
  const [query, setQuery] = useState('');

  const results = query.length > 0
    ? quotes.filter(q => {
        const lower = query.toLowerCase();
        return (
          q.quote.toLowerCase().includes(lower) ||
          q.by.toLowerCase().includes(lower) ||
          (q.category && q.category.toLowerCase().includes(lower))
        );
      }).slice(0, 10)
    : [];

  return (
    <Box flexDirection="column" padding={1}>
      <Box marginBottom={1}>
        <Text bold color="cyan">🔍 Search Quotes</Text>
      </Box>
      <Box>
        <Text color="green">❯ </Text>
        <TextInput value={query} onChange={setQuery} placeholder="Type to search..." />
      </Box>
      {query.length > 0 && (
        <Box marginTop={1} flexDirection="column">
          <Text dimColor>Found {results.length} result(s)</Text>
          {results.map((q, i) => (
            <Box key={i} marginTop={i === 0 ? 1 : 0} flexDirection="column">
              <Text color="greenBright" wrap="wrap">  "{q.quote}"</Text>
              <Text dimColor>  — {q.by}</Text>
            </Box>
          ))}
        </Box>
      )}
      <Box marginTop={1}>
        <Text dimColor>[esc] Back</Text>
      </Box>
    </Box>
  );
}
