import { ImageFilterOptions } from "./image-filter-options";

export class ExportResult {
    constructor(
        public readonly exportId: string,
        public readonly requestTime: Date,
        public readonly validTo: Date,
        public readonly filterOptions: ImageFilterOptions,
        public readonly imageCount: number,
        public readonly exportFilename: string
    ) {}

    public static parseFromJson(obj: any): ExportResult {
        const exportId: string = obj.exportId;
        const requestTime: Date = new Date(obj.requestTime);
        const validTo: Date = new Date(obj.validTo);
        const filterOptions = ImageFilterOptions.parseFromJson(obj.filterOptions);
        const imageCount: number = +obj.imageCount;
        const exportFilename: string =  obj.exportFilename;
        return new ExportResult(exportId, requestTime, validTo, filterOptions, imageCount, exportFilename);
    }
}