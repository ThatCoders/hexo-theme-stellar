var customNum = {}
const Custom = {
    reactions: {
        '+1': '👍',
        '-1': '👎',
        'laugh': '😀',
        'hooray': '🎉',
        'confused': '😕',
        'heart': '❤️',
        'rocket': '🚀',
        'eyes': '👀'
    },
    requestAPI: (url, callback, timeout) => {
        let retryTimes = 5;
        function request() {
            return new Promise((resolve, reject) => {
                let status = 0; // 0 等待 1 完成 2 超时
                let timer = setTimeout(() => {
                    if (status === 0) {
                        status = 2;
                        timer = null;
                        reject('请求超时');
                        if (retryTimes == 0) {
                            timeout();
                        }
                    }
                }, 5000);
                fetch(url).then(function (response) {
                    if (status !== 2) {
                        clearTimeout(timer);
                        resolve(response);
                        timer = null;
                        status = 1;
                    }
                    if (response.ok) {
                        return response.json();
                    }
                    throw new Error('Network response was not ok.');
                }).then(function (data) {
                    retryTimes = 0;
                    callback(data);
                }).catch(function (error) {
                    if (retryTimes > 0) {
                        retryTimes -= 1;
                        setTimeout(() => {
                            request();
                        }, 5000);
                    } else {
                        timeout();
                    }
                });
            });
        }

        request();
    },
    layoutDiv: (cfg) => {
        const el = $(cfg.el)[0];
        $(el).append('<div class="loading-wrap"><svg xmlns="http://www.w3.org/2000/svg" width="2rem" height="2rem" preserveAspectRatio="xMidYMid meet" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="2"><path stroke-dasharray="60" stroke-dashoffset="60" stroke-opacity=".3" d="M12 3C16.9706 3 21 7.02944 21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3Z"><animate fill="freeze" attributeName="stroke-dashoffset" dur="1.3s" values="60;0"/></path><path stroke-dasharray="15" stroke-dashoffset="15" d="M12 3C16.9706 3 21 7.02944 21 12"><animate fill="freeze" attributeName="stroke-dashoffset" dur="0.3s" values="15;0"/><animateTransform attributeName="transform" dur="1.5s" repeatCount="indefinite" type="rotate" values="0 12 12;360 12 12"/></path></g></svg></div>');
        Custom.requestAPI(cfg.api, function (data) {
            $(el).find('.loading-wrap').remove();
            const query = new URL(cfg.api).search;
            var users = [];
            const filter = el.getAttribute('user');
            if (filter && filter.length > 0) {
                users = filter.split(",");
            }
            var hide = [];
            const hideStr = el.getAttribute('hide');
            if (hideStr && hideStr.length > 0) {
                hide = hideStr.split(",");
            }
            // ThatCoder: 解析 config 参数
            let config = el.getAttribute('config') || [];
            el.removeAttribute('config')
            config = JSON.parse(config.replace(/'/g, '"'));
            data = config[0].type === 'root' ? match(data, config.shift().src) : data
            const identifier = config[0]['identifier'] || false;
            if (identifier && isNull(customNum[identifier])) {
                customNum[identifier] = {'num': Number(config[0].num), 'now': 0, 'data': []}
            }
            let configObjects = []
            for (const item of data) {
                let configObject = {};
                let shutFor = true;
                for (const item2 of config) {
                    if (isNull(item2.src)) continue
                    const configObjectValue = match(item, item2.src);
                    if (!configObjectValue && configObjectValue !== null) {
                        shutFor = false;  // 整个不要
                        break; // 中断内部循环
                    }
                    configObject[item2.type] = configObjectValue;
                }
                if (shutFor) configObjects.push(configObject)
            }
            if (identifier) {   // 添加到标识集合
                customNum[identifier]['data'] = customNum[identifier]['data'].concat(configObjects)
                customNum[identifier]['now']++
            }
            if (!identifier || customNum[identifier]['now'] === customNum[identifier]['num']) {   // 没标识 或 标识集合已满
                configObjects =identifier ? customNum[identifier]['data'] : configObjects;
                let sort = null;
                if (!isNull(config[0]['sort']) && config[0]['sort'] === 'timestamp') {
                    sort = 1
                }else if (!isNull(config[0]['sort']) && config[0]['sort'] === 'pmatsemit'){
                    sort = -1
                }
                if (sort!==null) {
                    configObjects.sort((a, b) => {
                        const timestampA = convertToMilliseconds(Number(a['timestamp']));
                        const timestampB = convertToMilliseconds(Number(b['timestamp']));
                        return sort>0?timestampB - timestampA:timestampA - timestampB;
                    });
                }
                for (const configObject of configObjects) {
                    $(el).append(TempStyle.getTimeNode(configObject));
                }
                $(el).append(TempStyle.getFloatStyle())
                delete customNum[identifier]  // 清空对应标识集合, 防止赛博诈尸
            }
        }, function () {
            $(el).find('.loading-wrap svg').remove();
            $(el).find('.loading-wrap').append('<svg xmlns="http://www.w3.org/2000/svg" width="2rem" height="2rem" preserveAspectRatio="xMidYMid meet" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path stroke-dasharray="60" stroke-dashoffset="60" d="M12 3L21 20H3L12 3Z"><animate fill="freeze" attributeName="stroke-dashoffset" dur="0.5s" values="60;0"/></path><path stroke-dasharray="6" stroke-dashoffset="6" d="M12 10V14"><animate fill="freeze" attributeName="stroke-dashoffset" begin="0.6s" dur="0.2s" values="6;0"/></path></g><circle cx="12" cy="17" r="1" fill="currentColor" fill-opacity="0"><animate fill="freeze" attributeName="fill-opacity" begin="0.8s" dur="0.4s" values="0;1"/></circle></svg>');
            $(el).find('.loading-wrap').addClass('error');
        });
    },
}

$(function () {
    const els = document.getElementsByClassName('stellar-custom-api');
    for (var i = 0; i < els.length; i++) {
        const el = els[i];
        const api = el.getAttribute('api');
        if (api == null) {
            continue;
        }
        var obj = new Object();
        obj.el = el;
        obj.api = api;
        Custom.layoutDiv(obj);
    }
});

/**
 * 源数据格式处理
 * @param origin
 * @returns {string|null|any}
 */
const strToJson = (origin) => {
    if (Array.isArray(origin)) {
        return origin;
    } else if (typeof origin === "string") {
        try {
            return JSON.parse(origin);
        } catch (error) {
            return origin;
        }
    } else if (typeof origin === "object" && origin !== null) {
        return origin;
    }
    return null;
};

/**
 * 匹配目标路径数据, 返回结果(结果集)
 * @param origin
 * @param src
 * @returns {null|*}
 */
const filter = (origin, src) => {
    src = src.split(".");
    for (const key of src) {
        if (origin && origin[key] !== undefined) {
            origin = origin[key];
        } else {
            origin = strToJson(origin);
            if (origin === null) {
                return null;
            }
            origin = origin[key];
        }
    }
    return origin;
};

/**
 * 匹配目标路径数据集, 返回结果集
 * @param origin
 * @param arraySrc 数据集
 * @param src 结果路径
 * @returns {*[]|*}
 */
const map = (origin, arraySrc, src) => {
    // 处理字符串状态的 JSON、Array
    if (typeof origin !== "object") {
        origin = strToJson(origin);
        if (isNull(origin)) {
            return [];
        }
    }
    const arrayData = filter(origin, arraySrc);
    // 处理数据集为空
    if (isNull(arrayData)) {
        return []
    }
    // 处理无结果路径
    if (src === null) {
        return arrayData;
    }
    return arrayData.map((item) => {
        const filteredItem = filter(item, src);
        return filteredItem !== false ? filteredItem : [];
    });
};

/**
 * 匹配是否排除获取本次configObject
 * @param origin
 * @param exclude
 * @returns {boolean|*}
 */
const containsExclude = (origin, exclude) => {
    if (typeof origin === 'string') {
        return origin.includes(exclude);
    } else if (Array.isArray(origin)) {
        return origin.some(item => containsExclude(item, exclude));
    }
    return false;
};

const decodeCustomString = (customString) => {
    return window.decodeURIComponent(window.atob(customString))
}

/**
 * 匹配去除符合正则内容
 * @param origin
 * @param regex 经过编码 memos去标签示例 window.btoa(window.encodeURIComponent(String.raw`#[\d\u4e00-\u9fa5a-zA-Z]+[\s\n]`));
 * @param r 替换的内容, 需解码
 * @returns {string|*}
 */
const removeMatches = (origin, regex, r='') => {
    const decodedRegex = decodeCustomString(regex);
    const regexObj = new RegExp(decodedRegex);
    if (typeof origin === 'string') {
        return origin.replace(regexObj, isNull(r)?'':decodeCustomString(r));
    } else if (Array.isArray(origin)) {
        return origin.map(item => typeof item === 'string' ? item.replace(regexObj, isNull(r)?'':decodeCustomString(r)) : item);
    }

    return origin;
};


/**
 * 匹配是否添加基础前缀
 * @param origin
 * @param base 经过编码 示例 window.btoa(window.encodeURIComponent(String.raw`http://106.55.60.131:5230/m/`));
 * @returns {string|*}
 */
const addBaseToStrings = (origin, base) => {
    base =decodeCustomString(base);
    if (typeof origin === 'string' || typeof origin === 'number') {
        return '' + base + origin;
    } else if (Array.isArray(origin)) {
        return origin.map(item => base + item);
    }
    return origin;
};

/**
 * 匹配路径返回结果(主方法)
 * @param origin
 * @param src
 * @returns {boolean|*}
 */
const match = (origin, src) => {
    src = src.split("|");
    for (let i = 0; i < src.length; i++) {
        const matchUrl = src[i].split(':').length > 1 ? src[i].split(':') : ('filter:' + src[i]).split(':');
        const type = matchUrl[0];
        const srcValue = matchUrl.slice(1).join(":");

        if (type === "filter") {
            origin = filter(origin, srcValue);
        } else if (type === "map") {
            const matchUrl2 = i + 1 < src.length ? src[i + 1].split(":") : null;
            origin = map(origin, srcValue, matchUrl2 === null ? null : (matchUrl2[1] || matchUrl2[0]));
            i++;
        } else if (type === "exclude") {
            if (containsExclude(origin, decodeCustomString(srcValue))) {
                return false;
            }
        } else if (type === "default") {
            origin = decodeCustomString(srcValue);
        } else if (type === "base") {
            origin = addBaseToStrings(origin, srcValue);
        } else if (type === "markdown") {
            origin = markdownToHtml(origin);
        } else if (type === "regex") {
            origin = removeMatches(origin, srcValue, matchUrl[2] || null)
        }
    }
    return origin;
};

/**
 * 简易的 mark 转 html
 * @param md
 * @returns {string}
 */
const markdownToHtml = (md) => {
    let html = md;
    html = html.replace(/\*\*(.*?)\*\*|__(.*?)__/g, (_, p1, p2) => p1 ? `<strong>${p1}</strong>` : `<em>${p2}</em>`);   // Bold and Italics
    html = html.replace(/```(.*?)```|`(.*?)`/gs, (_, p1, p2) => `<code>${p1 || p2}</code>`);    // Code
    html = html.replace(/!\[(.*?)\]\((.*?)\)|\[(.*?)\]\((.*?)\)/g, (_, alt, src, linkText, href) => {   // Images and Links
        if (alt && src) return `<img class="lazy entered loaded" alt="${alt}" src="${src}" data-src="${src}" />`;
        if (linkText && href) return `<a href="${href}">${linkText}</a>`;
        return _;
    });
    html = html.replace(/- \[x\]|- \[ \]|- \[\]/g, '<input type="checkbox" $& />'); // Checkboxes
    html = html.replace(/^(\d+)\. (.*)$/gm, '<ol><li>$2</li></ol>');    // Ordered Lists
    html = html.replace(/^(> .*)$/gm, '<blockquote>$1</blockquote>');   // Blockquotes
    html = html.replace(/^-{3,}$/gm, '<hr />'); // Horizontal Lines
    html = html.replace(/\|(.+)\|/g, (_, columns) => {  // Tables
        const headers = columns.trim().split('|').map(col => `<th>${col}</th>`).join('');
        return `<table><thead><tr>${headers}</tr></thead></table>`;
    });
    html = html.replace(/^\[(.*?)\]:\s*(.*?)$/gm, '<a href="$2">$1</a>');   // Link References
    html = html.replace(/^[\*\-] (.*)$/gm, '<li>$1</li>');  // Lists and Headings
    html = html.replace(/^#{1,6} (.*)$/gm, (match, p1) => `<h${match.trim().length}>${p1}</h${match.trim().length}>`);
    html = `<ul>${html.replace(/<\/li><li>/g, '</li>\n<li>')}</ul>`;    // Wrap with <ul> for lists
    return html;
}


/**
 * 判空成功返回 True
 * @param _obj
 * @returns {*|boolean}
 */
const isNull = (_obj) => {
    const _type = Object.prototype.toString.call(_obj).slice(8, -1).toLowerCase();
    // 判断是否为空
    const isEmpty = () => {
        switch (_type) {
            case "array":
            case "string":
                return !_obj.length;
            case "object":
                return JSON.stringify(_obj) === "{}";
            case "map":
            case "set":
                return !_obj.size;
            default:
                return !_obj;
        }
    };
    return isEmpty();
};

/**
 * 简易的时间处理
 * @param time
 * @returns {null|Date|*}
 */
const parseTime = (time) => {
    if (!time) {
        return null;
    }

    if (/^\d+$/.test(time)) {
        // 尝试将字符串解析为毫秒级时间戳
        const millisecondsTimestamp = parseInt(time);
        if (String(millisecondsTimestamp).length === 13) {
            return new Date(millisecondsTimestamp);
        }

        // 尝试将字符串解析为秒级时间戳
        const secondsTimestamp = parseInt(time);
        if (String(secondsTimestamp).length === 10) {
            return new Date(secondsTimestamp * 1000);
        }
    }

    const parsedDate = new Date(time);
    if (!isNaN(parsedDate.getTime())) {
        // 如果能够成功解析为日期对象，则返回
        return parsedDate;
    }

    // 如果无法解析为日期对象，尝试解析英文时间
    const parsedEnglishDate = new Date(Date.parse(time));
    if (!isNaN(parsedEnglishDate.getTime())) {
        return parsedEnglishDate;
    }

    // 无法解析的情况下，返回原始值
    return time;
};

/**
 * 时间戳同谐
 * @param timestamp
 * @returns {number}
 */
const convertToMilliseconds = (timestamp) => {
    if (/^\d{13}$/.test(timestamp)) {
        return parseInt(timestamp);
    }
    if (typeof timestamp === 'number') {
        timestamp = timestamp.toString().padEnd(13, '0');
    } else {
        timestamp = new Date(timestamp).getTime().toString().padEnd(13, '0');
    }
    return parseInt(timestamp);
};


/**
 * 简易的时间转中文
 * @param date
 * @returns {string}
 */
const formatChineseDate = (date) => {
    if (!(date instanceof Date)) {
        return '';
    }

    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}年 ${month}月 ${day}日`;
};

/**
 * 控件调用器
 * @type {{getMsg: (function(*): string|*), getAuthor: (function(*): string|string), getNeteaseMusic: ((function(*): (string|string|string))|*), getAvatar: ((function(*): (string|string))|*), getTimestamp: ((function(*): (string|string))|*), getTags: ((function(*): (string|string))|*), getPics: ((function(*, *): (string|string))|*)}}
 */
const TempStyle = {
    getAuthor: (data) => isNull(data['author']) ? '' : `<span style="padding: 8px;">${data['author']}</span>`,
    getAvatar: (data) => isNull(data['avatar']) ? '' : `<img style="height: 30px;" src="${data['avatar']}" onerror="javascript:this.src='${data['avatar']}';">`,
    getTags: (data) => isNull(data['tags']) ? '' : (Array.isArray(data['tags']) ? data['tags'] : [data['tags']]).map(tag => `<a class="tag-plugin tag" style="margin: 0; font-size: small; float: right;" color="yellow" target="_blank" rel="external nofollow noopener noreferrer">#${tag}</a>`).join(' ') + '<br>',
    getMsg: (data) => isNull(data['msg']) ? '' : `<div style="padding: 8px;">${data['msg'].replace(/\n/g, '<br>')}</div>`,
    getTimestamp: (data) => {
        const timestamp = data['timestamp'];
        if (isNull(timestamp)) return '';
        const parsedDate = parseTime(timestamp);
        if (!parsedDate) return '';
        return formatChineseDate(parsedDate);
    },
    getNeteaseMusic: (data) => {
        const mid = data['netease'];
        if (isNull(mid)) return '';
        return mid === null ? '' : `<iframe frameborder="no" border="0" marginwidth="0" marginheight="0" style="width: 100%" height=86 src="https://music.163.com/outchain/player?type=2&id=${mid}&auto=0&height=66"></iframe>`;
    },
    getQuote: (data) => {
        const quote = data['quote'];
        if (isNull(quote)) return '';
        return quote === null ? '' : `<blockquote style="font-size: smaller;">${quote.replace(/\n/g, "<br>")}</blockquote>`
    },
    getPics: (data) => {
        const pics = data['pics'];
        if (isNull(pics)) return '';
        let body = '<div class="tag-plugin image">';
        for (let i = 0; i < pics.length; i++) {
            body += `<div class="image-bg"><img class="lazy entered loaded" style="max-height: 35vh; width: auto;" src="${pics[i].replace(/http:\/\//g, 'https://')}" data-src="${pics[i].replace(/http:\/\//g, 'https://')}" data-ll-status="loaded"></div>`;
            if (i === 0) break;
        }
        return body + '</div>';
    },
    getOriginLink: (data) => {
        const link = data['link'];
        const origin = data['origin'];
        let body = '';
        if (!isNull(link)) body += `<div class="flex left"><a href="${link}" target="_blank"><div class="item reaction rocket"><span> 🚀 </span></div></a></div>`;
        if (!isNull(origin)) {
            const icon = data['icon'];
            body += `${body !== '' ? '' : '<div class="flex left"></div>'}<div class="flex right" style=""><div style="display: flex;align-items: center;font-style: italic;font-family: cursive;font-size: smaller;" ><span style="display: flex;align-items: center;">${origin}${isNull(icon) ? '' : `  <img style="width: 1rem;margin-left: 4px;" src="${icon}" > `}</span></div></div>`;
        }
        return body !== '' ? body : '';
    },
    getFooter: (data) => {
        const footerRight = isNull(TempStyle.getOriginLink(data)) ? '' : TempStyle.getOriginLink(data)
        const footer = `<div className="footer" style="display: flex;justify-content: space-between;" >${isNull(footerRight)?'':footerRight}</div>`
        return footer==='<div className="footer"></div>' ? '' : footer
    },
    getTitle: (data) => isNull(data['title']) ? '' : `<div class="tag-plugin quot"><p class="content" type="icon">${data['title']}</p></div>`,
    // TODO: 想添加可选右侧悬浮小图标
    // getFloat: (data) => {
    //     let float = '<div class="actions">\n' +
    //         '      <div class="action-button"><img height="20px" src="/access/image/logo/start.svg"><p>9999</p></div>\n' +
    //         '      <div class="action-button"><img height="20px" src="/access/image/logo/comment.svg"><p>10</p></div>\n' +
    //         '      <div class="action-button"><img height="20px" src="/access/image/logo/share.svg"><p>10</p></div>\n' +
    //         '    </div>'
    //     return float
    // },
    getFloatStyle: () => {
        return '<style>.actions{\n' +
            '  display: none;\n' +
            '}\n' +
            '\n' +
            ' div.timenode:hover > div.body > div.actions {\n' +
            '   width: 6rem;\n' +
            '   height: .001rem;\n' +
            '   position: relative;\n' +
            '   bottom: 6.3rem;\n' +
            '   right: -105%;\n' +  // TODO: 这里有bug, 按百分比距离不一样
            '   display: flex;\n' +
            '   flex-direction: column;\n' +
            '   transform: translateY(-50%);z-index: 999\n' +
            '  }\n' +
            '\n' +
            '  .action-button {\n' +
            '    width: 4rem;\n' +
            '    border-radius: 50%;\n' +
            '    margin-bottom: 2px;\n' +
            '    display: flex;\n' +
            '    justify-content: space-between;\n' +
            '    align-items: center;\n' +
            '    cursor: pointer;\n' +
            '  }\n' +
            'div.action-button > img{margin: 0 0 0 6px !important;filter: grayscale(1)}div.action-button:hover > img{filter: grayscale(0)}' +
            '\n' +
            '  .action-button:hover {\n' +
            // '    background-color: #ccc;\n' +
            '  }</style>'
    },
    getTimeNode: (configObject) => {
        const cell =
            `<div class="timenode" index="${Date.now()}">
            <div class="header">
                <div class="user-info" style="display: flex; align-items: center;height: 30px;">
                    ${TempStyle.getAvatar(configObject)}${TempStyle.getAuthor(configObject)}
                </div>
                ${TempStyle.getTimestamp(configObject)}
            </div>
            <div class="body">
                ${TempStyle.getTitle(configObject)}
                ${TempStyle.getTags(configObject)}
                ${TempStyle.getMsg(configObject)}
                ${TempStyle.getQuote(configObject)}
                ${TempStyle.getPics(configObject)}
                ${TempStyle.getNeteaseMusic(configObject)}
                ${TempStyle.getFooter(configObject)}
            </div>
        </div>`;
        return cell;
    },
};


