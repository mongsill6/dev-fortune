# dev-fortune

> Random developer wisdom in your terminal.

Like `fortune` but curated for developers. Get a random programming quote every time you open your terminal.

## Install

```bash
# Clone
git clone https://github.com/mongsill6/dev-fortune.git
cd dev-fortune

# Make executable
chmod +x dev-fortune.sh

# (Optional) Add to your shell profile
echo "$(pwd)/dev-fortune.sh" >> ~/.bashrc
```

## Usage

```bash
./dev-fortune.sh          # Random quote
./dev-fortune.sh --list   # List all quotes
./dev-fortune.sh --add "Your quote" --by "Author"
```

## Example Output

```
  "First, solve the problem. Then, write the code."
                                    — John Johnson
```

## Add Your Own

Edit `quotes.json` or use `--add`:

```bash
./dev-fortune.sh --add "Talk is cheap. Show me the code." --by "Linus Torvalds"
```

## License

MIT
