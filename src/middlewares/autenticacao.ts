import { TokenManager } from "@core/access_control";
import { NextFunction, Request, Response } from "express";
import passport from "passport";
import { Strategy } from "passport-http-bearer";

passport.use(new Strategy(
  async (token: string, cb: Function) => {
    try {
      const decode: any = TokenManager.decode(token);

      return cb(undefined, {
        codigo: decode.usuario,
        empresa: decode.empresa,
        grupo: decode.grupo,
        token: token
      });
    } catch (e) {
      return cb(e);
    }
  }
));

passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (user, done) {
  done(null, user);
});

function middleware (req: Request, res: Response, next: NextFunction): void {
  passport.authenticate("bearer", (err: Error, usuario: any) => {
    if (err) res.status(401).json({erro: err.message});
    else if (!usuario) res.status(401).json({erro: "Usuário não autenticado!"});
    else {
      req.login(usuario, () => {
        next();
      });
    }
  })(req, res, next);
}

export default middleware;
