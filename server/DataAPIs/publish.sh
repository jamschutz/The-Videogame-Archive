POSITIONAL_ARGS=()

while [[ $# -gt 0 ]]; do
  case $1 in
    -c|--client-id)
      CLIENT_ID="$2"
      shift # past argument
      shift # past value
      ;;
    -s|--client-secret)
      CLIENT_SECRET="$2"
      shift # past argument
      shift # past value
      ;;
    -p|--project-id)
      PROJECT_ID="$2"
      shift # past argument
      shift # past value
      ;;
    -*|--*)
      echo "Unknown option $1"
      exit 1
      ;;
    *)
      POSITIONAL_ARGS+=("$1") # save positional arg
      shift # past argument
      ;;
  esac
done

set -- "${POSITIONAL_ARGS[@]}" # restore positional parameters

echo "CLIENT ID  = ${CLIENT_ID}"
echo "CLIENT SECRET     = ${CLIENT_SECRET}"
echo "PROJECT ID         = ${PROJECT_ID}"


# dotnet publish --configuration Release -r linux-x64
# cp -rf /home/vga/the-videogame-archive/server/DataAPIs/bin/Release/net9.0/linux-x64/* /srv/backend/article-apis