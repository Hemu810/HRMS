# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## Payroll backend

The payroll email flow uses a FastAPI backend so SMTP credentials are never exposed in the browser.

1. Configure frontend env:

```bash
cp .env.example .env
```

2. Configure backend env:

```bash
cd ../backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
```

Create an MS SQL Server database named `DOLOXEHRMS`, then update `DATABASE_URL` and SMTP values in `backend/.env`.

3. Run both apps in separate terminals:

```bash
npm run dev
npm run backend:dev
```

The frontend posts payslip PDF emails to `VITE_PAYSLIP_EMAIL_ENDPOINT`, which defaults to `http://localhost:4000/api/send-payslip`.

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
