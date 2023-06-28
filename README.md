[![en](https://img.shields.io/badge/English_version-red.svg)](README.en.md)
# Своя игра

![Скриншот приложения](screenshots/screen1.png)

## Описание

**Своя игра** - это интерактивное приложение, основанное на идее популярной игры, которая предлагает пользователям запускать пакеты вопросов, на которые они должны отвечать, допускается не более 5 команд. За каждый правильный ответ начисляются очки, а за неправильные ответы очки сгорают. Приложение используется офлайн, рекомендуется использовать проектор. Однако, для проведения игры необходимо наличие одного ведущего, который будет вести игру. Приложение принимает пакеты вопросов в формате JSON.

## Зависимости

Установить **[Node.js](https://nodejs.org/ru)**, после загрузить все зависимости через пакетный менеджер `npm install`.

## Запуск
- Запустить уже созданную сборку установщика можно по пути `si-game-electron/dist/SiGame Setup 1.0.0.exe`.
- Для создание сборки используйте `npm run build` или запустите electron приложение `npm run start`.

Тестовый пакет с вопросами находится по пути `si-game-electron/testQuestionPack/quests.json`.

## Управление

- **Клавиатура**: Используйте следующие клавиши для управления игрой:
  - **S** - пропуск вопроса
  - **[1,2,3,4,5] цифровой блок над клавиатурой** - Выбор отвечающей команды
  - **Control+R** - Перезагрузить страницу приложения
  - **F11** - Полноэкранный режим
  - **Control+ЛКМ на команду** - Удаление команды
  - **Y** - Верный ответ
  - **N** - Неверный ответ

- **Sidebar**: Используйте кнопки на левом меню:
  - **X** - Вернуться к экрану выбора пакета с вопросами
  - **T** - Сменить цветовую тему
  - **+** - Добавить команду

- **Мышь**: Вместо клавиатуры можно использовать мышь
