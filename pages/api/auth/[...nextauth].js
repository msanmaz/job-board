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
          console.log(credentials)
          //Find user with the email  
          const result = await prisma.user.findUnique({
            where: {
              email: credentials.username,
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


  session: {
    strategy:'jwt'
  },
  jwt: {
    secret: process.env.SECRET,
    encryption:true,
  },

  debug: true,
  adapter: PrismaAdapter(prisma),
	
	callbacks: {
    jwt:async ({token,user}) => {
      console.log('token in jwt',token)
      console.log('user in jwt',user)

      if (user) {
        token.sub = user.id
        token.name = user.name
        token.email = user.email
        token.picture = user.image
        
      }
      return Promise.resolve(token);
    },
    session: async ({ session,token, user }) => {
      if (!session) return null
      session.email = token.email
      session.name = token.name
      session.jti = token.jti
      session.user.id = token.sub
      return Promise.resolve(session)
    },
  },
})