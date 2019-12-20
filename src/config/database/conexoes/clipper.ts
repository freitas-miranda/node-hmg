import config from "@config/database/config";
import { Auth } from "@core/access_control";
import IDbConnection from "@core/database/idb_connection";
import sequelizeSoftDelete from "@plugins/sequelize/soft_delete";
import sequelizeTimestamp from "@plugins/sequelize/timestamp";
import Bluebird from "bluebird";
import sequelize from  "sequelize";
import { Sequelize, SequelizeOptions } from "sequelize-typescript";

/**
 * @class ConClipper
 *
 * @author Ícaro Pereira Tavares de Lima
 *
 * @classdesc Classe de configuração da base de dados CLIPPER local
 */
class ConClipper implements IDbConnection {
  alias: string;
  connection: Sequelize;
  options: SequelizeOptions;

  constructor () {
    this.options = config.clipper;
  }

  /**
   * @private
   *
   * @author Ícaro Pereira Tavares de Lima
   *
   * @description Método utilizado como parâmetro para os plugins obterem o usuário
   * atual do sistema, como os plugins responsáveis por inserir os usuários de inserção,
   * alteração e exclusão dos registros
   *
   * @returns {(string | undefined)}
   *
   * @memberof ConClipper
   */
  private usuario (): string | undefined {
    if (Auth.authenticated())
      return Auth.user.login;
    else {
      if (process.env.NODE_ENV !== "test") console.error("Falha ao obter usuário de auditoria!");
    }
  }

  /**
   * @author Ícaro Pereira Tavares de Lima
   *
   * @description Método utilizado pelo autoload do servidor para configurar as bases de dados.
   * Por este método, o servidor irá iniciar a conexão com o banco de dados.
   *
   * @returns {void}
   *
   * @memberof ConClipper
   */
  async config (): Promise<void> {
    this.alias = "clipper";
    this.connection = new Sequelize(this.options);

    // Remove o usuário do banco da mensagem de erro quando não for possível conectar na base de dados
    this.connection.query = <any>function () {
      return new Bluebird(async (resolve: any, reject: any) => {
        try {
          const result = await (<any>sequelize).Sequelize.prototype.query.apply(this, arguments);

          resolve(result);
        } catch (err) {
          if (err instanceof sequelize.AccessDeniedError) {
            console.error(err);
            reject(new Error("Falha ao conectar na base de dados"));
          } else {
            reject(err);
          }
        }
      });
    };

    sequelizeSoftDelete(this.connection, {
      deleted: { field: "IG_DELET", defaultValue: "", deletedValue: "*"},
      deletedAt: "IG_UPDEXC",
      deletedBy: { field: "IG_USREXC", defaultValue: this.usuario }
    });

    sequelizeTimestamp(this.connection, {
      createdAt: "IG_UPDINC",
      updatedAt: "IG_UPDALT",
      createdBy: { field: "IG_USRINC", defaultValue: this.usuario },
      updatedBy: { field: "IG_USRALT", defaultValue: this.usuario }
    });
  }
}

export default ConClipper;
