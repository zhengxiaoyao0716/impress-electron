{
    const api = impress('impress');  // eslint-disable-line no-undef
    api.init();
    window.addEventListener('mousewheel', e => e.deltaY > 0 ? api.next() : api.prev())
}

window.addEventListener('load', () => {
    let count = 0;
    window.setInterval(() => new Notification(`${++count}分钟了`), 60 * 1000);
});
