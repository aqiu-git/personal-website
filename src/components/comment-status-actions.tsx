"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";

type CommentStatusActionsProps = {
  commentId: string;
  highlighted: boolean;
};

type PendingAction = "highlight" | "delete" | null;

export const CommentStatusActions = ({ commentId, highlighted }: CommentStatusActionsProps) => {
  const router = useRouter();
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        type="button"
        size="sm"
        variant={highlighted ? "secondary" : "outline"}
        disabled={pendingAction !== null}
        onClick={async () => {
          setPendingAction("highlight");
          await fetch(`/api/comments/${commentId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ highlighted: !highlighted })
          });
          setPendingAction(null);
          router.refresh();
        }}
      >
        {pendingAction === "highlight" ? "处理中..." : highlighted ? "取消点亮" : "点亮"}
      </Button>
      <Button
        type="button"
        size="sm"
        variant="outline"
        disabled={pendingAction !== null}
        onClick={async () => {
          if (!window.confirm("确定删除这条评论吗？")) {
            return;
          }

          setPendingAction("delete");
          await fetch(`/api/comments/${commentId}`, {
            method: "DELETE"
          });
          setPendingAction(null);
          router.refresh();
        }}
      >
        {pendingAction === "delete" ? "删除中..." : "删除"}
      </Button>
    </div>
  );
};
