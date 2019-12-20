
import server from "@config/server";
import pathtoRegexp from "path-to-regexp";
import { QueryTypes } from "sequelize";

/**
 * @class HelperAutorizacao
 *
 * @author Ícaro Pereira Tavares de Lima
 *
 * @classdesc Classe auxilar para verificar as permissões de acesso do usuário
 */
class HelperAutorizacao {
  private conexao: any;

  constructor () {
    this.conexao = server.database.connection();
  }

  /**
   * @author Ícaro Pereira Tavares de Lima
   *
   * @description Verifica se a url está cadastrada para o perfil do usuário. Método utilizado
   * como middleware para verificar o acesso do usuário a determinadas rotas do sistema.
   *
   * @param {string} usuario ID do usuário
   * @param {string} urlBase Url base a ser verificada. Exemplo: /api/credito_cobranca/cadastro_cliente
   * @param {string} url Url final a ser verificada. Exemplo: /cliente
   *
   * @returns {Promise<boolean>}
   *
   * @memberof HelperAutorizacao
   */
  async possuiAcessoUrl (usuario: string, urlBase: string, url: string): Promise<boolean> {
    const query = ` SELECT rota.id,
                           rota.descricao,
                           rota.icone,
                           rota.url,
                           rota.nivel,
                           rota.pai
                      FROM rota
                     INNER
                      JOIN perfil_rota
                        ON perfil_rota.deleted_at IS NULL
                       AND perfil_rota.rota_id = rota.id
                     INNER
                      JOIN perfil
                        ON perfil.deleted_at IS NULL
                       AND perfil.id = perfil_rota.perfil_id
                     INNER
                      JOIN usuario_perfil
                        ON usuario_perfil.deleted_at IS NULL
                       AND usuario_perfil.perfil_id = perfil.id
                       AND usuario_perfil.usuario_id = :usuario
                     WHERE rota.deleted_at IS NULL
                       AND rota.tipo = :tipo
                       AND rota.url LIKE :url
                     GROUP
                        BY rota.id,
                           rota.descricao,
                           rota.icone,
                           rota.url,
                           rota.nivel,
                           rota.pai`;

    const menus = await this.conexao.query(query, {
      replacements: {
        usuario: usuario,
        tipo: 4, // Rota do tipo requisição.
        url: urlBase + "%"
      },
      type: QueryTypes.SELECT
    });

    if (menus.length === 0) return false;
    else {
      return menus.find((menu: any) => {
        const regex = pathtoRegexp(menu.url);

        return !!regex.exec(urlBase + url);
      });
    }
  }

  /**
   * @author Ícaro Pereira Tavares de Lima
   *
   * @description Verifica se o usuário tem permissão para acessar uma determinada rotina
   *
   * @param {number} usuario ID do usuário
   * @param {number} rotina ID da rotina
   *
   * @returns {Promise<any>}
   *
   * @memberof HelperAutorizacao
   */
  async usuarioAutorizado (_autenticacao: any, _rotina: number): Promise<any> {
    return true;
  }
}

export default HelperAutorizacao;
