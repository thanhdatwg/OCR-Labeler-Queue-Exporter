import User from "../user";
import databaseConnection from "./database";

class UserDao {
    private constructor() { }
    private static readonly INSTANCE = new UserDao();
    public static getInstance(): UserDao {
        return this.INSTANCE;
    }

    public async getUserCount(): Promise<number> {
        try {
            const result = await databaseConnection.one("SELECT COUNT(*) FROM public.\"Users\";");
            return +result.count;
        } catch (e) {
            throw `[getUserCount()] Error happened while getting user count: ${e}`;
        }
    }

    public async getAllUser(): Promise<User[]> {
        try {
            const results = await databaseConnection.any("SELECT * FROM public.\"Users\";");
            const users: User[] = results.map(item => {
                delete item.password;
                return User.parseFromJson(item);
            });
            return users;
        } catch (e) {
            throw `[getAllUser()] Error happened while getting all user: ${e}`;
        }
    }

    public async getUser(username: string): Promise<User> {
        try {
            const user = await databaseConnection.oneOrNone(
                "SELECT * FROM public.\"Users\" WHERE username = $1;",
                [username]
            );
            if (!user) {
                return null;
            }
            delete user.password;
            return User.parseFromJson(user);
        } catch (e) {
            throw `[getUser()] Error happened while getting user: ${e}`;
        }
    }
}

export default UserDao;
