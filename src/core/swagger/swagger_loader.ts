import { SWAGGER_DECORATOR } from "@core/decorators/constants";
import server from "@core/server";
import { ISwaggerDefinitions } from "@core/swagger/swagger_interfaces";
import doctrine from "doctrine";
import { Request, Response } from "express";
import createSpecification from "swagger-jsdoc/lib/helpers/createSpecification";
import filterJsDocComments from "swagger-jsdoc/lib/helpers/filterJsDocComments";
import hasEmptyProperty from "swagger-jsdoc/lib/helpers/hasEmptyProperty";
import specHelper from "swagger-jsdoc/lib/helpers/specification";
import parser from "swagger-parser";
import swaggerUi from "swagger-ui-express";

function parseCommentsJsDoc (code: any) {
  const jsDocRegex = /\/\*\*([\s\S]*?)\*\//gm;
  const jsDocComments = [];

  const regexResults = code.match(jsDocRegex);

  if (regexResults) {
    for (let i = 0; i < regexResults.length; i += 1) {
      const jsDocComment = doctrine.parse(regexResults[i], { unwrap: true });
      jsDocComments.push(jsDocComment);
    }
  }

  return filterJsDocComments(jsDocComments);
}

function cleanUselessProperties (inputSpec: any) {
  const improvedSpec = JSON.parse(JSON.stringify(inputSpec));
  const toClean = [
    "definitions",
    "responses",
    "parameters",
    "securityDefinitions",
  ];

  toClean.forEach(unnecessaryProp => {
    if (hasEmptyProperty(improvedSpec[unnecessaryProp])) {
      delete improvedSpec[unnecessaryProp];
    }
  });

  return improvedSpec;
}

function getSwaggerJsDoc (controllerClass: any, definitions: any) {
  let specification = createSpecification(definitions);

  const swaggerJsDocComments = parseCommentsJsDoc(controllerClass.toString());

  specHelper.addDataToSwaggerObject(specification, swaggerJsDocComments);

  parser.parse(specification, (err: any, api: any) => {
    if (!err) {
      specification = api;
    }
  });

  if (specification.openapi) {
    specification = cleanUselessProperties(specification);
  }

  return specification;
}

function generateDefinitions (baseUrl: string, definitions: ISwaggerDefinitions): any {
  return {
    openapi: "3.0.0",
    info: {
      title: definitions.title,
      version: server.version,
      description: definitions.description
    },
    servers: [ { url: baseUrl } ]
  };
}

export default function (baseUrl: string, controllerClass: any): void {
  const swaggerDefinitions: ISwaggerDefinitions = Reflect.getMetadata(SWAGGER_DECORATOR, controllerClass);

  if (swaggerDefinitions) {
    const swaggerJsDoc = getSwaggerJsDoc(controllerClass, generateDefinitions(baseUrl, swaggerDefinitions));

    server.express.use(baseUrl + "/api-doc", swaggerUi.serve, (_req: Request, res: Response) => {
      res.send(
        swaggerUi.generateHTML(
          swaggerJsDoc,
          false,
          null,
          server.swaggerOptions.css,
          server.swaggerOptions.icon,
          null,
          server.swaggerOptions.pageTitle
        )
      );
    });
  }
}
