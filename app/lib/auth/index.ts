import { prisma } from "@/clients/db";
import { NextAuthOptions } from "next-auth";
import GoogleProvider, { GoogleProfile } from "next-auth/providers/google";
import GithubProvider, { GithubProfile } from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
import { checkPassword } from "@/utils/helpers";
import { createUser } from "@/utils/helpers";

export const runtime = "edge";
//

//
export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      // @ts-ignore
      async profile(profile: GoogleProfile) {
        //

        const { given_name, family_name, email } = profile;
        // finding user in db
        const userInDb = await prisma.user.findUnique({
          where: { email: email! },
        });
        //
        if (userInDb) {
          return {
            ...profile,
            id: userInDb.id,
            name: `${userInDb.name}`,
            avatar_url: profile.picture,
          };
        }
        //
        // creating user when user login in for first time

        const createdUser = await createUser("google", {
          email,
          name: `${given_name} ${family_name}`,
        });
        return {
          ...profile,
          id: createdUser.id,
          name: createdUser.name,
        };
        //
      },
      //
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),

    GithubProvider({
      // @ts-ignore
      async profile(profile: GithubProfile, token) {
        //
        const { name, email, login } = profile;
        // finding user in db
        const userInDb = await prisma.user.findUnique({
          where: { email: email! },
        });
        if (userInDb) {
          return {
            ...profile,
            id: userInDb.id,
          };
        }
        // creating user when user login in for first time
        const createdUser = await createUser("github", {
          email: `${email}`,
          name: `${name}`,
        });
        return {
          ...profile,
          id: createdUser.id,
        };
        //
      },
      //
      clientId: process.env.GITHUB_ID as string,
      clientSecret: process.env.GITHUB_SECRET as string,
    }),
    CredentialsProvider({
      credentials: {
        email: {},
        password: {},
      },
      async authorize(credentials, req): Promise<any> {
        try {
          // finding user in Db
          const userInDb = await prisma.user.findUnique({
            where: { email: credentials?.email },
          });
          //
          if (!userInDb) {
            throw Error("User not found");
          }
          //
          const isPasswordValid = await checkPassword(
            credentials?.password!,
            userInDb.password!
          );
          //
          if (!isPasswordValid) throw Error("Incorrect password");
          // deleting user password and returning it to the callback
          userInDb.password = "";
          return userInDb;
        } catch (e: any) {
          throw Error(e);
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account, user }) {
      if (user && account) {
        token.userId = user?.id as string;
        token.imageUrl = user?.avatar_url;
        token.email = user.email;
        token.userAuthToken = account?.access_token;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.userAuthToken = token.userAuthToken;
      session.user.userId = token.userId;
      session.user.imageUrl = token.imageUrl;
      session.user.email = token?.email;
      return session;
    },
  },
  secret: process.env.NEXT_AUTH_SECRET,
  pages: { signIn: "/login" },
};
