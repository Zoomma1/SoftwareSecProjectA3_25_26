#!/bin/bash

if [ -z "$1" ]; then
  echo "Usage: ./rename.sh NewAppName"
  exit 1
fi

OLD_APP_NAME=$(grep -m1 '<artifactId>' pom.xml | sed -E 's/.*<artifactId>(.*)<\/artifactId>.*/\1/')
NEW_APP_NAME=$(echo "$1" | tr -d ' ')
NEW_CLASS_NAME="$(echo "$1" | sed -r 's/[^a-zA-Z0-9]/ /g' | awk '{for (i=1;i<=NF;i++) $i=toupper(substr($i,1,1)) substr($i,2)} 1' | tr -d ' ')Application"

OLD_PACKAGE="com.spring.$OLD_APP_NAME"
NEW_PACKAGE="com.spring.$NEW_APP_NAME"


OLD_PKG_PATH=$(echo "$OLD_PACKAGE" | tr '.' '/')
NEW_PKG_PATH=$(echo "$NEW_PACKAGE" | tr '.' '/')

echo "🔧 Renaming '$OLD_APP_NAME' → '$NEW_APP_NAME'"
echo "🔧 Updating package '$OLD_PACKAGE' → '$NEW_PACKAGE'"
echo "🔧 Main class will be '$NEW_CLASS_NAME'"

grep -rl "$OLD_APP_NAME" . | xargs sed -i "s/$OLD_APP_NAME/$NEW_APP_NAME/g"
grep -rl "$OLD_PACKAGE" . | xargs sed -i "s|$OLD_PACKAGE|$NEW_PACKAGE|g"

if [ -f src/main/resources/application.yml ]; then
  sed -i "s|spring.application.name: .*|spring.application.name: $NEW_APP_NAME|" src/main/resources/application.yml
fi

if [ -d "src/main/java/$OLD_PKG_PATH" ]; then
  mkdir -p "src/main/java/$(dirname $NEW_PKG_PATH)"
  mv "src/main/java/$OLD_PKG_PATH" "src/main/java/$NEW_PKG_PATH"
fi

if [ -d "src/test/java/$OLD_PKG_PATH" ]; then
  mkdir -p "src/test/java/$(dirname $NEW_PKG_PATH)"
  mv "src/test/java/$OLD_PKG_PATH" "src/test/java/$NEW_PKG_PATH"
fi

MAIN_CLASS_FILE=$(find "src/main/java/$NEW_PKG_PATH" -type f -name "*Application.java")
if [ -n "$MAIN_CLASS_FILE" ]; then
  OLD_CLASS_NAME=$(basename "$MAIN_CLASS_FILE")
  sed -i "s/class .*Application/class $NEW_CLASS_NAME/" "$MAIN_CLASS_FILE"
  sed -i "s/public static void main.*/public static void main(String[] args) {/" "$MAIN_CLASS_FILE"
  NEW_CLASS_FILE_PATH=$(dirname "$MAIN_CLASS_FILE")"/$NEW_CLASS_NAME.java"
  mv "$MAIN_CLASS_FILE" "$NEW_CLASS_FILE_PATH"
  echo "✅ Main class renamed: $NEW_CLASS_FILE_PATH"
fi

find . -depth -name "*$OLD_APP_NAME*" | while read path; do
  newpath=$(echo "$path" | sed "s/$OLD_APP_NAME/$NEW_APP_NAME/g")
  mv "$path" "$newpath"
done

echo "✅ Done! Project renamed to '$NEW_APP_NAME' with main class '$NEW_CLASS_NAME'"
