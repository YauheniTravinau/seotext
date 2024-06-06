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
