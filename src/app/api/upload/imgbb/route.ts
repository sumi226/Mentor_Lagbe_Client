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

    let imageUrl: string | null = null;

    try {
      const imgbbForm = new FormData();
      imgbbForm.append("image", file);

      const res = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
        method: "POST",
        body: imgbbForm,
      });

      const data = await res.json().catch(() => ({}));
      if (res.ok && data?.success && (data?.data?.display_url || data?.data?.url)) {
        imageUrl = data.data.display_url || data.data.url;
      } else {
        console.warn("[imgbb] API response failed, using graceful fallback:", data?.error?.message);
      }
    } catch (apiErr) {
      console.warn("[imgbb] fetch error:", apiErr);
    }

    // If ImgBB returned a valid hosted URL, return it
    if (imageUrl) {
      return NextResponse.json({ url: imageUrl, source: "imgbb" });
    }

    // Graceful fallback to data URI so direct file upload never fails or breaks for the user
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const mimeType = (file as File).type || "image/jpeg";
    const dataUri = `data:${mimeType};base64,${buffer.toString("base64")}`;

    return NextResponse.json({ url: dataUri, source: "fallback" });
  } catch (error) {
    console.error("[imgbb] error:", error);
    return NextResponse.json({ error: "Failed to upload image" }, { status: 500 });
  }
}
