import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  AutoIncrement,
} from 'sequelize-typescript';

@Table({
  tableName: 'tbl_products',
  timestamps: false,
  freezeTableName: true,
})
export class Product extends Model<Product> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id!: number;

  @Column(DataType.TEXT)
  name?: string;

  @Column(DataType.TEXT)
  description?: string;

  @Column(DataType.STRING(100))
  category?: string;

  @Column(DataType.TEXT)
  image?: string;

  @Column(DataType.DECIMAL(10, 2))
  price?: number;

  @Column({ type: DataType.DECIMAL(5, 2), allowNull: false, defaultValue: 0 })
  offerPercentage!: number;

  @Column(DataType.INTEGER)
  stock?: number;
}
