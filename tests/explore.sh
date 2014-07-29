#/bin/bash
URL="http://localhost:9000/"
WEBDRIVER_PROCESS_ID=
GRUNT_PROCESS_ID=
SHUTDOWN_IN_PROGRESS=
if [ "$1" != "" ]
then
  URL="$1"
fi

trap_helper(){
  if [ "$SHUTDOWN_IN_PROGRESS" != "true" ]
  then
    SHUTDOWN_IN_PROGRESS="true"
    if [ "$WEBDRIVER_PROCESS_ID" != "" ]
    then
      # get process group id
      PGID=$( ps -j $WEBDRIVER_PROCESS_ID | grep $WEBDRIVER_PROCESS_ID | cut -d " " -f 4 )
      if [ "$PGID" != "" ]
      then
        echo "webdriver process group: $PGID"
        TEST=$( ps -p $WEBDRIVER_PROCESS_ID > /dev/null 2>&1 ; echo $? )
        if [ "$TEST" = "0" ]
        then
          echo "killing webdriver process group ($PGID) including webdriver manager with process id $WEBDRIVER_PROCESS_ID ..."
          # kill process group with -$WEBDRIVER_PROCESS_ID instead of $WEBDRIVER_PROCESS_ID
          kill -2 -$PGID
        else
          echo "webdriver not running"
        fi
      fi
    fi
    WEBDRIVER_PROCESS_ID=
    if [ "$GRUNT_PROCESS_ID" != "" ]
    then
      TEST=$( ps -p $GRUNT_PROCESS_ID > /dev/null 2>&1 ; echo $? )
      if [ "$TEST" = "0" ]
      then
        echo "killing grunt server with process id $GRUNT_PROCESS_ID ..."
        kill -2 $GRUNT_PROCESS_ID
      fi
    fi
    GRUNT_PROCESS_ID=
  fi
}

exit_helper(){
  trap_helper
}

trap trap_helper INT
trap exit_helper EXIT

grunt connect:dist-dev:keepalive &
GRUNT_PROCESS_ID=$!
echo "grunt server with process id $GRUNT_PROCESS_ID starting..."

../node_modules/protractor/bin/webdriver-manager start 2>&1 1> ./webdriver-manager.log &
WEBDRIVER_PROCESS_ID=$!
echo "webdriver with process id $WEBDRIVER_PROCESS_ID starting..."

sleep 8

echo "connecting element explorer to $URL"
../node_modules/protractor/bin/elementexplorer.js "$URL"

