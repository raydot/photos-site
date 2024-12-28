import { NextRequest, NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"
import fs from "fs/promises"
import path from "path"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = await getToken({ req: request })
    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const fileId = await Promise.resolve(params.id)
    const filepath = path.join(
      process.cwd(),
      "public",
      "photos",
      "originals",
      `${fileId}.jpg`
    )

    try {
      await fs.access(filepath)
    } catch {
      return NextResponse.json({ error: "File not found" }, { status: 404 })
    }

    const file = await fs.readFile(filepath)
    const headers = new Headers()
    headers.set("Content-Type", "image/jpeg")
    headers.set("Content-Disposition", `attachment; filename="${fileId}.jpg"`)

    return new NextResponse(file, { headers })
  } catch (error) {
    console.error("Error downloading photo:", error)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
}
