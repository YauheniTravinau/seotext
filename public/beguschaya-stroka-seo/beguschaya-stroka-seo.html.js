/*код самой бегущей строки*/
document.addEventListener("DOMContentLoaded", function() {
    const marqueeContainer = document.querySelector('.marquee-container');
    const marquee = document.querySelector('.marquee span');
    const text = marquee.textContent.trim(); // Убираем лишние пробелы в начале и в конце

    // Функция для обновления текста и анимации
    function updateMarquee() {
        const containerWidth = marqueeContainer.offsetWidth;
        
        // Клонируем текст, чтобы заполнить контейнер
        let newText = text;
        while (newText.length < containerWidth) { // Убираем умножение на 2
            newText += ' ' + text;
        }
        marquee.textContent = newText;

        // Устанавливаем фиксированную длительность анимации
        const animationDuration = 180; // 180 секунд для полного цикла

        // Устанавливаем анимацию
        marquee.style.animation = `marquee ${animationDuration}s linear infinite`;
    }

    // Инициализируем анимацию
    updateMarquee();

    // Обновляем анимацию при изменении размеров окна
    window.addEventListener('resize', function() {
        updateMarquee();
    });
});
