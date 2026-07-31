# Frontend Architecture

Проект разложен по Clean Architecture слоям. Внешние слои могут зависеть от внутренних, но не наоборот.

## Слои

- `app/` - только Next.js entrypoints: страницы, layout и route handlers.
- `features/*/domain/` - бизнес-типы и контракты без React, Next.js и `fetch`.
- `features/*/application/` - use cases, расчеты, фильтры, валидация и сценарии.
- `features/*/infrastructure/` - конкретная работа с backend API, proxy и gateway.
- `features/*/presentation/` - React hooks и компоненты экранов.
- `shared/` - переиспользуемые технические утилиты без знания конкретной feature.

## Правила поддержки

- Не добавляйте `fetch` прямо в компоненты. Создавайте метод в `infrastructure`, а сценарий собирайте в `application`.
- Не кладите backend DTO в JSX-файлы. Типы должны жить в `domain`.
- Расчеты вроде фильтрации, суммы корзины и преобразования форм держите чистыми функциями в `application`.
- `app/page.tsx`, `app/cart/page.tsx` и `app/login/page.tsx` должны оставаться тонкими импортами presentation-компонентов.
- Каталог только добавляет товары в корзину. Просмотр корзины, изменение количества, очистка и оформление заказа живут в `features/cart/presentation`.
- Если новый сценарий нужен нескольким экранам, сначала оформите его как чистую функцию или gateway-контракт, затем подключайте из hook.
