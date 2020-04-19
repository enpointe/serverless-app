/**
 * From https://github.com/sgmeyer/auth0-node-jwks-rs256/blob/master/src/lib/utils.js
 */
export function certToPEM(cert) {
    cert = cert.match(/.{1,64}/g).join('\n');
    cert = `-----BEGIN CERTIFICATE-----\n${cert}\n-----END CERTIFICATE-----\n`;
    return cert;
  }