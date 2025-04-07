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

    fileInput.addEventListener('change', () => {
        if (fileInput.files.length) {
            addFiles(fileInput.files);
        }
    });

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
                const processedFile = await processImage(file, action, options);
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

    async function processImage(file, action, options) {
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

                            const rotationEnabled = action === 'remove'
                                ? document.getElementById('addRotation').checked
                                : document.getElementById('addRotationRandom').checked;

                            if (rotationEnabled) {
                                const rotationAngle = (Math.random() * 0.4 + 0.1) * (Math.random() > 0.5 ? 1 : -1);
                                ctx.translate(canvas.width / 2, canvas.height / 2);
                                ctx.rotate(rotationAngle * Math.PI / 180);
                                ctx.translate(-canvas.width / 2, -canvas.height / 2);
                            }

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
                                    const newFileName = options.keepOriginalName ?
                                        file.name.replace(/\.[^/.]+$/, '') +
                                        (options.convertToWebP ? '.webp' : `.${mimeType.split('/')[1]}`) :
                                        generateUniqueFilename(file.name, action, options.convertToWebP);

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
            generateUniqueFilename(file.name, action, false);

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

                    const randomDate = getRandomDate(new Date(2018, 0, 1), new Date());
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
            { make: 'Hasselblad', model: 'X1D II 50C' },
            { make: 'Olympus', model: 'OM-D E-M1 Mark III' },
            { make: 'Pentax', model: 'K-1 Mark II' }
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
        const safeLocations = [
            { city: 'Paris', lat: 48.8566, lng: 2.3522 },
            { city: 'Berlin', lat: 52.5200, lng: 13.4050 },
            { city: 'Rome', lat: 41.9028, lng: 12.4964 },
            { city: 'Madrid', lat: 40.4168, lng: -3.7038 },
            { city: 'Lisbon', lat: 38.7223, lng: -9.1393 },
            { city: 'Amsterdam', lat: 52.3676, lng: 4.9041 },
            { city: 'Vienna', lat: 48.2082, lng: 16.3738 },
            { city: 'Prague', lat: 50.0755, lng: 14.4378 },
            { city: 'Warsaw', lat: 52.2297, lng: 21.0122 },
            { city: 'New York', lat: 40.7128, lng: -74.0060 },
            { city: 'Los Angeles', lat: 34.0522, lng: -118.2437 },
            { city: 'Toronto', lat: 43.6532, lng: -79.3832 },
            { city: 'Mexico City', lat: 19.4326, lng: -99.1332 },
            { city: 'Buenos Aires', lat: -34.6037, lng: -58.3816 },
            { city: 'Tokyo', lat: 35.6762, lng: 139.6503 },
            { city: 'Seoul', lat: 37.5665, lng: 126.9780 },
            { city: 'Singapore', lat: 1.3521, lng: 103.8198 },
            { city: 'Sydney', lat: -33.8688, lng: 151.2093 },
            { city: 'Dubai', lat: 25.2048, lng: 55.2708 }
        ];

        if (Math.random() < 0.3) return null;

        const loc = safeLocations[Math.floor(Math.random() * safeLocations.length)];
        return {
            lat: loc.lat + (Math.random() * 0.1 - 0.05),
            lng: loc.lng + (Math.random() * 0.1 - 0.05)
        };
    }

    function getRandomDate(start, end) {
        return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
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

    function generateUniqueFilename(originalName, action, isWebP) {
        const ext = isWebP ? 'webp' : originalName.split('.').pop();
        const randomStr = Math.random().toString(36).substring(2, 8);
        const randomDate = new Date();
        const dateStr = `${randomDate.getFullYear()}${(randomDate.getMonth()+1).toString().padStart(2, '0')}${randomDate.getDate().toString().padStart(2, '0')}`;
        const timeStr = `${randomDate.getHours()}${randomDate.getMinutes()}${randomDate.getSeconds()}`;
        return `${action}_${dateStr}_${timeStr}_${randomStr}.${ext}`;
    }
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