document.getElementById('generate').addEventListener('click', () => {
    const separator = document.getElementById('separator').value;
    const fileNames = document.getElementById('fileNames').value.split('\n').filter(name => name.trim() !== '');

    if (fileNames.length === 0) {
        alert('Please enter at least one file name.');
        return;
    }

    const zip = new JSZip();

    fileNames.forEach(fileName => {
        const sanitizedFileName = convertToLatin(fileName.trim(), separator) + '.html';
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

function convertToLatin(input, separator) {
    const rusToLat = {
        'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo', 'ж': 'zh',
        'з': 'z', 'и': 'i', 'й': 'i', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o', 'п': 'p',
        'р': 'r', 'с': 's', 'т': 't', 'у': 'u', 'ф': 'f', 'х': 'kh', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh',
        'щ': 'shch', 'ы': 'y', 'э': 'e', 'ю': 'yu', 'я': 'ya',
        // Символы, которые нужно исключить
        'ъ': '', 'ь': '',
        // Польские буквы
        'ć': 'c', 'ł': 'l', 'ń': 'n', 'ó': 'o', 'ś': 's', 'ź': 'z', 'ż': 'z'
    };

    // Удаляем символы 'ь' и 'ъ' перед обработкой
    input = input.replace(/[ъь]/g, '');

    // Преобразуем строку в латинские символы
    let result = input.toLowerCase().split('').map(char => rusToLat[char] || char).join('');

    // Заменяем пробелы на выбранный разделитель
    result = result.replace(/\s+/g, separator);

    return result;
}


