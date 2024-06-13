/*код самой бегущей строки*/
document.addEventListener("DOMContentLoaded", function() {
    const marqueeContainer = document.querySelector('.marquee-container');
    const marquee = document.querySelector('.marquee span');
    const text = marquee.textContent;
    let containerWidth = marqueeContainer.offsetWidth;

    // Клонируем текст, чтобы заполнить контейнер
    let newText = text;
    while (newText.length < containerWidth / 2) { // Удвоенная длина текста для гарантированного заполнения
        newText += text;
    }
    marquee.textContent = newText; // Используем textContent для безопасной вставки текста

    // Функция для обновления анимации
    function updateAnimation() {
        const marqueeWidth = marquee.offsetWidth;
        const animationDuration = marqueeWidth / 50; // Скорость анимации
        marquee.style.animation = `marquee ${animationDuration}s linear infinite`;
    }

    // Инициализация анимации
    updateAnimation();

    // Динамическое обновление анимации при изменении размеров окна
    window.addEventListener('resize', function() {
        containerWidth = marqueeContainer.offsetWidth; // Обновляем ширину контейнера
        updateAnimation(); // Пересчитываем анимацию
    });
});
