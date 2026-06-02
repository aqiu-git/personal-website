"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";

type AdminPostActionsProps = {
  postId: string;
};

export const AdminPostActions = ({ postId }: AdminPostActionsProps) => {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  return (
    <Button
      type="button"
      size="sm"
      variant="outline"
      disabled={isDeleting}
      onClick={async () => {
        if (!window.confirm("确定删除这篇内容吗？")) {
          return;
        }

        setIsDeleting(true);
        await fetch(`/api/posts?id=${postId}`, {
          method: "DELETE"
        });
        setIsDeleting(false);
        router.refresh();
      }}
    >
      {isDeleting ? "删除中..." : "删除"}
    </Button>
  );
};
