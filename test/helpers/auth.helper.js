import request from 'supertest';
import app from '../../src/app.js';

export async function loginAsAdmin() {
  const resposta = await request(app)
    .post('/api/auth/login')
    .send({ email: process.env.ADMIN_EMAIL, senha: process.env.ADMIN_SENHA });
  return resposta.body.token;
}

export async function loginAsAluno(email, senha) {
  const resposta = await request(app).post('/api/auth/login').send({ email, senha });
  return resposta.body.token;
}
