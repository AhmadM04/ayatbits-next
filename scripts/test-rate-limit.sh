#!/bin/bash
# Script to test rate limiting
# Usage: ./scripts/test-rate-limit.sh [endpoint]

ENDPOINT="${1:-http://localhost:3000/api/daily-quote}"
REQUESTS="${2:-15}"

echo "Testing rate limiting on: $ENDPOINT"
echo "Sending $REQUESTS requests..."
echo ""

for i in $(seq 1 $REQUESTS); do
  echo -n "Request $i: "
  RESPONSE=$(curl -s -w "\n%{http_code}" "$ENDPOINT" 2>&1)
  HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
  
  if [ "$HTTP_CODE" == "429" ]; then
    echo "❌ Rate limited (429)"
    RETRY_AFTER=$(curl -s -I "$ENDPOINT" | grep -i "retry-after" | cut -d' ' -f2 | tr -d '\r')
    if [ -n "$RETRY_AFTER" ]; then
      echo "   Retry after: ${RETRY_AFTER}s"
    fi
  elif [ "$HTTP_CODE" == "200" ]; then
    echo "✅ Success (200)"
  else
    echo "⚠️  HTTP $HTTP_CODE"
  fi
  
  # Small delay between requests
  sleep 0.1
done

echo ""
echo "Test complete. Check for 429 responses above."
echo "Rate limits should kick in after ~10 requests for public endpoints."

