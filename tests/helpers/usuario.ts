import HelperAutorizacao from "@helpers/autorizacao";
import Usuario from "@models/usuario";
import UsuarioToken from "@models/usuario_token";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import moment from "moment";
import sinon from "sinon";

class HelperUsuario {
  private stubAutorizacao: sinon.SinonStub;
  private stubAutorizarRotina: sinon.SinonStub;
  private stubUsuarioToken: sinon.SinonStub;
  private usuario: Usuario;

  constructor () {
    this.usuario = Usuario.build({
      login: "99999-JENKINS",
      codigo: "99999",
      nome: "JENKINS",
      senha: crypto.createHash("sha256").update("JENKINS", "utf8").digest("hex"),
      expiracaoSenha: moment().add(1, "months"),
      ativo: 1
    });
  }

  async autenticar (empresa = 1) {
    const usuario = await Usuario.findOne ({
      where: { login: "99999-JENKINS" }
    });

    const token = jwt.sign({
      usuarioId: usuario.id,
      empresaId: empresa,
      expiresIn: "1m"
    }, process.env.APP_KEY);

    this.stubUsuarioToken = sinon.stub(UsuarioToken, "findOne");
    this.stubUsuarioToken.withArgs({where: {token: token}}).resolves({
      usuarioId: usuario.id,
      empresaId: empresa,
      token: token,
      ativo: 1
    });

    return token;
  }

  autorizarRotina (rotina: string): void {
    this.stubAutorizarRotina = sinon.stub(HelperAutorizacao.prototype, "usuarioAutorizado");
    this.stubAutorizarRotina.withArgs(this.usuario.codigo, rotina).resolves(true);
  }

  removerAutorizacaoRotina (): void {
    this.stubAutorizarRotina.restore();
  }

  autorizarUrls (): void {
    this.stubAutorizacao = sinon.stub(HelperAutorizacao.prototype, "possuiAcessoUrl");
    this.stubAutorizacao.resolves(true);
  }

  removerAutenticao (): void {
    if (this.stubUsuarioToken) {
      this.stubUsuarioToken.restore();
    }
  }

  removerAutorizacaoUrls (): void {
    if (this.stubAutorizacao) {
      this.stubAutorizacao.restore();
    }
  }

  async reiniciarUsuarioTeste (): Promise<void> {
    const usuario = await Usuario.findOne({where: {login: this.usuario.login}});

    if (!usuario) throw Error("Não foi possível reiniciar o usuário!" + this.usuario.login);

    await usuario.update(this.usuario.toJSON());
  }

  async inserirUsuarioTeste (): Promise<Usuario> {
    const usuario = await Usuario.findOrCreate ({
      where: { login: "99999-JENKINS" },
      defaults: this.usuario.toJSON()
    });

    return usuario[0];
  }
}

export default HelperUsuario;
