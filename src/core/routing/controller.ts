import server from "@config/server";
import Authentication from "@core/decorators/authentication";
import Authorization from "@core/decorators/authorization";
import Middleware from "@core/decorators/middleware";
import { All, Delete, Get, Head, Options, Patch, Post, Put } from "@core/decorators/request";
import Route from "@core/decorators/route";
import Swagger from "@core/swagger/swagger_decorator";

export {
  All,
  Authentication,
  Authorization,
  Delete,
  Get,
  Head,
  Middleware,
  Options,
  Patch,
  Post,
  Put,
  Route,
  Swagger
};

/**
 * @export
 * @abstract
 *
 * @class Controller
 *
 * @author Ícaro Pereira Tavares de Lima
 *
 * @classdesc Classe base para implementação dos controllers
 */
export abstract class Controller {

  /**
   * @protected
   *
   * @author Ícaro Pereira Tavares de Lima
   *
   * @param {string} [alias] Apelido dado na configuração da conexão
   *
   * @returns {*} Retorna a conexão com o banco de dados requisitada com base no nome
   * informado
   *
   * @memberof Controller
   */
  protected db (alias?: string): any {
    return server.database.connection(alias);
  }

  protected abstract auth (login: string, password: string): Promise<any>;
}

export default Controller;
