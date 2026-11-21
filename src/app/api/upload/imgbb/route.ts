import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("image");

    if (!file || typeof file === "string") {
      return NextResponse.json({ error: "No image file provided" }, { status: 400 });
    }

    const apiKey =
      process.env.IMGBB_API_KEY ||
      process.env.NEXT_PUBLIC_IMGBB_API_KEY ||
      "87f61c390a3ea8cb6a2b85e0534be01c";

    const imgbbForm = new FormData();
    imgbbForm.append("image", file);

    const res = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
      method: "POST",
      body: imgbbForm,
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok || !data?.success) {
      console.error("[imgbb] upload failed:", data);
      return NextResponse.json(
        { error: data?.error?.message ?? "ImgBB upload failed" },
        { status: 502 }
      );
    }

    const imageUrl = data?.data?.display_url || data?.data?.url;
    return NextResponse.json({ url: imageUrl });
  } catch (error) {
    console.error("[imgbb] error:", error);
    return NextResponse.json({ error: "Failed to upload image" }, { status: 500 });
  }
}
