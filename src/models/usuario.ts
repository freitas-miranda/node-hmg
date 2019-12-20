import SequelizeModel from "@core/database/model";
import { Moment } from "moment";
import {
  AutoIncrement,
  Column,
  DataType,
  Default,
  PrimaryKey,
  Table
} from "sequelize-typescript";

@Table({ tableName: "T00A" })
class Usuario extends SequelizeModel<Usuario> {

  @AutoIncrement
  @PrimaryKey
  @Column({field: "IG_RECNO"})
  id: number;

  @Column({field: "C00A_CODUSU"})
  codigo: string;

  @Column({field: "C00A_LOGIN"})
  login: string;

  @Column({field: "C00A_NOME"})
  nome: string;

  @Column({field: "C00A_CHAVE"})
  senha: string;

  @Column({field: "C00A_EXPCHAVE", type: DataType.DATE})
  vencimentoSenha: Moment;

  @Column({field: "C00A_DATCAD", type: DataType.DATE})
  dataCadastro: Moment;

  @Default("S")
  @Column({field: "C00A_ATIVO", type: DataType.STRING})
  get ativo (): boolean {
    return (<any>this.getDataValue("ativo") === "S");
  }
}

export default Usuario;
