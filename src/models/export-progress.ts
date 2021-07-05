export class ExportProgress {
    constructor(
        public readonly requestTime: Date,
        public readonly exportFilename: string,
        public readonly status: string,
        public readonly percentage: number
    ) {}

    public static parseFromJson(obj: any): ExportProgress {
        const requestTime: Date = new Date(obj.requestTime);
        const exportFilename: string = obj.exportFilename;
        const status: string = obj.status;
        const percentage: number = obj.percentage;
        return new ExportProgress(requestTime, exportFilename, status, percentage);
    }
}