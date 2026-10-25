import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  AutoIncrement,
} from 'sequelize-typescript';

@Table({
  tableName: 'tbl_orders',
  timestamps: true,
  freezeTableName: true,
})
export class Order extends Model<Order> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id!: number;

  @Column(DataType.INTEGER)
  userId?: number;

  @Column(DataType.JSON)
  items?: any;

  @Column(DataType.DECIMAL(10, 2))
  total?: number;

  @Column(DataType.JSON)
  shippingAddress?: any;

  @Column(DataType.STRING(100))
  paymentMethod?: string;

  @Column(DataType.STRING(50))
  status?: string;

  @Column(DataType.DATE)
  createdAt?: Date;

  @Column(DataType.DATE)
  updatedAt?: Date;

  @Column(DataType.STRING(100))
  trackingNumber?: string;

  @Column({ type: DataType.STRING(100), unique: true })
  paymentId?: string | null;
}
