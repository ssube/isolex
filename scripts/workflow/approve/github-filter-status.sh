#! /bin/sh

LOG_FILE=/tmp/github-status-trace.log

date >> ${LOG_FILE}

DATA="$(cat -)"
LABELS="$(echo "${DATA}" | jq '.data.labels[]')"
echo "Labels: ${LABELS}" >> ${LOG_FILE}

STATUS_EVENT="$(echo "${DATA}" | jq 'select(.data.labels[] | index("status"))')"

if [ -n "${STATUS_EVENT}" ];
then
  echo "${STATUS_EVENT}" | bash /data/filter/github-status.sh 2>> ${LOG_FILE}
  exit $?
fi

echo "Unknown event type: ${CHECK_EVENT}" >> ${LOG_FILE}
exit 1
