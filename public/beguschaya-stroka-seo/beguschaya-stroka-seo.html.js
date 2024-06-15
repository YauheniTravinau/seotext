/*код самой бегущей строки*/
document.addEventListener("DOMContentLoaded", function() {
    const marqueeContainer = document.querySelector('.marquee-container');
    const marquee = document.querySelector('.marquee span');
    const text = marquee.textContent.trim(); // Убираем лишние пробелы в начале и в конце

    // Клонируем текст, чтобы заполнить контейнер
    let newText = text;
    while (newText.length < marqueeContainer.offsetWidth) {
        newText += ' ' + text;
    }
    marquee.textContent = newText; // Обновляем текст в бегущей строке

    // Функция для обновления анимации
    function updateAnimation() {
        const marqueeWidth = marquee.offsetWidth;
        const containerWidth = marqueeContainer.offsetWidth;
        const animationDuration = marqueeWidth / 50; // Вычисляем скорость анимации

        // Устанавливаем анимацию
        marquee.style.animation = `marquee ${animationDuration}s linear infinite`;
    }

    // Инициализируем анимацию
    updateAnimation();

    // Обновляем анимацию при изменении размеров окна
    window.addEventListener('resize', function() {
        updateAnimation();
    });
});
