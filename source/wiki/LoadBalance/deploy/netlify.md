---
wiki: load-balance
layout: wiki
title: Netlify 部署
---

> Netlify 是一个支持持续部署和全球 CDN 的静态站点托管平台，适合 Hexo 等静态博客项目部署。
> - 点击注册 [Netlify Signup](https://app.netlify.com/signup)

## 部署博客

1. 打开创建站点面板 [Netlify New](https://app.netlify.com/start)
    - 第一次需要进行 GitHub 授权
2. 选择 GitHub 仓库
    - 搜索仓库： {name}.github.io
3. 填写站点信息
    - 推送的是静态文件直接 **Deploy site**，推送的是Hexo博客项目源码则需要填写构建命令和发布目录
    - Site name 可选，默认自动生成
    - 构建命令填写：`hexo generate` 或留空（如果已经是静态目录）
    - 发布目录：`public` 或 `dist`
    - 填写完点击 **Deploy site**
4. 几秒钟后站点部署完成 🎉
    - 默认域名为：{random-name}.netlify.app

## 自定义域名

1. 进入站点控制台
2. 左侧导航栏选择 **Domain**
3. 点击 **Add custom domain**
    - 输入你的域名（如 `blog.example.com`）
    - Netlify 会提示你配置 DNS
4. 到你的域名服务商添加 CNAME 指向：

{% image https://upyun.thatcdn.cn/myself/typora/BLOG-CDN-NETLIFY.png Netlify域名操作 ratio:2984/879 %}
