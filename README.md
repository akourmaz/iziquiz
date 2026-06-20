# IZIHome — анкета подбора недвижимости (квиз)

Интерактивный квиз-квалификация для входящих клиентов подбора.
Клиент проходит анкету по ссылке, жмёт «Отправить заявку» — лид падает в Telegram-бота.

## Структура

```
index.html        — сам квиз (vanilla JS, без сборки)
api/submit.js      — serverless-функция: принимает заявку и шлёт в Telegram
```

Квиз ветвится по интенту (**для жизни** / **под инвестицию**), собирает чистые оси
объекта (тип · комнатность · стадия дома · отделка · бюджет · локация · приоритет)
и формирует контракт `intake.json` для подборщика квартир.

## Деплой на Vercel

1. Vercel → **Add New → Project** → импортировать репозиторий `akourmaz/iziquiz`.
2. Framework Preset: **Other** (статика + serverless, без сборки).
3. **Settings → Environment Variables** добавить:
   - `TELEGRAM_BOT_TOKEN` — токен бота от @BotFather
   - `TELEGRAM_CHAT_ID` — куда слать лиды (chat_id личного чата или группы)
4. **Deploy**. Публичная ссылка вида `https://iziquiz.vercel.app` — её и шлём клиентам.

> Токен **только** в переменных окружения Vercel. В коде и в гите его нет.

## Как узнать TELEGRAM_CHAT_ID

1. Напишите боту `/start`.
2. Откройте `https://api.telegram.org/bot<ТОКЕН>/getUpdates` — в ответе
   `result[].message.chat.id` и есть ваш chat_id.

## Локальная разработка

Локальный прогон живёт в основном репозитории проекта
(`podbor/serve-quiz.js` + `podbor/leads-bot.local.json`), там тот же `/api/submit`.
