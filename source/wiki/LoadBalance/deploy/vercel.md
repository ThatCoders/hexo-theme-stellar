---
wiki: load-balance
layout: wiki
title: Vercel 部署
---

> Vercel 是一个用于部署和托管 Web 应用程序的平台。Vercel 支持将您的应用程序部署到自定义域名上。
> - 点击注册 [Vercel Signup](https://vercel.com/signup)

## 部署博客

1. 打开创建项目面板 [Vercel New](https://vercel.com/new)
    - 第一次需要在该页面进行 Github 授权
2. 选择 GitHub 仓库
    - 搜索仓库： {name}.github.io
3. 填写项目信息
    - 项目名称： {name}
    - 默认即可，自定义域名在后面配置
    - 填写完项目信息点击 **Deploy**
4. 因为是静态不需要构建，数秒后会有🎉表示部署成功
    - 访问分配的域名
    - 一般是 {name}.vercel.app

## 自定义域名

1. 在首页点击项目
2. 进入上方面包屑菜单栏的 Setting
3. 选择左侧的 Domain
    - 添加自定义域名
    - 或者修改默认分配的子域名
4. 自定义域名需要到域名运营商添加 CNAME 解析，按照 Vercel 提供的 CNAME 解析添加
{% image https://upyun.thatcdn.cn/myself/typora/BLOG-CDN-VERCEL.png Vercel域名操作 ratio:2869/1385 %}