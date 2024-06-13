const text1 = document.getElementById('text1');
const text2 = document.getElementById('text2');
const charCount1 = document.getElementById('charCount1');
const charCount2 = document.getElementById('charCount2');
const differences = document.getElementById('differences');

function countNonSpaceChars(text) {
    return text.split(' ').join('').length;
}

function compareText() {
    const text1Value = text1.value;
    const text2Value = text2.value;

    const text1NonSpaceCount = countNonSpaceChars(text1Value);
    const text2NonSpaceCount = countNonSpaceChars(text2Value);

    differences.innerHTML = '';
    charCount1.textContent = `Количество символов: ${text1Value.length}, без пробелов: ${text1NonSpaceCount}`;
    charCount2.textContent = `Количество символов: ${text2Value.length}, без пробелов: ${text2NonSpaceCount}`;

    const text1Words = text1Value.split(' ');
    const text2Words = text2Value.split(' ');
    const diffArray = [];

    text2Words.forEach(word => {
        if (!text1Words.includes(word)) {
            diffArray.push(`<span class="added">${word}</span>`);
        } else {
            diffArray.push(word);
        }
    });

    differences.innerHTML = diffArray.join(' ');
}

text1.addEventListener('input', compareText);
text2.addEventListener('input', compareText);



// Функция для изменения размера изображений и их сохранения
function resizeAndRenameImages() {
    const files = document.getElementById('fileInput').files;
    const width = parseInt(document.getElementById('width').value) || 0;
    const height = parseInt(document.getElementById('height').value) || 0;
    const copies = parseInt(document.getElementById('copies').value);
    let captions = document.getElementById('captions').value.trim() !== '' ? document.getElementById('captions').value.split('\n') : [];
    const formatSelect = document.getElementById('format');
    const selectedFormat = formatSelect.value;
    const outputDiv = document.getElementById('output');

    let captionIndex = 0;
    let fileIndex = 0;

    function processNextFile() {
        if (fileIndex < files.length) {
            const file = files[fileIndex];
            const reader = new FileReader();

            reader.onload = function(e) {
                const img = new Image();
                img.src = e.target.result;

                img.onload = function() {
                    const aspectRatio = img.width / img.height;

                    for (let j = 0; j < copies; j++) {
                        let fileName = file.name.split('.')[0];
                        if (captionIndex < captions.length && captions[captionIndex].trim() !== '') {
                            fileName = captions[captionIndex].trim().replace(/\s+/g, '-');
                            captionIndex++;
                        }

                        const canvas = document.createElement('canvas');
                        const ctx = canvas.getContext('2d');

                        canvas.width = width;
                        canvas.height = height;

                        let newWidth, newHeight;

                        if (width / aspectRatio > height) {
                            newWidth = width;
                            newHeight = width / aspectRatio;
                        } else {
                            newHeight = height;
                            newWidth = height * aspectRatio;
                        }

                        const offsetX = (canvas.width - newWidth) / 2;
                        const offsetY = (canvas.height - newHeight) / 2;

                        ctx.drawImage(img, 0, 0, img.width, img.height, offsetX, offsetY, newWidth, newHeight);

                        let format = file.type.split('/')[1];
                        if (selectedFormat !== 'original') {
                            format = selectedFormat;
                        }
                        const newDataUrl = canvas.toDataURL(`image/${format}`, 0.75);

                        const newName = `${fileName}.${format}`;
                        downloadImage(newDataUrl, newName);
                    }
                    fileIndex++;
                    setTimeout(processNextFile, 1500); // Задержка в 1500 миллисекунд перед обработкой следующего файла
                }
            };

            reader.readAsDataURL(file);
        } else {
            // Очистка полей ввода и вывода после завершения обработки всех файлов
            document.getElementById('width').value = '';
            document.getElementById('height').value = '';
            document.getElementById('captions').value = '';
            document.getElementById('fileInput').value = '';
            outputDiv.innerHTML = '';
            clearLineCount(); // Вызов функции очистки количества строк
        }
    }

    processNextFile();
}

function downloadImage(dataUrl, filename) {
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

document.getElementById('fileInput').addEventListener('change', function() {
    const files = this.files;
    const outputDiv = document.getElementById('output');

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
let shuffleMode = 1; // Начальный режим: 1 - первая функция, 2 - вторая функция

function changeShuffleMode() {
    shuffleMode = parseInt(document.getElementById("shuffleMode").value);
}

function shuffleText() {
    let inputText = document.getElementById("unique_inputText").value;
    let maxLineLength = parseInt(document.getElementById("maxLineLength").value);
    let output;

    // Удаление кавычек и замена точек на запятые во входном тексте
    inputText = inputText.replace(/["']/g, '').replace(/\./g, ',');

    if (shuffleMode === 1) {
        output = shufflePhrasesV1(inputText, maxLineLength);
    } else {
        output = shufflePhrasesV2(inputText, maxLineLength);
    }

    if (document.getElementById("transliteration").checked) {
        output = transliterate(output);
    }

    document.getElementById("unique_output").innerHTML = output;
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
    const url = document.getElementById("urlInput_new").value; // Обновленный идентификатор
    const wgetCommand = `wget --spider --recursive --no-verbose --no-check-certificate -nd --restrict-file-names=ascii ${url} 2>&1 | findstr /v /c:"404 Not Found" /c:"403 Forbidden" /c:"500 Internal Server Error" >> wget-log.txt`;
    const outputContainer = document.getElementById("changed_unique_output_new"); // Обновленный идентификатор
    outputContainer.innerText = wgetCommand;
    document.getElementById("resultContainer_new").style.display = "block"; // Обновленный идентификатор
}

function copyToClipboard() {
    const copyText = document.getElementById("changed_unique_output_new"); // Обновленный идентификатор
    const range = document.createRange();
    range.selectNode(copyText);
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(range);
    document.execCommand("copy");
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
    let sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n';
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
    let sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n';
    sitemap += '<urlset xmlns="https://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="https://www.google.com/schemas/sitemap-image/1.1">\n';

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
    const input = document.getElementById('input').value;
    const phrases = input.split('\n')
        .map(phrase => phrase.trim())
        .filter(phrase => phrase !== '');
    const combined = phrases.join(', ');
    document.getElementById('outputt').innerText = combined;
}

function copyToClipboardd() {
    const outputText = document.getElementById('outputt').innerText;
    const tempInput = document.createElement('textarea');
    tempInput.value = outputText;
    document.body.appendChild(tempInput);
    tempInput.select();
    document.execCommand('copy');
    document.body.removeChild(tempInput);
}
