import { generateKeyPairSync } from 'crypto';
import { writeFileSync } from 'fs';

const { publicKey, privateKey } = generateKeyPairSync('rsa', {
  modulusLength: 2048,
});

writeFileSync('public.pem', publicKey.export({ type: 'spki', format: 'pem' }));
writeFileSync('private.pem', privateKey.export({ type: 'pkcs8', format: 'pem' }));
console.log('Key pair generated: public.pem and private.pem');