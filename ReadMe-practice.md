# impress-electron-practice
## 实习答辩用PPT

***
## 语言篇
### Java
``` Java
String[] strs = new String[]{"qwe", "123", "asd"};
strs[0] = 0;
strs = new int[]{0, 1, 2};
strs["0"] = 1; // Array的key必须为整数索引，Map才能有别的

public final Class Bean { // 奇怪的类、属性声明，麻烦的单例等
    private final static Bean instance = new Bean("NAME");
    private static getInstance() { return instance; }
    private final String name;
    private Bean(String name) { this.name = name; }
    public String getName() { return this.name; }
    public void setName(String name) { this.name = name; }
}
```
``` JavaScript
var strs = ["qwe", "123", "asd"];
strs[0] = 0; // 可以通过，集合元素类型混合
strs['0'] = 0; // 等价于上面那句，字符串与数字无明显分界
strs['a'] = 'a'; // 可以通过，Array与Object无明显区别

var o = { // 难以置信的简洁强大
    get name() { return this._n; }
    set name(v) { this._n = v; }
};
```

### Javascript
``` Javascript
getOrPost(url, function (raw) {
    var data = [];
    for (var i = 0; i < raw.length; i++) {
        raw[i] && data.add(raw[i]);
    }
    if (!data.length) {
        throw new Error('error');
    }
    var sum = 0;
    for (var i = 0; i < data.length; i++) {
        sum += data[i].count * data[i].weight;
    }
    console.log(sum);
});
```
``` es6
fetch(url).then(d => d.filter(v => v))
    .then(d => d.length ? d : reject('error'))
    .then(d => d.reduce((l, { count, weight }) => l + count * weight, 0))
    .then(console.log);
```