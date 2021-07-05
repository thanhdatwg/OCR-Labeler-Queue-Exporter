export enum ImageSortOption {
    UPLOAD_LATEST_FIRST = "UPLOAD_LATEST_FIRST",
    UPLOAD_OLDEST_FIRST = "UPLOAD_OLDEST_FIRST",
    STATUS_ASC = "STATUS_ASC",
    STATUS_DESC = "STATUS_DESC",
    USER_ASC = "USER_ASC",
    USER_DESC = "USER_DESC",
}

export function getAllImageSortOptions() {
    return [
        ImageSortOption.UPLOAD_LATEST_FIRST,
        ImageSortOption.UPLOAD_OLDEST_FIRST,
        ImageSortOption.STATUS_ASC,
        ImageSortOption.STATUS_DESC,
        ImageSortOption.USER_ASC,
        ImageSortOption.USER_DESC
    ];
}

export function getImageSortOptionString(option: ImageSortOption): string {
    switch (option) {
        case ImageSortOption.UPLOAD_LATEST_FIRST:
            return "Upload date (Latest first)";
        case ImageSortOption.UPLOAD_OLDEST_FIRST:
            return "Upload date (Oldest first)";
        case ImageSortOption.STATUS_ASC:
            return "Status (Asc.)";
        case ImageSortOption.STATUS_DESC:
            return "Status (Desc.)";
        case ImageSortOption.USER_ASC:
            return "User (Asc.)";
        case ImageSortOption.USER_DESC:
            return "User (Desc.)";
        default:
            return "";
    }
}

export function getOppositeOption(option: ImageSortOption): ImageSortOption {
    switch (option) {
        case ImageSortOption.UPLOAD_LATEST_FIRST:
            return ImageSortOption.UPLOAD_OLDEST_FIRST;
        case ImageSortOption.UPLOAD_OLDEST_FIRST:
            return ImageSortOption.UPLOAD_LATEST_FIRST;
        case ImageSortOption.STATUS_ASC:
            return ImageSortOption.STATUS_DESC;
        case ImageSortOption.STATUS_DESC:
            return ImageSortOption.STATUS_ASC;
        case ImageSortOption.USER_ASC:
            return ImageSortOption.USER_DESC;
        case ImageSortOption.USER_DESC:
            return ImageSortOption.USER_ASC;
        default:
            return null;
    }
}
