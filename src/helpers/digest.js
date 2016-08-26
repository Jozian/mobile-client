import md5 from 'md5';
// FIXME:
const wwwAuthenticate = [
  'Digest realm="NDG"',
  'nonce="zVYxgsp9VEvmq8m9dXyExqTJK0GdZhDC"',
  'opaque="bmRnb3BhcXVl"',
  'algorithm=MD5',
  'qop="auth"',
].join(', ');

const AUTH_KEY_VALUE_RE = /(\w+)=["']?([^'"]+)["']?/;
let NC = 0;
const NC_PAD = '00000000';

export default function digestAuthHeader(method, uri, userpass) {
  const parts = wwwAuthenticate.split(',');
  const opts = {};
  for (let i = 0; i < parts.length; i++) {
    const m = parts[i].match(AUTH_KEY_VALUE_RE);
    if (m) {
      opts[m[1]] = m[2].replace(/["']/g, '');
    }
  }

  if (!opts.realm || !opts.nonce) {
    return '';
  }

  let qop = opts.qop || '';

  const userpassA = userpass.split(':');

  let nc = String(++NC);
  nc = NC_PAD.substring(nc.length) + nc;
  const randomBytes = [];
  for (let s = 0; s < 16; s++) {
    randomBytes.push((~~(Math.random() * 16)).toString(16));
  }
  const cnonce = randomBytes.join('');
  const ha1 = md5(`${userpassA[0]}:${opts.realm}:${userpassA[1]}`);
  const ha2 = md5(`${method.toUpperCase()}:${uri}`);
  let s = `${ha1}:${opts.nonce}`;
  if (qop) {
    qop = qop.split(',')[0];
    s += `:${nc}:${cnonce}:${qop}`;
  }
  s += `:${ha2}`;
  const response = md5(s);
  let authstring = [
    `Digest username="${userpassA[0]}", realm="${opts.realm}", `,
    `nonce="${opts.nonce}", uri="${uri}", response="${response}"`,
  ].join('');

  if (opts.opaque) {
    authstring += `, opaque="${opts.opaque}"`;
  }
  if (qop) {
    authstring += `, qop=${qop}, nc=${nc}, cnonce="${cnonce}"`;
  }
  return authstring;
}
