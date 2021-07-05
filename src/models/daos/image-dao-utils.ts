import { ImageFilterOptions } from "../image-filter-options";
import { getOppositeOption, ImageSortOption } from "../image-sort-options";
import UploadedImage from "../uploaded-image";

export function getOrderByClause(option: ImageSortOption): string {
    switch (option) {
        case ImageSortOption.UPLOAD_LATEST_FIRST:
            return "ORDER BY \"Images\".\"uploadedDate\" DESC, \"Images\".\"imageId\" DESC";
        case ImageSortOption.UPLOAD_OLDEST_FIRST:
            return "ORDER BY \"Images\".\"uploadedDate\", \"Images\".\"imageId\"";
        case ImageSortOption.STATUS_ASC:
            return "ORDER BY \"Images\".status, \"Images\".\"imageId\"";
        case ImageSortOption.STATUS_DESC:
            return "ORDER BY \"Images\".status DESC, \"Images\".\"imageId\" DESC";
        case ImageSortOption.USER_ASC:
            return "ORDER BY \"Images\".\"uploadedBy\", \"Images\".\"imageId\"";
        case ImageSortOption.USER_DESC:
            return "ORDER BY \"Images\".\"uploadedBy\" DESC, \"Images\".\"imageId\" DESC";
        default:
            return "";
    }
}

class ParameterizedSubquery {
    constructor(
        public readonly subquery: string = "true",
        public readonly parameters: any[] = []
    ) { }
}

export function getFilterClause(filterOptions: ImageFilterOptions): ParameterizedSubquery {

    const emptyFilterStatuses: boolean = (!filterOptions.filteredStatuses || filterOptions.filteredStatuses.length === 0);
    const emptyFilterUsers: boolean = (!filterOptions.filteredUsers || filterOptions.filteredUsers.length === 0);
    const emptyFilterUploadTime: boolean = (filterOptions.filteredUploadTime === null || filterOptions.filteredUploadTime.length !== 2);
    const conditionClauses: string[] = [];
    const parameters: any[] = [];
    if (!emptyFilterStatuses) {
        conditionClauses.push(`"Images".status IN (${filterOptions.filteredStatuses.map(() => "?").join(",")})`);
        parameters.push(...filterOptions.filteredStatuses);
    }
    if (!emptyFilterUsers) {
        conditionClauses.push(`"Images"."uploadedBy" IN (${filterOptions.filteredUsers.map(() => "?").join(",")})`);
        parameters.push(...filterOptions.filteredUsers);
    }
    if (!emptyFilterUploadTime) {
        conditionClauses.push("\"Images\".\"uploadedDate\" BETWEEN ? AND ?");
        parameters.push(filterOptions.filteredUploadTime[0].getTime(), filterOptions.filteredUploadTime[1].getTime());
    }
    if (conditionClauses.length === 0) {
        return new ParameterizedSubquery();
    }
    const subquery = conditionClauses.join(" AND ");
    return new ParameterizedSubquery(subquery, parameters);
}

export function getCompareWithImageClause(
    image: UploadedImage,
    filterOptions: ImageFilterOptions,
    isNext: boolean
): ParameterizedSubquery {
    const option = isNext ? filterOptions.sortOption : getOppositeOption(filterOptions.sortOption);
    let sortValue: any;
    let sortColumn: string;
    let comparator: string;
    switch (option) {
        case ImageSortOption.UPLOAD_LATEST_FIRST:
        case ImageSortOption.UPLOAD_OLDEST_FIRST:
            sortValue = image.uploadedDate.getTime();
            sortColumn = "\"Images\".\"uploadedDate\"";
            break;
        case ImageSortOption.STATUS_ASC:
        case ImageSortOption.STATUS_DESC:
            sortValue = image.status;
            sortColumn = "\"Images\".\"status\"";
            break;
        case ImageSortOption.USER_ASC:
        case ImageSortOption.USER_DESC:
            sortValue = image.uploadedBy.username;
            sortColumn = "\"Images\".\"uploadedBy\"";
            break;
        default:
            return new ParameterizedSubquery();
    }
    switch (option) {
        case ImageSortOption.UPLOAD_OLDEST_FIRST:
        case ImageSortOption.STATUS_ASC:
        case ImageSortOption.USER_ASC:
            comparator = "<";
            break;
        case ImageSortOption.UPLOAD_LATEST_FIRST:
        case ImageSortOption.STATUS_DESC:
        case ImageSortOption.USER_DESC:
            comparator = ">";
            break;
    }
    const filterClause = getFilterClause(filterOptions);
    const subquery = `
        WHERE (? ${comparator} ${sortColumn} OR (? = ${sortColumn} AND ? ${comparator} "Images"."imageId"))
        AND ${filterClause.subquery}
        ${getOrderByClause(option)}
    `;
    const parameters = [sortValue, sortValue, image.imageId, ...filterClause.parameters];
    return new ParameterizedSubquery(subquery, parameters);
}