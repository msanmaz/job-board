import NextAuth from 'next-auth'
import EmailProvider from 'next-auth/providers/email'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from '../../../lib/prisma';

export default NextAuth({
  providers: [
    EmailProvider({
      server: process.env.EMAIL_SERVER,
      from: process.env.EMAIL_FROM
    }), CredentialsProvider({
        name: "Credentials",
        credentials: {
          username: { label: "email", type: "text", placeholder: "john@doe.com" },
          password: { label: "Password", type: "password" },
        },
        async authorize(credentials) {
  
          //Find user with the email  
          const result = await prisma.User.findUnique({
            where: {
              email: credentials.email,
            }
  
          });
  
          if (!result) {
            throw new Error('No user found with the email');
          }
          if (result !== null) {
            return result
          }
          //Check hased password with DB password
          const checkPassword = credentials.password === result.password
          //Incorrect password - send response
          if (!checkPassword) {
            throw new Error('Password doesnt match');
          }
  
          return null
        },
      })
  ],

  database: process.env.DATABASE_URL,
  secret: process.env.SECRET,

  session: {
    jwt: true,
    maxAge: 30 * 24 * 60 * 60 // 30 days
  },

  debug: true,
  adapter: PrismaAdapter(prisma),
	
	callbacks: {
    session: async ({ session, user }) => {
      session.user.id = user.id
      return Promise.resolve(session)
    },
  },
})