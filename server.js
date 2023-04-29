//'use strict';
//loop_num用于循环空间的数据计算，特点是进行加减等计算操作时会自动进行取模，由前面一个数的MOD决定
/*function loop_num(mod = 2, a = 0) {
    this.MOD = mod;
    if (typeof a == 'number')
        return a % this.MOD;
    else
        return this.MOD;
}
*/
//定义’空间’类，用于存储生物的信息
//参数为：长(length),宽(width),循环(isloop),初始数据(data)
function Space(length = 1000, width = 1000, isloop = true, data) {
    this.Max_X = length;
    this.Max_Y = width;
    this.isloop = isloop;
    if (data === null || typeof data !== typeof [[]]) {
        this.data = [];
        this.data.fill([].fill(false, 0, width), 0, length);
    } else {
        for(let i=0;i<length;i++)
            for(let j=0;j<length;j++)
                { // noinspection EqualityComparisonWithCoercionJS
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
        } else {//不是则在新数组中居中数据，边缘置零
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
                        if(part.data[ii][jj])
                            this.data[i][j] = !this.data[i][j] ;
            }
            return true;
        } else
            return false;
    }

    //展示空间中以(x,y)为起点，zoom为倍率的部分到画布的内容view中
    function show(x=0,y=0,zoom=100,
                  view=document.createElement("canvas").getContext("2d")){

    }
}
