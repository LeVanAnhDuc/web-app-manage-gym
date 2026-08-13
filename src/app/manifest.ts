import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Gym của tôi",
    short_name: "Gym",
    description: "Quản lý tập luyện và dinh dưỡng cá nhân",
    start_url: "/",
    display: "standalone",
    background_color: "#EFEDE7",
    theme_color: "#EFEDE7",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" }],
  };
}
