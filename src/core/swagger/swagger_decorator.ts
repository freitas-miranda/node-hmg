import { SWAGGER_DECORATOR } from "@core/decorators/constants";
import { ISwaggerDefinitions } from "@core/swagger/swagger_interfaces";
import { get } from "lodash";

export function Swagger (options?: ISwaggerDefinitions | string) {
  return (target: any) => {
    if (process.env.NODE_ENV === "development") {
      const definitions: ISwaggerDefinitions = { };

      if (typeof options === "string") {
        definitions.title = options;
      } else {
        definitions.title = get(options, "title") || target.name;
        definitions.description = get(options, "description");
      }

      Reflect.defineMetadata(SWAGGER_DECORATOR, definitions, target);
    }
  };
}

export default Swagger;
