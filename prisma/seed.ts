import { CommentStatus, PrismaClient, PostStatus, PostType } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

const requiredEnv = (key: string, fallback?: string) => {
  const value = process.env[key] ?? fallback;

  if (!value) {
    throw new Error(`${key} is required`);
  }

  return value;
};

const main = async () => {
  const adminEmail = requiredEnv("ADMIN_EMAIL", "admin@example.com");
  const adminPassword = requiredEnv("ADMIN_PASSWORD", "change-me-please");

  const admin = await prisma.admin.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      name: "站点管理员",
      passwordHash: await hash(adminPassword, 12)
    }
  });

  const roots = [
    { name: "生活分享", slug: "life", description: "日常、旅行、美食与个人感悟", sort: 10 },
    { name: "猫咪萌照", slug: "cats", description: "猫咪图片、视频和成长记录", sort: 20 },
    { name: "摄影作品", slug: "photography", description: "高清摄影作品与参数记录", sort: 30 },
    { name: "技术文章", slug: "tech", description: "工程、AI、Linux 与工具分享", sort: 40 }
  ];

  const rootCategories = await Promise.all(
    roots.map((category) =>
      prisma.category.upsert({
        where: { slug: category.slug },
        update: category,
        create: category
      })
    )
  );

  const bySlug = new Map(rootCategories.map((category) => [category.slug, category.id]));
  const children = [
    ["life", "日常生活", "daily-life"],
    ["life", "旅行记录", "travel-notes"],
    ["life", "美食分享", "food"],
    ["life", "个人感悟", "thoughts"],
    ["cats", "日常", "cat-daily"],
    ["cats", "搞笑", "cat-funny"],
    ["cats", "成长记录", "cat-growth"],
    ["cats", "精选合集", "cat-collection"],
    ["photography", "风光", "landscape"],
    ["photography", "人文", "humanities"],
    ["photography", "城市", "city"],
    ["photography", "动物", "animals"],
    ["photography", "夜景", "night"],
    ["photography", "星空", "stars"],
    ["tech", "前端开发", "frontend"],
    ["tech", "后端开发", "backend"],
    ["tech", "AI", "ai"],
    ["tech", "Linux", "linux"],
    ["tech", "运维", "ops"],
    ["tech", "工具分享", "tools"]
  ] as const;

  await Promise.all(
    children.map(([parentSlug, name, slug], index) =>
      prisma.category.upsert({
        where: { slug },
        update: { name, parentId: bySlug.get(parentSlug), sort: index + 1 },
        create: { name, slug, parentId: bySlug.get(parentSlug), sort: index + 1 }
      })
    )
  );

  const samplePosts: Array<{
    title: string;
    slug: string;
    description: string;
    summary: string;
    content: string;
    type: PostType;
    categorySlug: string;
    coverImage: string;
    publishedAt: string;
    cameraModel?: string;
    lens?: string;
    aperture?: string;
    shutter?: string;
    iso?: string;
    focalLength?: string;
  }> = [
    {
      title: "清晨的窗边",
      slug: "morning-window",
      description: "一段普通清晨里的生活记录。",
      summary: "咖啡、光线和刚醒来的城市。",
      content: "今天的光线从窗帘边缘挤进来，像把一天慢慢打开。",
      type: PostType.TEXT,
      categorySlug: "daily-life",
      publishedAt: "2026-06-01T08:30:00.000Z",
      coverImage:
        "https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?auto=format&fit=crop&w=1200&q=80"
    },
    {
      title: "猫咪今天也很忙",
      slug: "busy-cat-day",
      description: "猫咪日常照片合集。",
      summary: "从晒太阳到巡视纸箱，猫咪的一天排得很满。",
      content: "今天的主角在阳台、沙发和纸箱之间完成了三次重要巡视。",
      type: PostType.GALLERY,
      categorySlug: "cat-daily",
      publishedAt: "2026-06-02T06:20:00.000Z",
      coverImage:
        "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=1200&q=80"
    },
    {
      title: "纸箱基地成立",
      slug: "cat-cardboard-base",
      description: "猫咪占领新纸箱的一天。",
      summary: "快递盒刚落地，基地就宣布成立。",
      content: "纸箱比猫窝更有吸引力，这件事今天再次得到了验证。",
      type: PostType.IMAGE,
      categorySlug: "cat-funny",
      publishedAt: "2026-05-29T11:00:00.000Z",
      coverImage:
        "https://images.unsplash.com/photo-1574144611937-0df059b5ef3e?auto=format&fit=crop&w=1200&q=80"
    },
    {
      title: "午后晒太阳",
      slug: "cat-afternoon-sun",
      description: "猫咪在阳台晒太阳。",
      summary: "一束光、一条毯子和一只不愿动的猫。",
      content: "阳台的光刚好落在毯子上，于是今天的午休地点就这么定了。",
      type: PostType.IMAGE,
      categorySlug: "cat-daily",
      publishedAt: "2026-05-25T05:40:00.000Z",
      coverImage:
        "https://images.unsplash.com/photo-1533743983669-94fa5c4338ec?auto=format&fit=crop&w=1200&q=80"
    },
    {
      title: "第一次戴小铃铛",
      slug: "cat-first-bell",
      description: "成长记录：第一次戴项圈。",
      summary: "走两步停一下，认真研究铃铛为什么会响。",
      content: "今天第一次戴上小铃铛，走路像自带背景音乐。",
      type: PostType.GALLERY,
      categorySlug: "cat-growth",
      publishedAt: "2026-05-18T09:10:00.000Z",
      coverImage:
        "https://images.unsplash.com/photo-1573865526739-10659fec78a5?auto=format&fit=crop&w=1200&q=80"
    },
    {
      title: "窗台观察员",
      slug: "cat-window-observer",
      description: "猫咪的窗台观察记录。",
      summary: "外面有风、树影和路过的人，观察员非常认真。",
      content: "窗台是今天的工作岗位，主要职责是看风吹树叶。",
      type: PostType.IMAGE,
      categorySlug: "cat-daily",
      publishedAt: "2026-05-10T02:15:00.000Z",
      coverImage:
        "https://images.unsplash.com/photo-1495360010541-f48722b34f7d?auto=format&fit=crop&w=1200&q=80"
    },
    {
      title: "沙发缝隙探险",
      slug: "cat-sofa-adventure",
      description: "一次认真但没必要的沙发探险。",
      summary: "发现了旧发圈，也发现了自己出不太来。",
      content: "沙发缝隙里藏着过去的发圈和今天的好奇心。",
      type: PostType.TEXT,
      categorySlug: "cat-funny",
      publishedAt: "2026-04-28T12:45:00.000Z",
      coverImage:
        "https://images.unsplash.com/photo-1592194996308-7b43878e84a6?auto=format&fit=crop&w=1200&q=80"
    },
    {
      title: "春天的精选九宫格",
      slug: "cat-spring-collection",
      description: "春天猫咪照片精选合集。",
      summary: "从窗边到地毯，挑出这个春天最可爱的几张。",
      content: "春天的光线很柔和，猫也更愿意配合镜头一点点。",
      type: PostType.GALLERY,
      categorySlug: "cat-collection",
      publishedAt: "2026-04-12T10:00:00.000Z",
      coverImage:
        "https://images.unsplash.com/photo-1519052537078-e6302a4968d4?auto=format&fit=crop&w=1200&q=80"
    },
    {
      title: "小猫长大一点点",
      slug: "cat-growing-little",
      description: "成长记录：体型和胆量都变大了。",
      summary: "胆子大了一点，跳上桌子的速度也快了一点。",
      content: "今天忽然发现它已经能轻松跳上桌子，成长来得安静但明显。",
      type: PostType.ARTICLE,
      categorySlug: "cat-growth",
      publishedAt: "2026-03-30T04:30:00.000Z",
      coverImage:
        "https://images.unsplash.com/photo-1574158622682-e40e69881006?auto=format&fit=crop&w=1200&q=80"
    },
    {
      title: "城市夜色练习",
      slug: "city-night-practice",
      description: "一组城市夜景摄影练习。",
      summary: "霓虹、雨后路面和慢门尝试。",
      content: "这组照片记录了雨后城市的反光和夜间行人的节奏。",
      type: PostType.IMAGE,
      categorySlug: "night",
      publishedAt: "2026-05-22T13:10:00.000Z",
      cameraModel: "Sony A7C II",
      lens: "35mm F1.8",
      aperture: "f/2.8",
      shutter: "1/60s",
      iso: "800",
      focalLength: "35mm",
      coverImage:
        "https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=1200&q=80"
    },
    {
      title: "Next.js 站点的内容模型",
      slug: "next-content-model",
      description: "用 Post 和 Category 承载多个内容板块。",
      summary: "个人站长期扩展时，统一内容模型比板块专表更稳。",
      content:
        "## 统一模型\n\n所有内容都抽象为 Post，通过 Category、Tag 和 type 区分业务展示。",
      type: PostType.ARTICLE,
      categorySlug: "frontend",
      publishedAt: "2026-05-20T07:00:00.000Z",
      coverImage:
        "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80"
    }
  ];

  for (const post of samplePosts) {
    const category = await prisma.category.findUniqueOrThrow({
      where: { slug: post.categorySlug }
    });
    const data = {
      title: post.title,
      slug: post.slug,
      description: post.description,
      summary: post.summary,
      content: post.content,
      type: post.type,
      coverImage: post.coverImage,
      cameraModel: post.cameraModel,
      lens: post.lens,
      aperture: post.aperture,
      shutter: post.shutter,
      iso: post.iso,
      focalLength: post.focalLength
    };
    const publishedAt = new Date(post.publishedAt);

    await prisma.post.upsert({
      where: { slug: data.slug },
      update: {
        ...data,
        status: PostStatus.PUBLISHED,
        publishedAt,
        categoryId: category.id,
        authorId: admin.id
      },
      create: {
        ...data,
        status: PostStatus.PUBLISHED,
        publishedAt,
        categoryId: category.id,
        authorId: admin.id
      }
    });
  }

  const sampleComments = [
    {
      postSlug: "busy-cat-day",
      nickname: "云朵",
      email: "cloud@example.com",
      content: "这张眼神太认真了，像在开家庭会议。"
    },
    {
      postSlug: "busy-cat-day",
      nickname: "小鱼干",
      email: "fish@example.com",
      content: "纸箱巡视员今天也辛苦啦。"
    },
    {
      postSlug: "cat-cardboard-base",
      nickname: "阿白",
      email: "abai@example.com",
      content: "基地成立得非常有仪式感。"
    },
    {
      postSlug: "cat-afternoon-sun",
      nickname: "午睡冠军",
      email: "nap@example.com",
      content: "阳光和猫真的很配。"
    },
    {
      postSlug: "cat-window-observer",
      nickname: "路过的树叶",
      email: "leaf@example.com",
      content: "观察员表情满分。"
    }
  ];

  for (const comment of sampleComments) {
    const post = await prisma.post.findUniqueOrThrow({
      where: { slug: comment.postSlug }
    });

    await prisma.comment.deleteMany({
      where: {
        postId: post.id,
        nickname: comment.nickname,
        content: comment.content
      }
    });

    await prisma.comment.create({
      data: {
        postId: post.id,
        nickname: comment.nickname,
        email: comment.email,
        content: comment.content,
        status: CommentStatus.APPROVED
      }
    });
  }
};

main()
  .catch((error: unknown) => {
    process.stderr.write(error instanceof Error ? error.message : "Seed failed");
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
