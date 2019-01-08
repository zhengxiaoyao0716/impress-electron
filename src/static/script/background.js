// 图层随光标浮动
((bgs) => {
    addEventListener('mousemove', e => bgs.forEach((bg) => {
        bg.style.transformOrigin = 100 * e.x / bg.parentElement.clientWidth + '% ' + 100 * e.y / bg.parentElement.clientHeight + '%';
    }));
    // addEventListener('click', e => bgs.forEach(bg => {
    //     bg.style.transformOrigin = 100 * (1 - e.x / bg.parentElement.clientWidth) + '% ' + 100 * (1 - e.y / bg.parentElement.clientHeight) + '%';
    // }));
})(document.querySelectorAll('.Background.trans'));
