var arr=[];
function $(id) {
    return document.getElementById(id);
}
var obj = {
    ROW:4,
    COL:4,
    //分数
    score:0,
    // 是否进行过移动
    is_move:0,
    // 是否进行过合并
    is_merge:0,
    gamestart:function() {
        // 清空panel中的元素
        $("panel").innerHTML="";
        //初始化面板
        obj.init();
        obj.is_move = 1;
        obj.make_random();
        obj.is_move = 1;
        obj.make_random();
        // 更新面板
        obj.update();
        // 如果是移动端设备
        if (obj.what_device()) {
            var startx, starty;
            // 获得滑动的角度
            function getAngle(angx, angy) {
                var angle = Math.atan2(angx, angy) * 180 / Math.PI;
                return angle;
            }
            //根据起点终点返回方向，1 向左 2 向右 3 向上 4 向下 0 未滑动
            function getDirection(startx, starty, endx, endy) {
                var angx = endx - startx;
                var angy = endy - starty;
                var result = 0;
                //如果滑动距离太短
                if (Math.abs(angx) < 2 && Math.abs(angy) < 2) {
                    return result;
                }

                var angle = getAngle(angx, angy);
                if (angle >= -135 && angle <= -45) {
                    result = 1;
                } else if (angle > 45 && angle < 135) {
                    result = 2;
                } else if ((angle >= 135 && angle <= 180) || (angle >= -180 && angle < -135)) {
                    result = 3;
                } else if (angle >= -45 && angle <= 45) {
                    result = 4;
                }
                return result;
            }
            document.addEventListener("touchstart", function(e) {
                e = e || window.e;
                //e.preventDefault();
                startx = e.touches[0].pageX;
                starty = e.touches[0].pageY;
            }, true);
            document.addEventListener("touchend", function(e) {
                e = e || window.e;
                //e.preventDefault();
                var endx, endy;
                endx = e.changedTouches[0].pageX;
                endy = e.changedTouches[0].pageY;
                var direction = getDirection(startx, starty, endx, endy);
                switch(direction) {
                case 0:
                    break;
                case 1:
                    obj.move_left_pre();
                    break;
                case 2:
                    obj.move_right_pre();
                    break;
                case 3:
                    obj.move_up_pre();
                    break;
                case 4:
                    obj.move_down_pre();
                    break;
                default:
                    break;
                }
                $("score").innerHTML = obj.score;
                obj.make_random();
                obj.update();
            }, true);
        } else {
            // PC端
            // 键盘按下事件响应方法
            document.addEventListener("keydown", obj.key_down);
        }
    },
    key_down:function (e) {
        e.preventDefault();
        switch (e.keyCode) {
        case 37:
            obj.move_left_pre();
            break;
        case 38:
            obj.move_up_pre();
            break;
        case 39:
            obj.move_right_pre();
            break;
        case 40:
            obj.move_down_pre();
            break;
        }
        //每当键盘按下即更新分数
        $("score").innerHTML = obj.score;
        obj.make_random();
        obj.update();
    },
    init:function() {
        obj.score = 0;
        for(var i = 0; i < obj.ROW; ++i) {
            for (var j = 0; j < obj.COL; ++j) {
                arr[i * obj.COL + j] = 0;
                var createEle = document.createElement("div");
                createEle.setAttribute("id", "g"+eval(i*obj.COL+j));
                createEle.style.textAlign = "center";
                createEle.style.cssFloat = "left";
                createEle.style.borderRadius = "6px";
                var client_width = document.body.clientWidth;
                if (!obj.what_device()) {
                    if (client_width <= 480) {
                        createEle.style.width = "60px";
                        createEle.style.height = "60px";
                        createEle.style.marginLeft = "8px";
                        createEle.style.marginTop = "8px";
                    } else {
                        createEle.style.width = "100px";
                        createEle.style.height = "100px";
                        createEle.style.marginLeft = "16px";
                        createEle.style.marginTop = "16px";
                    }
                } else {
                    if (client_width <= 480) {
                        createEle.style.width = "60px";
                        createEle.style.height = "60px";
                        createEle.style.marginLeft = "8px";
                        createEle.style.marginTop = "8px";
                    } else {
                        createEle.style.width = "60px";
                        createEle.style.height = "60px";
                        createEle.style.marginLeft = "8px";
                        createEle.style.marginTop = "8px";
                    }
                }
                $("panel").appendChild(createEle);
            }
        }
    },
    done:function() {
        $("game").style.display = "none";
        $("gameover").style.display = "none";
    },
    make_random:function() {
        while (obj.is_move != 0 || obj.is_merge != 0){
            var ran = Math.floor(Math.random()*obj.ROW*obj.COL);
            if (arr[ran] == 0) {
                arr[ran] = (Math.random() > 0.7) ? 4 : 2;
                break;
            }
        }
        obj.is_move = 0;
        obj.is_merge = 0;
    },
    is_dead:function() {
        var i, j;
        for (i = 0; i < obj.ROW * obj.COL; ++i) {
            if (arr[i] == 0) {
                return false;
            }
        }
        for (i = 0; i < obj.ROW * obj.COL; i += obj.ROW) {
            for (j = i; j < i + obj.ROW - 1; ++j) {
                if (arr[j] == arr[j + 1]) {
                    return false;
                }
            }
        }
        for (i = 0; i < obj.ROW; ++i) {
            for (j = i; j < i + obj.ROW * (obj. ROW - 1); j += obj.ROW) {
                if (arr[j] == arr[j + obj.ROW]) {
                    return false;
                }
            }
        }
        return true;
    },
    update:function() {
        var is_win = 0;
        for (var i = 0; i < arr.length; ++i) {
            if (arr[i] == 0) {
                $("g"+i).setAttribute("class", "n0 color_2_4");
                $("g" + i).innerHTML = "";
            } else {
                $("g"+i).innerHTML = arr[i];
                if (arr[i] > 4) {
                    $("g"+i).setAttribute("class", "n"+arr[i] + " color_2048 in" + arr[i]);
                } else {
                    $("g"+i).setAttribute("class", "n"+arr[i] + " in" + arr[i]);
                }
                if (arr[i] == 2048) {
                    is_win = 1;
                }
            }
        }
        if (is_win == 1) {
            $("game").style.display = "block";
            $("gameover").style.display = "block";
            $("finish").innerHTML = "Winner!<br>Score:"+obj.score;
            $("again").innerHTML="Continue!";
            $("again").style.cursor = "pointer";
            if (obj.what_device()) {
            } else {
                document.removeEventListener("keydown", obj.key_down);
            }
        }
        if (obj.is_dead()) {
            $("game").style.display = "block";
            $("gameover").style.display = "block";
            $("finish").innerHTML = "Game Over!<br>Score:" + obj.score;
            $("again").innerHTML="Try again!";
            $("again").style.cursor = "pointer";
        }
    },
    move_go:function(loop_count, current_i, direction) {
        var i;
        for (i = 0; i < loop_count; ++i) {
            // 如果当前的这个有数字，而且它旁边的没有数字才可以移动
            if (arr[current_i] != 0 && arr[current_i + direction] == 0) {
                // 把当前的值赋给它要去的位置
                arr[current_i + direction] = arr[current_i];
                // 把当前的值设置为0，表示这是空格子
                arr[current_i] = 0;
                // 修改当前的下标
                current_i += direction;
                // 表明进行过一次移动
                obj.is_move = 1;
            }
        }
    },
    merge:function(current_i, direction) {
        // 如果当前的数字不为0而且挨着它的那个也不为0，并且这两个数字相等的时候才进行合并
        if (arr[current_i] != 0 && arr[current_i + direction] != 0 && arr[current_i] == arr[current_i + direction]) {
            // 把当前的值修改为原来的2倍，这时候有可能产生空白，交给下一次移动就行处理
            arr[current_i] = arr[current_i + direction] * 2;
            // 统计分数
            obj.score += arr[current_i];
            // 把它原来的旁边那个设置为0，因为已经进行合并了
            arr[current_i + direction] = 0;
            current_i += direction;
            // 表明进行过一次合并
            obj.is_merge = 1;
        }
    },
    move_left:function() {
        var i, loop_count, direction;
        for (i = 0; i < obj.ROW * obj.COL; ++i) {
            if (arr[i] != 0) {
                //需要移动的次数
                //左边第一列不需要动
                loop_count = (i + obj.ROW) % obj.ROW;
                // 向左移动看它前一个，所以direction给-1
                direction = -1;
                obj.move_go(loop_count, i, direction);
            }
        }
    },
    move_left_pre:function() {
        obj.move_left();
        var i, j, direction = 1;
        for(i = 0; i < obj.ROW; ++i) {
            for (j = obj.COL * i; j < obj.ROW * i + (obj.ROW - 1); ++j) {
                obj.merge(j, direction);
            }
        }
        obj.move_left();
    },
    move_down:function() {
        var i, loop_count, direction;
        for (i = obj.ROW * obj.COL - 1; i >= 0; --i) {
            if (arr[i] != 0) {
                loop_count = (obj.ROW - 1) - i / obj.ROW;
                direction = obj.ROW;
                obj.move_go(loop_count, i, direction);
            }
        }
    },
    move_down_pre:function() {
        obj.move_down();
        var i, j, direction = -obj.ROW;
        for (i = obj.ROW - 1; i >= 0; --i) {
            for (j = i + obj.ROW * (obj.ROW - 1); j >= obj.ROW; j -= obj.ROW) {
                obj.merge(j, direction);
            }
        }
        obj.move_down();
    },
    move_up:function() {
        var i, loop_count, direction;
        for (i = 0; i < obj.ROW *obj.COL; ++i) {
            if (arr[i] != 0) {
                loop_count = i / obj.ROW;
                direction = -obj.ROW;
                obj.move_go(loop_count, i, direction);
            }
        }
    },
    move_up_pre:function() {
        obj.move_up();
        var i, j, direction = obj.ROW;
        for (i = 0; i < obj.ROW; ++i) {
            for (j = i; j < obj.ROW * (obj.ROW - 1); j += obj.ROW) {
                obj.merge(j, direction);
            }
        }
        obj.move_up();
    },
    move_right:function() {
        var i, loop_count, direction;
        for (i = obj.ROW * obj.COL - 1; i >= 0; --i) {
            if (arr[i] != 0) {
                loop_count = (obj.ROW - 1) - (i + obj.ROW) % obj.ROW;
                direction = 1;
                obj.move_go(loop_count, i, direction);
            }
        }
    },
    move_right_pre:function() {
        obj.move_right();
        var i, j, direction = -1;
        for (i = obj.ROW - 1; i >= 0; --i) {
            for (j = obj.ROW * i + (obj.ROW - 1); j > obj.ROW * i; --j) {
                obj.merge(j, direction);
            }
        }
        obj.move_right();
    },
    what_device:function() {
        var user_agent_info = navigator.userAgent.toLowerCase();
        var agents = ["android", "iphone", "symbianos"/*塞班系统*/, "windows phone", "ipad", "ipod"];
        for (var i = 0; i < agents.length; ++i) {
            if (user_agent_info.indexOf(agents[i]) >= 0) {
                //如果是移动端return true
                return true;
            } else {
                //如果是pc端return false;
                return false;
            }
        }
    }
}
window.onload=function() {
    obj.gamestart();
}
