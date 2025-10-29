#!/bin/bash

API_KEY="LXLV8H3i-pzoBp4EfcOs86d80WqlUWR0"

echo "Testing Alchemy chains..."
echo ""

for chain in eth-mainnet bnb-mainnet polygon-mainnet arb-mainnet opt-mainnet base-mainnet avax-mainnet fantom-mainnet cronos-mainnet; do
  echo -n "Testing $chain: "
  response=$(curl -s "https://${chain}.g.alchemy.com/v2/${API_KEY}" -X POST -H "Content-Type: application/json" -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}')

  if echo "$response" | grep -q '"result"'; then
    echo "✅ ACTIVE"
  else
    echo "❌ NOT ACTIVE"
  fi
done
