import { MigrationInterface, QueryRunner } from "typeorm";

export class InitJobsTable1749696731108 implements MigrationInterface {
    name = 'InitJobsTable1749696731108'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."jobs_status_enum" AS ENUM('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED')`);
        await queryRunner.query(`CREATE TABLE "jobs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "objectKey" character varying NOT NULL, "status" "public"."jobs_status_enum" NOT NULL DEFAULT 'PENDING', "labels" jsonb, "score" double precision, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_cf0a6c42b72fcc7f7c237def345" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "jobs"`);
        await queryRunner.query(`DROP TYPE "public"."jobs_status_enum"`);
    }

}
