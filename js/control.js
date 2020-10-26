var vue = new Vue({
    el: "#player",
    data: {
        isPlaying: false,  //播放状态
        keywords: '',  //搜索框关键词
        isChange: false,
        isSwitch: true,
        music:{
            index: 0,
            name: '',
            artists: '',
            time: '',
            cover: '',
            url: '',
            lyrics: [],
        },  //正在播放的歌曲，对象，包含歌曲信息，比如封面，名字，歌手，时间，路径等
        musicList: [
            {
                id:0,
                name:"Ref:rain",
                artists:"Aimer",
                duration:"04:50",
            },
            {
                id:0,
                name:"unravel",
                artists:"TK from 凛として時雨",
                duration:"04:00",
            },
            {
                id:0,
                name:"愛にできることはまだあるかい",
                artists:"RADWIMPS",
                duration:"06:54",
            }
        ],  //搜索歌曲列表
        volume: 1,
    },
    methods: {
        //关键词搜索歌曲
        searchMusic: function () {
            var that = this;
            axios.get("https://autumnfish.cn/search?keywords=" + this.keywords).then(
                function (response) {
                    // console.log(response);
                    that.musicList = [];
                    var list = response.data.result.songs;
                    for(var i = 0; i < list.length; i++){
                        var song = {};
                        song.id = list[i].id;
                        song.name = list[i].name;
                        song.artists = "";
                        for(var j = 0; j < list[i].artists.length; j++){
                            song.artists += list[i].artists[j].name;
                            if(j < list[i].artists.length - 1)
                                song.artists += '/'
                        }
                        song.duration = that.changeDuration(parseInt(list[i].duration)/1000);
                        that.musicList.push(song);
                    }
                },
                function (err) { }
            );
            this.isChange = true;
        },
        playMusicOnline: function (number) {
            // 获取歌曲地址
            var that = this;
            axios.get("https://autumnfish.cn/song/url?id=" + that.musicList[number-1].id).then(
                function (response) {
                    //console.log(response);
                    //console.log(response.data.data[0].url);
                    that.music.url = response.data.data[0].url;
                },
                function (err) { }
            );
            // 歌曲详情获取
            axios.get("https://autumnfish.cn/song/detail?ids=" + that.musicList[number-1].id).then(
                function (response) {
                    //console.log(response);
                     //console.log(response.data.songs[0].al.picUrl);
                    that.music.cover = response.data.songs[0].al.picUrl;
                },
                function (err) { }
            );
            // 歌词获取
            that.music.lyrics = [];
            axios.get("https://autumnfish.cn/lyric?id=" + that.musicList[number-1].id).then(
                function (response) {
                    var lycTemp = response.data.lrc.lyric.split("\n");
                    for(var i = 0; i < lycTemp.length; i++) {
                        var t = lycTemp[i].substring(lycTemp[i].indexOf("[") + 1, lycTemp[i].indexOf("]"));
                        var ly = {};
                        ly.time = (parseFloat(t.split(":")[0]) * 60 + parseFloat(t.split(":")[1])).toFixed(3);
                        if(isNaN(ly.time))
                            continue;
                        ly.lyric = lycTemp[i].substring(lycTemp[i].indexOf("]") + 1, lycTemp[i].length);
                        that.music.lyrics.push(ly);
                    }
                },
                function (err) { }
            );
            //console.log(that.music.lyrics);
            that.music.index = number;
            that.music.name = that.musicList[number-1].name;
            that.music.artists = that.musicList[number-1].artists;
            that.music.time = that.musicList[number-1].duration;
            this.isPlaying = true;
            document.getElementById('play').src = "img/play_2x.png";
            document.getElementById('songNS').innerHTML = this.music.name + "-" + this.music.artists;
            document.getElementById('timeCT').innerHTML ="00:00/" + this.music.time;
            var audio = document.getElementById("audio");
            audio.src = that.music.url;
            audio.load();
        },
        playMusicLocal: function(number){
            switch (number) {
                case 1:
                    this.music.index = number;
                    this.music.name = this.musicList[0].name;
                    this.music.artists = this.musicList[0].artists;
                    this.music.time = this.musicList[0].duration;
                    this.music.cover = "img/cover.png";
                    this.music.url = "music/Aimer - Ref-rain.mp3";
                    break;
                case 2:
                    this.music.index = number;
                    this.music.name = this.musicList[1].name;
                    this.music.artists = this.musicList[1].artists;
                    this.music.time = this.musicList[1].duration;
                    this.music.cover = "img/cover.png";
                    this.music.url = "music/TK from 凛として時雨 - unravel.mp3";
                    break;
                case 3:
                    this.music.index = number;
                    this.music.name = this.musicList[2].name;
                    this.music.artists = this.musicList[2].artists;
                    this.music.time = this.musicList[2].duration;
                    this.music.cover = "img/cover.png";
                    this.music.url = "music/愛にできることはまだあるかい-RADWIMPS.mp3";
                    break;
                default:
                    console.log("ERROR!");
                    break;
            }
            this.isPlaying = true;
            document.getElementById('play').src = "img/play_2x.png";
            document.getElementById('songNS').innerHTML = this.music.name + "-" + this.music.artists;
            document.getElementById('timeCT').innerHTML ="00:00/" + this.music.time;
            var audio = document.getElementById("audio");
            audio.src = this.music.url;
            audio.load();
        },
        // 歌曲播放
        play: function () {
            var audio = document.getElementById("audio");
            if (this.isPlaying) {// 播放中,点击则为暂停
                this.isPlaying = false;
                audio.pause();
                document.getElementById('play').src="img/pause_2x.png";
            }
            else { // 暂停中,点击则为播放
                if(this.music.index == 0){
                    if(this.isChange){
                        this.playMusicOnline(1);
                        return ;
                    }
                    else{
                        this.playMusicLocal(1);
                        return ;
                    }
                }
                this.isPlaying = true;
                audio.play();
                document.getElementById('play').src="img/play_2x.png";
            }
        },
        skipPrev: function(){
            if(this.isChange){
                if(this.music.index > 1)
                    this.playMusicOnline(this.music.index-1);
                else
                    this.playMusicOnline(this.musicList.length);
            }
            else{
                if(this.music.index > 1)
                    this.playMusicLocal(this.music.index-1);
                else
                    this.playMusicLocal(this.musicList.length);
            }

        },
        skipNext: function(){
            if(this.isChange){
                if(this.music.index < this.musicList.length)
                    this.playMusicOnline(this.music.index + 1);
                else
                    this.playMusicOnline(1);
            }
            else{
                if(this.music.index < this.musicList.length)
                    this.playMusicLocal(this.music.index+1);
                else
                    this.playMusicLocal(1);
            }
        },
        clickVolume:function() {
            var round = document.getElementById("roundV");
            var current = document.getElementById("currentV");
            var total = document.getElementById("totalV");
            var minPosLeft = total.offsetLeft;
            var maxPosLeft = minPosLeft + 100;
            var clickPosLeft = this.getMousePos();
            if (clickPosLeft < minPosLeft) {
                clickPosLeft = minPosLeft;
            }
            if (clickPosLeft > maxPosLeft) {
                clickPosLeft = maxPosLeft;
            }
            round.style.left = (clickPosLeft - 5) + 'px';
            current.style.width = (clickPosLeft - minPosLeft) + 'px';
            this.volume = (clickPosLeft-minPosLeft) / 100;
            this.setVolume(this.volume);
        },
        solidVolume:function(){
            var round = document.getElementById("roundV");
            var current = document.getElementById("currentV");
            var total = document.getElementById("totalV");
            var minPosLeft = total.offsetLeft;
            var maxPosLeft = minPosLeft + 100;
            var firstPosLeft = this.getMousePos();
            var mv = function (e) {
                var moveLength =  this.getMousePos() - firstPosLeft;
                var newPosLeft = round.offsetLeft + moveLength;
                if (newPosLeft < minPosLeft) {
                    newPosLeft = minPosLeft;
                }
                if (newPosLeft > maxPosLeft) {
                    newPosLeft = maxPosLeft;
                }
                round.style.left = newPosLeft + 'px';
                current.style.width = newPosLeft + 'px';
                //this.volume = (clickPosLeft-minPosLeft) / 100;
                //this.setVolume(this.volume);
            }
            document.addEventListener("mousemove",mv)
            // 当监听到鼠标松开的时候，移除mousemove事件
            document.addEventListener("mouseup",function () {
                document.removeEventListener("mousemove",mv)
            })
        },
        setVolume:function(vol){
            var audio = document.getElementById("audio");
            audio.volume = vol;
        },
        setVolumeMute:function () {
            if(document.getElementById("audio").volume > 0)
                this.setVolume(0);
            else
                this.setVolume(this.volume);
        },
        clickProgressBar:function(){
            var round = document.getElementById("roundB");
            var current = document.getElementById("currentB");
            var total = document.getElementById("totalB");
            var minPosLeft = total.offsetLeft;
            var maxPosLeft = minPosLeft + 600;
            var clickPosLeft = this.getMousePos();
            if (clickPosLeft < minPosLeft) {
                clickPosLeft = minPosLeft;
            }
            if (clickPosLeft > maxPosLeft) {
                clickPosLeft = maxPosLeft;
            }
            round.style.left = (clickPosLeft - 5) + 'px';
            current.style.width = (clickPosLeft - minPosLeft) + 'px';
            var audio = document.getElementById("audio");
            audio.currentTime = (clickPosLeft - minPosLeft)/600*(audio.duration);
            //歌曲信息
        },
        clickLycSwitch:function(){
            var lyrics = document.getElementsByTagName("ul")[1];
            var frame = document.getElementById("frame");
            var word = document.getElementById("word");
            if(this.isSwitch){
                lyrics.style.visibility="hidden";
                frame.style.borderColor = word.style.color = "rgba(255,255,255,0.5)";
                this.isSwitch = false;
            }
            else{
                lyrics.style.visibility="visible";
                frame.style.borderColor = word.style.color = "rgba(255,255,255,1.0)";
                this.isSwitch = true;
            }

        },
        getMousePos: function (event) {
            var e = event || window.event;
            return e.clientX;
        },
        changeDuration: function (time) {
            if(typeof(time) =="int"){
                console.log("Type ERROR!!")
                return ;
            }
            var h = Math.floor(parseInt(time) / 60);
            var s = parseInt(time) % 60;
            if(h<10)
                h='0'+h;
            if(s < 10)
                s='0'+s;
            return h+':'+s;
        },
    },
    mounted() {
        var audio = document.getElementById("audio");
        var roundPro = document.getElementById("roundB");
        var currentPro = document.getElementById("currentB");
        var cachePro = document.getElementById("cacheB");
        //var songName = document.getElementById("songNS");
        var time = document.getElementById("timeCT");
        var totalPro = document.getElementById("totalB");
        var lyrics = document.getElementsByTagName("ul")[1];

        // 获得音频正在播放时的处理
        audio.addEventListener('timeupdate', () => {
            var musicTime = audio.duration; // 获得音频时长
            var playTime = audio.currentTime; // 已播放的音频时长
            var cacheTime = audio.buffered.end(0); // 已缓存的音频时长

            roundPro.style.left = (playTime/musicTime*600+300) + 'px';
            currentPro.style.width = (playTime/musicTime*600) + 'px';
            cachePro.style.width = (cacheTime/musicTime*600) + 'px';
            //歌曲信息
            time.innerHTML = this.changeDuration(parseInt(playTime)) + "/" + this.music.time;
            if(this.changeDuration(parseInt(playTime)) == this.music.time){
                this.skipNext();
            }

            for (var i = 0; i < this.music.lyrics.length; i++){
                if(i + 1 == this.music.lyrics.length){
                    if(playTime >  this.music.lyrics[i].time)
                        document.getElementById("lyrics").getElementsByTagName("li")[i].style.color= "rgba(0,0,255,0.2)";
                    else{
                        document.getElementById("lyrics").getElementsByTagName("li")[i].style.color= "rgba(255,255,255,0.7)";
                    }
                    break;
                }
                if(playTime <  this.music.lyrics[i + 1].time && playTime >  this.music.lyrics[i].time){
                    var currentLine = i; //当前正在播放的歌词，即高亮部分
                    var currentLyc = document.getElementById("lyrics").getElementsByTagName("li")[currentLine];
                    currentLyc.style.color = "rgba(0,0,255,0.2)";
                    //滚动
                    lyrics.style.top = 64 - i * (lyrics.offsetHeight/this.music.lyrics.length) +'px';
                }
                else{
                    document.getElementById("lyrics").getElementsByTagName("li")[i].style.color= "rgba(255,255,255,0.7)";
                }
            }
        });

        // 监听颜色进度条是否触摸拖动
        roundPro.addEventListener('onmousemove', (event) => {
            var events = event.targetTouches[0].pageX // 获得触摸拖动的距离
            roundPro.style.left = (roundPro.offsetLeft + events) + 'px';// 计算进度条所在比例宽度
            audio.pause() // 触摸拖动时停止播放
            this.isPlaying = false;
            document.getElementById('play').src="img/pause_2x.png";
        });

        // 监听颜色进度条是否触摸拖动结束
        roundPro.addEventListener('touchend', () => {
            var touwidth = (roundPro.offsetLeft-300) / 600 // 计算进度条所在比例
            audio.currentTime = audio.duration * touwidth // 通过所在比例赋值给音频应在的播放时间
            this.isPlaying = true;
            audio.play();
            document.getElementById('play').src="img/play_2x.png";
        });
    },
});