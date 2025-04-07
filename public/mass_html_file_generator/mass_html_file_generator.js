document.getElementById('generate').addEventListener('click', () => {
    const separator = document.getElementById('separator').value;
    const suffix = document.getElementById('suffix').value;
    const fileNames = document.getElementById('fileNames').value.split('\n').filter(name => name.trim() !== '');

    if (fileNames.length === 0) {
        alert('Please enter at least one file name.');
        return;
    }

    const zip = new JSZip();

    fileNames.forEach(fileName => {
        const sanitizedFileName = convertToLatin(fileName.trim(), separator) + suffix + '.html';
        const content = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>${sanitizedFileName}</title>
            </head>
            <body>
                <h1>${sanitizedFileName}</h1>
            </body>
            </html>
        `;
        zip.file(sanitizedFileName, content);
    });

    zip.generateAsync({ type: 'blob' }).then(content => {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(content);
        link.download = 'html_files.zip';
        link.click();
    });
});

const rusToLat = {
    'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo', 'ж': 'zh',
    'з': 'z', 'и': 'i', 'й': 'i', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o', 'п': 'p',
    'р': 'r', 'с': 's', 'т': 't', 'у': 'u', 'ф': 'f', 'х': 'kh', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh',
    'щ': 'shch', 'ы': 'y', 'э': 'e', 'ю': 'yu', 'я': 'ya',
    // Символы, которые нужно исключить
    'ъ': '', 'ь': '',
    // Польские буквы
    'ć': 'c', 'ł': 'l', 'ń': 'n', 'ó': 'o', 'ś': 's', 'ź': 'z', 'ż': 'z',
    // Английские символы не требуют изменений, они просто пропускаются
    'a': 'a', 'b': 'b', 'c': 'c', 'd': 'd', 'e': 'e', 'f': 'f', 'g': 'g',
    'h': 'h', 'i': 'i', 'j': 'j', 'k': 'k', 'l': 'l', 'm': 'm', 'n': 'n',
    'o': 'o', 'p': 'p', 'q': 'q', 'r': 'r', 's': 's', 't': 't', 'u': 'u',
    'v': 'v', 'w': 'w', 'x': 'x', 'y': 'y', 'z': 'z', ' ': '-'
};

// Транслитерация
function convertToLatin(input, separator) {
    input = input.replace(/[ъь]/g, '');  // Убираем специфичные русские буквы
    let result = input.toLowerCase().split('').map(char => rusToLat[char] || char).join('');
    result = result.replace(/\s+/g, separator);  // Заменяем пробелы на выбранный разделитель
    return result;
}

