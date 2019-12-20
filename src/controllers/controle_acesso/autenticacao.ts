import Controller from "@controllers/controller";
import { Auth, TokenManager } from "@core/access_control";
import { Authentication, Post, Route, Swagger } from "@core/routing/controller";
import UsuarioToken from "@models/usuario_token";
import crypto from "crypto";
import { Request, Response } from "express";
import moment from "moment";
import validate from "validate.js";

/**
 * @class AutenticacaoController
 *
 * @author Ícaro Pereira Tavares de Lima
 *
 * @classdesc Classe controle destinada a autenticação do usuário no sistema.
 *
 * @extends {Controller}
 *
 * @swagger
 *
 * components:
 *  securitySchemes:
 *    bearerAuth:
 *      type: http
 *      scheme: bearer
 *      bearerFormat: JWT
 */
@Route("/api/controle-acesso/autenticacao")
@Swagger()
class AutenticacaoController extends Controller {
  private validacaoLogin: object;

  constructor () {
    super();

    this.validacaoLogin = {
      login: { presence: {allowEmpty: false, message: "não informado!"} },
      senha: { presence: {allowEmpty: false, message: "não informada!"} },
      grupo: { presence: {allowEmpty: false, message: "não informado!"} },
      empresa: { presence: {allowEmpty: false, message: "não informada!"} }
    };
  }

  /**
   * @author Ícaro Pereira Tavares de Lima
   *
   * @description Formata o endereço de ip do usuário que irá efetuar autenticação na aplicação.
   *
   * @private
   *
   * @param {string} ip
   *
   * @returns {string}
   *
   * @memberof AutenticacaoController
   */
  private formatarIp (ip: string): string {
    return ip.replace("::ffff:", "");
  }

  /**
   * @author Ícaro Pereira Tavares de Lima
   *
   * @description Gera o token de autorização para acesso as rotas privadas.
   *
   * @private
   *
   * @param {number} usuario Código do usuário
   * @param {number} grupo Grupo da empresa
   * @param {number} empresa Código da empresa
   * @param {string} ip Endereço de ip do usuário
   * @param {string} agente Local de onde esta sendo a navegação
   * @param {boolean} registrar Registrar token na base de dados
   *
   * @returns {Promise<string>}
   *
   * @memberof AutenticacaoController
   */
  private async gerarToken (usuario: string, grupo: string, empresa: string, ip: string, agente: string, registrar: boolean): Promise<string> {
    const encoded = TokenManager.encode(usuario, {grupo, empresa});

    if (!!registrar) {
      const usuarioToken = new UsuarioToken();

      usuarioToken.grupo = grupo;
      usuarioToken.empresa = empresa;
      usuarioToken.usuario = usuario;
      usuarioToken.token = encoded.token;
      usuarioToken.dataCadastro = moment.unix(encoded.options.iat);
      usuarioToken.dataVencimento = moment.unix(encoded.options.exp);
      usuarioToken.ip = ip;
      usuarioToken.agente = agente;

      await usuarioToken.save();
    }

    return encoded.token;
  }

  /**
   * @author Ícaro Pereira Tavares de Lima
   *
   * @description Retorna o token de autorização para acesso no sistema.
   *
   * @param {Request} req
   * @param {Response} res
   *
   * @returns {Promise<Response>}
   *
   * @memberof AutenticacaoController
   *
   * @swagger
   *
   * /login:
   *   post:
   *     tags:
   *       - autenticacao
   *     summary: Retorna o token de autorização para acesso no sistema.
   *     requestBody:
   *       description: Dados para efetuar login
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               login:
   *                 type: string
   *                 description: Código do usuário e primeiro nome. A separação do código e nome é feita por um traço "-".
   *               senha:
   *                 type: string
   *                 description: Chave de acesso.
   *               empresa:
   *                 type: string
   *                 description: Filial de autorização.
   *             required:
   *               - login
   *               - senha
   *               - empresa
   *           example:
   *             login: "41526-ICARO"
   *             senha: "***"
   *             empresa: 1
   *     responses:
   *       200-1:
   *         description: Campos não informados
   *         content:
   *           application/json:
   *             example:
   *               erro:
   *                 login:
   *                   - Login não informado!
   *                 senha:
   *                   - Senha não informada!
   *                 empresa:
   *                   - Empresa não informada!
   *       200-2:
   *         description: Usuário ou senha incorretos
   *         content:
   *           application/json:
   *             example:
   *               erro: Usuário ou senha incorretos!
   *       200-3:
   *         description: Usuário sem acesso a empresa
   *         content:
   *           application/json:
   *             example:
   *               erro: Usuário sem acesso a empresa!
   *       200-4:
   *           description: Senha vencida
   *           content:
   *             application/json:
   *               example:
   *                 erro: A senha do usuário está vencida!
   *       200-5:
   *           description: Usuário autenticado
   *           content:
   *             application/json:
   *               example:
   *                 token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9
   *                 nome: ICARO
   *     security:
   *       - bearerAuth: []
   */
  @Post("/login")
  async login (req: Request, res: Response): Promise<Response> {
    const erros = validate(req.body, this.validacaoLogin);

    if (erros) return res.json({ erro: erros });

    try {
      const usuario = await this.auth(
        req.body.login,
        req.body.senha,
        req.body.empresa,
        true);

      if (crypto.createHash("sha256").update("123", "utf8").digest("hex") === usuario.senha) {
        return res.json({ erro: "A senha do usuário está vencida!", senhaVencida: true });
      }

      const token = await this.gerarToken(
        usuario.codigo,
        req.body.grupo,
        req.body.empresa,
        this.formatarIp(req.ip),
        <string>req.headers["user-agent"],
        false);

      return res.json({ token, nome: usuario.nome });
    } catch (e) {
      return res.json({ erro: e.message });
    }
  }

  /**
   * @author Ícaro Pereira Tavares de Lima
   *
   * @description Inativa o token de autorização para acesso no sistema.
   *
   * @param {Request} req
   * @param {Response} res
   *
   * @returns {Promise<Response>}
   *
   * @memberof AutenticacaoController
   *
   * @swagger
   *
   * /logout:
   *   post:
   *     tags:
   *       - autenticacao
   *     summary: Torna inválido o token de autorização.
   *     requestBody:
   *       description: Dados para efetuar logout
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               token:
   *                 type: string
   *                 description: Token de autorização sha256.
   *             required:
   *               - token
   *           example:
   *             token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9"
   *     responses:
   *       200-1:
   *         description: Usuário desconectado
   *         content:
   *           application/json:
   *             example:
   *               mensagem: Usuário desconectado!
   *     security:
   *       - bearerAuth: []
   */
  @Authentication()
  @Post("/logout")
  async logout (req: Request, res: Response): Promise<Response> {
    if (Auth.authenticated()) {
      const usuarioToken = await UsuarioToken.findOne({ where: { token: req.user.token } });

      if (!usuarioToken) console.error(`Token ${req.user.token} não encontrado ao efetuar logout do usuário ${req.user.login}`);

      if (usuarioToken.ativo && moment() < usuarioToken.dataVencimento) {
        usuarioToken.ativo = false;

        await usuarioToken.save();
      }
    }

    return res.json({ mensagem: "Usuário desconectado!" });
  }
}

export default AutenticacaoController;
