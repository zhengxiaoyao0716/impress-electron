impress('impress').init();  // eslint-disable-line no-undef

window.addEventListener('load', () => {
    let count = 0;
    window.setInterval(() => new Notification(`${++count}分钟了`), 60 * 1000);
});
