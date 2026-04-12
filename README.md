# Ember Web — Next.js Frontend

## Quick start (Docker)

```bash
# From ember-platform/ root
cp .env.example .env
docker-compose up --build
```

- Customer app → http://localhost:3000/menu
- Kitchen → http://localhost:3000/dashboard

## Local development

```bash
cd ember-web
npm install
cp .env.example .env.local    # set API URLs
npm run dev
```

## Tests

```bash
npm test              # all component + unit tests
npm run test:cov      # with coverage report
```

## Environment variables

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_API_URL` | Backend REST API base URL |
| `NEXT_PUBLIC_WS_URL` | Backend WebSocket URL |

## Pages

| Route | Description |
|---|---|
| `/menu` | Browse menu, filter, add to cart |
| `/cart` | Review order, pay (mock) |
| `/track/:orderId` | Real-time order tracker (WebSocket) |
| `/login` | Admin JWT login |
| `/dashboard` | Live kanban order board |

## Key features

- **Real-time tracking** — WebSocket rooms, no polling
- **Stale price detection** — warns if price changed since cart addition
- **Cart persistence** — Redis-backed with 24h TTL, survives refresh
- **Mock payment** — any card except `0000` succeeds
- **Concurrent stock** — handled server-side with SELECT FOR UPDATE
- **Zustand state** — cart, auth, orders, UI — persisted where appropriate

## Mock payment

| Card last 4 | Result |
|---|---|
| `0000` | Declined |
| Any other | Success |
