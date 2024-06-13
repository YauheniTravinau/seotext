// Загрузка содержимого header.html
fetch('/public/header/header.html')
    .then(response => response.text())
    .then(html => {
        document.getElementById('header').innerHTML = html;
    })
    .catch(error => console.error('Ошибка загрузки header.html:', error));

// Загрузка содержимого menu.html (примерное название вашего файла с меню)
fetch('/public/menu/menu.html')
    .then(response => response.text())
    .then(html => {
        document.getElementById('menu').innerHTML = html;
    })
    .catch(error => console.error('Ошибка загрузки menu.html:', error));

// Загрузка содержимого footer.html
fetch('/public/footer/footer.html')
    .then(response => response.text())
    .then(html => {
        document.getElementById('footer').innerHTML = html;
    })
    .catch(error => console.error('Ошибка загрузки footer.html:', error));

/*бегущая строка*/
// Создаем функцию для загрузки содержимого другой страницы
function loadContent(url, elementId) {
    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.text();
        })
        .then(data => {
            // Находим элемент по ID
            const container = document.getElementById(elementId);
            // Вставляем полученный HTML в элемент
            container.innerHTML = data;
        })
        .catch(error => {
            console.error('Error fetching data:', error);
        });
}

// Вызываем функцию loadContent для загрузки содержимого страницы
// Замените 'url_другой_страницы' на реальный URL страницы, содержимое которой вы хотите загрузить
loadContent('/public/beguschaya-stroka-seo/beguschaya-stroka-seo.html', 'marquee-container');

/*бургер меню*/
function toggleMenu() {
    const menu = document.querySelector('.menu-items');
    menu.classList.toggle('open'); // Переключаем класс 'open'
}
