import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"
import fs from "fs/promises"
import path from "path"

type RouteProps = {
  params: { id: string }
  searchParams: { [key: string]: string | string[] | undefined }
}

export async function GET(
  request: NextRequest,
  { params }: RouteProps
): Promise<NextResponse> {
  try {
    const token = await getToken({ req: request })
    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const filepath = path.join(
      process.cwd(),
      "public",
      "photos",
      "originals",
      `${params.id}.jpg`
    )

    try {
      await fs.access(filepath)
    } catch {
      return NextResponse.json({ error: "File not found" }, { status: 404 })
    }

    const file = await fs.readFile(filepath)
    const headers = new Headers()
    headers.set("Content-Type", "image/jpeg")
    headers.set(
      "Content-Disposition",
      `attachment; filename="${props.params.id}.jpg"`
    )

    return new NextResponse(file, { headers })
  } catch (error) {
    console.error("Error downloading photo:", error)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
}
