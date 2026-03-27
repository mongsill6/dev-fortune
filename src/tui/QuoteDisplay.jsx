import React from 'react';
import { Box, Text } from 'ink';

export default function QuoteDisplay({ quote }) {
  if (!quote) {
    return (
      <Box borderStyle="round" borderColor="gray" padding={1} flexDirection="column" alignItems="center">
        <Text color="gray">Press [r] to get a random quote</Text>
      </Box>
    );
  }

  return (
    <Box borderStyle="round" borderColor="green" padding={1} flexDirection="column">
      <Text color="greenBright" wrap="wrap">"{quote.quote}"</Text>
      <Text> </Text>
      <Text dimColor italic>— {quote.by}</Text>
      {quote.category && (
        <Text color="cyan"> [{quote.category}]</Text>
      )}
    </Box>
  );
}
