import { Post, PostListResponse } from "@/types/Post";
import { PostType } from "@/types/PostType";

export const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5144/api/";

export class ApiError extends Error {
    status: number;

    constructor(status: number, message: string) {
        super(message);
        this.name = "ApiError";
        this.status = status;
    }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
    const url = new URL(path, API_BASE_URL);

    const response = await fetch(url, {
        ...init,
        headers: {
            "Content-Type": "application/json",
            ...init?.headers,
        },
    });

    if (!response.ok) {
        throw new ApiError(
            response.status,
            `${init?.method ?? "GET"} ${url.pathname} falhou com ${response.status}`,
        );
    }

    if (response.status === 204) {
        return undefined as T;
    }

    return response.json() as Promise<T>;
}


export function getTypePosts(init?: RequestInit) {
    return request<PostType[]>("PostType", init);
}

export function getPost(init?: RequestInit, id?: string) {
    return request<Post>("Post/" + id, init);
}

export function getPostsByType(
    postTypeName: string,
    params?: { page?: number; pageSize?: number },
    init?: RequestInit,
) {
    const query = new URLSearchParams();

    if (params?.page) {
        query.set("page", String(params.page));
    }

    if (params?.pageSize) {
        query.set("pageSize", String(params.pageSize));
    }

    const search = query.toString();
    const path = `Post/type/${encodeURIComponent(postTypeName)}${search ? `?${search}` : ""}`;

    return request<PostListResponse>(path, init);
}
