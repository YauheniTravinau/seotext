const text1 = document.getElementById('text1');
const text2 = document.getElementById('text2');
const charCount1 = document.getElementById('charCount1');
const charCount2 = document.getElementById('charCount2');
const differences = document.getElementById('differences');

function countNonSpaceChars(text) {
    return text.split(' ').join('').length;
}

function compareText() {
    try {
        const text1Value = text1.value.trim();
        const text2Value = text2.value.trim();

        const text1NonSpaceCount = countNonSpaceChars(text1Value);
        const text2NonSpaceCount = countNonSpaceChars(text2Value);

        differences.innerHTML = '';
        charCount1.textContent = `Количество символов: ${text1Value.length}, без пробелов: ${text1NonSpaceCount}`;
        charCount2.textContent = `Количество символов: ${text2Value.length}, без пробелов: ${text2NonSpaceCount}`;

        if (!text1Value || !text2Value) {
            differences.innerHTML = '<p class="warning">Введите текст в оба поля для сравнения</p>';
            return;
        }

        const text1Words = text1Value.split(/\s+/);
        const text2Words = text2Value.split(/\s+/);
        const diffArray = [];

        text2Words.forEach(word => {
            if (!text1Words.includes(word)) {
                diffArray.push(`<span class="added">${word}</span>`);
            } else {
                diffArray.push(word);
            }
        });

        differences.innerHTML = diffArray.join(' ');
    } catch (error) {
        console.error('Ошибка при сравнении текстов:', error);
        differences.innerHTML = '<p class="error">Произошла ошибка при сравнении текстов</p>';
    }
}

text1.addEventListener('input', compareText);
text2.addEventListener('input', compareText);



// Оптимизированная функция для обработки изображений
async function resizeAndRenameImages() {
    try {
        const files = document.getElementById('fileInput').files;
        if (!files.length) {
            throw new Error('Пожалуйста, выберите файлы для обработки');
        }

        const options = {
            width: parseInt(document.getElementById('width').value) || 0,
            height: parseInt(document.getElementById('height').value) || 0,
            copies: parseInt(document.getElementById('copies').value) || 1,
            format: document.getElementById('format').value,
            saveMethod: document.getElementById('saveMethod').value,
            captions: document.getElementById('captions').value.trim() ? 
                document.getElementById('captions').value.split('\n') : []
        };

        const outputDiv = document.getElementById('output');
        let zip;
        if (options.saveMethod === 'zip') {
            zip = new JSZip();
            outputDiv.innerHTML = '<p>Подготовка ZIP-архива...</p>';
        }

        let processedCount = 0;
        const totalToProcess = files.length * options.copies;
        let captionIndex = 0;

        for (const file of files) {
            for (let j = 0; j < options.copies; j++) {
                let fileName = file.name.split('.')[0];
                if (captionIndex < options.captions.length && options.captions[captionIndex].trim()) {
                    fileName = sanitizeFilename(options.captions[captionIndex].trim());
                    captionIndex++;
                } else if (options.copies > 1) {
                    fileName = sanitizeFilename(fileName) + `_${j + 1}`;
                }

                const imageOptions = {
                    width: options.width,
                    height: options.height,
                    format: options.format === 'original' ? file.type.split('/')[1] : options.format,
                    quality: options.format === 'png' ? 1.0 : 0.85,
                    fileName: fileName
                };

                try {
                    const { blob, fileName: newFileName } = await processImage(file, imageOptions);
                    
                    if (options.saveMethod === 'zip') {
                        if (options.copies > 1) {
                            const folderName = (j + 1).toString().padStart(3, '0');
                            zip.folder(folderName).file(newFileName, blob);
                        } else {
                            zip.file(newFileName, blob);
                        }
                    } else {
                        downloadImage(blob, newFileName);
                    }

                    processedCount++;
                    outputDiv.innerHTML = `<p>Обработано ${processedCount} из ${totalToProcess}</p>`;
                } catch (error) {
                    console.error(`Ошибка при обработке файла ${file.name}:`, error);
                }
            }
        }

        if (options.saveMethod === 'zip' && zip) {
            try {
                outputDiv.innerHTML = '<p>Создание ZIP-архива...</p>';
                const content = await zip.generateAsync({type: 'blob'});
                const url = URL.createObjectURL(content);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'images.zip';
                document.body.appendChild(a);
                a.click();
                setTimeout(() => {
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                    outputDiv.innerHTML = '<p>ZIP-архив успешно создан и сохранен!</p>';
                }, 100);
            } catch (error) {
                console.error('Ошибка при создании ZIP-архива:', error);
                outputDiv.innerHTML = '<p>Ошибка при создании ZIP-архива</p>';
            }
        } else {
            outputDiv.innerHTML = '<p>Все изображения обработаны!</p>';
        }

        // Очистка полей
        document.getElementById('captions').value = '';
        document.getElementById('fileInput').value = '';
        clearLineCount();
    } catch (error) {
        console.error('Ошибка при обработке изображений:', error);
        document.getElementById('output').innerHTML = `<p>Ошибка: ${error.message}</p>`;
    }
}

// Остальные функции остаются без изменений
function sanitizeFilename(filename) {
    return filename
        .replace(/[^a-zA-Z0-9а-яА-ЯёЁ\-_]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
}

// TODO: Реализовать функцию processImage для обработки изображений
async function processImage(file, options) {
    console.log(`Processing file: ${file.name} with options:`, options);
    // Эта функция должна обрабатывать изображение (изменять размер, формат и т.д.)
    // и возвращать Promise, который разрешается объектом { blob: Blob, fileName: string }
    
    // Временная заглушка: просто возвращает исходный файл как blob
    // В РЕАЛЬНОСТИ ТРЕБУЕТСЯ ПОЛНАЯ РЕАЛИЗАЦИЯ ОБРАБОТКИ ИЗОБРАЖЕНИЯ
    
    return new Promise((resolve) => {
        // Читаем файл как ArrayBuffer, чтобы создать Blob
        const reader = new FileReader();
        reader.onloadend = function() {
            const blob = new Blob([reader.result], { type: file.type });
            // Возвращаем оригинальное имя файла с новым расширением, если формат изменен
            let newFileName = options.fileName;
            if (options.format !== 'original' && file.type.split('/')[1] !== options.format) {
                 newFileName = newFileName.split('.')[0] + '.' + options.format;
            } else if (!newFileName.includes('.')) {
                 // Добавляем расширение, если его нет в имени
                 newFileName = newFileName + '.' + file.name.split('.').pop();
            }
            resolve({ blob: blob, fileName: newFileName });
        };
        reader.readAsArrayBuffer(file);
    });
}

function downloadImage(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, 100);
}

document.getElementById('fileInput').addEventListener('change', function() {
    const files = this.files;
    const fileStatus = document.getElementById('fileInputStatus');
    const outputDiv = document.getElementById('output');

    if (files.length > 0) {
        fileStatus.textContent = `${files.length} файл(ов) выбран(о)`;
    } else {
        fileStatus.textContent = 'Файл не выбран';
    }

    outputDiv.innerHTML = '';

    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const reader = new FileReader();

        reader.onload = function(e) {
            const img = new Image();
            img.src = e.target.result;

            img.onload = function() {
                const format = file.type.split('/')[1];
                const resolution = `${img.width}x${img.height}px`;

                const imageInfo = document.createElement('p');
                imageInfo.textContent = `${file.name} ${resolution}, формат: ${format.toUpperCase()}`;
                outputDiv.appendChild(imageInfo);
            }
        };

        reader.readAsDataURL(file);
    }
});

function countLines(textarea) {
    const lines = textarea.value.split('\n').length;
    document.getElementById('lineCount').innerText = "Строк: " + lines;
}

function clearLineCount() {
    document.getElementById('lineCount').innerText = '';
}

/*обрезаем текст до нужно количества символов*/
let shuffleMode = 1; // Начальный режим: mass_html_file_generator - первая функция, 2 - вторая функция

function changeShuffleMode() {
    shuffleMode = parseInt(document.getElementById("shuffleMode").value);
}

function shuffleText() {
    try {
        const inputText = document.getElementById("unique_inputText").value.trim();
        if (!inputText) {
            throw new Error('Введите текст для обработки');
        }

        const maxLineLength = parseInt(document.getElementById("maxLineLength").value) || 70;
        if (maxLineLength < 1) {
            throw new Error('Максимальная длина строки должна быть положительным числом');
        }

        // Удаление кавычек и замена точек на запятые
        const cleanedText = inputText.replace(/["']/g, '').replace(/\./g, ',');
        
        let output = shuffleMode === 1 ? 
            shufflePhrasesV1(cleanedText, maxLineLength) : 
            shufflePhrasesV2(cleanedText, maxLineLength);

        if (document.getElementById("transliteration").checked) {
            output = transliterate(output);
        }

        document.getElementById("unique_output").innerHTML = output;
    } catch (error) {
        console.error('Ошибка при обработке текста:', error);
        document.getElementById("unique_output").innerHTML = `<p class="error">Ошибка: ${error.message}</p>`;
    }
}

function transliterate(text) {
    // Пример простой замены кириллических букв на латинские
    return text.replace(/а/gi, 'a').replace(/б/gi, 'b').replace(/в/gi, 'v')
        .replace(/г/gi, 'g').replace(/д/gi, 'd').replace(/е/gi, 'e')
        .replace(/ё/gi, 'yo').replace(/ж/gi, 'zh').replace(/з/gi, 'z')
        .replace(/и/gi, 'i').replace(/й/gi, 'y').replace(/к/gi, 'k')
        .replace(/л/gi, 'l').replace(/м/gi, 'm').replace(/н/gi, 'n')
        .replace(/о/gi, 'o').replace(/п/gi, 'p').replace(/р/gi, 'r')
        .replace(/с/gi, 's').replace(/т/gi, 't').replace(/у/gi, 'u')
        .replace(/ф/gi, 'f').replace(/х/gi, 'h').replace(/ц/gi, 'ts')
        .replace(/ч/gi, 'ch').replace(/ш/gi, 'sh').replace(/щ/gi, 'sch')
        .replace(/ъ/gi, '').replace(/ы/gi, 'y').replace(/ь/gi, '')
        .replace(/э/gi, 'e').replace(/ю/gi, 'yu').replace(/я/gi, 'ya');
}


function shufflePhrasesV1(text, maxLineLength) {
    let phrases = text.split(',');
    phrases = shuffleArray(phrases); // Перемешиваем словосочетания

    let shuffledPhrases = [];
    let currentLine = '';
    let currentLength = 0;

    phrases.forEach(function(phrase) {
        let subPhrases = phrase.split('.');
        subPhrases = shuffleArray(subPhrases); // Перемешиваем слова внутри словосочетания

        subPhrases.forEach(function(subPhrase) {
            subPhrase = subPhrase.trim().replace(/\s+/g, '-');
            if ((currentLength + subPhrase.length + 1) <= maxLineLength) {
                if (currentLine !== '') {
                    currentLine += '-' + subPhrase;
                    currentLength += subPhrase.length + 1;
                } else {
                    currentLine += subPhrase;
                    currentLength += subPhrase.length;
                }
            } else {
                shuffledPhrases.push(currentLine);
                currentLine = subPhrase;
                currentLength = subPhrase.length;
            }
        });
    });

    if (currentLine !== '') {
        shuffledPhrases.push(currentLine);
    }

    return shuffledPhrases.join('<br><br>');
}

function shufflePhrasesV2(text, maxLineLength) {
    let phrases = text.split(',');
    phrases = shuffleArray(phrases); // Перемешиваем словосочетания

    let shuffledPhrases = [];
    let currentLine = '';
    let currentLength = 0;

    phrases.forEach(function(phrase) {
        let subPhrases = phrase.split('.');
        subPhrases = shuffleArray(subPhrases); // Перемешиваем слова внутри словосочетания

        subPhrases.forEach(function(subPhrase) {
            subPhrase = subPhrase.trim();
            if ((currentLength + subPhrase.length + 1) <= maxLineLength) { // Учитываем также пробел
                if (currentLine !== '') {
                    currentLine += ', ' + subPhrase;
                    currentLength += subPhrase.length + 2; // Учитываем запятую и пробел
                } else {
                    currentLine += subPhrase;
                    currentLength += subPhrase.length;
                }
            } else {
                shuffledPhrases.push(currentLine);
                currentLine = subPhrase;
                currentLength = subPhrase.length;
            }
        });
    });

    if (currentLine !== '') {
        shuffledPhrases.push(currentLine);
    }

    return shuffledPhrases.join('<br><br>'); // Больше не добавляем отступы между строками
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function copyResult() {
    let outputText = document.getElementById("unique_output").innerText;

    // Удаление пустых строк с помощью регулярного выражения
    outputText = outputText.replace(/^\s*[\r\n]/gm, '');

    navigator.clipboard.writeText(outputText)
        .then(() => {
            console.log("Текст скопирован успешно!");
        })
        .catch(err => {
            console.error('Ошибка копирования текста: ', err);
            console.log("Ошибка копирования текста. Пожалуйста, скопируйте текст вручную.");
        });
}

/*поле ввода url*/
function generateWgetCommand() {
    try {
        const url = document.getElementById("urlInput_new").value.trim();
        if (!url) {
            throw new Error('Введите URL сайта');
        }

        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            throw new Error('URL должен начинаться с http:// или https://');
        }

        const wgetCommand = `wget --spider --recursive --no-verbose --no-check-certificate -nd --restrict-file-names=ascii ${url} 2>&1 | findstr /v /c:"404 Not Found" /c:"403 Forbidden" /c:"500 Internal Server Error" >> wget-log.txt`;
        
        const outputContainer = document.getElementById("changed_unique_output_new");
        outputContainer.innerText = wgetCommand;
        document.getElementById("resultContainer_new").style.display = "block";
    } catch (error) {
        console.error('Ошибка при генерации команды:', error);
        document.getElementById("changed_unique_output_new").innerText = `Ошибка: ${error.message}`;
    }
}

function copyToClipboard(text, elementId) {
    try {
        if (elementId) {
            const element = document.getElementById(elementId);
            if (element) {
                text = element.innerText;
            }
        }
        
        if (!text) {
            throw new Error('No text to copy');
        }

        navigator.clipboard.writeText(text)
            .then(() => {
                console.log("Текст скопирован успешно!");
            })
            .catch(err => {
                console.error('Ошибка копирования текста: ', err);
                // Fallback для старых браузеров
                const tempInput = document.createElement('textarea');
                tempInput.value = text;
                document.body.appendChild(tempInput);
                tempInput.select();
                document.execCommand('copy');
                document.body.removeChild(tempInput);
            });
    } catch (error) {
        console.error('Ошибка при копировании:', error);
    }
}

/*скачивание ссылок*/
document.getElementById('file-input_new').addEventListener('change', function(event) { // Обновленный идентификатор
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function() {
        const fileContent = reader.result;

        const links = fileContent.match(/https?:\/\/\S+/g);
        if (links) {
            // Создаем ссылку для скачивания файла
            const blob = new Blob([links.join('\n')], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const downloadLink = document.createElement('a');
            downloadLink.href = url;
            downloadLink.download = 'extracted_links.txt';
            downloadLink.style.display = 'none';
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
        } else {
            console.log('Ссылки не найдены в файле');
        }
    };
    reader.readAsText(file);
});

/* Создание Sitemap */
document.getElementById('fileForm_new').addEventListener('submit', function(event) {
    event.preventDefault();

    const fileInput = document.getElementById('fileInput_new');
    const textInput = document.getElementById('textInput').value;
    const file = fileInput.files[0];

    if (!file) {
        alert('Пожалуйста, загрузите файл.');
        return;
    }

    const reader = new FileReader();

    reader.onload = function(e) {
        const content = e.target.result;
        const urls = extractUrls(content);
        const images = extractImages(content);
        const sitemapUrls = generateUrlSitemap(urls);
        const sitemapImages = generateImageSitemap(images, textInput);

        saveToFile('sitemap.xml', sitemapUrls);
        saveToFile('sitemap-images.xml', sitemapImages);
    };

    reader.onerror = function(e) {
        console.error('Ошибка чтения файла:', e.target.error);
    };

    reader.readAsText(file);
});

function extractUrls(content) {
    const urlRegex = /https?:\/\/\S+/g;
    const urls = content.match(urlRegex) || [];
    const uniqueUrls = new Set(urls);
    return Array.from(uniqueUrls).filter(url => {
        return url && !url.match(/\.(jpg|jpeg|png|gif|webp|css|js|py|txt|otf|eot|ico)$/i) &&
            !url.endsWith(":") &&
            !url.includes(".svg?v=4.7.0") &&
            !url.includes(".css?v=33") &&
            !url.includes(".eot?") &&
            !url.includes("sitemap") &&
            !url.includes("?") &&
            !url.includes("&") &&
            !url.includes(".woff") &&
            !url.includes(".woff2") &&
            !url.includes(".ttf") &&
            !url.includes(".eot") &&
            !url.includes(".svg") &&
            !url.includes(".eot?v=") &&
            !url.includes(".woff?v=") &&
            !url.includes(".woff2?v=") &&
            !url.includes(".ttf?v=") &&
            !url.includes(".svg?v=") &&
            !url.includes(".php");
    });
}

function extractImages(content) {
    const imgRegex = /https?:\/\/\S+\.(jpg|jpeg|webp)/g;
    const encodedRegex = /(%[0-9A-Fa-f]{2}){2,}/; // Регулярное выражение для проверки наличия закодированных символов
    const matches = content.match(imgRegex) || [];

    // Фильтрация результатов, исключая закодированные ссылки и файлы PNG и GIF
    return matches.filter(url => !encodedRegex.test(url));
}



function generateUrlSitemap(urls) {
    let sitemap = '<?xml version="mass_html_file_generator.0" encoding="UTF-8"?>\n';
    sitemap += '<urlset xmlns="https://www.sitemaps.org/schemas/sitemap/0.9">\n';

    urls.forEach(url => {
        sitemap += '  <url>\n';
        sitemap += '    <loc>' + url + '</loc>\n';
        sitemap += '    <lastmod>' + new Date().toISOString() + '</lastmod>\n';
        sitemap += '    <changefreq>weekly</changefreq>\n';
        sitemap += '    <priority>0.8</priority>\n';
        sitemap += '  </url>\n';
    });

    sitemap += '</urlset>';
    return sitemap;
}

function generateImageSitemap(images, textInput) {
    const lines = textInput.split('\n').map(line => line.trim()).filter(line => line.length > 0 && line.length <= 100);
    const usedLines = new Set();
    let sitemap = '<?xml version="mass_html_file_generator.0" encoding="UTF-8"?>\n';
    sitemap += '<urlset xmlns="https://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="https://www.google.com/schemas/sitemap-image/mass_html_file_generator.mass_html_file_generator">\n';

    images.forEach(image => {
        sitemap += '  <url>\n';
        sitemap += '    <loc>' + image + '</loc>\n';
        sitemap += '    <image:image>\n';
        sitemap += '      <image:loc>' + image + '</image:loc>\n';

        let caption = 'Описание изображения для SEO';
        let title = 'Заголовок изображения для SEO';

        if (lines.length > 0) {
            // Get a unique line for caption
            let randomIndex;
            do {
                randomIndex = Math.floor(Math.random() * lines.length);
            } while (usedLines.has(lines[randomIndex]) && usedLines.size < lines.length);
            if (!usedLines.has(lines[randomIndex])) {
                caption = lines[randomIndex];
                usedLines.add(lines[randomIndex]);
            }

            // Get a unique line for title
            do {
                randomIndex = Math.floor(Math.random() * lines.length);
            } while (usedLines.has(lines[randomIndex]) && usedLines.size < lines.length);
            if (!usedLines.has(lines[randomIndex])) {
                title = lines[randomIndex];
                usedLines.add(lines[randomIndex]);
            }
        }

        sitemap += '      <image:caption>' + caption + '</image:caption>\n';
        sitemap += '      <image:title>' + title + '</image:title>\n';
        sitemap += '    </image:image>\n';
        sitemap += '  </url>\n';
    });

    sitemap += '</urlset>';
    return sitemap;
}

function saveToFile(filename, content) {
    const sanitizedContent = sanitizeXmlContent(content);
    const blob = new Blob([sanitizedContent], { type: 'text/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function sanitizeXmlContent(content) {
    return content.replace(/&/g, '&amp;');
}

/*быстро делаем текст через запятую*/
function combinePhrases() {
    try {
        const input = document.getElementById('input').value.trim();
        if (!input) {
            throw new Error('Введите текст для обработки');
        }

        const phrases = input.split('\n')
            .map(phrase => phrase.trim())
            .filter(phrase => phrase !== '');

        if (phrases.length === 0) {
            throw new Error('Нет фраз для объединения');
        }

        const combined = phrases.join(', ');
        document.getElementById('outputt').innerText = combined;
    } catch (error) {
        console.error('Ошибка при объединении фраз:', error);
        document.getElementById('outputt').innerText = `Ошибка: ${error.message}`;
    }
}

// Обновляем вызовы функций копирования
document.getElementById('copyBtn').addEventListener('click', function() {
    const outputText = document.getElementById('outputt').innerText;
    copyToClipboard(outputText);
});

// Обработчик для кнопки "Обработать текст"
document.getElementById('shuffleButton').addEventListener('click', function() {
    shuffleText(); // Вызываем основную функцию обработки текста
    const result = document.getElementById('unique_output').innerText; // Получаем результат после обработки
    copyToClipboard(result); // Копируем результат
});