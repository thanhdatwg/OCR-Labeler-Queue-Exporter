import { ImageFilterOptions } from "../image-filter-options";
import ImageStatus from "../image-status";
import UploadedImage from "../uploaded-image";
import User from "../user";
import databaseConnection from "./database";
import { toOrdinal } from "pg-parameterize";
import { getFilterClause, getOrderByClause } from "./image-dao-utils";
import { TextRegion } from "../text-region";
import TextRegionDao from "./region-dao";

class ImageDao {
    private constructor() { }
    private static readonly INSTANCE = new ImageDao();
    public static getInstance(): ImageDao {
        return this.INSTANCE;
    }
    private readonly regionDao = TextRegionDao.getInstance();

    public async getImagesCount(filterOptions: ImageFilterOptions): Promise<number> {
        try {
            const filterClause = getFilterClause(filterOptions);
            const query = toOrdinal(`
                SELECT COUNT(*) FROM public."Images"
                    WHERE ${filterClause.subquery};
            `);
            const result = await databaseConnection.one(query, filterClause.parameters);
            return +result.count;
        } catch (e) {
            throw `[getImagesCount()] Error happened while reading database: ${e}`;
        }
    }

    public async getImages(filterOptions: ImageFilterOptions): Promise<UploadedImage[]>  {
        try {
            const filterClause = getFilterClause(filterOptions);
            const getImagesQuery = toOrdinal(`
                SELECT * FROM public."Images" JOIN public."Users" ON "Images"."uploadedBy" = "Users".username
                    WHERE ${filterClause.subquery}
                    ${getOrderByClause(filterOptions.sortOption)};
            `);
            const imageResults = await databaseConnection.any(getImagesQuery, [...filterClause.parameters]);
            if (imageResults.length === 0) {
                return [];
            }

            const imageResultIds = imageResults.map(item => item.imageId as string);
            const sqlResults = await Promise.all([
                databaseConnection.any(toOrdinal(`
                    SELECT * FROM public."TextRegions"
                    JOIN public."Images" ON "TextRegions"."imageId" = "Images"."imageId"
                    WHERE "TextRegions"."imageId" IN (${imageResultIds.map(() => "?").join(",")});
                `), imageResultIds),
                this.regionDao.getTextRegionsOfImageList(imageResultIds)
            ]);
            
            const regionsResults = sqlResults[1];
            const imageId2Regions = new Map<string, TextRegion[]>(imageResultIds.map(item => [item, []]));
            regionsResults.forEach(item => {
                if (!imageId2Regions.has(item.imageId)) {
                    return;
                }
                imageId2Regions.get(item.imageId).push(item);
            });

            const images: UploadedImage[] = [];
            for (const item of imageResults) {
                delete item.password;
                const ofUser = User.parseFromJson(item);
                images.push(new UploadedImage(
                    item.imageId,
                    item.imageUrl,
                    item.thumbnailUrl,
                    imageId2Regions.get(item.imageId),
                    ofUser,
                    new Date(+item.uploadedDate),
                    item.status as ImageStatus,
                    item.originalFilename,
                ));
            }
            return images;
        } catch (e) {
            throw new Error(`[getImages()] Error happened while reading from database: ${e}`);
        }
    }
}

export default ImageDao;
