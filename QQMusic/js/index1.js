/*解决click的300ms延迟问题*/
FastClick.attach(document.body);
const musicBtn = document.querySelector('.music_btn'),
    wrapper = document.querySelector('.main_box .wrapper'),
    progress = document.querySelector('.progress'),
    curTime = progress.querySelector('.cur_time'),
    totalTime = document.querySelector('.total_time'),
    progCur = document.querySelector('.prog_cur'),
    myAudio = document.querySelector('.myAudio');
let lyricList = [];
//获取数据&&绑定数据
const queryData = function queryData() {
    return new Promise(resolve => {
        let xhr = new XMLHttpRequest;
        xhr.open('GET', './json/lyric.json');
        xhr.onreadystatechange = () => {
            let { readyState, status, responseText } = xhr;
            if (readyState === 4 && status === 200) {
                data = JSON.parse(responseText);
                //请求成功：让实例状态为成功，值是获取的歌词(字符串)
                resolve(data.lyric)
            }
        }
        xhr.send()
    })
}
const binding = function binding(lyric) {
    let data = []
    lyric = lyric.replace(/&#(32|40|41|45);/g, (val, $1) => {
        let data = null;
        let table = {
            32: ' ',
            40: '(',
            41: ')',
            45: '-'
        };
        return table[$1] || val;
    })
    lyric.replace(/\[(\d+)&#58;(\d+)&#46;(?:\d+)\]([^&#;]+)(?:&#10;)?/g, (_, minutes, seconds, text) => {
        data.push({
            minutes,
            seconds,
            text
        });

    });
    let str = ``;
    data.forEach(item => {
        let { minutes, seconds, text } = item;
        str += `<p minutes='${minutes}' secondes='${seconds}'>${text}</p>`
    })
    wrapper.innerHTML = str;
    lyricList = Array.from(wrapper.querySelectorAll('p'));


}
const audioPause = function audioPause() {
    myAudio.pause();
    musicBtn.classList.remove('move')
    clearInterval(autoTimer);
    autoTimer = null;
}
const format = function format(time) {
    time = +time;
    let obj = {
        minutes: '00',
        seconds: '00'
    };
    if (time) {
        let m = Math.floor(time / 60),
            s = Math.round(time - m * 60);

        obj.minutes = m < 10 ? '0' + m : '' + m;
        obj.seconds = s < 10 ? '0' + s : '' + s;
    }
    return obj;
}
const handleLyric = function handleLyric() {};
const handleProgress = function handleProgress() {
    let { duration, currentTime } = myAudio,
    a = format(duration),
        b = format(currentTime);
    if (currentTime >= duration) {
        curTime.innerHTML = `00:00`;
        progCur.style.width = `0%`;
        audioPause()
        return
    }
    curTime.innerHTML = `${b.minutes}:${b.seconds}`;
    totalTime.innerHTML = `${a.minutes}:${a.seconds}`;
    progCur.style.width = `${currentTime / duration * 100}%`;
};
$sub.on('playing', handleLyric);
$sub.on('playing', handleProgress);
//控制播放和暂停
let autoTimer = null;
const handle = function handle() {
    musicBtn.style.opacity = 1;
    musicBtn.addEventListener('click', function() {
        if (myAudio.paused) {
            //当前是暂停的，我们让其播放
            myAudio.play();
            musicBtn.classList.add('move');
            if (autoTimer === null) {
                $sub.emit('playing');
                autoTimer = setInterval(() => {
                    $sub.emit('playing');
                }, 1000)
            }
            return
        }
        //当前是播放的，我们让其暂停
        audioPause();
    })
}
document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
        clearInterval(autoTimer);
        autoTimer = null;
        return
    }
    if (autoTimer === null) {
        $sub.emit('playing');
        autoTimer = setInterval(() => {
            $sub.emit('playing');
        }, 1000)
    }
})
queryData().then(value => {
    binding(value);
    handle();
})