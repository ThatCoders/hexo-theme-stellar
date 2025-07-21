---
wiki: load-balance
layout: wiki
title: Cloudflare 部署
---

> Cloudflare Pages 是 Cloudflare 推出的 JAMstack 静态站点托管平台，具有全球加速和 Cloudflare 安全防护。
> - 点击注册 [Cloudflare Signup](https://dash.cloudflare.com/sign-up)

## 部署博客

1. 打开 Pages 控制台 [Cloudflare Pages](https://dash.cloudflare.com/?to=/:account/pages)
    - 第一次访问会提示绑定 GitHub 账号
2. 点击 **Create a project** 或者右侧菜单的 **Workers**
    - 因为推送的是静态仓库，均选择部署 **Pages**
    - 来源为 Repository
3. 选择 GitHub 仓库
    - 搜索仓库： {name}.github.io
4. 配置构建参数
    - 默认配置即可，直接 **Save Deploy**。Hexo源码同学需要填写构建命令和发布目录
    - Project name：可选
    - Build command：`hexo generate` 或留空（若预先构建）
    - Output directory：`public` 或 `dist`
    - Framework preset 选择 `None`
    - 点击 **Deploy**
5. 几秒后部署完成 🎉
    - 默认域名：`{project}.pages.dev`

## 自定义域名

1. 在项目面板上方菜单栏有 **domains**
2. 点击 **Set up a custom domain**
3. 添加你的域名（如 `blog.example.com`）
4. 根据提示去域名运营商添加 CNAME 指向

{% image https://upyun.thatcdn.cn/myself/typora/BLOG-CDN-CF.png CloudflarePages域名操作 ratio:2906/1023 %}
