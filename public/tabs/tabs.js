// Массив для хранения данных о вкладках
let tabsData = [];

// Объект для хранения количества кликов по каждой ссылке в каждой вкладке
let linkClickCounts = {};

// Массив для хранения добавленных быстрых рубрик
let quickRubrics = [];

// Флаг для отслеживания состояния вкладок (скрыты или отображены)
let areTabsHidden = false;

// Получаем элементы формы и контейнер вкладок
const addForm = document.getElementById('addForm');
const tabsContainer = document.getElementById('tabsContainer');
const quickRubricInput = document.getElementById('quickRubricInput');
const quickRubricsList = document.getElementById('quickRubricsList');
const rubricInput = document.getElementById('rubricInput');
const toggleButton = document.getElementById('toggleTabsBtn');

// Событие на добавление вкладки
addForm.addEventListener('submit', function(event) {
    event.preventDefault();
    const rubric = rubricInput.value.trim();
    const link = document.getElementById('linkInput').value.trim();
    const description = document.getElementById('descriptionInput').value.trim();

    if (rubric === '' || link === '') {
        alert('Пожалуйста, заполните оба поля.');
        return;
    }

    addTab(rubric, link, description);
    addForm.reset();
});

// Функция проверки на дублирующиеся ссылки
function isDuplicateLink(link) {
    return tabsData.some(tab => tab.link === link);
}

// Функция для обновления локального хранилища
function updateLocalStorage() {
    localStorage.setItem('tabsData', JSON.stringify(tabsData));
}

// Функция для добавления новой быстрой рубрики
function createQuickRubricButton(rubric) {
    const button = document.createElement('button');
    button.textContent = rubric;
    button.classList.add('quick-rubric-button');
    button.addEventListener('click', function() {
        // При клике на кнопку быстрой рубрики заполняем поле ввода "Рубрика"
        rubricInput.value = rubric;
    });

    // Добавляем кнопку в список быстрых рубрик
    quickRubricsList.appendChild(button);
}

// Функция для добавления вкладки
function addTab(rubric, link, description) {
    // Проверяем наличие дублирующейся ссылки
    if (isDuplicateLink(link)) {
        alert('Такая ссылка уже добавлена!');
        return;
    }

    // Создаем элементы для вкладки
    const tab = document.createElement('div');
    tab.classList.add('tab');
    tab.setAttribute('data-name', rubric); // Устанавливаем data-name для вкладки

    const info = document.createElement('div');
    info.classList.add('info');

    const thumbnail = document.createElement('img');
    thumbnail.src = `https://www.google.com/s2/favicons?sz=64&domain_url=${link}`;

    const text = document.createElement('div');
    text.classList.add('text');
    const linkElement = document.createElement('a');
    linkElement.href = link;
    linkElement.target = '_blank';
    linkElement.textContent = link;
    // Добавляем слушатель на клик по ссылке для подсчёта переходов
    linkElement.addEventListener('click', function() {
        countClick(rubric, link);
    });
    text.appendChild(linkElement);

    const descriptionElement = document.createElement('div');
    descriptionElement.classList.add('description');
    descriptionElement.textContent = description;

    const actions = document.createElement('div');
    actions.classList.add('actions');
    actions.innerHTML = `
        <button onclick="removeTab(this)">Удалить</button>
    `;

    info.appendChild(thumbnail);
    info.appendChild(text);
    tab.appendChild(info);
    tab.appendChild(descriptionElement);
    tab.appendChild(actions);

    // Добавляем рубрику, если новая
    let rubricElement = tabsContainer.querySelector(`.rubric[data-name="${rubric}"]`);
    if (!rubricElement) {
        rubricElement = document.createElement('div');
        rubricElement.classList.add('rubric');
        rubricElement.setAttribute('data-name', rubric);
        rubricElement.innerHTML = `
            ${rubric} 
            <button onclick="toggleRubric(this)">-</button>
        `;
        // Вставляем новую рубрику перед вкладками
        tabsContainer.appendChild(rubricElement);
    }

    // Добавляем вкладку в соответствующую рубрику
    rubricElement.insertAdjacentElement('afterend', tab);

    // Добавляем данные о вкладке в массив
    const tabData = {
        rubric: rubric,
        link: link,
        description: description,
        linkClickCounts: linkClickCounts[rubric] ? linkClickCounts[rubric] : {},
    };
    tabsData.push(tabData);

    // Сохраняем индекс вкладки в атрибуте данных
    tab.setAttribute('data-index', tabsData.length - 1);

    // Обновляем локальное хранилище
    updateLocalStorage();

    // Проверяем количество вкладок
    const tabsCount = tabsContainer.querySelectorAll('.tab').length;

    if (tabsCount > 0) {
        toggleButton.removeAttribute('disabled');
    } else {
        toggleButton.setAttribute('disabled', 'disabled');
    }
}

// Функция для подсчёта переходов по конкретной ссылке вкладки и обновления UI
function countClick(rubric, link) {
    const tabData = tabsData.find(tab => tab.rubric === rubric && tab.link === link);
    if (tabData) {
        if (!tabData.linkClickCounts[link]) {
            tabData.linkClickCounts[link] = 0;
        }
        tabData.linkClickCounts[link]++;
        updateClickCountUI(rubric, link, tabData.linkClickCounts[link]);
    }
}

// Функция для обновления отображения количества кликов по конкретной ссылке вкладки
function updateClickCountUI(rubric, link, count) {
    const tab = [...document.querySelectorAll('.tab')].find(tab => tab.getAttribute('data-name') === rubric && tab.querySelector('a').href === link);
    if (tab) {
        let countElement = tab.querySelector('.click-count');
        if (!countElement) {
            countElement = document.createElement('span');
            countElement.classList.add('click-count');
            tab.querySelector('.info').appendChild(countElement);
        }
        countElement.textContent = `Кликов: ${count}`;
    }
}


// Функция для удаления вкладки
function removeTab(button) {
    const tabToRemove = button.closest('.tab');
    const tabIndex = parseInt(tabToRemove.getAttribute('data-index'));

    // Удаляем вкладку из массива tabsData
    tabsData.splice(tabIndex, 1);

    // Обновляем атрибуты data-index для оставшихся вкладок
    tabsContainer.querySelectorAll('.tab').forEach((tab, index) => {
        tab.setAttribute('data-index', index);
    });

    // Удаляем DOM элемент вкладки
    tabToRemove.remove();

    // Обновляем локальное хранилище
    updateLocalStorage();

    // Проверяем, есть ли еще вкладки с такой же рубрикой
    const rubricName = tabToRemove.getAttribute('data-name');
    if (rubricName) {
        const tabsInRubric = tabsContainer.querySelectorAll(`.tab[data-name="${rubricName}"]`);

        // Если в рубрике больше нет вкладок, удаляем рубрику
        if (tabsInRubric.length === 0) {
            const rubricElement = tabsContainer.querySelector(`.rubric[data-name="${rubricName}"]`);
            if (rubricElement) {
                rubricElement.remove();
            }
        }
    }

    // Проверяем количество вкладок после удаления
    const tabsCount = tabsContainer.querySelectorAll('.tab').length;

    if (tabsCount > 0) {
        toggleButton.removeAttribute('disabled');
    } else {
        toggleButton.setAttribute('disabled', 'disabled');
    }
}

// Функция для переключения видимости вкладок в рубрике
function toggleRubric(button) {
    let rubricElement = button.closest('.rubric');
    let rubricName = rubricElement.getAttribute('data-name');

    // Находим все вкладки в данной рубрике
    let tabsInRubric = tabsContainer.querySelectorAll(`.tab[data-name="${rubricName}"]`);

    let allHidden = true;
    tabsInRubric.forEach(tab => {
        if (!tab.classList.contains('hidden')) {
            allHidden = false;
        }
    });

    tabsInRubric.forEach(tab => {
        if (allHidden) {
            tab.classList.remove('hidden');
        } else {
            tab.classList.add('hidden');
        }
    });

    // Обновляем текст кнопки в зависимости от текущего состояния
    if (allHidden) {
        button.textContent = '-';
    } else {
        button.textContent = '+';
    }
}

// Функция для добавления быстрой рубрики
function addQuickRubric() {
    const rubric = quickRubricInput.value.trim();
    if (rubric === '') return;

    // Проверяем, что рубрика еще не добавлена
    if (!quickRubrics.includes(rubric)) {
        quickRubrics.push(rubric);
        createQuickRubricButton(rubric);
        quickRubricInput.value = '';
    }
}

// Обработчик загрузки файла
function importFile(event) {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = function(e) {
        const contents = e.target.result;
        parseAndDisplayLinks(contents);
    };

    reader.readAsText(file);
}

// Функция для парсинга и отображения ссылок из текстового файла
function parseAndDisplayLinks(contents) {
    // Регулярное выражение для поиска рубрики и ссылки в тексте
    const entryRegex = /^(.*?):\s*(https?:\/\/[^\s/$.?#].\S*)\s*\((.*?)\)\s*$/gim;
    let match;

    // Очищаем предыдущие вкладки, если они есть
    tabsData = [];
    tabsContainer.innerHTML = '';
    quickRubricsList.innerHTML = ''; // Очищаем список быстрых рубрик

    // Парсим итеративно каждую запись (рубрика: ссылка (описание))
    while ((match = entryRegex.exec(contents)) !== null) {
        const rubric = match[1].trim();
        const link = match[2].trim();
        const description = match[3].trim() || 'Описание отсутствует';

        // Добавляем вкладку
        addTab(rubric, link, description);

        // Добавляем рубрику в список быстрых рубрик, если её там ещё нет
        if (!quickRubrics.includes(rubric)) {
            quickRubrics.push(rubric);
            createQuickRubricButton(rubric);
        }
    }

    // Обновляем локальное хранилище
    updateLocalStorage();
}

// Функция для экспорта данных в текстовый файл
function exportData() {
    const exportType = document.getElementById('exportSelect').value;
    let exportContent = '';

    if (exportType === 'txt') {
        // Генерируем содержимое для экспорта в формате текста
        tabsData.forEach(tab => {
            exportContent += `${tab.rubric}: ${tab.link} (${tab.description})\n`;
        });

        // Создаем объект Blob для сохранения данных
        const blob = new Blob([exportContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);

        // Создаем ссылку для скачивания файла
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = 'my_tabs.txt';
        document.body.appendChild(a);
        a.click();

        // Удаляем ссылку после завершения скачивания
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}

// Функция для переключения видимости всех вкладок
function toggleAllTabs() {
    const allTabs = document.querySelectorAll('.tab');
    const toggleButton = document.getElementById('toggleTabsBtn');
    const rubrics = document.querySelectorAll('.rubric button');

    allTabs.forEach(tab => {
        if (areTabsHidden) {
            tab.classList.remove('hidden');
        } else {
            tab.classList.add('hidden');
        }
    });

    // Обновляем текст кнопки "Скрыть/Отобразить все вкладки"
    toggleButton.textContent = areTabsHidden ? 'Скрыть все вкладки!' : 'Отобразить все вкладки!';

    // Обновляем флаг
    areTabsHidden = !areTabsHidden;

    // Обновляем значки рубрик
    rubrics.forEach(button => {
        button.textContent = areTabsHidden ? '+' : '-';
    });
}

// Функция для создания элемента ссылки в зависимости от выбранного действия
function createLinkElement(link, action) {
    const linkElement = document.createElement('a');
    linkElement.href = link;
    linkElement.target = '_blank';

    switch (action) {
        case 'shorten':
            const domain = new URL(link).origin;
            linkElement.textContent = domain;
            break;
        case 'hide':
            linkElement.textContent = 'ссылка';
            break;
        case 'original':
        default:
            linkElement.textContent = link;
            break;
    }

    // Добавляем обработчик клика для подсчета кликов и открытия ссылки
    linkElement.addEventListener('click', function(event) {
        event.preventDefault(); // Предотвращаем переход по ссылке, так как это SPA

        // Подсчитываем клики
        countClick(linkElement.closest('.tab').getAttribute('data-name'), link);

        // Открываем ссылку в новом окне (или вкладке)
        window.open(link, '_blank');
    });

    return linkElement;
}

// Обработчик на выбор действия с ссылкой
document.getElementById('linkActionSelect').addEventListener('change', function() {
    const selectedAction = this.value;
    const tabs = document.querySelectorAll('.tab');

    tabs.forEach(tab => {
        const linkElement = tab.querySelector('a');
        const link = linkElement.href;
        const newLinkElement = createLinkElement(link, selectedAction);

        // Заменяем текущий элемент ссылки новым
        linkElement.parentNode.replaceChild(newLinkElement, linkElement);
    });
});

