/**
 * Template主体方法
 * @type {{layoutDiv: TimeTem.layoutDiv, requestAPI: TimeTem.requestAPI}}
 */
const TimeTem = {
    requestAPI:async (url, callback, timeout) => {
        let retryTimes = 5;
        while (retryTimes > 0) {
            try {
                const response = await Promise.race([
                    fetch(url),
                    new Promise((resolve, reject) => setTimeout(() => reject(new Error('请求超时')), 5000))
                ]);
                if (response.ok) {
                    const data = await response.json();
                    callback(data);
                    return;
                }
                throw new Error('Network response was not ok.');
            } catch (error) {
                retryTimes--;
                if (retryTimes === 0) {
                    timeout();
                    return;
                }
                await new Promise(resolve => setTimeout(resolve, 5000));
            }
        }
    },
    layoutDiv: (TemConfig) => {
        const el = $(TemConfig.el)[0];
        $(el).append('<div class="loading-wrap"><svg xmlns="http://www.w3.org/2000/svg" width="2rem" height="2rem" preserveAspectRatio="xMidYMid meet" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="2"><path stroke-dasharray="60" stroke-dashoffset="60" stroke-opacity=".3" d="M12 3C16.9706 3 21 7.02944 21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3Z"><animate fill="freeze" attributeName="stroke-dashoffset" dur="1.3s" values="60;0"/></path><path stroke-dasharray="15" stroke-dashoffset="15" d="M12 3C16.9706 3 21 7.02944 21 12"><animate fill="freeze" attributeName="stroke-dashoffset" dur="0.3s" values="15;0"/><animateTransform attributeName="transform" dur="1.5s" repeatCount="indefinite" type="rotate" values="0 12 12;360 12 12"/></path></g></svg></div>');
        TimeTem.requestAPI(TemConfig.attrs.api[0], function(data) {
            $(el).find('.loading-wrap').remove();
            (TemFun.strFindJson(data, TemConfig.attrs.root[0])).forEach((item, i) => {
                item["TemIndex"] = i;
                console.log("每组数据item:",item);
                TemGlobal.proxy = new Object(item);
                if (TemDiv.getExclude()){
                    return null
                }
                let cell = '<div class="timenode" index="' + i + '">';
                // 时间线node位
                cell += '<div class="header">' +
                            '<div class="user-info">'+
                                TemDiv.getAvatar() +
                                TemDiv.getAuthor() +
                            '</div>' +
                                TemDiv.getTimestamp() +
                        '</div>';
                // 时间线内容位
                cell += '<div class="body" href="' + TemDiv.getOriginLink()  + '" target="_blank">' +
                            TemDiv.getTags() +
                            TemDiv.getMsg() +
                            TemDiv.getPics() +
                            TemDiv.getNeteaseMusic() +
                        '</div>';
                cell += '</div>';
                $(el).append(cell);
            });
        }, function() {
            $(el).find('.loading-wrap svg').remove();
            $(el).find('.loading-wrap').append('<svg xmlns="http://www.w3.org/2000/svg" width="2rem" height="2rem" preserveAspectRatio="xMidYMid meet" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path stroke-dasharray="60" stroke-dashoffset="60" d="M12 3L21 20H3L12 3Z"><animate fill="freeze" attributeName="stroke-dashoffset" dur="0.5s" values="60;0"/></path><path stroke-dasharray="6" stroke-dashoffset="6" d="M12 10V14"><animate fill="freeze" attributeName="stroke-dashoffset" begin="0.6s" dur="0.2s" values="6;0"/></path></g><circle cx="12" cy="17" r="1" fill="currentColor" fill-opacity="0"><animate fill="freeze" attributeName="fill-opacity" begin="0.8s" dur="0.4s" values="0;1"/></circle></svg>');
            $(el).find('.loading-wrap').addClass('error');
        });
    },
}

/**
 * Template辅助方法
 * @type {{strFindJson: ((function((json|Object), string): (json|Object))|*), isNull: (function(Object): boolean), unBind: (function(Object): any)}}
 */
const TemFun = {

    /**
     * 判断各类型非空
     * @param _obj {Object}
     * @returns {boolean} 空为True
     */
    isNull: (_obj) => {
        const _type = Object.prototype.toString.call(_obj).slice(8, -1).toLowerCase()
        // 判断是否为空
        const isEmpty = () => {
            if (_type === "array" || _type === "string") {
                return !_obj.length
            } else if (_type === "object") {
                return JSON.stringify(_obj) === "{}"
            } else if (_type === "map" || _type === "set") {
                return !_obj.size
            } else {
                return !_obj
            }
        }
        return isEmpty()
    },

    /**
     * 解除对象的双向绑定
     * @param _obj {Object} json源
     * @returns {JSON} 新内存地址
     */
    unBind: (_obj) => {
        return JSON.parse(JSON.stringify(_obj));
    },

    extraType: (attr) => {
        return String(TemGlobal.rules[attr][1]) ?? null;
    },

    /**
     * 寻json值
     * @param origin {json|Object} json源
     * @param str {string} 字符串形式的json路径, 形如 'content.body.msg'
     * @returns {json|Object}
     */
    strFindJson: (origin, str) => {   //todo 适配类型待优化
        if (TemFun.isNull(str)){return ''}
        const site = str.split('.');
        for (const siteKey in site) {
            if (TemFun.isNull(origin[site[siteKey]])){
                try{origin = JSON.parse(origin+"");}catch (e) {
                    return null;
                }
                if (!origin[site[siteKey]]){return null}
            }
            origin = origin[site[siteKey]] || {};
        }
        return origin;
    },

    /**
     * 简要的字符串转markdown
     * @param md {String}
     * @returns {*}
     */
    markdownToHtml: (md) => {
        let html = md.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        html = html.replace(/__(.*?)__/g, '<strong>$1</strong>');
        html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
        html = html.replace(/_(.*?)_/g, '<em>$1</em>');
        html = html.replace(/```(.*?)```/gs, '<code>$1</code>');
        html = html.replace(/`(.*?)`/g, '<code>$1</code>');
        html = html.replace(/!\[(.*?)\]\((.*?)\)/g, '<img alt="$1" src="$2" />');
        html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>');
        html = html.replace(/^[\*\-] (.*)$/gm, '<li>$1</li>');
        html = html.replace(/^#{1,6} (.*)$/gm, (match, p1) => {
            const level = match.trim().length;
            return `<h${level}>${p1}</h${level}>`;
        });
        html = `<ul>${html.replace(/<\/li><li>/g, '</li>\n<li>')}</ul>`;
        return html;
    },

}



/**
 * 输出参数内容
 * @type {{getMsg: (function(): string), getNeteaseMusic: ((function(): string)|*), getAuthor: (function(): string), getTimestamp: ((function(): string)|*), getAvatar: (function(): string)}}
 */
const TemDiv = {
    getExclude: () => {
        const excludes = TemGlobal.match('exclude')
        if (TemFun.isNull(excludes)){return false}
        if (TemGlobal.rules['exclude'][1]==='array'){
            for (const excludesKey in excludes) {
                console.log(excludes[excludesKey]["name"],TemGlobal.rules['exclude'][2])
                if (String(excludes[excludesKey]["name"]).includes(String(TemGlobal.rules['exclude'][2]))){
                    return true
                }
            }
        }
        return false;
    },

    /**
     * 将可能的时间对象转化成年月日
     * @returns {string} 形如 2023年 10月 30日
     */
    getTimestamp: () => {
        let timestamp = String(TemGlobal.match('timestamp'))
        if (TemFun.isNull(timestamp)){return ''}
        if (/^\d+$/.test(timestamp)) { // 判断是否是时间戳
            const date = new Date(parseInt(timestamp));
            const year = date.getFullYear();
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            const day = date.getDate().toString().padStart(2, '0');
            return `${year}年 ${month}月 ${day}日`;
        } else { // 不是时间戳
            const date = new Date(timestamp);
            return date.toLocaleDateString('zh-CN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            }).replace(/\//g, '年').replace('-', '月').replace('-', '日');
        }
    },

    /**
     * 网易云音乐控件
     * @returns {string}
     */
    getNeteaseMusic: () => {
        const mid = TemGlobal.match('netease');
        if (TemFun.isNull(mid)){
            return '';
        }else {
            return  '<iframe frameborder="no" border="0" marginwidth="0" marginheight="0" style="width: 100%" height=86 src="https://music.163.com/outchain/player?type=2&id='+mid+'&auto=1&height=66"></iframe>';
        }
    },

    /**
     * 获取内容的主体
     * @returns {string}
     */
    getMsg: () => {
        const msg = String(TemGlobal.match('msg'));
        if (TemGlobal.rules['msg'][1]==='markdown'){
            return  TemFun.markdownToHtml(String(msg));
        }
        return  msg.replace(/\n/g,'<br>');
    },

    /**
     * 获取内容的作者名
     * 默认为博主
     * @returns {string}
     */
    getAuthor: () => {
        const author = TemGlobal.match('author')
        return '<span>' + (author || TemGlobal.default.author) + '</span>';
    },

    /**
     * 获取作者的api源头像
     * @returns {string}
     */
    getAvatar: () => {
        const avatarSrc = TemGlobal.match('avatar');
        return '<img style="height: 30px;" src="' + (avatarSrc || TemGlobal.default.avatar) + '" onerror="javascript:this.src=\'' + (avatarSrc || TemGlobal.default.avatar) + '\';">';

    },

    /**
     * 获取内容的源地址
     * @returns {*|string}
     */
    getOriginLink: () => {
        const originLink = TemGlobal.match('link');
        // https://music.163.com/#/event?id=23387983869&uid=134968139
        return String(originLink?String(originLink):TemGlobal.default.link);
    },

    getTags: () => {
        const tags = TemGlobal.match('tags');
        if (TemFun.isNull(tags)){return ''}
        let body = '';
        if(Object.prototype.toString.apply(tags)==="[object Array]"){
            for (const tagsKey in tags) {
                body+='<a class="tag-plugin tag" style="margin: 0;font-size: small;float: right;" color="yellow" target="_blank" rel="external nofollow noopener noreferrer" href="'+tags[tagsKey]["h5Target"]+'">#'+tags[tagsKey]["name"]+'</a>'
            }
        }
        return body+'<br>';
    },

    getPics: () => {
        const pics = TemGlobal.match('pics');
        if (!TemFun.isNull(pics) && TemFun.extraType('pics')==='array'){
            let body = '<div class="swiper swiper-cards swiper-3d swiper-initialized swiper-horizontal swiper-pointer-events swiper-watch-progress" id="swiper-api"'+TemGlobal.proxy["TemIndex"]+' effect="cards"><div class="swiper-wrapper">';
            for (const picsKey in pics) {
                body+='<div class="swiper-slide"><img no-lazy src="' + pics[picsKey]['originUrl'] + '"></div>'
            }
            body += '</div><div class="swiper-pagination"></div><div class="swiper-button-prev blur"></div><div class="swiper-button-next blur"></div></div><style>.swiper{height: 200px}</style>'
            stellar.loadCSS(stellar.plugins.swiper.css);
            stellar.loadScript(stellar.plugins.swiper.js, { defer: true }).then(function () {
                var swiper = new Swiper('.swiper#swiper-api', {
                    slidesPerView: 'auto',
                    spaceBetween: 8,
                    centeredSlides: true,
                    effect: 'cards',
                    loop: true,
                    pagination: {
                        el: '.swiper-pagination',
                        clickable: true,
                    },
                    navigation: {
                        nextEl: '.swiper-button-next',
                        prevEl: '.swiper-button-prev',
                    },
                });
            })
            return body;
        }
        return '';
    },

}

/**
 * 输出模板文件
 * @type {{}}
 */
const TemMod = {

    getNetease: () => {},

    getFricle: () => {},

    getFriends: () => {},

    getGhinfo: () => {},

    getLinkCard: () => {},

    getSItes: () => {},

    getWeiBo: () => {},

    getMemos: () => {},

}


/**
 * Template相关配置项与中间全局变量
 */
let TemGlobal = {
    rules: {},
    proxy: {},
    match: (attr) =>{
        // if (Object.prototype.toString.call(TemGlobal.rules[attr]).slice(8, -1).toLowerCase()==='array'){
        //     return TemFun.strFindJson(TemGlobal.proxy, (TemGlobal.rules[attr][0] || null));
        // }
        // console.log(TemGlobal.rules[attr][0],TemFun.strFindJson(TemGlobal.proxy, (TemGlobal.rules[attr][0] || null)))
        let rule = null;
        try {
            rule = TemGlobal.rules[attr][0];
        }catch (e) {
            return null;
        }
        return TemFun.strFindJson(TemGlobal.proxy, (rule || null));
    },
    default: {
        author: '博主',
        link: '#',
        avatar: 'https://upyun.thatcdn.cn/hexo/stellar/image/favicon.webp',
    },
    mode: '', //api类型
};

/**
 * 获取配置与定位渲染
 */
$(function () {
    const els = document.querySelectorAll('.stellar-template-api');
    els.forEach((el) => {
        const attrs = {};
        const cfgOrigin = el.getAttribute("config").slice(1, -1).split(',');
        cfgOrigin.forEach((cfg) => {
            const [key, value] = cfg.split(':');
            // if (value.split('|').length>=2){attrs[key] = [value.split('|')[0], value.split('|')[1]]}
            attrs[key] = value.split('|');
        });
        attrs['api'] = el.getAttribute("api").split('|');
        const TemConfig = {
            el,
            attrs: TemFun.unBind(attrs),
        };
        console.log(attrs)
        TemGlobal.rules = TemFun.unBind(attrs);
        TemGlobal.mode = el.getAttribute("type").split('|')[1];
        TimeTem.layoutDiv(TemConfig);
    });
    if (!TemFun.isNull(TemGlobal.rules['pics'])){

    }
});






