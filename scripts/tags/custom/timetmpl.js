/*
 * Copyright (c) 2023.
 * timetmpl.js files written in 2023/12/31 上午3:01 are ThatCoder (钟意) for MyBlog projects.
 * ThatCoder's blog is https://blog.thatcoder.cn
 * If you are interested in this code or have any questions, you are welcome to visit and discuss it.
 */

/**
 * timeline.js v2.1 | https://github.com/xaoxuu/hexo-theme-stellar/
 *
 * {% timetmpl %}
 *
 *
 * {% endtimetmpl %}
 */

'use strict'

function layoutNodeTitle(ctx, content) {
    var el = ''
    el += '<div class="header">'
    if (content && content.length > 0) {
        el += ctx.render.renderSync({text: content, engine: 'markdown'}).split('\n').join('')
    }
    el += '</div>'
    return el
}

function layoutNodeContent(ctx, content) {
    var el = ''
    el += '<div class="body fs14">'
    el += content
    el += '</div>'
    return el
}

module.exports = ctx => function(args, content = '') {
    // 读取标签
    args = ctx.args.map(args, ['api', 'tmpl', 'limit', 'style'])
    var el = ''
    // 是否有默认模板
    if (!args.tmpl) {
        args.tmpl = 'timetmpl'
    }
    // 使用模板就注册标签生成
    if (args.api && args.api.length > 0) {
        el += '<div class="tag-plugin timetmpl stellar-' + args.type + '-tmpl"'
        el += ' ' + ctx.args.joinTags(args, ['api', 'tmpl', 'limit', 'style']).join(' ')
        el += '>'
    } else {
        // 没模板就解析代码块
        el += '<div class="tag-plugin timeline timetmpl">'
    }

    // 如果非模板交替生成内容数组 [{"head": "网易云音乐", body: "配置"}]
    var arr = content.split(/<!--\s*node (.*?)\s*-->/g).filter(item => item.trim().length > 0)
    if (arr.length > 0) {
        var nodes = []
        arr.forEach((item, i) => {
            if (i % 2 === 0) {
                nodes.push({
                    header: item
                })
            } else if (nodes.length > 0) {
                var node = nodes[nodes.length-1]
                if (node.body === undefined) {
                    node.body = item
                } else {
                    node.body += '\n' + item
                }
            }
        })
        nodes.forEach((node, i) => {
            el += '<div class="timenode" index="' + (i) + '">'
            el += layoutNodeTitle(ctx, node.header)
            el += layoutNodeContent(ctx, node.body)
            el += '</div>'
        })
    }

    el += '</div>'
    return el
}
