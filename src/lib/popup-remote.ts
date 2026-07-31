import { getBrowserSupabase } from "@/lib/supabase/client";
import type { PopupRecord } from "@/lib/popup";

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
    const imageUrl = supabase.storage.from("popups").getPublicUrl(data.image_path).data.publicUrl;
    return {
      id: data.id,
      imageUrl,
      imageAlt: data.image_alt,
      linkUrl: data.link_url,
    };
  } catch {
    return null;
  }
}
