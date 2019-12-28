#! /bin/bash

cat - >> /tmp/test-filter.log
echo  >> /tmp/test-filter.log

cat <<EOD
{
  "metadata": {
    "kind": "message"
  },
  "data": {
    "body": [
      "yes world, it is hello"
    ]
  }
}
EOD

exit 0