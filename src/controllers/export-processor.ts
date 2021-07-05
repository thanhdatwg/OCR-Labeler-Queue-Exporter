import { Job } from "bull";
import { create } from "archiver";
import { createWriteStream } from "fs";
import { join } from "path";
import { ImageFilterOptions } from "../models/image-filter-options";
import ImageDao from "../models/daos/image-dao";
import { env } from "../util/env";
import logger from "../util/logger";
import { ExportResult } from "../models/export-result";
import { uid } from "uid";
import { ExportProgress } from "../models/export-progress";

const imageDao = ImageDao.getInstance();
const ONE_WEEK = 7 * 24 * 60 * 60 * 1000;

function generateExportFileName(): string {
    return `Dataset-${new Date().toUTCString()}.zip`;
}

module.exports = async function (job: Job): Promise<ExportResult> {
    try {
        const requestTime = new Date();
        const exportFilename = generateExportFileName();
        job.progress(new ExportProgress(
            requestTime, exportFilename, "Getting list of files", 0
        ));

        const filterOptions = job.data.filterOptions as ImageFilterOptions;
        const images = await imageDao.getImages(filterOptions);
        const imageCount = images.length;
        job.progress(new ExportProgress(
            requestTime, exportFilename, "Compressing", 0
        ));

        const outputStream = createWriteStream(join(env.EXPORT_DIRECTORY, exportFilename));
        const archiver = create("zip", {
            zlib: {
                level: 9
            }
        });
        outputStream.on("close", function () {
            logger.info(`Exported ${exportFilename}: ${archiver.pointer()} bytes`);
        });
        // good practice to catch warnings (ie stat failures and other non-blocking errors)
        archiver.on("warning", function (err) {
            if (err.code === "ENOENT") {
                logger.info(`Warning: ${err}`);
            } else {
                logger.error(`Error: ${err}`);
                throw err;
            }
        });
        // good practice to catch this error explicitly
        archiver.on("error", function (err) {
            logger.error(`Error: ${err}`);
            throw err;
        });
        archiver.pipe(outputStream);

        images.forEach(((item) => {
            archiver.file(join(env.UPLOADED_DIRECTORY, item.imageUrl), {
                name: `${item.imageId}.jpeg`,
                prefix: "images"
            });
            archiver.append(JSON.stringify(item), {
                name: `${item.imageId}.json`,
                prefix: "metadata"
            });
        }));

        let entryCount = 0;
        archiver.on("entry", (entry) => {
            entryCount ++;
            job.progress(new ExportProgress(
                requestTime, exportFilename, `Compressing ${entry.name}`, entryCount / (imageCount * 2)
            ));
        });

        await archiver.finalize();
        job.progress(new ExportProgress(
            requestTime, exportFilename, "Finished", 1
        ));

        const validTo = new Date(new Date().getTime() + ONE_WEEK);
        return new ExportResult(
            uid(32),
            requestTime,
            validTo,
            filterOptions,
            imageCount,
            exportFilename
        );
    } catch (e) {
        logger.error(e);
        throw e;
    }
};