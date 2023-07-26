//这个文件实现画布与空间的绑定，并且定义所有相关功能函数的实现
//测试某个函数的运行时间，记得加".call(this)"

//基本显示色彩定义
const colorSetBase = {life: "#99FF33FF", background: '#C5CCC5', remain: "#FFCC66FF"};

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

//定义’空间’类，用于存储生物的信息
//参数为：宽(width->X),长(length->Y),循环(isloop),初始数据(data)
function Space(width = 64, length = 64, isloop = true, data = 'b') {
    this.Max_X = width;
    this.Max_Y = length;
    this.isloop = isloop;
    //世界演化状态标志，真意味着此时世界正在自动演化,对外只读，只能通过stepOn和stop方法修改
    let active = false;
    //世界自动演化最小间隔，默认每100ms一步
    let wordInterval = 100;
    let stepNum = 0;
    let minInterval = Math.ceil(this.Max_X * this.Max_Y / 1000);
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
        for (let i = 0; i < length; i++)
            for (let j = 0; j < width; j++) // noinspection EqualityComparisonWithCoercionJS
                this.data[i][j] = 0 != data[i][j];
    }
    //获取演化步数的函数
    this.getStep = function () {
        return stepNum
    };
    //获取演化最低间隔时长的函数
    this.getWordInterval = function () {
        return wordInterval
    };
    //修改演化最低时间间隔的函数,可在演化过程中修改，会重置定时触发器
    this.setWordInterval = function (ms = 100) {
        wordInterval = ms > minInterval ? ms : minInterval;
        if (active)
            this.stepOn()
    };
    //获取世界演化状态的函数
    this.getActive = function () {
        return active
    };
    //是世界停止演化的函数
    this.stop = function () {
        active = false
    };
    //使生命演化 1 步的函数
    this.step = function () {
        //按照是否循环对数组进行初始化
        let a = new Array(this.Max_Y + 2);
        //a.fill(new Array(this.Max_X+2), 0, this.Max_Y + 2);
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
            a[0].fill(0, 0, this.Max_Y + 2);
            for (let i = 0; i < this.Max_X; i++)
                a[i + 1] = [0].concat(this.data[i], [0]);
            a[this.Max_X + 1].fill(0, 0, this.Max_Y + 2);
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
        function alive(i, j) {
            if (this.data[i - 2][j - 2]) {
                return a[i][j] === 3 || a[i][j] === 4;
            } else {
                return a[i][j] === 3;
            }
        }

        for (let i = 2; i < this.Max_X + 2; i++)
            for (let j = 2; j < this.Max_Y + 2; j++) {
                this.data[i - 2][j - 2] = alive.call(this, i, j);
            }
        stepNum++;
    };

    //持续演化函数,暂时无法清除定时器
    this.stepOn = new function () {
        let SpaceStepper;
        let steps = 0;
        let handle;

        function stepper() {
            if (active) {
                this.step();
            } else {
                active = false;
                clearInterval(SpaceStepper);
            }
        }

        function steppers() {
            if (active && steps) {
                this.step();
                steps--;
            } else {
                active = false;
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
            if (active) clearInterval(SpaceStepper);
            else active = true;
            SpaceStepper = setInterval(handle.bind(this), wordInterval);
        };
    }
    //用于在(x,y)位置放置一个已有空间的复制
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
}

//定义word_view类，绑定一个空间Space和一个含有canvas的div用于显示
function WordView(page = document.createElement("div"), word = new Space(64, 64, true, 'r3')) {
    //存储世界内容
    this.word = word;
    //世界显示频率，默认与世界演化速率一致
    let speed = this.word.getWordInterval();
    //跟随世界演化而显示标志，真表示正在跟随，只能被display函数修改
    let follow = false;
    //显示比例:默认每zoom=100个元胞显示成800*800个像素px，zoom>0
    this.zoom = 1000;//放大显示
    //显示起始点
    this.start = {x: 0, y: 0};
    //色彩搭配集合
    this.colorValue = colorSetBase;
    //画布
    let ca = document.createElement("canvas");
    ca.width = this.word.Max_X * 8;
    ca.height = this.word.Max_Y * 8;
    //X轴
    let X_axis = document.createElement("div");
    //Y轴
    let Y_axis = document.createElement("div");
    //画布内容控制类
    let view = ca.getContext("2d");


    //放大显示
    function enlarge() {
        let dotSize = this.zoom / 125;
        let img0 = new ImageData(Math.ceil(this.word.Max_X * dotSize), Math.ceil(this.word.Max_Y * dotSize));
        //颜色机制有待修改
        let lifeColor = 0xFF33FF99, remainColor = 0xFF66ccFF * 0.1, fill;
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

        view.putImageData(img0, this.start.x, this.start.y);
        //console.log(img0);
    }

    //缩小显示。待定义
    function dwindle() {//缩小显示

    }

    //展示空间中以(x,y)为起点，zoom为倍率的部分到画布的内容view中
    this.show = function () {
        if (this.zoom >= 1000)
            enlarge.call(this);
        else
            dwindle.call(this);
    }

    //跟随世界演化以一定帧率上限显示(受限于显示速率speed）
    this.display = new function () {
        let wordDisplayer;
        let flashes = 0;
        let handle;

        function displayer() {
            if (follow && this.word.getActive())
                this.show();
            else {
                clearInterval(wordDisplayer);
                follow = false;
            }
        }

        function displayers() {
            if (follow && this.word.getActive() && flashes) {
                this.show();
                flashes--;
            } else {
                clearInterval(wordDisplayer);
                follow = false;
            }
        }

        return function (flashNum = 0) {
            if (this.word.getActive()) {
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
    //用于保存现在界面的图片
    this.print_to = function (type = 'png') {
        let imgdata = view.getImageData(0, 0, view.width, view.height);
    }
    //构建类的代码
    page.append(ca, X_axis, Y_axis);
    page.className = "view_page";
    this.show();
}

