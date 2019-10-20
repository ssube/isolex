#! /bin/sh

SERVICE_ROLE_ID="$(uuidgen)"

GITHUB_USER_ID="$(uuidgen)"
GITLAB_USER_ID="$(uuidgen)"

sqlite3 -echo out/isolex.db <<EOF
INSERT INTO role ("id", "name", "grants") VALUES ('${SERVICE_ROLE_ID}', 'webhook-service', '["*"]');
INSERT INTO user ("id", "name", "roles") VALUES ('${GITHUB_USER_ID}', 'webhook-github', '["webhook-service"]');
INSERT INTO user ("id", "name", "roles") VALUES ('${GITLAB_USER_ID}', 'webhook-gitlab', '["webhook-service"]');
EOF
