export interface User {
  id?: string;
  role?: string;
  email?: string;
  password?: string;
  username?: string;
  fullname?: string;
  totalChallengePoints?: number;
  completedChallenges?: Array<any>;
  createdAt?: string;
  updatedAt?: string;
}

export class UserModel {
  data: User;

  constructor(data: User) {
    this.data = data;
  }

  static fromApi(obj: any): UserModel {
    if (!obj) return new UserModel({});
    return new UserModel({
      id: obj.id ?? obj.userId ?? undefined,
      role: obj.role,
      email: obj.email ?? obj.username,
      password: obj.password,
      username: obj.username,
      fullname: obj.fullname ?? obj.fullName ?? obj.name ?? obj.displayName ?? obj.username,
      totalChallengePoints: obj.totalChallengePoints ?? obj.totalChallengePoints,
      completedChallenges: obj.completedChallenges ?? obj.completedChallenges ?? [],
      createdAt: obj.createdAt ?? obj.created_at,
      updatedAt: obj.updatedAt ?? obj.updated_at,
    });
  }

  toPlain(): User {
    return { ...this.data };
  }
}
