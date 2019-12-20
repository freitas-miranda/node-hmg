import ControllerAutenticacao from "@controllers/controle_acesso/autenticacao";
import Controller from "@controllers/controller";
import Usuario from "@models/usuario";
import HelperUsuario from "@tests/helpers/usuario";
import axios from "axios";
import { expect } from "chai";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import moment from "moment";
import { spy, stub } from "sinon";

describe("Teste no controle 'controle_acesso/autenticacao'", function () {
  before(async function () {
    this.autenticacao = new ControllerAutenticacao();
    this.helperUsuario = new HelperUsuario();
    this.usuario = await this.helperUsuario.inserirUsuarioTeste();

    this.axios = axios.create({
      baseURL: `${process.env.APP_HOST}:${process.env.APP_PORT}/api/controle-acesso/autenticacao`
    });
  });

  describe("Método 'alterarSenha'", function () {
    it("Campos não informados", async function () {
      const resposta = await this.axios.post("/alterar-senha", {});

      expect(resposta.status).to.equal(200);
      expect(resposta.data).to.be.an("object");
      expect(resposta.data.erro).to.be.an("object");
      expect(resposta.data.erro).to.have.all.keys("login", "senha", "senhaNova", "empresa", "confirmacao");

      Object.keys(resposta.data.erro).map((chave) => {
        expect(resposta.data.erro[chave]).to.be.an("array");
      });
    });

    it("Campo confirmação diferente da nova senha", async function () {
      const resposta = await this.axios.post("/alterar-senha", {
        login: this.usuario.login,
        senha: crypto.createHash("sha256").update("JENKINS", "utf8").digest("hex"),
        senhaNova: crypto.createHash("sha256").update("JENKINS", "utf8").digest("hex"),
        confirmacao: crypto.createHash("sha256").update("JENKINS2", "utf8").digest("hex"),
        empresa: 1
      });

      expect(resposta.status).to.equal(200);
      expect(resposta.data).to.be.an("object");
      expect(resposta.data.erro).to.be.an("object");
      expect(resposta.data.erro).to.have.property("confirmacao");
      expect(resposta.data.erro.confirmacao).to.be.an("array");
      expect(resposta.data.erro.confirmacao[0]).to.equal("Confirmacao diferente da senha nova!");
    });

    it("Usuário ou senha incorretos", async function () {
      const resposta = await this.axios.post("/alterar-senha", {
        login: this.usuario.login,
        senha: crypto.createHash("sha256").update("JENKINS_TESTE", "utf8").digest("hex"),
        senhaNova: crypto.createHash("sha256").update("JENKINS_TESTE", "utf8").digest("hex"),
        confirmacao: crypto.createHash("sha256").update("JENKINS_TESTE", "utf8").digest("hex"),
        empresa: 1
      });

      expect(resposta.status).to.equal(200);
      expect(resposta.data).to.be.an("object");
      expect(resposta.data.erro).to.be.a("string");
      expect(resposta.data.erro).to.equal("Usuário ou senha incorretos!");
    });

    it("Usuário sem acesso a empresa", async function () {
      const resposta = await this.axios.post("/alterar-senha", {
        login: this.usuario.login,
        senha: crypto.createHash("sha256").update("JENKINS", "utf8").digest("hex"),
        senhaNova: crypto.createHash("sha256").update("JENKINS_TESTE", "utf8").digest("hex"),
        confirmacao: crypto.createHash("sha256").update("JENKINS_TESTE", "utf8").digest("hex"),
        empresa: 0
      });

      expect(resposta.status).to.equal(200);
      expect(resposta.data).to.be.an("object");
      expect(resposta.data.erro).to.be.a("string");
      expect(resposta.data.erro).to.equal("Usuário sem acesso a empresa!");
    });

    it("Senha alterada com sucesso", async function () {
      try {
        this.stubAutenticacao = stub(Controller.prototype, <never>"possuiAcessoEmpresa");
        this.stubAutenticacao.withArgs(this.usuario.id, 1).returns(true);

        const resposta = await this.axios.post("/alterar-senha", {
          login: this.usuario.login,
          senha: crypto.createHash("sha256").update("JENKINS", "utf8").digest("hex"),
          senhaNova: crypto.createHash("sha256").update("JENKINS_TESTE", "utf8").digest("hex"),
          confirmacao: crypto.createHash("sha256").update("JENKINS_TESTE", "utf8").digest("hex"),
          empresa: 1
        });

        expect(resposta.status).to.equal(200);
        expect(resposta.data).to.be.an("object");
        expect(resposta.data.mensagem).to.equal("Senha alterada com sucesso!");
      } finally {
        await this.stubAutenticacao.restore();
        await this.helperUsuario.reiniciarUsuarioTeste();
      }
    });
  });

  describe('Método "login"', function () {
    before(function () {
      this.stubAutenticacao = stub(Controller.prototype, <never>"possuiAcessoEmpresa");
    });

    after(function () {
      this.stubAutenticacao.restore();
    });

    afterEach(function () {
      this.stubAutenticacao.reset();
    });

    it("Campos não informados", async function () {
      const resposta = await this.axios.post("/login", {});

      expect(resposta.status).to.equal(200);
      expect(resposta.data).to.be.an("object");
      expect(resposta.data.erro).to.be.an("object");
      expect(resposta.data.erro).to.have.all.keys("login", "senha", "empresa");

      Object.keys(resposta.data.erro).map((chave) => {
        expect(resposta.data.erro[chave]).to.be.an("array");
      });
    });

    it("Usuário ou senha incorretos", async function () {
      const resposta = await this.axios.post("/login", {
        empresa: 1,
        login: this.usuario.login,
        senha: crypto.createHash("sha256").update("JENKINS_TESTE", "utf8").digest("hex")
      });

      expect(resposta.status).to.equal(200);
      expect(resposta.data).to.be.an("object");
      expect(resposta.data.erro).to.equal("Usuário ou senha incorretos!");
    });

    it("Usuário sem acesso a empresa", async function () {
      const resposta = await this.axios.post("/login", {
        empresa: 0,
        login: this.usuario.login,
        senha: crypto.createHash("sha256").update("JENKINS", "utf8").digest("hex"),
      });

      expect(resposta.status).to.equal(200);
      expect(resposta.data).to.be.an("object");
      expect(resposta.data.erro).to.be.a("string");
      expect(resposta.data.erro).to.equal("Usuário sem acesso a empresa!");
    });

    it("A senha do usuário está vencida", async function () {
      const usuario = await Usuario.findByPk(this.usuario.id);

      usuario.senha = crypto.createHash("sha256").update("123", "utf8").digest("hex");
      await usuario.save();

      this.stubAutenticacao.withArgs(usuario.id, 1).returns(true);

      try {
        const resposta = await this.axios.post("/login", {
          empresa: 1,
          login: this.usuario.login,
          senha: crypto.createHash("sha256").update("123", "utf8").digest("hex"),
        });

        expect(resposta.status).to.equal(200);
        expect(resposta.data).to.be.an("object");
        expect(resposta.data.erro).to.be.a("string");
        expect(resposta.data.erro).to.equal("A senha do usuário está vencida!");
        expect(resposta.data.senhaVencida).to.be.a("boolean");
        expect(resposta.data.senhaVencida).to.equal(true);
      } finally {
        await this.helperUsuario.reiniciarUsuarioTeste();
      }
    });

    it("Usuário autenticado com sucesso", async function () {
      const usuario = await Usuario.findByPk(this.usuario.id);

      usuario.senha = crypto.createHash("sha256").update("JENKINS", "utf8").digest("hex");
      await usuario.save();

      this.stubAutenticacao.withArgs(usuario.id, 1).returns(true);

      const resposta = await this.axios.post("/login", {
        empresa: 1,
        login: this.usuario.login,
        senha: crypto.createHash("sha256").update("JENKINS", "utf8").digest("hex"),
      });

      expect(resposta.status).to.equal(200);
      expect(resposta.data).to.be.an("object");
      expect(resposta.data.token).to.be.a("string");
      expect(resposta.data.nome).to.be.a("string");
    });
  });

  describe('Método "logout"', function () {
    it("Token não informado", async function () {
      let resposta;

      try {
        resposta = await this.axios.post("/logout");
      } catch (e) {
        resposta = e.response;
      }

      expect(resposta.status).to.equal(401);
      expect(resposta.data).to.be.an("object");
      expect(resposta.data.erro).to.equal("Usuário não autenticado!");
    });

    it("Token inválido", async function () {
      let resposta;

      try {
        resposta = await this.axios({
          method: "post",
          url: "/logout",
          headers: {
            "Authorization": "Bearer " + jwt.sign({
              usuario: this.usuario.codigo,
              empresa: 1,
              exp: moment().add("2", "months").unix()
            }, "chave_secreta")
          }
        });
      } catch (e) {
        resposta = e.response;
      }

      expect(resposta.status).to.equal(401);
      expect(resposta.data).to.be.an("object");
      expect(resposta.data.erro).to.equal("Token inválido ou expirado!");
    });

    it("Teste ao efetuar logout. Usuario desconectado com sucesso", async function () {
      const spyAutenticacao = spy(this.autenticacao, "logout");
      const token = await this.helperUsuario.autenticar();

      try {
        let resposta;

        try {
          resposta = await this.axios({
            method: "post",
            url: "/logout",
            headers: {
              "Authorization": "Bearer " + token
            }
          });
        } catch (e) {
          resposta = e.response;
        }

        expect(spyAutenticacao.calledOnce);

        expect(resposta.status).to.equal(200);
        expect(resposta.data).to.be.an("object");
        expect(resposta.data.mensagem).to.equal("Usuário desconectado!");
      } finally {
        spyAutenticacao.restore();
        this.helperUsuario.removerAutenticao();
      }
    });
  });
});
