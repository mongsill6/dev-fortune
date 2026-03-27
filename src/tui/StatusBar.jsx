import React from 'react';
import { Box, Text } from 'ink';

export default function StatusBar({ totalQuotes = 0, category, language = 'en', view = 'home' }) {
  return (
    <Box borderStyle="single" borderColor="gray" paddingX={1} justifyContent="space-between">
      <Text>
        <Text color="cyan">📊 {totalQuotes}</Text>
        <Text dimColor> quotes</Text>
      </Text>
      <Text>
        <Text color="yellow">📂 {category || 'all'}</Text>
      </Text>
      <Text>
        <Text color="magenta">🌐 {language}</Text>
      </Text>
      <Text>
        <Text color="green">📍 {view}</Text>
      </Text>
      <Text dimColor>
        [r]andom [c]ategory [s]earch [f]avs [q]uit
      </Text>
    </Box>
  );
}
