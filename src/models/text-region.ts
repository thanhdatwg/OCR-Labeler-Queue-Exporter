// import { RegionLabel } from "./image-type";
import User from "./user";

class Coordinate {
  constructor(
    public x: number,
    public y: number
  ) { }

  static parseFromJson(obj: any): Coordinate {
    if (!obj) {
      return null;
    }
    const x: number = obj.x;
    const y: number = obj.y;
    return new Coordinate(x, y);
  }

  public distanceTo(other: Coordinate): number {
    return Math.sqrt((this.x - other.x) * (this.x - other.x)
      + (this.y - other.y) * (this.y - other.y));
  }
}

class Region {
  constructor(
    public vertices: Coordinate[]
  ) { }

  static parseFromJson(obj: any): Region {
    if (!obj) {
      return null;
    }
    const vertices: Coordinate[] = [];
    if (obj.vertices) {
      for (const item of obj.vertices) {
        vertices.push(Coordinate.parseFromJson(item));
      }
    }
    return new Region(vertices);
  }

  static parseFromPostgresPolygonString(str: string): Region {
    const parts: string[] = str.split(";");
    const vertices: Coordinate[] = [];
    for (const item of parts) {
      const values: string[] = item.split(",");
      vertices.push(new Coordinate(+values[0], +values[1]));
    }
    return new Region(vertices);
  }

  public getPostgresPolygonString(): string {
    return this.vertices
      .map(item => item.x + "," + item.y)
      .join(";");
  }
}

class TextRegion {
  constructor(
    public readonly regionId: string,
    public readonly imageId: string,
    public readonly region: Region,
    public readonly label: string,
    public readonly uploadedBy: User,
    public readonly labeledBy: User
  ) { }

  static parseFromJson(obj: any): TextRegion {
    if (!obj) {
      return null;
    }
    const regionId: string = obj.regionId;
    const thumbnailUrl: string = obj.thumbnailUrl;
    const region: Region = Region.parseFromJson(obj.region);
    const label: string = obj.label;
    const uploadedBy: User = obj.uploadedBy ? User.parseFromJson(obj.uploadedBy) : null;
    const labelBy: User = obj.labeledBy ? User.parseFromJson(obj.labeledBy) : null;
    return new TextRegion(
      regionId,
      thumbnailUrl,
      region,
      label,
      uploadedBy,
      labelBy,
    );
  }
}

export { Coordinate, TextRegion, Region };
