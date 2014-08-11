#!/bin/bash

set -e

# Setup and start Sauce Connect for your TravisCI build
# This script requires your .travis.yml to include the following two private env variables:
# SAUCE_USERNAME
# SAUCE_ACCESS_KEY
# Follow the steps at https://saucelabs.com/opensource/travis to set that up.
#
# Curl and run this script as part of your .travis.yml before_script section:
# before_script:
#   - curl https://gist.github.com/santiycr/5139565/raw/sauce_connect_setup.sh | bash

CONNECT_URL="https://d2nkw87yt5k0to.cloudfront.net/downloads/sc-latest-linux.tar.gz"
CONNECT_DIR="/tmp/sauce-connect-$RANDOM"
CONNECT_DOWNLOAD="sc-latest-linux.tar.gz"

CONNECT_LOG="$LOGS_DIR/sauce-connect"
CONNECT_STDOUT="$LOGS_DIR/sauce-connect.stdout"
CONNECT_STDERR="$LOGS_DIR/sauce-connect.stderr"

# Get Connect and start it
mkdir -p $CONNECT_DIR
cd $CONNECT_DIR
curl $CONNECT_URL -o $CONNECT_DOWNLOAD 2> /dev/null 1> /dev/null
mkdir sauce-connect
tar --extract --file=$CONNECT_DOWNLOAD --strip-components=1 --directory=sauce-connect > /dev/null
rm $CONNECT_DOWNLOAD

SAUCE_ACCESS_KEY=`echo $SAUCE_ACCESS_KEY | rev`

ARGS=" --tunnel-identifier $WERCKER_STEP_ID"
ARGS="$ARGS --readyfile $BROWSER_PROVIDER_READY_FILE"

echo "Starting Sauce Connect in the background, logging into:"
echo "  $CONNECT_LOG"
echo "  $CONNECT_STDOUT"
echo "  $CONNECT_STDERR"
sauce-connect/bin/sc -u williamcandillon -k 61aa52ab-a58f-4b41-bdef-05a741a0372b -v $ARGS \
  --logfile $CONNECT_LOG 2> $CONNECT_STDERR 1> $CONNECT_STDOUT &