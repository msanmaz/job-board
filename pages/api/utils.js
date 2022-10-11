import prisma from '../../lib/prisma'
import { faker } from '@faker-js/faker'

const generateFakeJob = (user) => ({
  title: faker.company.catchPhrase(),
  description: faker.lorem.paragraphs(),
  author: {
    connect: { id: user.id },
  },
})

export default async function handler(req, res) {
  res.send({name:"handan"})
  res.end()
}