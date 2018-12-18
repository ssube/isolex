#! /bin/sh

CI_COMMIT_SHA="${CI_COMMIT_SHA:-$(git rev-parse HEAD)}"

STATUS_BODY="{\"state\": \"success\", \"target_url\": \"${CI_PIPELINE_URL}\", \"description\": \"CI pipeline success!\", \"context\": \"continuous-integration/gitlab\"}"

echo "Reporting status for ${CI_COMMIT_SHA}...\n${STATUS_BODY}"

echo "${STATUS_BODY}" | curl -d @- \
  -H "Authorization: token $(echo -n "${GITHUB_SECRET}" | base64 -d)" \
  -v "https://api.github.com/repos/ssube/isolex/statuses/${CI_COMMIT_SHA}"