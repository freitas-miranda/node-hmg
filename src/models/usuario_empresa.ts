import SequelizeModel from "@core/database/model";
import {
  AutoIncrement,
  Column,
  PrimaryKey,
  Table
} from "sequelize-typescript";

@Table({ tableName: "T011" })
class UsuarioEmpresa extends SequelizeModel<UsuarioEmpresa> {

  @PrimaryKey
  @AutoIncrement
  @Column({field: "IG_RECNO"})
  id: number;

  @Column({field: "C011_GRPEMP"})
  grupo: string;

  @Column({field: "C011_CODEMP"})
  empresa: string;

  @Column({field: "C011_CODUSU"})
  usuario: string;
}

export default UsuarioEmpresa;
