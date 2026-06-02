"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const AdminLoginForm = () => {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  return (
    <form
      className="space-y-4"
      onSubmit={async (event) => {
        event.preventDefault();
        setError("");
        setIsSubmitting(true);
        const formData = new FormData(event.currentTarget);

        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: formData.get("email"),
            password: formData.get("password")
          })
        });

        setIsSubmitting(false);

        if (!response.ok) {
          setError("登录失败，请检查邮箱和密码。");
          return;
        }

        router.push("/admin");
        router.refresh();
      }}
    >
      <Input name="email" type="email" placeholder="管理员邮箱" required />
      <Input name="password" type="password" placeholder="密码" required minLength={8} />
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "登录中..." : "登录"}
      </Button>
      {error ? <p className="text-sm text-muted-foreground">{error}</p> : null}
    </form>
  );
};
