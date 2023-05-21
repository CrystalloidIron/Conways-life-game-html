//这个文件实现画布与空间的绑定，并且定义所有相关功能函数的实现

//显示色彩定义
colorSetBase = {life: "#99FF33FF", background: '#C5CCC5', remain: "#FFCC66FF"}

function ColorValue(life = 0x99FF33FF, background = 0xC5CCC5FF, remain = 0xFFCC66FF) {
    this.life = life;
    this.background = background;
    this.remain = remain;
}

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
//参数为：长(length),宽(width),循环(isloop),初始数据(data)
function Space(length = 100, width = 100, isloop = true, data) {
    this.Max_X = length;
    this.Max_Y = width;
    this.isloop = isloop;
    if (data === null || typeof data !== typeof [[]]) {
        this.data = [];
        this.data.fill([].fill(false, 0, width), 0, length);
    } else {
        for (let i = 0; i < length; i++)
            for (let j = 0; j < length; j++) { // noinspection EqualityComparisonWithCoercionJS
                    if(0 == data[i][j])this.data[i][j]=false;
                    else this.data=true;
                }
    }
    //使生命演化 1 步的函数
    function step() {
        //按照是否循环对数组进行初始化
        let a = [];
        a.fill([], 0, this.Max_X + 2);
        if (this.isloop) {//是则在新数组中将数据居中平铺
            a[0] = this.data[-1][-1] + this.data[-1] + this.data[-1][0];
            for (let i = 0; i < this.Max_X; i++)
                a[i + 1] = this.data[i][-1] + this.data[i] + this.data[i][0];
            a[this.Max_X + 1] = this.data[0][-1] + this.data[0] + this.data[0][0];
        } else {//不是则在新数组中居中放置数据，边缘置零
            a[0].fill(0, 0, this.Max_Y + 2);
            for (let i = 0; i < this.Max_X; i++)
                a[i + 1] = 0 + this.data[i] + 0;
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
        for (let i = 2; i < this.Max_X + 2; i++)
            for (let j = 2; j < this.Max_Y + 2; i++)
                this.data[i][j] = (a[i][j] === 3 && a[i][j] === 2);
    }
    //用于在(x,y)位置放置一个已有空间的复制
    function add(x = 0, y = 0, part = new Space(1,1,true,[[true]])) {
        if (this.Max_X > part.Max_X && this.Max_Y > part.Max_Y) {
            if (this.isloop) {
                for (let i = x, ii = 0; i < part.Max_X; i = (i + 1) % this.Max_X, ii++)
                    for (let j = y, jj = 0; j < part.Max_Y; j = (j + 1) % this.Max_Y, jj++)
                        if(part.data[ii][jj])
                        this.data[i][j] = !this.data[i][j] ;
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
function WordView(page = document.createElement("div"), word = new Space()) {
    //存储世界内容
    this.word = word;
    //显示比例:默认每zoom=100个元胞显示成400*400个像素px^2，zoom>0
    this.zoom = 100;
    //显示起始点
    this.start = [0, 0];
    //色彩搭配集合
    this.colorValue = new ColorValue(colorSetBase);
    //画布
    let ca = document.createElement("canvas");
    //X轴
    let X_axis = document.createElement("div");
    //Y轴
    let Y_axis = document.createElement("div");
    //画布内容控制类
    let view = ca.getContext("2d");

    function enlarge() {//放大显示////该内部方法中this不指向word_view类
        //console.log(this.word);
        let img0 = new ImageData(this.zoom * this.word.Max_X / 50, this.zoom * this.word.Max_Y / 50).data;
        //console.log(img0);
        let start = new Date().getMilliseconds();
        for (let i = 0, a = new Uint32Array(img0.buffer); i < a.length; i++) {
            a[i] = this.colorValue.background;
        }
        let end = new Date().getMilliseconds();
        console.log(end - start);
        let img = new ImageData(img0, this.zoom * this.word.Max_X / 50);
        view.putImageData(img, 0, 0);
    }

    function dwindle() {//缩小显示

    }

    //展示空间中以(x,y)为起点，zoom为倍率的部分到画布的内容view中
    this.show = function () {
        if (this.zoom >= 100)
            enlarge.call(this);
        else
            dwindle.call(this);
    }

    //用于保存现在界面的图片
    this.print_to = function (type = 'png') {
        let imgdata = view.getImageData(0, 0, view.width, view.height);
    }
    //构建类的代码
    page.append(ca, X_axis, Y_axis);
    page.className = "view_page";
    ca.width = this.word.Max_X;
    ca.height = this.word.Max_Y;
    // noinspection JSValidateTypes
    view.fillStyle = toColor(this.colorValue.background);
    view.fillRect(0, 0, ca.width, ca.height);
    this.word = new Space(Math.floor(ca.height / 2), Math.floor(ca.width / 2));
    this.show();
}

