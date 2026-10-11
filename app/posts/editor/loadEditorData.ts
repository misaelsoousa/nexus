import { getLanguages, getMedias, getPosts, getPostType, getPostTypes } from "@/lib/api";
import type { Language } from "@/types/Language";
import type { Media } from "@/types/Media";
import type { PostSummary } from "@/types/Post";
import type { PostTypeDetails } from "@/types/PostType";

export async function loadEditorData(withPostTypes: boolean) {
    const [postTypes, medias, posts, languages] = await Promise.all([
        withPostTypes ? getPostTypes().then((items) => Promise.all(items.map((item) => getPostType(item.id)))) : Promise.resolve([]),
        getMedias().catch((): Media[] => []),
        getPosts({ pageSize: 100 }).then((result) => result.posts).catch((): PostSummary[] => []),
        getLanguages().catch((): Language[] => []),
    ]);

    return { postTypes: postTypes as PostTypeDetails[], medias, posts, languages };
}
