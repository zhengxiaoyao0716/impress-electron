impress().init();  // eslint-disable-line no-undef

{
    ((keys, fn) => keys.forEach(key => addEventListener(key, fn)))(
        ['load', 'hashchange',],
        ((style) => () => (
            style.innerHTML = `#${location.hash.slice(2)}>p { display: block; }`
        ))(((style) => {
            document.head.appendChild(style);
            style.setAttribute('id', 'hashHandler');
            return style;
        })(document.createElement('style')))
    );
}
