# Команды для коммитов

Выполнять в PowerShell из D:\Tech3 по порядку. Это только инструкция: команды агентом не выполнялись. Репозиторий на момент начала работы не содержал коммитов.

## 1. Предоставленные материалы

```powershell
git add -- dataset example
git diff --cached --stat
git commit -m "chore: add practice 3 dataset and reference example"
```

## 2. Приложение

```powershell
git add -- index.html css/styles.css js/data.js js/app.js
git diff --cached --stat
git commit -m "feat: implement Bootstrap project dashboard"
```

## 3. Проверки и документация

```powershell
npm test
npm run check
git add -- .gitignore package.json tests/data.test.js README.md COMMITS.md
git diff --cached --stat
git commit -m "test: add dashboard checks and practice documentation"
git status --short
```

## Отправка в удалённый репозиторий

Сначала проверить адрес и текущую ветку:

```powershell
git remote -v
git branch --show-current
```

Если origin настроен и работа ведётся в исходной ветке main:

```powershell
git push -u origin main
```

Если нужен pull request, до первого коммита создать ветку:

```powershell
git switch -c codex/practice-3
```

После трёх коммитов отправить её и создать PR (если установлен и авторизован GitHub CLI; целевая ветка main должна существовать на сервере):

```powershell
git push -u origin codex/practice-3
gh pr create --base main --head codex/practice-3 --title "Практическая работа 3: панель проекта на Bootstrap" --body "Реализованы загрузка dataset, адаптивная панель, поиск и фильтрация операций, modal смены статуса и toast. Добавлены обработка ошибок, тесты и инструкция запуска. Проверки: npm test, npm run check."
```

Для пустого удалённого репозитория сначала нужна базовая ветка; PR без неё создать нельзя. Не выполнять оба варианта отправки одновременно — выбрать прямую сдачу в main либо сдачу через PR согласно требованиям преподавателя.
