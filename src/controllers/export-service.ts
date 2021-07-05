import Queue from "bull";
import { Router } from "express";
import { StatusCodes } from "http-status-codes";
import { ExportResult } from "../models/export-result";
import ExportResultDao from "../models/daos/export-job-dao";
import { ImageFilterOptions } from "../models/image-filter-options";
import { env } from "../util/env";
import logger from "../util/logger";
import { join } from "path";
import { rm, rmSync } from "fs";

const exportResultDao = ExportResultDao.getInstance();

const exportQueue = new Queue("Export queue", {
    redis: {
        host: env.REDIS_HOST,
        port: env.REDIS_PORT
    }
});
exportQueue.process(join(__dirname, "export-processor.js"));
exportQueue.on("completed", (_, result) => {
    exportResultDao.addExportResult(ExportResult.parseFromJson(result));
});

const exportRouter = Router();

exportRouter.post("/export", (req, res) => {
    try {
        const filterOptions = ImageFilterOptions.parseFromJson(req.body.filterOptions);
        exportQueue.add({ filterOptions }, {
            removeOnComplete: true
        });
        return res.status(StatusCodes.OK).json({});
    } catch (e) {
        logger.error(`[/export] Error happened when requesting export: ${e}`);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Internal server error" });
    }
});

exportRouter.post("/export-status", async (req, res) => {
    try {
        const minValidTo = new Date().getTime();
        const activeJobs = await exportQueue.getActive();
        const exporting = activeJobs.map(item => item.progress());
        const exported = await exportResultDao.getAllExportResults(minValidTo);
        return res.json({
            exported, exporting
        });
    } catch (e) {
        logger.error(`[/export-status] Error happened when getting export status: ${e}`);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Internal server error" });
    }
});

exportRouter.post("/download", async (req, res) => {
    try {
        const minValidTo = new Date().getTime();
        const exportId = req.body.exportId;
        const exportResult = await exportResultDao.getExportResult(exportId);
        if (!exportResult || exportResult.validTo.getTime() < minValidTo) {
            return res.status(StatusCodes.BAD_REQUEST).json({error: "The requested file is not available"});
        }
        const exportFilePath = join(env.EXPORT_DIRECTORY, exportResult.exportFilename);
        return res.download(exportFilePath, exportResult.exportFilename);
    } catch (e) {
        logger.error(`[/download] Error happened when downloading export: ${e}`);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Internal server error" });
    }
});

exportRouter.post("/delete", async (req, res) => {
    try {
        const exportId = req.body.exportId;
        const exportResult = await exportResultDao.getExportResult(exportId);
        if (!exportResult) {
            return res.status(StatusCodes.BAD_REQUEST).json({error: "The requested file is not available"});
        }
        const exportFilePath = join(env.EXPORT_DIRECTORY, exportResult.exportFilename);
        await exportResultDao.deleteExportResult(exportId);
        rm(exportFilePath,(err) => {
            if (err) {
                logger.error(`[/delete] Error happened when deleting export: ${err}`);
                return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Internal server error" });        
            }
            return res.status(StatusCodes.OK).json({});
        });
    } catch (e) {
        logger.error(`[/delete] Error happened when deleting export: ${e}`);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Internal server error" });
    }
});

exportRouter.post("/delete-expired", async (req, res) => {
    try {
        const maxValidTo = new Date().getTime();
        const expired = await exportResultDao.getAllExpiredExportResults(maxValidTo);
        const expiredIds = expired.map(item => item.exportId);
        await exportResultDao.deleteExportResults(expiredIds);
        expired.forEach(item => {
            const expiredFilepath = join(env.EXPORT_DIRECTORY, item.exportFilename);
            rmSync(expiredFilepath);
        });
        return res.status(StatusCodes.OK).json({});
    } catch (e) {
        logger.error(`[/delete-expired] Error happened when deleting expired exports: ${e}`);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Internal server error" });
    }
});

export default exportRouter;