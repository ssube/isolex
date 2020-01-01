function echo_trace() {
  >&2 echo "${@}"
}

function echo_error() {
  echo_trace "${@}"
  exit 1
}