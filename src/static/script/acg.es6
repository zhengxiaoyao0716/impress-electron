// acg
// @author: zhengxiaoyao0716
; (function () {
    "use strict";
    const acg = {
        "background": {
            "doms": document.querySelectorAll(".-acg- .background, .-acg-.background"),
            "images": [{
                url: "./static/image/acg_bgs/49647343_p0.png",
                info: "PixivID: 49647343 | 画师：コ゛りぼて",
            }],  // 图片缓存队列，可空数组，获取到的图片会扩展进入数组。
            // "images": [],
            // "interval": 30,  // 自动切换时间间隔，单位s，不大于0时（0、-1、undefined）不自动切换
            // "provider": "http://pic.api.freejishu.com/v2/?tag=acg",  // 图片供应api，空值表示不获取新图片
        },
        attributes: {
            bgInfo: "data-acg-bg-info",
            zone: "data-acg-zone",
            hideHash: "data-acg-hide-hash",
            showHash: "data-acg-show-hash",
        }
    };

    // 随机背景
    if (acg.background.doms) {
        acg.background.images = acg.background.images || [];
        let index = 0;
        // 拉取下一张图片
        const fetchImage = acg.background.provider ? (fn) => {
            base.fetch(acg.background.provider).then((data) => {
                if (fn) {
                    acg.background.images.push({
                        url: data['url'],
                        info: '' || data['url'],
                    });
                    fn(acg.background.images[index]);
                } else {
                    base.preload.image(data['url'], (src) => {
                        acg.background.images.push({
                            url: src,
                            info: '' | src,
                        });
                    });
                }
            });
        } : (fn) => {
            index = 0;
            fn && fn(acg.background.images[index]);
        };
        // 切换背景到下一张
        function nextImage() {
            new Promise((resolve, reject) => {
                function onImageGet(image) {
                    ++index >= acg.background.images.length && fetchImage();
                    resolve(image);
                }
                const image = acg.background.images[index];
                if (!image) {
                    fetchImage(image => onImageGet(image));
                } else {
                    onImageGet(image);
                }
            }).then(image => image && acg.background.doms.forEach(div => {
                div.style.backgroundImage = 'url(' + image.url + ')';
                div.setAttribute(acg.attributes.bgInfo, image.info);
            }));
        };
        nextImage();
        // 定时刷新
        acg.background.interval > 0 && setInterval(nextImage, acg.background.interval * 1000);
    }

    //数据管理器
    const dataManager = (() => {
        // 解析日期，"2017-04-03" => ["Apr 09, 2017", "green"]
        function parseDate(dateStr) {
            const [year, month, date] = dateStr.split('-');
            const d = new Date(year, month - 1, date);
            const day = d.getDay();
            const [, monthStr,] = d.toString().split(' ');
            return [`${monthStr} ${date}, ${year}`, base.colors[day + 1]];
        }
        // 计算标签颜色
        function colorFromTarget(target) {
            let sum = 0;
            for (let char of target) {
                sum += char.codePointAt(0);
            }
            return base.colors[sum % base.colors.length];
        }
        let offset = 0;
        const articles = [];
        let zoneArticles = articles;
        function pullArticle() {
            const _pullArticle = pullArticle;
            pullArticle = () => { };
            // 获取远程数据后回调
            github.acgData().then((data) => {
                data.forEach(({ zone, title, url, date, image, abstracts, labels, }) => {
                    const article = document.createElement('article');
                    const [dateStr, dayColor] = parseDate(date);
                    article.classList.add('article');
                    article.style.setProperty('--color', `var(--color-${dayColor})`);
                    const footer = labels.reduce((s, label) => {
                        if (!document.head.querySelector(`style#label-${label.name}`)) {
                            const style = document.createElement("style");
                            style.id = `label-${label.name}`;
                            style.innerHTML = `
                                .-acg- .article>footer>i.label-${label.name} { background-color: #${label.color}; }
                                .-acg- .article>footer>i.label-${label.name}::before { border-right-color: #${label.color}; }
                            `;
                            document.head.appendChild(style);
                        }
                        return s + `<i class="label-${label.name}">${label.name}</i>`;
                    }, '');
                    article.innerHTML = `
                        <time>${dateStr}</time>
                        <h3>${title}</h3>
                        <section>
                            <img src="${image}" alt="${title}" />
                            <div><p>${abstracts.join('</p><p>')}</p></div>
                        </section>
                        <footer>${footer}</footer>
                    `;
                    article.addEventListener('click', e => open(url));
                    article.setAttribute(acg.attributes.zone, zone);
                    articles.push(article);
                });
                // 清除超过实际数据量的预置待加载区块
                const maxOffset = zoneArticles.length - dataManager.cards.length;
                offset >= maxOffset && (offset = maxOffset < 0 ? 0 : maxOffset);
                dataManager.load();
                pullArticle = data.length > 0 ? _pullArticle : () => true;
            });
        }
        pullArticle();
        return {
            init(cards, left, right) {
                left.addEventListener("click", e => {
                    offset--;
                    if (offset < 0) {
                        offset = 0;
                    }
                    dataManager.load();
                });
                let isFinish;
                right.addEventListener("click", e => {
                    offset++;
                    if (offset > zoneArticles.length - 5) {  // pre-load data
                        isFinish = pullArticle();
                    }
                    const maxOffset = zoneArticles.length - cards.length;
                    if (offset >= maxOffset) {
                        offset = maxOffset;
                        isFinish || (offset += 1);
                        offset < 0 && (offset = 0);
                    }
                    dataManager.load();
                });
                dataManager.cards = cards;
                dataManager.left = left;
                dataManager.right = right;
            },
            /** @param {string} zone empty value means not change, zero value means don't filter zone */
            load(zone) {
                zone != null && (articles.zone = zone);  // zone is not empty then reset filter
                zoneArticles = !articles.zone ?
                    articles : articles.filter(article => article.getAttribute(acg.attributes.zone) == articles.zone);
                dataManager.cards.forEach((card, index) => {
                    const article = zoneArticles[offset + index];
                    if (article == card.children[0]) {
                        return;
                    }
                    card.children[0] && card.removeChild(card.children[0]);
                    article && card.appendChild(article);
                });
            },
        }
    })();

    // 卡片模块
    {
        const cards = [];
        const centerDiv = document.querySelector('.-acg- #card>div.hover-center');
        if (innerWidth / innerHeight > 1) {
            // 横向，电脑
            cards.push(
                (d => {
                    d.classList.add('hover-left');
                    centerDiv.before(d);
                    return d;
                })(document.createElement('div')),
                centerDiv,
                (d => {
                    d.classList.add('hover-right')
                    centerDiv.after(d);
                    return d;
                })(document.createElement('div'))
            );
        } else {
            // 竖向，手机
            cards.push(centerDiv);
        }
        cards.forEach((card, index) => {
            card.addEventListener('mouseover', e => {
                card.classList.remove("hover-left");
                card.classList.add("hover-center");
                card.classList.remove("hover-right");
                for (let left = 0; left < index; left++) {
                    cards[left].classList.add("hover-left");
                    cards[left].classList.remove("hover-center");
                    cards[left].classList.remove("hover-right");
                }
                for (let right = cards.length - 1; right > index; right--) {
                    cards[right].classList.remove("hover-left");
                    cards[right].classList.remove("hover-center");
                    cards[right].classList.add("hover-right");
                }
            });
        });
        // 左右滑动
        const left = document.querySelector('.-acg- #card>a:first-child');
        const right = document.querySelector('.-acg- #card>a:last-child');
        dataManager.init(cards, left, right);
        document.addEventListener("mousewheel", e => {
            let y = e.deltaY;
            let click = right.click.bind(right);
            if (e.deltaY < 0) {
                y = -y;
                click = left.click.bind(left);
            }
            for (y; y > 0; y -= 100) {
                click();
            }
        });
    }

    // 路由模块
    ((keys, fn) => keys.forEach(key => addEventListener(key, fn)))(
        ["load", "hashchange"],
        (() => {
            const style = ((style) => {
                document.head.appendChild(style);
                style.setAttribute("id", "acg-sticker-style");
                return style;
            })(document.createElement("style"));
            return (e) => {
                const [hash, param] = location.hash ? location.hash.split("/") : ["#"];
                style.innerHTML = `
                    .-acg- #sticker>a[${acg.attributes.hideHash}="${hash}"] {
                        display: none;
                    }
                    .-acg- #sticker>a[${acg.attributes.showHash}="${hash}"] {
                        display: block;
                    }
                `;
                board.fade.out();
                ({
                    "#": () => {
                        // 首页
                        dataManager.load("");
                    },
                    "#anime": () => {
                        // 动画
                        dataManager.load("anime");
                    },
                    "#game": () => {
                        // 游戏
                        dataManager.load("game");
                    },
                    "#music": () => {
                        // 音乐
                        dataManager.load("music");
                    },
                    "#board": () => {
                        // 后台
                        dataManager.load();
                        board.fade.in(true);
                        board.switch(param);
                    }
                })[hash]();
            }
        })()
    );

    // PATCH 修复UC浏览器onload提前触发问题
    document.readyState == 'complete' && dispatchEvent(new Event('load', { target: window }));

    // 初始方法
    {
        const acg = document.querySelector('.-acg-');
        const sticker = acg.querySelector('#sticker');
        const resize = sticker.querySelector('#resize:first-child');
        resize.addEventListener('click', e => sticker.classList.contains('fold') ? sticker.classList.remove('fold') : sticker.classList.add('fold'));
        // 存储折叠状态
        localStorage.getItem('isStickerFolded') && sticker.classList.add('fold');
        addEventListener("beforeunload", e => sticker.classList.contains('fold') ? localStorage.setItem('isStickerFolded', "true") : localStorage.removeItem('isStickerFolded'));
    }

    // Module defined.
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = acg;
    } else if (typeof define === 'function' && define.amd) {
        define(function () { return acg; });
    } else {
        window.acg = acg;
    }
})();
