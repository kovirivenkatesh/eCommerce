import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  AutoIncrement,
} from 'sequelize-typescript';

@Table({
  tableName: 'tbl_users',
  timestamps: false,
  freezeTableName: true,
})
export class User extends Model<User> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id!: number;

  @Column(DataType.STRING(100))
  name?: string;

  @Column(DataType.STRING(150))
  email?: string;

  @Column(DataType.STRING(255))
  password?: string;

  @Column({ type: DataType.STRING(20), allowNull: false, defaultValue: 'user' })
  role!: string;

  @Column(DataType.STRING(64))
  sessionToken?: string | null;

  @Column(DataType.JSON)
  cartItems?: { productId: number; quantity: number }[] | null;

  @Column(DataType.STRING(255))
  resetToken?: string | null;
}
