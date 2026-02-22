import { ProfileMetadataRow } from "../db/index.ts";
import { SnakeToCamel } from "../utils/snakeToCamelCase.ts";

export type Profile = SnakeToCamel<ProfileMetadataRow>;
