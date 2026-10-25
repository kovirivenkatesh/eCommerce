import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
} from 'sequelize-typescript';

@Table({
  tableName: 'tbl_payment_attempts',
  timestamps: true,
  freezeTableName: true,
})
export class PaymentAttempt extends Model<PaymentAttempt> {
  @PrimaryKey
  @Column(DataType.STRING(100))
  razorpayOrderId!: string;

  @Column(DataType.INTEGER)
  userId!: number;

  @Column(DataType.JSON)
  items!: any;

  @Column(DataType.INTEGER)
  amountPaise!: number;

  @Column(DataType.JSON)
  shippingAddress!: any;

  @Column({ type: DataType.STRING(20), allowNull: false, defaultValue: 'created' })
  status!: string;

  @Column(DataType.STRING(20))
  paymentMethod!: string;

  @Column(DataType.STRING(100))
  paymentId?: string | null;
}
