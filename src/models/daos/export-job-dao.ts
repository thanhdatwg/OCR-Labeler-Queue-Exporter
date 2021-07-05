import { toOrdinal } from "pg-parameterize";
import { ExportResult } from "../export-result";
import { ImageFilterOptions } from "../image-filter-options";
import databaseConnection from "./database";

class ExportResultDao {
    private constructor() { }
    private static readonly INSTANCE = new ExportResultDao();

    public static getInstance(): ExportResultDao {
        return this.INSTANCE;
    }

    public async addExportResult(result: ExportResult): Promise<void> {
        try {
            await databaseConnection.any(`
                INSERT INTO public."ExportResults"("exportId", "requestTime", "validTo", "filterOptions", "imageCount", "exportFilename")
                    VALUES ($1, $2, $3, $4, $5, $6);
            `, [
                result.exportId,
                result.requestTime.getTime(),
                result.validTo.getTime(),
                JSON.stringify(result.filterOptions),
                result.imageCount,
                result.exportFilename
            ]);
        } catch (e) {
            throw new Error(`[addExportResult()] Error happened while adding export result to database: ${e}`);
        }
    }

    public async getExportResult(exportId: string): Promise<ExportResult> {
        try {
            const result = await databaseConnection.oneOrNone(`
                SELECT * FROM public."ExportResults" WHERE "ExportResults"."exportId" = $1;
            `, [exportId]);
            if (!result) {
                return null;
            }
            return new ExportResult(
                result.exportId,
                new Date(result.requestTime),
                new Date(result.validTo),
                ImageFilterOptions.parseFromJson(JSON.parse(result.filterOptions)),
                result.imageCount,
                result.exportFilename
            );
        } catch (e) {
            throw new Error(`[getAllExportResults()] Error happened while reading region labels from database: ${e}`);
        }
    }

    public async getAllExportResults(minValidTo: number): Promise<ExportResult[]> {
        try {
            const results = await databaseConnection.any(`
                SELECT * FROM public."ExportResults" WHERE "ExportResults"."validTo" >= $1 ORDER BY "ExportResults"."requestTime";
            `, [minValidTo]);
            return results.map((item) => {
                return new ExportResult(
                    item.exportId,
                    new Date(+item.requestTime),
                    new Date(+item.validTo),
                    ImageFilterOptions.parseFromJson(JSON.parse(item.filterOptions)),
                    item.imageCount,
                    item.exportFilename
                );
            });
        } catch (e) {
            throw new Error(`[getAllExportResults()] Error happened while reading region labels from database: ${e}`);
        }
    }

    public async getAllExpiredExportResults(maxValidTo: number): Promise<ExportResult[]> {
        try {
            const results = await databaseConnection.any(`
                SELECT * FROM public."ExportResults" WHERE "ExportResults"."validTo" < $1 ORDER BY "ExportResults"."requestTime";
            `, [maxValidTo]);
            return results.map((item) => {
                return new ExportResult(
                    item.exportId,
                    new Date(+item.requestTime),
                    new Date(+item.validTo),
                    ImageFilterOptions.parseFromJson(JSON.parse(item.filterOptions)),
                    item.imageCount,
                    item.exportFilename
                );
            });
        } catch (e) {
            throw new Error(`[getAllExportResults()] Error happened while reading region labels from database: ${e}`);
        }
    }

    public async deleteExportResult(exportId: string): Promise<void> {
        try {
            if (exportId.length === 0) {
                return null;
            }
            await databaseConnection.any(`
                DELETE FROM public."ExportResults"
                    WHERE "ExportResults"."exportId" = $1;
            `, [exportId]);
        } catch (e) {
            throw new Error(`[deleteExportResult()] Error happened while deleting export result to database: ${e}`);
        }
    }

    public async deleteExportResults(exportIds: string[]): Promise<void> {
        try {
            await databaseConnection.any(toOrdinal(`
                DELETE FROM public."ExportResults"
                    WHERE "ExportResults"."exportId" IN (${exportIds.map(_ => "?").join(",")});
            `), [...exportIds]);
        } catch (e) {
            throw new Error(`[deleteExportResults()] Error happened while deleting export result to database: ${e}`);
        }
    }
}

export default ExportResultDao;
