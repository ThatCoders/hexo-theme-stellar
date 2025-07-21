---
wiki: load-balance
layout: wiki
title: 负载均衡
---

> 有没有从购买服务器开始的？想知道同学花了多久到这节。
> 
> 博主六年前第一次购买服务器到创建一个静态网站足足花了一整天！

## 视频讲解
> 因为对于服务器新手配置可能过于宽泛与繁琐，录制了视频作为参考。

[//]: # (https://www.bilibili.com/video/BV1FdN2zFEoP/)
<iframe src="//player.bilibili.com/player.html?bvid=BV1FdN2zFEoP" allowfullscreen="allowfullscreen" width="100%" height="500" scrolling="no" frameborder="0" sandbox="allow-top-navigation allow-same-origin allow-forms allow-scripts"></iframe>

## 固定平台代理
> 因各平台分配的域名能解析若干IP，需要引入中间层做SNI回源固定。
> 
> 举例代理是 Vercel 平台的 thatcoder.vercel.app, 固定到 127.0.0.1:881 下面，这样就不会出现域名解析错误。

1. 进入面板网站菜单，点击“创建网站”；
     - 类型选择“反向代理”；
     - 域名填写 127.0.0.1 端口填写 881；
     - 反向代理域名为 `thatcoder.vercel.app`；
     - 反向代理类型选 `https`
2. 进入 127.0.0.1:881 的配置页面，选择 "反向代理" 点击编辑
    - 后端域名：`thatcoder.vercel.app`；
    - 回源SNI开启
    - proxy_ssl_name：`thatcoder.vercel.app`；
3. 其它平台如法炮制，注意127.0.0.1后面的端口需要依次往后加。
4. 最后大概是这个样子：
    - 127.0.0.1:881 -> vercel
    - 127.0.0.1:882 -> netlify
    - 127.0.0.1:883 -> cloudflare


## 创建网站

> 假设你博客准备用域名 `blog.example.com`

1. 将博客域名 A 记录解析至你的公网 IP，例如将 `blog.example.com` 指向 `{ip}`；
2. 为确保服务器配置无误，可先创建一个测试站点进行初步验证：

   - 进入面板网站菜单，点击“创建网站”；
   - 类型选择“静态网站”；
   - 填写反向代理域名为 `blog.example.com`；
   - 创建完成后尝试访问该地址，若显示恭喜信息，说明网络与解析均已生效。

3. 删除测试站点，开始创建用于反向代理的正式站点：

   - 类型选择“反向代理”；
   - 域名填写 `blog.example.com`；
   - 暂以 `blog.thatcoder.cn` 作为代理地址，以防页面报错；

## 配置负载均衡
1. 在面板中选择“负载均衡”模块，点击“创建”；
2. 填写以下参数：
   - 名称：blog （后续反向代理中使用的名称）
   - 算法：建议选择 **IP Hash**，测试中稳定性良好；
   - 地址：`127.0.0.1:881`
   - 权重：控制访问分配比例，默认为 1，可根据平台稳定性酌情调整；
   - 最大失败次数：若节点连续失败 N 次，则切换至其他节点；
   - 最大连接数：设为 1000 足矣，后续可按需调节。
3. 如法炮制，添加更多固定下来的127节点，根据平台稳定性调整权重。

代码大概长这样
```conf 上游负载配置
upstream blog {
    ip_hash; 
    server 127.0.0.1:881 max_conns=1000 max_fails=2 weight=2; 
    server 127.0.0.1:882 max_conns=1000 max_fails=2 weight=1;
    server 127.0.0.1:883 max_conns=1000 max_fails=2 weight=1; 
}
```

## 添加上游映射

> 我们是127本地固定的，http请求也安全，可以不设置 SNI 与 Host 映射，但可以设置响应体看看映射的平台情况。

1. 切换到配置文件，在负载均衡页面靠近上方有菜单 "基本"、"日志"、"配置文件"
2. 在最上方添加如下配置（按你的平台域名调整）

```conf 上游节点映射
map $upstream_addr $platform_name {
    127.0.0.1:881 Vercel; 
    127.0.0.1:882 Netlify; 
    127.0.0.1:883 CloudFlare; 
}
```

## 开启SSL

> 开启 HTTPS 是反向代理 HTTPS 流量的前提，建议部署前一并配置

1. 进入“网站”模块下的“证书”菜单；
2. 配置 DNS 提供商的 API 信息与 ACME 账户（用于自动申请证书）；
3. 申请证书
   - 填写主域名为 `blog.example.com`
   - ✅自动续签
   - ✅跳过DNS校验，因为非常耗时
4. 回到网站配置页
   - HTTPS
   - 启动HTTPS
   - Acme账号：刚刚的
   - 证书选择：选择刚刚申请的证书

## 修改反向代理

1. 回到网站配置，进入“基本设置”中的“反向代理”模块；
2. 点击源文进行编辑，因为很多配置是面板不支持填写的。
3. 修改如下代码，根据你的平台域名去设置，保持格式一致（按照教程的话不用修改）

```conf 负载均衡配置
location ^~ / {
    proxy_pass http://blog; 
    proxy_set_header X-Real-IP $remote_addr; 
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for; 
    proxy_set_header REMOTE-HOST $remote_addr; 
    proxy_set_header Upgrade $http_upgrade; 
    proxy_set_header Connection $http_connection; 
    proxy_set_header X-Forwarded-Proto $scheme; 
    proxy_set_header X-Forwarded-Port $server_port; 
    proxy_set_header Host $host; 
    # SSL
    proxy_http_version 1.1; 
    proxy_ssl_server_name off; 
    # ERROR
    proxy_next_upstream error timeout invalid_header http_403 http_404 http_502 http_503 http_504;
    proxy_next_upstream_tries 3;
    # HEAD
    add_header Thinks $platform_name always; 
}
```

## 测试
> 经实测，Vercel、Netlify、CF 等平台可正常代理，GitHub Pages 在某些路径下可能返回 404，疑因 Host 校验机制较为严格，暂未深入研究。

1. 使用无痕模式（Ctrl + Shift + N）打开浏览器，防止缓存干扰；
2. 使用在线测速工具测试全网访问情况，观察是否存在非 200 状态响应；
3. 如有额外问题或平台兼容性疑问，欢迎在评论区提出。

### HEADER 头测试

```bash CMD测试
curl -I https://blog.thatcoder.cn
# 修改为你的域名，会出现如下关键字
# Thinks: Vercel
```
{% image https://upyun.thatcdn.cn/myself/typora/3e26f5648c377da1226bfb758d89d4a9.png CMD测试 ratio:1073/1554 %}

### 网站测速

{% tabs %}
<!-- tab 国内 -->
{% image https://upyun.thatcdn.cn/myself/typora/BLOG-CDN-CN.png 博客国内访问效果 ratio:1024/1110 %}

<!-- tab 海外 -->
{% image https://upyun.thatcdn.cn/myself/typora/BLOG-CDN-FEIGN.png 博客海外访问效果 ratio:1022/893 %}
{% endtabs %}

### 站长测试
如果有注册 Bing、Google、Baidu 等站长可以测试网站地图抓取扫描等是否正常
