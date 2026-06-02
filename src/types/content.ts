export const postTypes = ["TEXT", "IMAGE", "GALLERY", "VIDEO", "ARTICLE"] as const;
export const postStatuses = ["DRAFT", "PUBLISHED", "ARCHIVED"] as const;
export const commentStatuses = ["PENDING", "APPROVED", "REJECTED", "SPAM"] as const;

export type PostTypeValue = (typeof postTypes)[number];
export type PostStatusValue = (typeof postStatuses)[number];
export type CommentStatusValue = (typeof commentStatuses)[number];
