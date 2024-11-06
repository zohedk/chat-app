import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      userId: string;
      userAuthToken?: string;
      imageUrl?: string;
      name: string;
      email: string;
    };
  }
  interface User {
    login: string;
    avatar_url: string;
    id: number;
    name: string;
    email: string;
    authType: string;
    password: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId: string;
    userAuthToken?: string;
    imageUrl?: string;
    email: string;
  }
}
