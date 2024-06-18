// match url parameters with the form

const currentUrl = new URL(window.location.href);
const searchParams = currentUrl.searchParams;

const searchField = document.getElementById('form-search-field');
const platformField = document.getElementById('form-platform');
const aspectRatioField = document.getElementById('form-aspect-ratio');
const sizeField = document.getElementById('form-size');
const orderField = document.getElementById('form-order');

if (searchParams.has('search')) {
    searchField.value = searchParams.get('search');
}
if (searchParams.has('platform')) {
    platformField.value = searchParams.get('platform').replace('+', ' ');
}
if (searchParams.has('aspect-ratio')) {
    aspectRatioField.value = searchParams.get('aspect-ratio');
}
if (searchParams.has('size')) {
    sizeField.value = searchParams.get('size');
}
if (searchParams.has('order')) {
    orderField.value = searchParams.get('order').replace('+', ' ');
}