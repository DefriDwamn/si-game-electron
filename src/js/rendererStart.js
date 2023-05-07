const fileInput = document.getElementById('file-input');
const fileLabel = document.getElementById('file-label');
const errorMessage = document.querySelector('.error-message');

fileInput.addEventListener('change', handleFileInput);
ipcRenderer.on('file-error', showFIError);

function handleFileInput() {
  const selectedFile = fileInput.files[0];
  if (selectedFile && selectedFile.type === 'application/json') {
    ipcRenderer.send('file-selected', selectedFile.path);
    fileInput.value = '';
  } else {
    showFIError();
  }
}

function showFIError(error = '') {
  fileLabel.classList.add('error-input');
  errorMessage.textContent = error || 'Invalid file format. Please select a JSON file.';
  errorMessage.style.display = 'block';
  setTimeout(() => {
    fileLabel.classList.remove('error-input');
    errorMessage.textContent = '';
    errorMessage.style.display = 'none';
  }, 3000);
}