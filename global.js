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
        // Add event listener for dropdown in burger menu after content is loaded
        const dropdown = document.querySelector('.menu-items .dropdown > a');
        if (dropdown) {
            dropdown.addEventListener('click', function(event) {
                // Check if we are in mobile view (menu is open)
                const menuItems = document.querySelector('.menu-items');
                if (menuItems && menuItems.classList.contains('open')) {
                    event.preventDefault(); // Prevent default link behavior
                    event.stopPropagation(); // Stop event propagation
                    const parentLi = this.parentElement;
                    if (parentLi) {
                        parentLi.classList.toggle('dropdown-open'); // Toggle class to show/hide dropdown
                    }
                }
            });
        }
    })
    .catch(error => console.error('Ошибка загрузки menu.html:', error));

// Загрузка содержимого footer.html
fetch('/public/footer/footer.html')
    .then(response => response.text())
    .then(html => {
        document.getElementById('footer').innerHTML = html;

        // Script for Scroll to Top button (moved from index.js)
        const scrollToTopButton = document.querySelector('.scroll-to-top');

        if (scrollToTopButton) {
            window.addEventListener('scroll', () => {
                if (window.pageYOffset > 100) { // Show button if scrolled more than 100px
                    scrollToTopButton.style.display = 'block';
                } else {
                    scrollToTopButton.style.display = 'none';
                }
            });

            // Add smooth scrolling for the button
            scrollToTopButton.addEventListener('click', () => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        }

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


// Замените 'url_другой_страницы' на реальный URL страницы, содержимое которой вы хотите загрузить
loadContent('/public/beguschaya-stroka-seo/beguschaya-stroka-seo.html', 'marquee-container');

/*бургер меню*/
function toggleMenu() {
    const menu = document.querySelector('.menu-items');
    menu.classList.toggle('open'); // Переключаем класс 'open'
}

// Закрытие бургер меню при клике вне его и иконки
document.addEventListener('click', function(event) {
    const menu = document.querySelector('.menu-items');
    const burgerIcon = document.querySelector('.burger-icon');
    const targetElement = event.target; // Элемент, на который кликнули

    // Проверяем, является ли клик вне меню и вне иконки бургера, и открыто ли меню
    if (!menu.contains(targetElement) && !burgerIcon.contains(targetElement) && menu.classList.contains('open')) {
        toggleMenu(); // Закрываем меню
    }
});

// Прокрутка страницы в начало при загрузке
document.addEventListener('DOMContentLoaded', function() {
    window.scrollTo(0, 0);
});
