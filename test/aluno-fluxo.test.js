import request from 'supertest';
import { expect } from 'chai';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import app from '../src/app.js';
import { loginAsAdmin, loginAsAluno } from './helpers/auth.helper.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dados = JSON.parse(fs.readFileSync(path.join(__dirname, 'data/fluxoAluno.data.json'), 'utf8'));

describe('Fluxo: cadastro de aluno e entrega de trabalho', () => {
  let adminToken;
  let alunoToken;
  let alunoId;
  let disciplinaId;

  it('deve autenticar o administrador e retornar um token', async () => {
    adminToken = await loginAsAdmin();
    expect(adminToken).to.be.a('string');
  });

  it('deve cadastrar um novo aluno', async () => {
    const resposta = await request(app)
      .post('/api/admin/alunos')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(dados.novoAluno);

    expect(resposta.status).to.equal(201);
    alunoId = resposta.body.id;
  });

  it('deve cadastrar uma nova disciplina', async () => {
    const resposta = await request(app)
      .post('/api/admin/disciplinas')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(dados.disciplina);

    expect(resposta.status).to.equal(201);
    disciplinaId = resposta.body.id;
  });

  it('deve matricular o aluno na disciplina cadastrada', async () => {
    const resposta = await request(app)
      .post(`/api/admin/disciplinas/${disciplinaId}/matriculas`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ alunoId });

    expect(resposta.status).to.equal(201);
  });

  it('deve autenticar o aluno cadastrado e retornar um token', async () => {
    alunoToken = await loginAsAluno(dados.novoAluno.email, dados.novoAluno.senha);
    expect(alunoToken).to.be.a('string');
  });

  it('deve registrar a entrega de um trabalho do aluno', async () => {
    const resposta = await request(app)
      .post(`/api/alunos/${alunoId}/trabalhos`)
      .set('Authorization', `Bearer ${alunoToken}`)
      .send({ disciplinaId, ...dados.trabalho });

    expect(resposta.status).to.equal(201);
    expect(resposta.body.titulo).to.equal(dados.trabalho.titulo);
    expect(resposta.body.status).to.equal('entregue');
  });
});
