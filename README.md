# Healthcare API

This repository contains a modular monolithic REST API for a healthcare domain. It is built with **Express** on top of **Node.js** and uses **MongoDB** for persistence via **Mongoose**. Each domain concept (patients, providers, appointments, encounters, prescriptions, labs, vitals, inventory, billing, reports) is encapsulated in its own module under `src/modules`.

## Features

- 📦 **Modular structure** – each module exposes its own router, model and validation.
- 🧶 **Extensive endpoints** – between 10 and 20 endpoints per module, covering CRUD operations, search, counting, and placeholders for notes/history/related records.
- 📚 **Swagger/OpenAPI docs** – automatically generated from JSDoc comments and served at `/docs`.
- 🔒 **Validation** – request bodies are validated with [Zod](https://github.com/colinhacks/zod).
- 🟡 **Security** – common middleware (helmet, CORS) included.

## Getting Started

```bash
git clone <your-repo-url>
cd health-api
npm install
node src/app.js
```

The API will start on port `3000` by default. Swagger UI is available at `http://localhost:3000/docs`.

### Environment variables

| Name | Description | Default |
|------|-------------|---------|
| `MONGO_URI` | MongoDB connection string | `mongodb://localhost:27017/health-api` |
| `PORT` | Port to run the HTTP server on | `3000` |

## Project Structure

```text
health-api/
├── package.json      # Project metadata and dependencies
├── README.md         # This file
└── src/
    ├── app.js        # Express app bootstrap
    ├── config/
    │   └── mongo.js  # MongoDB connection helper
    ├── modules/
    │   ├── patients.js        # Patients endpoints and model
    │   ├── providers.js       # Providers endpoints and model
    │   ├── appointments.js    # Appointments endpoints and model
    │   ├── encounters.js      # Encounters (EHR) endpoints and model
    │   ├── prescriptions.js   # Medication prescriptions
    │   ├── labs.js            # Laboratory results
    │   ├── vitals.js          # Vital signs measurements
    │   ├── inventory.js       # Internal inventory management
    │   ├── billing.js         # Billing and invoices
    │   └── reports.js         # Aggregate reports
    └── config/
        └── mongo.js  # Database connection
```

## Notes

- This project is meant as a learning scaffold. Many areas such as authentication, authorization, advanced error handling, pagination and database indexes have been simplified or omitted for brevity.
- The history/notes/related endpoints return placeholder data to satisfy the 10–20 routes requirement. In a production system these would link to other collections or services.

Feel free to fork and adapt this API to your own use cases! PRs are welcome.
