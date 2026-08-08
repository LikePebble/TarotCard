import { getBrowserSupabase } from "@/lib/supabase/client";
import { safePopupImagePath, safePopupLinkUrl, type PopupRecord } from "@/lib/popup";

export async function fetchHomePopup(): Promise<PopupRecord | null> {
  const supabase = getBrowserSupabase();
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from("popups")
      .select("id, image_path, image_alt, link_url")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error || !data) return null;
    const imagePath = safePopupImagePath(data.image_path);
    const imageAlt = typeof data.image_alt === "string" ? data.image_alt.trim() : "";
    if (!imagePath || !imageAlt) return null;
    const imageUrl = supabase.storage.from("popups").getPublicUrl(imagePath).data.publicUrl;
    return {
      id: data.id,
      imageUrl,
      imageAlt,
      linkUrl: safePopupLinkUrl(data.link_url),
    };
  } catch {
    return null;
  }
}
