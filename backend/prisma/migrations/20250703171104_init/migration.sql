-- AlterTable
CREATE SEQUENCE lights_id_seq;
ALTER TABLE "lights" ALTER COLUMN "id" SET DEFAULT nextval('lights_id_seq');
ALTER SEQUENCE lights_id_seq OWNED BY "lights"."id";
