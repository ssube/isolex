#! /bin/bash
#
# update docs/lex/timezone-slot.json from docs/timezones
# run with:
#   cat docs/lex/timezones | ./scripts/slot-from-zones.sh > docs/lex/timezone-slot.json
# then update the version

cat <<EOF
{
  "metadata": {
    "schemaVersion": "1.0",
    "importType": "LEX",
    "importFormat": "JSON"
  },
  "resource": {
    "name": "timezones",
    "version": "0",
    "enumerationValues": [
      {
        "value": "None",
        "synonyms": []
      }
EOF

# the None zone above isn't really necessary, but makes commas and testing easier

while read -r line;
do
  zone="$(echo "${line}" | awk '{ print $1; }')"
  syns="$(echo "${line}" | awk '{ print $2; }')"

  cat <<EOF
      ,
      {
        "value": "${zone}",
        "synonyms": [${syns}]
      }
EOF
done < "${1:-/dev/stdin}"

cat <<EOF
    ],
    "valueSelectionStrategy": "TOP_RESOLUTION"
  }
}
EOF