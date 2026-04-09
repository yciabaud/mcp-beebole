#!/bin/bash
set -e

# Configuration
DIST_DIR="dist-extension"
SRC_EXT_DIR="extension"

echo "📦 Packaging extension for Beebole..."

# 1. Clean and recreate dist directory
rm -rf "$DIST_DIR"
mkdir -p "$DIST_DIR"

# 2. Bundle the MCP server (build/index.js -> dist-extension/index.js)
echo "   - Bundling MCP server with @vercel/ncc..."
npm run build
npx ncc build build/index.js -o "$DIST_DIR" -m -t

# 3. Copy extension metadata
echo "   - Copying extension metadata..."
cp "$SRC_EXT_DIR/GEMINI.md" "$DIST_DIR/"
cp -r "$SRC_EXT_DIR/agents" "$DIST_DIR/"

# 4. Create and update gemini-extension.json in dist-extension
echo "   - Updating gemini-extension.json..."
# Use a temporary file to modify the JSON (portable version)
cat "$SRC_EXT_DIR/gemini-extension.json" | \
  sed 's|"\${extensionPath}/../build/index.js"|"\${extensionPath}/index.js"|' \
  > "$DIST_DIR/gemini-extension.json"

# 5. Create ZIP archive for distribution
echo "   - Creating ZIP archive..."
zip -r beebole-extension.zip "$DIST_DIR"

echo "✅ Extension packaged successfully in $DIST_DIR/"
echo "🚀 Artifact created: beebole-extension.zip"
