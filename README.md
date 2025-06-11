# JWT Demo Project

This project demonstrates symmetric and asymmetric JWT token generation and verification using Node.js.

## Setup
1. Install Node.js (v16 or higher recommended)
2. Clone the repository
3. Run `npm install`
4. Generate RSA key pair: `npm run generate-keys`
5. Start the server: `npm start`

## Endpoints

### Symmetric JWT (HS256)
- `POST /symmetric/generate`: Generate a symmetric JWT
  - Body: `{ "userId": "string" }` (optional)
- `POST /symmetric/verify`: Verify a symmetric JWT
  - Body: `{ "token": "string" }`

### Asymmetric JWT (RS256)
- `POST /asymmetric/generate`: Generate an asymmetric JWT
  - Body: `{ "userId": "string" }` (optional)
- `POST /asymmetric/verify`: Verify an asymmetric JWT
  - Body: `{ "token": "string" }`

## API Documentation

Swagger UI is available at [http://localhost:1852/api-docs](http://localhost:1852/api-docs) after starting the server.

## Testing
Use Postman or curl to test the endpoints. Example:

```bash
# Generate symmetric token
curl -X POST http://localhost:3000/symmetric/generate -H "Content-Type: application/json" -d '{"userId":"test123"}'

# Verify symmetric token
curl -X POST http://localhost:3000/symmetric/verify -H "Content-Type: application/json" -d '{"token":"your.token.here"}'

# Generate asymmetric token
curl -X POST http://localhost:3000/asymmetric/generate -H "Content-Type: application/json" -d '{"userId":"test123"}'

# Verify asymmetric token
curl -X POST http://localhost:3000/asymmetric/verify -H "Content-Type: application/json" -d '{"token":"your.token.here"}'
```

## Notes
- Symmetric tokens use HS256 algorithm with a shared secret
- Asymmetric tokens use RS256 algorithm with RSA key pair
- Tokens expire after 1 hour
- The symmetric secret key should be stored securely in production (e.g., environment variables)
- Public/private keys are stored in `public.pem` and `private.pem`