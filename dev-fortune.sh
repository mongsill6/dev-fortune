#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
QUOTES_FILE="$SCRIPT_DIR/quotes.json"

# Colors
CYAN='\033[0;36m'
GRAY='\033[0;90m'
NC='\033[0m'

show_fortune() {
  local count
  count=$(jq length "$QUOTES_FILE")
  local idx=$((RANDOM % count))
  local quote by

  quote=$(jq -r ".[$idx].quote" "$QUOTES_FILE")
  by=$(jq -r ".[$idx].by" "$QUOTES_FILE")

  echo ""
  echo -e "  ${CYAN}\"$quote\"${NC}"
  printf "%*s" $((${#quote} + 4)) ""
  echo -e "${GRAY}— $by${NC}"
  echo ""
}

list_all() {
  local count
  count=$(jq length "$QUOTES_FILE")
  echo ""
  for ((i = 0; i < count; i++)); do
    local quote by
    quote=$(jq -r ".[$i].quote" "$QUOTES_FILE")
    by=$(jq -r ".[$i].by" "$QUOTES_FILE")
    echo -e "  ${CYAN}\"$quote\"${NC}"
    echo -e "    ${GRAY}— $by${NC}"
    echo ""
  done
}

add_quote() {
  local quote="$1"
  local by="${2:-Anonymous}"
  jq --arg q "$quote" --arg b "$by" '. += [{"quote": $q, "by": $b}]' "$QUOTES_FILE" > "$QUOTES_FILE.tmp"
  mv "$QUOTES_FILE.tmp" "$QUOTES_FILE"
  echo "Added: \"$quote\" — $by"
}

case "${1:-}" in
  --list)
    list_all
    ;;
  --add)
    quote="${2:?Usage: dev-fortune --add \"quote\" --by \"author\"}"
    by="Anonymous"
    if [[ "${3:-}" == "--by" ]]; then
      by="${4:?Missing author after --by}"
    fi
    add_quote "$quote" "$by"
    ;;
  --help|-h)
    echo "Usage: dev-fortune [--list] [--add \"quote\" --by \"author\"] [--help]"
    ;;
  *)
    show_fortune
    ;;
esac
