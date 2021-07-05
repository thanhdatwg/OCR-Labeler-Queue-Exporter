import { ImageSortOption } from "./image-sort-options";
import ImageStatus from "./image-status";

export class ImageFilterOptions {
  constructor(
    public sortOption: ImageSortOption,
    public filteredStatuses: ImageStatus[],
    public filteredUsers: string[],
    public filteredUploadTime: Date[],
  ) { }

  public static getDefaultOptions(): ImageFilterOptions {
    return new ImageFilterOptions(
      ImageSortOption.UPLOAD_LATEST_FIRST,
      [],
      [],
      [],
    );
  }

  public static parseFromJson(obj: any): ImageFilterOptions {
    if (!obj) {
      return null;
    }
    const sortOption: ImageSortOption = obj.sortOption as ImageSortOption;
    const filteredStatuses: ImageStatus[] = [];
    if (obj.filteredStatuses) {
      for (const item of obj.filteredStatuses) {
        filteredStatuses.push(item as ImageStatus);
      }
    }
    const filteredUsers: string[] = obj.filteredUsers;
    const filteredUploadTime: Date[] = [];
    for (const item of obj.filteredUploadTime) {
      filteredUploadTime.push(new Date(+item));
    }
    return new ImageFilterOptions(
      sortOption,
      filteredStatuses,
      filteredUsers,
      filteredUploadTime,
    );
  }

  public getJson(): any {
    return {
      sortOption: this.sortOption,
      filteredStatuses: this.filteredStatuses,
      filteredUsers: this.filteredUsers,
      filteredUploadTime: this.filteredUploadTime && this.filteredUploadTime.length === 2
        ? [this.filteredUploadTime[0].getTime(), this.filteredUploadTime[1].getTime()]
        : [],
    };
  }

  public equals(other: ImageFilterOptions): boolean {
    if (!other) {
      return false;
    }
    if (this.sortOption !== other.sortOption) {
      return false;
    }
    if (!this.isArrayEqual(this.filteredStatuses, other.filteredStatuses)) {
      return false;
    }
    if (!this.isArrayEqual(this.filteredUsers, other.filteredUsers)) {
      return false;
    }
    if (!this.isArrayEqual(this.filteredUploadTime, other.filteredUploadTime)) {
      return false;
    }
    return true;
  }

  private isArrayEqual(a1: any[], a2: any[]): boolean {
    if (!a1) {
      return (!a2);
    }
    if (!a2) {
      return false;
    }
    if (a1.length !== a2.length) {
      return false;
    }
    for (let i = 0; i < a1.length; i++) {
      if (a1[i] !== a2[i]) {
        return false;
      }
    }
    return true;
  }
}
