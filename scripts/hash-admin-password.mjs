/**
 * Хэш пароля админ-панели в формате scrypt — значение для ADMIN_PASSWORD_HASH.
 *
 *   node scripts/hash-admin-password.mjs
 *
 * Пароль вводится скрыто и никуда не записывается; на экран выводится только
 * хэш. Параметры scrypt должны совпадать с SCRYPT_PARAMS в server/app.mjs.
 */
import crypto from 'node:crypto'
import readline from 'node:readline'

const SCRYPT_PARAMS = { N: 16384, r: 8, p: 1, maxmem: 64 * 1024 * 1024 }

function ask(prompt) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true })
    rl._writeToOutput = (s) => { if (s.startsWith(prompt)) process.stdout.write(s) }
    rl.question(prompt, (answer) => { rl.close(); process.stdout.write('\n'); resolve(answer) })
  })
}

const password = await ask('Новый пароль (не отображается): ')
if (password.length < 12) {
  console.error('Слишком короткий: нужно минимум 12 символов.')
  process.exit(1)
}
const salt = crypto.randomBytes(16)
const hash = crypto.scryptSync(password, salt, 32, SCRYPT_PARAMS)
console.log(`\nADMIN_PASSWORD_HASH=scrypt:${salt.toString('hex')}:${hash.toString('hex')}`)
