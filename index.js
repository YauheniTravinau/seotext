// Находим все элементы с атрибутом data-target
const articleTargets = document.querySelectorAll('[data-target]');
const modal = document.getElementById("myModal");
const modalContent = modal.querySelector('.article-container');
const overlay = document.querySelector('.overlay'); // Получаем элемент затемнения фона

// При клике на элемент с атрибутом data-target
articleTargets.forEach(target => {
    target.addEventListener('click', () => {
        const articleTarget = target.getAttribute('data-target');
        fetch(`public/${articleTarget}.html`) // Загружаем содержимое статьи через Fetch API
            .then(response => response.text())
            .then(html => {
                modalContent.innerHTML = html; // Вставляем содержимое статьи в модальное окно
                modal.style.display = "block"; // Открываем модальное окно
                overlay.style.display = "block"; // Показываем затемнение фона
            })
            .catch(error => console.error('Error loading article:', error));
    });
});

const closeButton = modal.querySelector('.close');

closeButton.addEventListener('click', () => {
    modal.style.display = "none"; // Закрываем модальное окно
    overlay.style.display = "none"; // Скрываем затемнение фона
});

overlay.addEventListener('click', () => {
    modal.style.display = "none"; // Закрываем модальное окно
    overlay.style.display = "none"; // Скрываем затемнение фона
});
