import React from 'react';
import { Box, Text } from 'ink';
import SelectInput from 'ink-select-input';

const categories = [
  { label: '📋 All Categories', value: null },
  { label: '🐛 Debugging', value: 'debugging' },
  { label: '🏗️  Architecture', value: 'architecture' },
  { label: '🤝 Teamwork', value: 'teamwork' },
  { label: '🔥 Motivation', value: 'motivation' },
  { label: '😄 Humor', value: 'humor' },
];

export default function CategoryMenu({ onSelect, onBack }) {
  const handleSelect = (item) => {
    onSelect(item.value);
  };

  return (
    <Box flexDirection="column" padding={1}>
      <Box marginBottom={1}>
        <Text bold color="cyan">📂 Select Category</Text>
      </Box>
      <SelectInput items={categories} onSelect={handleSelect} />
      <Box marginTop={1}>
        <Text dimColor>[esc] Back</Text>
      </Box>
    </Box>
  );
}
