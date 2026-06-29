/* =========================================================
   作品数据
   —— 内容依据《游戏与工具作品集》文档整理。
      游戏封面已替换为真实截图；工具封面暂用占位图，
      后续补 1 张 16:10 的界面截图即可替换。

   每个项目字段说明：
     title : 项目名称
     badge : 封面左上角小标签（如 "主打 / VR / 工具"）
     cover : 封面图路径（assets/img/ 下，支持 jpg/png/gif/svg）
     tags  : 技术 / 角色标签数组
     desc  : 一两句简介
     links : 链接数组，每项 { label, url }
   ========================================================= */
const PROJECTS = [
  {
    title: "Area Grid",
    badge: "主打",
    cover: "./assets/img/数独d.png",
    tags: ["逻辑解谜", "数独创新", "独立开发", "AI 辅助"],
    desc: "以数独为基础进行创新的极简解谜游戏，将逻辑推理、区域规划与色彩识别融合在同一套谜题中。独立完成开发，并借助 AI 辅助实现与迭代。",
    links: [
      { label: "试玩 Demo ↗", url: "https://liuxuan134679.itch.io/area-grid", primary: true },
      { label: "GitHub ↗", url: "https://github.com/Liuxuan134679/game-tool" },
    ],
  },
  {
    title: "奇境岛游乐园",
    badge: "VR",
    cover: "./assets/img/游乐园.png",
    tags: ["VR", "沉浸式体验", "交互开发", "团队项目"],
    desc: "沉浸式 VR 游乐园体验，围绕虚拟乐园空间组织探索、游玩与互动，强调 VR 中的空间临场感。3 人团队，主要负责辅助程序，参与交互与功能实现。",
    links: [
      { label: "GitHub ↗", url: "https://github.com/Liuxuan134679/game", primary: true },
    ],
  },
  {
    title: "关卡配置工具",
    badge: "工具",
    cover: "./assets/img/cover-3.svg",
    tags: ["编辑器工具", "可视化配置", "关卡编辑", "效率"],
    desc: "用于可视化关卡配置的工具，把关卡编辑从手动改参数转为界面化配置，让关卡参数与内容结构的整理、查看和调整更直观，提升制作效率与可读性。独立开发。",
    links: [
      { label: "GitHub ↗", url: "https://github.com/Liuxuan134679/lx666", primary: true },
    ],
  },
];
