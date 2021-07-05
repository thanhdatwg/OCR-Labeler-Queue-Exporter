import { toOrdinal } from "pg-parameterize";
import { Region, TextRegion } from "../text-region";
import User from "../user";
import databaseConnection from "./database";

class TextRegionDao {
    private constructor() { }
    private static readonly INSTANCE = new TextRegionDao();
    public static getInstance(): TextRegionDao {
        return this.INSTANCE;
    }

    public async getTextRegion(regionId: string): Promise<TextRegion> {
        try {
            const result = await databaseConnection.oneOrNone(
                `
                    SELECT * FROM public."Regions"
                        WHERE "Regions"."regionId" = $1;
                `,
                [regionId]
            );
            if (!result) {
                return null;
            }
            const label = result.label;
            return new TextRegion(
                result.regionId,
                result.imageId,
                Region.parseFromPostgresPolygonString(result.region),
                label,
                User.newBaseUser(result.uploadedBy, result.uploadedBy),
                result.labeledBy ? User.newBaseUser(result.labeledBy, result.labeledBy) : null
            );
        } catch (e) {
            throw new Error(`[getTextRegion()] Error happened while reading regions from database: ${e}`);
        }
    }

    public async getTextRegionsOfImage(imageId: string): Promise<TextRegion[]> {
        try {
            const regions = await databaseConnection.any(
                `
                    SELECT
                        "Regions"."regionId", "Regions"."region", "Regions"."label",
                        "Uploader".username as "uploaderUsername", "Uploader"."displayName" as "uploaderDisplayName",
                        "Labeler".username as "labelerUsername", "Labeler"."displayName" as "labelerDisplayName",
                        "RegionLabels"."displayName" as "labelDisplayName", "RegionLabels"."color" as "labelColor"
                        FROM public."Regions"
                        INNER JOIN public."Users" AS "Uploader"
                            ON "Regions"."uploadedBy" = "Uploader".username
                        LEFT JOIN public."Users" as "Labeler"
                            ON "Regions"."labeledBy" = "Labeler".username
                        LEFT JOIN public."RegionLabels"
                            ON "Regions"."label" = "RegionLabels"."labelId"
                        WHERE "Regions"."imageId" = $1;
                `,
                [imageId]
            );
            const results: TextRegion[] = regions.map(item => new TextRegion(
                item.regionId,
                imageId,
                Region.parseFromPostgresPolygonString(item.region),
                item.label,
                User.newBaseUser(item.uploaderDisplayName, item.uploaderUsername),
                item.labelerDisplayName ? User.newBaseUser(item.labelerDisplayName, item.labelerUsername) : null
            ));
            return results;
        } catch (e) {
            throw new Error(`[getTextRegionsOfImage()] Error happened while reading regions from database: ${e}`);
        }
    }

    public async getTextRegionsOfImageList(imageIds: string[]): Promise<TextRegion[]> {
        try {
            const regions = await databaseConnection.any(toOrdinal(`
                SELECT
                    "TextRegions"."regionId", "TextRegions"."imageId", "TextRegions"."region", "TextRegions"."label",
                    "Uploader".username as "uploaderUsername", "Uploader"."displayName" as "uploaderDisplayName",
                    "Labeler".username as "labelerUsername", "Labeler"."displayName" as "labelerDisplayName"
                    FROM public."TextRegions"
                    INNER JOIN public."Users" AS "Uploader"
                        ON "TextRegions"."uploadedBy" = "Uploader".username
                    LEFT JOIN public."Users" as "Labeler"
                        ON "TextRegions"."labeledBy" = "Labeler".username
                    WHERE "TextRegions"."imageId" IN (${imageIds.map(() => "?").join(",")});
            `), [...imageIds]);
            const results: TextRegion[] = regions.map(item => new TextRegion(
                item.regionId,
                item.imageId,
                Region.parseFromPostgresPolygonString(item.region),
                item.label,
                User.newBaseUser(item.uploaderDisplayName, item.uploaderUsername),
                item.labelerDisplayName ? User.newBaseUser(item.labelerDisplayName, item.labelerUsername) : null
            ));
            return results;
        } catch (e) {
            throw new Error(`[getTextRegionsOfImageList()] Error happened while reading regions from database: ${e}`);
        }
    }

    public async getNumberOfUnlabeledRegion(imageId: string): Promise<number> {
        try {
            const result = await databaseConnection.one(`
                SELECT COUNT(*) FROM public."Regions" WHERE "Regions"."imageId" = $1 AND "Regions".label IS null;
            `, [imageId]);
            return +result.count;
        } catch (reason) {
            throw new Error(`[getNumberOfUnlabeledRegion()] Error happened while counting unlabeled region: ${reason}`);
        }
    }
}

export default TextRegionDao;
