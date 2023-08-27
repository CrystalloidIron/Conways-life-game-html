//这个文件实现画布与空间的绑定，以及从数据到画布的渲染，并且定义所有相关功能函数的实现
//测试某个函数的运行时间，记得加".call(this)"

//基本显示色彩定义
const colorSetBase = {life: "#6DCC3DFF", background: '#00000000', remain: "#6A8060"};

//自动转换css中的颜色代码,可以从number(INT32)转换为string(符合css要求的),也可以从string(符合css要求的)转为number(INT32)
function toColor(n) {
    if (typeof (n) == 'number')
        if (n <= 0xFFFFFFFF && n >= 0) {
            let s = '#';
            if (n <= 0xFFFFFF)
                s += n.toString(16) + 'FF';
            else
                s += n.toString(16);
            return s;
        } else return '#FFFFFFFF';
    if (typeof (n) == 'string')
        if (n[0] === '#' && n.length < 10) {
            let a = 0;
            let x = 0;
            for (let i = 1; i < n.length; i++) {
                x = n.charCodeAt(i);
                if (x < 58 && x > 47)
                    a += x - 48;
                else if (x < 71 && x > 64)
                    a += x - 55;
                else if (x < 103 && x > 96)
                    a += x - 87;
                else return undefined;
                a *= 16;
            }
            if (a <= 0xFFFFFF)
                a *= 0xFF;
            return a;
        }
    return undefined;
}

//用于获取递增序列
function Sequence() {
    let a = 0;
    return function () {
        return ++a;
    }
}

let wordNameList = new Sequence();

//定义’空间’类，用于存储生物的信息
//参数为：宽(width->X),长(length->Y),循环(isloop),初始数据(data)[y][x]
function Space(width = 64, length = 64, isloop = true, data) {
    this.Max_X = width;
    this.Max_Y = length;
    this.isloop = isloop;
    //this.data以二元数组包含布尔类型存储，索引为data[y][x]
    if (typeof (data) === 'string') {
        if (/(^r)/.test(data)) {
            let x = 0.5;
            if (data.length > 1 && data[1] < 58)
                x = (data.charCodeAt(1) - 48) / 10;
            if (data.length > 2 && data[2] < 58)
                x += (data.charCodeAt(2) - 48) / 100;
            this.data = new Array(this.Max_Y);
            for (let i = 0; i < this.Max_Y; i++) {
                this.data[i] = new Array(this.Max_X);
                for (let j = 0; j < this.Max_X; j++)
                    this.data[i][j] = Boolean(Math.random() < x);
            }
        } else if (/^b/.test(data)) {
            this.data = new Array(this.Max_Y).fill(new Array(this.Max_X).fill(false, 0, this.Max_X), 0, this.Max_Y);
        }
    } else if (typeof data === 'object') {
        this.data = new Array(length);
        for (let i = 0; i < length; i++) {
            this.data[i] = new Array(width);
            for (let j = 0; j < width; j++)
                this.data[i][j] = !!data[i][j];
        }
    } else {
        this.data = new Array(this.Max_Y).fill(new Array(this.Max_X).fill(false, 0, this.Max_X), 0, this.Max_Y);
    }

    //用于演化计算过程的数组
    let a = new Array(this.Max_Y + 2);
    //存活和繁衍规则
    this.alive = function (i, j) {
        if (this.data[i - 2][j - 2]) {
            return a[i][j] === 3 || a[i][j] === 4;
        } else {
            return a[i][j] === 3;
        }
    };
    //使生命演化 1 步的函数
    this.step = function () {
        //按照是否循环对数组进行初始化
        if (this.isloop) {//是则在新数组中将数据居中平铺
            a[0] = this.data[this.Max_Y - 1].concat(this.data[this.Max_Y - 1][0]);
            a[0].unshift(this.data[this.Max_Y - 1][this.Max_X - 1]);
            for (let i = 0; i < this.Max_X; i++) {
                a[i + 1] = this.data[i].concat([this.data[i][0]]);
                a[i + 1].unshift(this.data[i][this.Max_X - 1]);
            }
            a[this.Max_X + 1] = this.data[0].concat([this.data[0][0]]);
            a[this.Max_X + 1].unshift(this.data[0][this.Max_X - 1]);
        } else {//不是则在新数组中居中放置数据，边缘置零
            a[0] = new Array(this.Max_X + 2);
            a[0].fill(0, 0, this.Max_X + 2);
            for (let i = 0; i < this.Max_Y; i++)
                a[i + 1] = [0].concat(this.data[i], [0]);
            a[this.Max_Y + 1] = new Array(this.Max_X + 2);
            a[this.Max_Y + 1].fill(0, 0, this.Max_X + 2);
        }
        //求每九格中的细胞数
        for (let i = 0; i < a.length; i++)
            for (let j = 1; j < a[i].length; j++)
                a[i][j] += a[i][j - 1];
        for (let i = 0; i < a.length; i++)
            for (let j = a[i].length - 1; j > 2; j--)
                a[i][j] -= a[i][j - 3];
        for (let i = 1; i < a.length; i++)
            for (let j = 2; j < a[i].length; j++)
                a[i][j] += a[i - 1][j];
        for (let i = a.length - 1; i > 2; i--)
            for (let j = 2; j < a[i].length; j++)
                a[i][j] -= a[i - 3][j];
        //将数据覆写回去
        for (let i = 2; i < this.Max_X + 2; i++)
            for (let j = 2; j < this.Max_Y + 2; j++) {
                this.data[i - 2][j - 2] = this.alive(i, j);
            }
    };

    //对自身进行旋转/翻转内容操作后返回自身,可使用“+,-,x,y"分别代表正旋90deg,逆旋90deg,x轴左右翻转，y轴上下翻转
    this.transformation = function (a = "+") {
        switch (a) {
            case "+": {
                let a = Array(this.Max_X);
                for (let i = 0; i < this.Max_X; i++)
                    a[i] = Array(this.Max_Y);
                for (let i = 0; i < this.Max_Y; i++) {
                    for (let j = 0; j < this.Max_X; j++)
                        a[j][this.Max_Y - 1 - i] = this.data[i][j];
                }
                delete this.data;
                this.data = a;
                break;
            }
            case "-": {
                let a = Array(this.Max_X);
                for (let i = 0; i < this.Max_X; i++)
                    a[i] = Array(this.Max_Y);
                for (let i = 0; i < this.Max_Y; i++) {
                    for (let j = 0; j < this.Max_X; j++)
                        a[this.Max_X - 1 - j][i] = this.data[i][j];
                }
                delete this.data;
                this.data = a;
                break;
            }
            case "x": {
                this.data = this.data.map((value) => {
                    return value.reverse()
                })
                break;
            }
            case "y": {
                this.data = this.data.reverse();
                break;
            }
        }
        return this;
    }

    //用于在(x,y)位置放置一个已有空间的复制,待完善
    this.add = function (x = 0, y = 0, part = new Space(1, 1, true, [[true]])) {
        if (this.Max_X > part.Max_X && this.Max_Y > part.Max_Y) {
            if (this.isloop) {
                for (let i = x, ii = 0; i < part.Max_X; i = (i + 1) % this.Max_X, ii++)
                    for (let j = y, jj = 0; j < part.Max_Y; j = (j + 1) % this.Max_Y, jj++)
                        if (part.data[ii][jj])
                            this.data[i][j] = !this.data[i][j];
            } else {
                for (let i = x, ii = 0; i < this.Max_X && ii < part.Max_X; i++, ii++)
                    for (let j = y, jj = 0; i < this.Max_Y && jj < part.Max_Y; j++, jj++)
                        if (part.data[ii][jj])
                            this.data[i][j] = !this.data[i][j];
            }
            return true;
        } else
            return false;
    }

    this.data.toString = function () {
        return this.map((value) => {
            return value.map((value) => {
                return Number(value)
            });
        });
    }

    //打包世界内容，待定义
    this.save = function (name = "") {
        let s = new Blob([JSON.stringify(this, (key, value) => {
                if (key === "data")
                    return value.map((value) => {
                        return value.map((value) => {
                            return Number(value)
                        });
                    });
                else return value;
            })],
            {type: "charset=Utf-8"});
        let a = document.createElement("a");
        a.href = URL.createObjectURL(s);
        a.download = name + ".json";
        a.click();
        URL.revokeObjectURL(a.href);
    }
}

//一些常见的结构
let signetSet = [];
signetSet.push(new Space(2, 2, true, [[1, 1], [1, 1]]));
signetSet.push(new Space(3, 3, true, [[1, 1, 1], [1, 0, 0], [0, 1, 0]]));
signetSet.push(new Space(4, 3, true, [[0, 1, 1, 0], [1, 0, 0, 1], [0, 1, 1, 0]]));
signetSet.push(new Space(1, 3, true, [[1], [1], [1]]));

class ActiveSpace extends Space {
    //世界演化状态标志，真意味着此时世界正在自动演化,对外只读，只能通过stepOn和stop方法修改
    #active = false;
    //世界自动演化最小间隔，默认每100ms一步
    #wordInterval = 100;
    #stepNum = 0;
    #minInterval = Math.ceil(this.Max_X * this.Max_Y / 1000);
    #history = {
        0: JSON.stringify(this, () => {
        })
    };
    //持续演化函数
    stepOn = new function () {
        let SpaceStepper;
        let steps = 0;
        let handle;

        function stepper() {
            if (this.#active) {
                this.step();
            } else {
                this.#active = false;
                clearInterval(SpaceStepper);
            }
        }

        function steppers() {
            if (this.#active && steps) {
                this.step();
                steps--;
            } else {
                this.#active = false;
                clearInterval(SpaceStepper);
            }
        }

        return function (stepNum = 0) {
            if (typeof stepNum === 'number' && stepNum > 0) {
                steps = stepNum;
                handle = steppers;
            } else {
                steps = 0;
                handle = stepper;
            }
            if (this.#active) clearInterval(SpaceStepper);
            else this.#active = true;
            SpaceStepper = setInterval(handle.bind(this), this.wordInterval);
        };
    };

    constructor(width = 64, length = 64, isloop = true, data) {
        super(width, length, isloop, data);
    };

    //获取演化步数的函数
    get stepNum() {
        return this.#stepNum;
    };

    //获取演化最低间隔时长的函数
    get minInterval() {
        return this.#minInterval;
    };

    get wordInterval() {
        return this.#wordInterval;
    }

    //修改演化最低时间间隔的函数,可在演化过程中修改，会重置定时触发器
    set wordInterval(ms) {
        this.#wordInterval = ms > this.minInterval ? ms : this.minInterval;
        if (this.active)
            this.stepOn();
    };

    //获取世界演化状态
    get active() {
        return this.#active
    };

    //获取历史变化记录
    get history() {
        return new Object(this.#history);
    }

    //使世界停止演化
    stop() {
        this.#active = false
    };

    //重写方法，增加历史记录功能
    step() {
        super.step();
        this.#stepNum++;
    }

    add(x, y, part) {
        let a = super.add(x, y, part);
        if (a) {
            if (this.#stepNum in this.#history)
                this.#history[this.#stepNum] += "add(" + x + "," + y + part.toString() + ")";
            else
                this.#history[this.#stepNum] = "add(" + x + "," + y + part.toString() + ")";
        }
        return a;
    }

    transformation(s) {
        super.transformation(s);
        if (this.#stepNum in this.#history)
            this.#history[this.#stepNum] += "transformation(" + s + ")";
        else
            this.#history[this.#stepNum] = "transformation(" + s + ")";
        return this;
    }
}


//定义word_view类（世界观察器），绑定一个空间Space和一个含有canvas的div用于显示
function WordView(page = document.createElement("div"), word = new ActiveSpace(64, 64, true, 'b')) {
    //存储世界内容
    this.word = word;
    //世界名称
    this.wordName = "世界" + wordNameList();
    //世界显示频率，默认与世界演化速率一致
    let speed = this.word.wordInterval;
    //跟随世界演化而显示标志，真表示正在跟随，只能被display函数修改
    let follow = false;
    //显示时附带网格标志
    let gridLine = false;
    //显示比例:默认每zoom=1000对应100个细胞显示成800*800个像素px，zoom>0
    let zoom = 1000;//放大显示
    //显示的起始点
    let start = [0, 0];
    //色彩搭配集合
    this.colorValue = colorSetBase;
    //画布画布大小难以通过css控制
    let ca = document.createElement("canvas");
    //X轴
    let X_axis = document.createElement("div");
    //Y轴
    let Y_axis = document.createElement("div");
    //画布内容控制类
    let view = ca.getContext("2d");
    //构建类的代码第一部分，完成HTML结构架构和css绑定
    page.append(Y_axis, ca, X_axis);
    page.className = "wordPage";
    //获取被绑定的dom元素,方便先创建再绑定
    this.getPage = function () {
        return page;
    }


    //存储网格图片
    let grid = new ImageData(Math.ceil(this.word.Max_X * zoom / 125), Math.ceil(this.word.Max_Y * zoom / 125));

    //重建网格图片
    function reBuildGrid() {

    }

    //放大显示，步骤：划定显示范围，生成放大着色表，按着色表进行着色获得图片，放置图片
    function enlarge() {
        let dotSize = zoom / 125;
        let img0 = new ImageData(Math.ceil(this.word.Max_X * dotSize), Math.ceil(this.word.Max_Y * dotSize));
        //颜色机制有待修改
        let lifeColor = 0xFF3DCC6D, remainColor = 0xFF66ccFF * 0.1, fill;
        for (let j = 0, a = new Uint32Array(img0.data.buffer); j < this.word.Max_Y; j++)
            for (let jj = 0; jj < this.word.Max_X; jj++) {
                if (this.word.data[j][jj])
                    fill = lifeColor;
                else
                    fill = 0;
                for (let i = (j * img0.width + jj) * dotSize; i < (j + 1) * dotSize * img0.width; i += img0.width)
                    for (let ii = Math.ceil(i), e = i + dotSize; ii < e; ii++)
                        a[ii] = fill;
            }
        view.putImageData(img0, start[0], start[1]);
        //console.log(img0);
    }

    function enlarges() {
        let dotSize = zoom / 125;
        let startPart = [Math.ceil(start[0] / dotSize),
            Math.ceil(start[1] / dotSize),
            Math.floor(start[0] / dotSize + this.word.Max_X),
            Math.floor(start[1] / dotSize + this.word.Max_Y)];
        for (let j = startPart[1]; j < startPart[3]; j++)
            for (let jj = startPart[0]; jj < startPart[2]; jj++) {
                if (this.word.data[j][jj])
                    view.fillStyle = this.colorValue.life;
                else
                    view.fillStyle = this.colorValue.background;
                view.fillRect(Math.ceil(jj * dotSize - start[0]), Math.ceil(j * dotSize - start[1]), Math.ceil(dotSize), Math.ceil(dotSize));
            }
    }

    //缩小显示。待定义
    function dwindle() {//缩小显示

    }

    //展示空间中以(x,y)为起点，zoom为倍率的部分到画布的内容view中
    this.show = function () {
        ca.height = ca.clientHeight;
        ca.width = ca.clientWidth;

        if (zoom >= 125) {
            enlarges.call(this);
        } else
            dwindle.call(this);
    }

    //跟随世界演化以一定帧率上限显示(受限于显示速率speed）
    this.display = new function () {
        let wordDisplayer;
        let flashes = 0;
        let handle;
        //时长测试代码
        let avgTime = 0;
        let flashCount = 0;

        function displayer() {
            if (follow && this.word.active)
                this.show();
            else {
                clearInterval(wordDisplayer);
                follow = false;
            }
        }

        function displayers() {
            if (follow && this.word.active && flashes) {
                //时长测试代码
                avgTime += testTime(this.show.bind(this), false);
                flashCount++;
                //
                flashes--;
            } else {
                clearInterval(wordDisplayer);
                //时长测试代码
                console.log(avgTime / flashCount);
                flashCount = 0;
                //
                follow = false;
            }
        }

        return function (flashNum = 0) {
            if (this.word.active) {
                if (typeof flashNum === 'number' && flashNum > 0) {
                    flashes = flashNum;
                    handle = displayers;
                } else {
                    flashes = 0;
                    handle = displayer;
                }
                if (follow) clearInterval(wordDisplayer);
                else follow = true;
                wordDisplayer = setInterval(handle.bind(this), speed);
            }
        }
    }
    //获取显示状态的函数
    this.getFollow = function () {
        return follow
    };
    //停止显示跟随的函数
    this.stopFollow = function () {
        follow = false
    };
    //用于更改是否显示网格的标志
    this.gridLineChange = function () {
        gridLine = !gridLine;
    }
    this.scale = function (num = 0.2) {
        zoom += num * zoom;
        if (zoom < 125) zoom = 125;
        if (zoom > 10000) zoom = 10000;
        this.show();
    }
    this.getZoom = function () {
        return zoom;
    }
    //显示异常时用于还原屏幕
    this.fitScreen = function () {
        follow = false;
        ca.width = ca.clientWidth;
        ca.height = ca.clientHeight;
        zoom = 1000;
        start = [0, 0];
        gridLine = false;
        this.show();
    }

    //用于保存当前世界的全貌图片，等待渲染器重写
    this.printWord = new function (type = 'png') {
        let screenList = new Sequence();
        return function () {
            let all = document.createElement("canvas");
            all.height = zoom * this.word.Max_Y / 125;
            all.width = zoom * this.word.Max_X / 125;

            let a = document.createElement("a");
            a.href = all.toDataURL(type);
            a.download = this.wordName + "截图" + screenList() + ".png";
            a.click();
        };
    }
    //用于保存现有画布上的图片
    this.printScreen = new function () {
        let screenList = new Sequence();
        return function (type = "png") {
            let a = document.createElement("a");
            a.href = ca.toDataURL(type);
            a.download = this.wordName + "截图" + screenList() + ".png";
            a.click();
        };
    }
    //类构建第二部分，调用函数完成显示
    this.show();
}

function Preview(caElement, Space) {
    this.ca = caElement;
    this.word = Space;
    this.colorValue = colorSetBase;
    with (this.ca) {
        height = clientHeight;
        width = clientWidth;
    }
    let view = this.ca.getContext("2d")
    this.show = function () {
        let dotSize = Math.min(this.ca.width / this.word.Max_X, this.ca.height / this.word.Max_Y)
        if (dotSize >= 1) {
            for (let j = 0; j < this.word.Max_Y; j++)
                for (let jj = 0; jj < this.word.Max_X; jj++) {
                    if (this.word.data[j][jj])
                        view.fillStyle = this.colorValue.life;
                    else
                        view.fillStyle = this.colorValue.background;
                    view.fillRect(Math.ceil(jj * dotSize), Math.ceil(j * dotSize), Math.ceil(dotSize), Math.ceil(dotSize));
                }
        } else {

        }
    }
    this.changeSpace = function (Space) {

    }
}

