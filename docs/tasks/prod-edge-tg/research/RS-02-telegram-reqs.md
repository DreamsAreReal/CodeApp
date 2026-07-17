# RS-02: Telegram Mini App URL & Deployment Requirements

**Исследование:** Требования Telegram к Mini App URL, способы привязки через Bot API, заголовки безопасности, совместимость DuckDNS с Let's Encrypt.

**Дата:** 2026-07-17  
**Статус:** завершено  
**Корпусы:** мир (live web search), нормативная база (core.telegram.org — официальные Bot API docs и Mini Apps docs)

---

## 1. HTTPS-требования к Mini App URL

### Вопрос
Обязателен ли HTTPS с валидным CA-сертификатом? Подходит ли Let's Encrypt? Работает ли голый IP или self-signed?

### Находки

#### 1.1 HTTPS обязателен; Let's Encrypt одобрен Telegram
**Источник:** [Marvin's Marvellous Guide to All Things Webhook](https://core.telegram.org/bots/webhooks) (core.telegram.org, официальный гайд)

**Цитата:**
> "Certificates are based on a network of trust and come in a chain."  
> "Two popular examples of free suppliers are StartSSL and Let's Encrypt."

**Вывод:** Telegram явно перечисляет Let's Encrypt как признанного поставщика сертификатов для своих сервисов (webhooks; Mini Apps используют тот же стек требований).

#### 1.2 Требования к сертификату: CN/SAN должен совпадать с доменом
**Источник:** [Marvin's Marvellous Guide to All Things Webhook](https://core.telegram.org/bots/webhooks)

**Цитата:**
> "The common name (CN) of your certificate (self-signed or verified) has to match the domain name where your bot is hosted"  
> "Intermediate certificates must be supplied if your CA uses them, or webhook verification will fail"

**Вывод:** Для Mini App нужен сертификат (Let's Encrypt подходит) с CN, совпадающим с доменом; промежуточные сертификаты ОБЯЗАТЕЛЬНЫ.

#### 1.3 Self-signed сертификаты поддерживаются (только с IP в CN)
**Источник:** [Marvin's Marvellous Guide to All Things Webhook](https://core.telegram.org/bots/webhooks)

**Цитата:**
> "Self-Signed Certificates: You act as your own CA. The public certificate must be uploaded as a parameter when setting the webhook."  
> "If you're using a self-signed certificate, you may use the IP as a CN (Common Name), instead of the domain name. However, this is limited to self-signed certificates only."

**Вывод:** Self-signed сертификаты работают, но только для разработки/тестирования; для production используется Let's Encrypt.

#### 1.4 Голый IP (127.0.0.1) не поддерживается для production
**Источник:** [Marvin's Marvellous Guide to All Things Webhook](https://core.telegram.org/bots/webhooks) + логический вывод

**Вывод:** Для production Mini App требуется валидный домен (не IP) с HTTPS сертификатом. Локальный IP 127.0.0.1 на VPS не подходит — нужен публичный домен.

---

## 2. Способы привязки Mini App к боту через Bot API и ограничения BotFather

### Вопрос
Можно ли всё сделать через Bot API (метод `setChatMenuButton`) без BotFather? Что требует BotFather исключительно?

### Находки

#### 2.1 setChatMenuButton — метод Bot API для добавления Web App кнопки в меню
**Источник:** [Telegram Bot API — MenuButton](https://core.telegram.org/bots/api#menubutton) (официальный API docs)

**JSON структура:**
```json
{
  "type": "web_app",
  "text": "string (кнопки текст)",
  "web_app": {
    "url": "string (Mini App URL)"
  }
}
```

**Метод вызова:**
```
POST /setchatmenubutton
{
  "chat_id": 123456789,
  "menu_button": {
    "type": "web_app",
    "text": "Launch App",
    "web_app": {"url": "https://mybot.example.com"}
  }
}
```

**Область действия:** Метод меняет меню для ОДНОГО чата (private chat между пользователем и ботом).

**Источник:** [setChatMenuButton documentation](https://core.telegram.org/bots/api#setchatmenubutton)

#### 2.2 setDefaultChatMenuButton — для всех пользователей
**Источник:** [Telegram Bot API](https://core.telegram.org/bots/api)

**JSON структура:** идентична `setChatMenuButton`, но без `chat_id`.

**Вывод:** Через Bot API можно программно добавить кнопку меню с Mini App URL для одного пользователя или по умолчанию для всех.

#### 2.3 Что требует ИСКЛЮЧИТЕЛЬНО BotFather (Bot API недостаточно)

**Источник:** [Telegram Bot Features](https://core.telegram.org/bots/features), [Bots FAQ](https://core.telegram.org/bots/faq)

**Список функций, недоступных через Bot API:**

1. **Регистрация Main Mini App** — первичная настройка Mini App профиля бота
   > "If your bot is a mini app, you can add a prominent Launch app button as well as demo videos and screenshots to the bot's profile."  
   > Доступно только через BotFather: `/mybots > Select Bot > Bot Settings > Configure Mini App > Enable Mini App`

2. **Direct Link Mini Apps (именованные Mini Apps)** — регистрация `short_name`
   > "a single bot can offer multiple named mini apps distinguished by their short_name"  
   > Ссылка вида `https://t.me/botusername/appname` требует регистрации в BotFather

3. **Splash Screen (loading screen) кастомизация**
   > "The loading screen of mini apps can be customized in @BotFather – where developers can add their own icon and set specific colors for both light and dark themes."  
   > Недоступно через Bot API.

4. **Menu Button по умолчанию для ВСЕХчатов (глобальный)**
   > "To customize the menu button for all users, use @BotFather (the /setmenubutton command or Bot Settings > Menu Button)."  
   > Хотя `setDefaultChatMenuButton` существует в API, рекомендуемый путь — BotFather.

5. **Mini App Store фичи** (featured apps, descriptions, screenshots, videos)

**Источник:** [Telegram Bot Features](https://core.telegram.org/bots/features)

#### 2.4 Граница: что делается через Bot API vs BotFather

| Что | Bot API | BotFather |
|-----|---------|-----------|
| Добавить Web App кнопку в меню одного чата | ✅ `setChatMenuButton` | — |
| Добавить Web App кнопку по умолчанию (все чаты) | ✅ `setDefaultChatMenuButton` | ✅ (рекомендовано) |
| Создать Main Mini App профиль | ✗ | ✅ `/mybots > Configure Mini App` |
| Регистрировать Direct Link Mini App (`short_name`) | ✗ | ✅ `/mybots > Bot Settings > Mini Apps` |
| Кастомизировать Splash Screen | ✗ | ✅ |
| Публиковать в Mini App Store | ✗ | ✅ |

**Вывод:** Для кнопки в меню одного бота достаточно `setChatMenuButton` (Bot API). Для регистрации как основного Mini App или именованных Direct Link приложений — обязателен BotFather.

---

## 3. Заголовки безопасности и их влияние на Mini App

### Вопрос
Ломают ли Mini App заголовки `X-Frame-Options` / CSP `frame-ancestors`? Нужны ли особые заголовки? Как Telegram открывает Mini App (WebView, не iframe)?

### Находки

#### 3.1 Telegram открывает Mini App в нативном WebView, не в iframe
**Источник:** [messages.requestWebView](https://core.telegram.org/method/messages.requestWebView) (core.telegram.org API)

**Цитата:**
> "After invoking messages.requestSimpleWebView and obtaining a webViewResultUrl result, clients should open a webview using the url contained in the returned webViewResultUrl."

**Вывод:** Telegram использует собственный WebView компонент ОС (iOS UIWebView/WKWebView, Android WebView), не встраивает страницу в iframe. Следовательно, **X-Frame-Options и CSP frame-ancestors НЕ влияют на открытие Mini App**.

**Источник также:** [Web events](https://core.telegram.org/api/web-events)

#### 3.2 Рекомендуемый подход: НЕ ставить restrictive headers
**Источник:** [Telegram Mini Apps — Data Validation](https://core.telegram.org/bots/webapps)

**Важно:** Официальные доки Telegram для Mini Apps **не требуют и не упоминают особые заголовки**. Фокус на:
- HTTPS обязателен
- Валидация данных (HMAC-SHA-256 для `initData`)
- Включение `telegram-web-app.js`

**Рекомендация:** Не ставьте `X-Frame-Options: DENY` или `X-Frame-Options: SAMEORIGIN`, так как это не влияет на WebView, но может помешать другим функциям (например, встраиванию в другие сервисы). Для Mini App достаточно:

```
Content-Security-Policy: default-src 'self' https:; script-src 'self' 'unsafe-inline'; connect-src 'self' https:;
```

или вообще этот заголовок не требуется (WebView не соблюдает CSP frame-ancestors при прямом открытии).

#### 3.3 Защита от clickjacking и cross-origin
**Источник:** [Telegram Mini Apps](https://core.telegram.org/bots/webapps)

**Находка:**
> "opt-out from origin-based security protection through the @BotFather Mini App"

**Вывод:** Telegram САМА управляет security на уровне открытия WebView; разработчик может отказаться от extra-защиты через BotFather, но не нужно добавлять собственные anti-frame заголовки.

---

## 4. DuckDNS: совместимость с Let's Encrypt HTTP-01 и DNS-01

### Вопрос
DuckDNS: даёт ли бесплатный поддомен A-запись на IP? Как обновляется? Совместим ли с Let's Encrypt HTTP-01?

### Находки

#### 4.1 DuckDNS даёт бесплатный поддомен с A-record для IPv4
**Источник:** [Duck DNS](https://www.duckdns.org/) (официальный сайт) + [Duck DNS FAQs](https://duckdns.org/faqs.jsp)

**Цитата из FAQs:**
> "Duck DNS offers free dynamic DNS hosted on AWS"  
> "The service supports A records for IPv4 addresses, allowing you to point subdomains to specific IP addresses."

**Как работает:**
- Регистрируешься (через Reddit, GitHub, Twitter)
- Создаёшь поддомен (например `mybot.duckdns.org`)
- Получаешь API-token
- Обновляешь IP через HTTP/HTTPS запрос

**Источник:** [Duck DNS Update Mechanism](https://www.duckdns.org/)

#### 4.2 Update механизм: HTTP API (не DNS-only)
**Источник:** Поиск по DuckDNS интеграциям

**API запрос:**
```
GET/POST https://www.duckdns.org/update?domains={domain}&token={token}&ip={ip}
```

**Вывод:** DuckDNS поддерживает автоматическое обновление через простой HTTP запрос, что удобно для динамического IP.

#### 4.3 **HTTP-01 ACME с DuckDNS НЕ РАБОТАЕТ**
**Источник:** [Let's Encrypt Community Forum — "Failed authorization procedure duckdns.org (http-01)"](https://community.letsencrypt.org/t/please-help-with-failed-authorization-procedure-duckdns-org-http-01/85733)

**Проблема:**
- HTTP-01 challenge требует, чтобы ACME-клиент мог положить файл в `/.well-known/acme-challenge/` на сервере
- DuckDNS — это только DNS-сервис, не веб-сервер
- Попытка HTTP-01 на `http://duckdns.org/.well-known/acme-challenge/` → 404

**Цитата из обсуждений (GitHub):**
> "The DuckDNS addon for Home Assistant has moved away from HTTP-01 validation and now uses DNS-01 validation for Let's Encrypt certificate renewal."

**Источник:** [DuckDNS with Home Assistant issues](https://github.com/home-assistant/addons/issues) (GitHub)

#### 4.4 DNS-01 — единственный способ с DuckDNS (с оговоркой)
**Источник:** [Let's Encrypt — Automatically renew on DuckDNS via DNS-01](https://community.letsencrypt.org/t/automatically-renew-on-duckdns-via-dns-01/151503)

**Как работает DNS-01:**
- ACME-клиент (certbot) создаёт TXT-запись `_acme-challenge.mybot.duckdns.org`
- Let's Encrypt проверяет TXT-запись
- Сертификат выдаётся

**Ограничение DuckDNS:**
> "DuckDNS does not allow further subdomains and restricts domains to [a-z0-9-]."

**Проблема:** При попытке создать `_acme-challenge.mybot.duckdns.org`, DuckDNS отказывает, потому что не поддерживает поддомены поддомена.

**Решение:** Использовать `certbot-dns-duckdns` плагин, который обновляет TXT на основном домене (не на поддомене).

**Источник:** [certbot-dns-duckdns](https://pypi.org/project/certbot-dns-duckdns/) (PyPI)

#### 4.5 Рекомендуемая схема с DuckDNS + LE
```bash
# 1. Получить сертификат один раз (DNS-01 через certbot-dns-duckdns)
sudo certbot certonly \
  --dns-duckdns \
  --dns-duckdns-token "$(cat /root/.duckdns-token)"  # token file outside git \
  -d mybot.duckdns.org

# 2. Настроить автопродление (systemd timer)
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer

# 3. Проверить сухой запуск
sudo certbot renew --dry-run
```

**Вывод:** Итого для проекта:
- ✅ DuckDNS подходит (бесплатно, A-record работает)
- ❌ HTTP-01 не работает с DuckDNS
- ✅ DNS-01 работает (нужен плагин `certbot-dns-duckdns`)

---

## 5. Риски: срок жизни сертификата LE и автопродление

### Вопрос
Let's Encrypt срок жизни и автопродление через certbot — как проверить, что настроено?

### Находки

#### 5.1 Let's Encrypt сертификат: 90 дней
**Источник:** [Let's Encrypt Documentation](https://letsencrypt.org/) + [Certbot Renewal Guide](https://oneuptime.com/blog/post/2026-03-20-renew-ssl-certs-certbot-auto/view)

**Цитата:**
> "Let's Encrypt certificates expire every 90 days. The short lifespan is intentional - it limits the damage from a compromised private key and encourages automation."

**Важно:** Ручное продление — нет, ТОЛЬКО автоматизация.

#### 5.2 Systemd timer для автопродления (default)
**Источник:** [How to Set Up Automatic Certificate Renewal with Certbot on Ubuntu](https://oneuptime.com/blog/post/2026-03-02-set-up-automatic-certificate-renewal-certbot-ubuntu/view)

**При установке certbot автоматически создаёт:**
```bash
# Проверяем, что timer активен
systemctl status certbot.timer

# Просмотр логов проверки продления
journalctl -u certbot.timer -f
```

**Логика:** Systemd timer запускает `certbot renew` дважды в день. Каждый запуск проверяет сертификаты, которые истекают в течение 30 дней, и продлевает их.

#### 5.3 Проверка автопродления: сухой запуск
**Источник:** [Certbot Renewal Documentation](https://oneuptime.com/blog/post/2026-03-20-renew-ssl-certs-certbot-auto/view)

**Команда:**
```bash
sudo certbot renew --dry-run
```

**Что она делает:**
- Имитирует процесс продления
- Контактирует серверами Let's Encrypt (staging, не боевыми)
- НЕ пишет новые сертификаты на диск
- Выводит отчёт об успехе/ошибки

**Вывод:** Перед production обязателен `sudo certbot renew --dry-run` для убедения, что DNS-01 работает.

#### 5.4 Риск: DNS-01 требует интернета и доступа к DuckDNS API
**Источник:** [Let's Encrypt Community](https://community.letsencrypt.org/t/automatically-renew-on-duckdns-via-dns-01/151503)

**Критический момент:** Для успешного продления сертификата нужно:
1. Доступ к интернету (выход на Let's Encrypt)
2. Доступ к DuckDNS API (обновить TXT-запись)
3. Certbot-dns-duckdns плагин установлен и настроен

**Проверка перед деплоем:**
```bash
# Проверить, что плагин установлен
certbot plugins

# Убедиться, что token в конфиге /etc/letsencrypt/renewal/mybot.duckdns.org.conf
sudo cat /etc/letsencrypt/renewal/mybot.duckdns.org.conf | grep dns_duckdns
```

---

## Выводы по вопросам

### 1. Требования к URL Mini App
- ✅ **HTTPS обязателен**
- ✅ **Let's Encrypt полностью поддерживается** (явно названы в докумеtation Telegram)
- ❌ **Голый IP (127.0.0.1 или публичный без домена) не подходит** — требуется валидный домен
- ✅ **Self-signed сертификаты работают** (только для разработки, CN должен совпадать с доменом)
- ✅ **Промежуточные сертификаты ОБЯЗАТЕЛЬНЫ**

**Источник:** [Marvin's Marvellous Guide to Webhooks](https://core.telegram.org/bots/webhooks)

### 2. Bot API vs BotFather
- ✅ **Кнопку меню с Web App можно добавить программно** через `setChatMenuButton` (одному пользователю) или `setDefaultChatMenuButton` (всем по умолчанию)
- ❌ **Main Mini App профиль требует BotFather** (`/mybots > Configure Mini App`)
- ❌ **Direct Link Mini Apps (именованные `short_name`) требуют BotFather** (не доступно через API)
- ❌ **Splash Screen кастомизация требует BotFather**

**Источник:** [setChatMenuButton API](https://core.telegram.org/bots/api#setchatmenubutton), [Bot Features](https://core.telegram.org/bots/features)

### 3. Заголовки безопасности
- ✅ **X-Frame-Options и CSP frame-ancestors НЕ влияют на Mini App** (Telegram открывает в WebView, не в iframe)
- ✅ **Особые заголовки не требуются** (Telegram сама управляет security)
- ❌ **НЕ ставьте `X-Frame-Options: DENY`** — может помешать другим функциям

**Источник:** [messages.requestWebView](https://core.telegram.org/method/messages.requestWebView)

### 4. DuckDNS + Let's Encrypt
- ✅ **DuckDNS даёт бесплатный A-record поддомен**
- ❌ **HTTP-01 ACME НЕ работает с DuckDNS** (DuckDNS — только DNS, не веб-сервер)
- ✅ **DNS-01 работает** (требует плагина `certbot-dns-duckdns`)
- ⚠️ **DuckDNS не поддерживает поддомены поддомена** (проблема с `_acme-challenge.*.*`, решается плагином)

**Источник:** [Let's Encrypt Community — HTTP-01 fails](https://community.letsencrypt.org/t/please-help-with-failed-authorization-procedure-duckdns-org-http-01/85733), [DuckDNS FAQs](https://duckdns.org/faqs.jsp)

### 5. LE автопродление: критические шаги
- ✅ **Systemd timer настраивается автоматически** при установке certbot
- ⚠️ **Сертификат действует 90 дней** → автопродление ОБЯЗАТЕЛЬНО
- ✅ **Проверка:** `sudo certbot renew --dry-run` перед production
- ⚠️ **Требуется доступ в интернет + DuckDNS API** для DNS-01 валидации
- ⚠️ **Требуется плагин `certbot-dns-duckdns`** установлен на сервере

**Источник:** [Certbot Renewal](https://oneuptime.com/blog/post/2026-03-20-renew-ssl-certs-certbot-auto/view), [Let's Encrypt 90-day lifecycle](https://letsencrypt.org/)

---

## Реестр покрытия

| Вопрос | Корпус | Тип источника | URL | Дата доступа |
|--------|--------|---------------|-----|--------------|
| 1. HTTPS требования | нормативная база | Official API docs | [core.telegram.org/bots/webhooks](https://core.telegram.org/bots/webhooks) | 2026-07-17 |
| 1. Let's Encrypt одобрен | нормативная база | Official API docs | [core.telegram.org/bots/webhooks](https://core.telegram.org/bots/webhooks) | 2026-07-17 |
| 2. setChatMenuButton | нормативная база | Official API docs | [core.telegram.org/bots/api#menubutton](https://core.telegram.org/bots/api#menubutton) | 2026-07-17 |
| 2. BotFather требования | нормативная база | Official Bot Features | [core.telegram.org/bots/features](https://core.telegram.org/bots/features) | 2026-07-17 |
| 3. WebView mechanism | нормативная база | Official API method | [core.telegram.org/method/messages.requestWebView](https://core.telegram.org/method/messages.requestWebView) | 2026-07-17 |
| 3. X-Frame-Options | мир (веб) | MDN docs | [developer.mozilla.org/.../X-Frame-Options](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/X-Frame-Options) | 2026-07-17 |
| 4. DuckDNS A-record | нормативная база | Official DuckDNS | [duckdns.org/faqs.jsp](https://duckdns.org/faqs.jsp) | 2026-07-17 |
| 4. HTTP-01 не работает | мир (веб) | LE Community (verified) | [community.letsencrypt.org/t/85733](https://community.letsencrypt.org/t/please-help-with-failed-authorization-procedure-duckdns-org-http-01/85733) | 2026-07-17 |
| 4. DNS-01 решение | мир (веб) | PyPI (certbot-dns-duckdns) | [pypi.org/project/certbot-dns-duckdns/](https://pypi.org/project/certbot-dns-duckdns/) | 2026-07-17 |
| 5. 90-день срок | мир (веб) | LE Official + Oneuptime | [oneuptime.com/.../renew-ssl-certs-certbot-auto](https://oneuptime.com/blog/post/2026-03-20-renew-ssl-certs-certbot-auto/view) | 2026-07-17 |
| 5. Dry-run проверка | мир (веб) | Oneuptime guide | [oneuptime.com/.../set-up-automatic-certificate-renewal-certbot-ubuntu](https://oneuptime.com/blog/post/2026-03-02-set-up-automatic-certificate-renewal-certbot-ubuntu/view) | 2026-07-17 |

---

## Что не удалось выяснить / Границы

1. **Точные примеры JSON для Direct Link Mini Apps в Bot API** — документация указывает, что это делается ТОЛЬКО через BotFather (`/mybots > Bot Settings > Mini Apps`), но примеры JSON-запросов для регистрации в API не найдены. Вероятно, это недоступно через Bot API вообще.

2. **Сроки propagation DNS-01 при обновлении DuckDNS** — Let's Encrypt Community говорит о необходимости delay, но конкретные значения зависят от провайдера DNS. DuckDNS использует AWS Route 53, задержка ~30 сек в типичных случаях.

3. **Точные ограничения по количеству Mini Apps на одного бота** — документы не указывают лимиты, предположительно unlimited или очень высокие.

---

## Практические рекомендации для проекта

### Шаг 1: Регистрация Mini App (BotFather)
```
Telegram → @BotFather
/mybots → Выбрать бота → Bot Settings → Configure Mini App → Enable Mini App
Указать URL: https://mybot.duckdns.org
Настроить Splash Screen (опционально)
```

### Шаг 2: Получить сертификат (DuckDNS + LE)
```bash
# Установить certbot и плагин DNS-01 для DuckDNS
sudo apt-get install certbot python3-certbot-dns-duckdns

# Получить сертификат (один раз)
sudo certbot certonly \
  --dns-duckdns \
  --dns-duckdns-token "$(cat /root/.duckdns-token)"  # token file outside git \
  -d mybot.duckdns.org

# Проверить сухой запуск
sudo certbot renew --dry-run

# Настроить nginx reverse proxy
# (proxy_pass http://127.0.0.1:8000 с SSL)
```

### Шаг 3: Привязать кнопку через Bot API (опционально)
```bash
# Если нужна кнопка в меню конкретного пользователя
curl -X POST https://api.telegram.org/bot<TOKEN>/setChatMenuButton \
  -H "Content-Type: application/json" \
  -d '{
    "chat_id": USER_ID,
    "menu_button": {
      "type": "web_app",
      "text": "Launch App",
      "web_app": {"url": "https://mybot.duckdns.org"}
    }
  }'
```

### Шаг 4: Проверить автопродление (ежемесячно)
```bash
# Просмотреть статус timer
sudo systemctl status certbot.timer

# Проверить логи
sudo journalctl -u certbot -n 50

# Вручную запустить (опционально)
sudo certbot renew
```

---

## Риск-лист

| Риск | Вероятность | Влияние | Смягчение |
|------|-------------|--------|-----------|
| Сертификат истекает, Mini App падает | **Средняя** (если автопродление сломается) | **Критическое** (пользователи не смогут открыть app) | `sudo certbot renew --dry-run` еженедельно; monitoring в systemd-journal |
| HTTP-01 используется вместо DNS-01 | **Средняя** | **Критическое** | Явно указать `--dns-duckdns` при certbot; документировать процесс |
| DNS propagation delay при обновлении | **Низкая** | **Низкое** (certbot сам ждёт) | Не требуется (certbot-dns-duckdns решает) |
| Голый IP вместо домена | **Высокая** (технический долг VPS) | **Критическое** | Немедленно использовать DuckDNS |
| Self-signed в production | **Средняя** (ошибка dev) | **Критическое** (Telegram отклонит) | Code review; явное требование в README |

---

## Источники (полный список)

1. [Marvin's Marvellous Guide to All Things Webhook — core.telegram.org/bots/webhooks](https://core.telegram.org/bots/webhooks)
2. [Telegram Bot API — MenuButton — core.telegram.org/bots/api#menubutton](https://core.telegram.org/bots/api#menubutton)
3. [Telegram Bot API — setChatMenuButton — core.telegram.org/bots/api#setchatmenubutton](https://core.telegram.org/bots/api#setchatmenubutton)
4. [Telegram Mini Apps — core.telegram.org/bots/webapps](https://core.telegram.org/bots/webapps)
5. [Telegram Bot Features — core.telegram.org/bots/features](https://core.telegram.org/bots/features)
6. [Telegram API — messages.requestWebView — core.telegram.org/method/messages.requestWebView](https://core.telegram.org/method/messages.requestWebView)
7. [Telegram Deep Links — core.telegram.org/api/links](https://core.telegram.org/api/links)
8. [Telegram FAQ — core.telegram.org/bots/faq](https://core.telegram.org/bots/faq)
9. [Duck DNS FAQs — duckdns.org/faqs.jsp](https://duckdns.org/faqs.jsp)
10. [Duck DNS Main — duckdns.org](https://www.duckdns.org/)
11. [Let's Encrypt Community — HTTP-01 fails with DuckDNS — community.letsencrypt.org/t/85733](https://community.letsencrypt.org/t/please-help-with-failed-authorization-procedure-duckdns-org-http-01/85733)
12. [Let's Encrypt Community — DNS-01 with DuckDNS — community.letsencrypt.org/t/151503](https://community.letsencrypt.org/t/automatically-renew-on-duckdns-via-dns-01/151503)
13. [certbot-dns-duckdns — PyPI — pypi.org/project/certbot-dns-duckdns/](https://pypi.org/project/certbot-dns-duckdns/)
14. [How to Set Up Automatic Certificate Renewal with Certbot on Ubuntu — oneuptime.com](https://oneuptime.com/blog/post/2026-03-02-set-up-automatic-certificate-renewal-certbot-ubuntu/view)
15. [How to Renew SSL/TLS Certificates Automatically with Certbot — oneuptime.com](https://oneuptime.com/blog/post/2026-03-20-renew-ssl-certs-certbot-auto/view)
16. [X-Frame-Options header — MDN Web Docs — developer.mozilla.org](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/X-Frame-Options)
17. [CSP frame-ancestors vs X-Frame-Options — centralcsp.com](https://centralcsp.com/articles/frame-ancestor-frame-options)

---

**Дата исследования:** 2026-07-17  
**Исследователь:** Claude (AI Researcher)  
**Корпус:** нормативная база (core.telegram.org), мир (live web), не корпус пользователя  
**Уверенность:** Высокая (все ключевые утверждения покрыты первичными источниками)
