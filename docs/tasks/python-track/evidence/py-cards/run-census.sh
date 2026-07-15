#!/bin/sh
# G-EXEC-PY census: run every card snippet as a FILE with python3.12, TWICE,
# capturing stdout and stderr SEPARATELY (RS-03 checklist §7). Appends nothing:
# regenerates census-log.txt from scratch on each invocation.
set -eu
cd "$(dirname "$0")"
PY=python3.12
LOG=census-log.txt

{
  echo "G-EXEC-PY census — $($PY --version 2>&1) ($(command -v $PY))"
  echo "date: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
  echo "rule: expect == stdout byte-for-byte; stderr captured separately and MUST be empty"
  echo "============================================================"
  for f in PY.M1_c1.py PY.M1_c2.py PY.M1_c3.py; do
    echo ""
    echo "---- $f ----"
    for run in 1 2; do
      out=$($PY "$f" 2>/tmp/census-stderr.txt)
      err=$(cat /tmp/census-stderr.txt)
      echo "run $run stdout:"
      echo "$out"
      echo "run $run stderr: ${err:-<empty>}"
    done
  done
} > "$LOG"
cat "$LOG"
