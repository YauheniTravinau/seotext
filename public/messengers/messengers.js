document.addEventListener('DOMContentLoaded', function() {
    const createButtons = document.getElementById('createButtons');
    const textAndButtonsContainer = document.getElementById('textAndButtons');
    const inputText1 = document.getElementById('inputText1');
    const inputText2 = document.getElementById('inputText2');
    const inputText3 = document.getElementById('inputText3');
    const inputMessage = document.getElementById('inputMessage'); // New message textarea
    const downloadList = document.getElementById('downloadList');
    const uploadList = document.getElementById('uploadList');
    const uploadButton = document.getElementById('uploadButton');

    createButtons.addEventListener('click', createList);
    downloadList.addEventListener('click', downloadTextFile);
    uploadButton.addEventListener('click', () => uploadList.click());
    uploadList.addEventListener('change', uploadTextFile);

    function validateEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }
    function validatePhone(phone) {
        return /^\+?\d{7,15}$/.test(phone.replace(/\D/g, ''));
    }
    function checkLengths(lines1, lines2, lines3) {
        return lines1.length === lines2.length && lines1.length === lines3.length;
    }

    function createList() {
        let lines1 = inputText1.value.trim().split('\n').map(x => x.trim());
        let lines2 = inputText2.value.trim().split('\n').map(x => x.trim());
        let lines3 = inputText3.value.trim().split('\n').map(x => x.trim());
        const message = inputMessage.value.trim();

        // Удаляем пустые строки
        lines1 = lines1.filter((v, i) => v && lines2[i] && lines3[i]);
        lines2 = lines2.filter((v, i) => v && lines1[i] && lines3[i]);
        lines3 = lines3.filter((v, i) => v && lines1[i] && lines2[i]);

        if (!checkLengths(lines1, lines2, lines3)) {
            alert('Количество записей в каждом поле должно быть одинаковым.');
            return;
        }

        // Remove duplicates based on email
        const combinedLines = lines1.map((name, index) => ({
            name: name,
            phone: lines2[index],
            email: lines3[index]
        })).filter(line => validateEmail(line.email) && validatePhone(line.phone));

        const uniqueLines = removeDuplicates(combinedLines);

        // Clear existing content in the container
        textAndButtonsContainer.innerHTML = '';

        uniqueLines.forEach((line, index) => {
            // Create a div element for each line of text
            const lineElement = document.createElement('div');
            lineElement.className = 'text-line';

            // Numbered column
            const numberColumn = document.createElement('div');
            numberColumn.textContent = `${index + 1}.`;
            lineElement.appendChild(numberColumn);

            // Name column
            const nameColumn = document.createElement('div');
            const nameText = document.createElement('span');
            nameText.textContent = line.name;
            nameText.className = 'editable';
            nameColumn.appendChild(nameText);
            const editNameIcon = document.createElement('span');
            editNameIcon.className = 'edit-icon';
            editNameIcon.onclick = function() {
                editText(nameText);
            };
            nameColumn.appendChild(editNameIcon);
            lineElement.appendChild(nameColumn);

            // Phone column
            const phoneColumn = document.createElement('div');
            const phoneText = document.createElement('span');
            phoneText.textContent = line.phone;
            phoneText.className = 'editable';
            phoneColumn.appendChild(phoneText);
            const editPhoneIcon = document.createElement('span');
            editPhoneIcon.className = 'edit-icon';
            editPhoneIcon.onclick = function() {
                editText(phoneText);
            };
            phoneColumn.appendChild(editPhoneIcon);
            lineElement.appendChild(phoneColumn);

            // Email column
            const emailColumn = document.createElement('div');
            const emailText = document.createElement('span');
            emailText.textContent = line.email;
            emailText.className = 'editable';
            emailColumn.appendChild(emailText);
            const editEmailIcon = document.createElement('span');
            editEmailIcon.className = 'edit-icon';
            editEmailIcon.onclick = function() {
                editText(emailText);
            };
            emailColumn.appendChild(editEmailIcon);
            lineElement.appendChild(emailColumn);

            // Messenger buttons column
            const messengers = ['whatsapp', 'viber', 'telegram', 'email'];
            messengers.forEach(messenger => {
                const button = document.createElement('button');
                button.className = 'messenger-button ' + messenger;
                button.textContent = messenger.charAt(0).toUpperCase() + messenger.slice(1);
                button.onclick = function() {
                    openMessenger(messenger, line.phone, line.email, message);
                };
                const deleteIcon = document.createElement('span');
                deleteIcon.className = 'delete-icon';
                deleteIcon.onclick = function() {
                    button.remove();
                    deleteIcon.remove();
                };
                lineElement.appendChild(button);
                lineElement.appendChild(deleteIcon);
            });

            // Edit button column
            const editColumn = document.createElement('div');
            const editButton = document.createElement('button');
            editButton.className = 'edit';
            editButton.textContent = 'Редактировать';
            editButton.onclick = function() {
                toggleEditMode(lineElement, editButton);
            };
            editColumn.appendChild(editButton);
            lineElement.appendChild(editColumn);

            // Delete Row button column
            const deleteColumn = document.createElement('div');
            const deleteButton = document.createElement('button');
            deleteButton.className = 'delete-row';
            deleteButton.textContent = 'Удалить строку';
            deleteButton.onclick = function() {
                if (confirm('Вы уверены, что хотите удалить эту строку?')) {
                    lineElement.remove();
                }
            };
            deleteColumn.appendChild(deleteButton);
            lineElement.appendChild(deleteColumn);

            // Append the line element to the container
            textAndButtonsContainer.appendChild(lineElement);
        });
    }

    function openMessenger(messenger, phone, email, message) {
        let url = '';
        switch (messenger) {
            case 'whatsapp':
                url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
                break;
            case 'viber':
                url = `viber://chat?number=${phone}&text=${encodeURIComponent(message)}`;
                break;
            case 'telegram':
                url = `https://t.me/+${phone}?text=${encodeURIComponent(message)}`;
                break;
            case 'email':
                url = `mailto:${email}?body=${encodeURIComponent(message)}`;
                break;
        }
        window.open(url, '_blank');
    }

    function toggleEditMode(lineElement, editButton) {
        lineElement.classList.toggle('edit-mode');
        if (lineElement.classList.contains('edit-mode')) {
            editButton.textContent = 'Сохранить';
        } else {
            editButton.textContent = 'Редактировать';
        }
    }

    function editText(element) {
        const newText = prompt('Введите новый текст:', element.textContent);
        if (newText !== null) {
            element.textContent = newText;
        }
    }

    function downloadTextFile() {
        let lines1 = inputText1.value.trim().split('\n').map(x => x.trim());
        let lines2 = inputText2.value.trim().split('\n').map(x => x.trim());
        let lines3 = inputText3.value.trim().split('\n').map(x => x.trim());
        // Удаляем пустые строки
        lines1 = lines1.filter((v, i) => v && lines2[i] && lines3[i]);
        lines2 = lines2.filter((v, i) => v && lines1[i] && lines3[i]);
        lines3 = lines3.filter((v, i) => v && lines1[i] && lines2[i]);
        if (!checkLengths(lines1, lines2, lines3)) {
            alert('Количество записей в каждом поле должно быть одинаковым.');
            return;
        }
        let uniqueLines = [];
        const uniqueEmails = new Set();
        lines1.forEach((name, index) => {
            const email = lines3[index].trim();
            const phone = lines2[index].trim();
            if (!uniqueEmails.has(email) && validateEmail(email) && validatePhone(phone)) {
                uniqueEmails.add(email);
                uniqueLines.push(`${name}\t${phone}\t${email}`);
            }
        });
        const content = uniqueLines.join('\n');
        const blob = new Blob([content], { type: 'text/plain' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'list.txt';
        link.click();
    }

    function uploadTextFile(event) {
        const file = event.target.files[0];
        if (!file) {
            return;
        }
        const reader = new FileReader();
        reader.onload = function(e) {
            const content = e.target.result;
            const lines = content.trim().split('\n');
            const text1 = [];
            const text2 = [];
            const text3 = [];
            lines.forEach(line => {
                const [name, phone, email] = line.split('\t');
                if (name && phone && email) {
                    text1.push(name);
                    text2.push(phone);
                    text3.push(email);
                }
            });
            inputText1.value = text1.join('\n');
            inputText2.value = text2.join('\n');
            inputText3.value = text3.join('\n');
            createList();  // Automatically create the list after uploading the file
        };
        reader.readAsText(file);
    }

    function removeDuplicates(lines) {
        const uniqueEmails = new Set();
        return lines.filter(line => {
            const isUnique = !uniqueEmails.has(line.email);
            uniqueEmails.add(line.email);
            return isUnique;
        });
    }
});
