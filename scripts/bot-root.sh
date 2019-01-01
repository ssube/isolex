#! /bin/sh

ROOT_ROLE_ID="$(uuidgen)"

sqlite3 -echo out/isolex.db <<EOF
INSERT INTO role ("id", "name", "grants") VALUES ('${ROOT_ROLE_ID}', 'root', '["*"]');
EOF
