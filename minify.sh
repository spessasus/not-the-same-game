esbuild src/js/main.js --bundle --minify --format=esm --outfile=minified/main.min.js --platform=browser
esbuild src/css/style.css --bundle --minify --format=esm --outfile=minified/style.min.css --platform=browser
node build.js