"use strict";
//the main container of the page and header
const container = getTargetElement('container', document.getElementsByTagName('div'));
const titleHeader = getTargetElement('title', document.getElementsByTagName('p'));
const root = document.documentElement;
const toggleCircle = getTargetElement('circle-change', document.getElementsByTagName('div'));
const themeToggle = getTargetElement('change-theme-button', document.getElementsByTagName('div'));
themeToggle?.addEventListener('click', changeTheme);
const exitButton = getTargetElement('exit', document.getElementsByTagName('div'));
exitButton?.addEventListener('click', exit);
//constants used on the account login page
const overlaySignUpModal = getTargetElement('overlay-modal', document.getElementsByTagName('div'));
const overlayModalContent = getTargetElement('overlay-modal-content', document.getElementsByTagName('div'));
const signUpButton = document.getElementsByClassName('sign-up-button')[0];
const showOrHidePasswordButton = document.getElementsByClassName('show-password-button')[0];
const imgShowOrHidePassword = document.getElementsByClassName('img-show-password')[0];
const loginText = getTargetElement('login-text', document.getElementsByTagName('p'));
const passwordText = getTargetElement('password-text', document.getElementsByTagName('p'));
//constants used on the user page
const filterPanel = getTargetElement('filter-modal', document.getElementsByTagName('div'));
const userContent = getTargetElement('user-content', document.getElementsByTagName('div'));
const hideFilterButton = getTargetElement('hide-filters-button', document.getElementsByTagName('div'));
if (hideFilterButton)
    hideFilterButton.addEventListener('click', hideFilters);
const titleSort = getTargetElement('title-filter', document.getElementsByTagName('select'));
titleSort?.addEventListener('change', (e) => sortBooks(e));
const yearSort = getTargetElement('year-filter', document.getElementsByTagName('select'));
yearSort?.addEventListener('change', (e) => sortBooks(e));
const authorFilter = getTargetElement('author-filter', document.getElementsByTagName('select'));
authorFilter?.addEventListener('change', (e) => filterBooks(e, 'author'));
const pagesSort = getTargetElement('pages-filter', document.getElementsByTagName('select'));
pagesSort?.addEventListener('change', (e) => sortBooks(e));
const genreFilter = getTargetElement('genre-filter', document.getElementsByTagName('select'));
genreFilter?.addEventListener('change', (e) => filterBooks(e, 'genre'));
//constants used on the admin page
const adminContent = getTargetElement('panel-content', document.getElementsByTagName('div'));
const adminContentWrapper = getTargetElement('panel-wrapper', document.getElementsByTagName('div'));
const listOfBooks = getTargetElement('list-of-books', document.getElementsByTagName('div'));
const listOfBooksWrapper = getTargetElement('list-of-books-wrapper', document.getElementsByTagName('div'));
let deletedBooks = [];
const addBookButton = getTargetElement('add-button', document.getElementsByTagName('div'));
if (addBookButton)
    addBookButton.addEventListener('click', saveBook);
const previewBookButton = getTargetElement('preview-button', document.getElementsByTagName('div'));
if (previewBookButton)
    previewBookButton.addEventListener('click', previewBook);
const BOOK_FIELDS = ['title', 'img', 'year', 'author', 'numbersOfPages', 'genre'];
function isStringRecords(data) {
    return (!!data &&
        typeof data === 'object' &&
        Object.keys(data).every((key) => typeof key === 'string') &&
        Object.values(data).every((value) => typeof value === 'string'));
}
function isStringRecordsArray(data) {
    return Array.isArray(data) && data.every((book) => isStringRecords(book));
}
function generateKey(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const timestamp = Date.now().toString();
    const timestampLength = timestamp.length;
    let randomString = '';
    for (let i = 0; i < length - timestampLength; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        randomString += characters.charAt(randomIndex);
    }
    return randomString + timestamp;
}
function getTargetElement(className, tagsList) {
    const searchedElement = [...tagsList].find((el) => [...el.classList].includes(className));
    return searchedElement;
}
function getTargetElements(className, tagsList) {
    const searchedElements = [];
    for (let i = 0; i < tagsList.length; i++) {
        const el = tagsList[i];
        if ([...el.classList].includes(className)) {
            searchedElements.push(el);
        }
    }
    return searchedElements;
}
function getBooksData() {
    const storageBookData = localStorage.getItem('Books');
    const parsedBookData = storageBookData ? JSON.parse(storageBookData) : null;
    const bookData = isStringRecordsArray(parsedBookData) ? parsedBookData : [];
    return bookData;
}
(function checkUser() {
    const user = localStorage.getItem('CurrentUser');
    const parsedUser = user ? JSON.parse(user) : '';
    if (parsedUser === 'user') {
        createUserPanel();
        overlaySignUpModal?.classList.add('hidden');
    }
    else if (parsedUser === 'admin') {
        createAdminPanel();
        overlaySignUpModal?.classList.add('hidden');
    }
})();
function exit() {
    localStorage.setItem('CurrentUser', '');
    location.reload();
}
function showOrHidePassword() {
    const passwordInput = getTargetElement('password-input', document.getElementsByTagName('input'));
    if (!passwordInput?.type)
        return;
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        imgShowOrHidePassword.setAttribute('src', 'content/hide.jpg');
    }
    else {
        passwordInput.type = 'password';
        imgShowOrHidePassword.setAttribute('src', 'content/show.png');
    }
}
showOrHidePasswordButton.addEventListener('click', showOrHidePassword);
function createErrorMessage(text) {
    const errorMessageDiv = document.createElement('div');
    errorMessageDiv.classList.add('error-message-wrapper');
    const errorMessageText = document.createElement('p');
    errorMessageText.innerText = text;
    errorMessageText.classList.add('error-message');
    errorMessageDiv.appendChild(errorMessageText);
    return errorMessageDiv;
}
function removeErrorMessage(element) {
    const errorMessage = element.getElementsByClassName('error-message-wrapper')[0];
    if (errorMessage)
        element.removeChild(errorMessage);
}
function signUpUser() {
    const loginInput = getTargetElement('login-input', document.getElementsByTagName('input'));
    const passwordInput = getTargetElement('password-input', document.getElementsByTagName('input'));
    const adminData = JSON.parse(localStorage.getItem('Admin') ?? '');
    const parsedAdminData = isStringRecordsArray(adminData) ? adminData : null;
    const userData = JSON.parse(localStorage.getItem('User') ?? '');
    const parsedUserData = isStringRecordsArray(userData) ? userData : null;
    if (loginInput?.value && passwordInput?.value) {
        const isAdmin = parsedAdminData?.some((admin) => admin.login === loginInput.value && admin.password === passwordInput.value) &&
            overlayModalContent &&
            overlaySignUpModal;
        const isUser = parsedUserData?.some((user) => user.login === loginInput.value && user.password === passwordInput.value) &&
            overlayModalContent &&
            overlaySignUpModal;
        if (isAdmin) {
            localStorage.setItem('CurrentUser', JSON.stringify('admin'));
            createAdminPanel();
            overlaySignUpModal.classList.add('hidden');
        }
        else if (isUser) {
            localStorage.setItem('CurrentUser', JSON.stringify('user'));
            createUserPanel();
            overlaySignUpModal.classList.add('hidden');
        }
        else if (overlayModalContent && !overlayModalContent.getElementsByClassName('error-message')[0]) {
            const errorMessageDiv = createErrorMessage('Invalid data provided');
            overlayModalContent.prepend(errorMessageDiv);
        }
    }
    if (!overlayModalContent)
        return;
    if (!loginInput?.value && loginText) {
        removeErrorMessage(overlayModalContent);
        loginText.innerText = '*Login is required';
        loginText?.classList.add('error');
    }
    else if (loginText) {
        loginText.innerText = 'Login';
        loginText?.classList.remove('error');
    }
    if (!passwordInput?.value && passwordText) {
        removeErrorMessage(overlayModalContent);
        passwordText.innerText = '*Password is required';
        passwordText?.classList.add('error');
    }
    else if (passwordText) {
        passwordText.innerText = 'Password';
        passwordText?.classList.remove('error');
    }
}
signUpButton.addEventListener('click', signUpUser);
function createCard(bookData, isPreview) {
    const card = document.createElement('div');
    card.classList.add(isPreview ? 'card-preview' : 'card');
    const title = document.createElement('p');
    title.classList.add(isPreview ? 'title-card-preview' : 'title-card');
    const { title: titleValue } = bookData;
    title.innerText = `Title: ${titleValue}`;
    card.appendChild(title);
    const img = document.createElement('img');
    img.classList.add(isPreview ? 'img-preview' : 'img');
    const { img: imgValue } = bookData;
    img.setAttribute('src', imgValue);
    card.appendChild(img);
    const contentContainer = document.createElement('div');
    contentContainer.classList.add('content-container');
    card.appendChild(contentContainer);
    const contentWrapper = document.createElement('div');
    contentWrapper.classList.add(isPreview ? 'content-wrapper-preview' : 'content-wrapper');
    contentContainer.appendChild(contentWrapper);
    const year = document.createElement('p');
    year.classList.add('year');
    const { year: yearValue } = bookData;
    year.innerText = `Year: ${yearValue}`;
    contentWrapper.appendChild(year);
    const author = document.createElement('p');
    author.classList.add('author');
    const { author: authorValue } = bookData;
    author.innerText = `Author: ${authorValue}`;
    contentWrapper.appendChild(author);
    const numbersOfPages = document.createElement('p');
    numbersOfPages.classList.add('number-of-pages');
    const { numbersOfPages: numbersOfPagesValue } = bookData;
    numbersOfPages.innerText = `Numbers of pages: ${numbersOfPagesValue}`;
    contentWrapper.appendChild(numbersOfPages);
    const genre = document.createElement('p');
    genre.classList.add('genre');
    const { genre: genreValue } = bookData;
    genre.innerText = `Genre: ${genreValue}`;
    contentWrapper.appendChild(genre);
    const description = document.createElement('p');
    description.classList.add('description');
    const { description: descriptionValue } = bookData;
    description.innerText = `Description: ${descriptionValue}`;
    contentWrapper.appendChild(description);
    return card;
}
function createUserPanel(dataBook) {
    if (titleHeader)
        titleHeader.innerText = 'User panel';
    container?.classList.add('row');
    if (adminContent) {
        adminContent.classList.add('hidden');
    }
    const bookData = dataBook ?? getBooksData();
    const containerCards = document.createElement('div');
    containerCards.classList.add('container-cards');
    const firstCol = document.createElement('div');
    firstCol.classList.add('first-col');
    containerCards.appendChild(firstCol);
    for (let i = 0; i < bookData.length; i++) {
        const card = createCard(bookData[i]);
        firstCol.appendChild(card);
    }
    const showFiltersButton = document.createElement('div');
    showFiltersButton.classList.add('show-filter-button');
    showFiltersButton.innerText = 'Show filters';
    showFiltersButton.addEventListener('click', showFilters);
    const secondCol = document.createElement('div');
    secondCol.classList.add('second-col');
    secondCol.appendChild(showFiltersButton);
    containerCards.appendChild(secondCol);
    if (!filterPanel?.classList.contains('hidden'))
        showFiltersButton.classList.add('hidden');
    else
        showFiltersButton.classList.remove('hidden');
    if (userContent && filterPanel)
        userContent.insertBefore(containerCards, filterPanel);
}
function createItem(bookData) {
    const item = document.createElement('div');
    item.addEventListener('click', () => editBook(bookData.key));
    item.classList.add('item');
    const title = document.createElement('h3');
    title.innerText = bookData.title;
    item.appendChild(title);
    const deleteButton = document.createElement('div');
    deleteButton.innerText = 'x';
    deleteButton.classList.add('delete-button-item');
    deleteButton.addEventListener('click', () => deleteBook(bookData.key, restoreButton, deleteButton));
    deleteButton.addEventListener('click', (e) => e.stopPropagation());
    item.appendChild(deleteButton);
    const restoreButton = document.createElement('img');
    restoreButton.setAttribute('src', 'content/reset.jpg');
    restoreButton.classList.add('delete-button-item', 'hidden');
    restoreButton.addEventListener('click', () => restoreBook(bookData.key, restoreButton, deleteButton));
    restoreButton.addEventListener('click', (e) => e.stopPropagation());
    item.appendChild(restoreButton);
    return item;
}
function showListOfBooks() {
    while (listOfBooksWrapper && listOfBooksWrapper.firstChild) {
        listOfBooksWrapper.removeChild(listOfBooksWrapper.firstChild);
    }
    const books = getBooksData();
    for (let i = 0; i < books.length; i++) {
        const item = createItem(books[i]);
        listOfBooksWrapper?.appendChild(item);
    }
}
function editBook(key) {
    const bookData = getBooksData();
    const targetBook = bookData.find((book) => book.key === key);
    const inputs = getTargetElements('input-panel', document.getElementsByTagName('input'));
    const textarea = getTargetElement('textarea-panel', document.getElementsByTagName('textarea'));
    if (targetBook && textarea) {
        for (let i = 0; i < inputs.length; i++) {
            inputs[i].value = targetBook[BOOK_FIELDS[i]];
        }
        textarea.value = targetBook['description'];
        if (addBookButton) {
            addBookButton.innerText = 'Edit book';
            addBookButton.addEventListener('click', () => saveEditBook(targetBook, bookData));
            addBookButton.removeEventListener('click', saveBook);
        }
    }
    previewBook();
}
function saveEditBook(targetBook, bookData) {
    const isValid = checkModal();
    if (!isValid)
        return;
    const inputs = getTargetElements('input-panel', document.getElementsByTagName('input'));
    const textarea = getTargetElement('textarea-panel', document.getElementsByTagName('textarea'));
    const book = { key: targetBook.key };
    for (let i = 0; i < inputs.length; i++) {
        book[BOOK_FIELDS[i]] = inputs[i].value;
        inputs[i].value = '';
    }
    if (textarea) {
        book['description'] = textarea.value;
        textarea.value = '';
    }
    const index = bookData.findIndex((item) => item.key === book.key);
    bookData[index] = book;
    localStorage.setItem('Books', JSON.stringify(bookData));
    showListOfBooks();
}
function deleteBook(key, restoreButton, deleteButton) {
    restoreButton.classList.remove('hidden');
    deleteButton.classList.add('hidden');
    const bookData = getBooksData();
    const targetBook = bookData.find((book) => book.key === key);
    if (deletedBooks && targetBook && deletedBooks.every((book) => book.key !== targetBook.key))
        deletedBooks.push(targetBook);
    const filteredBookData = bookData.filter((book) => !deletedBooks.some((deleteBook) => deleteBook.key === book.key));
    localStorage.setItem('Books', JSON.stringify(filteredBookData));
}
function restoreBook(key, restoreButton, deleteButton) {
    restoreButton.classList.add('hidden');
    deleteButton.classList.remove('hidden');
    const bookData = getBooksData();
    const targetBook = deletedBooks.find((book) => (book.key = key));
    if (targetBook) {
        bookData.push(targetBook);
        deletedBooks = deletedBooks.filter((book) => book.key !== targetBook.key);
    }
    localStorage.setItem('Books', JSON.stringify(bookData));
}
function previewBook() {
    const isValid = checkModal();
    if (!isValid)
        return;
    const lastCard = getTargetElement('card-preview', document.getElementsByTagName('div'));
    if (lastCard)
        adminContent?.removeChild(lastCard);
    const inputs = getTargetElements('input-panel', document.getElementsByTagName('input'));
    const textarea = getTargetElement('textarea-panel', document.getElementsByTagName('textarea'));
    const book = { key: generateKey(16) };
    for (let i = 0; i < inputs.length; i++) {
        book[BOOK_FIELDS[i]] = inputs[i].value;
    }
    if (textarea)
        book['description'] = textarea.value;
    const card = createCard(book, true);
    if (adminContentWrapper)
        adminContent?.insertBefore(card, adminContentWrapper);
}
function createAdminPanel() {
    if (titleHeader)
        titleHeader.innerText = 'Add new book';
    container?.classList.remove('row');
    listOfBooks?.classList.remove('hidden');
    showListOfBooks();
    adminContent?.classList.remove('hidden');
    filterPanel?.classList.add('hidden');
}
function checkModal() {
    const inputs = getTargetElements('input-panel', document.getElementsByTagName('input'));
    const textPanel = getTargetElements('text-panel', document.getElementsByTagName('p'));
    const textarea = getTargetElement('textarea-panel', document.getElementsByTagName('textarea'));
    if (!textarea?.value)
        textPanel[textPanel.length - 1].classList.add('error');
    else
        textPanel[textPanel.length - 1].classList.remove('error');
    if (inputs.some((input) => !input.value) || !textarea?.value) {
        for (let i = 0; i < inputs.length; i++) {
            if (!inputs[i].value)
                textPanel[i].classList.add('error');
            else
                textPanel[i].classList.remove('error');
        }
        const errorMessageDiv = createErrorMessage('All fields are required');
        const isErrorExists = adminContentWrapper && !adminContentWrapper.getElementsByClassName('error-message')[0];
        if (isErrorExists)
            adminContentWrapper.prepend(errorMessageDiv);
        return false;
    }
    else if (adminContentWrapper) {
        for (let i = 0; i < inputs.length; i++) {
            textPanel[i].classList.remove('error');
        }
        removeErrorMessage(adminContentWrapper);
        return true;
    }
}
function saveBook() {
    const isValid = checkModal();
    if (!isValid)
        return;
    const inputs = getTargetElements('input-panel', document.getElementsByTagName('input'));
    const textarea = getTargetElement('textarea-panel', document.getElementsByTagName('textarea'));
    const book = { key: generateKey(16) };
    for (let i = 0; i < inputs.length; i++) {
        book[BOOK_FIELDS[i]] = inputs[i].value;
        inputs[i].value = '';
    }
    if (textarea) {
        book['description'] = textarea.value;
        textarea.value = '';
    }
    const bookData = getBooksData();
    bookData.push(book);
    localStorage.setItem('Books', JSON.stringify(bookData));
    showListOfBooks();
}
function showFilters() {
    filterPanel?.classList.remove('hidden');
    const showFiltersButton = getTargetElement('show-filter-button', document.getElementsByTagName('div'));
    showFiltersButton?.classList.add('hidden');
    const bookData = getBooksData();
    const uniqueGenres = new Set();
    const uniqueAuthors = new Set();
    for (let i = 0; i < bookData.length; i++) {
        uniqueGenres.add(bookData[i].genre);
        uniqueAuthors.add(bookData[i].author);
    }
    const genresArr = Array.from(uniqueGenres);
    const authorsArr = Array.from(uniqueAuthors);
    const genresSelect = getTargetElement('genre-filter', document.getElementsByTagName('select'));
    const authorsSelect = getTargetElement('author-filter', document.getElementsByTagName('select'));
    for (let i = 0; i < genresArr.length; i++) {
        const genre = genresArr[i];
        const option = document.createElement('option');
        option.text = genre;
        option.value = genre;
        if (genresSelect)
            genresSelect.appendChild(option);
    }
    for (let i = 0; i < authorsArr.length; i++) {
        const author = authorsArr[i];
        const option = document.createElement('option');
        option.text = author;
        option.value = author;
        if (authorsSelect)
            authorsSelect.appendChild(option);
    }
}
function hideFilters() {
    filterPanel?.classList.add('hidden');
    const showFiltersButton = getTargetElement('show-filter-button', document.getElementsByTagName('div'));
    showFiltersButton?.classList.remove('hidden');
}
function sortBooks(e) {
    const containerCards = getTargetElement('container-cards', document.getElementsByTagName('div'));
    const bookData = getBooksData();
    const { target } = e;
    if (userContent && containerCards)
        userContent.removeChild(containerCards);
    const { value } = target;
    let sortedData = [];
    if (value === 'z-a')
        sortedData = bookData.sort((a, b) => b.title.localeCompare(a.title));
    else if (value === 'a-z')
        sortedData = bookData.sort((a, b) => a.title.localeCompare(b.title));
    if (value === 'younger')
        sortedData = bookData.sort((a, b) => Number(b.year) - Number(a.year));
    else if (value === 'older')
        sortedData = bookData.sort((a, b) => Number(a.year) - Number(b.year));
    if (value === 'more')
        sortedData = bookData.sort((a, b) => Number(b.numbersOfPages) - Number(a.numbersOfPages));
    else if (value === 'fewer')
        sortedData = bookData.sort((a, b) => Number(a.numbersOfPages) - Number(b.numbersOfPages));
    createUserPanel(sortedData);
}
function filterBooks(e, filter) {
    const containerCards = getTargetElement('container-cards', document.getElementsByTagName('div'));
    const bookData = getBooksData();
    const { target } = e;
    if (userContent && containerCards)
        userContent.removeChild(containerCards);
    const { value } = target;
    let filteredData = [];
    if (value !== 'all') {
        if (filter === 'genre')
            filteredData = bookData.filter((book) => book.genre === value);
        if (filter === 'author')
            filteredData = bookData.filter((book) => book.author === value);
        createUserPanel(filteredData);
    }
    else
        createUserPanel(bookData);
}
function changeTheme() {
    themeToggle?.classList.toggle('flex-end');
    toggleCircle?.classList.toggle('black');
    if (toggleCircle?.classList.contains('black')) {
        root.style.setProperty('--overlay-bg', '#363636');
        root.style.setProperty('--container-bg', '#191934');
        root.style.setProperty('--container-cards-bg', '#363636');
        root.style.setProperty('--card-text', 'white');
        root.style.setProperty('--modal-border', '#888e92');
    }
    else {
        root.style.setProperty('--overlay-bg', '#e67e22');
        root.style.setProperty('--container-bg', '#474787');
        root.style.setProperty('--container-cards-bg', 'white');
        root.style.setProperty('--card-text', 'black');
        root.style.setProperty('--modal-border', '#bdc3c7');
    }
}
