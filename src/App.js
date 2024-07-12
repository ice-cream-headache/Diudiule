import React from 'react';
import presscur from './cur/press.cur';
import normalcur from './cur/normal.cur';

const electron = window.require('electron');
const { ipcRenderer } = electron;

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      translateX: 0,
      translateY: 0,
      cur: false,
      target: 0,
      now:0,
      action:"0",
    };
    this.moving = false;
    this.accelarate = false;
    this.accelaratex= 0;  //x轴初速度
    this.accelaratey = 0;  //y轴初速度
    this.lasttime = 0;
    this.click = false;
    this.lastX = null;
    this.lastY = null;
    this.longP = null;
    this.cover = document.createElement('div');
    this.cover.style.position = 'fixed';
    this.cover.style.top = 0;
    this.cover.style.left = 0;
    this.cover.style.right = 0;
    this.cover.style.bottom = 0;
  }

  componentDidMount() {

    window.RufflePlayer = window.RufflePlayer || {};
    window.RufflePlayer.config = {
      "allowScriptAccess": true,
      "autoplay": "on",
      "unmuteOverlay": "hidden",
      "backgrounColor": null,
      "contextMenu": false,
      "preloader": false,
      "quality": "best",
      "warnOnUnsupportedContent": true,
      "wmode": "transparent",
    };

    const ruffle = window.RufflePlayer.newest();
    let player = ruffle.createPlayer();
    player.style.width = "160px";
    player.style.height = "160px";
    player.style.zIndex = -1;
    document.getElementById("pet").append(player);
    player.load("Diudiule_102.swf");

    player.addEventListener("loadeddata", () => {
      // const initPath = this.searchAnimeByName("通常");

      var timer = setInterval(() => {
        if (player.Diudiule_PlayAnimation !== undefined) {
          clearInterval(timer);
          player.Diudiule_PlayAnimation("710");
          player.Diudiule_SetIdle("710");
        }
      }, 100);
    });

    let taskplane = ruffle.createPlayer();
    taskplane.style.width = "188px";
    taskplane.style.height = "112px";
    document.getElementById("plane").append(taskplane);
    taskplane.load("TaskPlane.swf");
    
    taskplane.addEventListener("loadeddata", () => {
      // const initPath = this.searchAnimeByName("通常");

      var timer1 = setInterval(() => {
        if (taskplane.Diudiule_SetTarget !== undefined) {
          clearInterval(timer1);
          var randomDigit = Math.floor(Math.random() * 100);
          taskplane.Diudiule_SetTarget(randomDigit.toString()+"m");
          this.setState({target: randomDigit});
        }
      }, 100);
    });

    //初始化心情模块
    const ruffle1 = window.RufflePlayer.newest();
    let mood = ruffle1.createPlayer();
    mood.style.width = "120px";
    mood.style.height = "70px";
    mood.style.zIndex = -1;
    document.getElementById("addmood").append(mood);
    mood.load("mood.swf")

    window.sucess = () => {
      console.log("sucess");
    }
    
    window.Diudiule_End = () =>{
      ipcRenderer.send("exitApp");
    }
  }

  /********拖拽功能*********/
  longPress = (e) => {
    this.click = false;
    this.moving = true;
    this.beforeDrop();
    // document.querySelector("#pet > ruffle-player")
  };
  onMouseDown = e => {
    // 直接处理左键事件，无需屏蔽
    if (e.button === 0) {
      this.click = true;
      this.lastX = e.clientX;
      this.lastY = e.clientY;
      clearTimeout(this.longP);
      this.longP = setTimeout(
        () => this.longPress(e)
        , 100);
      this.setState({ cur: true });
      window.addEventListener("mousemove", this.onMouseMove);
    }
    window.addEventListener("mouseup", this.onMouseUp);
  };
  onMouseUp = e => {
    if (e.button === 2) { //处理鼠标右键事件，显示菜单栏
      return;
    }
    if (e.button === 0) { //处理鼠标左键事件，判断为点击事件还是拖拽事件
      clearTimeout(this.longP);
      if (this.moving) {
        this.dropped();
      }
      this.moving = false;
      this.click = false;
      this.lastX = null;
      this.lastY = null;
      this.accelarate = false;
      this.lasttime = 0;
    }
    this.setState({ cur: false });
    this.cover.remove();
    window.removeEventListener('mousemove', this.onMouseMove);
    window.removeEventListener('mouseup', this.onMouseUp);
  };
  onMouseMove = e => {
    if (!document.body.contains(this.cover)) {
      document.body.appendChild(this.cover);
    }
    if (this.moving) {
      if (this.lastX && this.lastY) {
        let dx = e.clientX - this.lastX;
        let dy = e.clientY - this.lastY;
        this.setState({
          translateX: this.state.translateX + dx,
          translateY: this.state.translateY + dy,
          rmenux: `calc(100vw - 178px + ${this.state.translateX + dx}px)`,
          rmenuy: `calc(100vh - 250px + ${this.state.translateY + dy}px)`,
        });
        if(dy < 0){
          let dt = (new Date().getTime() - this.lasttime);
          this.accelaratex = Math.max(dx/dt, -5);
          this.accelaratey = Math.max(dy/dt, -20);
          this.accelarate = true;
        }
        this.lastX = e.clientX;
        this.lastY = e.clientY;
        this.lasttime = new Date().getTime();
      }
    }
  };

  beforeDrop = () => {
    var player = document.querySelector("#pet > ruffle-player");
    const randomDigit = Math.floor(Math.random() * 6);
    player.Diudiule_PlayAnimation("77"+randomDigit.toString());
  };

  dropped = () => {
    var player = document.querySelector("#pet > ruffle-player");
    var taskplane = document.querySelector("#plane > ruffle-player");
    if(this.accelarate){
      document.getElementById("pet").style.pointerEvents = "none";
      player.Diudiule_PlayAnimation("786");
      const randomDigit = Math.floor(Math.random() * 6);
      this.setState({action: randomDigit.toString()});

      var time = setInterval(() => {
        var now = this.state.now;
        let translateX = Math.min(266, this.state.translateX + this.accelaratex);
        translateX = Math.max(-1197, translateX);

        let translateY = Math.min(80, this.state.translateY + this.accelaratey);
        if(this.accelaratey<0){
          now =  (this.state.now - this.accelaratey/3).toFixed(1);
          this.accelaratey += 0.05;
          this.accelaratey = Math.min(this.accelaratey, 0);
          taskplane.Diudiule_SetNow(now.toString()+"m");
          if(this.accelaratey==0){
            player.Diudiule_PlayAnimation("73"+this.state.action);
            if(translateY < -window.innerHeight){
              translateY = Math.max(-window.innerHeight-200, translateY);
            }
            this.accelaratey = 2;
          }
        }
        if(translateY >= 80){
          clearInterval(time);
          player.Diudiule_PlayAnimation("74" + this.state.action);
          if(this.state.now > this.state.target){
            var randomDigit = Math.floor(Math.random() * 1000);
            taskplane.Diudiule_SetTarget(randomDigit.toString()+"m");
            document.querySelector("#addmood > ruffle-player").MOOD_AddMood(Math.floor(Math.random() * 100));
          }
          now = 0;
          document.getElementById("pet").style.pointerEvents = "auto";
        }
        this.setState({
          translateX: translateX,
          translateY: translateY,
          now: now,
        });
      }, 20);

    }
    else{
      player.Diudiule_PlayAnimation("740");
    }
  }

  render() {
    return (
      <div>
        <div
        id='plane'
        style={{
          position: "relative",
          transform: `translate(calc(100vw - 188px),calc(100vh - 112px))`
        }}
        ></div>
        <div
          id='pet'
          onMouseDown={this.onMouseDown}
          style={{
            cursor: this.state.cur ? `url(${presscur}),auto` : `url(${normalcur}),auto`,
            position: "relative",
            height: "160px",
            width: "160px",
            zIndex: 0,
            transform: `translate(calc(100vw - 378px + ${this.state.translateX}px),calc(100vh - 342px + ${this.state.translateY}px))`
          }}
        >
          <div
            id={"addmood"}
            style={{
              position: 'absolute',
              left: 65,
              top: 10,
            }}
          ></div>
        </div>
      </div>
    );
  }
}
export default App;
