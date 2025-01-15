const fileInput = document.getElementById('file-input');
const addFilesBtn = document.getElementById('add-files-btn');
const fileList = document.querySelector('.file-list');
const saveAllBtn = document.getElementById('save-all-btn');
const downloadAllBtn = document.getElementById('download-all-btn');
const fileCountDisplay = document.getElementById('file-count');
const modal = document.getElementById('modal');
const modalTextarea = document.getElementById('modal-textarea');
const closeModalBtn = document.getElementById('close-modal');
const modalSaveBtn = document.getElementById('modal-save-btn');

let fileCount = 0;
const MAX_FILES = 50;
let currentFileContainer;

addFilesBtn.addEventListener('click', () => fileInput.click());

fileInput.addEventListener('change', handleFileUpload);

function handleFileUpload(event) {
    const files = event.target.files;

    for (const file of files) {
        if (fileCount >= MAX_FILES) {
            break;
        }

        const reader = new FileReader();

        reader.onload = () => {
            addFile(file.name, reader.result);
        };

        reader.readAsText(file);
    }

    fileInput.value = '';
}

function addFile(fileName, fileContent) {
    const template = document.getElementById('file-template');
    const fileContainer = template.content.cloneNode(true).firstElementChild;

    const nameElement = fileContainer.querySelector('.file-name-input');
    const contentElement = fileContainer.querySelector('.file-content');
    const deleteBtn = fileContainer.querySelector('.delete-file-btn');
    const saveBtn = fileContainer.querySelector('.save-file-btn');
    const downloadBtn = fileContainer.querySelector('.download-file-btn');

    nameElement.value = fileName;
    contentElement.value = fileContent;

    // Подсвечивание при редактировании названия
    nameElement.addEventListener('focus', () => {
        nameElement.classList.add('highlight'); // Подсветить при редактировании
    });

    nameElement.addEventListener('blur', () => {
        nameElement.classList.remove('highlight'); // Убрать подсветку при потере фокуса
        fileName = nameElement.value; // Сохранить новое название
    });

    deleteBtn.addEventListener('click', () => {
        fileContainer.remove();
        fileCount--;
        updateFileCount();
    });

    saveBtn.addEventListener('click', () => {
        saveFile(fileName, contentElement.value);
        if (fileContainer) {
            fileContainer.style.backgroundColor = 'lightgreen';
        }
    });

    downloadBtn.addEventListener('click', () => {
        downloadFile(fileName, contentElement.value);
        fileContainer.remove();
        fileCount--;
        updateFileCount();
    });

    let lastClickTime = 0;
    fileContainer.addEventListener('click', () => {
        const now = new Date().getTime();
        if (now - lastClickTime < 300) {  // Если разница между кликами меньше 300 мс
            openModal(fileContainer);  // Открытие модального окна
        }
        lastClickTime = now;  // Сохранение времени последнего клика
    });


    fileList.appendChild(fileContainer);
    fileCount++;
    updateFileCount();
}

function saveFile(fileName, fileContent) {
    console.log(`Файл ${fileName} сохранён с содержимым:`, fileContent);
}

function downloadFile(fileName, fileContent) {
    const blob = new Blob([fileContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
}

saveAllBtn.addEventListener('click', () => {
    const fileContainers = fileList.querySelectorAll('.file-container');

    fileContainers.forEach(fileContainer => {
        const fileName = fileContainer.querySelector('.file-name-input').value;
        const fileContent = fileContainer.querySelector('.file-content').value;
        saveFile(fileName, fileContent);
        if (fileContainer) {
            fileContainer.style.backgroundColor = 'lightgreen';
        }
    });
});

downloadAllBtn.addEventListener('click', () => {
    const zip = new JSZip();
    const fileContainers = fileList.querySelectorAll('.file-container');

    fileContainers.forEach(fileContainer => {
        const fileName = fileContainer.querySelector('.file-name-input').value;
        const fileContent = fileContainer.querySelector('.file-content').value;

        // Добавляем файл в архив
        zip.file(fileName, fileContent);
    });

    // Создаем и скачиваем ZIP-файл
    zip.generateAsync({ type: 'blob' }).then(content => {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(content);
        link.download = 'all_files.zip'; // Название архива
        link.click();

        // После скачивания архива очищаем список файлов
        fileList.innerHTML = ''; // Очистить список файлов
        fileCount = 0; // Сбросить счетчик файлов
        updateFileCount(); // Обновить отображение количества файлов
    });
});


function openModal(fileContainer) {
    currentFileContainer = fileContainer;
    modalTextarea.value = fileContainer.querySelector('.file-content').value;
    modal.style.display = 'block';
}

closeModalBtn.addEventListener('click', closeModal);
modalSaveBtn.addEventListener('click', saveModalContent);

function closeModal() {
    modal.style.display = 'none';
}

function saveModalContent() {
    const newContent = modalTextarea.value;
    currentFileContainer.querySelector('.file-content').value = newContent;
    saveFile(currentFileContainer.querySelector('.file-name-input').value, newContent);

    // Изменение фона на светло-зеленый в контейнере файла после сохранения изменений
    if (currentFileContainer) {
        currentFileContainer.style.backgroundColor = 'lightgreen';
    }

    closeModal();
}


function updateFileCount() {
    fileCountDisplay.textContent = `Файлов: ${fileCount} / ${MAX_FILES}`;
}

