const fileInput = document.getElementById('file-input');
const fileLabel = document.getElementById('file-label');
const errorMessage = document.querySelector('.error-message');

fileInput.addEventListener('change', () => {
  const selectedFile = fileInput.files[0];
  if (selectedFile && selectedFile.type === 'application/json') {
    ipcRenderer.send('file-selected', selectedFile.path);
    fileInput.value = '';
  }
  else {
    fileLabel.classList.add('error-input');
    setTimeout(() => {
      fileLabel.classList.remove('error-input');
    }, 2000);
    fileInput.value = '';
  }
});

ipcRenderer.on('file-error', (error) => {
  fileLabel.classList.add('error-input');
  errorMessage.textContent = error;
  errorMessage.style.display = 'block';
  setTimeout(() => {
    fileLabel.classList.remove('error-input');
    errorMessage.textContent = '';
    errorMessage.style.display = 'none';
  }, 3000);
});