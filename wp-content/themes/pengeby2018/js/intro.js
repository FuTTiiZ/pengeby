var videoLanguage = "dk";

if (languageVersion) {
    videoLanguage = languageVersion;
}


var subtitlesObject

function loadSubtitles() {
    //console.log("load intro subs");
    $.ajax({
        type: 'GET',
        url: 'gameadmin/getcontent/intro.json',
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
    }).done(setupSubtitles);
}




var subTimerLimit;



function setupSubtitles(data) {
    //console.log(data)
    subtitlesObject = data
    //console.log("subtitlesObject: ")
    //console.log(subtitlesObject)


}


function resizeEvent() {
    //console.log("intro resize");
    //1280 x 920
    /*var xScale = $( window ).width() / 1280;
    if((xScale*920) > $( window ).height() ){
        var yScale = $( window ).height()/920;
        $("#introvideo").css("width", (yScale * 1280)+"px");
    }else{
        $("#introvideo").css("width", "100%");
    }

    var videoScale = $("#introvideo video").width() / 1280;
    */

    var videoScale = Math.min((window.innerWidth / 1024), (window.innerHeight / 720));
    //console.log(window.innerWidth)
    //console.log(window.innerWidth/1024)
    //console.log(window.innerHeight)
    //console.log(window.innerHeight/720)
    //console.log(videoScale);

    if (videoScale < 1) {
        //console.log("resi");
        /*var offset = Math.floor((window.innerWidth-(window.innerWidth*videoScale))/2);
        
        console.log(offset);
        

        TweenMax.set("#introvideo", { width: Math.floor(100*videoScale)+"%" });

        

        TweenMax.set("#showVideoSubtitles", {top:"-10%",left:"22%"});
        TweenMax.set("#skipintrobtn", {top:"85%",left:"62%"});
        TweenMax.set("#mutebtn", {top:"93%",left:"20%"});

        var offset = $("#introvideo").css("marginLeft");
        $("#introvideo").css("marginLeft",offset+"px");*/
        $("#introvideo").css("width", "100%");
        $("#introvideo").css("height", "100%");

        TweenMax.set("#showVideoSubtitles", {
            top: "0",
            left: "0",
            width: "100%",
            height: "25%"
        });
        TweenMax.set("#skipintrobtn", {
            top: "25%",
            left: "50%",
            width: "50%",
            height: "75%"
        });
        TweenMax.set("#mutebtn", {
            top: "25%",
            left: "0",
            width: "50%",
            height: "75%"
        });


    } else {
        $("#introvideo").css("width", "1024px");


        var offset = Math.floor((window.innerWidth - $("#introvideo").width()) / 2);
        TweenMax.set("#showVideoSubtitles", {
            top: "-70px",
            left: (230 + offset) + "px",
            width: "auto",
            height: "auto"
        });
        TweenMax.set("#skipintrobtn", {
            top: 607 + "px",
            left: (640 + offset) + "px",
            width: "auto",
            height: "auto"
        });
        TweenMax.set("#mutebtn", {
            top: 655 + "px",
            left: (200 + offset) + "px",
            width: "auto",
            height: "auto"
        });
    }

    /*
    if(window.innerWidth < 1024){
        var videoScale= window.innerWidth/1024;

        TweenMax.set("#introvideo", { scale: videoScale, transformOrigin:"left top" });

        TweenMax.set("#showVideoSubtitles", {top:"-10%",left:"22%"});
        TweenMax.set("#skipintrobtn", {top:"85%",left:"62%"});
        TweenMax.set("#mutebtn", {top:"93%",left:"20%"});
    }else{
        $("#introvideo").css("width", "1024px");


        var offset = Math.floor((window.innerWidth-$("#introvideo").width())/2);
        TweenMax.set("#showVideoSubtitles", {top:"-70px",left:(230+offset)+"px"});
        TweenMax.set("#skipintrobtn", {top:607+"px",left:(640+offset)+"px"});
        TweenMax.set("#mutebtn", {top:655+"px",left:(200+offset)+"px"});
    }
    */
}




function startIntro() {
    //console.log("start intro func");
    /* console.log("intro lan: "+languageVersion);
     if(languageVersion){
         videoLanguage = languageVersion;
     }*/




    loadSubtitles();

    $("#introvideo").show();
    $("#container").hide();
    $("body").css("background", "#08548c");



    $("#introvideo video")[0].src = "images/Pengeby_Intro_" + videoLanguage + ".mp4";

    $("#introvideo video").bind("ended", introFinished);

    subtitlesTimer = setInterval(checkSubtitles, 200);

    $("#introvideo video")[0].play();

    $(window).resize(resizeEvent);

    resizeEvent();
}

function introFinished() {
    //console.log("intro finished");
    skipIntro();
}

function muteIntro() {
    var vid = $('#introvideo video')[0];
    if (vid.muted) {
        vid.muted = false;
    } else {
        vid.muted = true;
    }
}

var subtitlesTimer;
var videoSubtitlesOn = false;

function showVideoSubtitles() {
    if (videoSubtitlesOn) {
        videoSubtitlesOn = false;
        TweenMax.to($("#videoSubtitles"), 0.3, {
            y: 0
        });
    } else {
        videoSubtitlesOn = true;
        TweenMax.to($("#videoSubtitles"), 0.3, {
            y: 160
        });
    }
}

var currentSpeak = "";

function checkSubtitles() {
    //console.log("progress")
    var progress = $("#introvideo video")[0].currentTime;
    //console.log(progress);

    //velkommen, penge, udseende, værelse, karen, tidsmaskine, post, æbler, farm+port, fam
    if (videoLanguage == "dk") {
        subTimerLimit = new Array(7, 13, 17, 22, 26, 35, 42, 48, 58, 67);
    } else {
        subTimerLimit = new Array(7, 13, 17, 22, 26, 35, 42, 48, 58, 67);
    }

    if (progress < subTimerLimit[0]) {
        currentSpeak = "speak_intro_1"; //0-7
        setSubtitles();
    } else if (progress < subTimerLimit[1]) { //7-13
        currentSpeak = "speak_intro_2";
        setSubtitles()
    } else if (progress < subTimerLimit[2]) { //13-17
        currentSpeak = "speak_intro_3";
        setSubtitles()
    } else if (progress < subTimerLimit[3]) { //17-22
        currentSpeak = "speak_intro_4";
        setSubtitles()
    } else if (progress < subTimerLimit[4]) { //22-26
        currentSpeak = "speak_intro_5"; //karen
        setSubtitles()
    } else if (progress < subTimerLimit[5]) { //26-35
        currentSpeak = "speak_intro_6"; //tidsmaskine
        setSubtitles()
    } else if (progress < subTimerLimit[6]) { //35-42
        currentSpeak = "speak_intro_7"; //post
        setSubtitles()
    } else if (progress < subTimerLimit[7]) { //42-48
        currentSpeak = "speak_intro_8"; //æbler
        setSubtitles()
    } else if (progress < subTimerLimit[8]) { //48-58
        currentSpeak = "speak_intro_farm"; //farm+port
        setSubtitles()
    } else if (progress < subTimerLimit[9]) { //58-67
        currentSpeak = "speak_intro_10"; //familiespil
        setSubtitles()
    } else {
        currentSpeak = "speak_intro_11"; //wizard - 67-
        setSubtitles()
    }


}

function setSubtitles() {
    var subtitles = subtitlesObject[currentSpeak].content;
    $("#videoSubtitles").html(subtitles);
}

function skipIntro() {
    $('#introvideo video')[0].pause();

    clearInterval(subtitlesTimer);

    $("#introvideo").html("");
    $("#introvideo").hide();

    $(window).off("resize", resizeEvent);

    showGame(); //from js
}