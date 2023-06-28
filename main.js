const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const { QuestionFileError } = require('./customErrors');
const config = require('./config.json');

let mainWindow;
let questionsData = [];
let questionPath = '';

function createWindow() {
  mainWindow = new BrowserWindow({
    title: 'SiGame',
    width: 1920,
    height: 1080,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    show: false,
    resizable: true,
    minWidth: 800,
    minHeight: 600
  })

  mainWindow.loadFile(path.join(__dirname, './src/start.html'));

  mainWindow.maximize();
  mainWindow.setMenuBarVisibility(false);

  mainWindow.on('ready-to-show', () => {
    mainWindow.show();
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

ipcMain.on('file-selected', (e, questionPackFilepath) => {
  startApp(questionPackFilepath);
})

ipcMain.on('reload-app-page', (e) => {
  mainWindow.webContents.send('questionPack', questionsData);
  mainWindow.webContents.send('colorThemes', config.ColorThemes);
})

ipcMain.on('to-start', (e) => {
  questionsData = [];
  questionPath = '';
  mainWindow.loadFile(path.join(__dirname, './src/start.html'));
})

function startApp(questionPackFilepath) {
  try {
    prepareQuestionPack(questionPackFilepath);
    mainWindow.loadFile(path.join(__dirname, './src/app.html'));
  } catch (err) {
    mainWindow.webContents.send('file-error', err);
  }
}

function prepareQuestionPack(filepath) {
  questionsData = readQuestionPack(filepath);
  questionPath = path.parse(filepath).dir;
}

function readQuestionPack(filepath) {
  if (!fs.existsSync(filepath)) {
    throw new QuestionFileError("Question pack file not found.");
  }

  try {
    const questionPack = JSON.parse(fs.readFileSync(filepath, 'utf8'));

    validateQuestionPack(questionPack);

    return questionPack;
  } catch (err) {
    throw new QuestionFileError(`Error parsing question pack: ${err.stack}`)
  }
}

function validateQuestionPack(questionPack) {
  if (questionPack.length > config.MAX_THEME_COUNT) {
    throw new QuestionFileError(`Number of themes exceeds maximum of ${config.MAX_THEME_COUNT}.`);
  }

  for (const theme of questionPack) {
    if (theme.themeName.length > config.MAX_THEME_CHARACTERS) {
      throw new QuestionFileError(`Theme name exceeds maximum of ${config.MAX_THEME_CHARACTERS} characters.`);
    }

    if (theme.questions.length > config.MAX_QUESTION_COUNT) {
      throw new QuestionFileError(`Number of questions for theme '${theme.themeName}' exceeds maximum of ${config.MAX_QUESTION_COUNT}.`);
    }

    for (const question of theme.questions) {
      if (question[0].questionType == `text`) {
        if (question[1].length > config.MAX_QUESTION_CHARACTERS) {
          throw new QuestionFileError(`Question for theme '${theme.themeName}' exceeds maximum of ${config.MAX_QUESTION_CHARACTERS} characters.`);
        }
      }

      if (question[0].answerType == `text`) {
        if (question[3].length > config.MAX_ANSWER_CHARACTERS) {
          throw new QuestionFileError(`Answer for question '${question[1]}' exceeds maximum of ${config.MAX_ANSWER_CHARACTERS} characters.`);
        }
      }

      if (question[2] > config.MAX_QUESTION_COST) {
        throw new QuestionFileError(`Question cost for question '${question[1]}' exceeds maximum of ${config.MAX_QUESTION_COST}.`);
      }
    }
  }
}

ipcMain.on('questionIndexesToMain', (e, indexes) => {
  mainWindow.webContents.send('oneQuestionData', questionsData[indexes[0]].questions[indexes[1]], questionPath);
})