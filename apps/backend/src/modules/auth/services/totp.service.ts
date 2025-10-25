import { authenticator } from 'otplib';

import { env } from '../../../config/env';

export function generateTotpSecret(email: string) {
  const secret = authenticator.generateSecret();
  const otpauth = authenticator.keyuri(email, env.TOTP_ISSUER, secret);
  return { secret, otpauth }; 
}

export function verifyTotp(token: string, secret: string) {
  return authenticator.verify({ token, secret });
}
