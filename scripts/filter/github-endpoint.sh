#! /bin/sh

# filter for github status events

LOG_FILE="/tmp/github-endpoint.log"

date >> "${LOG_FILE}"

DATA="$(cat -)"
LABELS="$(echo "${DATA}" | jq '.data.labels[]')"
echo "labels: ${LABELS}" >> "${LOG_FILE}"

STATUS_EVENT="$(echo "${DATA}" | jq 'select(.data.labels[] | index("status"))')"

if [ -z "${STATUS_EVENT}" ];
then
  exit 0
fi

GITHUB_COMMIT="$(echo "${DATA}" | jq -r '.data.data[] | select(.[0] == "sha") | .[1]')"
export GITHUB_COMMIT
echo "commit: ${GITHUB_COMMIT}" >> "${LOG_FILE}"

GITHUB_PROJECT="$(echo "${DATA}" | jq -r '.data.context.channel.id')"
export GITHUB_PROJECT
echo "project: ${GITHUB_PROJECT}" >> "${LOG_FILE}"

bash /data/filter/github-status.sh >> "${LOG_FILE}"
