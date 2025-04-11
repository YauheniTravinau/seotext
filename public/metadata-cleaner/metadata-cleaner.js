let currentPage = 1;
const filesPerPage = 10;
let totalFilesCount = 0;

// Функция для переключения подсказки
function toggleTooltip(icon, event) {
    event = event || window.event; // Для поддержки старых браузеров
    const tooltip = icon.nextElementSibling; // Подсказка следующая за иконкой

    if (!tooltip || !tooltip.classList.contains('tooltip')) return;

    // Сначала скрываем все другие подсказки
    document.querySelectorAll('.tooltip').forEach(t => {
        if (t !== tooltip) t.style.display = 'none';
    });

    // Переключаем текущую подсказку
    tooltip.style.display = tooltip.style.display === 'block' ? 'none' : 'block';

    if (event) {
        event.stopPropagation();
    }
}

// Обработчик клика по документу для скрытия подсказок
document.addEventListener('click', function(e) {
    // Если клик не по иконке подсказки и не по самой подсказке
    if (!e.target.classList.contains('info-icon') &&
        !e.target.closest('.tooltip')) {
        document.querySelectorAll('.tooltip').forEach(tooltip => {
            tooltip.style.display = 'none';
        });
    }
});

// Закрытие подсказок при нажатии ESC
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        document.querySelectorAll('.tooltip').forEach(tooltip => {
            tooltip.style.display = 'none';
        });
    }
});

document.addEventListener('DOMContentLoaded', function() {
    const dropArea = document.getElementById('dropArea');
    const fileInput = document.getElementById('fileInput');
    const fileList = document.getElementById('fileList');
    const processBtn = document.getElementById('processBtn');
    const clearBtn = document.getElementById('clearBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    const progressBar = document.getElementById('progressBar');
    const statusDiv = document.getElementById('status');
    const actionSelect = document.getElementById('action');
    const randomOptions = document.getElementById('randomOptions');
    const webpOption = document.getElementById('webpOption');
    const downloadZipBtn = document.getElementById('downloadZipBtn');
    const useCustomNames = document.getElementById('useCustomNames');
    const customNamesContainer = document.getElementById('customNamesContainer');
    const customNames = document.getElementById('customNames');
    const linesCount = document.getElementById('linesCount');
    const filesCount = document.getElementById('filesCount');

    const SUPPORTED_FORMATS = [
        'image/jpeg', 'image/png', 'image/webp',
        'image/gif', 'image/bmp', 'image/tiff', 'image/svg+xml'
    ];

    let files = [];
    let processedFiles = [];

    // Функция очистки метаданных
    const stripAllMetadata = async (blob, mimeType, options) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = function(e) {
                try {
                    const img = new Image();
                    img.onload = function() {
                        const canvas = document.createElement('canvas');
                        canvas.width = img.width;
                        canvas.height = img.height;
                        const ctx = canvas.getContext('2d');

                        if (options.stripColorProfile) {
                            ctx.fillStyle = 'white';
                            ctx.fillRect(0, 0, canvas.width, canvas.height);
                        }

                        ctx.drawImage(img, 0, 0);

                        const quality = mimeType === 'image/webp' ? 0.85 : 0.92;
                        canvas.toBlob(newBlob => {
                            resolve(newBlob);
                        }, mimeType, quality);
                    };
                    img.onerror = () => reject(new Error('Ошибка загрузки изображения'));
                    img.src = e.target.result;
                } catch (error) {
                    reject(error);
                }
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    };

    // Обработчики UI
    actionSelect.addEventListener('change', () => {
        const isRandom = actionSelect.value === 'random';
        randomOptions.style.display = isRandom ? 'block' : 'none';
        webpOption.style.display = isRandom ? 'none' : 'block';

        if (!isRandom) {
            document.getElementById('changeSize').checked = true;
            document.getElementById('addNoise').checked = true;
            document.getElementById('stripColorProfileRemove').checked = true;
            document.getElementById('addRotation').checked = true;
            document.getElementById('adjustBrightnessContrast').checked = true;
        }
    });

    webpOption.style.display = 'block';
    randomOptions.style.display = 'none';

    // Drag and drop
    dropArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropArea.classList.add('highlight');
    });

    dropArea.addEventListener('dragleave', () => {
        dropArea.classList.remove('highlight');
    });

    dropArea.addEventListener('drop', (e) => {
        e.preventDefault();
        dropArea.classList.remove('highlight');
        if (e.dataTransfer.files.length) {
            addFiles(e.dataTransfer.files);
        }
    });

    // Обработчик выбора файлов
    fileInput.addEventListener('change', () => {
        if (fileInput.files.length) {
            addFiles(fileInput.files);
        }
    });

    // Обработчик для переключения видимости поля ввода названий
    useCustomNames.addEventListener('change', function() {
        customNamesContainer.style.display = this.checked ? 'block' : 'none';
        updateNamesCounter();
    });

    // Обработчик для подсчета строк в поле ввода
    customNames.addEventListener('input', updateNamesCounter);

    // Функция обновления счетчиков
    function updateNamesCounter() {
        const lines = customNames.value.split('\n').filter(line => line.trim() !== '');
        linesCount.textContent = lines.length;
        filesCount.textContent = files.length;
    }

    // Основные функции
    function addFiles(newFiles) {
        const fileCounter = document.getElementById('fileCounter');

        for (let i = 0; i < newFiles.length; i++) {
            const file = newFiles[i];
            if (SUPPORTED_FORMATS.includes(file.type)) {
                files.push(file);
            }
        }

        totalFilesCount = files.length;
        fileCounter.textContent = `Добавлено файлов: ${totalFilesCount}`;
        fileCounter.style.display = 'block';

        updateFileList();
        updateButtons();
        updateNamesCounter();
    }

    function updateFileList() {
        fileList.innerHTML = '';
        if (files.length === 0) {
            fileList.innerHTML = '<p>Нет загруженных файлов</p>';
            document.getElementById('pagination').style.display = 'none';
            return;
        }

        if (files.length > filesPerPage) {
            updatePagination();
            document.getElementById('pagination').style.display = 'flex';
        } else {
            document.getElementById('pagination').style.display = 'none';
        }

        const startIndex = (currentPage - 1) * filesPerPage;
        const endIndex = Math.min(startIndex + filesPerPage, files.length);
        const filesToShow = files.slice(startIndex, endIndex);

        filesToShow.forEach((file, index) => {
            const globalIndex = startIndex + index;
            const fileItem = document.createElement('div');
            fileItem.className = 'file-item';
            fileItem.innerHTML = `
                <div class="file-item-name">${file.name} (${formatFileSize(file.size)})</div>
                <button class="btn btn-danger" onclick="removeFile(${globalIndex})">Удалить</button>
            `;
            fileList.appendChild(fileItem);
        });
    }

    function updatePagination() {
        const paginationDiv = document.getElementById('pagination');
        paginationDiv.innerHTML = '';

        const pageCount = Math.ceil(files.length / filesPerPage);

        const prevButton = document.createElement('button');
        prevButton.textContent = '←';
        prevButton.disabled = currentPage === 1;
        prevButton.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                updateFileList();
            }
        });
        paginationDiv.appendChild(prevButton);

        for (let i = 1; i <= pageCount; i++) {
            const pageButton = document.createElement('button');
            pageButton.textContent = i;
            if (i === currentPage) {
                pageButton.classList.add('active');
            }
            pageButton.addEventListener('click', () => {
                currentPage = i;
                updateFileList();
            });
            paginationDiv.appendChild(pageButton);
        }

        const nextButton = document.createElement('button');
        nextButton.textContent = '→';
        nextButton.disabled = currentPage === pageCount;
        nextButton.addEventListener('click', () => {
            if (currentPage < pageCount) {
                currentPage++;
                updateFileList();
            }
        });
        paginationDiv.appendChild(nextButton);
    }

    window.removeFile = (index) => {
        files.splice(index, 1);
        totalFilesCount = files.length;
        document.getElementById('fileCounter').textContent = `Добавлено файлов: ${totalFilesCount}`;
        if (totalFilesCount === 0) {
            document.getElementById('fileCounter').style.display = 'none';
        }

        const pageCount = Math.ceil(files.length / filesPerPage);
        if (currentPage > pageCount) {
            currentPage = pageCount > 0 ? pageCount : 1;
        }

        updateFileList();
        updateButtons();
        updateNamesCounter();
    };

    clearBtn.addEventListener('click', () => {
        files = [];
        processedFiles = [];
        totalFilesCount = 0;
        currentPage = 1;
        fileInput.value = '';
        document.getElementById('fileCounter').style.display = 'none';
        document.getElementById('pagination').style.display = 'none';
        updateFileList();
        updateButtons();
        progressBar.style.width = '0%';
        statusDiv.textContent = '';
        statusDiv.className = 'status';
        updateNamesCounter();
    });

    function updateButtons() {
        processBtn.disabled = files.length === 0;
        clearBtn.disabled = files.length === 0;
        downloadBtn.disabled = processedFiles.length === 0;
        downloadZipBtn.disabled = processedFiles.length === 0;
    }

    // Обработка изображений
    processBtn.addEventListener('click', async () => {
        if (files.length === 0) return;

        processedFiles = [];
        progressBar.style.width = '0%';
        statusDiv.textContent = 'Обработка файлов...';
        statusDiv.className = 'status processing';

        const action = actionSelect.value;
        const options = {
            keepOriginalName: action === 'random'
                ? document.getElementById('keepOriginalName').checked
                : document.getElementById('keepOriginalNameRemove').checked,
            addRandomMetadata: document.getElementById('addRandomMetadata').checked,
            stripColorProfile: action === 'random'
                ? document.getElementById('stripColorProfile').checked
                : document.getElementById('stripColorProfileRemove').checked,
            changeSize: document.getElementById('changeSize').checked,
            convertToWebP: action === 'remove' ? document.getElementById('convertToWebP').checked : false
        };

        for (let i = 0; i < files.length; i++) {
            try {
                const file = files[i];
                const processedFile = await processImage(file, action, options, i);
                processedFiles.push(processedFile);

                const progress = Math.round((i + 1) / files.length * 100);
                progressBar.style.width = `${progress}%`;
                statusDiv.textContent = `Обработка: ${i + 1} из ${files.length} файлов`;

                await new Promise(resolve => setTimeout(resolve, 50));
            } catch (error) {
                console.error('Ошибка:', error);
                statusDiv.textContent = `Ошибка при обработке файла ${files[i].name}: ${error.message}`;
                statusDiv.className = 'status error';
                return;
            }
        }

        statusDiv.textContent = `Обработано ${processedFiles.length} файлов. Готово к скачиванию.`;
        statusDiv.className = 'status success';
        updateButtons();
    });

    // Функции скачивания
    downloadBtn.addEventListener('click', () => {
        if (processedFiles.length === 0) {
            statusDiv.textContent = 'Нет обработанных файлов для скачивания';
            statusDiv.className = 'status error';
            return;
        }

        if (processedFiles.length > 10) {
            if (!confirm(`Вы собираетесь скачать ${processedFiles.length} файлов по отдельности. Это может занять время. Хотите продолжить?`)) {
                return;
            }
        }

        statusDiv.textContent = 'Начато скачивание файлов...';
        statusDiv.className = 'status processing';

        let downloadedCount = 0;
        const downloadNext = () => {
            if (downloadedCount < processedFiles.length) {
                const file = processedFiles[downloadedCount];
                const url = URL.createObjectURL(file);
                const a = document.createElement('a');
                a.href = url;
                a.download = file.name;
                document.body.appendChild(a);
                a.click();

                setTimeout(() => {
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                    downloadedCount++;
                    statusDiv.textContent = `Скачано ${downloadedCount} из ${processedFiles.length} файлов`;
                    setTimeout(downloadNext, 300);
                }, 100);
            } else {
                statusDiv.textContent = `Все файлы (${processedFiles.length}) успешно скачаны!`;
                statusDiv.className = 'status success';
            }
        };

        downloadNext();
    });

    downloadZipBtn.addEventListener('click', async () => {
        if (processedFiles.length === 0) {
            statusDiv.textContent = 'Нет обработанных файлов для архивации';
            statusDiv.className = 'status error';
            return;
        }

        statusDiv.textContent = 'Создание ZIP-архива...';
        statusDiv.className = 'status processing';

        try {
            if (typeof JSZip === 'undefined') {
                statusDiv.textContent = 'Ошибка: библиотека JSZip не загружена';
                statusDiv.className = 'status error';
                return;
            }


            const zip = new JSZip();
            const folder = zip.folder("processed_images");

            let addedCount = 0;
            for (const file of processedFiles) {
                folder.file(file.name, file);
                addedCount++;
                const progress = Math.round((addedCount / processedFiles.length) * 50);
                statusDiv.textContent = `Добавление файлов в архив: ${addedCount} из ${processedFiles.length}`;
                progressBar.style.width = `${progress}%`;
                await new Promise(resolve => setTimeout(resolve, 50));
            }

            statusDiv.textContent = 'Создание архива...';
            const content = await zip.generateAsync(
                {type: "blob"},
                (metadata) => {
                    const progress = 50 + Math.round(metadata.percent / 2);
                    progressBar.style.width = `${progress}%`;
                    if (metadata.currentFile) {
                        statusDiv.textContent = `Сжатие: ${metadata.currentFile}`;
                    }
                }
            );

            const url = URL.createObjectURL(content);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'processed_images.zip';
            document.body.appendChild(a);
            a.click();

            setTimeout(() => {
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                statusDiv.textContent = `ZIP-архив создан (${processedFiles.length} файлов)`;
                statusDiv.className = 'status success';
                progressBar.style.width = '100%';
            }, 100);

        } catch (error) {
            console.error('Ошибка при создании архива:', error);
            statusDiv.textContent = 'Ошибка при создании архива: ' + error.message;
            statusDiv.className = 'status error';
            progressBar.style.width = '0%';
        }
    });

    // Вспомогательные функции
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    async function processImage(file, action, options, index) {
        return new Promise((resolve, reject) => {
            if (file.type === 'image/svg+xml') {
                resolve(file);
                return;
            }

            const reader = new FileReader();
            reader.onload = async function(e) {
                try {
                    if (file.type === 'image/tiff' || file.type === 'image/bmp') {
                        const result = await processSpecialFormat(file, action, options);
                        resolve(result);
                        return;
                    }

                    const img = new Image();
                    img.onload = async function() {
                        try {
                            const canvas = document.createElement('canvas');
                            let newWidth = img.width;
                            let newHeight = img.height;

                            if (action === 'remove' || options.changeSize) {
                                const sizeChange = 1 + (Math.random() * 0.02 - 0.01);
                                newWidth = Math.round(img.width * sizeChange);
                                newHeight = Math.round(img.height * sizeChange);
                            }

                            canvas.width = newWidth;
                            canvas.height = newHeight;
                            const ctx = canvas.getContext('2d');

                            if (action === 'remove' || document.getElementById('addNoise').checked) {
                                ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.01})`;
                                ctx.fillRect(0, 0, canvas.width, canvas.height);
                            }

                            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                            const brightnessContrastEnabled = action === 'remove'
                                ? document.getElementById('adjustBrightnessContrast').checked
                                : document.getElementById('adjustBrightnessContrastRandom').checked;

                            if (brightnessContrastEnabled) {
                                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                                const data = imageData.data;
                                const brightnessFactor = 1 + (Math.random() * 0.04 - 0.02);
                                const contrastFactor = 1 + (Math.random() * 0.04 - 0.02);
                                const avg = 128;

                                for (let i = 0; i < data.length; i += 4) {
                                    data[i] = Math.min(255, Math.max(0, data[i] * brightnessFactor));
                                    data[i+1] = Math.min(255, Math.max(0, data[i+1] * brightnessFactor));
                                    data[i+2] = Math.min(255, Math.max(0, data[i+2] * brightnessFactor));

                                    data[i] = Math.min(255, Math.max(0, avg + (data[i] - avg) * contrastFactor));
                                    data[i+1] = Math.min(255, Math.max(0, avg + (data[i+1] - avg) * contrastFactor));
                                    data[i+2] = Math.min(255, Math.max(0, avg + (data[i+2] - avg) * contrastFactor));
                                }
                                ctx.putImageData(imageData, 0, 0);
                            }

                            if (action === 'remove' || document.getElementById('addNoise').checked) {
                                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                                const data = imageData.data;
                                const noiseProbability = action === 'remove' ? 0.1 : 0.05;

                                for (let i = 0; i < data.length; i += 4) {
                                    if (Math.random() < noiseProbability) {
                                        data[i] += Math.floor(Math.random() * 10 - 5);
                                        data[i+1] += Math.floor(Math.random() * 10 - 5);
                                        data[i+2] += Math.floor(Math.random() * 10 - 5);
                                    }
                                }
                                ctx.putImageData(imageData, 0, 0);
                            }

                            const outputFormat = options.convertToWebP ? 'image/webp' : file.type;
                            const mimeType = outputFormat === 'image/jpeg' ? 'image/jpeg' :
                                outputFormat === 'image/png' ? 'image/png' :
                                    outputFormat === 'image/webp' ? 'image/webp' :
                                        outputFormat === 'image/gif' ? 'image/gif' :
                                            'image/jpeg';

                            const quality = outputFormat === 'image/webp' ? 0.85 : 0.99 + Math.random() * 0.01;

                            canvas.toBlob(async blob => {
                                try {
                                    const newFileName = generateUniqueFilename(file.name, action, options.convertToWebP, index);

                                    let resultBlob = blob;

                                    if (action === 'remove') {
                                        resultBlob = await stripAllMetadata(blob, mimeType, options);
                                    } else if (action === 'random') {
                                        resultBlob = await addRandomMetadata(blob, mimeType, options);
                                    }

                                    resolve(new File([resultBlob], newFileName, { type: mimeType }));
                                } catch (error) {
                                    reject(error);
                                }
                            }, mimeType, quality);
                        } catch (error) {
                            reject(error);
                        }
                    };
                    img.onerror = () => reject(new Error('Ошибка загрузки изображения'));
                    img.src = e.target.result;
                } catch (error) {
                    reject(error);
                }
            };
            reader.onerror = () => reject(new Error('Ошибка чтения файла'));
            reader.readAsDataURL(file);
        });
    }

    async function processSpecialFormat(file, action, options) {
        const newFileName = options.keepOriginalName ?
            file.name :
            generateUniqueFilename(file.name, action, false, 0);

        return new File([file], newFileName, { type: file.type });
    }

    async function addRandomMetadata(blob, mimeType, options) {
        if (mimeType !== 'image/jpeg' || !options.addRandomMetadata) {
            return blob;
        }

        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = function(e) {
                try {
                    if (typeof piexif === 'undefined') {
                        reject(new Error('piexif library not loaded'));
                        return;
                    }

                    const randomDate = getRandomDate();
                    const device = getRandomDevice();
                    const software = getRandomSoftware();
                    const location = getRandomLocation();

                    const exifObj = {
                        "0th": {
                            [piexif.ImageIFD.Make]: device.make,
                            [piexif.ImageIFD.Model]: device.model,
                            [piexif.ImageIFD.Software]: software,
                            [piexif.ImageIFD.DateTime]: formatExifDate(randomDate),
                            [piexif.ImageIFD.ImageDescription]: `Image ${Math.random().toString(36).substring(2, 8)}`,
                            [piexif.ImageIFD.XResolution]: [Math.floor(Math.random() * 300) + 72, 1],
                            [piexif.ImageIFD.YResolution]: [Math.floor(Math.random() * 300) + 72, 1],
                            [piexif.ImageIFD.ResolutionUnit]: Math.floor(Math.random() * 3) + 1
                        },
                        "Exif": {
                            [piexif.ExifIFD.DateTimeOriginal]: formatExifDate(randomDate),
                            [piexif.ExifIFD.DateTimeDigitized]: formatExifDate(randomDate),
                            [piexif.ExifIFD.ExposureTime]: `1/${Math.floor(Math.random() * 2000) + 100}`,
                            [piexif.ExifIFD.FNumber]: [Math.floor(Math.random() * 50) + 10, 10],
                            [piexif.ExifIFD.ISOSpeedRatings]: Math.floor(Math.random() * 3200) + 100,
                            [piexif.ExifIFD.FocalLength]: [Math.floor(Math.random() * 500) + 10, 10],
                            [piexif.ExifIFD.LensMake]: device.make,
                            [piexif.ExifIFD.LensModel]: `${device.model} Lens`,
                            [piexif.ExifIFD.ColorSpace]: Math.random() > 0.5 ? 1 : 65535,
                            [piexif.ExifIFD.PixelXDimension]: Math.floor(Math.random() * 1000) + 1000,
                            [piexif.ExifIFD.PixelYDimension]: Math.floor(Math.random() * 1000) + 1000,
                            [piexif.ExifIFD.ExposureMode]: Math.floor(Math.random() * 3),
                            [piexif.ExifIFD.WhiteBalance]: Math.floor(Math.random() * 2),
                            [piexif.ExifIFD.SceneCaptureType]: Math.floor(Math.random() * 4)
                        },
                        "GPS": location ? {
                            [piexif.GPSIFD.GPSLatitudeRef]: location.lat > 0 ? 'N' : 'S',
                            [piexif.GPSIFD.GPSLatitude]: convertDecimalToDMS(Math.abs(location.lat)),
                            [piexif.GPSIFD.GPSLongitudeRef]: location.lng > 0 ? 'E' : 'W',
                            [piexif.GPSIFD.GPSLongitude]: convertDecimalToDMS(Math.abs(location.lng)),
                            [piexif.GPSIFD.GPSAltitudeRef]: 0,
                            [piexif.GPSIFD.GPSAltitude]: [Math.floor(Math.random() * 1000), 1],
                            [piexif.GPSIFD.GPSTimeStamp]: [
                                [randomDate.getHours(), 1],
                                [randomDate.getMinutes(), 1],
                                [randomDate.getSeconds(), 1]
                            ],
                            [piexif.GPSIFD.GPSDateStamp]: formatExifDate(randomDate).split(' ')[0].replace(/:/g, '-')
                        } : {}
                    };

                    const exifbytes = piexif.dump(exifObj);
                    const newData = piexif.insert(exifbytes, e.target.result);
                    resolve(dataURItoBlob(newData));
                } catch (error) {
                    reject(error);
                }
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    }

    function getRandomDevice() {
        const customCamera = document.getElementById('customCamera').checked;
        const cameraSelect = document.getElementById('cameraSelect');

        if (customCamera) {
            const selectedCamera = cameraSelect.value;
            const cameras = {
                canon: { make: 'Canon', model: 'EOS 5D Mark IV' },
                nikon: { make: 'Nikon', model: 'D850' },
                sony: { make: 'Sony', model: 'A7R IV' },
                fujifilm: { make: 'Fujifilm', model: 'X-T4' },
                panasonic: { make: 'Panasonic', model: 'Lumix GH5' },
                leica: { make: 'Leica', model: 'Q2' },
                apple: { make: 'Apple', model: 'iPhone 15 Pro' },
                samsung: { make: 'Samsung', model: 'Galaxy S23 Ultra' },
                google: { make: 'Google', model: 'Pixel 7 Pro' },
                hasselblad: { make: 'Hasselblad', model: 'X1D II 50C' }
            };
            return cameras[selectedCamera];
        }

        // Если не выбран конкретный фотоаппарат, используем случайный
        const devices = [
            { make: 'Canon', model: 'EOS 5D Mark IV' },
            { make: 'Nikon', model: 'D850' },
            { make: 'Sony', model: 'A7R IV' },
            { make: 'Fujifilm', model: 'X-T4' },
            { make: 'Panasonic', model: 'Lumix GH5' },
            { make: 'Leica', model: 'Q2' },
            { make: 'Apple', model: 'iPhone 15 Pro' },
            { make: 'Samsung', model: 'Galaxy S23 Ultra' },
            { make: 'Google', model: 'Pixel 7 Pro' },
            { make: 'Hasselblad', model: 'X1D II 50C' }
        ];
        return devices[Math.floor(Math.random() * devices.length)];
    }

    function getRandomSoftware() {
        const softwareList = [
            'Adobe Photoshop 24.0',
            'Adobe Lightroom Classic 12.0',
            'Capture One 23',
            'DxO PhotoLab 6',
            'GIMP 2.10',
            'Affinity Photo 2.0',
            'Darktable 4.0',
            'Skylum Luminar Neo',
            'ON1 Photo RAW 2023',
            'Snapseed 2.0',
            'VSCO',
            'Instagram',
            'Pixelmator Pro',
            'Corel PaintShop Pro',
            'Phase One Capture One'
        ];
        return softwareList[Math.floor(Math.random() * softwareList.length)];
    }

    function getRandomLocation() {
        const customCountry = document.getElementById('customCountry').checked;
        const countrySelect = document.getElementById('countrySelect');

        if (customCountry) {
            const selectedCountry = countrySelect.value;
            const baseLocations = {
                // Европа
                paris: { lat: 48.8566, lng: 2.3522 },
                berlin: { lat: 52.5200, lng: 13.4050 },
                rome: { lat: 41.9028, lng: 12.4964 },
                madrid: { lat: 40.4168, lng: -3.7038 },
                lisbon: { lat: 38.7223, lng: -9.1393 },
                amsterdam: { lat: 52.3676, lng: 4.9041 },
                vienna: { lat: 48.2082, lng: 16.3738 },
                prague: { lat: 50.0755, lng: 14.4378 },
                warsaw: { lat: 52.2297, lng: 21.0122 },
                budapest: { lat: 47.4979, lng: 19.0402 },
                brussels: { lat: 50.8503, lng: 4.3517 },
                copenhagen: { lat: 55.6761, lng: 12.5683 },
                helsinki: { lat: 60.1699, lng: 24.9384 },
                stockholm: { lat: 59.3293, lng: 18.0686 },
                oslo: { lat: 59.9139, lng: 10.7522 },
                dublin: { lat: 53.3498, lng: -6.2603 },
                london: { lat: 51.5074, lng: -0.1278 },
                zurich: { lat: 47.3769, lng: 8.5417 },
                athens: { lat: 37.9838, lng: 23.7275 },
                sofia: { lat: 42.6977, lng: 23.3219 },
                bucharest: { lat: 44.4268, lng: 26.1025 },
                zagreb: { lat: 45.8150, lng: 15.9819 },
                ljubljana: { lat: 46.0569, lng: 14.5058 },
                bratislava: { lat: 48.1486, lng: 17.1077 },
                tallinn: { lat: 59.4370, lng: 24.7536 },
                riga: { lat: 56.9496, lng: 24.1052 },
                vilnius: { lat: 54.6872, lng: 25.2797 },
                reykjavik: { lat: 64.1265, lng: -21.8174 },
                valletta: { lat: 35.8989, lng: 14.5146 },
                nicosia: { lat: 35.1856, lng: 33.3823 },
                tirana: { lat: 41.3275, lng: 19.8187 },
                podgorica: { lat: 42.4304, lng: 19.2594 },
                skopje: { lat: 42.0038, lng: 21.4522 },
                belgrade: { lat: 44.7866, lng: 20.4489 },
                sarajevo: { lat: 43.8563, lng: 18.4131 },
                chisinau: { lat: 47.0105, lng: 28.8638 },
                yerevan: { lat: 40.1792, lng: 44.4991 },
                tbilisi: { lat: 41.7151, lng: 44.8271 },
                astana: { lat: 51.1694, lng: 71.4491 },
                bishkek: { lat: 42.8746, lng: 74.5698 },
                dushanbe: { lat: 38.5598, lng: 68.7870 },
                ashgabat: { lat: 37.9601, lng: 58.3261 },
                tashkent: { lat: 41.2995, lng: 69.2401 },

                // Северная Америка
                newyork: { lat: 40.7128, lng: -74.0060 },
                losangeles: { lat: 34.0522, lng: -118.2437 },
                chicago: { lat: 41.8781, lng: -87.6298 },
                miami: { lat: 25.7617, lng: -80.1918 },
                toronto: { lat: 43.6532, lng: -79.3832 },
                vancouver: { lat: 49.2827, lng: -123.1207 },
                montreal: { lat: 45.5017, lng: -73.5673 },

                // Азия
                tokyo: { lat: 35.6762, lng: 139.6503 },
                seoul: { lat: 37.5665, lng: 126.9780 },
                singapore: { lat: 1.3521, lng: 103.8198 },
                taipei: { lat: 25.0330, lng: 121.5654 },
                hongkong: { lat: 22.3193, lng: 114.1694 },
                bangkok: { lat: 13.7563, lng: 100.5018 },
                kualalumpur: { lat: 3.1390, lng: 101.6869 },
                jakarta: { lat: -6.2088, lng: 106.8456 },
                manila: { lat: 14.5995, lng: 120.9842 },
                hanoi: { lat: 21.0278, lng: 105.8342 },
                phnompenh: { lat: 11.5564, lng: 104.9282 },
                vientiane: { lat: 17.9757, lng: 102.6331 },
                yangon: { lat: 16.8409, lng: 96.1735 },

                // Ближний Восток
                dubai: { lat: 25.2048, lng: 55.2708 },
                abudhabi: { lat: 24.4539, lng: 54.3773 },
                doha: { lat: 25.2769, lng: 51.5200 },
                manama: { lat: 26.2285, lng: 50.5860 },
                muscat: { lat: 23.5859, lng: 58.4059 },
                kuwait: { lat: 29.3759, lng: 47.9774 },
                riyadh: { lat: 24.7136, lng: 46.6753 },
                telaviv: { lat: 32.0853, lng: 34.7818 },
                amman: { lat: 31.9454, lng: 35.9284 },
                beirut: { lat: 33.8938, lng: 35.5018 },

                // Океания
                sydney: { lat: -33.8688, lng: 151.2093 },
                melbourne: { lat: -37.8136, lng: 144.9631 },
                auckland: { lat: -36.8485, lng: 174.7633 },
                wellington: { lat: -41.2866, lng: 174.7756 }
            };

            const baseLocation = baseLocations[selectedCountry];
            // Добавляем небольшие случайные отклонения для каждого фото
            return {
                lat: baseLocation.lat + (Math.random() * 0.1 - 0.05),
                lng: baseLocation.lng + (Math.random() * 0.1 - 0.05)
            };
        }

        // Если не выбрана конкретная страна, используем случайную из безопасных локаций
        const safeLocations = [
            // Европа
            { lat: 48.8566, lng: 2.3522 }, // Париж
            { lat: 52.5200, lng: 13.4050 }, // Берлин
            { lat: 41.9028, lng: 12.4964 }, // Рим
            { lat: 40.4168, lng: -3.7038 }, // Мадрид
            { lat: 38.7223, lng: -9.1393 }, // Лиссабон
            { lat: 52.3676, lng: 4.9041 }, // Амстердам
            { lat: 48.2082, lng: 16.3738 }, // Вена
            { lat: 50.0755, lng: 14.4378 }, // Прага
            { lat: 52.2297, lng: 21.0122 }, // Варшава
            { lat: 47.4979, lng: 19.0402 }, // Будапешт
            { lat: 50.8503, lng: 4.3517 }, // Брюссель
            { lat: 55.6761, lng: 12.5683 }, // Копенгаген
            { lat: 60.1699, lng: 24.9384 }, // Хельсинки
            { lat: 59.3293, lng: 18.0686 }, // Стокгольм
            { lat: 59.9139, lng: 10.7522 }, // Осло
            { lat: 53.3498, lng: -6.2603 }, // Дублин
            { lat: 51.5074, lng: -0.1278 }, // Лондон
            { lat: 47.3769, lng: 8.5417 }, // Цюрих
            { lat: 37.9838, lng: 23.7275 }, // Афины
            { lat: 42.6977, lng: 23.3219 }, // София
            { lat: 44.4268, lng: 26.1025 }, // Бухарест
            { lat: 45.8150, lng: 15.9819 }, // Загреб
            { lat: 46.0569, lng: 14.5058 }, // Любляна
            { lat: 48.1486, lng: 17.1077 }, // Братислава
            { lat: 59.4370, lng: 24.7536 }, // Таллин
            { lat: 56.9496, lng: 24.1052 }, // Рига
            { lat: 54.6872, lng: 25.2797 }, // Вильнюс
            { lat: 64.1265, lng: -21.8174 }, // Рейкьявик
            { lat: 35.8989, lng: 14.5146 }, // Валлетта
            { lat: 35.1856, lng: 33.3823 }, // Никосия
            { lat: 41.3275, lng: 19.8187 }, // Тирана
            { lat: 42.4304, lng: 19.2594 }, // Подгорица
            { lat: 42.0038, lng: 21.4522 }, // Скопье
            { lat: 44.7866, lng: 20.4489 }, // Белград
            { lat: 43.8563, lng: 18.4131 }, // Сараево
            { lat: 47.0105, lng: 28.8638 }, // Кишинев
            { lat: 40.1792, lng: 44.4991 }, // Ереван
            { lat: 41.7151, lng: 44.8271 }, // Тбилиси
            { lat: 51.1694, lng: 71.4491 }, // Астана
            { lat: 42.8746, lng: 74.5698 }, // Бишкек
            { lat: 38.5598, lng: 68.7870 }, // Душанбе
            { lat: 37.9601, lng: 58.3261 }, // Ашхабад
            { lat: 41.2995, lng: 69.2401 }, // Ташкент

            // Северная Америка
            { lat: 40.7128, lng: -74.0060 }, // Нью-Йорк
            { lat: 34.0522, lng: -118.2437 }, // Лос-Анджелес
            { lat: 41.8781, lng: -87.6298 }, // Чикаго
            { lat: 25.7617, lng: -80.1918 }, // Майами
            { lat: 43.6532, lng: -79.3832 }, // Торонто
            { lat: 49.2827, lng: -123.1207 }, // Ванкувер
            { lat: 45.5017, lng: -73.5673 }, // Монреаль

            // Азия
            { lat: 35.6762, lng: 139.6503 }, // Токио
            { lat: 37.5665, lng: 126.9780 }, // Сеул
            { lat: 1.3521, lng: 103.8198 }, // Сингапур
            { lat: 25.0330, lng: 121.5654 }, // Тайбэй
            { lat: 22.3193, lng: 114.1694 }, // Гонконг
            { lat: 13.7563, lng: 100.5018 }, // Бангкок
            { lat: 3.1390, lng: 101.6869 }, // Куала-Лумпур
            { lat: -6.2088, lng: 106.8456 }, // Джакарта
            { lat: 14.5995, lng: 120.9842 }, // Манила
            { lat: 21.0278, lng: 105.8342 }, // Ханой
            { lat: 11.5564, lng: 104.9282 }, // Пномпень
            { lat: 17.9757, lng: 102.6331 }, // Вьентьян
            { lat: 16.8409, lng: 96.1735 }, // Янгон

            // Ближний Восток
            { lat: 25.2048, lng: 55.2708 }, // Дубай
            { lat: 24.4539, lng: 54.3773 }, // Абу-Даби
            { lat: 25.2769, lng: 51.5200 }, // Доха
            { lat: 26.2285, lng: 50.5860 }, // Манама
            { lat: 23.5859, lng: 58.4059 }, // Маскат
            { lat: 29.3759, lng: 47.9774 }, // Кувейт
            { lat: 24.7136, lng: 46.6753 }, // Эр-Рияд
            { lat: 32.0853, lng: 34.7818 }, // Тель-Авив
            { lat: 31.9454, lng: 35.9284 }, // Амман
            { lat: 33.8938, lng: 35.5018 }, // Бейрут

            // Океания
            { lat: -33.8688, lng: 151.2093 }, // Сидней
            { lat: -37.8136, lng: 144.9631 }, // Мельбурн
            { lat: -36.8485, lng: 174.7633 }, // Окленд
            { lat: -41.2866, lng: 174.7756 } // Веллингтон
        ];

        const loc = safeLocations[Math.floor(Math.random() * safeLocations.length)];
        return {
            lat: loc.lat + (Math.random() * 0.1 - 0.05),
            lng: loc.lng + (Math.random() * 0.1 - 0.05)
        };
    }

    function getRandomDate() {
        const customDates = document.getElementById('customDates').checked;
        const dateFrom = document.getElementById('dateFrom');
        const dateTo = document.getElementById('dateTo');

        if (customDates && dateFrom.value && dateTo.value) {
            const start = new Date(dateFrom.value);
            const end = new Date(dateTo.value);
            return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
        }

        // Если не выбран диапазон дат, используем случайную дату за последние 5 лет
        const start = new Date();
        start.setFullYear(start.getFullYear() - 5);
        return new Date(start.getTime() + Math.random() * (new Date().getTime() - start.getTime()));
    }

    function formatExifDate(date) {
        const pad = num => num.toString().padStart(2, '0');
        return `${date.getFullYear()}:${pad(date.getMonth()+1)}:${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
    }

    function convertDecimalToDMS(decimal) {
        const degrees = Math.floor(decimal);
        const minutes = Math.floor((decimal - degrees) * 60);
        const seconds = ((decimal - degrees - minutes / 60) * 3600).toFixed(2);
        return [
            [degrees, 1],
            [minutes, 1],
            [seconds * 100, 100]
        ];
    }

    function dataURItoBlob(dataURI) {
        const byteString = atob(dataURI.split(',')[1]);
        const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }
        return new Blob([ab], { type: mimeString });
    }

    function generateUniqueFilename(originalName, action, isWebP, index) {
        const ext = isWebP ? 'webp' : originalName.split('.').pop();

        // Если включено сохранение оригинального имени
        if (document.getElementById('keepOriginalName').checked) {
            return originalName;
        }

        // Если включено использование списка названий
        if (useCustomNames.checked) {
            const names = customNames.value.split('\n').filter(line => line.trim() !== '');
            if (names.length > 0) {
                // Если есть достаточно имен, используем их
                if (index < names.length) {
                    return `${names[index].trim()}.${ext}`;
                }
            }
        }

        // Если не используется список имен или их недостаточно, генерируем случайное
        const randomStr = Math.random().toString(36).substring(2, 8);
        const randomDate = new Date();
        const dateStr = `${randomDate.getFullYear()}${(randomDate.getMonth()+1).toString().padStart(2, '0')}${randomDate.getDate().toString().padStart(2, '0')}`;
        const timeStr = `${randomDate.getHours()}${randomDate.getMinutes()}${randomDate.getSeconds()}`;
        return `${action}_${dateStr}_${timeStr}_${randomStr}.${ext}`;
    }

    // Обработчики для новых элементов управления
    document.getElementById('customCountry').addEventListener('change', function() {
        document.getElementById('countrySelectContainer').style.display = this.checked ? 'block' : 'none';
    });

    document.getElementById('customCamera').addEventListener('change', function() {
        document.getElementById('cameraSelectContainer').style.display = this.checked ? 'block' : 'none';
    });

    document.getElementById('customDates').addEventListener('change', function() {
        document.getElementById('datesSelectContainer').style.display = this.checked ? 'block' : 'none';
    });
});

// Обработчик кнопки "Сказать спасибо"
document.getElementById('thankYouBtn').addEventListener('click', function() {
    const options = document.getElementById('thankYouOptions');
    if (options.style.display === 'none') {
        options.style.display = 'block';
    } else {
        options.style.display = 'none';
    }
});