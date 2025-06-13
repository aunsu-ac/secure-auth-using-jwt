# Secure Auth Using JWT (with Redis & AES Encryption)

This project demonstrates secure JWT authentication using asymmetric keys (RS256), AES-256-CBC encryption, and Redis for token storage and management.

## Features

- **Asymmetric JWT (RS256)**: Uses RSA key pair for signing and verifying tokens.
- **AES-256-CBC Encryption**: JWTs are encrypted before storage/transmission.
- **Redis Integration**: Tokens are stored and managed in Redis for session control.
- **Environment Variables**: All secrets and configs are managed via `.env`.
- **Swagger API Docs**: Interactive documentation at `/api-docs`.
- **Nodemon**: For automatic server restarts during development.

## Prerequisites

- Node.js (v16 or higher)
- Redis server running locally (default: `localhost:6379`)

## Setup

1. **Install Redis** (if not already installed).
2. **Clone the repository**:
   ```bash
   git clone <repo-url>
   cd secure-auth-using-jwt
   ```
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Create a `.env` file** in the project root:
   ```env
   REDIS_URL=redis://localhost:6379
   AES_SECRET=aes-256-cbc-demo-key-32byteslong!!
   AES_IV=1234567890123456
   ```
5. **Generate RSA key pair**:
   ```bash
   npm run generate-keys
   ```
   This creates `private.pem` and `public.pem` in the project root.
6. **Start the server**:
   ```bash
   npm start
   ```

## Redis Token Storage Format

Tokens are stored in Redis under keys like `user:<userId>`, with the following structure:
```json
{
  "tokens": [
    { "token": "encrypted-jwt-token", "deleted": false, "type": "asymmetric" }
  ]
}
```

## API Endpoints

### Asymmetric JWT (RS256)

- **Generate Token**
  - `POST /asymmetric/generate`
  - Body: `{ "userId": "string" }` (optional, defaults to `"12345"`)
- **Verify Token**
  - `POST /asymmetric/verify`
  - Body: `{ "token": "string", "userId": "string" }`
- **Delete Token**
  - `POST /asymmetric/delete`
  - Body: `{ "token": "string", "userId": "string" }`

## Example Usage

```bash
# Generate asymmetric token
curl -X POST http://localhost:3000/asymmetric/generate -H "Content-Type: application/json" -d '{"userId":"test123"}'

# Verify asymmetric token
curl -X POST http://localhost:3000/asymmetric/verify -H "Content-Type: application/json" -d '{"token":"your.encrypted.token.here","userId":"test123"}'

# Delete asymmetric token
curl -X POST http://localhost:3000/asymmetric/delete -H "Content-Type: application/json" -d '{"token":"your.encrypted.token.here","userId":"test123"}'
```

## API Documentation

- Access Swagger UI at: [http://localhost:3000/api-docs](http://localhost:3000/api-docs)

## Notes

- Tokens expire after 1 hour (JWT expiration), but remain in Redis until deleted.
- Update `REDIS_URL` in `.env` if using a remote or authenticated Redis instance.
- Public/private keys are stored in `public.pem` and `private.pem`.
- All environment variables are loaded via `dotenv`.

---