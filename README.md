# ADN de Marca — App de Retos (7ma Edición)

App web para el curso "ADN de Marca": journaling diario, reto semanal
(Hotmart) y retos extra con gamificación por puntos.

## Estado actual

Primera iteración: estructura base, registro (con contrato personal tipo
"mad libs") y login. El dashboard de retos, calendario, ranking y
notificaciones por correo llegan en próximas iteraciones.

## Stack

- Next.js (App Router) + TypeScript + Tailwind CSS
- NextAuth (Credentials) para autenticación
- `node:sqlite` (módulo nativo de Node, sin dependencias binarias externas)
  como almacenamiento — `data/app.db`, ignorado por git

## Desarrollo

```bash
npm install
cp .env.example .env.local   # define AUTH_SECRET
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000).
