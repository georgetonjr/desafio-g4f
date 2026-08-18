import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTbNoticia1787065200000 implements MigrationInterface {
  name = 'CreateTbNoticia1787065200000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS pgcrypto`);

    await queryRunner.query(`CREATE SCHEMA IF NOT EXISTS noticia`);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS noticia.tb_noticia (
        id_noticia       uuid NOT NULL DEFAULT gen_random_uuid(),
        no_titulo        varchar(255) NOT NULL,
        ds_descricao     text NOT NULL,
        dt_criacao       timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        dt_atualizacao   timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT pk_noticia_id_noticia PRIMARY KEY (id_noticia)
      )
    `);

    await queryRunner.query(
      `COMMENT ON TABLE noticia.tb_noticia IS 'Notícias publicadas no sistema'`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN noticia.tb_noticia.id_noticia IS 'Identificador único da notícia'`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN noticia.tb_noticia.no_titulo IS 'Título da notícia'`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN noticia.tb_noticia.ds_descricao IS 'Descrição/conteúdo da notícia'`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN noticia.tb_noticia.dt_criacao IS 'Data/hora de criação do registro'`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN noticia.tb_noticia.dt_atualizacao IS 'Data/hora da última atualização do registro'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS noticia.tb_noticia`);
    await queryRunner.query(`DROP SCHEMA IF EXISTS noticia`);
  }
}
