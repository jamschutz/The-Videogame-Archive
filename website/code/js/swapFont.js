var fonts = [
    'Roboto',
    'Nunito',
    'Cabin'
];
var currentFontIndex = 0;
function swapFonts() {
    var body = document.getElementsByTagName('body')[0];
    body.style.fontFamily = fonts[currentFontIndex];
    console.log('current font: ' + fonts[currentFontIndex]);
    currentFontIndex++;
    if (currentFontIndex >= fonts.length) {
        currentFontIndex = 0;
    }
}
