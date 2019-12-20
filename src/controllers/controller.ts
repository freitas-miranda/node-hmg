import { Auth } from "@core/access_control";
import BaseController from "@core/routing/controller";
import HelperAutorizacao from "@helpers/autorizacao";
import Usuario from "@models/usuario";
import UsuarioEmpresa from "@models/usuario_empresa";

/**
 * @export
 *
 * @class Controller
 *
 * @author Ícaro Pereira Tavares de Lima
 *
 * @classdesc Classe com métodos auxiliares para ser utilizada para extender os controllers
 *
 * @extends {BaseController}
 */
export class Controller extends BaseController {
  protected readonly autorizacao: HelperAutorizacao;

  constructor () {
    super();

    this.autorizacao = new HelperAutorizacao();
  }

  /**
   * @author Ícaro Pereira Tavares de Lima
   *
   * @description Verifica se o usuário possuí o acesso para utilizar a empresa informada na aplicação.
   *
   * @private
   *
   * @param {number} usuario Código do usuário
   * @param {number} empresa Código da empresa a ser verificado o acesso
   *
   * @returns {Promise<boolean>}
   *
   * @memberof HelperAuntenticacao
   */
  private async possuiAcessoEmpresa (usuario: string, empresa: string): Promise<boolean> {
    const usuarioEmpresa = await UsuarioEmpresa.findOne({
      where: {
        usuario: usuario,
        empresa: empresa
      }
    });

    return !!usuarioEmpresa;
  }

  /**
   * @protected
   *
   * @author Ícaro Pereira Tavares de Lima
   *
   * @description Método utilizado para verificar se o usuário e senha pode ser autenticado.
   * Caso seja informado a empresa, o usuário deve ter o acesso também.
   *
   * @param {string} login Login do usuário
   * @param {string} senha Senha do usuário
   * @param {number} [empresaId] ID da empresa para verificar o acesso
   *
   * @returns {Promise<Usuario>} Model do usuário
   *
   * @memberof Controller
   */
  protected async auth (login: string, senha: string, empresa?: string, registrar: boolean = false): Promise<Usuario> {
    const usuario = await Usuario.findOne({ where: { login } });

    if (!usuario || senha !== usuario.senha || !usuario.ativo) {
      throw new Error("Usuário ou senha incorretos!");
    }

    const usuarioEmpresa = await this.possuiAcessoEmpresa(usuario.codigo, empresa);

    if (!usuarioEmpresa) throw new Error("Usuário sem acesso a empresa!");

    if (registrar) {
      (<any>usuario).empresa = empresa;

      await Auth.login(usuario);
    }

    return usuario;
  }
}

export default Controller;
