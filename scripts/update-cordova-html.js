const fs   = require('fs');
const path = require('path');

const distAssetsDir = path.join(__dirname, '../www/dist/assets');
const cordovaHtml   = path.join(__dirname, '../www/index.html');

const jsBundle = fs.readdirSync(distAssetsDir).find(f => f.endsWith('.js'));
if (!jsBundle) {
  console.error('No JS bundle found in www/dist/assets/');
  process.exit(1);
}

const html = `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Todo App</title>
    <link href="https://fonts.googleapis.com/css2?family=Caveat:wght@400;600;700&family=Kalam:wght@300;400;700&family=Architects+Daughter&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="lib/jquery.mobile-1.4.5.min.css">
    <link rel="stylesheet" href="css/theme.css">
    <link rel="stylesheet" href="css/components.css">
</head>
<body>
    <div id="app"></div>
    <div data-role="page" id="page-todo"></div>
    <script src="lib/jquery.min.js"></script>
    <script>
        $(document).on('mobileinit', function () {
            $.mobile.hashListeningEnabled = false;
            $.mobile.pushStateEnabled     = false;
            $.mobile.linkBindingEnabled   = false;
            $.mobile.ajaxEnabled          = false;
        });
    </script>
    <script src="lib/jquery.mobile-1.4.5.min.js"></script>
    <script src="cordova.js"></script>
    <script type="module" src="dist/assets/${jsBundle}"></script>
</body>
</html>
`;

fs.writeFileSync(cordovaHtml, html, 'utf8');
console.log(`www/index.html updated → dist/assets/${jsBundle}`);
