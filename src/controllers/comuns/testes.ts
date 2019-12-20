import Controller from "@controllers/controller";
import { Get, Route } from "@core/routing/controller";
import { Request, Response } from "express";
import { QueryTypes } from "sequelize";

@Route("/api/testes")
class TestesController extends Controller {

  @Get("/esperar")
  async esperar (req: Request, res: Response): Promise<Response> {
    try {
      const igerp = await this.db().query(`

      DECLARE @TEMPO AS VARCHAR(8) = :tempo
      SELECT 'ESPEROU: ' + @TEMPO AS RESULT, @@SPID AS SPID WAITFOR DELAY @TEMPO

      `, {
        replacements: {
          tempo: req.query.tempo
        },
        type: QueryTypes.SELECT
      });

      return res.json(igerp);
    } catch (e) {
      return res.json({ erro: e.message });
    }
  }

  @Get("/spid")
  async spid (_req: Request, res: Response): Promise<Response> {
    try {
      const igerp = await this.db().query(`

      SELECT @@SPID AS SPID

      `, {
        type: QueryTypes.SELECT
      });

      return res.json(igerp);
    } catch (e) {
      return res.json({ erro: e.message });
    }
  }

}

export default TestesController;
