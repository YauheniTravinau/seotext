document.getElementById('processButton').addEventListener('click', () => {
    const fileInput = document.getElementById('fileInput');
    const pageTitle = document.getElementById('pageTitle').value;
    const description = document.getElementById('description').value;
    const keywords = document.getElementById('keywords').value;
    const author = document.getElementById('author').value;
    const googleVerification = document.getElementById('googleVerification').value;
    const ogTitle = document.getElementById('ogTitle').value;
    const ogDescription = document.getElementById('ogDescription').value;
    const ogSubject = document.getElementById('ogSubject').value;
    const ogImage = document.getElementById('ogImage').value;
    const ogUrl = document.getElementById('ogUrl').value;
    const ogSiteName = document.getElementById('ogSiteName').value;
    const dcTitle = document.getElementById('dcTitle').value;
    const dcDescription = document.getElementById('dcDescription').value;
    const dcSubject = document.getElementById('dcSubject').value;
    const dcCreator = document.getElementById('dcCreator').value;
    const xCardsTitle = document.getElementById('xCardsTitle').value;
    const xCardsDescription = document.getElementById('xCardsDescription').value;
    const xCardsImage = document.getElementById('xCardsImage').value;
    const tiktokTitle = document.getElementById('tiktokTitle').value;
    const tiktokDescription = document.getElementById('tiktokDescription').value;
    const tiktokImage = document.getElementById('tiktokImage').value;
    const tiktokSite = document.getElementById('tiktokSite').value;
    const tiktokCreator = document.getElementById('tiktokCreator').value;
    const fbAppId = document.getElementById('fbAppId').value;
    const twitterTitle = document.getElementById('twitterTitle').value;
    const twitterDescription = document.getElementById('twitterDescription').value;
    const twitterImage = document.getElementById('twitterImage').value;

    if (!fileInput.files.length) {
        alert('Пожалуйста, загрузите HTML файл.');
        return;
    }

    const file = fileInput.files[0];
    const reader = new FileReader();

    reader.onload = function(event) {
        let htmlContent = event.target.result;

        // Удаление существующих мета-тегов и тайтла
        htmlContent = htmlContent.replace(/<meta[^>]*>/g, '');
        htmlContent = htmlContent.replace(/<title>.*<\/title>/g, '');

        // Добавление новых мета-тегов
        const metaTags = `
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${pageTitle}</title>
<meta name="description" content="${description}">
<meta name="keywords" content="${keywords}">
<meta name="author" content="${author}">
<meta name="robots" content="index, follow, revisit-after=7 days">
<meta name="language" content="en">
<meta name="geo.region" content="US-NY">
<meta name="geo.placename" content="New York">
<meta name="geo.position" content="40.7128; -74.0060">
<meta name="ICBM" content="40.7128, -74.0060">
<link rel="canonical" href="https://kinderkrama.com/">
<meta name="google-site-verification" content="${googleVerification}">
<meta property="og:title" content="${ogTitle}">
<meta property="og:description" content="${ogDescription}">
<meta property="og:subject" content="${ogSubject}">
<meta property="og:image" content="${ogImage}">
<meta property="og:url" content="${ogUrl}">
<meta property="og:locale" content="en_US">
<meta property="og:type" content="website">
<meta property="og:site_name" content="${ogSiteName}">
<meta name="DC.title" content="${dcTitle}">
<meta name="DC.description" content="${dcDescription}">
<meta name="DC.subject" content="${dcSubject}">
<meta name="DC.creator" content="${dcCreator}">
<meta name="x-cards-type" content="website">
<meta name="x-cards-title" content="${xCardsTitle}">
<meta name="x-cards-description" content="${xCardsDescription}">
<meta name="x-cards-image" content="${xCardsImage}">
<meta name="referrer" content="origin">
<meta property="tiktok:title" content="${tiktokTitle}">
<meta property="tiktok:description" content="${tiktokDescription}">
<meta property="tiktok:image" content="${tiktokImage}">
<meta property="tiktok:site" content="${tiktokSite}">
<meta property="tiktok:creator" content="${tiktokCreator}">
<meta property="fb:app_id" content="${fbAppId}">
<meta property="og:title" content="${pageTitle}">
<meta property="og:description" content="${description}">
<meta property="og:image" content="${ogImage}">
<meta property="og:url" content="${ogUrl}">
<meta property="og:type" content="website">
<meta name="twitter:title" content="${twitterTitle}">
<meta name="twitter:description" content="${twitterDescription}">
<meta name="twitter:image" content="${twitterImage}">
<meta name="twitter:card" content="summary_large_image">
`;

        // Вставка новых мета-тегов после <head>
        htmlContent = htmlContent.replace(/<head>/, `<head>${metaTags}`);

        // Создание Blob с обработанным HTML
        const blob = new Blob([htmlContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);

        // Отображение ссылки для скачивания
        const downloadLink = document.getElementById('downloadLink');
        downloadLink.href = url;
        downloadLink.download = 'processed.html';
        downloadLink.style.display = 'inline-block';
        downloadLink.textContent = 'Скачать обработанный HTML';
    };

    reader.readAsText(file);
});

/**/
document.addEventListener('DOMContentLoaded', function() {
    const fields = [
        { id: 'pageTitle', max: 60 },
        { id: 'description', max: 160 },
        { id: 'keywords', max: 255 },
        { id: 'author', max: 50 },
        { id: 'googleVerification', max: 100 },
        { id: 'ogTitle', max: 60 },
        { id: 'ogDescription', max: 160 },
        { id: 'ogSubject', max: 60 },
        { id: 'ogImage', max: 255 },
        { id: 'ogUrl', max: 255 },
        { id: 'ogSiteName', max: 60 },
        { id: 'dcTitle', max: 60 },
        { id: 'dcDescription', max: 160 },
        { id: 'dcSubject', max: 60 },
        { id: 'dcCreator', max: 50 },
        { id: 'xCardsTitle', max: 60 },
        { id: 'xCardsDescription', max: 160 },
        { id: 'xCardsImage', max: 255 },
        { id: 'tiktokTitle', max: 60 },
        { id: 'tiktokDescription', max: 160 },
        { id: 'tiktokImage', max: 255 },
        { id: 'tiktokSite', max: 255 },
        { id: 'tiktokCreator', max: 50 },
        { id: 'fbAppId', max: 50 },
        { id: 'twitterTitle', max: 60 },
        { id: 'twitterDescription', max: 160 },
        { id: 'twitterImage', max: 255 },
    ];

    fields.forEach(field => {
        const input = document.getElementById(field.id);
        const counter = document.getElementById(`${field.id}Counter`);
        input.addEventListener('input', () => {
            const length = input.value.length;
            counter.textContent = `${length}/${field.max}`;
            if (length > field.max) {
                counter.style.color = 'red';
            } else {
                counter.style.color = 'initial';
            }
        });
    });
});

/**/
// Обновленный JS, все остается так же
document.getElementById('trimButton').addEventListener('click', function() {
    const text = document.getElementById('inputText').value;
    const charLimit = document.getElementById('charLimit').value;

    if (charLimit && charLimit > 0) {
        const trimmedText = text.substring(0, charLimit);
        document.getElementById('result').innerText = `Trimmed Text: ${trimmedText}`;
    } else {
        document.getElementById('result').innerText = 'Please enter a valid character limit.';
    }
});

/**/
function updateCoordinates() {
    const regionSelect = document.getElementById("geoRegion");
    const placeSelect = document.getElementById("geoPlaceName");
    const positionInput = document.getElementById("geoPosition");
    const icbmInput = document.getElementById("icbm");

    const selectedOption = regionSelect.options[regionSelect.selectedIndex];
    const lat = selectedOption.getAttribute("data-lat");
    const lng = selectedOption.getAttribute("data-lng");

    positionInput.value = `${lat}; ${lng}`;
    icbmInput.value = `${lat}, ${lng}`;

    // Disable input fields
    positionInput.disabled = true;
    icbmInput.disabled = true;

    // При изменении региона, обновляем список мест
    // Например, можно использовать AJAX для получения списка мест из базы данных или статически заданных значений
    // Здесь приведен пример статических значений:
    placeSelect.innerHTML = "";
    switch (selectedOption.value) {
        case "RU":
            addPlaceOption("Москва", lat, lng);
            addPlaceOption("Санкт-Петербург", "59.9343", "30.3351");
            // Добавьте другие места для выбранного региона
            break;
        case "US":
            addPlaceOption("Нью-Йорк", lat, lng);
            addPlaceOption("Лос-Анджелес", "34.0522", "-118.2437");
            // Добавьте другие места для выбранного региона
            break;
        case "EU":
            addPlaceOption("Париж", lat, lng);
            addPlaceOption("Берлин", "52.5200", "13.4050");
            // Добавьте другие места для выбранного региона
            break;
        case "AE":
            addPlaceOption("Дубай", lat, lng);
            addPlaceOption("Абу-Даби", "24.4539", "54.3773");
            // Добавьте другие места для выбранного региона
            break;
        case "ES":
            addPlaceOption("Мадрид", lat, lng);
            addPlaceOption("Барселона", "41.3851", "2.1734");
            // Добавьте другие места для выбранного региона
            break;
        case "IT":
            addPlaceOption("Рим", lat, lng);
            addPlaceOption("Милан", "45.4642", "9.1900");
            // Добавьте другие места для выбранного региона
            break;
        case "FR":
            addPlaceOption("Париж", lat, lng);
            addPlaceOption("Марсель", "43.2965", "5.3698");
            // Добавьте другие места для выбранного региона
            break;
        case "DE":
            addPlaceOption("Берлин", lat, lng);
            addPlaceOption("Франкфурт", "50.1109", "8.6821");
            // Добавьте другие места для выбранного региона
            break;
        case "PL":
            addPlaceOption("Варшава", lat, lng);
            addPlaceOption("Краков", "50.0647", "19.9450");
            // Добавьте другие места для выбранного региона
            break;
    }
}

function addPlaceOption(name, lat, lng) {
    const placeSelect = document.getElementById("geoPlaceName");
    const option = document.createElement("option");
    option.value = name;
    option.setAttribute("data-lat", lat);
    option.setAttribute("data-lng", lng);
    option.textContent = name;
    placeSelect.appendChild(option);
}

// Первоначальная инициализация
updateCoordinates();

/*рамка*/
