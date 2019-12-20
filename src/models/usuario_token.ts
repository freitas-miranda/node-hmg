import { Moment } from "moment";
import {
  AutoIncrement,
  Column,
  DataType,
  Default,
  Model,
  PrimaryKey,
  Table
} from "sequelize-typescript";

@Table({
  indexes: [ { fields: ["token"] } ],
  tableName: "T0M7"
})
class UsuarioToken extends Model<UsuarioToken> {

  @AutoIncrement
  @PrimaryKey
  @Column({field: "IG_RECNO"})
  id: number;

  @Column({field: "C0M7_GRPEMP"})
  grupo: string;

  @Column({field: "C0M7_CODEMP"})
  empresa: string;

  @Column({field: "C0M7_CODUSU"})
  usuario: string;

  @Column({field: "C0M7_TOKEN", type: DataType.STRING(300)})
  token: string;

  @Column({field: "C0M7_DTVEN", type: DataType.DATE})
  dataVencimento: Moment;

  @Column({field: "C0M7_DTCAD", type: DataType.DATE})
  dataCadastro: Moment;

  @Column({field: "C0M7_IP"})
  ip: string;

  @Column({field: "C0M7_USRAGENT", type: DataType.STRING(300)})
  agente: string;

  @Default("S")
  @Column({field: "C0M7_ATIVO", type: DataType.STRING})
  get ativo (): any {
    return (<any>this.getDataValue("ativo") === "S");
  }

  set ativo (valor: any) {
    this.setDataValue("ativo", (valor) ? "S" : "N");
  }
}

export default UsuarioToken;
