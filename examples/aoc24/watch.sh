set -e
nodemon -e .urcl,.sh -x "sh ${0%/*}/run.sh"