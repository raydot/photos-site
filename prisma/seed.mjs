import pkg from "@prisma/client"
const { PrismaClient } = pkg

const prisma = new PrismaClient()

async function main() {
  await prisma.user.upsert({
    where: { email: "daveytm1441@gmail.com" },
    update: {},
    create: {
      email: "moatgoat@hotmail.com",
      password: process.env.VISITOR_PASSWORD || "",
      role: "visitor",
    },
  })

  await prisma.user.upsert({
    where: { email: "daveytm1441@gmail.com" },
    update: {},
    create: {
      email: "daveytm1441@gmail.com",
      password: process.env.UPLOAD_PASSWORD || "",
      role: "uploader",
    },
  })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
