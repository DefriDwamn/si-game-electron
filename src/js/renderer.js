const root = document.querySelector(':root');
const addCardButton = document.querySelector('.addCardButton');
const toStartButton = document.querySelector('.toStartButton');
const themeSwapButton = document.querySelector('.themeSwapButton');

const elemChooseButtons = document.querySelector('.chooseButtons');
const elemTeamsCards = document.querySelector('.cards');
const elemQuestions = document.querySelector('.questions');
const elemProgress = document.querySelector('.progress');
const elemAnswer = document.querySelector('.answer');

const CardTitleInput = "Команда";
const CardScoreTitleInput = "Очки";
const CardScoreInput = 0;

const KeySkip = 'KeyS';
const KeyYes = 'KeyY';
const KeyNo = 'KeyN';

const MAX_TEAMS = 5;
const QUESTION_TIME = 5;


let colorThemes = [];
let colorThemeIndex = 0;
let questionTimer;

ipcRenderer.send('reload-app-page');

updateZoom();

function updateZoom() {
    const startWidth = 1024;
    const startHeigth = 768;
    const width = window.innerWidth;
    const height = window.innerHeight;
    const kH = (height / (startHeigth))
    const kW = (width / (startWidth))
    const clcZoom = String(kH > kW ? kW : kH).substring(0, 3);

    if (width != startWidth & height != startHeigth) {
        document.body.style.zoom = clcZoom;
    } else document.body.style.zoom = 1;
}

function addTeamCard(e) {
    e.preventDefault();
    let questionsDisplayIsNotFlex = elemQuestions.style.display != 'flex' ? true : false;
    if (questionsDisplayIsNotFlex) return 0;

    const cardElems = elemTeamsCards.children;
    let cardsСount = cardElems.length;
    if (cardsСount < MAX_TEAMS) {
        for (let id of [...Array(MAX_TEAMS + 1).keys()].slice(1)) {
            let card = document.getElementById(`card_${id}`);
            if (card == null) {
                createTeamCard(id);
                break;
            }
        }
    }
}

function createTeamCard(cardId) {
    const cards = document.querySelector(".cards");
    const card = createElem("div", { className: "card", id: "card_" + cardId });
    cards.append(card);

    const cardBar = createElem("div", { className: "card-bar" });
    const cardUp = createElem("div", { className: "card-up" });
    const cardDown = createElem("div", { className: "card-down" });
    card.append(cardBar, cardUp, cardDown);

    const cardBarActive = createElem("div", { className: "card-bar-active" });
    cardBar.append(cardBarActive);

    const cardPhoto = createElem("div", { className: "photo" });
    const cardTitleInput = createElem("input",
        {
            className: "titleClass",
            type: "text",
            placeholder: CardTitleInput
        });
    cardTitleInput.addEventListener('input', onChangeTeamCardName);
    cardUp.append(cardPhoto, cardTitleInput);

    const cardPhotoText = createElem("h1", { className: "photo-text", innerText: CardTitleInput.charAt(0) });
    cardPhoto.append(cardPhotoText);

    const cardScoreInput = createElem("input",
        {
            className: "scoreClass",
            type: "number",
            placeholder: CardScoreTitleInput,
            value: CardScoreInput
        });
    cardScoreInput.addEventListener('input', onChangeTeamCardScore);
    cardDown.append(cardScoreInput);
}

function onChangeTeamCardName(e) {
    let cardInputText = e.target.value;
    if (cardInputText == undefined || cardInputText == null || cardInputText == '') {
        cardInputText = CardTitleInput;
    }
    e.srcElement.previousSibling.querySelector('.photo-text').innerText = cardInputText[0];
}

function onChangeTeamCardScore(e) {
    let cardInputScore = e.target.value;
    if (cardInputScore == undefined || cardInputScore == null || cardInputScore == '') {
        e.target.value = 0;
    }
}

function onClickTeamCard(e) {
    let card = e.target.closest('.card');
    if (card == null) return 0;
    if (e.ctrlKey) {
        let cardsMoreThanOne = document.querySelectorAll('.card').length > 1 ? true : false;
        let questionsDisplayIsFlex = elemQuestions.style.display == 'flex' ? true : false;
        if (cardsMoreThanOne && questionsDisplayIsFlex) card.remove();
    }
}

function addQuestionPack(questionPackObj, filepath) {
    questionPath = filepath;
    elemQuestions.style.display = 'flex';
    for (let [i, theme] of questionPackObj.entries()) {
        const questionsLine = createElem("div", { className: "questions-line", id: "ql_" + i });
        const questionsTheme = createElem("div", { className: "questions-theme" });
        const questionsThemeText = createElem("h1", { className: "questions-theme-text", innerText: theme.themeName });
        elemQuestions.append(questionsLine);
        questionsLine.append(questionsTheme);
        questionsTheme.append(questionsThemeText);

        for (let [j, elem] of theme.questions.entries()) {
            let cost = elem[2];
            const questionsButton = createElem("div", { className: "questions-button", id: "qb_" + i + "_" + j });
            const questionsButtonText = createElem("h1", { className: "questions-button-text", innerText: cost });
            questionsLine.append(questionsButton);
            questionsButton.append(questionsButtonText);
        }
    }
}

function startQuestion(e) {
    e.preventDefault();

    let button = e.target.closest('.questions-button');
    let cardsLeastOne = elemTeamsCards.children.length > 0;

    if (button != null && !button.disabled && cardsLeastOne) {
        playSound('click.mp3');
        disableAndBlurButton(button);

        const buttonScaleMs = 1000;
        button.style.setProperty('transform', 'scale(1.3)');
        button.style.setProperty('transition', 'all ease-in-out');
        button.style.setProperty('transition-duration', `${buttonScaleMs}ms`);

        const buttons = elemQuestions.querySelectorAll('.questions-button');
        let timeoutDisabledButtons = []

        buttons.forEach(element => {
            if (!element.disabled) {
                element.disabled = true;
                timeoutDisabledButtons.push(element);
            }
        });

        setTimeout(() => {
            button.style.setProperty('transform', 'scale(1)');
            elemQuestions.style.display = 'none';
            elemProgress.style.display = 'flex';

            let questionIds = button.id.substring(3).split('_'); //button.id: qb_0_0
            let themeId = questionIds[0];
            let questionId = questionIds[1];
            let questionIndexes = [themeId, questionId]

            ipcRenderer.send('questionIndexesToMain', questionIndexes);

            timeoutDisabledButtons.map(elem => { elem.disabled = false; });
        }, buttonScaleMs);
    }
}

function setOneQuestion(question, questionPath) {
    let qType = question[0].questionType;
    let aType = question[0].answerType;
    behaviorOnPackType(qType, elemProgress.querySelector('.question-box'), question[1], questionPath);
    behaviorOnPackType(aType, elemAnswer.querySelector('.answer-box'), question[3], questionPath);

    let qCost = question[2];
    cardsGetQuestion(qCost);
}

function disableAndBlurButton(button) {
    button.disabled = true;
    button.style.filter = 'blur(5px)';
    for (lineElem of elemQuestions.children) {
        let qtheme = lineElem.firstChild;
        if (qtheme.style.filter == 'blur(5px)') continue;
        let buttons = lineElem.querySelectorAll('.questions-button');
        let blurCount = 0;
        for (buttonElem of buttons) {
            if (buttonElem.style.filter == 'blur(5px)') blurCount += 1;
        }
        if (blurCount == buttons.length) qtheme.style.filter = 'blur(5px)';
    }
}

function startQuestionProgressBar() {
    const progressBar = elemProgress.querySelector('.question-bar');
    const progressBarActive = progressBar.firstElementChild

    progressBar.style.visibility = 'visible';
    progressBarActive.style.width = '100%'

    progressBarActive.style.setProperty('--barSec', `${QUESTION_TIME}s`)
    progressBarActive.classList.add('question-bar-active-fill');

    questionTimer = setTimeout(() => {
        progressBarActive.classList.remove('question-bar-active-fill');
        progressBarActive.style.setProperty('--barSec', ``);
        progressBar.style.visibility = 'hidden';
    }, QUESTION_TIME * 1000);
}

function stopQusetionProgressBar() {
    if (questionTimer !== undefined) {
        clearTimeout(questionTimer);
        const progressBar = elemProgress.querySelector('.question-bar');
        const progressBarActive = progressBar.firstElementChild
        progressBarActive.classList.remove('question-bar-active-fill');
        progressBarActive.style.setProperty('--barSec', ``);
        progressBar.style.visibility = 'hidden';
    }
}

function behaviorOnPackType(packType, element, value, questionPath) {
    if (packType == "text") {
        let text = createElem('h1', {
            className: element.className == 'question-box' ? 'question-text' : 'answer-text'
        })
        text.innerText = value;
        element.append(text);
    }
    else if (packType == "photo") {
        let photo = createElem('img', {
            src: questionPath + '/' + value
        });
        photo.style.height = "100%";
        photo.style.width = "100%"
        element.append(photo);
    }
}

function cardsGetQuestion(qCost) {
    for (let card of elemTeamsCards.children) {
        let cardUp = card.children[1]
        cardUp.style.setProperty('--cardShadow', '#ffffffa2');
        cardUp.style.setProperty('--cardShadowHover', '#90c8e3a2');

        card.addEventListener('click', onTeamGetQuestion)
        card.qCost = qCost;
    }
    window.addEventListener('keydown', onTeamGetQuestion)
}

function onTeamGetQuestion(e) {
    let clickOnCard = elemTeamsCards.contains(e.target);
    let keyToNum = e.code != undefined ? Number(e.code.substring(5)) : 0;
    let nowCardNums = [...Array(elemTeamsCards.childElementCount + 1).keys()].slice(1);
    let keyNumDown = nowCardNums.includes(keyToNum);
    let isSkip = e.code == KeySkip;

    if (clickOnCard || keyNumDown || isSkip) {
        window.removeEventListener('keydown', onTeamGetQuestion);
        for (let card of elemTeamsCards.children) {
            let cardUp = card.children[1]
            let cardId = card.id.substring(5);
            cardUp.style.setProperty('--cardShadow', '');
            cardUp.style.setProperty('--cardShadowHover', '');
            if ((card.contains(e.target) || keyToNum == Number(cardId)) && !isSkip) {
                card.style.setProperty('transform', 'translate(0, -8%) scale(1.2)');
                card.style.setProperty('transition', 'all ease-in-out');
                card.style.setProperty('transition-duration', '0.4s');
                elemChooseButtons.setTeam = card;
                elemChooseButtons.qCost = card.qCost;
            }
            delete card.qCost;
            card.removeEventListener('click', onTeamGetQuestion);
        }
        if (isSkip) {
            elemProgress.style.display = 'none';
            elemAnswer.style.display = 'flex';
            addMultipleEventListener(elemAnswer, ['click', 'keydown'], toShowAnswer);
            return;
        }
        addMultipleEventListener(elemChooseButtons, ['click', 'keydown'], onChooseButtons)

        startQuestionProgressBar();
        elemChooseButtons.style.visibility = 'visible';
    }
}

function onChooseButtons(e) {
    e.preventDefault();

    let teamScoreInput = elemChooseButtons.setTeam.querySelector('.scoreClass');
    let setQuestionCost = elemChooseButtons.qCost;

    let vScore = teamScoreInput.valueAsNumber;
    if (elemChooseButtons.querySelector('.choose-yes').contains(e.target) || e.code == KeyYes) {
        elemChooseButtons.style.visibility = 'hidden';
        elemProgress.style.display = 'none';
        elemAnswer.style.display = 'flex';

        teamScoreInput.valueAsNumber = vScore + setQuestionCost;

        addMultipleEventListener(elemAnswer, ['click', 'keydown'], toShowAnswer)
    }
    else if (elemChooseButtons.querySelector('.choose-no').contains(e.target) || e.code == KeyNo) {
        elemChooseButtons.style.visibility = 'hidden';

        teamScoreInput.valueAsNumber = vScore - setQuestionCost;
        cardsGetQuestion(setQuestionCost);
    }
    if (elemChooseButtons.querySelector('.choose-yes').contains(e.target) || elemChooseButtons.querySelector('.choose-no').contains(e.target) || e.code == KeyYes || e.code == KeyNo) {
        stopQusetionProgressBar();

        elemChooseButtons.setTeam.style.setProperty('transform', 'none');
        removeMultipleEventListener(elemChooseButtons, ['click', 'keydown'], onChooseButtons)
    }
}

function toShowAnswer(e) {
    let keyS = e.code == KeySkip;
    let targetCont = (elemAnswer.contains(e.target));
    if (keyS || targetCont) {
        elemAnswer.style.display = 'none';
        elemQuestions.style.display = 'flex';

        delete elemChooseButtons.setTeam;
        delete elemChooseButtons.qCost;

        removeMultipleEventListener(elemAnswer, ['click', 'keydown'], toShowAnswer)

        let elemProgressBox = elemProgress.querySelector('.question-box');
        let elemAnswerBox = elemAnswer.querySelector('.answer-box');
        while (elemProgressBox.firstChild || elemAnswerBox.firstChild) {
            elemProgressBox.removeChild(elemProgressBox.firstChild);
            elemAnswerBox.removeChild(elemAnswerBox.firstChild);
        }
    }
}

function playSound(file) {
    let sound = new Audio(path.join(node.dirname + '/audio/', file));
    sound.play();
}


function swapColorTheme() {
    if (colorThemeIndex == colorThemes['back-color'].length-1) {
        colorThemeIndex = 0;
    } else { colorThemeIndex += 1 }
    root.style.setProperty('--back-color', colorThemes['back-color'][colorThemeIndex]);
    root.style.setProperty('--button-color', colorThemes['button-color'][colorThemeIndex]);
    root.style.setProperty('--card-color', colorThemes['card-color'][colorThemeIndex]);
    root.style.setProperty('--inwrap-color', colorThemes['inwrap-color'][colorThemeIndex]);
    root.style.setProperty('--text-color', colorThemes['text-color'][colorThemeIndex]);
    root.style.setProperty('--wrapper-color', colorThemes['wrapper-color'][colorThemeIndex]);
}

function createElem(tag, elemAttributes) {
    return Object.assign(document.createElement(tag), elemAttributes);
}

function addMultipleEventListener(element, events, handler) {
    events.forEach(e => {
        if (e == 'keydown') element = window;
        element.addEventListener(e, handler)
    })
}

function removeMultipleEventListener(element, events, handler) {
    events.forEach(e => {
        if (e == 'keydown') element = window;
        element.removeEventListener(e, handler)
    })
}

ipcRenderer.on('colorThemes', (arrThemes) => {
    colorThemes = arrThemes;
});


ipcRenderer.on('questionPack', (questionPack) => {
    addQuestionPack(questionPack);
});

ipcRenderer.on('oneQuestionData', (question, questionPath) => {
    setOneQuestion(question, questionPath);
});

window.addEventListener('resize', updateZoom);
elemQuestions.addEventListener('click', startQuestion);
elemTeamsCards.addEventListener('click', onClickTeamCard);
toStartButton.addEventListener('click', () => { ipcRenderer.send('to-start') });
addCardButton.addEventListener('click', addTeamCard);
themeSwapButton.addEventListener('click', swapColorTheme);