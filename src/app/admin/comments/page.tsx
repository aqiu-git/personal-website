import { redirect } from "next/navigation";

const AdminCommentsPage = () => {
  redirect("/admin/posts#comments");
};

export default AdminCommentsPage;
