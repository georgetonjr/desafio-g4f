import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'tb_noticia', schema: 'noticia' })
export class Noticia {
  @PrimaryGeneratedColumn('uuid', { name: 'id_noticia' })
  id: string;

  @Column({ name: 'no_titulo', type: 'varchar', length: 255 })
  titulo: string;

  @Column({ name: 'ds_descricao', type: 'text' })
  descricao: string;

  @CreateDateColumn({ name: 'dt_criacao' })
  criadoEm: Date;

  @UpdateDateColumn({ name: 'dt_atualizacao' })
  atualizadoEm: Date;
}
