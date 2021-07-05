class User {
  constructor(
    public readonly displayName: string,
    public readonly username: string,
    public readonly password: string,
    public readonly canUpload: boolean,
    public readonly canVerify: boolean,
    public readonly canExport: boolean,
    public readonly canManageAllImage: boolean,
    public readonly canManageUsers: boolean,
    public readonly canManageImageTypes: boolean,
    public readonly canManageImageTags: boolean,
    public readonly canUseExperimental: boolean,
    public readonly isExpert: boolean
  ) { }

  static parseFromJson(obj: any): User {
    if (!obj) {
      return null;
    }
    const displayName: string = obj.displayName;
    const username: string = obj.username;
    const password: string = obj.password;
    const canUpload: boolean = obj.canUpload;
    const canVerify: boolean = obj.canVerify;
    const canExport: boolean = obj.canExport;
    const canManageAllImage: boolean = obj.canManageAllImage;
    const canManageUsers: boolean = obj.canManageUsers;
    const canManageImageTypes: boolean = obj.canManageImageTypes;
    const canManageImageTags: boolean = obj.canManageImageTags;
    const canUseExperimental: boolean = obj.canUseExperimental;
    const isExpert: boolean = obj.isExpert;
    return new User(
      displayName.trim(),
      username,
      password,
      canUpload,
      canVerify,
      canExport,
      canManageAllImage,
      canManageUsers,
      canManageImageTypes,
      canManageImageTags,
      canUseExperimental,
      isExpert
    );
  }

  static newBaseUser(displayName: string, username: string): User {
    return new User(
      displayName,
      username,
      "",
      true,
      true,
      false,
      false,
      false,
      false,
      false,
      false,
      false
    );
  }

  static newAdminUser(displayName: string, username: string, password: string): User {
    return new User(
      displayName,
      username,
      password,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      false
    );
  }

  public getWithoutPassword(): User {
    return new User(
      this.displayName,
      this.username,
      null,
      this.canUpload,
      this.canVerify,
      this.canExport,
      this.canManageAllImage,
      this.canManageUsers,
      this.canManageImageTypes,
      this.canManageImageTags,
      this.canUseExperimental,
      this.isExpert
    );
  }
}

class UserManagementInfo {
  constructor(
    public readonly user: User,
    public readonly uploadCount: number,
    public readonly labelCount: number
  ) { }

  static parseFromJson(obj: any): UserManagementInfo {
    if (!obj) {
      return null;
    }
    const user: User = obj.user ? User.parseFromJson(obj.user) : null;
    const uploadCount: number = obj.uploadCount;
    const labelCount: number = obj.labelCount;
    return new UserManagementInfo(
      user,
      uploadCount,
      labelCount
    );
  }
}

export default User;

export { UserManagementInfo };
