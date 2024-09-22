import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Cliente {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text', { unique: true })
  nombre: string;

  @Column('text', { nullable: true })
  correo: string;

  @Column()
  telefono: string;

  @Column('text', { nullable: true })
  direccion: string;

  @Column('text', { default: 'activo' })
  estadoCliente: string;
}
