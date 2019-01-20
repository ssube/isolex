#! /bin/sh

STATUS="${1}"
CI_COMMIT_SHA="${CI_COMMIT_SHA:-$(git rev-parse HEAD)}"

STATUS_BODY="{\"state\": \"${STATUS}\", \"target_url\": \"${CI_PIPELINE_URL}\", \"description\": \"CI pipeline ${STATUS}!\", \"context\": \"gitlab/build\"}"

printf "Reporting status for %s...\n%s" "${CI_COMMIT_SHA}" "${STATUS_BODY}"
printf "%s" "${STATUS_BODY}" | curl -d @- \
  -H "Authorization: token $(printf "%s" "${GITHUB_SECRET}" | base64 -d)" \
  -i "https://api.github.com/repos/ssube/isolex/statuses/${CI_COMMIT_SHA}"