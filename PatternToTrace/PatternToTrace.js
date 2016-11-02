/**
 * 手势解锁
 * @param itemID canvas标签id
 * @param callback 回调函数(手势解锁不含业务逻辑,只返回对应选中字符串)
 * Created by jinran on 2016/10/28.
 */
function gesture(itemID, callback){
    var c = document.getElementById(itemID);
    var ctx = c.getContext('2d');
    var H = c.offsetHeight;
    var W = c.offsetWidth;
    var R = 10;
    var top = c.getBoundingClientRect().top;
    var left = c.getBoundingClientRect().left;
    var callback = callback || function(){};
    var pointArr = [];
    var restPointArr = [];
    var lineArr = [];

    init();

    /**
     * 初始化解锁图案
     */
    function init(){
        pointArr = [];
        restPointArr = [];
        lineArr = [];
        pointPosition();
        addEvent();
        draw();
    };

    /**
     * 重置解锁图案
     */
    function reset(){
        init();
    };

    function removeEvent(){
        c.removeEventListener('touchstart', touchstart, false);
        c.removeEventListener('touchmove', touchmove, false);
        c.removeEventListener('touchend', touchend, false);
    };

    /**
     * 根据touchmove事件绘制相应帧内容
     */
    function draw(touch, type){
        var style ='#2baf2b';
        switch(type){
            case 'unlock':
                break;
            case 'lock':
                style = '#dd191d';
                break;
            default: break;
        }

        ctx.clearRect(0, 0, W, H);
        //每帧优先画出面板(只画剩余未被激活的point点)
        ctx.fillStyle = '#CFE6FF';
        for(var i=0; i<restPointArr.length; i++){
            ctx.beginPath();
            ctx.arc(restPointArr[i].x, restPointArr[i].y, R, 0, Math.PI * 2, false);
            ctx.closePath;
            ctx.fill();
        }


        //画出选中的解锁点
        ctx.fillStyle = style;
        ctx.strokeStyle = style;
        ctx.lineWidth = 5;
        for(var i=0; i< lineArr.length; i++){
            //画核心
            ctx.beginPath();
            ctx.arc(lineArr[i].x, lineArr[i].y, R, 0, Math.PI * 2, false);
            ctx.closePath;
            ctx.fill();
            //画选中样式
            ctx.beginPath();
            ctx.arc(lineArr[i].x, lineArr[i].y, R+15, 0, Math.PI * 2, false);
            ctx.closePath;
            ctx.stroke();
        }
        //画出相应连线
        if(lineArr.length > 0){
            ctx.lineWidth = 2;
            ctx.beginPath();
            for(var i=0; i<lineArr.length; i++){
                ctx.lineTo(lineArr[i].x, lineArr[i].y);

            }
            ctx.moveTo(lineArr[lineArr.length-1].x,lineArr[lineArr.length-1].y);
            if(touch != null){
                ctx.lineTo(touch.x, touch.y);
            }
            ctx.closePath();
            ctx.stroke();
        }
    };

    function pointPosition(){
        var gx = (W - 2*3*R)/4;
        var gy = (H - 2*3*R)/4;
        for (var row = 0; row < 3; row++) {
            for (var col = 0; col < 3; col++) {
                var Point = {
                    x : ((1 + col) * gx + (col * 2 + 1) * R),
                    y : ((1 + row) * gy + (row * 2 + 1) * R)
                };
                pointArr.push(Point);
                restPointArr.push(Point);
            }
        }
    };

    function addEvent(){
        c.addEventListener('touchstart', touchstart, false);
        c.addEventListener('touchmove', touchmove, false);
        c.addEventListener('touchend', touchend, false);
    };

    //独立eventlistener事件,以便在出错时移除事件不允许操作
    /**
     * touchstart事件
     * @param event
     */
    function touchstart(event){
        var position = getCanvasPosition(event.touches[0]);
        for(var i=0; i< restPointArr.length; i++){
            if (Math.abs(position.x - restPointArr[i].x) < R+10 && Math.abs(position.y - restPointArr[i].y) < R+10) {
                lineArr.push(restPointArr[i]);
                restPointArr.splice(i, 1);
            }
        }
        draw(position, 'unlock');
    };
    /**
     * touchmove事件
     * @param event
     */
    function touchmove(event){
        event.preventDefault();// 某些android 的 touchmove不宜触发 所以增加此行代码
        var position = getCanvasPosition(event.touches[0]);
        for(var i=0; i< restPointArr.length; i++){
            if (Math.abs(position.x - restPointArr[i].x) < R+10 && Math.abs(position.y - restPointArr[i].y) < R+10) {
                lineArr.push(restPointArr[i]);
                restPointArr.splice(i, 1);
            }
        }
        draw(position, 'unlock');
    };
    /**
     * touchend事件
     */
    function touchend(){
        var pwd = '';
        for(var i =0;i < lineArr.length;i++){
            pwd +=pointArr.indexOf(lineArr[i])+1;
        }
        callback(pwd, function(){
            removeEvent();
            draw(null, 'lock');
        }, function(){
            reset();
        });
    };

    /**
     * 取得触摸手势事件坐标对应canvas画布位置坐标
     * @param touch
     * @returns {{x: number, y: number}}
     */
    function getCanvasPosition(touch){
        return {
            x: touch.clientX - left,
            y: touch.clientY - top
        };
    };
};

