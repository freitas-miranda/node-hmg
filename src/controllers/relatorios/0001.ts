import Controller from "@controllers/controller";
import { Authentication, Get, Route } from "@core/routing/controller";
import { Request, Response } from "express";
import { QueryTypes } from "sequelize";

/**
 * @class RelatorioController
 * @author Alan Miranda; 2019-12-18
 * @classdesc Relatório para exibir o estoque negativo das lojas.
 * @extends {Controller}
 */
@Authentication()
@Route("/api/relatorio/0001")
class RelatorioController extends Controller {

  /**
   * @author Alan Miranda; 2019-12-18
   * @description Retorna o token de autorização para acesso no sistema.
   */
  @Get("/")
  async listar (req: Request, res: Response): Promise<Response> {
    try {
      const igerp = await this.db().query(`

        SELECT C00M_CODPRD AS CODPRD
             , CODBAR.C00X_CODEAN AS CODEAN
             , (C00M_DESCPRO + ' ' + CAST(CAST(C00M_QTDEMBL AS FLOAT) AS VARCHAR) +'x '+  dbo.TRIM(C00M_QTFUND) +' '+ C00M_UNDUNIT) AS DESCPRO
             , ROUND(CAST(ISNULL(ESTOQA, 0) AS FLOAT), 3) AS EST_MERC
             , ROUND(CAST(ISNULL(ESTOQD, 0) AS FLOAT), 3) AS EST_DEP
             , ROUND(CAST((ISNULL(ESTOQD, 0) + ISNULL(ESTOQA,0)) AS FLOAT), 3) AS EST_TOTAL
             , CAST(DATCHEG AS DATE) AS DATCHEG
             , ROUND(CAST(ISNULL(ULTENT, 0) AS FLOAT), 3) AS ULTENT
          FROM T00M

         INNER JOIN CLIPPER.dbo.ESTOQUE
            ON CODPRD = C00M_CODPRD
           AND CODEMP = :empresa

         /* Buscar o código de barras */
         OUTER APPLY
             ( SELECT TOP 1 C00X_CODEAN
                 FROM T00X
                WHERE T00X.IG_DELET = ''
                  AND C00X_CODPRD = C00M_CODPRD
                  AND ISNULL(C00X_QTDEMBL,0) IN (0,1)
             ) AS CODBAR

         WHERE T00M.IG_DELET = ''
           AND C00M_FLAGUSO = ''
           AND C00M_CODSET = :setor
           AND (ESTOQA < 0 OR ESTOQD < 0)

         ORDER BY C00M_DESCPRO

      `, {
        replacements: {
          empresa: req.query.empresa,
          setor: req.query.codset
        },
        type: QueryTypes.SELECT
      });

      return res.json(igerp);
    } catch (e) {
      return res.json({ erro: e.message });
    }
  }
}

export default RelatorioController;
