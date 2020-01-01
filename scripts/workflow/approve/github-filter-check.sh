#! /bin/sh

LOG_FILE=/tmp/github-check-trace.log

echo "$(date)" >> ${LOG_FILE}

DATA="$(cat -)"
LABELS="$(echo "${DATA}" | jq '.data.labels[]')"
echo "Labels: ${LABELS}" >> ${LOG_FILE}

CHECK_EVENT="$(echo "${DATA}" | jq 'select(.data.labels[] | index("check_run"))')"

if [ -n "${CHECK_EVENT}" ];
then
  echo "${CHECK_EVENT}" | bash /data/filter/github-check.sh 2>> ${LOG_FILE}
  exit $?
fi

echo "Unknown event type: ${CHECK_EVENT}" >> ${LOG_FILE}
exit 1
