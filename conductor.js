var view_area = document.getElementById("view_area");
var axis_x = document.getElementById("axis_x");
var axis_y = document.getElementById("axis_y");
var word_view = document.getElementById("word_view");
var view=word_view.getContext('2d');
Word=new Space(word_view.length,word_view.width,true);
//实现显示界面放缩,100为初始倍率,正好能显示出全部的点
function scale(multiple=100){

}
//实现显示界面的平移,以当前倍率为准，向左平移x个像素，向右平移y个像素
function transform(x =0,y=0){

}
