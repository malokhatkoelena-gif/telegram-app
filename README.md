# Белла Вита Парфюм

Статическое приложение для Telegram/Web: каталог нишевой парфюмерии, корзина, личный кабинет и доставка.

## Как опубликовать на GitHub Pages

1. Создайте новый репозиторий на GitHub, например `bella-vita-perfume`.
2. Загрузите в репозиторий все файлы из этой папки:
   - `index.html`
   - `styles.css`
   - `app.js`
   - `.nojekyll`
   - папку `assets`
3. Откройте настройки репозитория: `Settings` -> `Pages`.
4. В разделе `Build and deployment` выберите:
   - Source: `Deploy from a branch`
   - Branch: `main`
   - Folder: `/root`
5. Нажмите `Save`.
6. Через 1-3 минуты GitHub покажет публичную ссылку на сайт.

## Для Telegram Mini App

После публикации используйте HTTPS-ссылку GitHub Pages в настройках бота через BotFather.

## Локальная проверка

Можно открыть `index.html` в браузере или запустить простой сервер:

```bash
python3 -m http.server 4173
```

Затем открыть `http://127.0.0.1:4173`.
