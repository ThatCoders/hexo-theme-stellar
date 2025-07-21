---
wiki: load-balance
layout: wiki
title: 部署前置
---

## Git 配置 SSH 公钥

> - 本文默认会基本使用 Hexo(或其它静态博客框架) 并能成功运行(哪怕是demo)。 不会的点击学习 [Hexo官方](https://hexo.io/zh-cn/index.html)
> - 本文默认已经创建 Gitee/GitHub 帐号 没有的去认证
> - {name}: 你的GitHub/Gitee帐号名称
> - {email}: 你的GitHub/Gitee邮箱

1. 配置ssh账户与邮箱
    ```bash 本地Git账号配置
      # 配置邮箱与用户名
      git config --global user.email {email}
      git config --global user.name {name}
      
      # 查看邮箱与用户名
      git config --global user.name
      git config --global user.email
    ```
2. 生成ssh公钥
    ```bash 生成ssh公钥
      ssh-keygen -t rsa -C "thatcoder@163.com" # 一直回车
    ```
3. 查看ssh公钥
    ```bash 添加ssh公钥
     cat ~/.ssh/id_rsa.pub | pbcopy
    ```
4. 添加ssh公钥
    - Gitee: [Gitee SSH](https://gitee.com/profile/sshkeys)
    - GitHub: [GitHub SSH](https://github.com/settings/keys)
5. 测试ssh
    ```bash 测试ssh
    ssh -T git@github.com
    # 测试成功
    # Hi thatcoder! You've successfully authenticated, but GitHub does not provide shell access.
    ```

## 创建Git仓库
> 创建一个放置博客框架生成产物的仓库，比如叫 {name}.github.io

- Gitee: [Gitee 创建仓库](https://gitee.com/new)
- GitHub: [GitHub 创建仓库](https://github.com/new)

## 博客配置Git仓库
1. 安装依赖
    ```bash 安装依赖
    npm install hexo-deployer-git --save
    ```
2. 修改博客配置
    ```yml _config.yml
    deploy:
      type: 'git'
      repository:
      github: git@github.com:ThatCoders/{name}.github.io.git
    #    gitee: git@gitee.com:thatcoder/thatcoder.git
      branch:
        github: master
    #    gitee: master
      message: 自动提交
    ```
3. 测试
    ```bash 构建推送
    hexo c && hexo g -d && hexo s
    # 创建的仓库会接收到推送，覆盖仓库内容
    ```

## 部署方式
> 根据自己喜好选择一个托管平台，也能自己服务器部署。
{% link https://blog.thatcoder.cn/wiki/LoadBalance/deploy/vercel.html Vercel %}
{% link https://blog.thatcoder.cn/wiki/LoadBalance/deploy/netlify.html Netlify %}
{% link https://blog.thatcoder.cn/wiki/LoadBalance/deploy/cloudflare.html CloudFlare %}

## 视频讲解
> 因为对于服务器新手配置可能过于宽泛与繁琐，录制了视频作为参考。

[//]: # (https://www.bilibili.com/video/BV1FdN2zFEoP/)
<iframe src="//player.bilibili.com/player.html?bvid=BV1FdN2zFEoP" allowfullscreen="allowfullscreen" width="100%" height="500" scrolling="no" frameborder="0" sandbox="allow-top-navigation allow-same-origin allow-forms allow-scripts"></iframe>
