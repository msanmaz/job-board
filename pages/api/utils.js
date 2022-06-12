import prisma from 'lib/prisma'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.end()

  if (req.body.task === 'clean_database') {
    await prisma.job.deleteMany({})
    await prisma.user.deleteMany({})
  }

  res.end()
}