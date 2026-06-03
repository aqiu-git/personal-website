"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const AdminPasswordForm = () => {
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  return (
    <form
      className="grid max-w-xl gap-4 rounded-3xl border border-sky-100 bg-sky-50/70 p-5 shadow-sm shadow-sky-100/60"
      onSubmit={async (event) => {
        event.preventDefault();
        setMessage("");

        const form = event.currentTarget;
        const formData = new FormData(form);
        const currentPassword = formData.get("currentPassword")?.toString() ?? "";
        const newPassword = formData.get("newPassword")?.toString() ?? "";
        const confirmPassword = formData.get("confirmPassword")?.toString() ?? "";

        if (newPassword !== confirmPassword) {
          setMessage("两次新密码不一致。");
          return;
        }

        setIsSubmitting(true);
        const response = await fetch("/api/auth/password", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            currentPassword,
            newPassword
          })
        });
        setIsSubmitting(false);

        if (!response.ok) {
          setMessage("修改失败，请检查旧密码和新密码长度。");
          return;
        }

        form.reset();
        setMessage("密码已更新，下次登录请使用新密码。");
      }}
    >
      <div className="space-y-1">
        <p className="text-sm font-medium text-sky-500">Security</p>
        <h2 className="text-2xl font-semibold tracking-normal">修改密码</h2>
        <p className="text-sm text-muted-foreground">新密码至少 10 位，别用太好猜的。</p>
      </div>
      <Input
        name="currentPassword"
        type="password"
        placeholder="当前密码"
        required
        minLength={8}
        className="rounded-2xl border-sky-100 bg-white/90 focus-visible:ring-sky-200"
      />
      <Input
        name="newPassword"
        type="password"
        placeholder="新密码，至少 10 位"
        required
        minLength={10}
        className="rounded-2xl border-sky-100 bg-white/90 focus-visible:ring-sky-200"
      />
      <Input
        name="confirmPassword"
        type="password"
        placeholder="再输入一次新密码"
        required
        minLength={10}
        className="rounded-2xl border-sky-100 bg-white/90 focus-visible:ring-sky-200"
      />
      <div className="flex flex-wrap items-center gap-3">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="rounded-full bg-blue-500 px-6 hover:bg-blue-600"
        >
          {isSubmitting ? "保存中..." : "保存新密码"}
        </Button>
        {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
      </div>
    </form>
  );
};
