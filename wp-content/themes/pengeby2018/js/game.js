/* version 1.3 */
var app;
var gameContainer;
var frontGround;
var sideBar;
var genderSelectContainer;
var cleanUpArray = new Array();
var cleanUpRemoveArray = new Array();

var labelStyle = new PIXI.TextStyle({
    fontFamily: "Arial",
    fontSize: 22,
    fill: "white",
    fontWeight: "bold"
});
var ridderScoreLabelStyle = new PIXI.TextStyle({
    fontFamily: "Arial",
    fontSize: 22,
    fill: "white",
    fontWeight: "bold"
});
var scoreLabelStyle = new PIXI.TextStyle({
    fontFamily: "Arial",
    fontSize: 50,
    fill: "black",
    fontWeight: "bold"
});

var topBar;
var bottomBar;

var GAME_WIDTH = 1024;
var GAME_HEIGHT = 704;

var gameBorder;

var universeBtn;
var backToTimemachineBtn;

var maskLeft;
var maskRight;
var maskBottom;


var language = "dk";
var localTest = false;


// KUNNE HAVE SAT DEN TIL AT KØRE SOM LOCALTEST, MEN JEG VED IKKE OM DE HAR OPDATERET GAMEADMIN SIDEN...
/*if (window.location.hostname == "127.0.0.1" || (window.location.hostname == "pengeby.tekstur.dk" || window.location.hostname == "tekstur.dk")) {
    localTest = true;
    languageVersion = "dk"
    language = languageVersion
} else {*/
    if (languageVersion) {
        language = languageVersion;
    }
//}

var doTrack = true;

var allowCookies = false;
var user;

var mobileScale = 1;

var preloadPopup;
var subtitleArray = {};
var debug;
var gameLoader;
var preloaderLoader;
var gameConfig = {};

var monoFocusField;

var isMobile = false;
var isAndroid;
var firstPreloader = true;

var dressRoomContainer;
var avatar;
var universeContainer;
var universeAmbientSoundsInterval;
var gameSoundArray = new Array();
var isIPad;

function showGame() {
    $(window).resize(gameResizeEvent);
    //$("body").css({"background-color":"rgb(8, 84, 140)"});

    if ($.browser.mobile) {
        isMobile = true;

        isAndroid = navigator.userAgent.toLowerCase().indexOf("android") > -1;
    }

    isIPad = (navigator.userAgent.match(/(iPad)/) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1));


    allowCookies = checkCookie();


    sendStatPoint("start-pengeby");

    setupPixi();
    gameResizeEvent();

    if (isMobile) {
        $("#monoinput input").attr("type", "number");
    }

    if (isMobile && isAndroid) {
        $("#container").html("");
        $("#container").css("background-color", "rgb(8, 84, 140)");

        $(".textinput").focusin(function() {
            $(this).addClass("hasFocus");
            $("#container").show();
            $(".mononameinput").hide();
            $(this).show();
            monoFocusField = this;
        });

        $(".textinput").focusout(function() {
            $(this).removeClass("hasFocus");
            $("#container").hide();
            redrawPersons();
        });

        $('.textinput input').on('keyup', function(e) {
            var mEvent = e || window.event;
            var mPressed = mEvent.keyCode || mEvent.which;
            if (mPressed == 13) {
                $(this).blur();
                $(monoFocusField).removeClass("hasFocus");
                $("#container").hide();
                redrawPersons();
            }
        });
    }
}

function checkCookie() {
    var cookieArray = document.cookie.split(";")
    for (var i = 0; i < cookieArray.length; i++) {
        if (cookieArray[i].indexOf("cookiesOn") != -1) {
            if (cookieArray[i].split("=")[1] == "yes") {
                return true;
                break;
            }
        }
    }

    return false;
}



function gameResizeEvent() {
    app.renderer.resize(window.innerWidth, window.innerHeight);

    if (isMobile || isIPad) {
        if (window.innerHeight > window.innerWidth) {
            $("#rotate-screen").show();
            $("canvas").hide();
        } else {
            $("#rotate-screen").hide();
            $("canvas").show();

            mobileScale = Math.min(window.innerWidth / 1024, window.innerHeight / 704);

            gameContainer.scale.y = gameContainer.scale.x = mobileScale;
            gameContainer.x = (window.innerWidth - (1024 * mobileScale)) / 2;
            gameContainer.y = 0;

            // $("#monoinput input").val(gameContainer.x);

            frontGround.scale.set(mobileScale);
            frontGround.x = gameContainer.x;

            sideBar.scale.set(mobileScale);
            sideBar.x = gameContainer.x;

            var gameAreaHeight = 704 * mobileScale;
            var gameAreaX = gameContainer.x;
            var gameAreaY = (window.innerHeight - gameAreaHeight) / 2;

            gameBorder.clear();
            gameBorder.lineStyle(2, 0x000000);
            gameBorder.drawRect(0, 0, 1024 * mobileScale, 704 * mobileScale);
            gameBorder.x = gameAreaX;
            gameBorder.y = gameAreaY;
            gameBorder.alpha = 0;
            app.stage.addChild(gameBorder);

            if (sideBar.children.length > 0) {
                gameContainer.x += 50;
            }

            if (preloadPopup) {
                preloadPopup.x = gameContainer.x;
                preloadPopup.scale.set(mobileScale);
                preloadPopup.y = 0;
            }

            maskLeft.clear();
            maskLeft.beginFill(0x081933);
            maskLeft.drawRect(0, 0, gameBorder.x, gameBorder.height);
            app.stage.addChild(maskLeft);

            maskRight.clear();
            maskRight.beginFill(0x081933);
            maskRight.drawRect((gameBorder.x + gameBorder.width), 0, gameBorder.x, gameBorder.height);
            app.stage.addChild(maskRight);

            maskBottom.clear();
            maskBottom.beginFill(0x081933);
            maskBottom.drawRect(0, gameBorder.height, window.innerWidth, (window.innerHeight - gameBorder.height));
            app.stage.addChild(maskBottom);

            if (frontGround.avatarBG) {
                resizeBordersForMobile();
            }

            TweenMax.set("#nameinput", {
                scale: mobileScale,
                transformOrigin: "0% 0%"
            });
            $("#nameinput").css("top", Math.floor(211 * mobileScale) + "px");
            $("#nameinput").css("left", "calc(50% + " + Math.floor(112 * mobileScale) + "px)");

            TweenMax.set("#monoinput", {
                scale: mobileScale,
                transformOrigin: "0% 0%"
            });
            $("#monoinput").css("top", Math.floor(409 * mobileScale) + "px");
            // $("#monoinput").css("left","calc(50% + "+Math.floor(115*mobileScale)+"px)");
            $("#monoinput").css("left", Math.floor((520 * mobileScale) + gameContainer.x) + "px");

            TweenMax.set(".mononameinput", {
                scale: mobileScale,
                transformOrigin: "0% 0%"
            });
            $("#mononameinput0").css("top", Math.floor(350 * mobileScale) + "px");
            $("#mononameinput1").css("top", Math.floor(350 * mobileScale) + "px");
            $("#mononameinput2").css("top", Math.floor(448 * mobileScale) + "px");
            $("#mononameinput3").css("top", Math.floor(448 * mobileScale) + "px");
            $("#mononameinput4").css("top", Math.floor(448 * mobileScale) + "px");
            $("#mononameinput5").css("top", Math.floor(550 * mobileScale) + "px");
            $("#mononameinput6").css("top", Math.floor(550 * mobileScale) + "px");
            $("#mononameinput7").css("top", Math.floor(550 * mobileScale) + "px");

            $("#mononameinput0").css("left", "calc(50% - " + Math.floor(106 * mobileScale) + "px)");
            $("#mononameinput1").css("left", "calc(50% - " + Math.floor(3 * mobileScale) + "px)");
            $("#mononameinput2").css("left", "calc(50% - " + Math.floor(135 * mobileScale) + "px)");
            $("#mononameinput3").css("left", "calc(50% - " + Math.floor(23 * mobileScale) + "px)");
            $("#mononameinput4").css("left", "calc(50% + " + Math.floor(87 * mobileScale) + "px)");
            $("#mononameinput5").css("left", "calc(50% - " + Math.floor(135 * mobileScale) + "px)");
            $("#mononameinput6").css("left", "calc(50% - " + Math.floor(23 * mobileScale) + "px)");
            $("#mononameinput7").css("left", "calc(50% + " + Math.floor(87 * mobileScale) + "px)");
        }
    } else { //is desktop
        gameContainer.x = (window.innerWidth - 1024) / 2;

        gameBorder.x = sideBar.x = frontGround.x = gameContainer.x;

        if (sideBar.children.length > 0) {
            gameContainer.x += 50;
        }

        maskLeft.clear();
        maskLeft.beginFill(0x08548c);
        maskLeft.drawRect(0, 0, gameBorder.x, gameBorder.height);
        app.stage.addChild(maskLeft);

        maskRight.clear();
        maskRight.beginFill(0x08548c);
        maskRight.drawRect((gameBorder.x + gameBorder.width), 0, gameBorder.x, gameBorder.height);
        app.stage.addChild(maskRight);

        maskBottom.clear();
        maskBottom.beginFill(0x08548c);
        maskBottom.drawRect(0, gameBorder.height, window.innerWidth, (window.innerHeight - gameBorder.height));
        app.stage.addChild(maskBottom);

    }
}

function resizeBordersForMobile() {
    if (gameContainer.x > 75) {
        frontGround.avatarBG.scale.set(1.2);
        frontGround.avatarBG.x = -100;
        frontGround.avatarBG.y = 440;

        avatar.scale.set(0.46);
        avatar.x = 10;
        avatar.y = 500;

        frontGround.muteBtn.x = 180;

        frontGround.bank.scale.set(1.2);
        frontGround.bank.x = -55;
        frontGround.bank.y = 40;

        frontGround.goldStack.scale.set(1.2);
        frontGround.goldStack.x = -30;
        frontGround.goldStack.y = 215;

        frontGround.silverStack.scale.set(1.2);
        frontGround.silverStack.x = 30;
        frontGround.silverStack.y = 195;

        frontGround.goldTF.x = -30;
        if (user.wallet > 99) {
            frontGround.goldTF.x = -42;
        }
        frontGround.goldTF.y = 400;

        frontGround.silverTF.x = 44;
        frontGround.silverTF.y = 380;

        mayor.children[0].scale.set(1.5);
        mayor.children[0].x = -80;
        mayor.children[0].y = -260;

        mayor.children[1].scale.set(1.5);
        mayor.children[1].x = -15;
        mayor.children[1].y = -175;

        wishlist.btn.scale.set(1.2)
        wishlist.btn.x = 910;
        wishlist.btn.y = 640;

        app.stage.setChildIndex(frontGround, app.stage.children.length - 1);
        frontGround.setChildIndex(frontGround.logo, frontGround.children.length - 1);
    }
}




function setupPixi() {
    //Create a Pixi Application
    if (navigator.userAgent.indexOf('MSIE') !== -1 || navigator.appVersion.indexOf('Trident/') > -1) {
        /* Microsoft Internet Explorer detected */
        app = new PIXI.Application({
            width: window.innerWidth,
            height: window.innerHeight,
            autoDensity: true,
            resolution: window.devicePixelRatio,
            forceCanvas: true
        });
    } else {
        app = new PIXI.Application({
            width: window.innerWidth,
            height: window.innerHeight,
            autoDensity: true,
            resolution: window.devicePixelRatio
        });
    }

    PIXI.settings.ROUND_PIXELS = true;
    app.renderer.view.style.position = "absolute";
    app.renderer.view.style.display = "block";
    // app.renderer.autoResize = true;
    //PIXI.AbstractRenderer.autoDensity = true;
    app.renderer.resize(window.innerWidth, window.innerHeight);

    gameContainer = new PIXI.Container();
    app.stage.addChild(gameContainer);

    sideBar = new PIXI.Container();
    sideBar.interactive = false;
    sideBar.interactiveChildren = false;
    app.stage.addChild(sideBar);

    frontGround = new PIXI.Container();
    app.stage.addChild(frontGround);

    //masking
    maskLeft = new PIXI.Graphics();
    maskLeft.beginFill(0x000000);
    maskLeft.drawRect(0, 0, 10, 10);
    maskLeft.interactive = false;
    app.stage.addChild(maskLeft);

    maskRight = new PIXI.Graphics();
    maskRight.beginFill(0x000000);
    maskRight.drawRect(0, 0, 10, 10);
    maskRight.interactive = false;
    app.stage.addChild(maskRight);

    maskBottom = new PIXI.Graphics();
    maskBottom.beginFill(0x000000);
    maskBottom.drawRect(0, 0, 10, 10);
    maskBottom.interactive = false;
    app.stage.addChild(maskBottom);

    gameBorder = new PIXI.Graphics();
    gameBorder.lineStyle(2, 0x000000);
    gameBorder.drawRect(0, 0, 1024, 704);
    gameBorder.alpha = 0;
    gameBorder.interactive = false;
    app.stage.addChild(gameBorder);

    //Add canvas to body
    document.body.appendChild(app.view);

    loadPreloaderAssets();
}

function loadPreloaderAssets() {
    preloaderLoader = new PIXI.Loader();

    preloaderLoader.add("images/loaderBGXL.png")
        .add("images/loaderCow.json")
    preloaderLoader.load(initPreloader);
}

function initPreloader() {
    preloadPopup = new PIXI.Container();
    preloadPopup.x = gameContainer.x;
    preloadPopup.y = 0;
    app.stage.addChild(preloadPopup);

    var popupBG = createSprite('images/loaderBGXL.png', -40, 0, preloaderLoader);
    preloadPopup.addChild(popupBG);

    preloadPopup.loaderBar = new PIXI.Graphics();
    preloadPopup.loaderBar.beginFill(0xffffff);
    preloadPopup.loaderBar.drawRect(0, 0, 362, 20);
    preloadPopup.addChild(preloadPopup.loaderBar);
    preloadPopup.loaderBar.scale.x = 0;
    preloadPopup.loaderBar.x = 330;
    preloadPopup.loaderBar.y = 200;
    preloadPopup.loaderBar.alpha = 0.8;

    preloadPopup.cow0 = createMC("LoaderCow0", 123, 270, -150);
    preloadPopup.addChild(preloadPopup.cow0);
    preloadPopup.cow1 = createMC("LoaderCow0", 123, 410, -200);
    preloadPopup.addChild(preloadPopup.cow1);
    preloadPopup.cow2 = createMC("LoaderCow0", 123, 550, -220);
    preloadPopup.addChild(preloadPopup.cow2);
    preloadPopup.cow3 = createMC("LoaderCow0", 123, 710, -180);
    preloadPopup.addChild(preloadPopup.cow3);


    preloadPopup.cow0.loop = false;
    preloadPopup.cow1.loop = false;
    preloadPopup.cow2.loop = false
    preloadPopup.cow3.loop = false

    preloadPopup.cow0.gotoAndStop(0);
    preloadPopup.cow1.gotoAndStop(0);
    preloadPopup.cow2.gotoAndStop(0);
    preloadPopup.cow3.gotoAndStop(0);

    preloadPopup.scale.set(mobileScale);

    preloadPopup.interactiveChildren = false;
    preloadPopup.interactive = false;

    if (localTest) {
        loadUniverseResources(JSON.parse('{"speak_b_createuser_dress":{"contenttype":"sound","content":"dk_vaelg_udseende.mp3","subtitle":"Nu skal du v\u00e6lge, hvordan du gerne vil se ud. Klik p\u00e5 den gr\u00f8nne knap, n\u00e5r du er f\u00e6rdig."},"speak_b_createuser_gender":{"contenttype":"sound","content":"dk_vaelg_draeng_pige.mp3","subtitle":"Er du en dreng, skal du klikke p\u00e5 drengen. Er du en pige, skal du klikke p\u00e5 pigen."},"speak_b_createuser_house":{"contenttype":"sound","content":"dk_vaelg_hus.mp3","subtitle":"I Pengeby f\u00e5r du dit helt eget hus! Hvilket hus vil du bo i?"},"createuser_boy":{"contenttype":"label","content":"Dreng","subtitle":""},"createuser_button_body":{"contenttype":"label","content":"Klik her for at oprette din egen bruger","subtitle":""},"createuser_def_text":{"contenttype":"label","content":"I Pengeby f\u00e5r man sin egen figur, som man kan k\u00f8be en masse ting til. Du skal derfor oprette en bruger, for at du kan blive genkendt n\u00e5r du kommer tilbage. De oplysninger du angiver, vil kun blive brugt til dette spil!","subtitle":""},"createuser_girl":{"contenttype":"label","content":"Pige","subtitle":""},"speak_b_universe_citygate":{"contenttype":"sound","content":"dk_roll_over_paa_byport.mp3","subtitle":"Det er byens port. Hvis du har lyst til at male den igen, skal du bare klikke her."},"speak_b_universe_monopolyAccess":{"contenttype":"sound","content":"dk_roll_over_paa_familiespillet_0.mp3","subtitle":"Det her er Familiespillet, hvor du skal hj\u00e6lpe en familie. Men du skal kunne regne og l\u00e6se for at spille det!"},"speak_b_universe_room":{"contenttype":"sound","content":"dk_roll_over_paa_eget_hus.mp3","subtitle":"Det her er dit hus, det er her du bor."},"speak_b_universe_welcome":{"contenttype":"sound","content":"dk_hjaelp_2.mp3","subtitle":"Her kan du se hele Pengeby. Klik p\u00e5 de steder, du gerne vil bes\u00f8ge. Hvis du gerne vil tilbage til dit v\u00e6relse, skal du klikke p\u00e5 huset, hvor du bor."},"speak_b_wishlist_opens":{"contenttype":"sound","content":"dk_aabning_af_krukke.mp3","subtitle":"Her kan du se de ting, du sparer op til - dem du har penge nok til, kan du k\u00f8be! Der kan kun v\u00e6re tre ting i \u00f8nskekrukken. Er der nogle ting, du har penge til at k\u00f8be?"},"speak_b_wishlist_rollover":{"contenttype":"sound","content":"SE Borgmester 2.mp3","subtitle":"Her kan du se de ting fra Karens butik, som du gerne vil spare op til."},"speak_universe_farm":{"contenttype":"sound","content":"universe_farm_76.mp3","subtitle":"Jeg har brug for din hj\u00e6lp til at fodre mine dyr. Har du lyst til at hj\u00e6lpe mig og tjene nogle penge?"},"speak_universe_karens":{"contenttype":"sound","content":"dk_roll_over_paa_karens_butik.mp3","subtitle":"Kom over i min butik, jeg f\u00e5r hele tiden nye varer!"},"speak_universe_postoffice":{"contenttype":"sound","content":"dk_roll_over_paa_postkontoret.mp3","subtitle":"Jeg har brug for din hj\u00e6lp her p\u00e5 Postkontoret! Vil du hj\u00e6lpe mig og tjene nogle penge?"},"speak_universe_timemachine":{"contenttype":"sound","content":"dk_roll_over_paa_tidsmaskine.mp3","subtitle":"Det her er min Tidsmaskine - kunne du t\u00e6nke dig at pr\u00f8ve den?"},"speak_universe_wizard":{"contenttype":"sound","content":"dk_roll_over_paa_troldmand_klar.mp3","subtitle":"Jeg er troldmand - og jeg har en hemmelighed! Er du klar til at h\u00f8re den?"},"speak_universe_wizard_not_ready":{"contenttype":"sound","content":"dk_roll_over_paa_troldmand_ikke_klar2.mp3","subtitle":"Jeg er troldmand - og jeg har en hemmelighed! Men du skal have bes\u00f8gt alle stederne i Pengeby, f\u00f8r jeg vil fort\u00e6lle dig den."},"monopolyAccess_calc_text":{"contenttype":"label","content":"For at \u00e5bne bommen skal du regne koden rigtigt ud!","subtitle":""},"monopolyAccess_wrong_body":{"contenttype":"label","content":"Pr\u00f8v igen","subtitle":""},"monopolyAccess_wrong_header":{"contenttype":"label","content":"FORKERT SVAR","subtitle":""},"speak_b_universe_apple":{"contenttype":"sound","content":"dk_roll_over_paa_eblebod.mp3","subtitle":"Det her er din \u00e6blebod. Her kan du tjene penge ved at samle \u00e6bler og lave \u00e6blejuice til hele Pengeby!"},"speak_b_monopolyAccess_helpTxt":{"contenttype":"sound","content":"dk_tryk_paa_familiespillet.mp3","subtitle":"For at komme over broen skal du regne dig frem til det rigtige tal, der \u00e5bner bommen."},"speak_b_monopolyAccess_rightCode":{"contenttype":"sound","content":"openGate_rightCode.mp3","subtitle":"Det var den rigtige kode!"},"speak_b_monopolyAccess_wrongCode":{"contenttype":"sound","content":"dk_tryk_paa_familiespillet_forkert.mp3","subtitle":"Det var ikke rigtigt. Pr\u00f8v igen."},"pengeby_closeSubtitles":{"contenttype":"label","content":"Skjul tekst","subtitle":""},"pengeby_subtitlesButtonOff":{"contenttype":"label","content":"Sl\u00e5 tekster til","subtitle":""},"pengeby_subtitlesButtonOn":{"contenttype":"label","content":"Sl\u00e5 tekster fra","subtitle":""},"pengeby_yourName":{"contenttype":"label","content":"Skriv dit navn","subtitle":""},"pengeby_bank_addCash":{"contenttype":"sound","content":"pengeby_coins_til_stakken_i_venstre_side.mp3","subtitle":""},"pengeby_button_general":{"contenttype":"sound","content":"pengeby_button_general.mp3","subtitle":""},"pengeby_loader":{"contenttype":"sound","content":"pengeby_musica.mp3","subtitle":""},"pengeby_ok_button":{"contenttype":"sound","content":"pengeby_ok_lyd_1.mp3","subtitle":""},"pengeby_printer":{"contenttype":"sound","content":"pengeby_printer_lyd.mp3","subtitle":""},"universe_ambient_birds1":{"contenttype":"sound","content":"universe_bird1.mp3","subtitle":""},"universe_ambient_birds2":{"contenttype":"sound","content":"universe_bird2.mp3","subtitle":""},"universe_ambient_birds3":{"contenttype":"sound","content":"universe_bird3.mp3","subtitle":""},"universe_ambient_birds4":{"contenttype":"sound","content":"universe_bird4.mp3","subtitle":""},"universe_ambient_water1":{"contenttype":"sound","content":"universe_water1.mp3","subtitle":""},"universe_ambient_water2":{"contenttype":"sound","content":"universe_water2.mp3","subtitle":""},"universe_ambient_water3":{"contenttype":"sound","content":"universe_water3.mp3","subtitle":""},"universe_car1":{"contenttype":"sound","content":"universe_car1.mp3","subtitle":""},"universe_car2":{"contenttype":"sound","content":"universe_car2.mp3","subtitle":""},"universe_car3":{"contenttype":"sound","content":"universe_car3.mp3","subtitle":""},"universe_car4":{"contenttype":"sound","content":"universe_car4.mp3","subtitle":""},"universe_car5":{"contenttype":"sound","content":"universe_car5.mp3","subtitle":""},"universe_cow1":{"contenttype":"sound","content":"universe_cow1.mp3","subtitle":""},"universe_cow2":{"contenttype":"sound","content":"universe_cow2.mp3","subtitle":""},"universe_cow3":{"contenttype":"sound","content":"universe_cow3.mp3","subtitle":""},"universe_duck":{"contenttype":"sound","content":"and.mp3","subtitle":""},"universe_duck_splash":{"contenttype":"sound","content":"rock_splash.mp3","subtitle":""},"universe_horse1":{"contenttype":"sound","content":"universe_horse1.mp3","subtitle":""},"universe_horse2":{"contenttype":"sound","content":"universe_horse2.mp3","subtitle":""},"universe_horse3":{"contenttype":"sound","content":"universe_horse3.mp3","subtitle":""},"universe_parasol1":{"contenttype":"sound","content":"universe_parasol.mp3","subtitle":""},"universe_parasol2":{"contenttype":"sound","content":"universe_parasol_0.mp3","subtitle":""},"universe_rabbit":{"contenttype":"sound","content":"rabbit_jump.mp3","subtitle":""},"universe_rabbit_magic":{"contenttype":"sound","content":"rabbit-magic.mp3","subtitle":""},"universe_sheep1":{"contenttype":"sound","content":"universe_sheep1.mp3","subtitle":""},"universe_sheep2":{"contenttype":"sound","content":"universe_sheep2.mp3","subtitle":""},"wishlist_sound":{"contenttype":"sound","content":"wishlist_sound.mp3","subtitle":""}}'));
    } else {
        $.ajax({
            type: 'GET',
            url: 'gameadmin/getcontent/universe.json',
            contentType: 'application/json; charset=utf-8',
            dataType: 'json',
        }).done(loadUniverseResources);
    }
}

function showPreloader() {
    if (preloadPopup) {
        preloadPopup.x = gameContainer.x;
        preloadPopup.scale.set(mobileScale);
        preloadPopup.y = 0;
        preloadPopup.loaderBar.scale.x = 0;

        if (firstPreloader) {
            app.stage.addChild(preloadPopup);
            app.stage.setChildIndex(gameBorder, app.stage.children.length - 1);
            app.stage.setChildIndex(maskLeft, app.stage.children.length - 1);
            app.stage.setChildIndex(maskRight, app.stage.children.length - 1);
            app.stage.setChildIndex(maskBottom, app.stage.children.length - 1);
            firstPreloader = false;
        } else {
            app.stage.addChild(preloadPopup);

            app.stage.setChildIndex(sideBar, app.stage.children.length - 1);
            app.stage.setChildIndex(frontGround, app.stage.children.length - 1);
            app.stage.setChildIndex(gameBorder, app.stage.children.length - 1);
            app.stage.setChildIndex(maskLeft, app.stage.children.length - 1);
            app.stage.setChildIndex(maskRight, app.stage.children.length - 1);
            app.stage.setChildIndex(maskBottom, app.stage.children.length - 1);
            if ((isMobile || isIPad) && gameContainer.x > 75) {
                app.stage.setChildIndex(frontGround, app.stage.children.length - 1);
            }
        }

        if (isMobile || isIPad) {
            preloadPopup.alpha = 1;
        } else {
            preloadPopup.alpha = 0;
            TweenMax.to(preloadPopup, 0.2, {
                alpha: 1
            });
        }

        preloadPopup.cow0.gotoAndStop(0);
        preloadPopup.cow1.gotoAndStop(0);
        preloadPopup.cow2.gotoAndStop(0);
        preloadPopup.cow3.gotoAndStop(0);
    }
}


function preloadProgress(loader, res) {
    var progress = loader.progress / 100;
    preloadPopup.loaderBar.scale.x = progress;

    if (Math.round(loader.progress) >= 100) {
        if (isMobile || isIPad) {
            doRemovePreloader();
        } else {
            preloadPopup.cow0.gotoAndPlay(Math.floor(Math.random() * 20));
            preloadPopup.cow1.gotoAndPlay(Math.floor(Math.random() * 20));
            preloadPopup.cow2.gotoAndPlay(Math.floor(Math.random() * 20));
            preloadPopup.cow3.gotoAndPlay(Math.floor(Math.random() * 20));
            //show cows and remove preloader
            TweenMax.to(preloadPopup, 0.2, {
                delay: 0.65,
                alpha: 0,
                onComplete: doRemovePreloader
            });
        }
    }
}

function doRemovePreloader() {
    app.stage.removeChild(preloadPopup);
    preloadPopup.cow0.gotoAndStop(0);
    preloadPopup.cow1.gotoAndStop(0);
    preloadPopup.cow2.gotoAndStop(0);
    preloadPopup.cow3.gotoAndStop(0);
}




var universeData;

function loadUniverseResources(data) {

    universeData = data;
    //data
    $.each(data, function(key, val) {
        if (val.contenttype == "sound") {
            PIXI.Loader.shared.add(key, "files/" + val.content);

            subtitleArray[key] = val.subtitle;
        }
    })

    showPreloader();
    PIXI.Loader.shared.on('progress', preloadProgress);

    PIXI.Loader.shared
        .add('images/mayor_mouth.json')
        .add("images/karens/goldstack.json")
        .add("images/karens/silverstack.json")
        .add('images/mayor_button.png')
        .add('images/chrCreate/createuser_girlbtn.json')
        .add('images/universe/postoffice.json')
        .add('images/universe/postoffice_sign.json')
        .add('images/universe/applegame.json')
        .add('images/universe/applemill.json')
        .add('images/universe/farm.json')
        .add('images/universe/karensshop.json')
        .add('images/universe/timemachine.json')
        .add('images/chrCreate/Background.png')
        .add('images/chrCreate/lookBG.png')
        .add('images/chrCreate/genderSelect.png')
        .add('images/chrCreate/BottomBar.png')
        .add('images/chrCreate/Topbar.png')
        .add('images/chrCreate/BoyDressRoom.png')
        .add('images/chrCreate/GirlDressRoom.png')
        .add('images/chrCreate/body.json')
        .add('images/chrCreate/hair.json')
        .add('images/chrCreate/eye.json')
        .add('images/chrCreate/legs.json')
        .add('images/chrCreate/shoes.json')
        .add('images/chrCreate/gbody.json')
        .add('images/chrCreate/ghair.json')
        .add('images/chrCreate/geye.json')
        .add('images/chrCreate/glegs.json')
        .add('images/chrCreate/gshoes.json')
        .add('images/chrCreate/NameField.png')
        .add('images/universe/Sky.png')
        .add('images/universe/ToolbarAvatarBG.png')
        .add('images/universe/Bank.png')
        .add('images/universe/nextBtn.json')
        .add('images/universe/nextBtn_icon.json')
        .add('images/universe/universeBtn.json')
        .add('images/universe/car1.json')
        .add('images/universe/car2.json')
        .add('images/universe/fish1.json')
        .add('images/universe/cow1.json')
        .add('images/universe/horse.json')
        .add('images/universe/house.json')
        .add("images/universe/timemachineBtn.json")
        .add("images/universe/monopolyBridge.json")
        .add('images/universe/parasol.json')
        .add('images/universe/sheep.json')
        .add('images/universe/mutebtn.json')
        .add(["images/avatar/BoyFace0001.png", "images/avatar/BoyFace0002.png", "images/avatar/Dreng_bluse10001.png", "images/avatar/Dreng_bluse10002.png", "images/avatar/Dreng_bluse10003.png", "images/avatar/Dreng_bluse10004.png", "images/avatar/Dreng_bluse20001.png", "images/avatar/Dreng_bluse20002.png", "images/avatar/Dreng_bluse20003.png", "images/avatar/Dreng_bluse20004.png", "images/avatar/Dreng_bluse30001.png", "images/avatar/Dreng_bluse30002.png", "images/avatar/Dreng_bluse30003.png", "images/avatar/Dreng_bluse30004.png", "images/avatar/Dreng_bukser10001.png", "images/avatar/Dreng_bukser10002.png", "images/avatar/Dreng_bukser10003.png", "images/avatar/Dreng_bukser10004.png", "images/avatar/Dreng_bukser20001.png", "images/avatar/Dreng_bukser20002.png", "images/avatar/Dreng_bukser20003.png", "images/avatar/Dreng_bukser20004.png", "images/avatar/Dreng_bukser30001.png", "images/avatar/Dreng_bukser30002.png", "images/avatar/Dreng_bukser30003.png", "images/avatar/Dreng_bukser30004.png", "images/avatar/Dreng_haar10001.png", "images/avatar/Dreng_haar10002.png", "images/avatar/Dreng_haar10003.png", "images/avatar/Dreng_haar10004.png", "images/avatar/Dreng_haar20001.png", "images/avatar/Dreng_haar20002.png", "images/avatar/Dreng_haar20003.png", "images/avatar/Dreng_haar20004.png", "images/avatar/Dreng_haar30001.png", "images/avatar/Dreng_haar30002.png", "images/avatar/Dreng_haar30003.png", "images/avatar/Dreng_haar30004.png", "images/avatar/Dreng_haar40001.png", "images/avatar/Dreng_haar40002.png", "images/avatar/Dreng_haar40003.png", "images/avatar/Dreng_haar40004.png", "images/avatar/Dreng_oejne0001.png", "images/avatar/Dreng_oejne0002.png", "images/avatar/Dreng_oejne0003.png", "images/avatar/Dreng_sko10001.png", "images/avatar/Dreng_sko10002.png", "images/avatar/Dreng_sko10003.png", "images/avatar/Dreng_sko10004.png", "images/avatar/Dreng_sko20001.png", "images/avatar/Dreng_sko20002.png", "images/avatar/Dreng_sko20003.png", "images/avatar/Dreng_sko20004.png", "images/avatar/Dreng_sko30001.png", "images/avatar/Dreng_sko30002.png", "images/avatar/Dreng_sko30003.png", "images/avatar/Dreng_sko30004.png", "images/avatar/Krop_dreng0001.png", "images/avatar/Krop_dreng0002.png"])
        .add(["images/avatar/GirlFace0001.png", "images/avatar/GirlFace0002.png", "images/avatar/Pige_bluse10001.png", "images/avatar/Pige_bluse10002.png", "images/avatar/Pige_bluse10003.png", "images/avatar/Pige_bluse10004.png", "images/avatar/Pige_bluse20001.png", "images/avatar/Pige_bluse20002.png", "images/avatar/Pige_bluse20003.png", "images/avatar/Pige_bluse20004.png", "images/avatar/Pige_bluse30001.png", "images/avatar/Pige_bluse30002.png", "images/avatar/Pige_bluse30003.png", "images/avatar/Pige_bluse30004.png", "images/avatar/Pige_bukser10001.png", "images/avatar/Pige_bukser10002.png", "images/avatar/Pige_bukser10003.png", "images/avatar/Pige_bukser10004.png", "images/avatar/Pige_bukser20001.png", "images/avatar/Pige_bukser20002.png", "images/avatar/Pige_bukser20003.png", "images/avatar/Pige_bukser20004.png", "images/avatar/Pige_bukser30001.png", "images/avatar/Pige_bukser30002.png", "images/avatar/Pige_bukser30003.png", "images/avatar/Pige_bukser30004.png", "images/avatar/Pige_haar10001.png", "images/avatar/Pige_haar10002.png", "images/avatar/Pige_haar10003.png", "images/avatar/Pige_haar10004.png", "images/avatar/Pige_haar20001.png", "images/avatar/Pige_haar20002.png", "images/avatar/Pige_haar20003.png", "images/avatar/Pige_haar20004.png", "images/avatar/Pige_haar30001.png", "images/avatar/Pige_haar30002.png", "images/avatar/Pige_haar30003.png", "images/avatar/Pige_haar30004.png", "images/avatar/Pige_haar40001.png", "images/avatar/Pige_haar40002.png", "images/avatar/Pige_haar40003.png", "images/avatar/Pige_haar40004.png", "images/avatar/Pige_oejne0001.png", "images/avatar/Pige_oejne0002.png", "images/avatar/Pige_oejne0003.png", "images/avatar/Pige_sko10001.png", "images/avatar/Pige_sko10002.png", "images/avatar/Pige_sko10003.png", "images/avatar/Pige_sko10004.png", "images/avatar/Pige_sko20001.png", "images/avatar/Pige_sko20002.png", "images/avatar/Pige_sko20003.png", "images/avatar/Pige_sko20004.png", "images/avatar/Pige_sko30001.png", "images/avatar/Pige_sko30002.png", "images/avatar/Pige_sko30003.png", "images/avatar/Pige_sko30004.png", "images/avatar/Krop_pige0001.png", "images/avatar/Krop_pige0002.png"])
        .add(["images/universe/Universe-bg.png", "images/universe/Universe-middle.png", "images/universe/Universe-front.png"])
        .add("bird1", "sounds/universe/universe_bird1.mp3")
        .add("bird2", "sounds/universe/universe_bird2.mp3")
        .add("bird3", "sounds/universe/universe_bird3.mp3")
        .add("bird4", "sounds/universe/universe_bird4.mp3")
        .add("water1", "sounds/universe/universe_water1.mp3")
        .add("water2", "sounds/universe/universe_water2.mp3")
        .add("water3", "sounds/universe/universe_water3.mp3")
        .add("car1", "sounds/universe/universe_car1.mp3")
        .add("car2", "sounds/universe/universe_car2.mp3")
        .add("cow1", "sounds/universe/universe_cow1.mp3")
        .add("cow2", "sounds/universe/universe_cow2.mp3")
        .add("sheep1", "sounds/universe/universe_sheep1.mp3")
        .add("sheep2", "sounds/universe/universe_sheep2.mp3")
        .add("parasol", "sounds/universe/universe_parasol.mp3")
        .add("images/avatar/avatarBoyBody.json")
        .add("images/avatar/avatarBoyLegs.json")
        .add("images/avatar/avatarBoyHats.json")
        .add("images/avatar/avatarBoyShoes.json")
        .add("images/avatar/avatarGirlBody.json")
        .add("images/avatar/avatarGirlLegs.json")
        .add("images/avatar/avatarGirlHats.json")
        .add("images/avatar/avatarGirlShoes.json")
        .add("images/monopoly/monopolyAccess.json")
        .add("images/monopoly/monopolyAccessExitbtn.json")
        .add("images/monopoly/monopolyAccessCalcBtn.json")
        .add("images/universe/wizard.json")
        .add("images/universe/GoldButton.png")
        .add("images/universe/port.png")
        .add("images/universe/selectUserBG.png")
        .add("images/universe/siluet.png")
        .add("images/universe/pengeby-logo.png")
        .add("images/universe/logo_dk.png")
        .add("images/universe/logo_fi.png")
        .add("images/universe/logo_ie.png")
        .add("images/universe/logo_et.png")
        .add("images/universe/logo_lt.png")
        .add("images/universe/logo_se.png")
        .add("images/universe/logo_no.png")
        .add("images/universe/logo_nie.png")
        .add("images/universe/wishlistBG.png")
        .add("images/universe/wishlist-pricetag.png")
        .add("images/universe/wishlist-buybtn.json")
        .add("images/universe/wishlist-cancelbtn.json")
        .add("images/universe/wishlist_stars.json")
        .add("images/universe/wishlist-jar.json")
        .add("images/universe/wishlist-silvercoins.json")
        .add("images/universe/wishlist-goldcoins.json")
        .add("images/universe/subtitlesBtn.png")
        .add("images/universe/subtitlesBG.png")
        .add("images/universe/kite.json")
        .add("images/universe/cat.json")
        .add("images/universe/rabbit.json")

        .add("images/karens/items/dollhouse.json")
        .add("images/karens/items/dragon.json")
        .add("images/karens/items/heartlights.json")
        .add("images/karens/items/items.json")
        .add("images/karens/items/lavalamp.json")
        .add("images/karens/items/rocket.json")
        .add("images/karens/items/wand.json")

        .add("images/karens/boyShoes.json")
        .add("images/karens/boyLegs.json")
        .add("images/karens/boyBody.json")
        .add("images/karens/boyHats.json")
        .add("images/karens/girlShoes.json")
        .add("images/karens/girlLegs.json")
        .add("images/karens/girlBody.json")
        .add("images/karens/girlHats.json")
        .load(checkForUserSelect);
}


function setupInterface() {
    if (topBar) {

    } else {
        topBar = createSprite("images/chrCreate/Topbar.png", 0, -317);
        topBar.width = 1030;
        topBar.interactive = false;
        frontGround.addChild(topBar);

        frontGround.logo = new PIXI.Container();
        var logoBG = createSprite("images/universe/pengeby-logo.png", -300, 0);
        frontGround.logo.addChild(logoBG);
        frontGround.logo.addChild(createSprite("images/universe/logo_" + language + ".png", 11, 3));
        frontGround.addChild(frontGround.logo);
        frontGround.logo.interactiveChildren = false;
        frontGround.logo.interactive = false;

        bottomBar = createSprite("images/chrCreate/BottomBar.png", -300, 540);
        bottomBar.interactive = false;
        frontGround.addChild(bottomBar);

        frontGround.muteBtn = createMC("Hoejtaler00", 2, 220, 600);
        makeButton(frontGround.muteBtn, muteSound);
        frontGround.muteBtn.gotoAndStop(0);
        frontGround.addChild(frontGround.muteBtn);

        if (wishlist) {

        } else {
            wishlist = {};
        }

        var wishlistBtn = createMC("WishlistGfx00", 19, 890, 650);
        wishlistBtn.anchor.set(0.5);
        wishlistBtn.gotoAndStop(0);
        wishlistBtn.interactive = true;
        wishlistBtn.buttonMode = true;
        wishlistBtn.on("mouseover", wishlistHover);
        wishlistBtn.on("mouseout", wishlistEndHover);
        wishlistBtn.on("pointerup", showWishlist);
        wishlistBtn.on("touchstart", wishlistHover);
        wishlistBtn.on("touchend", wishlistEndHover);
        wishlistBtn.on("touchendoutside", wishlistEndHover);
        frontGround.addChild(wishlistBtn);

        wishlistBtn.visible = false;
        wishlist.btn = wishlistBtn;

        initMayor();

        frontGround.showSubtitles = false;

        frontGround.subtitles = new PIXI.Container();
        frontGround.subtitles.x = 265;
        frontGround.subtitles.y = -140;
        frontGround.subtitles.addChild(createSprite("images/universe/subtitlesBG.png", 0, 0));

        frontGround.subtitlesLabel = new PIXI.Text("", new PIXI.TextStyle({
            fontFamily: "Arial",
            fontSize: 12,
            fill: "white",
            fontWeight: "normal",
            wordWrap: true,
            wordWrapWidth: 500
        }));
        frontGround.subtitlesLabel.x = 50;
        frontGround.subtitlesLabel.y = 35;
        frontGround.subtitles.addChild(frontGround.subtitlesLabel);

        frontGround.addChild(frontGround.subtitles);
        frontGround.subtitles.interactiveChildren = false;
        frontGround.subtitles.interactive = false;

        frontGround.subtitlesBtn = new PIXI.Container();
        frontGround.subtitlesBtn.x = 270;
        frontGround.subtitlesBtn.addChild(createSprite("images/universe/subtitlesBtn.png", 0, 0));
        frontGround.subtitlesBtn.interactive = true;
        frontGround.subtitlesBtn.buttonMode = true;
        frontGround.subtitlesBtn.on("pointerup", toggleSubtitles);

        frontGround.subtitlesBtnLabel = new PIXI.Text(universeData.pengeby_subtitlesButtonOff.content, new PIXI.TextStyle({
            fontFamily: "Arial",
            fontSize: 12,
            fill: "white",
            fontWeight: "normal",
            wordWrap: true,
            wordWrapWidth: 500
        }));
        frontGround.subtitlesBtnLabel.x = 15;
        frontGround.subtitlesBtnLabel.y = 2;
        frontGround.subtitlesBtn.addChild(frontGround.subtitlesBtnLabel);
        frontGround.subtitlesBtnLabel.interactive = false;

        frontGround.addChild(frontGround.subtitlesBtn);
    }
}

function toggleSubtitles() {
    if (frontGround.showSubtitles) {
        frontGround.showSubtitles = false;
        frontGround.subtitlesBtnLabel.text = universeData.pengeby_subtitlesButtonOff.content;

        TweenMax.to(frontGround.subtitles, 0.35, {
            pixi: {
                y: -140
            },
            ease: Power2.easeIn
        });
    } else {
        frontGround.showSubtitles = true;
        frontGround.subtitlesBtnLabel.text = universeData.pengeby_subtitlesButtonOn.content;

        TweenMax.to(frontGround.subtitles, 0.35, {
            pixi: {
                y: 0
            },
            ease: Power2.easeIn
        });


    }

}

function wishlistHover() {
    stopMayorSpeak();
    mayorSpeak("speak_b_wishlist_rollover", PIXI.Loader.shared);

    this.onFrameChange = function() {
        if (this.currentFrame == 8) {
            this.stop();
            this.onFrameChange = null;
        }
    }
    this.gotoAndPlay(1);
}

function wishlistEndHover() {
    stopMayorSpeak();

    this.onFrameChange = function() {
        if (this.currentFrame == 0) {
            this.gotoAndStop(0);
            this.onFrameChange = null;
        }
    }
    this.gotoAndPlay(9);
}

var wishlist;

function showWishlist() {
    sendStatPoint("wishlist");
    stopMayorSpeak();
    mayorSpeak("speak_b_wishlist_opens", PIXI.Loader.shared);

    var wishlistSound = playSound("wishlist_sound", PIXI.Loader.shared);

    if (wishlist) {

    } else {
        wishlist = {};
    }
    wishlist.bg = new PIXI.Graphics();
    wishlist.bg.beginFill(0x000000);
    wishlist.bg.hitArea = new PIXI.Rectangle(0, 0, 1100, 800);
    wishlist.bg.interactive = true;
    wishlist.bg.alpha = 0.3;
    wishlist.bg.drawRect(0, 0, 1100, 800);
    gameContainer.addChild(wishlist.bg);

    wishlist.container = new PIXI.Container();
    wishlist.container.x = 250;
    wishlist.container.y = 100;

    var wishlistGraphicBG = createSprite("images/universe/wishlistBG.png", 0, 0);
    wishlistGraphicBG.interactive = false;
    wishlist.container.addChild(wishlistGraphicBG);

    wishlist.closeBtn = createMC("Nej_btn_TMV00", 2, 500, -10);
    wishlist.closeBtn.scale.set(0.5);
    wishlist.closeBtn.gotoAndStop(0);
    wishlist.closeBtn.interactive = true;
    wishlist.closeBtn.buttonMode = true;
    wishlist.closeBtn.on("pointerup", closeWishlist)
    wishlist.container.addChild(wishlist.closeBtn);

    var gold = Math.floor(parseInt(user.wallet) / 10);
    var silver = parseInt(user.wallet) % 10;

    wishlist.goldcoins = createMC("wishlist-goldcoins instance 100", 11, 87, 317);
    wishlist.goldcoins.gotoAndStop(gold);
    wishlist.goldcoins.interactive = false;
    wishlist.container.addChild(wishlist.goldcoins);

    wishlist.silvercoins = createMC("wishlist-silvercoins00", 11, 87, 360)
    wishlist.silvercoins.gotoAndStop(silver);
    wishlist.silvercoins.interactive = false;
    wishlist.container.addChild(wishlist.silvercoins);

    gameContainer.addChild(wishlist.container);


    //items
    var wishlistItem;
    var pricetag;
    var buyBtn;
    var cancelBtn;

    for (var i = 0; i < user.wishlist.length; i++) {
        wishlistItem = new PIXI.Container();
        wishlistItem.x = 162 * i;
        wishlist.container.addChild(wishlistItem);

        var itemName = user.wishlist[i][0];

        var relevantShopArray;
        var itemType;
        if (itemName.indexOf("boy") != -1) {
            //shoes legs body hat
            if (itemName.indexOf("Shoes") != -1) {
                itemType = "boyShoes";
                relevantShopArray = shopBoyShoes;
            } else if (itemName.indexOf("Legs") != -1) {
                itemType = "boyLegs";
                relevantShopArray = shopBoyLegs;
            } else if (itemName.indexOf("Body") != -1) {
                itemType = "boyBody";
                relevantShopArray = shopBoyBody;
            } else if (itemName.indexOf("Hat") != -1) {
                itemType = "boyHat";
                relevantShopArray = shopBoyHats;
            }

        } else if (itemName.indexOf("girl") != -1) {
            if (itemName.indexOf("Shoes") != -1) {
                relevantShopArray = girlBoyShoes;
            } else if (itemName.indexOf("Legs") != -1) {
                relevantShopArray = girlBoyLegs;
            } else if (itemName.indexOf("Body") != -1) {
                relevantShopArray = girlBoyBody;
            } else if (itemName.indexOf("Hat") != -1) {
                relevantShopArray = girlBoyHats;
            }

        } else {
            relevantShopArray = shopItems;
            itemType = "item"
        }

        //create item
        for (var j = 0; j < relevantShopArray.length; j++) {
            if (itemName == relevantShopArray[j][0]) {
                var itemBtn = new PIXI.Container();
                if (itemType == "item") {
                    itemBtn.addChild(createMC(relevantShopArray[j][2], relevantShopArray[j][4], relevantShopArray[j][6], relevantShopArray[j][7]));
                } else if (itemType == "boyShoes") {
                    itemBtn.addChild(createMC(relevantShopArray[j][2], relevantShopArray[j][4], 50, 70));
                    itemBtn.children[0].pivot.set(80, 55)
                } else if (itemType == "boyLegs") {
                    itemBtn.addChild(createMC(relevantShopArray[j][2], relevantShopArray[j][4], 50, 65));
                    itemBtn.children[0].pivot.set(67, 95);

                } else if (itemType == "boyBody") {
                    itemBtn.addChild(createMC(relevantShopArray[j][2], relevantShopArray[j][4], 50, 80));
                    itemBtn.children[0].pivot.set(96, 162);

                } else if (itemType == "boyHat") {
                    itemBtn.addChild(createMC(relevantShopArray[j][2], relevantShopArray[j][4], 50, 70));
                    itemBtn.children[0].pivot.set(92, 80);

                }

                if (relevantShopArray[j][3] == -1) {
                    itemBtn.children[0].gotoAndStop(0);
                } else {
                    itemBtn.children[0].gotoAndStop(relevantShopArray[j][3]);
                }

                itemBtn.x = 70;
                itemBtn.y = 90;
                wishlistItem.addChild(itemBtn);
                itemBtn.interactive = false;

                break;
            }
        }


        pricetag = createSprite("images/universe/wishlist-pricetag.png", 50, 170)
        wishlistItem.addChild(pricetag);
        pricetag.interactive = false;



        buyBtn = createMC("wishlist-buybtn00", 2, 80, 220);
        buyBtn.gotoAndStop(0);
        buyBtn.name = user.wishlist[i][0];
        buyBtn.price = parseInt(user.wishlist[i][1]);
        wishlistItem.addChild(buyBtn);
        if (buyBtn.price > user.wallet) {
            buyBtn.visible = false;
        } else {
            buyBtn.interactive = true;
            buyBtn.buttonMode = true;
            buyBtn.on("pointerup", buyFromWishlist);
        }

        var gold = Math.floor(parseInt(buyBtn.price) / 10);
        var silver = parseInt(buyBtn.price) % 10;

        var goldTF = new PIXI.Text(gold, new PIXI.TextStyle({
            fontFamily: "Arial",
            fontSize: 18,
            fill: "white",
            fontWeight: "bold"
        }));
        goldTF.x = 68;
        goldTF.y = 190;
        wishlistItem.addChild(goldTF);
        goldTF.interactive = false;

        var silverTF = new PIXI.Text(silver, new PIXI.TextStyle({
            fontFamily: "Arial",
            fontSize: 18,
            fill: "white",
            fontWeight: "bold"
        }));
        silverTF.x = 110;
        silverTF.y = 190;
        wishlistItem.addChild(silverTF);
        silverTF.interactive = false;

        deleteBtn = createMC("Nej_btn_TMV00", 2, 150, 30);
        deleteBtn.scale.set(0.30);
        deleteBtn.gotoAndStop(0);
        wishlistItem.addChild(deleteBtn);
        deleteBtn.name = user.wishlist[i][0];
        deleteBtn.interactive = true;
        deleteBtn.buttonMode = true;
        deleteBtn.on("pointerup", removeFromWishlist);

    }

    wishlist.btn.interactive = false;

}


function buyFromWishlist() {
    var itemName = this.name;
    updateWallet(-1 * this.price);
    updateUserInventory(itemName);

    for (var i = 0; i < user.wishlist.length; i++) {
        if (itemName == user.wishlist[i][0]) {
            user.wishlist.splice(i, 1);
            break;
        }
    }

    updateUserCookie();

    updateWishlistScreen();
}


function removeFromWishlist() {
    var itemName = this.name;
    for (var i = 0; i < user.wishlist.length; i++) {
        if (itemName == user.wishlist[i][0]) {
            user.wishlist.splice(i, 1);
            break;
        }
    }

    updateUserCookie();

    updateWishlistScreen();
}

function updateWishlistScreen() {
    gameContainer.removeChild(wishlist.bg);
    wishlist.container.removeChildren();
    gameContainer.removeChild(wishlist.container);

    showWishlist();
}


function closeWishlist() {
    gameContainer.removeChild(wishlist.bg);
    wishlist.container.removeChildren();
    gameContainer.removeChild(wishlist.container);

    wishlist.btn.interactive = true;
}



//START GAME FLOW
function checkForUserSelect() {
    var skipUserSelect = true;
    if (allowCookies) {
        getUserCookie();
        if (user) {
            //console.log("user exists - show user select screen");
            skipUserSelect = false;
        } else {
            //console.log("no existing user - skip user select");


        }
    } else {
        //console.log("no cookies allowed - skip user select");
    }

    if (skipUserSelect) {
        // Put the user object into storage
        if (allowCookies) {
            localStorage.removeItem('pengeby-user');
        }

        user = {};
        user.wallet = 0;
        user.wishlist = [];
        user.inventory = [];
        user.inventoryPositions = [];
        user.visitedApple = false;
        user.visitedRoom = false;
        user.visitedKaren = false;
        user.visitedGate = false;
        user.visitedPost = false;
        user.visitedTime = false;

        //updateUserCookie(); //defer until user finished
        setupInterface();

        selectGender();
    } else {
        userSelect();
    }
}

//SELECT  USER
function userSelect() {
    gameConfig.containerBG = createSprite("images/universe/selectUserBG.png", -100, 0);
    gameContainer.addChild(gameConfig.containerBG);
    gameConfig.containerBG.interactive = false;

    drawAvatar();
    avatar.x = 325;
    avatar.y = 150;
    gameContainer.addChild(avatar);

    var nextBtn = createNextBtn();
    nextBtn.x = 350;
    nextBtn.y = 500;
    nextBtn.on('pointerup', selectUser);
    gameContainer.addChild(nextBtn);

    gameConfig.label = new PIXI.Text(user.name, labelStyle);
    if (user.name == "") {
        gameConfig.label.text = "?";
    }
    gameConfig.label.anchor.set(0.5, 0);
    gameConfig.label.x = 400;
    gameConfig.label.y = 570;
    gameConfig.label.interactive = false;
    gameContainer.addChild(gameConfig.label);

    gameConfig.userSiluet = createSprite("images/universe/siluet.png", 625, 128);
    gameConfig.userSiluet.interactive = false;
    gameContainer.addChild(gameConfig.userSiluet);

    nextBtn = createNextBtn();
    nextBtn.x = 650;
    nextBtn.y = 500;
    nextBtn.on('pointerup', newUser);
    gameContainer.addChild(nextBtn);

    gameConfig.label2 = new PIXI.Text("Ny figur", labelStyle);
    gameConfig.label2.x = 660;
    gameConfig.label2.y = 570;
    gameConfig.label2.interactive = false;
    gameContainer.addChild(gameConfig.label2);

}

function clearUserSelect() {
    //console.log("clear");
    gameConfig.containerBG.destroy(true);
    gameConfig.label.destroy(true);
    gameConfig.label2.destroy(true);
    gameConfig.userSiluet.destroy(true);
}

function selectUser() {
    sendStatPoint("start-existing_user");

    gameContainer.removeChildren();
    clearUserSelect();

    setupInterface();
    initUniverse();
}


function newUser() {

    setupInterface();
    gameContainer.removeChildren();
    clearUserSelect();

    selectGender();
}



//SELECT GENDER
function selectGender() {
    sendStatPoint("start-create_user");
    if (allowCookies) {
        // Put the user object into storage
        localStorage.removeItem('pengeby-user');
    }
    user = {};
    user.wallet = 10;
    user.wishlist = [];
    user.inventory = [];
    user.inventoryPositions = [];
    user.visitedApple = false;
    user.visitedRoom = false;
    user.visitedKaren = false;
    user.visitedGate = false;
    user.visitedPost = false;
    user.visitedTime = false;


    var containerBG = createSprite("images/chrCreate/Background.png", -20, -50);
    gameContainer.addChild(containerBG);
    cleanUpArray = new Array();
    cleanUpArray.push(containerBG);

    genderSelectContainer = new PIXI.Container();
    gameContainer.addChild(genderSelectContainer);

    var genderSelectBG = createSprite("images/chrCreate/genderSelect.png", 300, 60);
    genderSelectContainer.addChild(genderSelectBG);
    cleanUpArray.push(genderSelectBG);

    var girlBtn = createMC("Pige_knap00", 47, 300, 370);
    makeButton(girlBtn, onClickGirl)
    genderSelectContainer.addChild(girlBtn);

    var label = new PIXI.Text(universeData.createuser_girl.content, labelStyle);
    label.anchor.set(0.5, 0.5);
    label.x = 352;
    label.y = 405;
    label.alpha = 0.75;
    genderSelectContainer.addChild(label);
    cleanUpArray.push(label);

    var boyBtn = createMC("Pige_knap00", 47, 610, 245);
    makeButton(boyBtn, onClickBoy);
    boyBtn.scale.x = -1;
    boyBtn.anchor.set(1, 0);
    genderSelectContainer.addChild(boyBtn);

    var label = new PIXI.Text(universeData.createuser_boy.content, labelStyle);
    label.anchor.set(0.5, 0.5);
    label.x = 700;
    label.y = 280;
    label.alpha = 0.75;
    genderSelectContainer.addChild(label);
    cleanUpArray.push(label);

    mayorSpeak("speak_b_createuser_gender", PIXI.Loader.shared);

    gameResizeEvent();
}




function onClickGirl() {
    genderSelect("girl");
}

function onClickBoy() {
    genderSelect("boy");
}

function genderSelect(gender) {
    user.gender = gender;

    cleanup();
    genderSelectContainer.removeChildren();
    genderSelectContainer.destroy();

    selectLook();
}


//DRESS ROOM
function selectLook() {
    $("#nameinput").show();

    var containerBG = createSprite("images/chrCreate/lookBG.png", -80, 45);
    gameContainer.addChild(containerBG);
    cleanUpArray.push(containerBG);

    topBar.y -= 40;
    bottomBar.y = 560;

    dressRoomContainer = new PIXI.Container();
    dressRoomContainer.y = -30;
    gameContainer.addChild(dressRoomContainer);

    user.skin = "01";
    user.eyes = "01";
    user.hair = "1";
    user.hat = -1;
    user.hairColor = 1;
    user.body = "1";
    user.bodyColor = 1;
    user.shoes = "1";
    user.shoesColor = 1;
    user.legs = "1";
    user.legsColor = 1;

    var nameField = createSprite("images/chrCreate/NameField.png", 590, 170);
    dressRoomContainer.addChild(nameField);
    cleanUpArray.push(nameField);

    var label = new PIXI.Text(universeData.pengeby_yourName.content, labelStyle);
    label.scale.set(0.9);
    label.x = 620;
    label.y = 215;
    dressRoomContainer.addChild(label);
    cleanUpArray.push(label);

    if (user.gender == "boy") {
        var dressRoomBG = createSprite("images/chrCreate/BoyDressRoom.png", 160, 200);
        dressRoomContainer.addChild(dressRoomBG);
        cleanUpArray.push(dressRoomBG);

        //hair
        dressRoomBtn = createMC("hairType instance 100", 4, 200, 220);
        dressRoomBtn.name = "hairType";
        dressRoomBtn.gotoAndStop(0);
        dressRoomContainer.addChild(dressRoomBtn);
        cleanUpArray.push(dressRoomBtn);

        dressRoomContainer.addChild(createDressRoomAlphaBtn("ht1", 202, 232, selectHairType));
        dressRoomContainer.addChild(createDressRoomAlphaBtn("ht2", 263, 221, selectHairType));
        dressRoomContainer.addChild(createDressRoomAlphaBtn("ht3", 325, 225, selectHairType));
        dressRoomContainer.addChild(createDressRoomAlphaBtn("ht4", 380, 241, selectHairType));

        //hairColor
        dressRoomContainer.addChild(createDressRoomSquareBtn("1", 213, 294, true, selectHairColor));
        dressRoomContainer.addChild(createDressRoomSquareBtn("2", 258, 294, false, selectHairColor));
        dressRoomContainer.addChild(createDressRoomSquareBtn("3", 303, 294, false, selectHairColor));
        dressRoomContainer.addChild(createDressRoomSquareBtn("4", 348, 294, false, selectHairColor));

        //body
        dressRoomBtn = createMC("bodytype instance 100", 3, 190, 395);
        dressRoomBtn.name = "bodyType";
        dressRoomBtn.gotoAndStop(0);
        dressRoomContainer.addChild(dressRoomBtn);
        cleanUpArray.push(dressRoomBtn);

        dressRoomContainer.addChild(createDressRoomAlphaBtn("bt1", 195, 405, selectBodyType));
        dressRoomContainer.addChild(createDressRoomAlphaBtn("bt2", 252, 405, selectBodyType));
        dressRoomContainer.addChild(createDressRoomAlphaBtn("bt3", 309, 405, selectBodyType));

        //body color
        dressRoomContainer.addChild(createDressRoomSquareBtn("bc1", 193, 461, true, selectBodyColor));
        dressRoomContainer.addChild(createDressRoomSquareBtn("bc2", 238, 461, false, selectBodyColor));
        dressRoomContainer.addChild(createDressRoomSquareBtn("bc3", 283, 461, false, selectBodyColor));
        dressRoomContainer.addChild(createDressRoomSquareBtn("bc4", 328, 461, false, selectBodyColor));


        //shoes
        dressRoomBtn = createMC("shoesType instance 100", 3, 290, 540);
        dressRoomBtn.name = "shoesType";
        dressRoomBtn.gotoAndStop(0);
        dressRoomContainer.addChild(dressRoomBtn);
        cleanUpArray.push(dressRoomBtn);

        dressRoomContainer.addChild(createDressRoomAlphaBtn("st1", 300, 536, selectShoesType));
        dressRoomContainer.addChild(createDressRoomAlphaBtn("st2", 331, 536, selectShoesType));
        dressRoomContainer.addChild(createDressRoomAlphaBtn("st3", 375, 536, selectShoesType));

        //shoes color
        dressRoomContainer.addChild(createDressRoomSquareBtn("sc1", 270, 585, true, selectShoesColor));
        dressRoomContainer.addChild(createDressRoomSquareBtn("sc2", 315, 585, false, selectShoesColor));
        dressRoomContainer.addChild(createDressRoomSquareBtn("sc3", 360, 585, false, selectShoesColor));
        dressRoomContainer.addChild(createDressRoomSquareBtn("sc4", 405, 585, false, selectShoesColor));


        //eyes
        dressRoomBtn = createMC("eyeType instance 100", 3, 645, 325);
        dressRoomBtn.name = "eyesType";
        dressRoomBtn.gotoAndStop(0);
        dressRoomContainer.addChild(dressRoomBtn);

        dressRoomContainer.addChild(createDressRoomAlphaBtn("et1", 644, 344, selectEyesType));
        dressRoomContainer.addChild(createDressRoomAlphaBtn("et2", 700, 320, selectEyesType));
        dressRoomContainer.addChild(createDressRoomAlphaBtn("et3", 747, 341, selectEyesType));


        //legs
        dressRoomBtn = createMC("legsType instance 100", 3, 640, 500);
        dressRoomBtn.name = "legsType";
        dressRoomBtn.gotoAndStop(0);
        dressRoomContainer.addChild(dressRoomBtn);
        cleanUpArray.push(dressRoomBtn);

        dressRoomContainer.addChild(createDressRoomAlphaBtn("lt1", 634, 516, selectLegsType));
        dressRoomContainer.addChild(createDressRoomAlphaBtn("lt2", 688, 505, selectLegsType));
        dressRoomContainer.addChild(createDressRoomAlphaBtn("lt3", 740, 510, selectLegsType));

        //legs color
        dressRoomContainer.addChild(createDressRoomSquareBtn("lc1", 629, 571, true, selectLegsColor));
        dressRoomContainer.addChild(createDressRoomSquareBtn("lc2", 674, 571, false, selectLegsColor));
        dressRoomContainer.addChild(createDressRoomSquareBtn("lc3", 717, 571, false, selectLegsColor));
        dressRoomContainer.addChild(createDressRoomSquareBtn("lc4", 760, 571, false, selectLegsColor));

        //skin
        dressRoomContainer.addChild(createDressRoomSquareBtn("01", 691, 391, true, selectSkin));
        dressRoomContainer.addChild(createDressRoomSquareBtn("02", 736, 391, false, selectSkin));

    } else {
        dressRoomBG = createSprite("images/chrCreate/GirlDressRoom.png", 160, 200);
        dressRoomContainer.addChild(dressRoomBG);
        cleanUpArray.push(dressRoomBG);

        //hair
        dressRoomBtn = createMC("hairSelect00", 4, 190, 215); //-10,-5
        dressRoomBtn.name = "hairType";
        dressRoomBtn.gotoAndStop(1);
        dressRoomContainer.addChild(dressRoomBtn);
        cleanUpArray.push(dressRoomBtn);

        dressRoomContainer.addChild(createDressRoomAlphaBtn("ht1", 192, 237, selectHairType));
        dressRoomContainer.addChild(createDressRoomAlphaBtn("ht2", 253, 217, selectHairType));
        dressRoomContainer.addChild(createDressRoomAlphaBtn("ht3", 315, 225, selectHairType));
        dressRoomContainer.addChild(createDressRoomAlphaBtn("ht4", 365, 241, selectHairType));

        //hairColor
        dressRoomContainer.addChild(createDressRoomSquareBtn("1", 203, 300, true, selectHairColor));
        dressRoomContainer.addChild(createDressRoomSquareBtn("2", 248, 300, false, selectHairColor));
        dressRoomContainer.addChild(createDressRoomSquareBtn("3", 293, 300, false, selectHairColor));
        dressRoomContainer.addChild(createDressRoomSquareBtn("4", 338, 300, false, selectHairColor));

        //body
        dressRoomBtn = createMC("bodySelect00", 3, 190, 395);
        dressRoomBtn.name = "bodyType";
        dressRoomBtn.gotoAndStop(0);
        dressRoomContainer.addChild(dressRoomBtn);
        cleanUpArray.push(dressRoomBtn);

        dressRoomContainer.addChild(createDressRoomAlphaBtn("bt1", 185, 395, selectBodyType));
        dressRoomContainer.addChild(createDressRoomAlphaBtn("bt2", 242, 395, selectBodyType));
        dressRoomContainer.addChild(createDressRoomAlphaBtn("bt3", 299, 395, selectBodyType));

        //body color
        dressRoomContainer.addChild(createDressRoomSquareBtn("bc1", 193, 455, true, selectBodyColor));
        dressRoomContainer.addChild(createDressRoomSquareBtn("bc2", 236, 455, false, selectBodyColor));
        dressRoomContainer.addChild(createDressRoomSquareBtn("bc3", 281, 455, false, selectBodyColor));
        dressRoomContainer.addChild(createDressRoomSquareBtn("bc4", 325, 455, false, selectBodyColor));


        //shoes
        dressRoomBtn = createMC("shoesSelect00", 3, 275, 530);
        dressRoomBtn.name = "shoesType";
        dressRoomBtn.gotoAndStop(0);
        dressRoomContainer.addChild(dressRoomBtn);
        cleanUpArray.push(dressRoomBtn);

        dressRoomContainer.addChild(createDressRoomAlphaBtn("st1", 280, 526, selectShoesType));
        dressRoomContainer.addChild(createDressRoomAlphaBtn("st2", 331, 526, selectShoesType));
        dressRoomContainer.addChild(createDressRoomAlphaBtn("st3", 380, 526, selectShoesType));

        //shoes color
        dressRoomContainer.addChild(createDressRoomSquareBtn("sc1", 270, 580, true, selectShoesColor));
        dressRoomContainer.addChild(createDressRoomSquareBtn("sc2", 315, 580, false, selectShoesColor));
        dressRoomContainer.addChild(createDressRoomSquareBtn("sc3", 360, 580, false, selectShoesColor));
        dressRoomContainer.addChild(createDressRoomSquareBtn("sc4", 405, 580, false, selectShoesColor));


        //eyes
        dressRoomBtn = createMC("eyeColorSelect00", 3, 645, 330);
        dressRoomBtn.name = "eyesType";
        dressRoomBtn.gotoAndStop(0);
        dressRoomContainer.addChild(dressRoomBtn);
        cleanUpArray.push(dressRoomBtn);

        dressRoomContainer.addChild(createDressRoomAlphaBtn("et1", 644, 340, selectEyesType));
        dressRoomContainer.addChild(createDressRoomAlphaBtn("et2", 694, 315, selectEyesType));
        dressRoomContainer.addChild(createDressRoomAlphaBtn("et3", 742, 331, selectEyesType));


        //legs
        dressRoomBtn = createMC("legsSelect00", 3, 625, 490);
        dressRoomBtn.name = "legsType";
        dressRoomBtn.gotoAndStop(0);
        dressRoomContainer.addChild(dressRoomBtn);
        cleanUpArray.push(dressRoomBtn);

        dressRoomContainer.addChild(createDressRoomAlphaBtn("lt1", 624, 498, selectLegsType));
        dressRoomContainer.addChild(createDressRoomAlphaBtn("lt2", 678, 495, selectLegsType));
        dressRoomContainer.addChild(createDressRoomAlphaBtn("lt3", 728, 500, selectLegsType));

        //legs color
        dressRoomContainer.addChild(createDressRoomSquareBtn("lc1", 619, 568, true, selectLegsColor));
        dressRoomContainer.addChild(createDressRoomSquareBtn("lc2", 660, 568, false, selectLegsColor));
        dressRoomContainer.addChild(createDressRoomSquareBtn("lc3", 704, 568, false, selectLegsColor));
        dressRoomContainer.addChild(createDressRoomSquareBtn("lc4", 748, 568, false, selectLegsColor));

        //skin
        dressRoomContainer.addChild(createDressRoomSquareBtn("01", 691, 387, true, selectSkin));
        dressRoomContainer.addChild(createDressRoomSquareBtn("02", 736, 387, false, selectSkin));
    }

    drawAvatar();
    avatar.x = 460;
    avatar.y = 270;

    var nextBtn = createNextBtn();
    nextBtn.x = 880;
    nextBtn.y = 400;
    makeButton(nextBtn, finishUserCreation);
    dressRoomContainer.addChild(nextBtn);

    dressRoomContainer.addChild(avatar);

    stopMayorSpeak();
    mayorSpeak("speak_b_createuser_dress", PIXI.Loader.shared);
}

function createDressRoomAlphaBtn(btnname, xPos, yPos, callback) {
    var btn = new PIXI.Graphics();
    btn.name = btnname;
    btn.lineStyle(4, 0x00FF00);
    btn.beginFill(0xffff00);
    btn.drawRect(0, 0, 50, 50);
    btn.position.set(xPos, yPos);
    btn.alpha = 0;
    makeButton(btn, callback);
    cleanUpArray.push(btn);

    return btn;
}

function createDressRoomSquareBtn(btnname, xPos, yPos, selected, callback) {
    var dressRoomBtn = new PIXI.Graphics();
    dressRoomBtn.lineStyle(4, 0x00FF00);
    dressRoomBtn.name = btnname;
    dressRoomBtn.beginFill(0xffff00, 0.2);
    dressRoomBtn.drawRect(0, 0, 40, 40);
    dressRoomBtn.position.set(xPos, yPos);
    if (selected) {
        dressRoomBtn.alpha = 1;
    } else {
        dressRoomBtn.alpha = 0;
    }
    makeButton(dressRoomBtn, callback);

    cleanUpArray.push(dressRoomBtn);

    return dressRoomBtn;
}

function selectSkin() {
    dressRoomContainer.getChildByName("01").alpha = 0;
    dressRoomContainer.getChildByName("02").alpha = 0;

    user.skin = this.name;
    this.alpha = 1;

    drawAvatar();
}

function selectHairType() {
    var typeNumber = this.name.slice(2);
    if (user.gender == "boy") {
        if (typeNumber == 1) {
            typeNumber = 2;
        } else if (typeNumber == 2) {
            typeNumber = 1;
        }
        dressRoomContainer.getChildByName("hairType").gotoAndStop(typeNumber - 1);
    } else {
        dressRoomContainer.getChildByName("hairType").gotoAndStop(typeNumber - 1);
        if (typeNumber == 1) {
            typeNumber = 2;
        } else if (typeNumber == 2) {
            typeNumber = 1;
        }
    }

    user.hair = typeNumber;

    drawAvatar();
}

function selectBodyType() {
    var typeNumber = this.name.slice(2);
    dressRoomContainer.getChildByName("bodyType").gotoAndStop(typeNumber - 1);
    user.body = typeNumber;

    drawAvatar();
}

function selectShoesType() {
    var typeNumber = this.name.slice(2);
    dressRoomContainer.getChildByName("shoesType").gotoAndStop(typeNumber - 1);
    user.shoes = typeNumber;

    drawAvatar();
}

function selectLegsType() {
    var typeNumber = this.name.slice(2);
    dressRoomContainer.getChildByName("legsType").gotoAndStop(typeNumber - 1);
    user.legs = typeNumber;

    drawAvatar();
}

function selectEyesType() {
    var typeNumber = this.name.slice(2);
    dressRoomContainer.getChildByName("eyesType").gotoAndStop(typeNumber - 1);
    if (typeNumber == 1) {
        user.eyes = "01";
    } else if (typeNumber == 2) {
        user.eyes = "02";
    } else {
        user.eyes = "03";
    }

    drawAvatar();
}

function selectHairColor() {
    dressRoomContainer.getChildByName("1").alpha = 0;
    dressRoomContainer.getChildByName("2").alpha = 0;
    dressRoomContainer.getChildByName("3").alpha = 0;
    dressRoomContainer.getChildByName("4").alpha = 0;

    user.hairColor = this.name;
    this.alpha = 1;

    drawAvatar();
}

function selectBodyColor() {
    dressRoomContainer.getChildByName("bc1").alpha = 0;
    dressRoomContainer.getChildByName("bc2").alpha = 0;
    dressRoomContainer.getChildByName("bc3").alpha = 0;
    dressRoomContainer.getChildByName("bc4").alpha = 0;

    user.bodyColor = this.name.slice(2);
    this.alpha = 1;

    drawAvatar();
}

function selectLegsColor() {
    dressRoomContainer.getChildByName("lc1").alpha = 0;
    dressRoomContainer.getChildByName("lc2").alpha = 0;
    dressRoomContainer.getChildByName("lc3").alpha = 0;
    dressRoomContainer.getChildByName("lc4").alpha = 0;

    user.legsColor = this.name.slice(2);
    this.alpha = 1;

    drawAvatar();
}

function selectShoesColor() {
    dressRoomContainer.getChildByName("sc1").alpha = 0;
    dressRoomContainer.getChildByName("sc2").alpha = 0;
    dressRoomContainer.getChildByName("sc3").alpha = 0;
    dressRoomContainer.getChildByName("sc4").alpha = 0;

    user.shoesColor = this.name.slice(2);
    this.alpha = 1;

    drawAvatar();
}



function drawAvatar() {
    if (avatar) {
        avatar.removeChildren();
    } else {
        avatar = new PIXI.Container();
    }

    if (user.gender == "boy") {
        avatar.addChild(createSprite("images/avatar/Krop_dreng00" + user.skin + ".png", 0, 100));

        switch (parseInt(user.shoes)) {
            case 1:
                avatar.addChild(createSprite("images/avatar/Dreng_sko" + user.shoes + "000" + user.shoesColor + ".png", 5, 312));
                break;
            case 2:
                avatar.addChild(createSprite("images/avatar/Dreng_sko" + user.shoes + "000" + user.shoesColor + ".png", 6, 303));
                break;
            case 3:
                avatar.addChild(createSprite("images/avatar/Dreng_sko" + user.shoes + "000" + user.shoesColor + ".png", 5, 317));
                break;
            default:
                var avatarShoes = createMC("avatarBoyShoes00", 14, -3, 274);
                avatarShoes.gotoAndStop(user.shoes - 1);
                avatar.addChild(avatarShoes);
                if (user.shoes == 4) {
                    avatarShoes.x = -5;
                    avatarShoes.y = 271;
                } else if (user.shoes == 9) {
                    avatarShoes.x = -5;
                    avatarShoes.y = 272;
                } else if (user.shoes >= 12) {
                    avatarShoes.x = -1;
                }

        }


        switch (parseInt(user.legs)) {
            case 1:
                avatar.addChild(createSprite("images/avatar/Dreng_bukser" + user.legs + "000" + user.legsColor + ".png", 28, 200));
                break;
            case 2:
                avatar.addChild(createSprite("images/avatar/Dreng_bukser" + user.legs + "000" + user.legsColor + ".png", 8, 198));
                break;
            case 3:
                avatar.addChild(createSprite("images/avatar/Dreng_bukser" + user.legs + "000" + user.legsColor + ".png", 15, 195));
                break;
            default:
                var avatarLegs = createMC("avatarBoyLegs00", 12, 11, 185);
                avatarLegs.gotoAndStop(user.legs - 1);
                avatar.addChild(avatarLegs);
        }


        switch (parseInt(user.body)) {
            case 1:
                avatar.addChild(createSprite("images/avatar/Dreng_bluse" + user.body + "000" + user.bodyColor + ".png", -2, 77));
                break;
            case 2:
                avatar.addChild(createSprite("images/avatar/Dreng_bluse" + user.body + "000" + user.bodyColor + ".png", -2, 100));
                break;
            case 3:
                avatar.addChild(createSprite("images/avatar/Dreng_bluse" + user.body + "000" + user.bodyColor + ".png", -5, 95));
                break;
            default:
                var avatarBody = createMC("avatarBoyBody00", 19, -31, 24);
                avatarBody.gotoAndStop(user.body - 1);
                avatar.addChild(avatarBody);
        }

        avatar.addChild(createSprite("images/avatar/BoyFace00" + user.skin + ".png", 10, 0));

        avatar.addChild(createSprite("images/avatar/Dreng_oejne00" + user.eyes + ".png", 30, 53));

        if (user.hair == 3) {
            avatar.addChild(createSprite("images/avatar/Dreng_haar" + user.hair + "000" + user.hairColor + ".png", 5, -20));
        } else if (user.hair == 4) {
            avatar.addChild(createSprite("images/avatar/Dreng_haar" + user.hair + "000" + user.hairColor + ".png", 8, -14));
        } else {
            avatar.addChild(createSprite("images/avatar/Dreng_haar" + user.hair + "000" + user.hairColor + ".png", 5, -17));
        }

        switch (parseInt(user.hat)) {
            case -1:
                break;
            default:
                var avatarHat = createMC("avatarBoyHats00", 4, -40, -45);
                avatarHat.gotoAndStop(user.hat - 1);
                avatar.addChild(avatarHat);
                if (user.hat == 4) {
                    avatarHat.x = -70;
                    avatarHat.y = -105;
                }
        }

    } else {
        avatar.addChild(createSprite("images/avatar/Krop_pige00" + user.skin + ".png", 0, 100));

        switch (parseInt(user.shoes)) {
            case 1:
                avatar.addChild(createSprite("images/avatar/Pige_sko" + user.shoes + "000" + user.shoesColor + ".png", 5, 332));
                break;
            case 2:
                avatar.addChild(createSprite("images/avatar/Pige_sko" + user.shoes + "000" + user.shoesColor + ".png", 2, 310));
                break;
            case 3:
                avatar.addChild(createSprite("images/avatar/Pige_sko" + user.shoes + "000" + user.shoesColor + ".png", 4, 327));
                break;
            default:
                var avatarShoes = createMC("avatarGirlShoes00", 13, -2, 282);
                avatarShoes.gotoAndStop(user.shoes - 1);
                avatar.addChild(avatarShoes);
                if (user.shoes == 4 || user.shoes == 13) {
                    avatarShoes.x = -4;

                }

        }

        switch (parseInt(user.legs)) {
            case 1:
                avatar.addChild(createSprite("images/avatar/Pige_bukser" + user.legs + "000" + user.legsColor + ".png", 10, 183));
                break;
            case 2:
                avatar.addChild(createSprite("images/avatar/Pige_bukser" + user.legs + "000" + user.legsColor + ".png", 8, 180));
                break;
            case 3:
                avatar.addChild(createSprite("images/avatar/Pige_bukser" + user.legs + "000" + user.legsColor + ".png", 17, 180));
                break;
            default:
                var avatarLegs = createMC("avatarGirlLegs00", 10, -10, 175);
                avatarLegs.gotoAndStop(user.legs - 1);
                avatar.addChild(avatarLegs);
                if (user.legs == 5) {
                    avatarLegs.x = -15;
                    avatarLegs.y = 185;
                }
        }


        switch (parseInt(user.body)) {
            case 1:
                avatar.addChild(createSprite("images/avatar/Pige_bluse" + user.body + "000" + user.bodyColor + ".png", -2, 80));
                break;
            case 2:
                avatar.addChild(createSprite("images/avatar/Pige_bluse" + user.body + "000" + user.bodyColor + ".png", 5, 100));
                break;
            case 3:
                avatar.addChild(createSprite("images/avatar/Pige_bluse" + user.body + "000" + user.bodyColor + ".png", 5, 98));
                break;
            default:
                var avatarBody = createMC("avatarGirlBody00", 20, -35, 20);
                avatarBody.gotoAndStop(user.body - 1);
                avatar.addChild(avatarBody);
        }

        avatar.addChild(createSprite("images/avatar/GirlFace00" + user.skin + ".png", 10, 0));

        avatar.addChild(createSprite("images/avatar/Pige_oejne00" + user.eyes + ".png", 16, 55));

        if (user.hair == 3) {
            avatar.addChild(createSprite("images/avatar/Pige_haar" + user.hair + "000" + user.hairColor + ".png", -4, -45));
        } else if (user.hair == 4) {
            avatar.addChild(createSprite("images/avatar/Pige_haar" + user.hair + "000" + user.hairColor + ".png", -23, -26));
        } else if (user.hair == 1) {
            avatar.addChild(createSprite("images/avatar/Pige_haar" + user.hair + "000" + user.hairColor + ".png", -20, -10));
        } else {
            avatar.addChild(createSprite("images/avatar/Pige_haar" + user.hair + "000" + user.hairColor + ".png", -12, -5));
        }

        switch (parseInt(user.hat)) {
            case -1:
                break;
            default:
                var avatarHat = createMC("avatarGirlHats00", 4, -40, -45);
                avatarHat.gotoAndStop(user.hat - 1);
                avatar.addChild(avatarHat);
                if (user.hat == 2) {
                    avatarHat.x = -50;
                } else if (user.hat == 3) {
                    avatarHat.y = -55;
                } else if (user.hat == 4) {
                    avatarHat.x = -5;
                    avatarHat.y = -90;
                }
        }
    }

    avatar.interactiveChildren = false;
    avatar.interactive = false;

    updateUserCookie();
}



//Finish user creation
function finishUserCreation() {
    sendStatPoint("end-create_user");

    user.name = $("#nameinput input").val();
    $("#nameinput").remove();

    cleanup();
    dressRoomContainer.removeChildren();
    dressRoomContainer.destroy();

    updateUserInventory("origbody_" + user.body + "_" + user.bodyColor);
    updateUserInventory("origlegs_" + user.legs + "_" + user.legsColor);
    updateUserInventory("origshoes_" + user.shoes + "_" + user.shoesColor);

    initUniverse();
}


//UNIVERSE----------------------------------------------------------------------------
function initUniverse() {
    if (PIXI.sound.exists("speak_b_createuser_gender")) {
        PIXI.sound.remove("speak_b_createuser_gender");
    }
    if (PIXI.sound.exists("speak_b_createuser_dress")) {
        PIXI.sound.remove("speak_b_createuser_dress");
    }

    sendStatPoint("start-universe");

    stopMayorSpeak();
    mayorSpeak("speak_b_universe_welcome", PIXI.Loader.shared);

    frontGround.addChild(avatar);

    topBar.destroy(true);

    bottomBar.y = 550;
    gameContainer.x += 50;

    drawUniverse();

    wishlist.btn.visible = true;

    frontGround.bank = createSprite("images/universe/Bank.png", 10, 130);
    frontGround.bank.interactive = false;
    frontGround.addChild(frontGround.bank);

    frontGround.avatarBG = createSprite("images/universe/ToolbarAvatarBG.png", 0, 475);
    frontGround.avatarBG.interactive = false;
    frontGround.addChild(frontGround.avatarBG);

    frontGround.setChildIndex(avatar, frontGround.children.length - 1);
    avatar.scale.set(0.38);
    avatar.x = 90;
    avatar.y = 520;
    if ((isMobile || isIPad) && gameContainer.x > 75) {
        avatar.scale.set(0.46);
        avatar.x = 10;
        avatar.y = 500;
    }

    //wallet
    var gold = Math.floor(parseInt(user.wallet) / 10);
    var silver = parseInt(user.wallet) % 10;

    frontGround.goldTF = new PIXI.Text(gold, new PIXI.TextStyle({
        fontFamily: "Arial",
        fontSize: 35,
        fill: "white",
        fontWeight: "bold"
    }));

    if (gold > 9) {
        frontGround.goldTF.x = 20;
    } else {
        frontGround.goldTF.x = 28;
    }
    frontGround.goldTF.y = 425;
    frontGround.goldTF.interactive = false;
    frontGround.addChild(frontGround.goldTF);

    frontGround.silverTF = new PIXI.Text(silver, new PIXI.TextStyle({
        fontFamily: "Arial",
        fontSize: 35,
        fill: "white",
        fontWeight: "bold"
    }));
    frontGround.silverTF.x = 90;
    frontGround.silverTF.y = 410;
    frontGround.silverTF.interactive = false;
    frontGround.addChild(frontGround.silverTF);

    frontGround.goldStack = createMC("GoldStack00", 11, 31, 277);
    frontGround.goldStack.gotoAndStop(gold);
    frontGround.goldStack.interactive = false;
    frontGround.addChild(frontGround.goldStack);

    frontGround.silverStack = createMC("SilverStack00", 11, 80, 261);
    frontGround.silverStack.gotoAndStop(silver);
    frontGround.silverStack.interactive = false;
    frontGround.addChild(frontGround.silverStack);

    if (isMobile || isIPad) {
        resizeBordersForMobile();
    }
}

function playAmbientSounds() {
    var birdSound = PIXI.Loader.shared.resources["bird" + Math.ceil(Math.random() * 4)].sound;
    birdSound.volume = 0.1;
    birdSound.play();
    var waterSound = PIXI.Loader.shared.resources["water" + Math.ceil(Math.random() * 3)].sound;
    waterSound.volume = 0.2;
    waterSound.play();
}

function resetCloud(cloud) {
    cloud.x = 1100;
    TweenMax.to(cloud, 25, {
        pixi: {
            x: -100
        },
        ease: Power0.easeNone,
        onComplete: resetCloud,
        onCompleteParams: [cloud]
    });
}

function checkCloud(cloud) {
    if (cloud.x < 0) {
        TweenMax.killTweensOf(cloud);
        cloud.x = 1100;
        TweenMax.to(cloud, 25, {
            pixi: {
                x: -100
            },
            ease: Power0.easeNone,
            onComplete: resetCloud,
            onCompleteParams: [cloud]
        });
    }
}

function getTreasure() {
    if (user.wizardDone) {
        if (user.treasureFound) {} else {
            sendStatPoint("collect-treasure");

            updateWallet(200);
            user.treasureFound = true;
            this.visible = false;

            updateUserCookie();
        }
    }
}

function drawUniverse() {
    if (universeContainer) {
        gameContainer.addChild(universeContainer);

        //citygate
        if (user.gateDone) {
            universeContainer.cityGate.interactive = false;
            TweenMax.killTweensOf(universeContainer.cityGate)
        } else {
            //pulse
            TweenMax.set(universeContainer.cityGate, {
                pixi: {
                    scale: 1.1
                }
            });
            TweenMax.to(universeContainer.cityGate, 0.5, {
                pixi: {
                    scale: 1
                },
                ease: Power2.easeIn,
                yoyo: true,
                repeat: -1
            });
        }

        //wizardTreasure
        if (user.wizardDone) {
            if (user.treasureFound) {
                if (universeContainer.wizard) {
                    universeContainer.removeChild(universeContainer.wizard);
                }
            } else {
                if (universeContainer.treasure) {} else {
                    universeContainer.treasure = createSprite("images/universe/GoldButton.png", 400, 580);
                    universeContainer.treasure.interactive = true;
                    universeContainer.treasure.buttonMode = true;
                    universeContainer.treasure.on("pointerup", getTreasure);
                    universeContainer.addChild(universeContainer.treasure);
                }
            }
        }


        if (isMobile) {

        } else {
            var cloud;
            for (var i = 0; i < universeContainer.children.length; i++) {
                if (universeContainer.children[i].type == "cloud") {
                    cloud = universeContainer.children[i];
                    TweenMax.to(cloud, 25, {
                        pixi: {
                            x: cloud.x - 1200
                        },
                        ease: Power0.easeNone,
                        onComplete: resetCloud,
                        onCompleteParams: [cloud],
                        onUpdate: checkCloud,
                        onUpdateParams: [cloud]
                    });
                }
            }
        }

    } else {
        universeContainer = new PIXI.Container();
        universeContainer.x = -54;
        universeContainer.y = -102;
        gameContainer.addChild(universeContainer);

        universeBG = createSprite("images/universe/Universe-bg.png", 50, 0);
        universeContainer.addChild(universeBG);

        for (var i = 0; i < 11; i++) {
            var cloud = createSprite("images/universe/Sky.png", Math.floor(Math.random() * 1100), 80 + Math.floor(Math.random() * 120));
            cloud.type = "cloud";
            var cloudScale = 0.4 + (Math.random() * 0.6);
            if (Math.random() < 0.5) {
                cloud.scale.x = 0 - cloudScale;
            } else {
                cloud.scale.x = cloudScale;
            }
            cloud.scale.y = cloudScale;

            if (isMobile) {

            } else {
                TweenMax.to(cloud, 25, {
                    pixi: {
                        x: cloud.x - 1200
                    },
                    ease: Power0.easeNone,
                    onComplete: resetCloud,
                    onCompleteParams: [cloud],
                    onUpdate: checkCloud,
                    onUpdateParams: [cloud]
                });
            }
            universeContainer.addChild(cloud);
        }

        var universeMiddle = createSprite("images/universe/Universe-middle.png", -60, 91);
        universeContainer.addChild(universeMiddle);

        //wizard
        if (user.wizardDone) {
            if (user.treasureFound) {

            } else {
                universeContainer.treasure = createSprite("images/universe/GoldButton.png", 400, 580);
                universeContainer.treasure.interactive = true;
                universeContainer.treasure.buttonMode = true;
                universeContainer.treasure.on("pointerup", getTreasure);
                universeContainer.addChild(universeContainer.treasure);
            }
        } else {
            var wizardGame = createMC("wizard00", 35, 550, 340);
            wizardGame.gotoAndStop(0);
            wizardGame.interactive = true;
            wizardGame.buttonMode = true;
            if (isMobile || isIPad) {
                wizardGame.on("touchstart", wizardHover);
                wizardGame.on("touchend", showWizard);
                wizardGame.on("touchendoutside", wizardEndHover);
            } else {
                wizardGame.on("pointerover", wizardHover);
                wizardGame.on("pointerout", wizardEndHover);
                wizardGame.on("pointerup", showWizard);
            }

            universeContainer.addChild(wizardGame);
            universeContainer.wizard = wizardGame;

        }


        //monopoly
        var monopolyGame = createMC("MonopolyUniverseAccessButton00", 71, 590, 128);
        monopolyGame.gotoAndStop(0);
        monopolyGame.interactive = true;
        monopolyGame.buttonMode = true;
        if (isMobile || isIPad) {
            monopolyGame.on("touchstart", monopolyHover);
            monopolyGame.on("touchend", showMonopolyPopup);
            monopolyGame.on("touchendoutside", monopolyEndHover);
        } else {
            monopolyGame.on("pointerover", monopolyHover);
            monopolyGame.on("pointerout", monopolyEndHover);
            monopolyGame.on("pointerup", showMonopolyPopup);
        }

        universeContainer.addChild(monopolyGame);


        //applegame
        var appleGame = createMC("Aeble_mouseover00", 17, 155, 150);
        var appleMill1 = createMC("Vindmoelle00", 14, 8, 59);
        appleMill1.rotation = -0.2;
        appleGame.addChild(appleMill1);
        var appleMill2 = createMC("Vindmoelle00", 14, 84, 15);
        appleMill2.rotation = 0.1;
        appleGame.addChild(appleMill2);
        appleGame.gotoAndStop(0);
        appleGame.interactive = true;
        appleGame.buttonMode = true;
        if (isMobile || isIPad) {
            appleGame.on("touchstart", appleGameHover);
            appleGame.on("touchend", showAppleGame);
            appleGame.on("touchendoutside", appleGameEndHover);
        } else {
            appleGame.on("pointerover", appleGameHover);
            appleGame.on("pointerout", appleGameEndHover);
            appleGame.on("pointerup", showAppleGame);
        }

        universeContainer.addChild(appleGame);

        //postoffice
        var postOffice = createMC("postoffice00", 18, 584, 423);
        var postOfficeSign = createMC("Post_skilt_ani00", 24, 65, 55);
        postOfficeSign.gotoAndStop(0);
        postOffice.addChild(postOfficeSign);
        postOffice.gotoAndStop(0);
        postOffice.interactive = true;
        postOffice.buttonMode = true;
        if (isMobile || isIPad) {
            postOffice.on("touchstart", postOfficeHover);
            postOffice.on("touchend", showPostOfficeGame);
            postOffice.on("touchendoutside", postOfficeEndHover);
        } else {
            postOffice.on("pointerover", postOfficeHover);
            postOffice.on("pointerout", postOfficeEndHover);
            postOffice.on("pointerup", showPostOfficeGame);
        }

        universeContainer.addChild(postOffice);

        //farm
        var farm = createMC("farm instance 100", 22, 130, 515);
        farm.gotoAndStop(0);
        farm.interactive = true;
        farm.buttonMode = true;

        if (isMobile || isIPad) {
            farm.on("touchstart", farmHover);
            farm.on("touchend", showFarmGame);
            farm.on("touchendoutside", farmEndHover);
        } else {
            farm.on("pointerover", farmHover);
            farm.on("pointerout", farmEndHover);
            farm.on("pointerup", showFarmGame);
        }
        universeContainer.addChild(farm);


        //karens butik
        var karens = createMC("Karens_hus00", 41, 447, 145);
        karens.gotoAndStop(0);
        karens.interactive = true;
        karens.buttonMode = true;

        if (isMobile || isIPad) {
            karens.on("touchstart", karensHover);
            karens.on("touchend", showKarens);
            karens.on("touchendoutside", karensEndHover);
        } else {
            karens.on("pointerover", karensHover);
            karens.on("pointerout", karensEndHover);
            karens.on("pointerup", showKarens);
        }
        universeContainer.addChild(karens);


        //timemachine
        var timeMachine = createMC("timemachine00", 21, 785, 220);
        timeMachine.gotoAndStop(0);
        timeMachine.interactive = true;
        timeMachine.buttonMode = true;

        if (isMobile || isIPad) {
            timeMachine.on("touchstart", tmHover);
            timeMachine.on("touchendoutside", tmEndHover);
            timeMachine.on("touchend", showTimeMachine);
        } else {
            timeMachine.on("pointerover", tmHover);
            timeMachine.on("pointerout", tmEndHover);
            timeMachine.on("pointerup", showTimeMachine);
        }
        universeContainer.addChild(timeMachine);


        //house
        var house = createMC("home instance 100", 19, 160, 350);
        house.gotoAndStop(0);
        house.interactive = true;
        house.buttonMode = true;


        if (isMobile || isIPad) {
            house.on("touchstart", houseHover);
            house.on("touchend", showRoom);
            house.on("touchendoutside", houseEndHover);
        } else {
            house.on("pointerover", houseHover);
            house.on("pointerout", houseEndHover);
            house.on("pointerup", showRoom);
        }
        universeContainer.addChild(house);


        var postOffice = createMC("postoffice00", 18, 584, 423);
        var postOfficeSign = createMC("Post_skilt_ani00", 24, 65, 55);
        postOfficeSign.gotoAndStop(0);
        postOffice.addChild(postOfficeSign);
        postOffice.gotoAndStop(0);
        postOffice.interactive = true;
        postOffice.buttonMode = true;
        if (isMobile || isIPad) {
            postOffice.on("touchstart", postOfficeHover);
            postOffice.on("touchend", showPostOfficeGame);
            postOffice.on("touchendoutside", postOfficeEndHover);
        } else {
            postOffice.on("pointerover", postOfficeHover);
            postOffice.on("pointerout", postOfficeEndHover);
            postOffice.on("pointerup", showPostOfficeGame);
        }

        universeContainer.addChild(postOffice);


        //port
        var portGame = createSprite("images/universe/port.png", 569, 709);
        portGame.anchor.set(0.5);
        if (user.gateDone) {

        } else {
            portGame.interactive = true;
            portGame.buttonMode = true;

            if (isMobile || isIPad) {
                portGame.on("touchstart", portHover);
                portGame.on("touchend", showGate);
                portGame.on("touchendoutside", portEndHover);
            } else {
                portGame.on("pointerover", portHover);
                portGame.on("pointerout", portEndHover);
                portGame.on("pointerup", showGate);
            }
            TweenMax.set(portGame, {
                pixi: {
                    scale: 1.1
                }
            });
            TweenMax.to(portGame, 0.5, {
                pixi: {
                    scale: 1
                },
                ease: Power2.easeIn,
                yoyo: true,
                repeat: -1
            });
        }
        universeContainer.addChild(portGame);
        universeContainer.cityGate = portGame;


        //small anims
        createSmallAnim("car100", 46, 290, 320);
        createSmallAnim("car200", 48, 470, 480);
        createSmallRandomAnim("Fisk_ani00", 19, 700, 240);
        createSmallDoubleAnim("cow20", 332, 480, 320, 218);
        createSmallDoubleAnim("sheep10", 251, 800, 350, 159);
        createSmallAnim("parasol20", 125, 860, 410);

        if (isMobile || isIPad) {

        } else {
            createSmallAnim("parasol20", 125, 880, 235);
            createSmallDoubleAnim("horse20", 398, 440, 500, 250);
            createSmallDoubleAnim("Symbol 3650", 394, 740, 580, 114); //rabbit
            createSmallDoubleAnim("Symbol 4280", 150, 370, 460, 59); //cat
        }



        var universeFront = createSprite("images/universe/Universe-front.png", 120, 208);
        universeContainer.addChild(universeFront);

        if (wizardGame) {
            universeContainer.setChildIndex(wizardGame, universeContainer.children.length - 1)
        }

        var sideBarBG = new PIXI.Graphics();
        sideBarBG.beginFill(0x001933);
        sideBarBG.drawRect(0, 0, 140, 704);
        sideBar.addChild(sideBarBG);

        if (universeAmbientSoundsInterval) {

        } else {
            universeAmbientSoundsInterval = setInterval(playAmbientSounds, 2000);
            playAmbientSounds();
        }
    }
}

function createSmallRandomAnim(spriteName, frames, xPos, yPos) {
    var smallAnim = createMC(spriteName, frames, xPos, yPos);
    smallAnim.loop = false;
    smallAnim.gotoAndStop(0);
    universeContainer.addChild(smallAnim);

    TweenMax.delayedCall(Math.random() * 15, animateSmallRandomAnim, [smallAnim]);
}

function animateSmallRandomAnim(anim) {
    anim.gotoAndPlay(1);
    anim.onComplete = function() {
        this.gotoAndStop(0);
        TweenMax.delayedCall(Math.random() * 15, animateSmallRandomAnim, [anim]);
    }
}

function createSmallAnim(spriteName, frames, xPos, yPos) {
    var smallAnim = createMC(spriteName, frames, xPos, yPos);
    smallAnim.name = spriteName;
    smallAnim.loop = false;
    smallAnim.gotoAndStop(0);
    smallAnim.interactive = true;
    universeContainer.addChild(smallAnim);

    if (isMobile || isIPad) {
        smallAnim.on("pointerdown", function() {
            this.gotoAndPlay(1);
            this.interactive = false;
            if (this.name == "car100") {
                PIXI.Loader.shared.resources["car1"].sound.play();
            } else if (this.name == "car200") {
                PIXI.Loader.shared.resources["car2"].sound.play();
            } else if (this.name == "parasol20") {
                PIXI.Loader.shared.resources["parasol"].sound.play();
            }
        });
    } else {
        smallAnim.on("pointerover", function() {
            this.gotoAndPlay(1);
            this.interactive = false;
            if (this.name == "car100") {
                PIXI.Loader.shared.resources["car1"].sound.play();
            } else if (this.name == "car200") {
                PIXI.Loader.shared.resources["car2"].sound.play();
            } else if (this.name == "parasol20") {
                PIXI.Loader.shared.resources["parasol"].sound.play();
            }
        });
    }

    smallAnim.onComplete = function() {
        this.gotoAndStop(0);
        this.interactive = true;
    }
}

function createSmallDoubleAnim(spriteName, frames, xPos, yPos, loop) {
    var smallAnim = createMC(spriteName, frames, xPos, yPos);
    smallAnim.name = spriteName;
    smallAnim.loopFrame = loop;
    smallAnim.interactive = true;
    smallAnim.loop = true;
    universeContainer.addChild(smallAnim);

    smallAnim.onFrameChange = function() {
        if (this.currentFrame >= this.loopFrame) {
            this.gotoAndPlay(0);
        }
    }

    if (isMobile || isIPad) {
        smallAnim.on("pointerdown", function() {
            this.onFrameChange = null;
            this.onFrameChange = function() {
                if (this.currentFrame == 0) {
                    this.interactive = true;
                    this.onFrameChange = null;
                    this.onFrameChange = function() {
                        if (this.currentFrame >= this.loopFrame) {
                            this.gotoAndPlay(0);
                        }
                    }
                }
            }
            this.gotoAndPlay(this.loopFrame + 1);
            this.interactive = false;

            if (this.name == "cow20") {
                playRandomSoundPixi(["universe_cow1", "universe_cow2"]);
            } else if (this.name == "car200") {
                playRandomSoundPixi(["universe_sheep1", "universe_sheep2"]);
            } else if (this.name == "horse20") {
                playRandomSoundPixi(["universe_horse1", "universe_horse2"]);
            } else if (this.name == "Symbol 3650") {
                playSound("universe_rabbit_magic", PIXI.Loader.shared);
            } else if (this.name == "Symbol 4280") {

            }
        });
    } else {
        smallAnim.on("pointerover", function() {
            this.onFrameChange = null;
            this.onFrameChange = function() {
                if (this.currentFrame == 0) {
                    this.interactive = true;
                    this.onFrameChange = null;
                    this.onFrameChange = function() {
                        if (this.currentFrame >= this.loopFrame) {
                            this.gotoAndPlay(0);
                        }
                    }
                }
            }
            this.gotoAndPlay(this.loopFrame + 1);
            this.interactive = false;

            if (this.name == "cow20") {
                playRandomSoundPixi(["universe_cow1", "universe_cow2"])
            } else if (this.name == "sheep10") {
                playRandomSoundPixi(["universe_sheep1", "universe_sheep2"]);
            } else if (this.name == "horse20") {
                playRandomSoundPixi(["universe_horse1", "universe_horse2"]);
            } else if (this.name == "Symbol 3650") {
                setTimeout(rabbitSound, 1800);
            } else if (this.name == "Symbol 4280") {

            }
        });
    }

    smallAnim.onComplete = function() {
        this.gotoAndPlay(0);
        this.interactive = true;

        this.onFrameChange = function() {
            if (this.currentFrame >= this.loopFrame) {
                this.gotoAndPlay(0);
            }
        }
    }
}

function rabbitSound() {
    playSound("universe_rabbit_magic", PIXI.Loader.shared);
}


function appleGameHover() {
    stopMayorSpeak();
    mayorSpeak("speak_b_universe_apple", PIXI.Loader.shared);

    TweenMax.to(this.children[0], 0.35, {
        pixi: {
            scaleX: 1.5,
            scaleY: 1.5,
            x: -10,
            y: 40
        }
    });
    TweenMax.to(this.children[1], 0.35, {
        pixi: {
            scaleX: 1.5,
            scaleY: 1.5,
            x: 90,
            y: -15
        }
    });

    this.onFrameChange = function() {
        if (this.currentFrame == 9) {
            this.stop();
            this.onFrameChange = null;
        }
    }
    this.gotoAndPlay(1);
}

function appleGameEndHover() {
    stopMayorSpeak();

    TweenMax.to(this.children[0], 0.35, {
        delay: 0.2,
        pixi: {
            scaleX: 1,
            scaleY: 1,
            x: 8,
            y: 59
        }
    });
    TweenMax.to(this.children[1], 0.35, {
        delay: 0.2,
        pixi: {
            scaleX: 1,
            scaleY: 1,
            x: 84,
            y: 15
        }
    });

    this.onFrameChange = function() {
        if (this.currentFrame == 0) {
            this.stop();
            this.onFrameChange = null;
        }
    }
    this.gotoAndPlay(10);
}


function postOfficeHover() {
    stopMayorSpeak();
    this.sound = playSound("speak_universe_postoffice", PIXI.Loader.shared);

    TweenMax.to(this.children[0], 0.35, {
        pixi: {
            scaleX: 1.5,
            scaleY: 1.5,
            x: 50,
            y: 22
        }
    });

    this.onFrameChange = function() {
        if (this.currentFrame == 9) {
            this.stop();
            this.onFrameChange = null;
            this.children[0].play();
        }
    }
    this.gotoAndPlay(1);
}

function postOfficeEndHover() {
    if (this.sound) {
        this.sound.stop();
    }

    TweenMax.to(this.children[0], 0.35, {
        delay: 0.2,
        pixi: {
            scaleX: 1,
            scaleY: 1,
            x: 65,
            y: 55
        }
    });
    //TweenMax.to(this.children[0].position, 0.5, {x:65, y:55});
    this.onFrameChange = function() {
        if (this.currentFrame == 0) {
            this.stop();
            this.onFrameChange = null;
            this.children[0].gotoAndStop(0);
        }
    }
    this.gotoAndPlay(10);
    this.children[0].play();
}

function farmHover() {
    stopMayorSpeak();
    this.sound = playSound("speak_universe_farm", PIXI.Loader.shared);

    this.onFrameChange = function() {
        if (this.currentFrame == 11) {
            this.stop();
            this.onFrameChange = null;
        }
    }
    this.gotoAndPlay(1);
}

function farmEndHover() {
    if (this.sound) {
        this.sound.stop();
    }

    this.onFrameChange = function() {
        if (this.currentFrame == 0) {
            this.stop();
            this.onFrameChange = null;
        }
    }
    this.gotoAndPlay(12);
}


function karensHover() {
    stopMayorSpeak();
    this.sound = playSound("speak_universe_karens", PIXI.Loader.shared);

    this.onFrameChange = function() {
        if (this.currentFrame == 30) {
            this.stop();
            this.onFrameChange = null;
        }
    }
    this.gotoAndPlay(1);
}

function karensEndHover() {
    if (this.sound) {
        this.sound.stop();
    }

    this.onFrameChange = function() {
        if (this.currentFrame == 0) {
            this.stop();
            this.onFrameChange = null;
        }
    }
    this.gotoAndPlay(11);
}

function tmHover() {
    stopMayorSpeak();
    this.sound = playSound("speak_universe_timemachine", PIXI.Loader.shared);

    this.onFrameChange = function() {
        if (this.currentFrame == 10) {
            this.stop();
            this.onFrameChange = null;
        }
    }
    this.gotoAndPlay(1);
}

function tmEndHover() {
    if (this.sound) {
        this.sound.stop();
    }

    this.onFrameChange = function() {
        if (this.currentFrame == 0) {
            this.stop();
            this.onFrameChange = null;
        }
    }
    this.gotoAndPlay(31);
}

function houseHover() {
    stopMayorSpeak();
    mayorSpeak("speak_b_universe_room", PIXI.Loader.shared);

    this.onFrameChange = function() {
        if (this.currentFrame == 9) {
            this.stop();
            this.onFrameChange = null;
        }
    }
    this.gotoAndPlay(1);
}

function houseEndHover() {
    stopMayorSpeak();

    this.onFrameChange = function() {
        if (this.currentFrame == 0) {
            this.stop();
            this.onFrameChange = null;
        }
    }
    this.gotoAndPlay(10);
}


function monopolyHover() {
    stopMayorSpeak();
    mayorSpeak("speak_b_universe_monopolyAccess", PIXI.Loader.shared)

    this.onFrameChange = function() {
        if (this.currentFrame == 60) {
            this.stop();
            this.onFrameChange = null;
        }
    }
    this.gotoAndPlay(1);
}

function monopolyEndHover() {
    stopMayorSpeak();

    this.onFrameChange = function() {
        if (this.currentFrame == 0) {
            this.stop();
            this.onFrameChange = null;
        }
    }
    this.gotoAndPlay(61);
}

function wizardHover() {
    stopMayorSpeak();
    this.sound = playSound("speak_universe_wizard", PIXI.Loader.shared);

    this.onFrameChange = function() {
        if (this.currentFrame == 8) {
            this.stop();
            this.onFrameChange = null;
        }
    }
    this.gotoAndPlay(1);
}

function wizardEndHover() {
    if (this.sound) {
        this.sound.stop();
    }

    this.onFrameChange = function() {
        if (this.currentFrame >= 15) {
            this.gotoAndStop(0);
            this.onFrameChange = null;
        }
    }
    this.gotoAndPlay(9);
}

function portHover() {
    TweenMax.killTweensOf(this);
    TweenMax.to(this, 0.35, {
        pixi: {
            scale: 1.2
        },
        ease: Power2.easeIn
    });
}

function portEndHover() {
    TweenMax.set(this, {
        pixi: {
            scale: 1.1
        }
    });
    TweenMax.to(this, 0.5, {
        pixi: {
            scale: 1
        },
        ease: Power2.easeIn,
        yoyo: true,
        repeat: -1
    });
}



//BACK TO UNIVERSE
function backToUniverse() {

    sendStatPoint("end-game-start-universe");
    TweenMax.killAll();

    if (gameConfig.wizardTimer) {
        clearInterval(gameConfig.wizardTimer);
    }

    if (gameConfig.initHayGameTimer) {
        clearInterval(gameConfig.initHayGameTimer);
    }

    if (gameConfig.monthTimeOut) {
        clearInterval(gameConfig.monthTimeOut);
    }

    if (gameConfig.wizardAmbientSound) {
        gameConfig.wizardAmbientSound.stop();
    }

    if (gameConfig.wizardSound) {
        gameConfig.wizardSound.stop();
    }

    if (gamePopup) {
        if (gamePopup.children[1]) {
            gamePopup.children[1].onFrameChange = null;
        }
    }

    if (gameConfig.appleKeysSetup) { //apple game keylisteners running
        gameConfig.appleKeysSetup = null;
        window.removeEventListener("keydown", appleKeyListener);
    }

    if (gameConfig.playingSound) {
        gameConfig.playingSound.stop();
    }

    if (gameConfig.ambientTimer) {
        clearInterval(gameConfig.ambientTimer);
        gameConfig.ambientTimer = null;
    }

    $(".mononameinput").val("");
    $(".mononameinput").hide();
    if (gameConfig.startupNextBtn) {
        gameConfig.startupNextBtn.parent.removeChild(gameConfig.startupNextBtn);
    }

    if (gameConfig.mobileLeftBtn) {
        frontGround.removeChild(gameConfig.keyBackground);
        frontGround.removeChild(gameConfig.mobileLeftBtn);
        frontGround.removeChild(gameConfig.mobileRightBtn);
        gameConfig.keyBackground = null;
        gameConfig.mobileLeftBtn = null;
        gameConfig.mobileRightBtn = null;
    }

    if ($("body").hasClass("nocursor")) {
        $("body").removeClass("nocursor");
        app.stage.off('pointermove', dragBrush);
    }

    if (gameSoundArray && gameSoundArray.length > 0) {
        for (var i = 0; i < gameSoundArray.length; i++) {
            if (PIXI.sound.exists(gameSoundArray[i])) {
                PIXI.sound.remove(gameSoundArray[i]);
            }
        }
        gameSoundArray = new Array();
    }

    if (gameLoader) {
        gameLoader.reset();
    }

    cleanup();

    stopMayorSpeak();
    mayor.visible = true;
    wishlist.btn.visible = true;

    gameConfig = {};
    gameContainer.removeChildren();

    drawUniverse();

    TweenMax.to(bottomBar, 0.3, {
        pixi: {
            y: 550
        }
    });


    frontGround.addChild(avatar);
    frontGround.setChildIndex(avatar, frontGround.children.length - 1);
    avatar.scale.set(0.38);
    avatar.x = 90;
    avatar.y = 520;

    if ((isMobile || isIPad) && gameContainer.x > 75) {
        avatar.scale.set(0.46);
        avatar.x = 10;
        avatar.y = 500;

        frontGround.avatarBG.y = 440;
    }

}


//ROOM
function showRoom() {
    sendStatPoint("start-room");
    stopMayorSpeak();
    clearInterval(universeAmbientSoundsInterval);
    universeAmbientSoundsInterval = null;

    gameSoundArray = new Array();

    gameContainer.removeChildren();
    if (gameLoader) {
        gameLoader.reset();
    }

    if (localTest) {
        loadRoomResources({
            "speak_b_room_welcome": {
                "contenttype": "sound",
                "content": "dk_velkommen_til_vaerelse.mp3",
                "subtitle": "Velkommen til dit v\u00e6relse. Hvis du har lyst til at skifte t\u00f8j, skal du bare klikke p\u00e5 skabet. Husk, at du kan k\u00f8be mere t\u00f8j og flere ting til dit v\u00e6relse i Karens Butik. Hvis du har v\u00e6ret ude at rejse med Tidsmaskinen, kan du ovre p\u00e5 hylden se de ting, du har f\u00e5et. Og hvis Troldmanden har fortalt dig sin hemmelighed, h\u00e6nger dit diplom p\u00e5 tavlen. Klik p\u00e5 kortet for at g\u00e5 p\u00e5 opdagelse i Pengeby! "
            }
        });
    } else {
        $.ajax({
            type: 'GET',
            url: 'gameadmin/getcontent/room.json',
            contentType: 'application/json; charset=utf-8',
            dataType: 'json',
        }).done(loadRoomResources);
    }
}


function loadRoomResources(data) {
    gameLoader = new PIXI.Loader();
    $.each(data, function(key, val) {
        gameLoader.add(key, "files/" + val.content);

        subtitleArray[key] = val.subtitle;

        gameSoundArray.push(key);
    })

    showPreloader();
    gameLoader.on('progress', preloadProgress);

    gameLoader.add("images/room/RoomBG.png")
        .add("images/room/closetBG.png")
        .add("images/room/InfoBox.png")
        .add("images/room/roomCabinet.json")
        .add("images/room/roomDiploma.png")
        .add("images/room/roomLamp.json")
        .add("images/room/roomRadio.json")
        .add("images/room/roomTable.png")
        .add("images/room/closetArrow.png")
        .add("images/room/hanger.png")
        .add("item_car", "files/Bil.mp3")
        .add("item_cd", "files/CD.mp3")
        .add("item_elephant", "files/Elefant.mp3")
        .add("item_guitar", "files/Guitar.mp3")
        .add("item_house", "files/Dukkehus.mp3")
        .add("item_keyboard", "files/Keyboard_1.mp3")
        .add("item_magicwand", "files/Tryllestav_0.mp3")
        .add("item_mobile", "files/Mobiltelefon_2.mp3")
        .add("item_plain", "files/Flyvemaskine.mp3")
        .add("item_radio", "files/radio.mp3")
        .add("item_rocket", "files/Raket.mp3")
        .add("images/karens/items/dollhouse.json")
        .add("images/karens/items/dragon.json")
        .add("images/karens/items/heartlights.json")
        .add("images/karens/items/items.json")
        .add("images/karens/items/lavalamp.json")
        .add("images/karens/items/rocket.json")
        .add("images/karens/items/wand.json")
    if (user.gender == "boy") {
        gameLoader.add("images/karens/boyShoes.json");
        gameLoader.add("images/karens/boyLegs.json");
        gameLoader.add("images/karens/boyBody.json");
        gameLoader.add("images/karens/boyHats.json");
    } else {
        gameLoader.add("images/karens/girlShoes.json");
        gameLoader.add("images/karens/girlLegs.json");
        gameLoader.add("images/karens/girlBody.json");
        gameLoader.add("images/karens/girlHats.json");
    }

    gameLoader.load(initRoom);
}

var roomItems = new Array();
roomItems.push(["plane", 18, "item100", 0, 27, "item_plain", -60, -80]);
roomItems.push(["ketcher", 15, "item100", 1, 27, "", -10, -85]);
roomItems.push(["mobile", 25, "item100", 2, 27, "item_mobile", 5, -100]);
roomItems.push(["paints", 12, "item100", 3, 27, "", 0, -90]);
roomItems.push(["mp3player", 42, "item100", 4, 27, "item_radio", 0, -100]);
roomItems.push(["bog", 9, "item100", 5, 27, "", -5, -85]);
roomItems.push(["spil", 8, "item100", 6, 27, "", -30, -90]);
roomItems.push(["cd", 8, "item100", 7, 27, "item_cd", 0, -85]);
roomItems.push(["lavalampe", 17, "lavalamp0", -1, 235, "", 20, -15]);
roomItems.push(["sword", 13, "item100", 9, 27, "", -20, -100]);
roomItems.push(["wand", 11, "wand00", -1, 79, "item_magicwand", -50, -45]);
roomItems.push(["rocket", 31, "rocket0", -1, 104, "item_rocket", -260, -350]);
roomItems.push(["car", 15, "item100", 12, 27, "item_car", -20, -85]);
roomItems.push(["keyboard", 17, "item100", 13, 27, "item_keyboard", -40, -75]);
roomItems.push(["dollhouse", 33, "dollhouse00", -1, 69, "item_house", -70, -25]);
roomItems.push(["guitar", 19, "item100", 15, 27, "item_guitar", 10, -75]);
roomItems.push(["teddy", 7, "item100", 16, 27, "", 0, -70]);
roomItems.push(["elephant", 8, "item100", 17, 27, "item_elephant", 0, -80]);
roomItems.push(["dog", 5, "item100", 18, 27, "", 0, -80]);
roomItems.push(["doll", 19, "item100", 19, 27, "", 0, -80]);
roomItems.push(["pillow", 9, "item100", 20, 27, "", -25, -65]);
roomItems.push(["ball", 5, "item100", 21, 27, "", 0, -90]);
roomItems.push(["fishtank", 23, "item100", 22, 27, "", -5, -80]);
roomItems.push(["superman", 20, "item100", 23, 27, "", 0, -80]);
roomItems.push(["modeldoll", 8, "item100", 24, 27, "", -5, -75]);
roomItems.push(["dragon", 18, "dragon0", -1, 123, "", -35, 0]);
roomItems.push(["heartlights", 29, "heartlights0", -1, 100, "", -60, -20]);
roomItems.push(["dino", 29, "heartlights0", -1, 100, "", -60, -20]);
roomItems.push(["ridder", 29, "heartlights0", -1, 100, "", -60, -20]);
roomItems.push(["rome", 29, "heartlights0", -1, 100, "", -60, -20]);
roomItems.push(["egypt", 29, "heartlights0", -1, 100, "", -60, -20]);

function initRoom(loader, resources) {
    gameConfig = {};

    frontGround.removeChild(avatar);

    var roomBG = createSprite("images/room/RoomBG.png", -15, -40, gameLoader);
    gameContainer.addChild(roomBG);
    cleanUpArray.push(roomBG);


    var label = new PIXI.Text(user.name, labelStyle);
    if (user.name == "") {
        label.text = "?";
    }
    label.x = 190;
    label.y = 60;
    label.rotation = -0.06;
    label.scale.set(0.75);
    gameContainer.addChild(label);
    cleanUpArray.push(label);

    gameConfig.radio = createMCGC("radio00", 2, 628, 152);
    gameConfig.radio.gotoAndStop(0);
    gameConfig.radio.name = "radio";
    makeButton(gameConfig.radio, roomTurnOn);
    gameContainer.addChild(gameConfig.radio);
    cleanUpArray.push(gameConfig.radio);

    gameConfig.closet = createMCGC("roomCloset00", 22, 380, 60);
    gameConfig.closet.gotoAndStop(0);
    gameContainer.addChild(gameConfig.closet);
    makeButton(gameConfig.closet, showCloset);
    gameConfig.closet.on("pointerover", function() {
        this.gotoAndPlay(1);
    });
    gameConfig.closet.on('pointerout', function() {
        this.gotoAndStop(0);
    });

    gameConfig.closet.onFrameChange = function() {
        if (this.currentFrame == 12) {
            this.gotoAndStop(12);
        }
    }
    cleanUpArray.push(gameConfig.closet);

    var table = createSprite("images/room/roomTable.png", 99, 239, gameLoader);
    gameContainer.addChild(table);
    cleanUpArray.push(table);

    gameConfig.lamp = createMCGC("roomLamp instance 100", 2, 190, 205);
    gameConfig.lamp.gotoAndStop(0);
    makeButton(gameConfig.lamp, roomTurnOn);
    gameContainer.addChild(gameConfig.lamp);
    cleanUpArray.push(gameConfig.lamp);

    if (user.wizardDone) {
        var diploma = createSprite("images/room/roomDiploma.png", 200, 80, gameLoader);
        gameContainer.addChild(diploma);
        cleanUpArray.push(diploma);
    }

    gameConfig.itemsContainer = new PIXI.Container();
    gameContainer.addChild(gameConfig.itemsContainer);
    //cleanUpArray.push(gameConfig.itemsContainer);

    for (var j = 0; j < user.inventory.length; j++) {
        itemName = user.inventory[j];
        itemX = user.inventoryPositions[j][0];
        itemY = user.inventoryPositions[j][1];
        if (itemY > 245 && itemY < 575) {
            if (itemX > 480 && itemX < 550) {
                itemX = 480;
            } else if (itemX >= 550 && itemX < 600) {
                itemX = 600;
            }
        }

        for (var i = 0; i < roomItems.length; i++) {
            if (itemName == roomItems[i][0]) {
                addRoomItem(roomItems[i], itemX, itemY);
                break
            }
        }
    }

    avatar.scale.set(1);
    avatar.x = 475;
    avatar.y = 245;
    gameContainer.addChild(avatar);

    //backbtn
    if (universeBtn) {
        gameContainer.addChild(universeBtn);
    } else {
        universeBtn = createMC("UniverseButton00", 2, 780, 10);
        universeBtn.gotoAndStop(0);
        gameContainer.addChild(universeBtn);
        makeButton(universeBtn, backToUniverse);
    }

    mayorSpeak("speak_b_room_welcome");

    gamePopup = new PIXI.Container();
    gamePopup.x = 250;
    gamePopup.y = 100;
    gameContainer.addChild(gamePopup);
    cleanUpRemoveArray.push(gamePopup);

    var popupBG = createSprite("images/room/InfoBox.png", 0, 0, gameLoader)
    gamePopup.addChild(popupBG);
    cleanUpArray.push(popupBG);

    var nextBtn = createNextBtn();
    nextBtn.x = 360;
    nextBtn.y = 290;
    nextBtn.on('pointerdown', skipRoomIntro);
    gamePopup.addChild(nextBtn);
    cleanUpRemoveArray.push(nextBtn);

    user.visitedRoom = true;
    updateUserCookie();
}

function addRoomItem(itemArray, itemX, itemY) {
    itemBtn = new PIXI.Container();
    itemBtn.addChild(createMC(itemArray[2], itemArray[4], itemArray[6], itemArray[7]));
    itemBtn.x = itemX;
    itemBtn.y = itemY;
    itemBtn.hitArea = new PIXI.Rectangle(0, 0, 80, 80);
    itemBtn.pivot.x = 40;
    itemBtn.pivot.y = 40;
    itemBtn.type = "item";
    itemBtn.name = itemArray[0];
    itemBtn.textureName = itemArray[2];
    itemBtn.frame = itemArray[3];
    itemBtn.textureFrames = itemArray[4];
    if (itemArray[5] == "") {
        itemBtn.sound = "";
    } else {
        itemBtn.sound = itemArray[5];
        itemBtn.isSound = true;
        itemBtn.soundPlayed = false;
    }

    if (itemArray[3] == -1) {
        //setup animation
        itemBtn.children[0].gotoAndStop(0);
        itemBtn.isAnim = true;
        itemBtn.animPlayed = false;
    } else {
        itemBtn.children[0].gotoAndStop(itemArray[3]);
        itemBtn.isAnim = false;
    }

    itemBtn.interactiveChildren = false;
    gameConfig.itemsContainer.addChild(itemBtn);
    //makeButton(itemBtn, initRoomItemDrag);
    itemBtn.interactive = true;
    itemBtn.buttonMode = true;
    itemBtn.on('pointerdown', initRoomItemDrag)

}

function initRoomItemDrag(event) {
    if (this.isAnim && !this.animPlayed) {
        this.animPlayed = true;
        this.children[0].gotoAndPlay(1);
        this.children[0].onFrameChange = function() {
            if (this.currentFrame == 0) {
                this.gotoAndStop(0);
            }
        }

        if (this.sound != "") {
            playSound(this.sound);
        }
    } else {
        if (this.isSound) {
            if (this.sound != "") {
                playSound(this.sound);
            }
        }

        //start drag

        // store a reference to the data
        // the reason for this is because of multitouch
        // we want to track the movement of this particular touch
        this.data = event.data;
        this.dragging = true;

        this.parent.setChildIndex(this, this.parent.children.length - 1);

        this
            .on('pointerup', onRoomItemDragEnd)
            .on('pointerupoutside', onRoomItemDragEnd)
            .on('pointermove', onRoomItemDragMove);

    }

}

function onRoomItemDragEnd() {
    this.dragging = false;
    // set the interaction data to null
    this.data = null;

    this
        .off('pointerup', onRoomItemDragEnd)
        .off('pointerupoutside', onRoomItemDragEnd)
        .off('pointermove', onRoomItemDragMove);

    this.animPlayed = false;

    if (this.y > 245 && this.y < 575) {
        if (this.x > 480 && this.x < 550) {
            this.x = 480;
        } else if (this.x >= 550 && this.x < 600) {
            this.x = 600;
        }
    }

    updateUserInventoryPositions(this.name, this.x, this.y);
}

function onRoomItemDragMove() {
    if (this.dragging) {
        var newPosition = this.data.getLocalPosition(this.parent);
        this.x = newPosition.x;
        this.y = newPosition.y;
    }
}



function skipRoomIntro() {
    stopMayorSpeak();
    gamePopup.parent.removeChild(gamePopup);
}

function roomTurnOn() {
    if (this.currentFrame == 0) {
        this.gotoAndStop(1);
        if (this.name == "radio") {
            gameConfig.radioSound = playSound("item_radio");
        }
    } else {
        this.gotoAndStop(0);
        if (this.name == "radio" && gameConfig.radioSound) {
            gameConfig.radioSound.stop();
        }
    }
}

function showCloset() {
    sendStatPoint("start-closet");

    gameConfig.closetBG = createSprite("images/room/closetBG.png", 18, -30, gameLoader);
    gameContainer.addChild(gameConfig.closetBG);
    cleanUpArray.push(gameConfig.closetBG);

    gameConfig.closetBG.interactive = true;

    gameConfig.closetContainer = new PIXI.Container();
    gameContainer.addChild(gameConfig.closetContainer);

    //shopBoyShoes
    if (user.gender == "boy") {
        var shoeCount = 0;
        gameConfig.closetShoeArray = new Array();
        for (var i = 0; i < user.inventory.length; i++) {
            if (user.inventory[i].indexOf("origshoes") != -1) {
                if (user.inventory[i].split("_")[1] == "1") {
                    var closetItem = createSprite("images/avatar/Dreng_sko1000" + user.shoesColor + ".png", 200, 435);
                    closetItem.type = "boyshoe";
                    closetItem.frame = 1;
                    makeButton(closetItem, selectClosetItem);
                    gameConfig.closetContainer.addChild(closetItem);
                } else if (user.inventory[i].split("_")[1] == "2") {
                    closetItem = createSprite("images/avatar/Dreng_sko2000" + user.shoesColor + ".png", 200, 43);
                    closetItem.type = "boyshoe";
                    closetItem.frame = 2;
                    makeButton(closetItem, selectClosetItem);
                    gameConfig.closetContainer.addChild(closetItem);
                } else {
                    closetItem = createSprite("images/avatar/Dreng_sko3000" + user.shoesColor + ".png", 200, 435);
                    closetItem.type = "boyshoe";
                    closetItem.frame = 3;
                    makeButton(closetItem, selectClosetItem);
                    gameConfig.closetContainer.addChild(closetItem);
                }
                gameConfig.closetShoeArray.push(closetItem);
                //cleanUpArray.push(closetItem);
                break;
            }
        }

        shoeCount = 1;

        for (var i = 0; i < user.inventory.length; i++) {
            for (var j = 0; j < shopBoyShoes.length; j++) {
                if (user.inventory[i] == shopBoyShoes[j][0]) {
                    var closetItem = createMC(shopBoyShoes[j][2], shopBoyShoes[j][4], 200 + (shoeCount * 150), 395);
                    closetItem.gotoAndStop(shopBoyShoes[j][3]);
                    closetItem.frame = parseInt(shopBoyShoes[j][3]) + 4;
                    closetItem.type = "boyshoe";
                    makeButton(closetItem, selectClosetItem);

                    gameConfig.closetContainer.addChild(closetItem);
                    //cleanUpArray.push(closetItem);
                    gameConfig.closetShoeArray.push(closetItem);

                    shoeCount++;
                    break
                }
            }
        }

        //shopBoyHats
        var hangerCount = 0;
        gameConfig.closetClothesArray = new Array();

        closetItem = createSprite("images/room/hanger.png", 235, 122, gameLoader)
        closetItem.type = "boyhat";
        closetItem.frame = -1;
        makeButton(closetItem, selectClosetItem);
        gameConfig.closetContainer.addChild(closetItem);
        //cleanUpArray.push(closetItem);
        gameConfig.closetClothesArray.push(closetItem);

        hangerCount++;

        for (var i = 0; i < user.inventory.length; i++) {
            for (var j = 0; j < shopBoyHats.length; j++) {
                if (user.inventory[i] == shopBoyHats[j][0]) {
                    var closetItem = createMC(shopBoyHats[j][2], shopBoyHats[j][4], 200 + (hangerCount * 150), 120);
                    closetItem.gotoAndStop(shopBoyHats[j][3]);
                    closetItem.frame = parseInt(shopBoyHats[j][3]) + 1;
                    closetItem.type = "boyhat";
                    makeButton(closetItem, selectClosetItem);

                    gameConfig.closetContainer.addChild(closetItem);
                    //cleanUpArray.push(closetItem);
                    gameConfig.closetClothesArray.push(closetItem);

                    hangerCount++;
                    break
                }
            }
        }

        for (var i = 0; i < user.inventory.length; i++) {
            if (user.inventory[i].indexOf("origlegs") != -1) {
                if (user.inventory[i].split("_")[1] == "1") {
                    var closetItem = new PIXI.Container();
                    closetItem.x = 220 + (hangerCount * 150);
                    closetItem.y = 150;
                    closetItem.addChild(createSprite("images/room/hanger.png", 35, -28, gameLoader));
                    closetItem.addChild(createSprite("images/avatar/Dreng_bukser1000" + user.legsColor + ".png", 0, 0));
                    closetItem.type = "boylegs";
                    closetItem.frame = 1;
                    makeButton(closetItem, selectClosetItem);
                    gameConfig.closetContainer.addChild(closetItem);
                    //cleanUpArray.push(closetItem);
                } else if (user.inventory[i].split("_")[1] == "2") {
                    var closetItem = new PIXI.Container();
                    closetItem.x = 220 + (hangerCount * 150);
                    closetItem.y = 150;
                    closetItem.addChild(createSprite("images/room/hanger.png", 35, -28, gameLoader));
                    closetItem.addChild(createSprite("images/avatar/Dreng_bukser2000" + user.legsColor + ".png", 0, 0));
                    closetItem.type = "boylegs";
                    closetItem.frame = 2;
                    makeButton(closetItem, selectClosetItem);
                    gameConfig.closetContainer.addChild(closetItem);
                    //cleanUpArray.push(closetItem);
                } else {
                    var closetItem = new PIXI.Container();
                    closetItem.x = 220 + (hangerCount * 150);
                    closetItem.y = 150;
                    closetItem.addChild(createSprite("images/room/hanger.png", 35, -28, gameLoader));
                    closetItem.addChild(createSprite("images/avatar/Dreng_bukser3000" + user.legsColor + ".png", 0, 0));
                    closetItem.type = "boylegs";
                    closetItem.frame = 3;
                    makeButton(closetItem, selectClosetItem);
                    gameConfig.closetContainer.addChild(closetItem);
                    //cleanUpArray.push(closetItem);
                }
                gameConfig.closetClothesArray.push(closetItem);
                break;
            }
        }

        hangerCount++;

        for (var i = 0; i < user.inventory.length; i++) {
            for (var j = 0; j < shopBoyLegs.length; j++) {
                if (user.inventory[i] == shopBoyLegs[j][0]) {
                    var closetItem = createMC(shopBoyLegs[j][2], shopBoyLegs[j][4], 200 + (hangerCount * 150), 125);
                    closetItem.gotoAndStop(shopBoyLegs[j][3]);
                    closetItem.frame = parseInt(shopBoyLegs[j][3]) + 1;
                    closetItem.type = "boylegs";
                    makeButton(closetItem, selectClosetItem);

                    gameConfig.closetContainer.addChild(closetItem);
                    //cleanUpArray.push(closetItem);
                    gameConfig.closetClothesArray.push(closetItem);

                    hangerCount++;
                    break
                }
            }
        }

        for (var i = 0; i < user.inventory.length; i++) {
            if (user.inventory[i].indexOf("origbody") != -1) {
                if (user.inventory[i].split("_")[1] == "1") {
                    var closetItem = new PIXI.Container();
                    closetItem.x = 200 + (hangerCount * 150);
                    closetItem.y = 140;
                    closetItem.addChild(createSprite("images/room/hanger.png", 35, -18, gameLoader));
                    closetItem.addChild(createSprite("images/avatar/Dreng_bluse1000" + user.bodyColor + ".png", 0, 0));
                    closetItem.type = "boybody";
                    closetItem.frame = 1;
                    makeButton(closetItem, selectClosetItem);
                    gameConfig.closetContainer.addChild(closetItem);
                    //cleanUpArray.push(closetItem);
                } else if (user.inventory[i].split("_")[1] == "2") {
                    var closetItem = new PIXI.Container();
                    closetItem.x = 200 + (hangerCount * 150);
                    closetItem.y = 140;
                    closetItem.addChild(createSprite("images/room/hanger.png", 35, -18, gameLoader));
                    closetItem.addChild(createSprite("images/avatar/Dreng_bluse2000" + user.bodyColor + ".png", 0, 0));
                    closetItem.type = "boybody";
                    closetItem.frame = 2;
                    makeButton(closetItem, selectClosetItem);
                    gameConfig.closetContainer.addChild(createSprite("images/room/hanger.png", 235 + (hangerCount * 150), 122, gameLoader));
                    gameConfig.closetContainer.addChild(closetItem);
                    //cleanUpArray.push(closetItem);
                } else {
                    var closetItem = new PIXI.Container();
                    closetItem.x = 200 + (hangerCount * 150);
                    closetItem.y = 140;
                    closetItem.addChild(createSprite("images/room/hanger.png", 35, -18, gameLoader));
                    closetItem.addChild(createSprite("images/avatar/Dreng_bluse3000" + user.bodyColor + ".png", 0, 0));
                    closetItem.type = "boybody";
                    closetItem.frame = 3;
                    makeButton(closetItem, selectClosetItem);
                    gameConfig.closetContainer.addChild(createSprite("images/room/hanger.png", 235 + (hangerCount * 150), 122, gameLoader));
                    gameConfig.closetContainer.addChild(closetItem);
                    //cleanUpArray.push(closetItem);
                }
                gameConfig.closetClothesArray.push(closetItem);
                break;
            }
        }

        hangerCount++;

        for (var i = 0; i < user.inventory.length; i++) {
            for (var j = 0; j < shopBoyBody.length; j++) {
                if (user.inventory[i] == shopBoyBody[j][0]) {
                    var closetItem = createMC(shopBoyBody[j][2], shopBoyBody[j][4], 200 + (hangerCount * 150), 76);
                    closetItem.gotoAndStop(shopBoyBody[j][3]);
                    closetItem.frame = parseInt(shopBoyBody[j][3]) + 1;
                    closetItem.type = "boybody";
                    makeButton(closetItem, selectClosetItem);

                    gameConfig.closetContainer.addChild(closetItem);
                    //cleanUpArray.push(closetItem);
                    gameConfig.closetClothesArray.push(closetItem);

                    hangerCount++;
                    break
                }
            }
        }
    } else { //girl_______________________________________________________
        var shoeCount = 0;
        gameConfig.closetShoeArray = new Array();
        for (var i = 0; i < user.inventory.length; i++) {
            if (user.inventory[i].indexOf("origshoes") != -1) {
                if (user.inventory[i].split("_")[1] == "1") {
                    var closetItem = createSprite("images/avatar/Pige_sko1000" + user.shoesColor + ".png", 200, 435);
                    closetItem.type = "girlshoe";
                    closetItem.frame = 1;
                    makeButton(closetItem, selectClosetItem);
                    gameConfig.closetContainer.addChild(closetItem);
                    //cleanUpArray.push(closetItem);
                } else if (user.inventory[i].split("_")[1] == "2") {
                    closetItem = createSprite("images/avatar/Pige_sko2000" + user.shoesColor + ".png", 200, 435);
                    closetItem.type = "girlshoe";
                    closetItem.frame = 2;
                    makeButton(closetItem, selectClosetItem);
                    gameConfig.closetContainer.addChild(closetItem);
                    //cleanUpArray.push(closetItem);
                } else {
                    closetItem = createSprite("images/avatar/Pige_sko3000" + user.shoesColor + ".png", 200, 435);
                    closetItem.type = "girlshoe";
                    closetItem.frame = 3;
                    makeButton(closetItem, selectClosetItem);
                    gameConfig.closetContainer.addChild(closetItem);
                    //cleanUpArray.push(closetItem);
                }
                gameConfig.closetShoeArray.push(closetItem);
                break;
            }
        }

        shoeCount = 1;

        for (var i = 0; i < user.inventory.length; i++) {
            for (var j = 0; j < shopGirlShoes.length; j++) {
                if (user.inventory[i] == shopGirlShoes[j][0]) {
                    var closetItem = createMC(shopGirlShoes[j][2], shopGirlShoes[j][4], 200 + (shoeCount * 150), 395);
                    closetItem.gotoAndStop(shopGirlShoes[j][3]);
                    closetItem.frame = parseInt(shopGirlShoes[j][3]) + 4;
                    closetItem.type = "girlshoe";
                    makeButton(closetItem, selectClosetItem);

                    gameConfig.closetContainer.addChild(closetItem);
                    //cleanUpArray.push(closetItem);
                    gameConfig.closetShoeArray.push(closetItem);

                    shoeCount++;
                    break
                }
            }
        }

        //shopGirlHats
        var hangerCount = 0;
        gameConfig.closetClothesArray = new Array();

        closetItem = createSprite("images/room/hanger.png", 235, 122, gameLoader)
        closetItem.type = "girlhat";
        closetItem.frame = -1;
        makeButton(closetItem, selectClosetItem);
        gameConfig.closetContainer.addChild(closetItem);
        //cleanUpArray.push(closetItem);
        gameConfig.closetClothesArray.push(closetItem);

        hangerCount++;

        for (var i = 0; i < user.inventory.length; i++) {
            for (var j = 0; j < shopGirlHats.length; j++) {
                if (user.inventory[i] == shopGirlHats[j][0]) {
                    var closetItem = createMC(shopGirlHats[j][2], shopGirlHats[j][4], 200 + (hangerCount * 150), 120);
                    closetItem.gotoAndStop(shopGirlHats[j][3]);
                    closetItem.frame = parseInt(shopGirlHats[j][3]) + 1;
                    closetItem.type = "girlhat";
                    makeButton(closetItem, selectClosetItem);

                    gameConfig.closetContainer.addChild(closetItem);
                    //cleanUpArray.push(closetItem);
                    gameConfig.closetClothesArray.push(closetItem);

                    hangerCount++;
                    break
                }
            }
        }

        for (var i = 0; i < user.inventory.length; i++) {
            if (user.inventory[i].indexOf("origlegs") != -1) {
                if (user.inventory[i].split("_")[1] == "1") {
                    var closetItem = new PIXI.Container();
                    closetItem.x = 220 + (hangerCount * 150);
                    closetItem.y = 150;
                    closetItem.addChild(createSprite("images/room/hanger.png", 35, -28, gameLoader));
                    closetItem.addChild(createSprite("images/avatar/Pige_bukser1000" + user.legsColor + ".png", 0, 0));
                    closetItem.type = "girllegs";
                    closetItem.frame = 1;
                    makeButton(closetItem, selectClosetItem);
                    gameConfig.closetContainer.addChild(closetItem);
                    //cleanUpArray.push(closetItem);
                } else if (user.inventory[i].split("_")[1] == "2") {
                    var closetItem = new PIXI.Container();
                    closetItem.x = 220 + (hangerCount * 150);
                    closetItem.y = 150;
                    closetItem.addChild(createSprite("images/room/hanger.png", 35, -28, gameLoader));
                    closetItem.addChild(createSprite("images/avatar/Pige_bukser2000" + user.legsColor + ".png", 0, 0));
                    closetItem.type = "girllegs";
                    closetItem.frame = 2;
                    makeButton(closetItem, selectClosetItem);
                    gameConfig.closetContainer.addChild(closetItem);
                    //cleanUpArray.push(closetItem);
                } else {
                    var closetItem = new PIXI.Container();
                    closetItem.x = 220 + (hangerCount * 150);
                    closetItem.y = 150;
                    closetItem.addChild(createSprite("images/room/hanger.png", 35, -28, gameLoader));
                    closetItem.addChild(createSprite("images/avatar/Pige_bukser3000" + user.legsColor + ".png", 0, 0));
                    closetItem.type = "girllegs";
                    closetItem.frame = 3;
                    makeButton(closetItem, selectClosetItem);
                    gameConfig.closetContainer.addChild(closetItem);
                    //cleanUpArray.push(closetItem);
                }
                gameConfig.closetClothesArray.push(closetItem);
                break;
            }
        }

        hangerCount++;

        for (var i = 0; i < user.inventory.length; i++) {
            for (var j = 0; j < shopGirlLegs.length; j++) {
                if (user.inventory[i] == shopGirlLegs[j][0]) {
                    var closetItem = createMC(shopGirlLegs[j][2], shopGirlLegs[j][4], 200 + (hangerCount * 150), 125);
                    closetItem.gotoAndStop(shopGirlLegs[j][3]);
                    closetItem.frame = parseInt(shopGirlLegs[j][3]) + 1;
                    closetItem.type = "girllegs";
                    makeButton(closetItem, selectClosetItem);

                    gameConfig.closetContainer.addChild(closetItem);
                    //cleanUpArray.push(closetItem);
                    gameConfig.closetClothesArray.push(closetItem);

                    hangerCount++;
                    break
                }
            }
        }

        for (var i = 0; i < user.inventory.length; i++) {
            if (user.inventory[i].indexOf("origbody") != -1) {
                if (user.inventory[i].split("_")[1] == "1") {
                    var closetItem = new PIXI.Container();
                    closetItem.x = 200 + (hangerCount * 150);
                    closetItem.y = 140;
                    closetItem.addChild(createSprite("images/room/hanger.png", 35, -18, gameLoader));
                    closetItem.addChild(createSprite("images/avatar/Pige_bluse1000" + user.bodyColor + ".png", 0, 0));
                    closetItem.type = "girlbody";
                    closetItem.frame = 1;
                    makeButton(closetItem, selectClosetItem);
                    gameConfig.closetContainer.addChild(closetItem);
                    //cleanUpArray.push(closetItem);
                } else if (user.inventory[i].split("_")[1] == "2") {
                    var closetItem = new PIXI.Container();
                    closetItem.x = 200 + (hangerCount * 150);
                    closetItem.y = 140;
                    closetItem.addChild(createSprite("images/room/hanger.png", 35, -18, gameLoader));
                    closetItem.addChild(createSprite("images/avatar/Pige_bluse2000" + user.bodyColor + ".png", 0, 0));
                    closetItem.type = "girlbody";
                    closetItem.frame = 2;
                    makeButton(closetItem, selectClosetItem);
                    gameConfig.closetContainer.addChild(createSprite("images/room/hanger.png", 235 + (hangerCount * 150), 122, gameLoader));
                    gameConfig.closetContainer.addChild(closetItem);
                    //cleanUpArray.push(closetItem);
                } else {
                    var closetItem = new PIXI.Container();
                    closetItem.x = 200 + (hangerCount * 150);
                    closetItem.y = 140;
                    closetItem.addChild(createSprite("images/room/hanger.png", 35, -18, gameLoader));
                    closetItem.addChild(createSprite("images/avatar/Pige_bluse3000" + user.bodyColor + ".png", 0, 0));
                    closetItem.type = "girlbody";
                    closetItem.frame = 3;
                    makeButton(closetItem, selectClosetItem);
                    gameConfig.closetContainer.addChild(createSprite("images/room/hanger.png", 235 + (hangerCount * 150), 122, gameLoader));
                    gameConfig.closetContainer.addChild(closetItem);
                    //cleanUpArray.push(closetItem);
                }
                gameConfig.closetClothesArray.push(closetItem);
                break;
            }
        }

        hangerCount++;

        for (var i = 0; i < user.inventory.length; i++) {
            for (var j = 0; j < shopGirlBody.length; j++) {
                if (user.inventory[i] == shopGirlBody[j][0]) {
                    var closetItem = createMC(shopGirlBody[j][2], shopGirlBody[j][4], 200 + (hangerCount * 150), 76);
                    closetItem.gotoAndStop(shopGirlBody[j][3]);
                    closetItem.frame = parseInt(shopGirlBody[j][3]) + 1;
                    closetItem.type = "boybody";
                    makeButton(closetItem, selectClosetItem);

                    gameConfig.closetContainer.addChild(closetItem);
                    //cleanUpArray.push(closetItem);
                    gameConfig.closetClothesArray.push(closetItem);

                    hangerCount++;
                    break
                }
            }
        }
    }

    if (gameConfig.closetClothesArray.length > 5) {
        gameConfig.closetClothesNextArrow = createSprite("images/room/closetArrow.png", 950, 150, gameLoader);
        gameConfig.closetClothesNextArrow.scale.x = -1;
        gameConfig.closetContainer.addChild(gameConfig.closetClothesNextArrow);
        cleanUpArray.push(gameConfig.closetClothesNextArrow);
        makeButton(gameConfig.closetClothesNextArrow, nextClosetClothes);

        gameConfig.closetClothesPrevArrow = createSprite("images/room/closetArrow.png", 100, 150, gameLoader);
        gameConfig.closetContainer.addChild(gameConfig.closetClothesPrevArrow);
        cleanUpArray.push(gameConfig.closetClothesPrevArrow);
        makeButton(gameConfig.closetClothesPrevArrow, prevClosetClothes);
        gameConfig.clothesNavIndex = 0;
        gameConfig.closetClothesPrevArrow.visible = false;
    }

    if (gameConfig.closetShoeArray.length > 5) {
        gameConfig.closetShoesNextArrow = createSprite("images/room/closetArrow.png", 950, 450, gameLoader);
        gameConfig.closetShoesNextArrow.scale.x = -1;
        gameConfig.closetContainer.addChild(gameConfig.closetShoesNextArrow);
        cleanUpArray.push(gameConfig.closetShoesNextArrow);
        makeButton(gameConfig.closetShoesNextArrow, nextClosetShoes);

        gameConfig.closetShoesPrevArrow = createSprite("images/room/closetArrow.png", 100, 450, gameLoader);
        gameConfig.closetContainer.addChild(gameConfig.closetShoesPrevArrow);
        cleanUpArray.push(gameConfig.closetShoesPrevArrow);
        makeButton(gameConfig.closetShoesPrevArrow, prevClosetShoes);
        gameConfig.shoeNavIndex = 0;
        gameConfig.closetShoesPrevArrow.visible = false;
    }

    gameContainer.setChildIndex(avatar, gameContainer.children.length - 1);

    gameContainer.backBtn = createNextBtn();
    gameContainer.backBtn.x = 800;
    gameContainer.backBtn.y = 50;
    gameContainer.backBtn.on('pointerdown', backToRoom);
    gameContainer.addChild(gameContainer.backBtn);


}

function nextClosetShoes() {
    for (var i = 0; i < gameConfig.closetShoeArray.length; i++) {
        TweenMax.to(gameConfig.closetShoeArray[i], 0.35, {
            pixi: {
                x: gameConfig.closetShoeArray[i].x - 150
            },
            ease: Power2.easeInOut,
            onComplete: checkClosetItemVisible,
            onCompleteParams: [gameConfig.closetShoeArray[i]]
        });

    }

    gameConfig.shoeNavIndex++;
    if (gameConfig.shoeNavIndex <= 0) {
        gameConfig.closetShoesPrevArrow.visible = false;
    } else {
        gameConfig.closetShoesPrevArrow.visible = true;
    }
}

function prevClosetShoes() {
    for (var i = 0; i < gameConfig.closetShoeArray.length; i++) {
        TweenMax.to(gameConfig.closetShoeArray[i], 0.35, {
            pixi: {
                x: gameConfig.closetShoeArray[i].x + 150
            },
            ease: Power2.easeInOut,
            onComplete: checkClosetItemVisible,
            onCompleteParams: [gameConfig.closetShoeArray[i]]
        });
    }

    gameConfig.shoeNavIndex--;
    if (gameConfig.shoeNavIndex <= 0) {
        gameConfig.closetShoesPrevArrow.visible = false;
    } else {
        gameConfig.closetShoesPrevArrow.visible = true;
    }
}

function nextClosetClothes() {
    for (var i = 0; i < gameConfig.closetClothesArray.length; i++) {
        TweenMax.to(gameConfig.closetClothesArray[i], 0.35, {
            pixi: {
                x: gameConfig.closetClothesArray[i].x - 150
            },
            ease: Power2.easeInOut,
            onComplete: checkClosetItemVisible,
            onCompleteParams: [gameConfig.closetClothesArray[i]]
        });
    }

    gameConfig.clothesNavIndex++;
    if (gameConfig.clothesNavIndex <= 0) {
        gameConfig.closetClothesPrevArrow.visible = false;
    } else {
        gameConfig.closetClothesPrevArrow.visible = true;
    }
}

function prevClosetClothes() {
    for (var i = 0; i < gameConfig.closetClothesArray.length; i++) {
        TweenMax.to(gameConfig.closetClothesArray[i], 0.35, {
            pixi: {
                x: gameConfig.closetClothesArray[i].x + 150
            },
            ease: Power2.easeInOut,
            onComplete: checkClosetItemVisible,
            onCompleteParams: [gameConfig.closetClothesArray[i]]
        });

    }

    gameConfig.clothesNavIndex--;
    if (gameConfig.clothesNavIndex <= 0) {
        gameConfig.closetClothesPrevArrow.visible = false;
    } else {
        gameConfig.closetClothesPrevArrow.visible = true;
    }
}

function checkClosetItemVisible(item) {
    if (item.x < 100 || item.x > 900) {
        item.visible = false;
    } else {
        item.visible = true;
    }

}

function selectClosetItem() {
    if (this.type == "boyshoe") {
        user.shoes = this.frame;

    } else if (this.type == "boylegs") {
        user.legs = this.frame;

    } else if (this.type == "boyhat") {
        user.hat = this.frame;

    } else if (this.type == "boybody") {
        user.body = this.frame;

    } else if (this.type == "girlshoe") {
        user.shoes = this.frame;

    } else if (this.type == "girllegs") {
        user.legs = this.frame;

    } else if (this.type == "girlhat") {
        user.hat = this.frame;

    } else if (this.type == "girlbody") {
        user.body = this.frame;

    }
    drawAvatar();
}


function backToRoom() {
    gameContainer.removeChild(gameConfig.closetBG);
    gameConfig.closetContainer.removeChildren();
    gameContainer.removeChild(gameConfig.closetContainer);
    gameContainer.removeChild(gameContainer.backBtn);


}





//KARENS SHOP--------------------------------------------------------------------------------
function showKarens() {
    sendStatPoint("start-karens");

    if (this.sound) {
        this.sound.stop();
    }
    stopMayorSpeak();
    clearInterval(universeAmbientSoundsInterval);
    universeAmbientSoundsInterval = null;

    gameSoundArray = new Array();

    gameContainer.removeChildren();
    if (gameLoader) {
        gameLoader.reset();
    }


    if (localTest) {
        loadKarensResources({
            "speak_b_karens_welcome": {
                "contenttype": "sound",
                "content": "dk_velkomst_og_forklaring_karens_butik.mp3",
                "subtitle": "Nu er du p\u00e5 vej ind i Karens butik. Her kan du k\u00f8be en masse t\u00f8j og ting til dit v\u00e6relse for dine penge. Klik p\u00e5 de ting, du gerne vil k\u00f8be! Hvis du ikke har penge nok til dem, kan du altid komme dem i din \u00f8nskekrukke, s\u00e5 du kan spare op til dem. Tryk p\u00e5 den gr\u00f8nne knap for at komme ind i butikken."
            },
            "speak_karens_bought1": {
                "contenttype": "sound",
                "content": "dk_vare_koebt_1.mp3",
                "subtitle": "Nu har du k\u00f8bt den!"
            },
            "speak_karens_bought2": {
                "contenttype": "sound",
                "content": "dk_vare_koebt_2.mp3",
                "subtitle": "S\u00e5dan, nu er den din!"
            },
            "speak_karens_buy1": {
                "contenttype": "sound",
                "content": "dk_koeb_vare.mp3",
                "subtitle": "Den er fin! Hvor mange penge har du tilbage, hvis du k\u00f8ber den?"
            },
            "speak_karens_buy2": {
                "contenttype": "sound",
                "content": "dk_koeb_vare_2.mp3",
                "subtitle": "Den ser flot ud. Har du penge til den?"
            },
            "speak_karens_buy3": {
                "contenttype": "sound",
                "content": "dk_koeb_vare_3.mp3",
                "subtitle": "Hvis du k\u00f8ber den, hvor mange penge har du s\u00e5?"
            },
            "speak_karens_done": {
                "contenttype": "sound",
                "content": "dk_afslutning_karen.mp3",
                "subtitle": "Farvel, og tak for denne gang! Kom snart igen."
            },
            "speak_karens_intro": {
                "contenttype": "sound",
                "content": "dk_intro.mp3",
                "subtitle": "Er der nogle ting, du godt kunne t\u00e6nke dig i min butik?"
            },
            "speak_karens_wishlist": {
                "contenttype": "sound",
                "content": "dk_ikke_raad_til_vare.mp3",
                "subtitle": "Den har du desv\u00e6rre ikke penge nok til at k\u00f8be! Men du kan komme den i \u00f8nskekrukken, hvis du gerne vil spare op til den. Hvor mange penge mangler du?"
            },
            "karens_door_opens_with_bell": {
                "contenttype": "sound",
                "content": "karens_door_opens_with_bell.mp3",
                "subtitle": ""
            },
            "karens_ok": {
                "contenttype": "sound",
                "content": "karens_ok_lyd_3.mp3",
                "subtitle": ""
            },
            "karens_pay": {
                "contenttype": "sound",
                "content": "karens_betale_penge_.mp3",
                "subtitle": ""
            },
            "item_car": {
                "contenttype": "sound",
                "content": "Bil.mp3",
                "subtitle": ""
            },
            "item_cd": {
                "contenttype": "sound",
                "content": "CD.mp3",
                "subtitle": ""
            },
            "item_elephant": {
                "contenttype": "sound",
                "content": "Elefant.mp3",
                "subtitle": ""
            },
            "item_guitar": {
                "contenttype": "sound",
                "content": "Guitar.mp3",
                "subtitle": ""
            },
            "item_house": {
                "contenttype": "sound",
                "content": "Dukkehus.mp3",
                "subtitle": ""
            },
            "item_keyboard": {
                "contenttype": "sound",
                "content": "Keyboard_1.mp3",
                "subtitle": ""
            },
            "item_magicwand": {
                "contenttype": "sound",
                "content": "Tryllestav_0.mp3",
                "subtitle": ""
            },
            "item_mobile": {
                "contenttype": "sound",
                "content": "Mobiltelefon_2.mp3",
                "subtitle": ""
            },
            "item_plain": {
                "contenttype": "sound",
                "content": "Flyvemaskine.mp3",
                "subtitle": ""
            },
            "item_radio": {
                "contenttype": "sound",
                "content": "radio.mp3",
                "subtitle": ""
            },
            "item_rocket": {
                "contenttype": "sound",
                "content": "Raket.mp3",
                "subtitle": ""
            }
        });
    } else {
        $.ajax({
            type: 'GET',
            url: 'gameadmin/getcontent/karens.json',
            contentType: 'application/json; charset=utf-8',
            dataType: 'json',
        }).done(loadKarensResources);
    }
}


function loadKarensResources(data) {
    gameLoader = new PIXI.Loader();
    $.each(data, function(key, val) {
        gameLoader.add(key, "files/" + val.content);

        subtitleArray[key] = val.subtitle;

        gameSoundArray.push(key);
    })

    showPreloader();
    gameLoader.on('progress', preloadProgress);

    gameLoader.add("images/karens/goldstack.json")
        .add("images/karens/silverstack.json")
        .add("images/karens/karen-character.json")
        .add("images/karens/karenButton.json")
        .add("images/karens/kasse_btn.json")
        .add("images/karens/Oenske_btn.json")
        .add("images/karens/karensBG.png")
        .add("images/karens/karensFG.png")
        .add("images/karens/Pris_stor.png")
        .add("images/karens/BuyItemConfirm.png")
    gameLoader.load(initKarens);

}

//se settings/ItemDataList.as

var shopItems = new Array();
shopItems.push(["plane", 18, "item100", 0, 27, "item_plain", -60, -80]);
shopItems.push(["ketcher", 15, "item100", 1, 27, "", -10, -85]);
shopItems.push(["mobile", 25, "item100", 2, 27, "item_mobile", 5, -100]);
shopItems.push(["paints", 12, "item100", 3, 27, "", 0, -90]);
shopItems.push(["mp3player", 42, "item100", 4, 27, "item_radio", 0, -100]);
shopItems.push(["bog", 9, "item100", 5, 27, "", -5, -85]);
shopItems.push(["spil", 8, "item100", 6, 27, "", -30, -90]);
shopItems.push(["cd", 8, "item100", 7, 27, "item_cd", 0, -85]);
shopItems.push(["lavalampe", 17, "lavalamp0", -1, 235, "", 20, -15]);
shopItems.push(["sword", 13, "item100", 9, 27, "", -20, -100]);
shopItems.push(["wand", 11, "wand00", -1, 79, "item_magicwand", -50, -45]);
shopItems.push(["rocket", 31, "rocket0", -1, 104, "item_rocket", -260, -350]);
shopItems.push(["car", 15, "item100", 12, 27, "item_car", -20, -85]);
shopItems.push(["keyboard", 17, "item100", 13, 27, "item_keyboard", -40, -75]);
shopItems.push(["dollhouse", 33, "dollhouse00", -1, 69, "item_house", -70, -25]);
shopItems.push(["guitar", 19, "item100", 15, 27, "item_guitar", 10, -75]);
shopItems.push(["teddy", 7, "item100", 16, 27, "", 0, -70]);
shopItems.push(["elephant", 8, "item100", 17, 27, "item_elephant", 0, -80]);
shopItems.push(["dog", 5, "item100", 18, 27, "", 0, -80]);
shopItems.push(["doll", 19, "item100", 19, 27, "", 0, -80]);
shopItems.push(["pillow", 9, "item100", 20, 27, "", -25, -65]);
shopItems.push(["ball", 5, "item100", 21, 27, "", 0, -90]);
shopItems.push(["fishtank", 23, "item100", 22, 27, "", -5, -80]);
shopItems.push(["superman", 20, "item100", 23, 27, "", 0, -80]);
shopItems.push(["modeldoll", 8, "item100", 24, 27, "", -5, -75]);
shopItems.push(["dragon", 18, "dragon0", -1, 123, "", -35, 0]);
shopItems.push(["heartlights", 29, "heartlights0", -1, 100, "", -60, -20]);

//shoes
var shopBoyShoes = new Array(["boyShoes0", 9, "BoyDressItemShoes00", 0, 11]);
shopBoyShoes.push(["boyShoes1", 17, "BoyDressItemShoes00", 1, 11])
shopBoyShoes.push(["boyShoes2", 19, "BoyDressItemShoes00", 2, 11])
shopBoyShoes.push(["boyShoes3", 23, "BoyDressItemShoes00", 3, 11])
shopBoyShoes.push(["boyShoes4", 11, "BoyDressItemShoes00", 4, 11])
shopBoyShoes.push(["boyShoes5", 22, "BoyDressItemShoes00", 5, 11])
shopBoyShoes.push(["boyShoes6", 12, "BoyDressItemShoes00", 6, 11])
shopBoyShoes.push(["boyShoes7", 13, "BoyDressItemShoes00", 7, 11])
shopBoyShoes.push(["boyShoes8", 17, "BoyDressItemShoes00", 8, 11])
shopBoyShoes.push(["boyShoes9", 19, "BoyDressItemShoes00", 9, 11])
shopBoyShoes.push(["boyShoes10", 24, "BoyDressItemShoes00", 10, 11])

var shopGirlShoes = new Array(["girlShoes0", 9, "GirlDressItemShoes00", 0, 10]);
shopGirlShoes.push(["girlShoes1", 17, "GirlDressItemShoes00", 1, 10])
shopGirlShoes.push(["girlShoes2", 19, "GirlDressItemShoes00", 2, 10])
shopGirlShoes.push(["girlShoes3", 23, "GirlDressItemShoes00", 3, 10])
shopGirlShoes.push(["girlShoes4", 11, "GirlDressItemShoes00", 4, 10])
shopGirlShoes.push(["girlShoes5", 22, "GirlDressItemShoes00", 5, 10])
shopGirlShoes.push(["girlShoes6", 12, "GirlDressItemShoes00", 6, 10])
shopGirlShoes.push(["girlShoes7", 13, "GirlDressItemShoes00", 7, 10])
shopGirlShoes.push(["girlShoes8", 17, "GirlDressItemShoes00", 8, 10])
shopGirlShoes.push(["girlShoes9", 19, "GirlDressItemShoes00", 9, 10])

//legs
var shopBoyLegs = new Array(["boyLegs0", 18, "BoyDressItemLegs00", 3, 12]);
shopBoyLegs.push(["boyLegs1", 15, "BoyDressItemLegs00", 4, 12]);
shopBoyLegs.push(["boyLegs2", 18, "BoyDressItemLegs00", 5, 12]);
shopBoyLegs.push(["boyLegs3", 22, "BoyDressItemLegs00", 6, 12]);
shopBoyLegs.push(["boyLegs4", 31, "BoyDressItemLegs00", 7, 12]);
shopBoyLegs.push(["boyLegs5", 24, "BoyDressItemLegs00", 8, 12]);
shopBoyLegs.push(["boyLegs6", 31, "BoyDressItemLegs00", 9, 12]);
shopBoyLegs.push(["boyLegs7", 17, "BoyDressItemLegs00", 10, 12]);
shopBoyLegs.push(["boyLegs8", 22, "BoyDressItemLegs00", 11, 12]);

var shopGirlLegs = new Array(["girlLegs0", 18, "legs00", 3, 10]);
shopGirlLegs.push(["girlLegs1", 15, "legs00", 4, 10]);
shopGirlLegs.push(["girlLegs2", 18, "legs00", 5, 10]);
shopGirlLegs.push(["girlLegs3", 22, "legs00", 6, 10]);
shopGirlLegs.push(["girlLegs4", 31, "legs00", 7, 10]);
shopGirlLegs.push(["girlLegs5", 24, "legs00", 8, 10]);
shopGirlLegs.push(["girlLegs6", 31, "legs00", 9, 10]);


//Body
var shopBoyBody = new Array(["boyBody0", 15, "BoyDressItemBody00", 3, 19]);
shopBoyBody.push(["boyBody1", 11, "BoyDressItemBody00", 4, 19]);
shopBoyBody.push(["boyBody2", 13, "BoyDressItemBody00", 5, 19]);
shopBoyBody.push(["boyBody3", 18, "BoyDressItemBody00", 6, 19]);
shopBoyBody.push(["boyBody4", 10, "BoyDressItemBody00", 7, 19]);
shopBoyBody.push(["boyBody5", 24, "BoyDressItemBody00", 8, 19]);
shopBoyBody.push(["boyBody6", 42, "BoyDressItemBody00", 9, 19]);
shopBoyBody.push(["boyBody7", 24, "BoyDressItemBody00", 10, 19]);
shopBoyBody.push(["boyBody8", 40, "BoyDressItemBody00", 11, 19]);
shopBoyBody.push(["boyBody9", 50, "BoyDressItemBody00", 12, 19]);
shopBoyBody.push(["boyBody10", 32, "BoyDressItemBody00", 13, 19]);
shopBoyBody.push(["boyBody11", 48, "BoyDressItemBody00", 14, 19]);
shopBoyBody.push(["boyBody12", 29, "BoyDressItemBody00", 15, 19]);
shopBoyBody.push(["boyBody13", 39, "BoyDressItemBody00", 16, 19]);
shopBoyBody.push(["boyBody14", 20, "BoyDressItemBody00", 17, 19]);
shopBoyBody.push(["boyBody15", 41, "BoyDressItemBody00", 18, 19]);

var shopGirlBody = new Array(["girlBody0", 15, "body00", 3, 20]);
shopGirlBody.push(["girlBody1", 11, "body00", 4, 20]);
shopGirlBody.push(["girlBody2", 13, "body00", 5, 20]);
shopGirlBody.push(["girlBody3", 18, "body00", 6, 20]);
shopGirlBody.push(["girlBody4", 10, "body00", 7, 20]);
shopGirlBody.push(["girlBody5", 24, "body00", 8, 20]);
shopGirlBody.push(["girlBody6", 42, "body00", 9, 20]);
shopGirlBody.push(["girlBody7", 24, "body00", 10, 20]);
shopGirlBody.push(["girlBody8", 40, "body00", 11, 20]);
shopGirlBody.push(["girlBody9", 50, "body00", 12, 20]);
shopGirlBody.push(["girlBody10", 32, "body00", 13, 20]);
shopGirlBody.push(["girlBody11", 48, "body00", 14, 20]);
shopGirlBody.push(["girlBody12", 29, "body00", 15, 20]);
shopGirlBody.push(["girlBody13", 39, "body00", 16, 20]);
shopGirlBody.push(["girlBody14", 20, "body00", 17, 20]);
shopGirlBody.push(["girlBody15", 41, "body00", 18, 20]);
shopGirlBody.push(["girlBody15", 41, "body00", 19, 20]);

//Hats
var shopBoyHats = new Array(["boyHat0", 15, "BoyDressItemsHats00", 1, 4]);
shopBoyHats.push(["boyHat1", 16, "BoyDressItemsHats00", 2, 4]);
shopBoyHats.push(["boyHat2", 17, "BoyDressItemsHats00", 3, 4]);

var shopGirlHats = new Array(["girlHat0", 15, "hats00", 1, 4]);
shopGirlHats.push(["girlHat1", 16, "hats00", 2, 4]);
shopGirlHats.push(["girlHat2", 17, "hats00", 3, 4]);

var shopItemPositions = new Array([680, 70], [800, 70], [680, 185], [780, 185], [880, 185], [680, 300], [780, 300], [880, 300], [680, 415], [780, 415], [880, 415], [580, 510], [730, 510], [880, 510], [400, 550]);

function initKarens(loader, resources) {
    gameConfig = {};
    gameConfig.placedItems = new Array();

    var karenBG = createSprite("images/karens/karensBG.png", -50, -35, gameLoader);
    gameContainer.addChild(karenBG);
    cleanUpArray.push(karenBG);

    gameConfig.karen = createMCGC("karen-chr00", 75, 90, 255);
    gameConfig.karen.gotoAndStop(0);
    gameContainer.addChild(gameConfig.karen);
    cleanUpArray.push(gameConfig.karen);

    var karenFG = createSprite("images/karens/karensFG.png", -60, 455, gameLoader);
    gameContainer.addChild(karenFG);
    cleanUpArray.push(karenFG);

    //show items
    //remove owned items
    var itemName;
    for (var j = 0; j < user.inventory.length; j++) {
        itemName = user.inventory[j];
        for (var i = 0; i < shopItems.length; i++) {
            if (itemName == shopItems[i][0]) {
                shopItems.splice(i, 1);
                break;
            }
        }
    }

    if (user.gender == "boy") {
        for (var j = 0; j < user.inventory.length; j++) {
            itemName = user.inventory[j];
            for (var i = 0; i < shopBoyShoes.length; i++) {
                if (itemName == shopBoyShoes[i][0]) {
                    shopBoyShoes.splice(i, 1);
                    break;
                }
            }
        }

        for (var j = 0; j < user.inventory.length; j++) {
            itemName = user.inventory[j];
            for (var i = 0; i < shopBoyLegs.length; i++) {
                if (itemName == shopBoyLegs[i][0]) {
                    shopBoyLegs.splice(i, 1);
                    break;
                }
            }
        }

        for (var j = 0; j < user.inventory.length; j++) {
            itemName = user.inventory[j];
            for (var i = 0; i < shopBoyBody.length; i++) {
                if (itemName == shopBoyBody[i][0]) {
                    shopBoyBody.splice(i, 1);
                    break;
                }
            }
        }

        for (var j = 0; j < user.inventory.length; j++) {
            itemName = user.inventory[j];
            for (var i = 0; i < shopBoyHats.length; i++) {
                if (itemName == shopBoyHats[i][0]) {
                    shopBoyHats.splice(i, 1);
                    break;
                }
            }
        }

    } else {
        for (var j = 0; j < user.inventory.length; j++) {
            itemName = user.inventory[j];
            for (var i = 0; i < shopGirlShoes.length; i++) {
                if (itemName == shopGirlShoes[i][0]) {
                    shopGirlShoes.splice(i, 1);
                    break;
                }
            }
        }

        for (var j = 0; j < user.inventory.length; j++) {
            itemName = user.inventory[j];
            for (var i = 0; i < shopGirlLegs.length; i++) {
                if (itemName == shopGirlLegs[i][0]) {
                    shopGirlLegs.splice(i, 1);
                    break;
                }
            }
        }

        for (var j = 0; j < user.inventory.length; j++) {
            itemName = user.inventory[j];
            for (var i = 0; i < shopGirlBody.length; i++) {
                if (itemName == shopGirlBody[i][0]) {
                    shopGirlBody.splice(i, 1);
                    break;
                }
            }
        }

        for (var j = 0; j < user.inventory.length; j++) {
            itemName = user.inventory[j];
            for (var i = 0; i < shopGirlHats.length; i++) {
                if (itemName == shopGirlHats[i][0]) {
                    shopGirlHats.splice(i, 1);
                    break;
                }
            }
        }

    }

    //get random subset
    var randomArray = shuffleArray(shopItems);

    //draw in shop
    var itemBtn;
    for (var i = 0; i < 15; i++) {
        itemBtn = new PIXI.Container();
        //itemBtn = createMC(randomArray[i][2], randomArray[i][4], shopItemPositions[i][0], shopItemPositions[i][1]);
        itemBtn.addChild(createMC(randomArray[i][2], randomArray[i][4], randomArray[i][6], randomArray[i][7]));
        itemBtn.x = shopItemPositions[i][0] - 100;
        itemBtn.y = shopItemPositions[i][1] - 30;
        itemBtn.hitArea = new PIXI.Rectangle(0, 0, 80, 80);
        itemBtn.type = "item";
        itemBtn.name = randomArray[i][0];
        itemBtn.price = randomArray[i][1];
        itemBtn.textureName = randomArray[i][2];
        itemBtn.frame = randomArray[i][3];
        itemBtn.textureFrames = randomArray[i][4];
        if (randomArray[i][5] == "") {
            itemBtn.sound = "";
        } else {
            itemBtn.sound = randomArray[i][5];
            itemBtn.isSound = true;
            itemBtn.soundPlayed = false;
        }

        if (randomArray[i][3] == -1) {
            //setup animation
            itemBtn.children[0].gotoAndStop(0);
            itemBtn.isAnim = true;
            itemBtn.animPlayed = false;
        } else {
            itemBtn.children[0].gotoAndStop(randomArray[i][3]);
            itemBtn.isAnim = false;
        }

        itemBtn.interactiveChildren = false;
        gameContainer.addChild(itemBtn);
        makeButton(itemBtn, initBuy);
        gameConfig.placedItems.push(itemBtn);

        //cleanUpArray.push(itemBtn);
    }


    //show shoes
    if (user.gender == "boy") {
        randomArray = shuffleArray(shopBoyShoes);
    } else {
        randomArray = shuffleArray(shopGirlShoes);
    }

    for (var i = 0; i < 2; i++) {
        var shoeBtn = new PIXI.Container();
        //var shoeBtn = createMC(randomArray[i][2], randomArray[i][4], 220+(i*150), 315);
        shoeBtn.addChild(createMC(randomArray[i][2], randomArray[i][4], 220 + (i * 150), 315));
        shoeBtn.children[0].gotoAndStop(randomArray[i][3]);
        shoeBtn.name = randomArray[i][0];
        shoeBtn.price = randomArray[i][1];
        shoeBtn.type = "boyshoe";
        shoeBtn.textureName = randomArray[i][2];
        shoeBtn.frame = randomArray[i][3];
        shoeBtn.textureFrames = randomArray[i][4];
        gameContainer.addChild(shoeBtn);
        makeButton(shoeBtn, initBuy);
        //cleanUpArray.push(shoeBtn);

        shoeBtn.interactiveChildren = false;
        shoeBtn.hitArea = new PIXI.Rectangle(230 + (i * 150), 325, 140, 80);

        gameConfig.placedItems.push(shoeBtn);
    }

    //show legs
    if (user.gender == "boy") {
        randomArray = shuffleArray(shopBoyLegs);
    } else {
        randomArray = shuffleArray(shopGirlLegs);
    }

    for (var i = 0; i < 2; i++) {
        var itemBtn = new PIXI.Container();
        itemBtn.addChild(createMC(randomArray[i][2], randomArray[i][4], 0, 0));
        itemBtn.x = 420 - (i * 80);
        itemBtn.y = 18;
        itemBtn.interactiveChildren = false;
        itemBtn.children[0].gotoAndStop(randomArray[i][3]);
        itemBtn.hitArea = new PIXI.Rectangle(23, 0, 80, 170);
        //var itemBtn = createMC(randomArray[i][2], randomArray[i][4], 420-(i*80), 18);
        itemBtn.name = randomArray[i][0];
        itemBtn.price = randomArray[i][1];
        itemBtn.type = "boylegs";
        itemBtn.textureName = randomArray[i][2];
        itemBtn.frame = randomArray[i][3];
        itemBtn.textureFrames = randomArray[i][4];

        gameContainer.addChild(itemBtn);
        //cleanUpArray.push(itemBtn);
        makeButton(itemBtn, initBuy);

        gameConfig.placedItems.push(itemBtn);
    }


    //show body
    if (user.gender == "boy") {
        randomArray = shuffleArray(shopBoyBody);
    } else {
        randomArray = shuffleArray(shopGirlBody);
    }

    for (var i = 0; i < 2; i++) {
        var itemBtn = new PIXI.Container();
        itemBtn.addChild(createMC(randomArray[i][2], randomArray[i][4], 0, 0));
        itemBtn.x = 220 - (i * 80);
        itemBtn.y = -31;
        itemBtn.interactiveChildren = false;
        itemBtn.children[0].gotoAndStop(randomArray[i][3]);
        itemBtn.hitArea = new PIXI.Rectangle(62, 49, 80, 170);
        //var itemBtn = createMC(randomArray[i][2], randomArray[i][4], 220-(i*80), -31);
        itemBtn.name = randomArray[i][0];
        itemBtn.price = randomArray[i][1];
        itemBtn.type = "boybody";
        itemBtn.textureName = randomArray[i][2];
        itemBtn.frame = randomArray[i][3];
        itemBtn.textureFrames = randomArray[i][4];

        gameContainer.addChild(itemBtn);
        //cleanUpArray.push(itemBtn);
        makeButton(itemBtn, initBuy);

        gameConfig.placedItems.push(itemBtn);
    }


    //show body
    if (user.gender == "boy") {
        randomArray = shuffleArray(shopBoyHats);
    } else {
        randomArray = shuffleArray(shopGirlHats);
    }

    var itemBtn = new PIXI.Container();
    itemBtn.addChild(createMC(randomArray[0][2], randomArray[0][4], 0, 0));
    itemBtn.x = 55;
    itemBtn.y = 13;
    itemBtn.interactiveChildren = false;
    itemBtn.children[0].gotoAndStop(randomArray[0][3]);
    itemBtn.hitArea = new PIXI.Rectangle(35, 5, 110, 170);
    //var itemBtn = createMC(randomArray[0][2], randomArray[0][4], 55, 13);
    itemBtn.name = randomArray[0][0];
    itemBtn.price = randomArray[0][1];
    itemBtn.type = "boyhat";
    itemBtn.textureName = randomArray[0][2];
    itemBtn.frame = randomArray[0][3];
    itemBtn.textureFrames = randomArray[0][4];

    gameContainer.addChild(itemBtn);
    //cleanUpArray.push(itemBtn);
    makeButton(itemBtn, initBuy);

    gameConfig.placedItems.push(itemBtn);



    //backbtn
    if (universeBtn) {
        gameContainer.addChild(universeBtn);
    } else {
        universeBtn = createMC("UniverseButton00", 2, 780, 10);
        universeBtn.gotoAndStop(0);
        gameContainer.addChild(universeBtn);
        makeButton(universeBtn, backToUniverse);
    }


    //show intro
    toggleShopItems(false);

    gamePopup = new PIXI.Container();
    gamePopup.x = 260;
    gamePopup.y = 130;
    gameContainer.addChild(gamePopup);
    cleanUpRemoveArray.push(gamePopup);

    // var videoTexture = PIXI.Texture.fromVideo('images/karens/karens-infobox.mp4');
    var videoTexture = PIXI.Texture.from('images/karens/karens-infobox.mp4');
    cleanUpArray.push(videoTexture);
    // var videoElement = videoTexture.baseTexture.source;
    var videoElement = videoTexture.baseTexture.resource.source;

    var videoSprite = new PIXI.Sprite(videoTexture);
    videoSprite.width = 506;
    videoSprite.height = 386;
    gamePopup.addChild(videoSprite);
    cleanUpRemoveArray.push(videoSprite);

    videoElement.loop = true;
    videoElement.autoPlay = true;
    videoElement.muted = true;

    var nextBtn = createNextBtn();
    nextBtn.x = 364;
    nextBtn.y = 303;
    nextBtn.on('pointerdown', openShop);
    gamePopup.addChild(nextBtn);
    cleanUpRemoveArray.push(nextBtn);

    gameConfig.playingSound = playSound("speak_b_karens_welcome", gameLoader);

    user.visitedKaren = true;
    updateUserCookie();
}

function openShop() {
    gameConfig.playingSound.stop();

    karenSpeak(["speak_karens_intro"]);

    gamePopup.parent.removeChild(gamePopup);
    setTimeout(toggleShopItems, 200);
}

function toggleShopItems(turnon) {
    if (turnon == undefined) {
        turnon = true;
    }

    for (var i = 0; i < gameConfig.placedItems.length; i++) {
        if (gameConfig.placedItems[i]) {
            gameConfig.placedItems[i].interactive = turnon;
        }
    }
}

function shuffleArray(arr) {
    var shuffled = arr.slice(0);
    var i = arr.length;
    var temp;
    var index;

    while (i--) {
        index = Math.floor((i + 1) * Math.random());
        temp = shuffled[index];
        shuffled[index] = shuffled[i];
        shuffled[i] = temp;
    }
    return shuffled;
}

function initBuy() {
    if (this.isAnim && !this.animPlayed) {
        this.animPlayed = true;
        this.children[0].gotoAndPlay(1);
        this.children[0].onFrameChange = function() {
            if (this.currentFrame == 0) {
                this.gotoAndStop(0);
            }
        }

        if (this.sound != "") {
            playSound(this.sound);
        }
    } else if (!this.isAnim && (this.isSound && !this.soundPlayed)) {
        if (this.sound != "") {
            this.soundPlayed = true;
            playSound(this.sound);
        }
    } else {
        stopKarenSpeak();
        toggleShopItems(false);
        playSound("karens_ok");

        if (this.isAnim && this.animPlayed) {
            this.animPlayed = false;
        }
        if (this.isSound && this.soundPlayed) {
            this.soundPlayed = false;
        }

        gameConfig.selectedItem = this;

        gamePopup = new PIXI.Container();
        gamePopup.x = 250;
        gamePopup.y = 100;
        gameContainer.addChild(gamePopup);

        var bg = createSprite("images/karens/BuyItemConfirm.png", 0, 0, gameLoader);
        gamePopup.addChild(bg);
        cleanUpArray.push(bg);

        var popupBtn = createMCGC("KarenButton00", 2, 360, 10);
        popupBtn.gotoAndStop(0);
        makeButton(popupBtn, backToKarens);
        gamePopup.addChild(popupBtn);
        cleanUpArray.push(popupBtn);

        //setup object
        var item = createMC(this.textureName, this.textureFrames, 280, 170);
        item.anchor.set(0.5);
        if (this.frame == -1) {
            item.gotoAndStop(0);
        } else {
            item.gotoAndStop(this.frame);
        }
        gamePopup.addChild(item);
        cleanUpRemoveArray.push(item);

        //setup price
        var gold = Math.floor(parseInt(this.price) / 10);
        var silver = parseInt(this.price) % 10;

        var priceTF = new PIXI.Text(gold, labelStyle);
        priceTF.x = 210;
        priceTF.y = 317;
        gamePopup.addChild(priceTF);
        cleanUpArray.push(priceTF);

        priceTF = new PIXI.Text(silver, labelStyle);
        priceTF.x = 277;
        priceTF.y = 315;
        gamePopup.addChild(priceTF);
        cleanUpArray.push(priceTF);

        var coinstack = createMCGC("GoldStack00", 11, 237, 302);
        coinstack.scale.set(0.5);
        coinstack.gotoAndStop(gold);
        gamePopup.addChild(coinstack);
        cleanUpArray.push(coinstack);

        coinstack = createMCGC("SilverStack00", 11, 306, 302);
        coinstack.scale.set(0.5);
        coinstack.gotoAndStop(silver);
        gamePopup.addChild(coinstack);
        cleanUpArray.push(coinstack);

        if (this.price > user.wallet) {
            //show add to wishlist
            karenSpeak(["speak_karens_wishlist"]);

            popupBtn = createMCGC("Oenske_btn00", 2, 0, 0);
            popupBtn.gotoAndStop(0);
            popupBtn.x = 348;
            popupBtn.y = 150;
            makeButton(popupBtn, doWish);
            gamePopup.addChild(popupBtn);
            cleanUpArray.push(popupBtn);
        } else {
            //show buy btn
            karenSpeak(["speak_karens_buy1", "speak_karens_buy2", "speak_karens_buy3"]);

            popupBtn = createMCGC("Kasse_btn00", 2, 0, 0);
            popupBtn.gotoAndStop(0);
            popupBtn.x = 348;
            popupBtn.y = 277;
            makeButton(popupBtn, doBuy);
            gamePopup.addChild(popupBtn);
            cleanUpArray.push(popupBtn);

        }
    }
}

function backToKarens() {
    stopKarenSpeak();
    gamePopup.parent.removeChild(gamePopup);
    //gamePopup.children[1].onFrameChange=null;

    setTimeout(toggleShopItems, 200);
}

function doBuy() {
    updateWallet(-1 * gameConfig.selectedItem.price);
    updateUserInventory(gameConfig.selectedItem.name);
    if (gameConfig.selectedItem.type == "boyshoe") {
        user.shoes = gameConfig.selectedItem.frame + 4;
        drawAvatar();
    } else if (gameConfig.selectedItem.type == "boylegs") {
        user.legs = gameConfig.selectedItem.frame + 1;
        drawAvatar();
    } else if (gameConfig.selectedItem.type == "boyhat") {
        user.hat = gameConfig.selectedItem.frame + 1;
        drawAvatar();
    } else if (gameConfig.selectedItem.type == "boybody") {
        user.body = gameConfig.selectedItem.frame + 1;
        drawAvatar();
    }

    gameContainer.removeChild(gameConfig.selectedItem);


    var videoTexture = PIXI.Texture.from('images/karens/karensBuyAnim.mp4');
    cleanUpArray.push(videoTexture);
    var videoElement = videoTexture.baseTexture.resource.source;

    var videoSprite = new PIXI.Sprite(videoTexture);
    videoSprite.width = 550;
    videoSprite.height = 420;
    gamePopup.addChild(videoSprite);

    videoElement.loop = false;
    videoElement.autoPlay = true;
    videoElement.muted = true;

    cleanUpRemoveArray.push(videoSprite);

    stopKarenSpeak();
    playSound("karens_pay");
    karenSpeak(["speak_karens_bought1", "speak_karens_bought2"]);

    this.interactive = false;

    setTimeout(backToKarens, 2800);
}

function doWish() {
    if (user.wishlist.length >= 3) {
        //play no room in wishlist
    } else {
        user.wishlist.push([gameConfig.selectedItem.name, gameConfig.selectedItem.price]);

        backToKarens();
    }

    updateUserCookie();
}




function updateWallet(amount) {
    user.wallet += amount;

    var gold = Math.floor(parseInt(user.wallet) / 10);
    var silver = parseInt(user.wallet) % 10;

    frontGround.goldTF.text = gold;
    frontGround.silverTF.text = silver;

    if (gold >= 10) {
        frontGround.goldTF.x = 20;
        if ((isMobile || isIPad) && gameContainer.x > 75) {
            frontGround.goldTF.x = -42;
        }
        frontGround.goldStack.gotoAndStop(10);
    } else {
        frontGround.goldTF.x = 28;
        if ((isMobile || isIPad) && gameContainer.x > 75) {
            frontGround.goldTF.x = -30;
        }
        frontGround.goldStack.gotoAndStop(gold);
    }
    frontGround.silverStack.gotoAndStop(silver);

    updateUserCookie();

    if (amount > 0) {
        playSound("pengeby_bank_addCash", PIXI.Loader.shared);
    }
}

function updateUserInventory(itemName) {
    //check for duplicates
    user.inventory.push(itemName)
    user.inventoryPositions.push([200 + Math.floor(Math.random() * 600), 200 + Math.floor(Math.random() * 300)]);

    updateUserCookie();
}

function updateUserInventoryPositions(itemName, itemPosX, itemPosY) {
    for (var i = 0; i < user.inventory.length; i++) {
        if (itemName == user.inventory[i]) {
            user.inventoryPositions[i] = [itemPosX, itemPosY];
            break
        }
    }

    updateUserCookie();
}





function karenSpeak(soundID) {
    soundID = soundID[Math.floor(Math.random() * soundID.length)];
    gameConfig.currentKarenSound = soundID;


    playKaren();
}

function stopKarenSpeak() {
    if (gameConfig.karenIsSpeaking) {
        gameConfig.karenSound.stop();
        gameConfig.currentKarenSound = null;
        gameConfig.karen.gotoAndStop(0);

        gameConfig.karenIsSpeaking = false;
    }
}

function playKaren() {
    gameConfig.karenSound = playSound(gameConfig.currentKarenSound);
    gameConfig.karenIsSpeaking = true;

    gameConfig.karenSound.on('end', function() {
        gameConfig.karen.gotoAndStop(0);

        gameConfig.karenIsSpeaking = false;
    });

    gameConfig.karen.gotoAndPlay(1);
}





//TIME MACHINE GAME------------------------------------------------------------------------------------
function showTimeMachine() {
    sendStatPoint("start-timemachine");
    if (this.sound) {
        this.sound.stop();
    }

    stopMayorSpeak();
    clearInterval(universeAmbientSoundsInterval);
    universeAmbientSoundsInterval = null;

    gameSoundArray = new Array();

    gameContainer.removeChildren();
    if (gameLoader) {
        gameLoader.reset();
    }

    if (localTest) {
        loadTMReseources({
            "speak_b_timemachine_welcome": {
                "contenttype": "sound",
                "content": "dk_velkomst_og_forklaring_tidsmaskine.mp3",
                "subtitle": "Velkommen til Tidsmaskinen. Her kan du rejse tilbage i tiden og pr\u00f8ve en masse sjove og sp\u00e6ndende ting - men kun, hvis du har penge nok. Det koster nemlig en guldm\u00f8nt, hver gang du rejser. Klik p\u00e5 den gr\u00f8nne knap for at v\u00e6lge, hvor du gerne vil rejse hen."
            },
            "speak_timemachine_nocash": {
                "contenttype": "sound",
                "content": "dk_ikke_raad.mp3",
                "subtitle": "Det har du desv\u00e6rre ikke r\u00e5d til, s\u00e5 du m\u00e5 ud og tjene nogle penge!"
            },
            "speak_timemachine_travel": {
                "contenttype": "sound",
                "content": "dk_god_tur.mp3",
                "subtitle": ""
            },
            "speak_timemachine_rome": {
                "contenttype": "sound",
                "content": "dk_forklaring_paa_rom.mp3",
                "subtitle": "Det her er rejsen til det gamle Rom. Her kan du hj\u00e6lpe med at bygge flotte og store bygninger."
            },
            "speak_timemachine_dino": {
                "contenttype": "sound",
                "content": "dk_forklaring_paa_dinosaur.mp3",
                "subtitle": "Her kan du rejse tilbage til dengang, hvor der fandtes dinosaurusser og hj\u00e6lpe med at finde dinosaurus \u00e6g."
            },
            "speak_timemachine_ridder": {
                "contenttype": "sound",
                "content": "dk_forklaringp_paa_riddertiden.mp3",
                "subtitle": "Her kan du rejse tilbage til Riddertiden og pr\u00f8ve at k\u00e6mpe som en ridder."
            },
            "speak_timemachine_egypt": {
                "contenttype": "sound",
                "content": "dk_forklaring_paa_aegypten.mp3",
                "subtitle": "Det her er rejsen til det gamle Egypten. Her er de i gang med at bygge verdens st\u00f8rste pyramide, og du kan hj\u00e6lpe med at indrette den."
            },
            "timemachine_ambient_sound1": {
                "contenttype": "sound",
                "content": "timemachine_tidsmaskine_blib_blob_lyd_1.mp3",
                "subtitle": ""
            },
            "timemachine_ambient_sound2": {
                "contenttype": "sound",
                "content": "timemachine_tidsmaskine_blib_blob_lyd_8.mp3",
                "subtitle": ""
            }
        });
    } else {
        $.ajax({
            type: 'GET',
            url: 'gameadmin/getcontent/time.json',
            contentType: 'application/json; charset=utf-8',
            dataType: 'json',
        }).done(loadTMReseources);
    }
}


function loadTMReseources(data) {
    gameLoader = new PIXI.Loader();
    $.each(data, function(key, val) {
        gameLoader.add(key, "files/" + val.content);

        subtitleArray[key] = val.subtitle;

        gameSoundArray.push(key);
    })

    showPreloader();
    gameLoader.on('progress', preloadProgress);

    gameLoader.add("images/timemachine/tmBG.png")
        .add("images/timemachine/buyBtn.json")
        .add("images/timemachine/cancelBtn.json")
        .add("images/timemachine/character.json")
        .add("images/timemachine/tmScreens.json")
        .add("images/timemachine/blink1.json")
        .add("images/timemachine/Solstraaler.png")
        .add("images/timemachine/screenDinoHover.png")
        .add("images/timemachine/screenDino.png")
        .add("images/timemachine/screenEgyptHover.png")
        .add("images/timemachine/screenEgypt.png")
        .add("images/timemachine/screenRomeHover.png")
        .add("images/timemachine/screenRome.png")
        .add("images/timemachine/screenRidderHover.png")
        .add("images/timemachine/screenRidder.png")
        .add("images/timemachine/screenFG.png")
        .add("images/timemachine/screenbg.json")
        .load(initTM);
}

function initTM(loader, resources) {
    gameConfig = {};

    var tmBG = createSprite("images/timemachine/tmBG.png", 50, 0, gameLoader);
    gameContainer.addChild(tmBG);
    cleanUpArray.push(tmBG);

    //blinks
    var blinkArray = new Array([252, 24], [293, 56], [273, 125], [313, 156], [294, 226], [798, -8], [791, 22], [754, 56], [767, 123], [732, 155], [742, 223]);
    var blink;
    for (var i = 0; i < blinkArray.length; i++) {
        blink = createMCGC("blink00", 34, blinkArray[i][0], blinkArray[i][1]);
        blink.gotoAndPlay(Math.floor(blink.totalFrames * Math.random()));
        gameContainer.addChild(blink);
        cleanUpRemoveArray.push(blink);
    }

    //screens
    gameConfig.screens = createMCGC("Timemachine00", 5, 318, 32);
    gameConfig.screens.gotoAndStop(0);
    gameContainer.addChild(gameConfig.screens);
    cleanUpArray.push(gameConfig.screens);

    gameConfig.buyBtn = createMCGC("Ok_btn_lodret_TMV00", 2, 492, 150);
    makeButton(gameConfig.buyBtn, buyTimeMachineExp);
    gameConfig.buyBtn.scale.set(0.5);
    gameConfig.buyBtn.gotoAndStop(0);
    gameConfig.buyBtn.visible = false;
    gameConfig.buyBtn.on('pointerover', function() {
        this.gotoAndStop(1);
    });
    gameConfig.buyBtn.on('pointerout', function() {
        this.gotoAndStop(0);
    });
    gameContainer.addChild(gameConfig.buyBtn);
    cleanUpArray.push(gameConfig.buyBtn);

    gameConfig.cancelBtn = createMCGC("Nej_btn_TMV00", 2, 575, 60);
    makeButton(gameConfig.cancelBtn, cancelTimeMachineExp);
    gameConfig.cancelBtn.scale.set(0.5);
    gameConfig.cancelBtn.gotoAndStop(0);
    gameConfig.cancelBtn.visible = false;
    gameConfig.cancelBtn.on('pointerover', function() {
        this.gotoAndStop(1);
    });
    gameConfig.cancelBtn.on('pointerout', function() {
        this.gotoAndStop(0);
    });
    gameContainer.addChild(gameConfig.cancelBtn);
    cleanUpArray.push(gameConfig.cancelBtn);

    gameConfig.character = createMCGC("nerd00", 44, 110, 160);
    gameConfig.character.gotoAndStop(0);
    gameContainer.addChild(gameConfig.character);
    cleanUpArray.push(gameConfig.character);

    if (universeBtn) {
        gameContainer.addChild(universeBtn);
    } else {
        universeBtn = createMC("UniverseButton00", 2, 780, 10);
        universeBtn.gotoAndStop(0);
        gameContainer.addChild(universeBtn);
        makeButton(universeBtn, exitTM);
    }


    mayorSpeak("speak_b_timemachine_welcome", gameLoader);

    //show intro video
    gamePopup = new PIXI.Container();
    gamePopup.x = 250;
    gamePopup.y = 100;
    gameContainer.addChild(gamePopup);

    // create a video texture from a path
    // var videoTexture = PIXI.Texture.fromVideo('images/timemachine/tmIntro.mp4');
    var videoTexture = PIXI.Texture.from('images/timemachine/tmIntro.mp4');
    cleanUpArray.push(videoTexture);
    // var videoElement = videoTexture.baseTexture.source;
    var videoElement = videoTexture.baseTexture.resource.source;

    var videoSprite = new PIXI.Sprite(videoTexture);
    videoSprite.width = 506;
    videoSprite.height = 386;
    gamePopup.addChild(videoSprite);
    cleanUpRemoveArray.push(videoSprite);

    videoElement.loop = true;
    videoElement.autoPlay = true;
    videoElement.muted = true;

    var nextBtn = createNextBtn();
    nextBtn.x = 360;
    nextBtn.y = 315;
    nextBtn.on('pointerdown', skipTMIntro);
    gamePopup.addChild(nextBtn);
    cleanUpRemoveArray.push(nextBtn);


    tmAmbient();

    user.visitedTime = true;
    updateUserCookie();
}

function skipTMIntro() {
    stopMayorSpeak();
    gamePopup.parent.removeChild(gamePopup);

    var screenBtn = new PIXI.Container();
    screenBtn.x = 335;
    screenBtn.y = 265;
    screenBtn.hitArea = new PIXI.Rectangle(0, 0, 100, 100);
    screenBtn.name = "screen1";
    makeButton(screenBtn, clickScreen);
    gameContainer.addChild(screenBtn);
    cleanUpArray.push(screenBtn);

    screenBtn = new PIXI.Container();
    screenBtn.x = 470;
    screenBtn.y = 250;
    screenBtn.hitArea = new PIXI.Rectangle(0, 0, 100, 100);
    screenBtn.name = "screen2";
    makeButton(screenBtn, clickScreen);
    gameContainer.addChild(screenBtn);
    cleanUpArray.push(screenBtn);

    screenBtn = new PIXI.Container();
    screenBtn.x = 605;
    screenBtn.y = 260;
    screenBtn.hitArea = new PIXI.Rectangle(0, 0, 100, 100);
    screenBtn.name = "screen3";
    makeButton(screenBtn, clickScreen);
    gameContainer.addChild(screenBtn);
    cleanUpArray.push(screenBtn);

    screenBtn = new PIXI.Container();
    screenBtn.x = 745;
    screenBtn.y = 285;
    screenBtn.hitArea = new PIXI.Rectangle(0, 0, 100, 100);
    screenBtn.name = "screen4";
    makeButton(screenBtn, clickScreen);
    gameContainer.addChild(screenBtn);
    cleanUpArray.push(screenBtn);

    //dinoBtn
    gameConfig.dinoBtn = new PIXI.Container();
    gameConfig.dinoBtn.x = 313;
    gameConfig.dinoBtn.y = 238;
    gameConfig.dinoBtn.rotation = -0.05;
    gameConfig.dinoBtn.scale.set(1.25);
    gameContainer.addChild(gameConfig.dinoBtn);

    gameConfig.dinoBtnSun = createSprite("images/timemachine/Solstraaler.png", 58, 50, gameLoader);
    gameConfig.dinoBtnSun.anchor.set(0.5);
    gameConfig.dinoBtnSun.visible = false;
    gameConfig.dinoBtn.addChild(gameConfig.dinoBtnSun);
    cleanUpArray.push(gameConfig.dinoBtnSun);

    gameConfig.dinoBtnBG = createMCGC("Dino_skaerm_TMV0", 202, 0, 0);
    gameConfig.dinoBtn.addChild(gameConfig.dinoBtnBG);
    cleanUpRemoveArray.push(gameConfig.dinoBtnBG);

    gameConfig.dinoBtnNoHover = createSprite("images/timemachine/screenDino.png", 17, 20, gameLoader);
    gameConfig.dinoBtn.addChild(gameConfig.dinoBtnNoHover);
    cleanUpArray.push(gameConfig.dinoBtnNoHover);
    gameConfig.dinoBtnHover = createSprite("images/timemachine/screenDinoHover.png", 17, 30, gameLoader);
    gameConfig.dinoBtn.addChild(gameConfig.dinoBtnHover);
    cleanUpArray.push(gameConfig.dinoBtnHover);
    gameConfig.dinoBtnHover.visible = false;

    gameConfig.dinoBtnFG = createSprite("images/timemachine/screenFG.png", 28, 21, gameLoader);
    gameConfig.dinoBtn.addChild(gameConfig.dinoBtnFG);
    cleanUpArray.push(gameConfig.dinoBtnFG);

    cleanUpRemoveArray.push(gameConfig.dinoBtn);

    //egyptBtn
    gameConfig.egyptBtn = new PIXI.Container();
    gameConfig.egyptBtn.x = 450;
    gameConfig.egyptBtn.y = 231;
    gameConfig.egyptBtn.scale.set(1.25);
    gameContainer.addChild(gameConfig.egyptBtn);

    gameConfig.egyptBtnSun = createSprite("images/timemachine/Solstraaler.png", 58, 50, gameLoader);
    gameConfig.egyptBtnSun.anchor.set(0.5);
    gameConfig.egyptBtnSun.visible = false;
    gameConfig.egyptBtn.addChild(gameConfig.egyptBtnSun);
    cleanUpArray.push(gameConfig.egyptBtnSun);

    gameConfig.egyptBtnBG = createMCGC("Dino_skaerm_TMV0", 202, 0, 0);
    gameConfig.egyptBtn.addChild(gameConfig.egyptBtnBG);
    cleanUpRemoveArray.push(gameConfig.egyptBtnBG);

    gameConfig.egyptBtnNoHover = createSprite("images/timemachine/screenEgypt.png", 25, 23, gameLoader);
    gameConfig.egyptBtn.addChild(gameConfig.egyptBtnNoHover);
    cleanUpArray.push(gameConfig.egyptBtnNoHover);
    gameConfig.egyptBtnHover = createSprite("images/timemachine/screenEgyptHover.png", 25, 22, gameLoader);
    gameConfig.egyptBtn.addChild(gameConfig.egyptBtnHover);
    cleanUpArray.push(gameConfig.egyptBtnHover);
    gameConfig.egyptBtnHover.visible = false;

    gameConfig.egyptBtnFG = createSprite("images/timemachine/screenFG.png", 28, 21, gameLoader);
    gameConfig.egyptBtn.addChild(gameConfig.egyptBtnFG);

    cleanUpRemoveArray.push(gameConfig.egyptBtn);

    //romeBtn
    gameConfig.romeBtn = new PIXI.Container();
    gameConfig.romeBtn.x = 590;
    gameConfig.romeBtn.y = 234;
    gameConfig.romeBtn.rotation = 0.1;
    gameConfig.romeBtn.scale.set(1.25);
    gameContainer.addChild(gameConfig.romeBtn);

    gameConfig.romeBtnSun = createSprite("images/timemachine/Solstraaler.png", 58, 50, gameLoader);
    gameConfig.romeBtnSun.anchor.set(0.5);
    gameConfig.romeBtnSun.visible = false;
    gameConfig.romeBtn.addChild(gameConfig.romeBtnSun);
    cleanUpArray.push(gameConfig.romeBtnSun);

    gameConfig.romeBtnBG = createMCGC("Dino_skaerm_TMV0", 202, 0, 0);
    gameConfig.romeBtn.addChild(gameConfig.romeBtnBG);
    cleanUpRemoveArray.push(gameConfig.romeBtnBG);

    gameConfig.romeBtnNoHover = createSprite("images/timemachine/screenRome.png", 17, 23, gameLoader);
    gameConfig.romeBtn.addChild(gameConfig.romeBtnNoHover);
    cleanUpArray.push(gameConfig.romeBtnNoHover);
    gameConfig.romeBtnHover = createSprite("images/timemachine/screenRomeHover.png", 17, 23, gameLoader);
    gameConfig.romeBtn.addChild(gameConfig.romeBtnHover);
    gameConfig.romeBtnHover.visible = false;
    cleanUpArray.push(gameConfig.romeBtnHover);

    gameConfig.romeBtnFG = createSprite("images/timemachine/screenFG.png", 28, 21, gameLoader);
    gameConfig.romeBtn.addChild(gameConfig.romeBtnFG);
    cleanUpArray.push(gameConfig.romeBtnFG);

    cleanUpRemoveArray.push(gameConfig.romeBtn);


    //ridderBtn
    gameConfig.ridderBtn = new PIXI.Container();
    gameConfig.ridderBtn.x = 737;
    gameConfig.ridderBtn.y = 247;
    gameConfig.ridderBtn.rotation = 0.2;
    gameConfig.ridderBtn.scale.set(1.25);
    gameContainer.addChild(gameConfig.ridderBtn);

    gameConfig.ridderBtnSun = createSprite("images/timemachine/Solstraaler.png", 58, 50, gameLoader);
    gameConfig.ridderBtnSun.anchor.set(0.5);
    gameConfig.ridderBtnSun.visible = false;
    gameConfig.ridderBtn.addChild(gameConfig.ridderBtnSun);
    cleanUpArray.push(gameConfig.ridderBtnSun);

    gameConfig.ridderBtnBG = createMCGC("Dino_skaerm_TMV0", 202, 0, 0);
    gameConfig.ridderBtn.addChild(gameConfig.ridderBtnBG);
    cleanUpRemoveArray.push(gameConfig.ridderBtnBG);

    gameConfig.ridderBtnNoHover = createSprite("images/timemachine/screenRidder.png", 17, 25, gameLoader);
    gameConfig.ridderBtn.addChild(gameConfig.ridderBtnNoHover);
    cleanUpArray.push(gameConfig.ridderBtnNoHover);
    gameConfig.ridderBtnHover = createSprite("images/timemachine/screenRidderHover.png", 17, 25, gameLoader);
    gameConfig.ridderBtn.addChild(gameConfig.ridderBtnHover);
    cleanUpArray.push(gameConfig.ridderBtnHover);
    gameConfig.ridderBtnHover.visible = false;

    gameConfig.ridderBtnFG = createSprite("images/timemachine/screenFG.png", 28, 21, gameLoader);
    gameConfig.ridderBtn.addChild(gameConfig.ridderBtnFG);
    cleanUpArray.push(gameConfig.ridderBtnFG);

    cleanUpRemoveArray.push(gameConfig.ridderBtn);
}

function exitTM() {
    resetAllTMBtns();
    if (gameConfig.chrIsSpeaking) {
        stopChrSpeak();
    }

    backToUniverse();

}

function tmAmbient() {
    if (Math.random() < 0.5) {
        playSound("timemachine_ambient_sound1");
    } else {
        playSound("timemachine_ambient_sound2");
    }

    gameConfig.ambientTimer = setTimeout(tmAmbient, 2000 + Math.random() * 2000);
}

function characterSpeak(soundID, loader) {
    gameConfig.currentChrSound = [soundID, loader];

    playChr();
}

function stopChrSpeak() {
    if (gameConfig.chrIsSpeaking) {
        gameConfig.chrSound.stop();
        gameConfig.currentChrSound = null;
        gameConfig.character.gotoAndStop(0);

        gameConfig.chrIsSpeaking = false;
    }
}

function playChr() {
    if (gameConfig.currentChrSound) {
        if (gameConfig.currentChrSound[1] == undefined) {
            gameConfig.chrSound = playSound(gameConfig.currentChrSound[0]);
        } else {
            gameConfig.chrSound = playSound(gameConfig.currentChrSound[0], gameConfig.currentChrSound[1]);
        }
        gameConfig.chrSound.volume = 0.2;
    } else {
        //play universal sound - er der noget jeg kan hjælpe dig med
        //mayor.mayorSound = playSound(currentMayorSound[0]);
    }
    gameConfig.chrIsSpeaking = true;

    gameConfig.chrSound.on('end', function() {
        gameConfig.character.gotoAndStop(0);

        gameConfig.chrIsSpeaking = false;
    });

    gameConfig.character.gotoAndPlay(1);
}


function clickScreen() {
    if (mayor.isSpeaking) {
        stopMayorSpeak();
    } else {
        if (gameConfig.chrIsSpeaking) {
            stopChrSpeak();
        }
    }

    resetAllTMBtns();
    if (this.name == "screen1") {
        gameConfig.screens.gotoAndStop(1);
        characterSpeak("speak_timemachine_dino");

        gameConfig.dinoBtnHover.visible = true;
        gameConfig.dinoBtnNoHover.visible = false;
        gameConfig.dinoBtnSun.visible = true;
        app.ticker.add(rotateDinoSun);

    } else if (this.name == "screen2") {
        gameConfig.screens.gotoAndStop(2);
        characterSpeak("speak_timemachine_egypt");

        gameConfig.egyptBtnHover.visible = true;
        gameConfig.egyptBtnNoHover.visible = false;
        gameConfig.egyptBtnSun.visible = true;
        app.ticker.add(rotateEgyptSun);

    } else if (this.name == "screen3") {
        gameConfig.screens.gotoAndStop(3);
        characterSpeak("speak_timemachine_rome");

        gameConfig.romeBtnHover.visible = true;
        gameConfig.romeBtnNoHover.visible = false;
        gameConfig.romeBtnSun.visible = true;
        app.ticker.add(rotateRomeSun);

    } else if (this.name == "screen4") {
        gameConfig.screens.gotoAndStop(4);
        characterSpeak("speak_timemachine_ridder");

        gameConfig.ridderBtnHover.visible = true;
        gameConfig.ridderBtnNoHover.visible = false;
        gameConfig.ridderBtnSun.visible = true;
        app.ticker.add(rotateRidderSun);
    }

    gameConfig.buyBtn.visible = true;
    gameConfig.cancelBtn.visible = true;
}

function rotateDinoSun() {
    if (gameConfig.dinoBtnSun) {
        gameConfig.dinoBtnSun.rotation -= 0.01;
    }
}

function rotateEgyptSun() {
    if (gameConfig.egyptBtnSun) {
        gameConfig.egyptBtnSun.rotation -= 0.01;
    }
}

function rotateRomeSun() {
    if (gameConfig.romeBtnSun) {
        gameConfig.romeBtnSun.rotation -= 0.01;
    }
}

function rotateRidderSun() {
    if (gameConfig.ridderBtnSun) {
        gameConfig.ridderBtnSun.rotation -= 0.01;
    }
}

function resetAllTMBtns() {
    if (gameConfig.dinoBtnSun) {
        gameConfig.dinoBtnSun.visible = false;
        gameConfig.dinoBtnHover.visible = false;
        gameConfig.dinoBtnNoHover.visible = true;
        app.ticker.remove(rotateDinoSun);

        gameConfig.egyptBtnSun.visible = false;
        gameConfig.egyptBtnHover.visible = false;
        gameConfig.egyptBtnNoHover.visible = true;
        app.ticker.remove(rotateEgyptSun);

        gameConfig.romeBtnSun.visible = false;
        gameConfig.romeBtnHover.visible = false;
        gameConfig.romeBtnNoHover.visible = true;
        app.ticker.remove(rotateRomeSun);

        gameConfig.ridderBtnSun.visible = false;
        gameConfig.ridderBtnHover.visible = false;
        gameConfig.ridderBtnNoHover.visible = true;
        app.ticker.remove(rotateRidderSun);
    }
}

function cancelTimeMachineExp() {
    if (gameConfig.chrIsSpeaking) {
        stopChrSpeak();
    }

    resetAllTMBtns();

    gameConfig.screens.gotoAndStop(0);
    gameConfig.buyBtn.visible = false;
    gameConfig.cancelBtn.visible = false;
}

function buyTimeMachineExp() {
    if (gameConfig.chrIsSpeaking) {
        stopChrSpeak();
    }

    resetAllTMBtns();

    if (user.wallet >= 10) {
        updateWallet(-10);

        clearInterval(gameConfig.ambientTimer);
        gameConfig.ambientTimer = null;

        if (gameConfig.screens.currentFrame == 1) {
            showDinoGame();
        } else if (gameConfig.screens.currentFrame == 2) {
            showEgyptGame();
        } else if (gameConfig.screens.currentFrame == 3) {
            showRomeGame();
        } else if (gameConfig.screens.currentFrame == 4) {
            showKnightGame();
        }

    } else {
        characterSpeak("speak_timemachine_nocash");
    }
}




//DINO----------------------------------------------
function showDinoGame() {
    sendStatPoint("start-dino");
    //clearInterval(universeAmbientSoundsInterval);
    //universeAmbientSoundsInterval = null;

    gameSoundArray = new Array();

    gameContainer.removeChildren();
    if (gameLoader) {
        gameLoader.reset();
    }

    if (localTest) {
        loadDinoReseources({
            "speak_b_dino_loose1": {
                "contenttype": "sound",
                "content": "dk_spil_slut_tapt_1.mp3",
                "subtitle": "Ej, du n\u00e5ede at miste alle dine liv, f\u00f8r du fik fat i \u00e6ggene. Pr\u00f8v igen."
            },
            "speak_b_dino_loose2": {
                "contenttype": "sound",
                "content": "dk_spil_slut_tapt_2.mp3",
                "subtitle": "Det var \u00e6rgerligt - du har ikke flere fors\u00f8g til at finde \u00e6ggene. M\u00e5ske skal du passe lidt bedre p\u00e5 n\u00e6ste gang? Pr\u00f8v igen for at se, om du kan g\u00f8re det bedre!"
            },
            "speak_b_dino_welcome": {
                "contenttype": "sound",
                "content": "dk_velkomst_og_forklaring_dinosaurus.mp3",
                "subtitle": "Nu har du rejst meget langt tilbage i tiden, nemlig til dengang, hvor der fandtes dinosaurusser. Dinosarus mor er blevet ked af det, fordi hun har mistet sine \u00e6g, og du skal derfor hj\u00e6lpe med at finde dem. For at finde \u00e6ggene skal du bruge pilene p\u00e5 tastaturet og grave dig ned igennem jorden. Du skal samle alle hjerterne, f\u00f8r du kan f\u00e5 fat i et \u00e6g. Men pas p\u00e5 de farlige ting undervejs - og skynd dig alt, hvad du kan! Tryk p\u00e5 den gr\u00f8nne knap, n\u00e5r du er klar."
            },
            "speak_b_dino_won1": {
                "contenttype": "sound",
                "content": "dk_spil_slut_gennemfoert_1.mp3",
                "subtitle": "Du fandt alle \u00e6ggene - godt g\u00e5et! Pr\u00f8v at se, om du kan g\u00f8re det endnu hurtigere!"
            },
            "speak_b_dino_won2": {
                "contenttype": "sound",
                "content": "dk_spil_slut_gennemfoert_2.mp3",
                "subtitle": "Det er du god til - du fandt alle \u00e6ggene! Tror du, at du kan g\u00f8re det endnu hurtigere?"
            },
            "dino_ambient": {
                "contenttype": "sound",
                "content": "dino_dinosaur_regnskovs_ambient_mix.mp3",
                "subtitle": ""
            },
            "dino_complete": {
                "contenttype": "sound",
                "content": "dino_complete.mp3",
                "subtitle": ""
            },
            "dino_digging": {
                "contenttype": "sound",
                "content": "dino_grave_under_jorden-lyd.mp3",
                "subtitle": ""
            },
            "dino_hart": {
                "contenttype": "sound",
                "content": "dino_hjerte_plingeling.mp3",
                "subtitle": ""
            },
            "dino_monster": {
                "contenttype": "sound",
                "content": "dino_monster_snapper_flere_gange.mp3",
                "subtitle": ""
            },
            "dino_remove_rock": {
                "contenttype": "sound",
                "content": "dino_opmaerksom-lyd_egg_kan_hentes.mp3",
                "subtitle": ""
            },
            "dino_stone_in_the_head": {
                "contenttype": "sound",
                "content": "dino_ser_stjerner_efter_sten_i_hovedet.mp3",
                "subtitle": ""
            }
        });
    } else {
        $.ajax({
            type: 'GET',
            url: 'gameadmin/getcontent/dino.json',
            contentType: 'application/json; charset=utf-8',
            dataType: 'json',
        }).done(loadDinoReseources);
    }
}


function loadDinoReseources(data) {
    gameLoader = new PIXI.Loader();
    $.each(data, function(key, val) {
        gameLoader.add(key, "files/" + val.content);

        subtitleArray[key] = val.subtitle;

        gameSoundArray.push(key);
    })

    showPreloader();
    gameLoader.on('progress', preloadProgress);

    gameLoader.add("images/dino/dinogameBG.png")
        .add("images/dino/dinogameFG.png")
        .add("images/dino/character.json")
        .add("images/dino/roomDino.json")
        .add("images/dino/gamebar.png")
        .add("images/dino/Aeg.png")
        .add("images/dino/Figur_point.png")
        .add("images/dino/screenDino.png")
        .add("images/dino/screenDinoAnim.json")
        .add("images/dino/screenGame.json")
        .add("images/dino/screenStone.png")
        .add("images/dino/screenStoneAnim.json")
        .add("images/dino/screenGameDinoAnim.json")
        .add("images/dino/tileDino.json")
        .add("images/dino/tileStone.png")
        .add("images/dino/tileEgg.png")
        .add("images/dino/tileHeart.json")
        .add("images/dino/tileJord.png")
        .add("images/dino/tileRock.json")
        .add("images/dino/tileTunnel.json")
        .add("images/dino/topbar_dino.json")
        .add("images/dino/topbar_dino2.json")
        .add("images/dino/topbar_flame.json")
        .add("images/dino/topbar_pterodaktyl.json")
        .add("images/dino/mobileLeftBtn.png")
        .add("images/dino/mobileRightBtn.png")
        .add("images/dino/mobileUpBtn.png")
        .add("images/dino/mobileDownBtn.png")
        .load(initDino);
}

function initDino(loader, resources) {
    bottomBar.y = 590;

    gameConfig = {};

    var dinoBG = createSprite("images/dino/dinogameBG.png", 0, 0, gameLoader);
    gameContainer.addChild(dinoBG);
    cleanUpArray.push(dinoBG);

    gameConfig.gameHolder = new PIXI.Container();
    gameConfig.gameHolder.x = 190;
    gameConfig.gameHolder.y = 142;
    gameContainer.addChild(gameConfig.gameHolder);
    cleanUpRemoveArray.push(gameConfig.gameHolder);

    gameConfig.player = createMCGC("Figur00", 61, 150, 0);
    gameConfig.player.onFrameChange = function() {
        if (this.currentFrame == 21) {
            this.gotoAndStop(0);
        }
    }
    gameConfig.player.posX = 3;
    gameConfig.player.posY = 0;
    gameConfig.player.gotoAndStop(0);
    gameConfig.gameHolder.addChild(gameConfig.player);
    cleanUpArray.push(gameConfig.player);

    mayorSpeak("speak_b_dino_welcome");

    var dinoFG = createSprite("images/dino/dinogameFG.png", 0, 0, gameLoader);
    gameContainer.addChild(dinoFG);
    cleanUpArray.push(dinoFG);

    if (backToTimemachineBtn) {
        backToTimemachineBtn.x = 780;
        backToTimemachineBtn.y = 10;
        gameContainer.addChild(backToTimemachineBtn);
    } else {
        backToTimemachineBtn = createMC("Tids_ikon_btn_Egypt00", 2, 780, 10);
        backToTimemachineBtn.gotoAndStop(0);
        gameContainer.addChild(backToTimemachineBtn);
        makeButton(backToTimemachineBtn, exitDino);
    }


    //gamebar
    gameConfig.gameBar = new PIXI.Container();
    gameConfig.gameBar.x = -20;
    gameConfig.gameBar.y = 535;
    gameContainer.addChild(gameConfig.gameBar);
    cleanUpRemoveArray.push(gameConfig.gameBar);
    var gameBarBG = createSprite("images/dino/gamebar.png", 0, 0, gameLoader)
    gameConfig.gameBar.addChild(gameBarBG);
    cleanUpArray.push(gameBarBG);

    gameConfig.gameBar.life1 = createSprite("images/dino/Figur_point.png", 658, 84, gameLoader);
    gameConfig.gameBar.addChild(gameConfig.gameBar.life1);
    gameConfig.gameBar.life2 = createSprite("images/dino/Figur_point.png", 686, 74, gameLoader);
    gameConfig.gameBar.addChild(gameConfig.gameBar.life2);
    gameConfig.gameBar.life3 = createSprite("images/dino/Figur_point.png", 716, 64, gameLoader);
    gameConfig.gameBar.addChild(gameConfig.gameBar.life3);
    cleanUpArray.push(gameConfig.gameBar.life1);
    cleanUpArray.push(gameConfig.gameBar.life2);
    cleanUpArray.push(gameConfig.gameBar.life3);

    gameConfig.gameBar.egg1 = createSprite("images/dino/Aeg.png", 284, 78, gameLoader);
    gameConfig.gameBar.addChild(gameConfig.gameBar.egg1);
    gameConfig.gameBar.egg2 = createSprite("images/dino/Aeg.png", 309, 88, gameLoader);
    gameConfig.gameBar.addChild(gameConfig.gameBar.egg2);
    gameConfig.gameBar.egg3 = createSprite("images/dino/Aeg.png", 334, 98, gameLoader);
    gameConfig.gameBar.addChild(gameConfig.gameBar.egg3);
    gameConfig.gameBar.egg4 = createSprite("images/dino/Aeg.png", 359, 106, gameLoader);
    gameConfig.gameBar.addChild(gameConfig.gameBar.egg4);
    gameConfig.gameBar.egg5 = createSprite("images/dino/Aeg.png", 384, 108, gameLoader);
    gameConfig.gameBar.addChild(gameConfig.gameBar.egg5);
    cleanUpArray.push(gameConfig.gameBar.egg1);
    cleanUpArray.push(gameConfig.gameBar.egg2);
    cleanUpArray.push(gameConfig.gameBar.egg3);
    cleanUpArray.push(gameConfig.gameBar.egg4);
    cleanUpArray.push(gameConfig.gameBar.egg5);

    gameConfig.scoreTF = new PIXI.Text("00:00", ridderScoreLabelStyle);
    gameConfig.scoreTF.x = 504;
    gameConfig.scoreTF.y = 106;
    gameConfig.scoreTF.rotation = -0.05;
    gameConfig.gameBar.addChild(gameConfig.scoreTF);
    cleanUpArray.push(gameConfig.scoreTF);

    updateGameBar();

    if (isMobile || isIPad) {
        initDinoMobileControls();
    }

    //show intro video
    gamePopup = new PIXI.Container();
    gamePopup.x = 250;
    gamePopup.y = 100;
    gameContainer.addChild(gamePopup);
    cleanUpRemoveArray.push(gamePopup);

    var videoTexture = PIXI.Texture.from('images/dino/dinoInfo.mp4');
    cleanUpArray.push(videoTexture);
    var videoElement = videoTexture.baseTexture.resource.source;

    var videoSprite = new PIXI.Sprite(videoTexture);
    videoSprite.width = 550;
    videoSprite.height = 420;
    gamePopup.addChild(videoSprite);
    cleanUpRemoveArray.push(videoSprite);

    videoElement.loop = true;
    videoElement.autoPlay = true;
    videoElement.muted = true;

    var nextBtn = createNextBtn();
    nextBtn.x = 360;
    nextBtn.y = 330;
    nextBtn.on('pointerdown', skipDinoIntro);
    gamePopup.addChild(nextBtn);
    cleanUpRemoveArray.push(nextBtn);

    dinoAmbientSounds();

    //start new game
    gameConfig.userLives = 3;
    gameConfig.level = 0;
    gameConfig.gameActive = false;
    //setupDinoLevel();
}

function exitDino() {
    if (gameConfig.dinoTimer) {
        clearInterval(gameConfig.dinoTimer);
    }

    if (gameConfig.ambientTimer) {
        clearInterval(gameConfig.ambientTimer);
        gameConfig.ambientTimer = null;
    }
    if (gameConfig.dinoSound) {
        gameConfig.dinoSound.stop();
    }

    if (gameConfig.dinoKeysSetup) {
        window.removeEventListener("keydown", dinoKeyListener);
    }

    backToTimemachine();
}

function dinoAmbientSounds() {
    gameConfig.dinoSound = playSound("dino_ambient");
    gameConfig.dinoSound.volume = 0.05;
    gameConfig.ambientTimer = setTimeout(dinoAmbientSounds, 13000);
}

function skipDinoIntro() {
    stopMayorSpeak();
    gamePopup.parent.removeChild(gamePopup);

    setupDinoLevel();

    //setup keylisteners
    if (gameConfig.dinoKeysSetup) {
        //already set up - do nothing
    } else {
        setupDinoKeys();
    }

    updatePlayer();
    gameConfig.gameActive = true;

}

function setupDinoLevel() {
    startTimer();
    resetDinoGame();
}

function resetDinoGame() {
    gameConfig.gameHolder.removeChildren();

    gameConfig.tunnelArray = new Array;

    if (gameConfig.level == 0) {
        gameConfig.userHearts = 9;

        gameConfig.tileArray = new Array();
        gameConfig.tileArray.length = 15;
        for (var i = 0; i < gameConfig.tileArray.length; i++) {
            gameConfig.tileArray[i] = new Array();
            gameConfig.tileArray[i].length = 10;
        }
        gameConfig.tileArray[3][0] = "jord";

        gameConfig.tileArray[4][0] = "stone";
        gameConfig.tileArray[4][5] = "stone";
        gameConfig.tileArray[12][1] = "stone";
        gameConfig.tileArray[13][0] = "stone";
        gameConfig.tileArray[13][1] = "stone";

        gameConfig.tileArray[0][3] = "heart";
        gameConfig.tileArray[0][5] = "heart";
        gameConfig.tileArray[4][7] = "heart";
        gameConfig.tileArray[9][3] = "heart";
        gameConfig.tileArray[9][4] = "heart";
        gameConfig.tileArray[9][5] = "heart";
        gameConfig.tileArray[12][0] = "heart";
        gameConfig.tileArray[13][5] = "heart";
        gameConfig.tileArray[14][0] = "heart";

        gameConfig.tileArray[2][8] = "dino";
        gameConfig.tileArray[7][8] = "dino";
        gameConfig.tileArray[11][5] = "dino";

        gameConfig.tileArray[4][9] = "egg";

        gameConfig.tileArray[0][4] = "rock";
        gameConfig.tileArray[3][8] = "rock";
        gameConfig.tileArray[3][9] = "rock";
        gameConfig.tileArray[4][8] = "rock";
        gameConfig.tileArray[5][8] = "rock";
        gameConfig.tileArray[5][9] = "rock";
        gameConfig.tileArray[6][8] = "rock";
        gameConfig.tileArray[6][9] = "rock";
        gameConfig.tileArray[7][9] = "rock";
        gameConfig.tileArray[10][8] = "rock";
        gameConfig.tileArray[11][8] = "rock";
        gameConfig.tileArray[12][7] = "rock";
        gameConfig.tileArray[12][8] = "rock";

    } else if (gameConfig.level == 1) {
        gameConfig.userHearts = 9;

        gameConfig.tileArray = new Array();
        gameConfig.tileArray.length = 15;
        for (var i = 0; i < gameConfig.tileArray.length; i++) {
            gameConfig.tileArray[i] = new Array();
            gameConfig.tileArray[i].length = 11;
        }
        gameConfig.tileArray[3][0] = "jord";

        gameConfig.tileArray[1][3] = 'stone';
        gameConfig.tileArray[2][3] = 'stone';
        gameConfig.tileArray[4][7] = 'stone';
        gameConfig.tileArray[8][3] = 'stone';
        gameConfig.tileArray[10][4] = 'stone';
        gameConfig.tileArray[13][0] = 'stone';

        gameConfig.tileArray[0][3] = 'heart';
        gameConfig.tileArray[0][5] = 'heart';
        gameConfig.tileArray[9][3] = 'heart';
        gameConfig.tileArray[10][3] = 'heart';
        gameConfig.tileArray[8][4] = 'heart';
        gameConfig.tileArray[9][4] = 'heart';
        gameConfig.tileArray[14][0] = 'heart';
        gameConfig.tileArray[13][6] = 'heart';
        gameConfig.tileArray[13][7] = 'heart';
        gameConfig.tileArray[14][6] = 'heart';
        gameConfig.tileArray[14][7] = 'heart';
        gameConfig.tileArray[5][1] = 'dino';
        gameConfig.tileArray[9][5] = 'dino';
        gameConfig.tileArray[2][8] = 'dino';
        gameConfig.tileArray[7][8] = 'dino';
        gameConfig.tileArray[0][4] = 'rock';
        gameConfig.tileArray[3][8] = 'rock';
        gameConfig.tileArray[4][8] = 'rock';
        gameConfig.tileArray[5][8] = 'rock';
        gameConfig.tileArray[6][8] = 'rock';
        gameConfig.tileArray[3][9] = 'rock';
        gameConfig.tileArray[5][9] = 'rock';
        gameConfig.tileArray[6][9] = 'rock';
        gameConfig.tileArray[7][9] = 'rock';
        gameConfig.tileArray[12][7] = 'rock';
        gameConfig.tileArray[12][8] = 'rock';
        gameConfig.tileArray[11][8] = 'rock';
        gameConfig.tileArray[10][8] = 'rock';
        gameConfig.tileArray[4][9] = 'egg';
    } else if (gameConfig.level == 2) {
        gameConfig.userHearts = 15;

        gameConfig.tileArray = new Array();
        gameConfig.tileArray.length = 15;
        for (var i = 0; i < gameConfig.tileArray.length; i++) {
            gameConfig.tileArray[i] = new Array();
            gameConfig.tileArray[i].length = 10;
        }
        gameConfig.tileArray[3][0] = "jord";

        gameConfig.tileArray[12][0] = 'stone';
        gameConfig.tileArray[14][0] = 'stone';
        gameConfig.tileArray[3][1] = 'stone';
        gameConfig.tileArray[8][2] = 'stone';
        gameConfig.tileArray[2][4] = 'stone';

        gameConfig.tileArray[13][0] = 'heart';
        gameConfig.tileArray[3][2] = 'heart';
        gameConfig.tileArray[0][3] = 'heart';
        gameConfig.tileArray[7][3] = 'heart';
        gameConfig.tileArray[8][3] = 'heart';
        gameConfig.tileArray[9][3] = 'heart';
        gameConfig.tileArray[1][4] = 'heart';
        gameConfig.tileArray[7][4] = 'heart';
        gameConfig.tileArray[9][4] = 'heart';
        gameConfig.tileArray[0][5] = 'heart';
        gameConfig.tileArray[7][5] = 'heart';
        gameConfig.tileArray[8][5] = 'heart';
        gameConfig.tileArray[9][5] = 'heart';
        gameConfig.tileArray[13][7] = 'heart';
        gameConfig.tileArray[14][7] = 'heart';
        gameConfig.tileArray[1][3] = 'dino';
        gameConfig.tileArray[8][4] = 'dino';
        gameConfig.tileArray[14][6] = 'dino';
        gameConfig.tileArray[3][7] = 'dino';
        gameConfig.tileArray[5][7] = 'dino';
        gameConfig.tileArray[0][4] = 'rock';
        gameConfig.tileArray[3][8] = 'rock';
        gameConfig.tileArray[4][8] = 'rock';
        gameConfig.tileArray[5][8] = 'rock';
        gameConfig.tileArray[6][8] = 'rock';
        gameConfig.tileArray[3][9] = 'rock';
        gameConfig.tileArray[5][9] = 'rock';
        gameConfig.tileArray[6][9] = 'rock';
        gameConfig.tileArray[7][9] = 'rock';
        gameConfig.tileArray[12][7] = 'rock';
        gameConfig.tileArray[12][8] = 'rock';
        gameConfig.tileArray[11][8] = 'rock';
        gameConfig.tileArray[10][8] = 'rock';
        gameConfig.tileArray[4][9] = 'egg';



    } else if (gameConfig.level == 3) {
        gameConfig.userHearts = 24;

        gameConfig.tileArray = new Array();
        gameConfig.tileArray.length = 15;
        for (var i = 0; i < gameConfig.tileArray.length; i++) {
            gameConfig.tileArray[i] = new Array();
            gameConfig.tileArray[i].length = 10;
        }
        gameConfig.tileArray[3][0] = "jord";

        gameConfig.tileArray[13][0] = 'stone';
        gameConfig.tileArray[8][3] = 'stone';
        gameConfig.tileArray[10][3] = 'stone';
        gameConfig.tileArray[12][3] = 'stone';
        gameConfig.tileArray[2][4] = 'stone';
        gameConfig.tileArray[4][6] = 'stone';
        gameConfig.tileArray[13][1] = 'heart';
        gameConfig.tileArray[1][2] = 'heart';
        gameConfig.tileArray[7][2] = 'heart';
        gameConfig.tileArray[9][2] = 'heart';
        gameConfig.tileArray[11][2] = 'heart';
        gameConfig.tileArray[0][3] = 'heart';
        gameConfig.tileArray[7][3] = 'heart';
        gameConfig.tileArray[9][3] = 'heart';
        gameConfig.tileArray[11][3] = 'heart';
        gameConfig.tileArray[1][4] = 'heart';
        gameConfig.tileArray[7][4] = 'heart';
        gameConfig.tileArray[9][4] = 'heart';
        gameConfig.tileArray[11][4] = 'heart';
        gameConfig.tileArray[0][5] = 'heart';
        gameConfig.tileArray[1][5] = 'heart';
        gameConfig.tileArray[13][7] = 'heart';
        gameConfig.tileArray[14][7] = 'heart';
        gameConfig.tileArray[1][8] = 'heart';
        gameConfig.tileArray[2][8] = 'heart';
        gameConfig.tileArray[7][8] = 'heart';
        gameConfig.tileArray[8][8] = 'heart';
        gameConfig.tileArray[9][8] = 'heart';
        gameConfig.tileArray[8][9] = 'heart';
        gameConfig.tileArray[9][9] = 'heart';
        gameConfig.tileArray[1][3] = 'dino';
        gameConfig.tileArray[3][7] = 'dino';
        gameConfig.tileArray[5][7] = 'dino';
        gameConfig.tileArray[0][4] = 'rock';
        gameConfig.tileArray[3][8] = 'rock';
        gameConfig.tileArray[4][8] = 'rock';
        gameConfig.tileArray[5][8] = 'rock';
        gameConfig.tileArray[6][8] = 'rock';
        gameConfig.tileArray[3][9] = 'rock';
        gameConfig.tileArray[5][9] = 'rock';
        gameConfig.tileArray[6][9] = 'rock';
        gameConfig.tileArray[7][9] = 'rock';
        gameConfig.tileArray[12][7] = 'rock';
        gameConfig.tileArray[12][8] = 'rock';
        gameConfig.tileArray[11][8] = 'rock';
        gameConfig.tileArray[10][8] = 'rock';
        gameConfig.tileArray[4][9] = 'egg';

    } else if (gameConfig.level == 4) {
        gameConfig.userHearts = 27;

        gameConfig.tileArray = new Array();
        gameConfig.tileArray.length = 15;
        for (var i = 0; i < gameConfig.tileArray.length; i++) {
            gameConfig.tileArray[i] = new Array();
            gameConfig.tileArray[i].length = 10;
        }
        gameConfig.tileArray[3][0] = "jord";

        gameConfig.tileArray[6][0] = 'stone';
        gameConfig.tileArray[6][3] = 'stone';
        gameConfig.tileArray[8][0] = 'stone';
        gameConfig.tileArray[8][3] = 'stone';
        gameConfig.tileArray[10][0] = 'stone';
        gameConfig.tileArray[10][3] = 'stone';
        gameConfig.tileArray[12][0] = 'stone';
        gameConfig.tileArray[12][3] = 'stone';
        gameConfig.tileArray[1][4] = 'stone';
        gameConfig.tileArray[4][7] = 'stone';
        gameConfig.tileArray[0][0] = 'heart';
        gameConfig.tileArray[0][1] = 'heart';
        gameConfig.tileArray[0][2] = 'heart';
        gameConfig.tileArray[0][3] = 'heart';
        gameConfig.tileArray[0][4] = 'heart';
        gameConfig.tileArray[0][5] = 'heart';
        gameConfig.tileArray[1][5] = 'heart';
        gameConfig.tileArray[1][6] = 'heart';
        gameConfig.tileArray[1][7] = 'heart';
        gameConfig.tileArray[1][8] = 'heart';
        gameConfig.tileArray[6][1] = 'heart';
        gameConfig.tileArray[6][4] = 'heart';
        gameConfig.tileArray[8][1] = 'heart';
        gameConfig.tileArray[8][4] = 'heart';
        gameConfig.tileArray[10][1] = 'heart';
        gameConfig.tileArray[10][4] = 'heart';
        gameConfig.tileArray[12][1] = 'heart';
        gameConfig.tileArray[12][4] = 'heart';
        gameConfig.tileArray[5][7] = 'heart';
        gameConfig.tileArray[7][7] = 'heart';
        gameConfig.tileArray[7][8] = 'heart';
        gameConfig.tileArray[9][7] = 'heart';
        gameConfig.tileArray[9][8] = 'heart';
        gameConfig.tileArray[8][8] = 'heart';
        gameConfig.tileArray[8][9] = 'heart';
        gameConfig.tileArray[13][7] = 'heart';
        gameConfig.tileArray[14][7] = 'heart';
        gameConfig.tileArray[0][6] = 'dino';
        gameConfig.tileArray[2][5] = 'dino';
        gameConfig.tileArray[2][6] = 'dino';
        gameConfig.tileArray[2][8] = 'dino';
        gameConfig.tileArray[3][4] = 'dino';
        gameConfig.tileArray[6][7] = 'dino';
        gameConfig.tileArray[8][7] = 'dino';
        gameConfig.tileArray[9][9] = 'dino';
        gameConfig.tileArray[14][6] = 'dino';
        gameConfig.tileArray[3][8] = 'rock';
        gameConfig.tileArray[4][8] = 'rock';
        gameConfig.tileArray[5][8] = 'rock';
        gameConfig.tileArray[6][8] = 'rock';
        gameConfig.tileArray[3][9] = 'rock';
        gameConfig.tileArray[5][9] = 'rock';
        gameConfig.tileArray[6][9] = 'rock';
        gameConfig.tileArray[7][9] = 'rock';
        gameConfig.tileArray[12][7] = 'rock';
        gameConfig.tileArray[12][8] = 'rock';
        gameConfig.tileArray[11][8] = 'rock';
        gameConfig.tileArray[10][8] = 'rock';
        gameConfig.tileArray[4][9] = 'egg';

    }

    for (var i = 0; i < gameConfig.tileArray.length; i++) {
        for (var j = 0; j < gameConfig.tileArray[i].length; j++) {
            if (gameConfig.tileArray[i][j] != undefined) {
                if (gameConfig.tileArray[i][j] == "stone") {
                    var tile = createSprite("images/dino/tileJord.png", i * 50, j * 50, gameLoader);
                    cleanUpArray.push(tile);
                    gameConfig.gameHolder.addChild(tile);

                    tile = createSprite("images/dino/tileStone.png", i * 50 + 3, j * 50 + 2, gameLoader);
                    tile.name = "stone";
                    gameConfig.gameHolder.addChild(tile);
                    cleanUpArray.push(tile);

                } else if (gameConfig.tileArray[i][j] == "heart") {
                    tile = createSprite("images/dino/tileJord.png", i * 50, j * 50, gameLoader);
                    cleanUpArray.push(tile);
                    gameConfig.gameHolder.addChild(tile);

                    tile = createMCGC("Hjerte_tile00", 17, (i * 50) - 8, (j * 50) - 10);
                    tile.gotoAndStop(0);
                    gameConfig.gameHolder.addChild(tile);
                    cleanUpArray.push(tile);

                } else if (gameConfig.tileArray[i][j] == "dino") {
                    tile = createSprite("images/dino/tileJord.png", i * 50, j * 50, gameLoader);
                    cleanUpArray.push(tile);
                    gameConfig.gameHolder.addChild(tile);

                    tile = createMCGC("Oegle_tile0", 153, (i * 50) + 3, (j * 50) + 4);
                    tile.gotoAndPlay(Math.floor(Math.random() * 150));
                    gameConfig.gameHolder.addChild(tile);
                    cleanUpArray.push(tile);

                } else if (gameConfig.tileArray[i][j] == "egg") {
                    var tile = createSprite("images/dino/tileEgg.png", i * 50, j * 50, gameLoader);
                    gameConfig.gameHolder.addChild(tile);
                    cleanUpArray.push(tile);

                } else if (gameConfig.tileArray[i][j] == "rock") {
                    tile = createMCGC("Tile_klippe00", 17, (i * 50), (j * 50));
                    tile.gotoAndStop(0);
                    gameConfig.gameHolder.addChild(tile);
                    cleanUpArray.push(tile);

                } else {
                    tile = createSprite("images/dino/tileJord.png", i * 50, j * 50, gameLoader);
                    gameConfig.gameHolder.addChild(tile);
                    cleanUpArray.push(tile);

                }
            }
        }
    }

    gameConfig.gameHolder.addChild(gameConfig.player);
    gameConfig.player.posX = 3;
    gameConfig.player.posY = 0;
    updatePlayer();


}

function startTimer() {
    gameConfig.dinoTimer = setInterval(updateDinoTimer, 1000);
    gameConfig.seconds = 0;
}

function updateDinoTimer() {
    gameConfig.seconds++;
    var minString = Math.floor(gameConfig.seconds / 60);
    if (minString <= 9) {
        minString = "0" + minString;
    }
    var secString = Math.floor(gameConfig.seconds % 60);
    if (secString <= 9) {
        secString = "0" + secString;
    }

    gameConfig.scoreTF.text = minString + ":" + secString;

}

function initDinoMobileControls() {
    if (gameConfig.mobileLeftBtn) {

    } else {
        gameConfig.keyBackground = new PIXI.Graphics();
        gameConfig.keyBackground.beginFill(0xFFFFFF);
        gameConfig.keyBackground.drawCircle(95, 95, 95);
        gameConfig.keyBackground.endFill();
        gameConfig.keyBackground.x = 20;
        gameConfig.keyBackground.y = 496;
        gameConfig.keyBackground.alpha = 0.8;
        frontGround.addChild(gameConfig.keyBackground);
        cleanUpArray.push(gameConfig.keyBackground);

        gameConfig.mobileLeftBtn = createSprite("images/dino/mobileLeftBtn.png", 60, 630, gameLoader);
        gameConfig.mobileLeftBtn.anchor.set(0.5, 1)
        gameConfig.mobileLeftBtn.interactive = true;
        gameConfig.mobileLeftBtn.buttonMode = true;
        gameConfig.mobileLeftBtn.on("pointerdown", dinoGameLeft)
        gameConfig.mobileLeftBtn.on("pointerup", dinoGameKeyUp)
        gameConfig.mobileLeftBtn.on("pointerupoutside", dinoGameKeyUp)
        frontGround.addChild(gameConfig.mobileLeftBtn);
        cleanUpArray.push(gameConfig.mobileLeftBtn);

        gameConfig.mobileRightBtn = createSprite("images/dino/mobileRightBtn.png", 174, 630, gameLoader);
        gameConfig.mobileRightBtn.anchor.set(0.5, 1)
        gameConfig.mobileRightBtn.interactive = true;
        gameConfig.mobileRightBtn.buttonMode = true;
        gameConfig.mobileRightBtn.on("pointerdown", dinoGameRight)
        gameConfig.mobileRightBtn.on("pointerup", dinoGameKeyUp)
        gameConfig.mobileRightBtn.on("pointerupoutside", dinoGameKeyUp)
        frontGround.addChild(gameConfig.mobileRightBtn);
        cleanUpArray.push(gameConfig.mobileRightBtn);

        gameConfig.mobileUpBtn = createSprite("images/dino/mobileUpBtn.png", 117, 573, gameLoader);
        gameConfig.mobileUpBtn.anchor.set(0.5, 1);
        gameConfig.mobileUpBtn.interactive = true;
        gameConfig.mobileUpBtn.buttonMode = true;
        gameConfig.mobileUpBtn.on("pointerdown", dinoGameUp);
        gameConfig.mobileUpBtn.on("pointerup", dinoGameKeyUp);
        gameConfig.mobileUpBtn.on("pointerupoutside", dinoGameKeyUp);
        frontGround.addChild(gameConfig.mobileUpBtn);
        cleanUpArray.push(gameConfig.mobileUpBtn);

        gameConfig.mobileDownBtn = createSprite("images/dino/mobileDownBtn.png", 117, 630, gameLoader);
        gameConfig.mobileDownBtn.anchor.set(0.5, 1);
        gameConfig.mobileDownBtn.interactive = true;
        gameConfig.mobileDownBtn.buttonMode = true;
        gameConfig.mobileDownBtn.on("pointerdown", dinoGameDown);
        gameConfig.mobileDownBtn.on("pointerup", dinoGameKeyUp);
        gameConfig.mobileDownBtn.on("pointerupoutside", dinoGameKeyUp);
        frontGround.addChild(gameConfig.mobileDownBtn);
        cleanUpArray.push(gameConfig.mobileDownBtn);

        if (gameContainer.x > 75) {
            gameConfig.keyBackground.scale.set(1.2);
            gameConfig.keyBackground.x = -75;
            gameConfig.keyBackground.y = 465;
            gameConfig.mobileLeftBtn.x = -20;
            gameConfig.mobileRightBtn.x = 94;
            gameConfig.mobileUpBtn.x = 37;
            gameConfig.mobileDownBtn.x = 37;
        }
    }
}

function dinoGameLeft() {
    if (gameConfig.mobileLeftBtn) {
        this.scale.y = 0.75;
    }

    if (gameConfig.gameActive) {
        gameConfig.player.posX -= 1;

        if (gameConfig.player.posX < 0) {
            gameConfig.player.posX = 0;
        }

        if (checkMoveAllowed("left")) {
            playSound("dino_digging");
        } else {
            gameConfig.player.posX += 1;
        }

        updatePlayer();
    }
}

function dinoGameRight() {
    if (gameConfig.mobileLeftBtn) {
        this.scale.y = 0.75;
    }

    if (gameConfig.gameActive) {
        gameConfig.player.posX += 1;
        if (gameConfig.player.posX >= 15) {
            gameConfig.player.posX = 14;
        }
        if (checkMoveAllowed("right")) {
            playSound("dino_digging");
        } else {
            gameConfig.player.posX -= 1;
        }

        updatePlayer();
    }

}

function dinoGameUp() {
    if (gameConfig.mobileLeftBtn) {
        this.scale.y = 0.75;
    }

    if (gameConfig.gameActive) {
        gameConfig.player.posY -= 1;

        if (gameConfig.player.posY < 0) {
            gameConfig.player.posY = 0;
        }
        if (checkMoveAllowed()) {
            playSound("dino_digging");
        } else {
            gameConfig.player.posY += 1;
        }

        updatePlayer();
    }

}

function dinoGameDown() {
    if (gameConfig.mobileLeftBtn) {
        this.scale.y = 0.75;
    }
    if (gameConfig.gameActive) {
        gameConfig.player.posY += 1;
        if (gameConfig.player.posY >= 10) {
            gameConfig.player.posY = 9;
        }
        if (checkMoveAllowed()) {
            playSound("dino_digging");
        } else {
            gameConfig.player.posY -= 1;
        }

        updatePlayer();
    }
}

function dinoGameKeyUp() {
    this.scale.set(1);
}


function setupDinoKeys() {
    gameConfig.dinoKeysSetup = true;
    window.addEventListener("keydown", dinoKeyListener);
}


function dinoKeyListener(keyEvent) {
    if (keyEvent.keyCode === 37) {
        dinoGameLeft();
    } else if (keyEvent.keyCode === 39) {
        dinoGameRight();
    } else if (keyEvent.keyCode === 38) {
        dinoGameUp();
    } else if (keyEvent.keyCode === 40) {
        dinoGameDown();
    }
}


function checkMoveAllowed(direction) {
    var moveAllowed = true;

    var x = gameConfig.player.posX;
    var y = gameConfig.player.posY;

    if (gameConfig.tileArray[x][y] == "stone") {
        if (direction) {
            //test to push
            var newRockPosX;
            if (direction == "right") {
                newRockPosX = x + 1;
                if (newRockPosX >= 15) {
                    return false;
                }
            } else {
                newRockPosX = x - 1;
                if (newRockPosX < 0) {
                    return false;
                }
            }

            if (checkIfTileIsTunneled(newRockPosX, y)) {
                var stone;
                for (var i = 0; i < gameConfig.gameHolder.children.length; i++) {
                    if (gameConfig.gameHolder.children[i].name == "stone") {
                        stone = gameConfig.gameHolder.children[i];
                        if (stone.x == (x * 50) + 3 && stone.y == (y * 50) + 2) {
                            stone.x = newRockPosX * 50 + 3;
                            gameConfig.gameHolder.setChildIndex(stone, gameConfig.gameHolder.children.length - 1);

                            var newRockPosY = y;
                            while (checkIfTileIsTunneled(newRockPosX, (newRockPosY + 1))) {
                                newRockPosY += 1;
                            }
                            break;
                        }
                    }
                }

                gameConfig.tileArray[x][y] = "";
                gameConfig.tileArray[newRockPosX][newRockPosY] = "stone";
                removeFromTunnelArray(newRockPosX, newRockPosY);
                stone.y = newRockPosY * 50 + 2;
                //TweenMax.to(stone, 0.25, {pixi:{ x: (newRockPosX*50+3) }, ease:Power2.easeInOut});
                //TweenMax.to(stone, 0.25, {delay:0.25, pixi:{ y: newRockPosY*50+2 }, ease:Power2.easeIn});

                return true;
            } else {
                return false;
            }

        } else {
            return false;

        }

    } else if (gameConfig.tileArray[x][y] == "rock") {
        return false;
    } else if (gameConfig.tileArray[x][y] == "heart") {
        playSound("dino_hart");
        gameConfig.tileArray[x][y] = "";
        gameConfig.userHearts -= 1;
        if (gameConfig.userHearts <= 0) {
            openToEgg();
        }

    } else if (gameConfig.tileArray[x][y] == "dino") {
        playSound("dino_monster");
        showDinoMonsterPopup();

        return false;
    } else if (gameConfig.tileArray[x][y] == "egg") {
        playSound("dino_complete");

        gameConfig.level++

            updateGameBar();

        showDinoEggPopup();

        return false;
    }

    if (moveAllowed) {
        //check for stone above
        var rockY = y - 1;
        if (rockY < 0) {
            //player is on top
            return true
        } else {
            if (gameConfig.tileArray[x][rockY] == "stone") {
                playSound("dino_stone_in_the_head");

                showStonePopup();

                return false
            } else {
                return true
            }
        }
    } else {
        return false;
    }
}

function checkIfTileIsTunneled(xPos, yPos) {
    for (var i = 0; i < gameConfig.tunnelArray.length; i++) {
        if (gameConfig.tunnelArray[i][0] == xPos && gameConfig.tunnelArray[i][1] == yPos) {
            return true;
        }
    }
    return false;
}

function openToEgg() {
    playSound("dino_remove_rock");
    gameConfig.tileArray[4][8] = "jord";

    var tile = createMCGC("tunnel_tile00", 35, 4 * 50, 8 * 50);
    tile.loop = false;
    gameConfig.gameHolder.addChild(tile);
    cleanUpArray.push(tile);

}

function updateGameBar() {
    if (gameConfig.userLives <= 0) {
        gameConfig.gameBar.life1.visible = false;
        gameConfig.gameBar.life2.visible = false;
        gameConfig.gameBar.life3.visible = false;
    } else if (gameConfig.userLives == 1) {
        gameConfig.gameBar.life1.visible = true;
        gameConfig.gameBar.life2.visible = false;
        gameConfig.gameBar.life3.visible = false;
    } else if (gameConfig.userLives == 2) {
        gameConfig.gameBar.life1.visible = true;
        gameConfig.gameBar.life2.visible = true;
        gameConfig.gameBar.life3.visible = false;
    } else {
        gameConfig.gameBar.life1.visible = true;
        gameConfig.gameBar.life2.visible = true;
        gameConfig.gameBar.life3.visible = true;
    }

    gameConfig.gameBar.egg1.visible = false;
    gameConfig.gameBar.egg2.visible = false;
    gameConfig.gameBar.egg3.visible = false;
    gameConfig.gameBar.egg4.visible = false;
    gameConfig.gameBar.egg5.visible = false;

    if (gameConfig.level > 0) {
        gameConfig.gameBar.egg1.visible = true;
    }
    if (gameConfig.level > 1) {
        gameConfig.gameBar.egg2.visible = true;
    }
    if (gameConfig.level > 2) {
        gameConfig.gameBar.egg3.visible = true;
    }
    if (gameConfig.level > 3) {
        gameConfig.gameBar.egg4.visible = true;
    }
    if (gameConfig.level > 4) {
        gameConfig.gameBar.egg5.visible = true;
    }
}

function showDinoMonsterPopup() {
    gameConfig.gameActive = false;

    gamePopup = new PIXI.Container();
    gamePopup.x = 250;
    gamePopup.y = 100;
    gameContainer.addChild(gamePopup);

    var popupBG = createSprite("images/dino/screenDino.png", 0, 0, gameLoader);
    gamePopup.addChild(popupBG);
    cleanUpArray.push(popupBG);

    var popupAnim = createMCGC("Oegle_outro instance 100", 69, 11, 70);
    popupAnim.loop = false;
    gamePopup.addChild(popupAnim);
    cleanUpArray.push(popupAnim);

    cleanUpRemoveArray.push(gamePopup);

    setTimeout(backToDinoGame, 3000);

}

function showStonePopup() {
    gameConfig.gameActive = false;

    gamePopup = new PIXI.Container();
    gamePopup.x = 250;
    gamePopup.y = 100;
    gameContainer.addChild(gamePopup);

    var popupBG = createSprite("images/dino/screenStone.png", 0, 0, gameLoader);
    gamePopup.addChild(popupBG);
    cleanUpArray.push(popupBG);

    var popupAnim = createMCGC("Tabt_sten instance 100", 20, 120, 50);
    gamePopup.addChild(popupAnim);
    cleanUpArray.push(popupAnim);

    cleanUpRemoveArray.push(gamePopup);

    setTimeout(backToDinoGame, 3000);

}


function backToDinoGame() {
    gamePopup.parent.removeChild(gamePopup);
    gameConfig.gameActive = true;

    gameConfig.userLives -= 1;
    updateGameBar();
    if (gameConfig.userLives <= 0) {
        dinoGameOver();
    } else {
        resetDinoGame();
    }
}



function updatePlayer() {
    gameConfig.player.gotoAndPlay(7);
    gameConfig.player.x = gameConfig.player.posX * 50;
    gameConfig.player.y = gameConfig.player.posY * 50;

    addToTunnelArray(gameConfig.player.posX, gameConfig.player.posY);

    var tile = createMCGC("tunnel_tile00", 35, gameConfig.player.posX * 50, gameConfig.player.posY * 50);
    tile.loop = false;
    gameConfig.gameHolder.addChild(tile);
    cleanUpArray.push(tile);

    gameConfig.gameHolder.setChildIndex(gameConfig.player, gameConfig.gameHolder.children.length - 1);
}

function addToTunnelArray(xPos, yPos) {
    for (var i = 0; i < gameConfig.tunnelArray.length; i++) {
        if (gameConfig.tunnelArray[i][0] == xPos && gameConfig.tunnelArray[i][1] == yPos) {
            return;
        }
    }

    gameConfig.tunnelArray.push([xPos, yPos]);
}

function removeFromTunnelArray(xPos, yPos) {
    for (var i = 0; i < gameConfig.tunnelArray.length; i++) {
        if (gameConfig.tunnelArray[i][0] == xPos && gameConfig.tunnelArray[i][1] == yPos) {
            gameConfig.tunnelArray.splice(i, 1);
            return;
        }
    }
}


function showDinoEggPopup() {
    gameConfig.gameActive = false;

    if (gameConfig.level >= 5) {
        dinoGameOverWin();
    } else {
        gamePopup = new PIXI.Container();
        gamePopup.x = 250;
        gamePopup.y = 100;
        gameContainer.addChild(gamePopup);

        var popupBG = createMCGC("game_screen00", 5, 0, 0);
        popupBG.gotoAndStop(gameConfig.level);
        gamePopup.addChild(popupBG);
        cleanUpArray.push(popupBG);

        var nextBtn = createNextBtn();
        nextBtn.x = 170;
        nextBtn.y = 100;
        nextBtn.on('pointerdown', nextDinoLevel);
        gamePopup.addChild(nextBtn);
        cleanUpRemoveArray.push(nextBtn);
        cleanUpRemoveArray.push(gamePopup);
    }
}

function nextDinoLevel() {
    gamePopup.parent.removeChild(gamePopup);
    gameConfig.gameActive = true;

    resetDinoGame();
}

function dinoGameOver() {
    clearInterval(gameConfig.dinoTimer);
    gameConfig.gameActive = false;

    //show intro video
    gamePopup = new PIXI.Container();
    gamePopup.x = 250;
    gamePopup.y = 100;
    gameContainer.addChild(gamePopup);

    if (Math.random() < 0.5) {
        mayorSpeak("speak_b_dino_loose1");
    } else {
        mayorSpeak("speak_b_dino_loose2");
    }

    var popupBG = createMCGC("game_screen00", 5, 0, 0);
    popupBG.gotoAndStop(gameConfig.level);
    gamePopup.addChild(popupBG);
    cleanUpArray.push(popupBG);

    if (gameConfig.level == 0) {
        var dino = createMCGC("dinoCry", 99, 9, 200);
        gamePopup.addChild(dino);
        cleanUpArray.push(dino);
    }

    var nextBtn = createNextBtn();
    nextBtn.x = 170;
    nextBtn.y = 100;
    nextBtn.on('pointerdown', restartDinoGame);
    gamePopup.addChild(nextBtn);

    cleanUpRemoveArray.push(nextBtn);
    cleanUpRemoveArray.push(gamePopup);

}

function dinoGameOverWin() {
    gameConfig.gameActive = false;
    clearInterval(gameConfig.dinoTimer);

    //show intro video
    gamePopup = new PIXI.Container();
    gamePopup.x = 250;
    gamePopup.y = 100;
    gameContainer.addChild(gamePopup);

    if (Math.random() < 0.5) {
        mayorSpeak("speak_b_dino_won1");
    } else {
        mayorSpeak("speak_b_dino_won2");
    }

    var videoTexture = PIXI.Texture.from('images/dino/screenGameWin.mp4');
    cleanUpArray.push(videoTexture);
    var videoElement = videoTexture.baseTexture.resource.source;

    var videoSprite = new PIXI.Sprite(videoTexture);
    videoSprite.width = 462;
    videoSprite.height = 410;
    videoSprite.x = 37;
    videoSprite.y = 7;
    gamePopup.addChild(videoSprite);
    cleanUpRemoveArray.push(videoSprite);

    videoElement.loop = true;
    videoElement.autoPlay = true;
    videoElement.muted = true;

    var scoreTF = new PIXI.Text(gameConfig.scoreTF.text, ridderScoreLabelStyle);
    scoreTF.x = 140;
    scoreTF.y = 360;
    gamePopup.addChild(scoreTF);
    cleanUpArray.push(scoreTF);

    var nextBtn = createNextBtn();
    nextBtn.x = 360;
    nextBtn.y = 330;
    nextBtn.on('pointerdown', restartDinoGame);
    gamePopup.addChild(nextBtn);

    cleanUpRemoveArray.push(nextBtn);
    cleanUpRemoveArray.push(gamePopup);
}

function restartDinoGame() {
    gamePopup.parent.removeChild(gamePopup);
    gameConfig.gameActive = true;

    gameConfig.level = 0;
    gameConfig.userLives = 3;

    updateGameBar();

    startTimer();
    resetDinoGame();
}


//EGYPT----------------------------------------------
function showEgyptGame() {
    sendStatPoint("start-egypt");

    gameSoundArray = new Array();

    gameContainer.removeChildren();
    if (gameLoader) {
        gameLoader.reset();
    }

    if (localTest) {
        loadEgyptReseources({
            "speak_b_egypt_welcome": {
                "contenttype": "sound",
                "content": "dk_velkomst_og_forklaring_aegypten.mp3",
                "subtitle": "Nu er du tilbage i det gamle Egypten, hvor de er i gang med at bygge verdens st\u00f8rste pyramide, som hedder Keops pyramiden. Du skal hj\u00e6lpe med at g\u00f8re det store rum til faraoen, som er en slags konge, rigtig flot! Du kan male v\u00e6ggen og dekorere den med flotte ting. Tryk p\u00e5 den gr\u00f8nne knap, n\u00e5r du er klar!"
            },
            "egypt_ambient": {
                "contenttype": "sound",
                "content": "egypt_ambient.mp3",
                "subtitle": ""
            },
            "egypt_urne_open": {
                "contenttype": "sound",
                "content": "egypt_mus_over_urner_hiroglyffer_ud_af_krukke.mp3",
                "subtitle": ""
            }
        });
    } else {
        $.ajax({
            type: 'GET',
            url: 'gameadmin/getcontent/egypt.json',
            contentType: 'application/json; charset=utf-8',
            dataType: 'json',
        }).done(loadEgyptReseources);
    }
}


function loadEgyptReseources(data) {
    gameLoader = new PIXI.Loader();
    $.each(data, function(key, val) {
        gameLoader.add(key, "files/" + val.content);

        subtitleArray[key] = val.subtitle;

        gameSoundArray.push(key);
    })

    showPreloader();
    gameLoader.on('progress', preloadProgress);

    gameLoader.add("images/egypt/EgyptGameBG.png")
        .add("images/egypt/jarbtn.json")
        .add("images/egypt/krukke_one.json")
        .add("images/egypt/krukke_two.json")
        .add("images/egypt/krukke_three.json")
        .add("images/egypt/Mumie_hair.json")
        .add("images/egypt/Mumie_skin.json")
        .add("images/egypt/Mumie_wraps.json")
        .add("images/egypt/Mumie_wraps2.json")
        .add("images/egypt/Pensel_holder.json")
        .add("images/egypt/symbols_one_sheet.json")
        .add("images/egypt/Symbol_two_sheet.json")
        .add("images/egypt/symbol_three_sheet.json")
        .add("images/egypt/Mumie.png")
        .add("images/egypt/Pencil.json")
        .add("images/egypt/symbols_one.png")
        .add("images/egypt/symbols_two.png")
        .add("images/egypt/symbols_three.png")
    if (isMobile || isIPad) {
        gameLoader.add("images/egypt/egyptIntroMobileBG.png")
    }
    gameLoader.load(initEgypt);
}

function initEgypt(loader, resources) {
    bottomBar.y = 590;

    gameConfig = {};

    var egyptBG = createSprite("images/egypt/EgyptGameBG.png", -52, -5, gameLoader);
    gameContainer.addChild(egyptBG);
    cleanUpArray.push(egyptBG);

    gameConfig.paintArea0 = new PIXI.Graphics();
    gameConfig.paintArea0.beginFill(0x9d5002);
    gameConfig.paintArea0.drawRect(0, 0, 178, 212);
    gameConfig.paintArea0.hitArea = new PIXI.Rectangle(0, 0, 178, 212);
    gameConfig.paintArea0.x = 86;
    gameConfig.paintArea0.y = 142;
    gameContainer.addChild(gameConfig.paintArea0);
    makeButton(gameConfig.paintArea0, colorArea);
    gameConfig.paintArea0.interactive = false;
    cleanUpArray.push(gameConfig.paintArea0);

    gameConfig.paintArea1 = new PIXI.Graphics();
    gameConfig.paintArea1.beginFill(0x9d5002);
    gameConfig.paintArea1.drawRect(0, 0, 454, 43);
    gameConfig.paintArea1.hitArea = new PIXI.Rectangle(0, 0, 454, 43);
    gameConfig.paintArea1.x = 308;
    gameConfig.paintArea1.y = 142;
    gameContainer.addChild(gameConfig.paintArea1);
    makeButton(gameConfig.paintArea1, colorArea);
    gameConfig.paintArea1.interactive = false;
    cleanUpArray.push(gameConfig.paintArea1);

    gameConfig.paintArea2 = new PIXI.Graphics();
    gameConfig.paintArea2.beginFill(0x9d5002);
    gameConfig.paintArea2.drawRect(0, 0, 178, 212);
    gameConfig.paintArea2.hitArea = new PIXI.Rectangle(0, 0, 178, 212);
    gameConfig.paintArea2.x = 800;
    gameConfig.paintArea2.y = 142;
    gameContainer.addChild(gameConfig.paintArea2);
    makeButton(gameConfig.paintArea2, colorArea);
    gameConfig.paintArea2.interactive = false;
    cleanUpArray.push(gameConfig.paintArea2);

    gameConfig.paintArea3 = new PIXI.Graphics();
    gameConfig.paintArea3.beginFill(0x9d5002);
    gameConfig.paintArea3.drawRect(0, 0, 123, 180);
    gameConfig.paintArea3.hitArea = new PIXI.Rectangle(0, 0, 123, 180);
    gameConfig.paintArea3.x = 308;
    gameConfig.paintArea3.y = 220;
    gameContainer.addChild(gameConfig.paintArea3);
    makeButton(gameConfig.paintArea3, colorArea);
    gameConfig.paintArea3.interactive = false;
    cleanUpArray.push(gameConfig.paintArea3);

    gameConfig.paintArea4 = new PIXI.Graphics();
    gameConfig.paintArea4.beginFill(0x9d5002);
    gameConfig.paintArea4.drawRect(0, 0, 123, 180);
    gameConfig.paintArea4.hitArea = new PIXI.Rectangle(0, 0, 123, 180);
    gameConfig.paintArea4.x = 472;
    gameConfig.paintArea4.y = 220;
    gameContainer.addChild(gameConfig.paintArea4);
    makeButton(gameConfig.paintArea4, colorArea);
    gameConfig.paintArea4.interactive = false;
    cleanUpArray.push(gameConfig.paintArea4);

    gameConfig.paintArea5 = new PIXI.Graphics();
    gameConfig.paintArea5.beginFill(0x9d5002);
    gameConfig.paintArea5.drawRect(0, 0, 123, 180);
    gameConfig.paintArea5.hitArea = new PIXI.Rectangle(0, 0, 123, 180);
    gameConfig.paintArea5.x = 636;
    gameConfig.paintArea5.y = 220;
    gameContainer.addChild(gameConfig.paintArea5);
    makeButton(gameConfig.paintArea5, colorArea);
    gameConfig.paintArea5.interactive = false;
    cleanUpArray.push(gameConfig.paintArea5);

    gameConfig.paintArea6 = new PIXI.Graphics();
    gameConfig.paintArea6.beginFill(0x9d5002);
    gameConfig.paintArea6.drawRect(0, 0, 454, 43);
    gameConfig.paintArea6.hitArea = new PIXI.Rectangle(0, 0, 454, 43);
    gameConfig.paintArea6.x = 306;
    gameConfig.paintArea6.y = 434;
    gameContainer.addChild(gameConfig.paintArea6);
    makeButton(gameConfig.paintArea6, colorArea);
    gameConfig.paintArea6.interactive = false;
    cleanUpArray.push(gameConfig.paintArea6);


    //paint area
    gameConfig.paintArea = new PIXI.Container();
    gameContainer.addChild(gameConfig.paintArea);
    cleanUpArray.push(gameConfig.paintArea);

    gameConfig.mummyleft = new PIXI.Container();
    var mummyBG = createSprite("images/egypt/Mumie.png", 0, 0, gameLoader);
    cleanUpArray.push(mummyBG);
    gameConfig.mummyleft.addChild(mummyBG);
    gameConfig.mummyleft.scale.x = -0.8;
    gameConfig.mummyleft.scale.y = 0.8;
    gameConfig.mummyleft.x = 290;
    gameConfig.mummyleft.y = 240;
    gameContainer.addChild(gameConfig.mummyleft);
    cleanUpRemoveArray.push(gameConfig.mummyleft);

    gameConfig.mummyright = new PIXI.Container();
    mummyBG = createSprite("images/egypt/Mumie.png", 0, 0, gameLoader);
    cleanUpArray.push(mummyBG);
    gameConfig.mummyright.addChild(mummyBG);
    gameConfig.mummyright.scale.set(0.8);
    gameConfig.mummyright.x = 770;
    gameConfig.mummyright.y = 240;
    gameContainer.addChild(gameConfig.mummyright);
    cleanUpRemoveArray.push(gameConfig.mummyright);


    gamePopup = new PIXI.Container();
    gamePopup.x = 250;
    gamePopup.y = 100;
    gameContainer.addChild(gamePopup);
    cleanUpRemoveArray.push(gamePopup);

    if (isMobile || isIPad) {
        var bg = createSprite("images/egypt/egyptIntroMobileBG.png", 0, 0, gameLoader);
        gamePopup.addChild(bg);
        cleanUpArray.push(bg);

        var videoTexture = PIXI.Texture.from('images/egypt/egypt_intro1.mp4');
        cleanUpArray.push(videoTexture);
        var videoElement = videoTexture.baseTexture.resource.source;

        var videoSprite = new PIXI.Sprite(videoTexture);
        videoSprite.width = 280;
        videoSprite.height = 280;
        videoSprite.x = 240;
        videoSprite.y = 20;
        gamePopup.addChild(videoSprite);
        cleanUpRemoveArray.push(videoSprite);

        videoElement.loop = true;
        videoElement.autoPlay = true;
        videoElement.muted = true;
    } else {
        gameConfig.introVideo = document.createElement("video");
        gameConfig.introVideo.preload = "auto";
        gameConfig.introVideo.autoPlay = false;
        gameConfig.introVideo.addEventListener("playing", stopEgyptIntroVideo, false);
        gameConfig.introVideo.src = "images/egypt/egypt_intro2.mp4";
        var texture = PIXI.Texture.from(gameConfig.introVideo);
        cleanUpArray.push(texture);
        var videoSprite = new PIXI.Sprite(texture);
        videoSprite.width = 550;
        videoSprite.height = 420;
        gamePopup.addChild(videoSprite);
        cleanUpRemoveArray.push(videoSprite);

        var intro2Video = document.createElement("video");
        intro2Video.loop = true;
        intro2Video.src = "images/egypt/egypt_intro1.mp4";
        texture = PIXI.Texture.from(intro2Video);
        cleanUpArray.push(texture);
        videoSprite = new PIXI.Sprite(texture);
        videoSprite.width = 280;
        videoSprite.height = 280;
        videoSprite.x = 240;
        videoSprite.y = 20;
        gamePopup.addChild(videoSprite);
        cleanUpRemoveArray.push(videoSprite);
    }

    mayorSpeak("speak_b_egypt_welcome");

    var nextBtn = createNextBtn();
    nextBtn.x = 360;
    nextBtn.y = 330;
    nextBtn.on('pointerdown', skipEgyptIntro);
    gamePopup.addChild(nextBtn);
    cleanUpRemoveArray.push(nextBtn);

    egyptAmbientSounds();

    if (backToTimemachineBtn) {
        backToTimemachineBtn.x = 802;
        backToTimemachineBtn.y = 10;
        gameContainer.addChild(backToTimemachineBtn);
    } else {
        backToTimemachineBtn = createMC("Tids_ikon_btn_Egypt00", 2, 802, 10);
        backToTimemachineBtn.gotoAndStop(0);
        gameContainer.addChild(backToTimemachineBtn);
        makeButton(backToTimemachineBtn, exitEgypt);
    }

    gameConfig.brush = createMCGC("Pencil00", 6, 0, 0);
    gameConfig.brush.scale.set(0.5);
    gameConfig.brush.anchor.set(0.5, 0);
    gameConfig.brush.gotoAndStop(1);
    gameContainer.addChild(gameConfig.brush);
    gameConfig.brush.visible = false;
    cleanUpArray.push(gameConfig.brush);

}

function exitEgypt() {
    if (gameConfig.ambientTimer) {
        clearInterval(gameConfig.ambientTimer);
        gameConfig.ambientTimer = null;
    }
    if (gameConfig.egyptSound) {
        gameConfig.egyptSound.stop();
    }

    backToTimemachine();
}

function stopEgyptIntroVideo(e) {
    gameConfig.introVideo.pause();
}

function skipEgyptIntro() {
    if (isMobile || isIPad) {
        endEgyptIntro();
    } else {
        gamePopup.children[1].visible = false;
        gamePopup.children[2].visible = false;
        gameConfig.introVideo.removeEventListener("playing", stopEgyptIntroVideo);
        gameConfig.introVideo.play();
        gameConfig.introVideo.addEventListener("ended", endEgyptIntro, false);
    }
}

function endEgyptIntro() {
    stopMayorSpeak();
    if (isMobile || isIPad) {} else {
        gameConfig.introVideo.removeEventListener("ended", endEgyptIntro);
    }
    gamePopup.parent.removeChild(gamePopup);

    startEgyptGame();
}

function egyptAmbientSounds() {
    gameConfig.egyptSound = playSound("egypt_ambient");
    gameConfig.egyptSound.volume = 0.05;

    gameConfig.ambientTimer = setTimeout(egyptAmbientSounds, 11000);
}

function startEgyptGame() {
    gameConfig.jar1 = createMCGC("krukke_one00", 10, 280, 415);
    gameConfig.jar1.gotoAndStop(0);
    gameConfig.jar1.loop = false;
    gameContainer.addChild(gameConfig.jar1);
    cleanUpArray.push(gameConfig.jar1);
    var btn = createMCGC("Krukke2_btn instance 100", 6, 310, 600);
    btn.gotoAndStop(0);
    btn.name = "1";
    gameContainer.addChild(btn);
    btn.on("pointerover", function() {
        this.gotoAndStop(1)
    });
    btn.on("pointerout", function() {
        this.gotoAndStop(0)
    });
    makeButton(btn, openJar);
    cleanUpArray.push(btn);

    gameConfig.jar2 = createMCGC("krukke_two00", 13, 380, 413);
    gameConfig.jar2.gotoAndStop(0);
    gameConfig.jar2.loop = false;
    gameContainer.addChild(gameConfig.jar2);
    cleanUpArray.push(gameConfig.jar2);
    btn = createMCGC("Krukke2_btn instance 100", 6, 410, 610);
    btn.gotoAndStop(2);
    btn.name = "2";
    gameContainer.addChild(btn);
    btn.on("pointerover", function() {
        this.gotoAndStop(3)
    });
    btn.on("pointerout", function() {
        this.gotoAndStop(2)
    });
    makeButton(btn, openJar);
    cleanUpArray.push(btn);

    gameConfig.jar3 = createMCGC("krukke_three00", 11, 495, 430);
    gameConfig.jar3.gotoAndStop(0);
    gameConfig.jar3.loop = false;
    gameContainer.addChild(gameConfig.jar3);
    cleanUpArray.push(gameConfig.jar3);
    btn = createMCGC("Krukke2_btn instance 100", 6, 515, 620);
    btn.gotoAndStop(4);
    btn.name = "3";
    gameContainer.addChild(btn);
    btn.on("pointerover", function() {
        this.gotoAndStop(5)
    });
    btn.on("pointerout", function() {
        this.gotoAndStop(4)
    });
    makeButton(btn, openJar);
    cleanUpArray.push(btn);

    gameConfig.jar1Pos = new Array([-1, -1], [217, 14], [294, 15], [460, 13], [523, 12], [675, 12], [730, 15], [103, 78], [233, 63], [288, 70], [451, 63], [495, 73], [611, 67], [681, 61], [722, 63]);
    gameConfig.jar2Pos = new Array([-1, -1], [212, 27], [294, 5], [369, 29], [464, 34], [520, 33], [568, 24], [622, 46], [679, 16], [734, 16]);
    gameConfig.jar3Pos = new Array([-1, -1], [231, 11], [311, 11], [419, 7], [483, 10], [593, 9], [659, 11], [729, 6], [129, 70], [190, 71], [312, 62], [367, 23], [425, 64], [506, 60], [565, 62], [635, 78], [735, 60]);

    gameConfig.brushJar = createMCGC("Pensel_holder00", 2, 583, 510);
    gameConfig.brushJar.gotoAndStop(1);
    gameContainer.addChild(gameConfig.brushJar);
    cleanUpArray.push(gameConfig.brushJar);

    //color jars
    btn = new PIXI.Graphics();
    btn.beginFill(0xffffff);
    btn.drawRect(0, 0, 70, 25);
    btn.hitArea = new PIXI.Rectangle(0, 0, 70, 25);
    btn.x = 610;
    btn.y = 520;
    btn.alpha = 0;
    btn.name = "0";
    makeButton(btn, selectBrushColor);
    gameContainer.addChild(btn);
    cleanUpArray.push(btn);

    btn = new PIXI.Graphics();
    btn.beginFill(0xffffff);
    btn.drawRect(0, 0, 70, 25);
    btn.hitArea = new PIXI.Rectangle(0, 0, 70, 25);
    btn.x = 715;
    btn.y = 520;
    btn.alpha = 0;
    btn.name = "1";
    makeButton(btn, selectBrushColor);
    gameContainer.addChild(btn);
    cleanUpArray.push(btn);

    btn = new PIXI.Graphics();
    btn.beginFill(0xffffff);
    btn.drawRect(0, 0, 70, 25);
    btn.hitArea = new PIXI.Rectangle(0, 0, 70, 25);
    btn.x = 655;
    btn.y = 555;
    btn.alpha = 0;
    btn.name = "2";
    makeButton(btn, selectBrushColor);
    gameContainer.addChild(btn);
    cleanUpArray.push(btn);

    btn = new PIXI.Graphics();
    btn.beginFill(0xffffff);
    btn.drawRect(0, 0, 70, 25);
    btn.hitArea = new PIXI.Rectangle(0, 0, 70, 25);
    btn.x = 730;
    btn.y = 565;
    btn.alpha = 0;
    btn.name = "3";
    makeButton(btn, selectBrushColor);
    gameContainer.addChild(btn);
    cleanUpArray.push(btn);

    btn = new PIXI.Graphics();
    btn.beginFill(0xffffff);
    btn.drawRect(0, 0, 70, 25);
    btn.hitArea = new PIXI.Rectangle(0, 0, 70, 25);
    btn.x = 610;
    btn.y = 575;
    btn.alpha = 0;
    btn.name = "4";
    makeButton(btn, selectBrushColor);
    gameContainer.addChild(btn);
    cleanUpArray.push(btn);

    btn = new PIXI.Graphics();
    btn.beginFill(0xffffff);
    btn.drawRect(0, 0, 70, 25);
    btn.hitArea = new PIXI.Rectangle(0, 0, 70, 25);
    btn.x = 660;
    btn.y = 605;
    btn.alpha = 0;
    btn.name = "5";
    makeButton(btn, selectBrushColor);
    gameContainer.addChild(btn);
    cleanUpArray.push(btn);
}

function selectBrushColor() {
    gameConfig.isPainting = true;

    gameConfig.jar1.gotoAndStop(0);
    gameConfig.jar2.gotoAndStop(0);
    gameConfig.jar3.gotoAndStop(0);

    gameConfig.brushJar.gotoAndStop(0);

    if (this.name == "0") {
        gameConfig.color = 0x436281;
        gameConfig.brush.gotoAndStop(0);
    } else if (this.name == "1") {
        gameConfig.color = 0x669999;
        gameConfig.brush.gotoAndStop(1)
    } else if (this.name == "2") {
        gameConfig.color = 0x999144;
        gameConfig.brush.gotoAndStop(2)
    } else if (this.name == "3") {
        gameConfig.color = 0x993333;
        gameConfig.brush.gotoAndStop(3)
    } else if (this.name == "4") {
        gameConfig.color = 0xe28023;
        gameConfig.brush.gotoAndStop(4)
    } else if (this.name == "5") {
        gameConfig.color = 0xe8aa30;
        gameConfig.brush.gotoAndStop(5)
    }


    gameContainer.setChildIndex(gameConfig.brush, gameContainer.children.length - 1);
    gameConfig.brush.visible = true;

    //stage.pointermove = moveHandler;
    app.stage.hitArea = app.screen;
    app.stage.interactive = true;
    app.stage.on('pointermove', dragBrush);

    $("body").addClass("nocursor");
    for (var i = 0; i < 7; i++) {
        gameConfig["paintArea" + i].cursor = "none";
        gameConfig["paintArea" + i].interactive = true;
    }

}

function stopPainting() {
    app.stage.off('pointermove', dragBrush);
    //app.ticker.remove( dragBrush );    
    gameConfig.brush.visible = false;
    gameConfig.isPainting = false;
    $("body").removeClass("nocursor");
    for (var i = 0; i < 7; i++) {
        gameConfig["paintArea" + i].cursor = "auto";
        gameConfig["paintArea" + i].interactive = false;
    }
}

function dragBrush(event) {
    var newPosition = event.data.getLocalPosition(gameContainer);
    gameConfig.brush.x = newPosition.x;
    gameConfig.brush.y = newPosition.y;
}

function colorArea() {
    this.beginFill(gameConfig.color);
    this.drawRect(0, 0, this.width, this.height);
}

function createDecorSprite(index, jarIndex, resourceName, textureName) {
    var decorSprite = new PIXI.Sprite(gameLoader.resources[resourceName].textures[textureName]);
    decorSprite.x = gameConfig["jar" + jarIndex + "Pos"][index][0];
    decorSprite.y = gameConfig["jar" + jarIndex + "Pos"][index][1];
    if (jarIndex == "2") {
        decorSprite.scale.set(0.75);
        if (index == 8) {
            decorSprite.scale.set(0.6);
        }
    }
    decorSprite.interactive = true;
    decorSprite.name = index;
    decorSprite.jarIndex = jarIndex;
    decorSprite.resourceName = resourceName;
    decorSprite.textureName = textureName;
    decorSprite.buttonMode = true;
    decorSprite
        .on('pointerdown', onDecorDragStart)

    return decorSprite;
}

function openJar() {
    gameConfig.brushJar.gotoAndStop(1);
    stopPainting();

    //remove old decors
    for (var i = gameConfig.paintArea.children.length - 1; i >= 0; i--) {
        if (gameConfig.paintArea.getChildAt(i).y < 100) {
            gameConfig.paintArea.removeChild(gameConfig.paintArea.getChildAt(i));
        }
    }

    playSound("egypt_urne_open");
    gameConfig.jar1.gotoAndStop(0)
    gameConfig.jar2.gotoAndStop(0)
    gameConfig.jar3.gotoAndStop(0)
    gameConfig["jar" + this.name].gotoAndPlay(1);

    if (this.name == "1") {
        for (var i = 1; i < gameConfig.jar1Pos.length; i++) {
            var sheetItem = createDecorSprite(i, "1", "images/egypt/symbols_one_sheet.json", "symbols_one_" + i + "0000");
            cleanUpArray.push(sheetItem);
            gameConfig.paintArea.addChild(sheetItem);
        }

    } else if (this.name == "2") {
        for (i = 1; i < gameConfig.jar2Pos.length; i++) {
            sheetItem = createDecorSprite(i, "2", "images/egypt/Symbol_two_sheet.json", "symbol_two_" + i + "0000");
            cleanUpArray.push(sheetItem);
            gameConfig.paintArea.addChild(sheetItem);
        }

    } else {
        for (i = 1; i < gameConfig.jar3Pos.length; i++) {
            sheetItem = createDecorSprite(i, "3", "images/egypt/symbol_three_sheet.json", "symbol_three_" + i + "0000");
            cleanUpArray.push(sheetItem);
            gameConfig.paintArea.addChild(sheetItem);
        }

    }
}

function onDecorDragStart(event) {
    if (gameConfig.isPainting && this.y >= 100) {
        if (this.filters) {
            this.filters = null;
        }

        if (this.jarIndex == "1") {
            var toReplace = 0x462600;
            var replaceFactor = 0.5;
        } else if (this.jarIndex == "2") {
            toReplace = 0xa14600;
            replaceFactor = 0.1;
        } else {
            toReplace = 0x893e00;
            replaceFactor = 0.1;
        }

        var toReplaceWith = gameConfig.color;
        this.filters = [new PIXI.filters.ColorReplaceFilter(toReplace, toReplaceWith, replaceFactor)]

    } else {
        if (gameConfig.isPainting) {
            gameConfig.brushJar.gotoAndStop(1);
            stopPainting();
        }
        // store a reference to the data
        // the reason for this is because of multitouch
        // we want to track the movement of this particular touch
        this.data = event.data;
        this.dragging = true;

        if (this.y <= 100) {
            gameConfig.paintArea.addChild(createDecorSprite(this.name, this.jarIndex, this.resourceName, this.textureName));
        }

        this.parent.setChildIndex(this, this.parent.children.length - 1);

        this
            .on('pointerup', onDecorDragEnd)
            .on('pointerupoutside', onDecorDragEnd)
            .on('pointermove', onDecorDragMove);
    }
}

function onDecorDragEnd() {
    this.dragging = false;
    // set the interaction data to null
    this.data = null;

    if (this.y < 100) {
        this.parent.removeChild(this);
    }

    this
        .off('pointerup', onDecorDragEnd)
        .off('pointerupoutside', onDecorDragEnd)
        .off('pointermove', onDecorDragMove);
}

function onDecorDragMove() {
    if (this.dragging) {
        var newPosition = this.data.getLocalPosition(this.parent);
        this.x = newPosition.x;
        this.y = newPosition.y;
    }
}




//Show Rome________________________________________________________________________________________
function showRomeGame() {
    sendStatPoint("start-rome");

    gameSoundArray = new Array();

    gameContainer.removeChildren();
    if (gameLoader) {
        gameLoader.reset();
    }

    if (localTest) {
        loadRomeReseources({
            "speak_b_rome_complete": {
                "contenttype": "sound",
                "content": "dk_afslutning.mp3",
                "subtitle": "Det var du god til! Synes du ikke, at den er blevet flot? Det synes jeg, den er."
            },
            "speak_b_rome_startPuzzle": {
                "contenttype": "sound",
                "content": "dk_velkomst_og_forklaring_rom_0.mp3",
                "subtitle": "Du skal tr\u00e6kke brikkerne med musen over p\u00e5 det rigtige sted p\u00e5 tegningen. N\u00e5r du har sat alle brikkerne rigtig, er du f\u00e6rdig. Tryk p\u00e5 den gr\u00f8nne knap, n\u00e5r du er klar til at bygge."
            },
            "speak_b_rome_welcome": {
                "contenttype": "sound",
                "content": "dk_velkomst_og_forklaring_rom.mp3",
                "subtitle": "Velkommen tilbage til det gamle Rom. Her skal du hj\u00e6lpe med at bygge flotte bygninger! Du kan v\u00e6lge imellem tre forskellige bygninger - den f\u00f8rste er den nemmeste, og den sidste er den sv\u00e6reste."
            },
            "rome_ambient": {
                "contenttype": "sound",
                "content": "rome_folkemasse_ambient_1.mp3",
                "subtitle": ""
            },
            "rome_ambient_start": {
                "contenttype": "sound",
                "content": "rome_ambient_opstart.mp3",
                "subtitle": ""
            },
            "rome_brick": {
                "contenttype": "sound",
                "content": "rome_brick.mp3",
                "subtitle": ""
            },
            "rome_complete": {
                "contenttype": "sound",
                "content": "rome_complete.mp3",
                "subtitle": ""
            }
        });
    } else {
        $.ajax({
            type: 'GET',
            url: 'gameadmin/getcontent/rome.json',
            contentType: 'application/json; charset=utf-8',
            dataType: 'json',
        }).done(loadRomeReseources);
    }
}


function loadRomeReseources(data) {
    gameLoader = new PIXI.Loader();
    $.each(data, function(key, val) {
        gameLoader.add(key, "files/" + val.content);

        subtitleArray[key] = val.subtitle;

        gameSoundArray.push(key);
    })

    showPreloader();
    gameLoader.on('progress', preloadProgress);

    gameLoader.add("images/rome/RomeGameBG.png")
        .add("images/rome/NavigationScreen.png")
        .add("images/rome/puzzle1BG.png")
        .add("images/rome/puzzle2BG.png")
        .add("images/rome/puzzle3BG.png")
        .add("images/rome/puzzle1Button.json")
        .add("images/rome/puzzle2Button.json")
        .add("images/rome/puzzle3Button.json")
        .add("images/rome/puzzle1IntroAnim.json")
        .add("images/rome/puzzle2IntroAnim.json")
        .add("images/rome/puzzle3IntroAnim.json")
        .add("images/rome/puzzle1IntroBG.png")
        .add("images/rome/puzzle2IntroBG.png")
        .add("images/rome/puzzle3IntroBG.png")
        .add("images/rome/puzzle1Sheet.json")
        .add("images/rome/puzzle2Sheet.json")
        .add("images/rome/puzzle3Sheet.json")
        .add("images/rome/puzzle1End.png")
        .add("images/rome/puzzle2End.png")
        .add("images/rome/puzzle3End.png")
        .add("images/rome/romeShelf.json")
        .load(initRome);
}

function initRome(loader, resources) {
    bottomBar.y = 590;

    gameConfig = {};

    var romeBG = createSprite("images/rome/RomeGameBG.png", 40, -5, gameLoader);
    gameContainer.addChild(romeBG);
    cleanUpArray.push(romeBG);

    var navScreen = createSprite("images/rome/NavigationScreen.png", 790, 120, gameLoader);
    gameContainer.addChild(navScreen);
    cleanUpArray.push(navScreen);

    var btn = createMCGC("Puzzle1-button instance 100", 2, 835, 165);
    btn.gotoAndStop(0);
    btn.scale.set(0.5);
    btn.name = "1";
    btn.on("pointerover", function() {
        this.gotoAndStop(1)
    });
    btn.on("pointerout", function() {
        this.gotoAndStop(0)
    });
    makeButton(btn, openPuzzle);
    gameContainer.addChild(btn);
    cleanUpArray.push(btn);

    btn = createMCGC("Puzzle2-button instance 100", 2, 817, 282);
    btn.gotoAndStop(0);
    btn.scale.set(0.5);
    btn.name = "2";
    btn.on("pointerover", function() {
        this.gotoAndStop(1)
    });
    btn.on("pointerout", function() {
        this.gotoAndStop(0)
    });
    makeButton(btn, openPuzzle);
    gameContainer.addChild(btn);
    cleanUpArray.push(btn);

    btn = createMCGC("Puzzle3-button instance 100", 2, 835, 400);
    btn.gotoAndStop(0);
    btn.scale.set(0.5);
    btn.name = "3";
    btn.on("pointerover", function() {
        this.gotoAndStop(1)
    });
    btn.on("pointerout", function() {
        this.gotoAndStop(0)
    });
    makeButton(btn, openPuzzle);
    gameContainer.addChild(btn);
    cleanUpArray.push(btn);


    gameConfig.btn1 = createMCGC("Puzzle1-button instance 100", 2, 180, 80);
    gameConfig.btn1.gotoAndStop(0);
    gameConfig.btn1.name = "1";
    gameConfig.btn1.on("pointerover", function() {
        this.gotoAndStop(1)
    });
    gameConfig.btn1.on("pointerout", function() {
        this.gotoAndStop(0)
    });
    makeButton(gameConfig.btn1, openPuzzle);
    gameContainer.addChild(gameConfig.btn1);
    cleanUpArray.push(gameConfig.btn1);

    gameConfig.btn2 = createMCGC("Puzzle2-button instance 100", 2, 480, 150);
    gameConfig.btn2.gotoAndStop(0);
    gameConfig.btn2.name = "2";
    gameConfig.btn2.on("pointerover", function() {
        this.gotoAndStop(1)
    });
    gameConfig.btn2.on("pointerout", function() {
        this.gotoAndStop(0)
    });
    makeButton(gameConfig.btn2, openPuzzle);
    gameContainer.addChild(gameConfig.btn2);
    cleanUpArray.push(gameConfig.btn2);

    gameConfig.btn3 = createMCGC("Puzzle3-button instance 100", 2, 270, 400);
    gameConfig.btn3.gotoAndStop(0);
    gameConfig.btn3.name = "3";
    gameConfig.btn3.on("pointerover", function() {
        this.gotoAndStop(1)
    });
    gameConfig.btn3.on("pointerout", function() {
        this.gotoAndStop(0)
    });
    makeButton(gameConfig.btn3, openPuzzle);
    gameContainer.addChild(gameConfig.btn3);
    cleanUpArray.push(gameConfig.btn3);

    gameConfig.puzzleContainer = new PIXI.Container();
    gameContainer.addChild(gameConfig.puzzleContainer);

    mayorSpeak("speak_b_rome_welcome");

    romeAmbientSounds();

    gameConfig.pieces1 = new Array([311, 144], [504, 144], [276, 206], [314, 214], [499, 230], [283, 350], [321, 351], [499, 351]);
    gameConfig.pieces1Init = new Array([202, 21], [536, 525], [142, 141], [514, 6], [101, 298], [438, 523], [94, 207], [187, 492]);

    gameConfig.pieces2 = new Array([615, 157], [280, 286], [407, 279], [508, 279], [587, 281], [280, 368], [372, 375], [455, 370], [557, 355], [291, 149], [408, 138], [507, 138], [284, 229], [368, 207], [458, 203], [553, 207]);
    gameConfig.pieces2Init = new Array([114, 11], [649, 514], [142, 141], [597, 5], [146, 356], [508, 536], [110, 246], [175, 444], [180, 9], [449, -5], [721, 155], [725, 66], [321, 18], [388, 576], [287, 546], [735, 413]);

    gameConfig.pieces3 = new Array([404, 278], [310, 309], [405, 313], [287, 349], [344, 349], [405, 348], [406, 377], [602, 237], [621, 368], [587, 369], [294, 149], [510, 245], [593, 216], [502, 307], [498, 359], [547, 355], [349, 185], [487, 182], [532, 133], [596, 174], [303, 234], [350, 231], [403, 226]);
    gameConfig.pieces3Init = new Array([270, 21], [536, 525], [107, 20], [724, 27], [175, 103], [438, 523], [98, 77], [187, 492], [344, 8], [583, 1], [358, 525], [270, 523], [98, 320], [438, 594], [641, 520], [718, 505], [411, 23], [111, 164], [162, 210], [723, 159], [179, 346], [167, 437], [175, 17]);

    if (backToTimemachineBtn) {
        backToTimemachineBtn.x = 780;
        backToTimemachineBtn.y = 10;
        gameContainer.addChild(backToTimemachineBtn);
    } else {
        backToTimemachineBtn = createMC("Tids_ikon_btn_Egypt00", 2, 780, 10);
        backToTimemachineBtn.gotoAndStop(0);
        gameContainer.addChild(backToTimemachineBtn);
        makeButton(backToTimemachineBtn, exitRome);
    }
}

function exitRome() {
    if (gameConfig.ambientTimer) {
        clearInterval(gameConfig.ambientTimer);
        gameConfig.ambientTimer = null;
    }

    if (gameConfig.romeSound) {
        gameConfig.romeSound.stop();
    }

    backToTimemachine();
}

function romeAmbientSounds() {
    if (Math.random() < 0.5) {
        gameConfig.romeSound = playSound("rome_ambient");
    } else {
        gameConfig.romeSound = playSound("rome_ambient_start");
    }
    gameConfig.romeSound.volume = 0.1;

    gameConfig.ambientTimer = setTimeout(romeAmbientSounds, 18000);
}

function openPuzzle() {
    gameConfig.btn1.visible = false;
    gameConfig.btn2.visible = false;
    gameConfig.btn3.visible = false;

    gameConfig.currentPuzzle = this.name;
    stopMayorSpeak();
    gameContainer.removeChild(gamePopup);

    gamePopup = new PIXI.Container();
    gamePopup.x = 250;
    gamePopup.y = 100;
    gameContainer.addChild(gamePopup);
    cleanUpRemoveArray.push(gamePopup);

    var introBG = createSprite("images/rome/puzzle" + this.name + "IntroBG.png", 0, 0, gameLoader);
    gamePopup.addChild(introBG);
    cleanUpArray.push(introBG);

    if (this.name == "1") {
        var introAnim = createMCGC("Start_puzzle00", 93, 132, 144);
    } else if (this.name == "2") {
        introAnim = createMCGC("Start_puzzle200", 93, 108, 144);
    } else {
        introAnim = createMCGC("Start_puzzle300", 93, 115, 144);
    }
    gamePopup.addChild(introAnim);
    cleanUpArray.push(introAnim);

    mayorSpeak("speak_b_rome_startPuzzle");

    var nextBtn = createNextBtn();
    nextBtn.x = 360;
    nextBtn.y = 330;
    nextBtn.on('pointerdown', endPuzzleIntro);
    gamePopup.addChild(nextBtn);
    cleanUpRemoveArray.push(nextBtn);
}

function endPuzzleIntro() {
    stopMayorSpeak();

    gameContainer.removeChild(gamePopup);

    startPuzzle();

}

function startPuzzle() {
    var puzzleBG = createSprite("images/rome/puzzle" + gameConfig.currentPuzzle + "BG.png", 250, 100, gameLoader);
    gameConfig.puzzleContainer.addChild(puzzleBG);
    cleanUpArray.push(puzzleBG);

    gameConfig.piecesArray = new Array();

    if (gameConfig.currentPuzzle == "1") {
        for (var i = 0; i < gameConfig.pieces1.length; i++) {
            var piece = new PIXI.Sprite(gameLoader.resources["images/rome/puzzle1Sheet.json"].textures["P" + (i + 1) + "0000"]);
            piece.scale.set(1.15);
            piece.x = gameConfig.pieces1Init[i][0];
            piece.y = gameConfig.pieces1Init[i][1];
            piece.interactive = true;
            piece.name = i;
            piece.inPlace = false;
            piece.buttonMode = true;
            piece
                .on('pointerdown', onPieceDragStart)


            gameConfig.puzzleContainer.addChild(piece);
            cleanUpArray.push(piece);
            gameConfig.piecesArray.push(piece);
        }

    } else if (gameConfig.currentPuzzle == "2") {
        for (var i = 0; i < gameConfig.pieces2.length; i++) {
            var piece = new PIXI.Sprite(gameLoader.resources["images/rome/puzzle2Sheet.json"].textures["C" + (i + 1) + "0000"]);
            piece.scale.set(0.85);
            piece.x = gameConfig.pieces2Init[i][0];
            piece.y = gameConfig.pieces2Init[i][1];
            piece.interactive = true;
            piece.name = i;
            piece.inPlace = false;
            piece.buttonMode = true;
            piece
                .on('pointerdown', onPieceDragStart)


            gameConfig.puzzleContainer.addChild(piece);
            cleanUpArray.push(piece);
            gameConfig.piecesArray.push(piece);
        }

    } else {
        for (var i = 0; i < gameConfig.pieces3.length; i++) {
            var piece = new PIXI.Sprite(gameLoader.resources["images/rome/puzzle3Sheet.json"].textures["R" + (i + 1) + "_Rome0000"]);
            piece.x = gameConfig.pieces3Init[i][0];
            piece.y = gameConfig.pieces3Init[i][1];
            piece.interactive = true;
            piece.name = i;
            piece.inPlace = false;
            piece.buttonMode = true;
            piece
                .on('pointerdown', onPieceDragStart)


            gameConfig.puzzleContainer.addChild(piece);
            cleanUpArray.push(piece);
            gameConfig.piecesArray.push(piece);
        }

    }


}



function onPieceDragStart(event) {
    // store a reference to the data
    // the reason for this is because of multitouch
    // we want to track the movement of this particular touch
    this.data = event.data;
    this.dragging = true;
    this.inPlace = false;

    this.parent.setChildIndex(this, this.parent.children.length - 1);

    this
        .on('pointerup', onPieceDragEnd)
        .on('pointerupoutside', onPieceDragEnd)
        .on('pointermove', onPieceDragMove);
}

function onPieceDragEnd() {
    if (this.dragging) {
        var newPosition = this.data.getLocalPosition(this.parent);
        this.x = newPosition.x;
        this.y = newPosition.y;
        var targetX = gameConfig["pieces" + gameConfig.currentPuzzle][this.name][0];
        var targetY = gameConfig["pieces" + gameConfig.currentPuzzle][this.name][1];

        if ((this.x < targetX + 10 && this.x > targetX - 10) && (this.y < targetY + 10 && this.y > targetY - 10)) {
            this.x = targetX;
            this.y = targetY;
            this.inPlace = true;

            playSound("rome_brick", gameLoader);
        }
    }

    this.dragging = false;
    // set the interaction data to null
    this.data = null;

    this
        .off('pointerup', onPieceDragEnd)
        .off('pointerupoutside', onPieceDragEnd)
        .off('pointermove', onPieceDragMove);

    var finished = true;
    for (var i = 1; i < gameConfig.puzzleContainer.children.length; i++) {
        if (!gameConfig.puzzleContainer.children[i].inPlace) {
            finished = false;
            break;
        }

    }

    if (finished) {
        puzzleFinished();
    }
}

function onPieceDragMove() {
    if (this.dragging) {
        var newPosition = this.data.getLocalPosition(this.parent);
        this.x = newPosition.x;
        this.y = newPosition.y;
    }



}

function puzzleFinished() {
    //console.log("puzzle finished");
    gameConfig.puzzleContainer.removeChildren();

    gamePopup = new PIXI.Container();
    gamePopup.x = 250;
    gamePopup.y = 100;
    gameContainer.addChild(gamePopup);
    cleanUpRemoveArray.push(gamePopup);

    var endBG = createSprite("images/rome/puzzle" + gameConfig.currentPuzzle + "End.png", 0, 0, gameLoader);
    gamePopup.addChild(endBG);
    cleanUpArray.push(endBG);

    var endAnim = createMCGC("M2_Rom_puf00", 20, 120, 125);
    endAnim.loop = false;
    gamePopup.addChild(endAnim);
    cleanUpArray.push(endAnim);

    playSound("rome_complete", gameLoader);
    mayorSpeak("speak_b_rome_complete");
}



//RIDDER GAME______________________________________________________------------------------
function showKnightGame() {
    sendStatPoint("start-knight");
    //clearInterval(universeAmbientSoundsInterval);
    //universeAmbientSoundsInterval = null;

    gameSoundArray = new Array();

    gameContainer.removeChildren();
    if (gameLoader) {
        gameLoader.reset();
    }


    if (localTest) {
        loadRidderReseources({
            "speak_b_ridder_complete": {
                "contenttype": "sound",
                "content": "game_over_1.mp3",
                "subtitle": "Det er du god til! Pr\u00f8v igen for at se, om du kan g\u00f8re det bedre."
            },
            "speak_b_ridder_welcome": {
                "contenttype": "sound",
                "content": "velkommen_ridder_se.mp3",
                "subtitle": "Nu har du rejst tilbage til middelalderen, og her skal du bruge en armbr\u00f8st for at skyde pile efter en m\u00e5lskive. Du skal trykke p\u00e5 de brune pile p\u00e5 armbr\u00f8sten for at bestemme, hvilken retning du vil skyde. Og du skal ogs\u00e5 indstille hvor h\u00e5rdt. N\u00e5r du tror, at du vil skyde h\u00e5rdt nok og i den rigtige retning til at ramme m\u00e5lskiven, skal du trykke p\u00e5 den gr\u00f8nne knap for at skyde. Pr\u00f8v og se, hvor mange point du kan f\u00e5! Tryk p\u00e5 den gr\u00f8nne knap for at g\u00e5 i gang!"
            },
            "ridder_hit": {
                "contenttype": "sound",
                "content": "Bue_rammer.mp3",
                "subtitle": ""
            },
            "ridder_miss": {
                "contenttype": "sound",
                "content": "Bue_misser.mp3",
                "subtitle": ""
            },
            "ridder_shoot": {
                "contenttype": "sound",
                "content": "bue_bliver_skudt.mp3",
                "subtitle": ""
            }
        });
    } else {
        $.ajax({
            type: 'GET',
            url: 'gameadmin/getcontent/knight.json',
            contentType: 'application/json; charset=utf-8',
            dataType: 'json',
        }).done(loadRidderReseources);
    }
}


function loadRidderReseources(data) {
    gameLoader = new PIXI.Loader();
    $.each(data, function(key, val) {
        gameLoader.add(key, "files/" + val.content);

        subtitleArray[key] = val.subtitle;

        gameSoundArray.push(key);
    })

    showPreloader();
    gameLoader.on('progress', preloadProgress);

    gameLoader.add("images/ridder/arrowBtns.json")
        .add("images/ridder/bundBar_arrows.json")
        .add("images/ridder/Bundbar_aaben.png")
        .add("images/ridder/Ridder_outro.png")
        .add("images/ridder/crossbow.json")
        .add("images/ridder/hit_screen.png")
        .add("images/ridder/playAgainBtn.png")
        .add("images/ridder/RidderGameBG1.png")
        .add("images/ridder/RidderGameBG2.png")
        .add("images/ridder/RidderGameBG3.png")
        .add("images/ridder/room_anim.json")
        .add("images/ridder/shootBtn.json")
        .add("images/ridder/Start_ridderBG.png")
        .add("images/ridder/target.json")
        .load(initRidder);
}

function initRidder(loader, resources) {
    bottomBar.y = 590;

    gameConfig = {};
    gameConfig.userScore = 0;

    gameConfig.gameBG = new PIXI.Container();
    gameConfig.gameBG.addChild(createSprite("images/ridder/RidderGameBG1.png", -50, -2, gameLoader));
    gameContainer.addChild(gameConfig.gameBG);
    cleanUpArray.push(gameConfig.gameBG);

    gameConfig.playArea = new PIXI.Container()
    gameContainer.addChild(gameConfig.playArea);
    cleanUpRemoveArray.push(gameConfig.playArea);

    var bundBarBG = createSprite("images/ridder/Bundbar_aaben.png", -10, 535, gameLoader);
    gameContainer.addChild(bundBarBG);
    cleanUpArray.push(bundBarBG);

    gameConfig.quiver = createMCGC("Pile_samlet00", 4, 255, 620);
    gameConfig.quiver.gotoAndStop(0);
    gameContainer.addChild(gameConfig.quiver);
    cleanUpArray.push(gameConfig.quiver);

    gameConfig.scoreTF = new PIXI.Text("0", ridderScoreLabelStyle);
    gameConfig.scoreTF.x = 488;
    gameConfig.scoreTF.y = 643;
    gameContainer.addChild(gameConfig.scoreTF);
    cleanUpArray.push(gameConfig.scoreTF);

    mayorSpeak("speak_b_ridder_welcome");

    gamePopup = new PIXI.Container();
    gamePopup.x = 250;
    gamePopup.y = 100;
    gameContainer.addChild(gamePopup);
    cleanUpRemoveArray.push(gamePopup);

    var popupBG = createSprite("images/ridder/Start_ridderBG.png", 0, 0, gameLoader);
    gamePopup.addChild(popupBG);
    cleanUpArray.push(popupBG);

    var videoTexture = PIXI.Texture.from('images/ridder/introAnim.mp4');
    cleanUpArray.push(videoTexture);
    var videoElement = videoTexture.baseTexture.resource.source;

    var videoSprite = new PIXI.Sprite(videoTexture);
    videoSprite.width = 303;
    videoSprite.height = 320;
    videoSprite.x = 220;
    videoSprite.y = 20;
    gamePopup.addChild(videoSprite);
    cleanUpRemoveArray.push(videoSprite);

    videoElement.loop = true;
    videoElement.autoPlay = true;
    videoElement.muted = true;

    var nextBtn = createNextBtn();
    nextBtn.x = 360;
    nextBtn.y = 330;
    nextBtn.on('pointerdown', skipRidderIntro);
    gamePopup.addChild(nextBtn);
    cleanUpRemoveArray.push(nextBtn);

    //ridderAmbientSounds();

    if (backToTimemachineBtn) {
        backToTimemachineBtn.x = 802;
        backToTimemachineBtn.y = 10;
        gameContainer.addChild(backToTimemachineBtn);
    } else {
        backToTimemachineBtn = createMC("Tids_ikon_btn_Egypt00", 2, 802, 10);
        backToTimemachineBtn.gotoAndStop(0);
        gameContainer.addChild(backToTimemachineBtn);
        makeButton(backToTimemachineBtn, exitRidder);
    }
}

function exitRidder() {
    backToTimemachine();
}


function skipRidderIntro() {
    stopMayorSpeak();
    gamePopup.parent.removeChild(gamePopup);

    setupRidderGame();
}

function ridderAmbientSounds() {
    //playSound("");

    //gameConfig.ambientTimer = setTimeout(ridderAmbientSounds, 11000);
}

function setupRidderGame() {
    gameConfig.target = createMCGC("Skydeskive_maal00", 7, 100, 300);
    gameConfig.target.scale.set(0.15);
    gameConfig.target.gotoAndStop(0);
    gameConfig.playArea.addChild(gameConfig.target);
    cleanUpArray.push(gameConfig.target);

    gameConfig.bow = createMCGC("Armbroest00", 10, 500, 600);
    gameConfig.bow.loop = false;
    gameConfig.bow.onFrameChange = function() {
        if (this.currentFrame == 0) {
            this.gotoAndStop(0);
        }
    }
    gameConfig.bow.scale.set(0.75);
    gameConfig.bow.anchor.set(0.5, 0.95);
    gameConfig.bow.gotoAndStop(0);
    gameConfig.bow.power = 0;
    gameConfig.playArea.addChild(gameConfig.bow);
    cleanUpArray.push(gameConfig.bow);

    gameConfig.downBtn = createMCGC("arrow_", 4, 455, 590);
    gameConfig.downBtn.gotoAndStop(0);
    gameConfig.downBtn.name = "down";
    makeButton(gameConfig.downBtn, moveBow);
    gameConfig.playArea.addChild(gameConfig.downBtn);
    cleanUpArray.push(gameConfig.downBtn);

    gameConfig.leftBtn = createMCGC("arrow_", 4, 250, 500);
    gameConfig.leftBtn.gotoAndStop(1);
    gameConfig.leftBtn.name = "left";
    makeButton(gameConfig.leftBtn, moveBow);
    gameConfig.leftBtn.on("pointerdown", startRotationLeft);
    gameConfig.leftBtn.on("pointerup", endRotationLeft);
    gameConfig.leftBtn.on("pointerupoutside", endRotationLeft);
    gameConfig.playArea.addChild(gameConfig.leftBtn);
    cleanUpArray.push(gameConfig.leftBtn);

    gameConfig.upBtn = createMCGC("arrow_", 4, 505, 590);
    gameConfig.upBtn.gotoAndStop(3);
    gameConfig.upBtn.name = "up";
    makeButton(gameConfig.upBtn, moveBow);
    gameConfig.playArea.addChild(gameConfig.upBtn);
    cleanUpArray.push(gameConfig.upBtn);

    gameConfig.rightBtn = createMCGC("arrow_", 4, 700, 500);
    gameConfig.rightBtn.gotoAndStop(2);
    gameConfig.rightBtn.name = "right";
    makeButton(gameConfig.rightBtn, moveBow);
    gameConfig.rightBtn.on("pointerdown", startRotationRight);
    gameConfig.rightBtn.on("pointerup", endRotationRight);
    gameConfig.rightBtn.on("pointerupoutside", endRotationRight);
    gameConfig.playArea.addChild(gameConfig.rightBtn);
    cleanUpArray.push(gameConfig.rightBtn);

    gameConfig.shootBtn = createMCGC("Skyd_btn00", 2, 480, 420);
    gameConfig.shootBtn.gotoAndStop(0);
    makeButton(gameConfig.shootBtn, shootBow);
    gameConfig.shootBtn.on('pointerover', function() {
        this.gotoAndStop(1);
    });
    gameConfig.shootBtn.on('pointerout', function() {
        this.gotoAndStop(0);
    });
    gameConfig.playArea.addChild(gameConfig.shootBtn);
    cleanUpArray.push(gameConfig.shootBtn);

    startRidderGame();
}

function startRidderGame() {
    gameConfig.level = 1;
    gameConfig.arrow = 1;
    gameConfig.target.x = Math.round(100 + Math.random() * 780);
    gameConfig.target.scale.set(0.15);
    gameConfig.target.y = 300;
    gameConfig.userScore = 0;
}

function moveBow() {
    if (this.name == "up") {
        var nextFrame = gameConfig.bow.currentFrame - 1;
        if (nextFrame <= 0) {
            nextFrame = 0;
        }
        gameConfig.bow.gotoAndStop(nextFrame);
        gameConfig.bow.power = nextFrame;
    } else if (this.name == "down") {
        nextFrame = gameConfig.bow.currentFrame + 1;
        if (nextFrame >= 3) {
            nextFrame = 3;
        }
        gameConfig.bow.gotoAndStop(nextFrame);
        gameConfig.bow.power = nextFrame;
    } else if (this.name == "left") {
        //gameConfig.bow.rotation -= 0.0174533;
    } else if (this.name == "right") {
        //gameConfig.bow.rotation += 0.0174533;
    }

}

function startRotationLeft() {
    app.ticker.add(
        rotateBowLeft
    );
}

function endRotationLeft() {
    app.ticker.remove(
        rotateBowLeft
    );
}

function rotateBowLeft() {
    gameConfig.bow.rotation -= 0.0174533;
    if (gameConfig.bow.rotation < -1.27) {
        gameConfig.bow.rotation = -1.27
    }
}

function startRotationRight() {
    app.ticker.add(
        rotateBowRight
    );
}

function endRotationRight() {
    app.ticker.remove(
        rotateBowRight
    );
}

function rotateBowRight() {
    gameConfig.bow.rotation += 0.0174533;
    if (gameConfig.bow.rotation > 1.27) {
        gameConfig.bow.rotation = 1.27
    }
}

function shootBow() {
    playSound("ridder_shoot");
    gameConfig.bow.gotoAndPlay(4);

    setTimeout(showHitScreen, 400);
}

function showHitScreen() {
    var b = (gameConfig.bow.y - (gameConfig.target.y + (gameConfig.target.width / 2)));
    var a = Math.abs((gameConfig.target.x + (gameConfig.target.width / 2)) - gameConfig.bow.x);
    var c = Math.sqrt(Math.pow(a, 2) + Math.pow(b, 2));

    var win_angle = Math.acos(b / c) * (180 / Math.PI);

    if (gameConfig.target.x < 454) {
        win_angle = win_angle * (-1);
    } else {

    }

    var precision = Math.abs(win_angle - gameConfig.bow.rotation * (180 / Math.PI));


    var hit_factor = Math.round(precision + 0.25);
    var power_failure = Math.abs(gameConfig.bow.power - (gameConfig.level - 1)) * 4;
    hit_factor += power_failure;
    hit_factor = Math.min(7, hit_factor + 1);
    hit_factor = Math.max(2, hit_factor);
    //skive.gotoAndStop(hit_factor);

    if (hit_factor == 7) {
        playSound("ridder_miss");

        //alpha animate target

    } else {
        playSound("ridder_hit");
    }
    if (hit_factor <= 2) {
        gameConfig.userScore += 50;
    } else if (hit_factor == 3) {
        gameConfig.userScore += 25;
    } else if (hit_factor == 4) {
        gameConfig.userScore += 10;
    } else if (hit_factor == 5) {
        gameConfig.userScore += 5;
    } else if (hit_factor == 6) {
        gameConfig.userScore += 1;
    } else {

    }

    gameConfig.scoreTF.text = gameConfig.userScore;

    if (gameConfig.hitScreen) {

    } else {
        gameConfig.hitScreen = new PIXI.Container();
        var hitscreenSprite = createSprite("images/ridder/hit_screen.png", 0, 0, gameLoader);
        cleanUpArray.push(hitscreenSprite);
        gameConfig.hitScreen.addChild(hitscreenSprite);
        var hitscreenTarget = createMCGC("Skydeskive_maal00", 7, 200, 50);
        gameConfig.hitScreen.addChild(hitscreenTarget);
        cleanUpRemoveArray.push(gameConfig.hitScreen);
    }
    gameContainer.addChild(gameConfig.hitScreen);
    gameConfig.hitScreen.children[1].gotoAndStop(hit_factor - 1);

    setTimeout(removeHitScreen, 2000);

}

function removeHitScreen() {
    gameContainer.removeChild(gameConfig.hitScreen);

    nextArrow();
}

function nextArrow() {
    gameConfig.arrow++;
    if (gameConfig.arrow > 3) {
        gameConfig.arrow = 1;
        gameConfig.level++;
        if (gameConfig.level > 3) {
            ridderGameOver();
        }
    }
    gameConfig.quiver.gotoAndStop(gameConfig.arrow - 1);

    gameConfig.bow.rotation = 0;
    gameConfig.bow.gotoAndStop(0);
    gameConfig.bow.power = 0;

    if (gameConfig.level == 1) {
        gameConfig.target.scale.set(0.15);
        gameConfig.target.x = Math.round(100 + Math.random() * 780);
        gameConfig.target.y = 300;

    } else if (gameConfig.level == 2) {
        var gameBG = createSprite("images/ridder/RidderGameBG2.png", -50, -2, gameLoader);
        gameConfig.gameBG.addChild(gameBG);
        cleanUpArray.push(gameBG);

        gameConfig.target.scale.set(0.11);
        gameConfig.target.x = Math.round(100 + Math.random() * 780);
        gameConfig.target.y = 260;

    } else {
        gameBG = createSprite("images/ridder/RidderGameBG3.png", 0, -2, gameLoader);
        gameConfig.gameBG.addChild(gameBG);
        cleanUpArray.push(gameBG);

        gameConfig.target.scale.set(0.07);
        gameConfig.target.x = Math.round(100 + Math.random() * 780);
        gameConfig.target.y = 280;
    }
}

function ridderGameOver() {
    gameConfig.quiver.gotoAndStop(3);

    gameConfig.shootBtn.interactive = gameConfig.rightBtn.interactive = gameConfig.leftBtn.interactive = gameConfig.upBtn.interactive = gameConfig.downBtn.interactive = false;

    mayorSpeak("speak_b_ridder_complete");

    gamePopup = new PIXI.Container();
    gamePopup.x = 250;
    gamePopup.y = 100;
    gameContainer.addChild(gamePopup);
    cleanUpRemoveArray.push(gamePopup);

    var endBG = createSprite("images/ridder/Ridder_outro.png", 0, 0, gameLoader);
    gamePopup.addChild(endBG);
    cleanUpArray.push(endBG);

    var endAnim = createMCGC("M2_Ridder_puf00", 20, 110, 60);
    endAnim.loop = false;
    gamePopup.addChild(endAnim);
    cleanUpArray.push(endAnim);

    var scoreTF = new PIXI.Text(gameConfig.userScore, ridderScoreLabelStyle);
    scoreTF.x = 125;
    scoreTF.y = 345;
    gamePopup.addChild(scoreTF);
    cleanUpArray.push(scoreTF);

    var nextBtn = createNextBtn();
    nextBtn.x = 300;
    nextBtn.y = 310;
    nextBtn.on('pointerdown', restartRidderGame);
    gamePopup.addChild(nextBtn);
    cleanUpRemoveArray.push(nextBtn);
}

function restartRidderGame() {
    gamePopup.parent.removeChild(gamePopup);

    var ridderGameBG = createSprite("images/ridder/RidderGameBG1.png", -50, -2, gameLoader);
    cleanUpArray.push(ridderGameBG);
    gameConfig.gameBG.addChild(ridderGameBG);
    gameConfig.shootBtn.interactive = gameConfig.rightBtn.interactive = gameConfig.leftBtn.interactive = gameConfig.upBtn.interactive = gameConfig.downBtn.interactive = true;
    startRidderGame();
}




function backToTimemachine() {
    sendStatPoint("end-game-start-timemachine");
    TweenMax.killAll();

    if (gameConfig.keyBackground) {
        frontGround.removeChild(gameConfig.keyBackground);
        frontGround.removeChild(gameConfig.mobileLeftBtn);
        frontGround.removeChild(gameConfig.mobileRightBtn);
        frontGround.removeChild(gameConfig.mobileUpBtn);
        frontGround.removeChild(gameConfig.mobileDownBtn);

        gameConfig.keyBackground = null;
        gameConfig.mobileDownBtn = null;
        gameConfig.mobileUpBtn = null;
        gameConfig.mobileLeftBtn = null;
        gameConfig.mobileRightBtn = null;

    }
    if (gameConfig.dinoTimer) {
        clearInterval(gameConfig.dinoTimer);
    }

    if (gamePopup) {
        gamePopup.children[1].onFrameChange = null;
    }

    if (gameConfig.ambientTimer) {
        clearInterval(gameConfig.ambientTimer);
        gameConfig.ambientTimer = null;
    }

    if (gameConfig.playingSound) {
        gameConfig.playingSound.stop();
    }

    if (gameLoader) {
        gameLoader.reset();
    }

    cleanup();

    if (gameSoundArray && gameSoundArray.length > 0) {
        for (var i = 0; i < gameSoundArray.length; i++) {
            if (PIXI.sound.exists(gameSoundArray[i])) {
                PIXI.sound.remove(gameSoundArray[i]);
            }
        }
        gameSoundArray = new Array();
    }

    gameConfig = {};
    gameContainer.removeChildren();


    showTimeMachine();
}




//APPLE GAME---------------------------------------------------------------------------------
function showAppleGame() {
    sendStatPoint("start-apple");
    stopMayorSpeak();

    gameContainer.removeChildren();
    if (gameLoader) {
        gameLoader.reset();
    }
    gameSoundArray = new Array();

    if (localTest) {
        loadAppleResources({
            "speak_b_apple_done": {
                "contenttype": "sound",
                "content": "dk_afslutning_game_over.mp3",
                "subtitle": "Sikke en masse god juice du fik lavet! Men du tabte tre \u00e6bler p\u00e5 jorden. Du kan pr\u00f8ve igen, hvis du gerne vil tjene flere penge! Har du penge nok, kan du rejse en tur med Tidsmaskinen. Det kan ogs\u00e5 v\u00e6re, at der er kommet nogle flere ting i Karens butik, du kunne t\u00e6nke dig?"
            },
            "speak_b_apple_done_no_money": {
                "contenttype": "sound",
                "content": "dk_afslutning_game_over_no_apples.mp3",
                "subtitle": "Du tabte tre \u00e6bler p\u00e5 jorden. Du kan pr\u00f8ve igen, hvis du gerne vil tjene flere penge! Har du penge nok, kan du rejse en tur med Tidsmaskinen. Det kan ogs\u00e5 v\u00e6re, at der er kommet nogle flere ting i Karens butik, du kunne t\u00e6nke dig?"
            },
            "speak_b_apple_nextlevel_1": {
                "contenttype": "sound",
                "content": "dk_naeste_niveau_1.mp3",
                "subtitle": "Det var du god til! Nu g\u00e5r det lidt hurtigere."
            },
            "speak_b_apple_nextlevel_2": {
                "contenttype": "sound",
                "content": "dk_naeste_niveau_2.mp3",
                "subtitle": "Godt g\u00e5et! Nu g\u00e5r det endnu hurtigere."
            },
            "speak_b_apple_nextlevel_3": {
                "contenttype": "sound",
                "content": "dk_naeste_niveau_3.mp3",
                "subtitle": "Det var flot! Nu bliver det lidt sv\u00e6rere."
            },
            "speak_b_apple_nextlevel_4": {
                "contenttype": "sound",
                "content": "dk_naeste_niveau_4.mp3",
                "subtitle": "Hvor er du skrap! Kan du ogs\u00e5 klare n\u00e6ste omgang?"
            },
            "speak_b_apple_welcome": {
                "contenttype": "sound",
                "content": "dk_velkomst_og_forklaring_aeblebod.mp3",
                "subtitle": "Velkommen til din \u00e6blebod. Her kan du tjene penge ved at lave \u00e6blejuice til folkene i Pengeby. Du skal fange \u00e6blerne, der falder ned fra det store \u00e6bletr\u00e6, inden de rammer jorden. Du m\u00e5 ikke tabe mere end tre \u00e6bler p\u00e5 jorden. Du skal bruge piletasterne p\u00e5 computeren for at l\u00f8be frem og tilbage. Hver gang du har samlet 10 \u00e6bler, tjener du penge. Er du klar til at se, hvor mange \u00e6bler du kan samle? S\u00e5 tryk p\u00e5 den gr\u00f8nne knap."
            },
            "apple_apple_caught": {
                "contenttype": "sound",
                "content": "apple_apple_fanges_i_kurven.mp3",
                "subtitle": ""
            },
            "apple_apple_dropped": {
                "contenttype": "sound",
                "content": "apple_apple_falder_til_jorden_.mp3",
                "subtitle": ""
            },
            "apple_juice_sound": {
                "contenttype": "sound",
                "content": "apple_juice_maskine.mp3",
                "subtitle": ""
            },
            "apple_step_left": {
                "contenttype": "sound",
                "content": "apple_skridt_til_venstre.mp3",
                "subtitle": ""
            }
        });
    } else {
        $.ajax({
            type: 'GET',
            url: 'gameadmin/getcontent/apple.json',
            contentType: 'application/json; charset=utf-8',
            dataType: 'json',
        }).done(loadAppleResources);
    }

}



function loadAppleResources(data) {
    gameLoader = new PIXI.Loader();

    $.each(data, function(key, val) {
        gameLoader.add(key, "files/" + val.content);

        subtitleArray[key] = val.subtitle;

        gameSoundArray.push(key);
    })

    showPreloader();
    gameLoader.on('progress', preloadProgress);

    gameLoader.add("images/applegame/Baggrund.png");
    gameLoader.add("images/applegame/forground.png");
    gameLoader.add("images/applegame/Start_aeble.png");
    gameLoader.add("images/applegame/Bundbar_aaben.png");
    gameLoader.add("images/applegame/Bundbar_aaben_extension.png");
    gameLoader.add("images/applegame/gameover-won.png");
    gameLoader.add("images/applegame/gameover_lost_bg.png");
    gameLoader.add("images/applegame/gameover_applefall.json");
    gameLoader.add("images/applegame/spilinfo_chr.json");
    gameLoader.add("images/applegame/keys.json");
    gameLoader.add("images/applegame/basket.json");
    gameLoader.add("images/applegame/character.json");
    gameLoader.add("images/applegame/apple.json")
    gameLoader.add("images/applegame/mobileLeftBtn.png")
    gameLoader.add("images/applegame/mobileRightBtn.png")
        .load(initAppleGame);

}

function initAppleGame(loader, resources) {
    gameConfig = {};
    var appleBG = createSprite("images/applegame/Baggrund.png", -120, -290, gameLoader);
    gameContainer.addChild(appleBG);
    cleanUpArray.push(appleBG);

    var appleFG = createSprite("images/applegame/forground.png", -320, -125, gameLoader);
    gameContainer.addChild(appleFG);
    cleanUpArray.push(appleFG);

    if (universeBtn) {
        gameContainer.addChild(universeBtn);
    } else {
        universeBtn = createMC("UniverseButton00", 2, 780, 10);
        universeBtn.gotoAndStop(0);
        gameContainer.addChild(universeBtn);
        makeButton(universeBtn, backToUniverse);
    }

    gameConfig.appleContainer = new PIXI.Container();
    gameContainer.addChild(gameConfig.appleContainer);
    cleanUpRemoveArray.push(gameConfig.appleContainer);

    var basket = createMCGC("basket00", 11, 3, -23);
    basket.gotoAndStop(0);
    gameConfig.basket = basket;
    cleanUpRemoveArray.push(basket);

    var characterBody = createMCGC("left00", 5, 0, 0);
    characterBody.loop = false
    characterBody.gotoAndStop(0);
    cleanUpRemoveArray.push(characterBody);


    var character = new PIXI.Container();
    character.addChild(basket);
    character.addChild(characterBody);
    character.x = 440;
    character.y = 425;
    gameConfig.character = character;
    gameContainer.addChild(character);
    cleanUpRemoveArray.push(character);



    var applePoints = createSprite("images/applegame/Bundbar_aaben_extension.png", 90, 508, gameLoader);
    if (isMobile || isIPad) {
        applePoints.x = 40;
    }
    gameContainer.addChild(applePoints);
    cleanUpArray.push(applePoints);

    applePoints = createSprite("images/applegame/Bundbar_aaben.png", 185, 516, gameLoader);
    if (isMobile || isIPad) {
        applePoints.x = 135;
    }
    gameContainer.addChild(applePoints);
    cleanUpArray.push(applePoints);

    gameConfig.level = 1;
    gameConfig.scoreFor = 0;
    gameConfig.scoreAgainst = 0;
    gameConfig.fallSpeed = 3;
    gameConfig.shakeSpan = 1.5;


    //handle multiple keys...
    if (gameConfig.appleKeysSetup) {

    } else {
        //listen for apple keys
        gameConfig.appleKeysSetup = true;
        window.addEventListener("keydown", appleKeyListener);
    }

    if (isMobile || isIPad) {
        initAppleMobileControls();
    }

    var scoreApple;
    //gameConfig.scoreForApplesArray=new Array([279,565],[304,575],[330,583],[357,590],[385,592],[413,594],[440,594],[467,594],[495,593],[522,591]);
    gameConfig.scoreForApplesArray = new Array([234, 576], [259, 586], [285, 594], [312, 601], [340, 603], [368, 605], [395, 605], [422, 605], [450, 604], [477, 602]);

    for (var i = 0; i < 10; i++) {
        //console.log("["+(gameConfig.scoreForApplesArray[i][0]-45) +","+(gameConfig.scoreForApplesArray[i][1]+11)+"],");
        scoreApple = createMCGC("Apple00", 8, gameConfig.scoreForApplesArray[i][0], gameConfig.scoreForApplesArray[i][1]);
        if (isMobile || isIPad) {
            scoreApple.x = scoreApple.x - 50;
        }
        scoreApple.gotoAndStop(2);
        scoreApple.visible = false;
        gameContainer.addChild(scoreApple);
        cleanUpRemoveArray.push(scoreApple);
        gameConfig.scoreForApplesArray[i] = scoreApple;
    }

    gameConfig.scoreAgainstApplesArray = new Array([595, 582], [627, 572], [659, 562]);
    for (i = 0; i < 3; i++) {
        scoreApple = createMCGC("Apple00", 8, gameConfig.scoreAgainstApplesArray[i][0], gameConfig.scoreAgainstApplesArray[i][1]);
        if (isMobile || isIPad) {
            scoreApple.x = scoreApple.x - 50;
        }
        scoreApple.gotoAndStop(5);
        scoreApple.visible = false;
        gameContainer.addChild(scoreApple);
        cleanUpRemoveArray.push(scoreApple);
        gameConfig.scoreAgainstApplesArray[i] = scoreApple;
    }

    showAppleIntro();

    user.visitedApple = true;
    updateUserCookie();
}

function appleKeyListener(keyEvent) {
    if (keyEvent.keyCode === 37) {
        //event.preventDefault();
        appleGameLeft();
    } else if (keyEvent.keyCode === 39) {
        appleGameRight();
    }
}

var gamePopup;

function showAppleIntro() {
    gameConfig.playingSound = playSound("speak_b_apple_welcome");
    gamePopup = new PIXI.Container();
    gamePopup.x = 250;
    gamePopup.y = 100;
    gameContainer.addChild(gamePopup);

    var introBG = createSprite("images/applegame/Start_aeble.png", 0, 0, gameLoader);
    gamePopup.addChild(introBG);
    cleanUpArray.push(introBG);
    gameConfig.introBG = introBG;

    gameConfig.chr = createMCGC("Spil_info_chr00", 76, 270, 90);
    gameConfig.chr.onFrameChange = function() {
        if (this.currentFrame == 10) {
            gameConfig.keys.gotoAndStop(1);
        } else if (this.currentFrame == 50) {
            gameConfig.keys.gotoAndStop(2);
        }
    }
    gamePopup.addChild(gameConfig.chr);
    cleanUpRemoveArray.push(gameConfig.chr);

    gameConfig.keys = createMCGC("Spil_info instance 100", 3, 310, 200);
    gameConfig.keys.gotoAndStop(0);
    gamePopup.addChild(gameConfig.keys);
    cleanUpRemoveArray.push(gameConfig.keys);

    var nextBtn = createNextBtn();
    nextBtn.x = 360;
    nextBtn.y = 330;
    nextBtn.on('pointerdown', readyAppleGame);
    gamePopup.addChild(nextBtn);
    cleanUpRemoveArray.push(nextBtn);
}

function readyAppleGame() {
    gameConfig.playingSound.stop();

    gameConfig.chr.onFrameChange = null;
    gamePopup.removeChildren();
    gameContainer.removeChild(gamePopup);

    startAppleGame();
}


function startAppleGame() {
    gameConfig.apples = [];
    gameConfig.apples.length = 13 + Math.floor(Math.random() * 7);

    for (var i = 0; i < gameConfig.apples.length; i++) {
        gameConfig.apples[i] = placeApple();
        gameConfig.apples[i].alpha = 0;
        if (i == gameConfig.apples.length - 1) {
            TweenMax.to(gameConfig.apples[i], 0.25, {
                alpha: 1,
                delay: i * 0.3,
                onComplete: startAppleFall
            });
        } else {
            TweenMax.to(gameConfig.apples[i], 0.25, {
                alpha: 1,
                delay: i * 0.3
            });
        }
    }
}

function initAppleMobileControls() {
    if (gameConfig.mobileLeftBtn) {

    } else {

        gameConfig.keyBackground = new PIXI.Graphics();
        gameConfig.keyBackground.beginFill(0xFFFFFF);
        gameConfig.keyBackground.drawCircle(95, 95, 95);
        gameConfig.keyBackground.endFill();
        gameConfig.keyBackground.x = 20;
        gameConfig.keyBackground.y = 496;
        gameConfig.keyBackground.alpha = 0.8;
        frontGround.addChild(gameConfig.keyBackground);
        cleanUpArray.push(gameConfig.keyBackground);

        gameConfig.mobileLeftBtn = createSprite("images/applegame/mobileLeftBtn.png", 50, 630, gameLoader);
        gameConfig.mobileLeftBtn.anchor.set(0.5, 1);
        gameConfig.mobileLeftBtn.scale.set(1.5);
        gameConfig.mobileLeftBtn.interactive = true;
        gameConfig.mobileLeftBtn.buttonMode = true;
        gameConfig.mobileLeftBtn.on("pointerdown", appleGameLeft)
        gameConfig.mobileLeftBtn.on("pointerup", appleGameLeftUp)
        gameConfig.mobileLeftBtn.on("pointerupoutside", appleGameLeftUp)
        frontGround.addChild(gameConfig.mobileLeftBtn)
        cleanUpArray.push(gameConfig.mobileLeftBtn);

        gameConfig.mobileRightBtn = createSprite("images/applegame/mobileRightBtn.png", 184, 630, gameLoader);
        gameConfig.mobileRightBtn.anchor.set(0.5, 1);
        gameConfig.mobileRightBtn.scale.set(1.5);
        gameConfig.mobileRightBtn.interactive = true;
        gameConfig.mobileRightBtn.buttonMode = true;
        gameConfig.mobileRightBtn.on("pointerdown", appleGameRight)
        gameConfig.mobileRightBtn.on("pointerup", appleGameRightUp)
        gameConfig.mobileRightBtn.on("pointerupoutside", appleGameRightUp)
        frontGround.addChild(gameConfig.mobileRightBtn)
        cleanUpArray.push(gameConfig.mobileRightBtn);

        if (gameContainer.x > 75) {
            gameConfig.keyBackground.scale.set(1.2);
            gameConfig.keyBackground.x = -75;
            gameConfig.keyBackground.y = 465;
            gameConfig.mobileLeftBtn.x = -20;
            gameConfig.mobileRightBtn.x = 94;
        }
    }
}

function appleGameLeft() {
    if (gameConfig.mobileLeftBtn) {
        this.scale.y = 1.1;
    }
    playSound("apple_step_left", gameLoader);
    gameConfig.character.x -= 80;
    if (gameConfig.character.x <= 80) {
        gameConfig.character.x = 80;
    }
    gameConfig.character.children[1].gotoAndPlay(1);
    gameConfig.character.children[1].onComplete = function() {
        this.gotoAndStop(0);
    }
}

function appleGameLeftUp() {
    this.scale.set(1.5);
}

function appleGameRight() {
    if (gameConfig.mobileLeftBtn) {
        this.scale.y = 1.1;
    }
    //gameLoader.resources["apple_step_left"].sound.play();
    playSound("apple_step_left", gameLoader);
    gameConfig.character.x += 80;
    if (gameConfig.character.x >= 950) {
        gameConfig.character.x = 950;
    }
    gameConfig.character.children[1].gotoAndPlay(1);
    gameConfig.character.children[1].onComplete = function() {
        this.gotoAndStop(0);
    }
}

function appleGameRightUp() {
    this.scale.set(1.5);
}

function placeApple() {
    var apple = createMCGC("Apple00", 8, 100 + Math.floor(Math.random() * 824), 20 + Math.floor(Math.random() * 220));
    if (apple.x > 740 && apple.y < 110) {
        apple.y = 110 + Math.floor(Math.random() * 130);
    }
    apple.gotoAndStop(Math.floor(Math.random() * 3));
    gameConfig.appleContainer.addChild(apple);
    cleanUpRemoveArray.push(apple);

    return apple;
}


function startAppleFall() {
    var randomApple = gameConfig.apples[Math.floor(Math.random() * gameConfig.apples.length)];

    applePos = [randomApple.x, randomApple.y];
    appleShake(randomApple);
    TweenMax.delayedCall(gameConfig.shakeSpan, function() {
        appleShakeTween.kill()
    });
    TweenMax.to(randomApple, gameConfig.fallSpeed, {
        delay: gameConfig.shakeSpan,
        pixi: {
            y: 470 + Math.floor(Math.random() * 40)
        },
        onComplete: endAppleFall,
        onCompleteParams: [randomApple],
        onUpdate: checkBasket,
        onUpdateParams: [randomApple],
        ease: Power2.easeIn
    });
}

var appleShakeTween;
var applePos;

function appleShake(apple) {
    appleShakeTween = TweenMax.to(apple, 0.05, {
        pixi: {
            x: randomNum(applePos[0] - 3, applePos[0] + 3),
            y: randomNum(applePos[1] - 3, applePos[1] + 3),
            scale: randomNum(1, 0.9)
        },
        ease: Sine.easeInOut,
        onComplete: appleShake,
        onCompleteParams: [apple]
    })
}


function randomNum(max, min) {
    return Math.random() * (max - min) + min
};


function checkBasket(apple) {
    if (apple.y > 400) {
        if (gameConfig.character.x > apple.x - 60 && gameConfig.character.x < apple.x + 60) {
            //in basket
            playSound("apple_apple_caught", gameLoader);
            //gameLoader.resources["apple_apple_caught"].sound.play();
            gameConfig.basket.gotoAndStop(gameConfig.basket.currentFrame + 1);
            TweenMax.killTweensOf(apple);
            apple.visible = false;
            removeAppleFromPlay(apple);

            gameConfig.scoreFor++;

            appleGameCheckScore();
        }
    }
}

function endAppleFall(apple) {
    playSound("apple_apple_dropped", gameLoader);
    //gameLoader.resources["apple_apple_dropped"].sound.play();
    apple.gotoAndPlay(3);
    apple.onFrameChange = function() {
        if (this.currentFrame == 7) {
            this.stop();
            this.onFrameChange = null;
        }
    }

    removeAppleFromPlay(apple);
    gameConfig.scoreAgainst++;

    appleGameCheckScore();
}

function removeAppleFromPlay(apple) {
    for (var i = 0; i < gameConfig.apples.length; i++) {
        if (gameConfig.apples[i] == apple) {
            gameConfig.apples.splice(i, 1);
        }
    }
}

function appleGameCheckScore() {
    for (var i = 0; i < gameConfig.scoreAgainst; i++) {
        gameConfig.scoreAgainstApplesArray[i].visible = true;
    }
    for (i = 0; i < gameConfig.scoreFor; i++) {
        gameConfig.scoreForApplesArray[i].visible = true;
    }


    if (gameConfig.scoreAgainst >= 3) {
        //gameOver
        gameConfig.playingSound = playSound("speak_b_apple_done_no_money");

        gamePopup = new PIXI.Container();
        gamePopup.x = 250;
        gamePopup.y = 100;
        gameContainer.addChild(gamePopup);

        var bg = createSprite("images/applegame/gameover_lost_bg.png", 0, 0, gameLoader);
        gamePopup.addChild(bg);
        cleanUpArray.push(bg)

        TweenMax.delayedCall(1, addAppleDrop, [0]);
        TweenMax.delayedCall(1.5, addAppleDrop, [1]);
        TweenMax.delayedCall(2, addAppleDrop, [2]);

        var nextBtn = createNextBtn();
        nextBtn.x = 220;
        nextBtn.y = 115;
        nextBtn.on('pointerdown', restartAppleGame);
        gamePopup.addChild(nextBtn);
        cleanUpRemoveArray.push(nextBtn);

    } else if (gameConfig.scoreFor >= 10) {
        //game won
        gameConfig.playingSound = playRandomSound(["speak_b_apple_nextlevel_1", "speak_b_apple_nextlevel_2", "speak_b_apple_nextlevel_3", "speak_b_apple_nextlevel_4"]);

        gamePopup = new PIXI.Container();
        gamePopup.x = 250;
        gamePopup.y = 100;
        gameContainer.addChild(gamePopup);

        var videoTexture = PIXI.Texture.from('images/applegame/applejuice.mp4');
        cleanUpArray.push(videoTexture);
        var videoElement = videoTexture.baseTexture.resource.source;

        var videoSprite = new PIXI.Sprite(videoTexture);
        videoSprite.width = 550;
        videoSprite.height = 420;
        gamePopup.addChild(videoSprite);
        cleanUpRemoveArray.push(videoSprite);

        videoElement.loop = false;
        videoElement.autoPlay = true;
        videoElement.muted = true;

        /*
        var texture = PIXI.Texture.fromVideo('images/applegame/applejuice.mp4');

        // create a new Sprite using the video texture (yes it's that easy)
        var videoSprite = new PIXI.Sprite(texture);

        // Stetch the fullscreen
        videoSprite.width = 550;
        videoSprite.height = 420;

        gamePopup.addChild(videoSprite);*/

        //var juiceSound = gameLoader.resources["apple_juice_sound"].sound.play();
        var juiceSound = playSound("apple_juice_sound", gameLoader);
        juiceSound.volume = 0.1;

        var nextBtn = createNextBtn();
        nextBtn.x = 360;
        nextBtn.y = 330;
        nextBtn.on('pointerdown', nextLevelApple);
        gamePopup.addChild(nextBtn);
        cleanUpRemoveArray.push(nextBtn);

        updateWallet(2);
    } else {
        startAppleFall();
    }
}

function addAppleDrop(count) {
    var appleDrop = createMCGC("Aeble_slut00", 7, 100 + (100 * count), 0);
    appleDrop.loop = false;
    gamePopup.addChild(appleDrop);
    cleanUpRemoveArray.push(appleDrop);
}

function nextLevelApple() {
    gamePopup.parent.removeChild(gamePopup);

    for (var i = gameConfig.appleContainer.children.length - 1; i > 0; i--) {
        gameConfig.appleContainer.children[i].destroy();
    }
    gameConfig.appleContainer.removeChildren();

    gameConfig.apples = [];
    gameConfig.level++;
    gameConfig.scoreFor = 0;
    gameConfig.scoreAgainst = 0;
    gameConfig.fallSpeed -= 0.5;
    gameConfig.shakeSpan -= 0.3;

    for (var i = 0; i < gameConfig.scoreAgainstApplesArray.length; i++) {
        gameConfig.scoreAgainstApplesArray[i].visible = false;
    }
    for (i = 0; i < gameConfig.scoreForApplesArray.length; i++) {
        gameConfig.scoreForApplesArray[i].visible = false;
    }

    gameConfig.character.children[0].gotoAndStop(0);

    startAppleGame();

    gameConfig.playingSound.stop();

}

function restartAppleGame() {
    gameConfig.playingSound.stop();

    gamePopup.parent.removeChild(gamePopup);

    for (var i = gameConfig.appleContainer.children.length - 1; i > 0; i--) {
        gameConfig.appleContainer.children[i].destroy();
    }
    gameConfig.appleContainer.removeChildren();

    gameConfig.apples = [];
    gameConfig.level = 1;
    gameConfig.scoreFor = 0;
    gameConfig.scoreAgainst = 0;
    gameConfig.fallSpeed = 3;
    gameConfig.shakeSpan = 1.5

    for (var i = 0; i < gameConfig.scoreAgainstApplesArray.length; i++) {
        gameConfig.scoreAgainstApplesArray[i].visible = false;
    }
    for (i = 0; i < gameConfig.scoreForApplesArray.length; i++) {
        gameConfig.scoreForApplesArray[i].visible = false;
    }

    gameConfig.character.children[0].gotoAndStop(0);

    startAppleGame();
}



//POST OFFICE----------------------------------------------------------------
function showPostOfficeGame() {
    sendStatPoint("start-postoffice");
    if (this.sound) {
        this.sound.stop();
    }

    stopMayorSpeak();
    clearInterval(universeAmbientSoundsInterval);
    universeAmbientSoundsInterval = null;

    gameSoundArray = new Array();

    gameContainer.removeChildren();
    if (gameLoader) {
        gameLoader.reset();
    }


    if (localTest) {
        loadPostResources({
            "speak_b_postoffice_welcome": {
                "contenttype": "sound",
                "content": "dk_velkomst_og_forklaring_postkontoret.mp3",
                "subtitle": "Velkommen til postkontoret. Her skal du hj\u00e6lpe Postmesteren med at sortere pakkerne, der skal leveres i Pengeby! De dyreste pakker skal ud f\u00f8rst, og de billigste pakker skal ud til sidst. Du skal bruge musen og tr\u00e6kke de rigtige pakker op i de rigtige bakker; de dyreste skal st\u00e5 til venstre og de billigste skal st\u00e5 til h\u00f8jre. N\u00e5r du er klar, s\u00e5 tryk p\u00e5 den gr\u00f8nne knap!"
            },
            "speak_postoffice_correct_1": {
                "contenttype": "sound",
                "content": "pengeby_det_er_du_god_til.mp3",
                "subtitle": "Det er du god til!"
            },
            "speak_postoffice_correct_2": {
                "contenttype": "sound",
                "content": "pengeby_godt_gaaet.mp3",
                "subtitle": "Godt g\u00e5et!"
            },
            "speak_postoffice_correct_3": {
                "contenttype": "sound",
                "content": "pengeby_nu_bliver_det_lidt.mp3",
                "subtitle": "Nu bliver det lidt sv\u00e6rere. Er du klar?"
            },
            "speak_postoffice_correct_4": {
                "contenttype": "sound",
                "content": "dk_rigtig_loesning_naeste_bane_2.mp3",
                "subtitle": "Det er du god til! Nu bliver det lidt sv\u00e6rere."
            },
            "speak_postoffice_done": {
                "contenttype": "sound",
                "content": "dk_afslutning_og_resultat.mp3",
                "subtitle": "Tusind tak for hj\u00e6lpen - det var du god til! Som tak for hj\u00e6lpen f\u00e5r du her nogle penge, som du kan bruge i Karens butik eller Tidsmaskinen. Du kan ogs\u00e5 hj\u00e6lpe mig igen, hvis du har lyst?"
            },
            "postoffice_error": {
                "contenttype": "sound",
                "content": "postoffice_fejl_lyd_3.mp3",
                "subtitle": ""
            },
            "postoffice_left_belt": {
                "contenttype": "sound",
                "content": "postoffice_transportbaand_left.mp3",
                "subtitle": ""
            },
            "postoffice_ok": {
                "contenttype": "sound",
                "content": "postoffice_ok_lyd_2.mp3",
                "subtitle": ""
            },
            "postoffice_right_belt": {
                "contenttype": "sound",
                "content": "postoffice_transportbaand_right.mp3",
                "subtitle": ""
            },
            "postoffice_truck_loads": {
                "contenttype": "sound",
                "content": "postoffice_lastbil_faar_pakker.mp3",
                "subtitle": ""
            },
            "postoffice_truck_takes_off": {
                "contenttype": "sound",
                "content": "postoffice_lastbil_koerer_med_pakkerne.mp3",
                "subtitle": ""
            }
        })
    } else {
        $.ajax({
            type: 'GET',
            url: 'gameadmin/getcontent/postoffice.json',
            contentType: 'application/json; charset=utf-8',
            dataType: 'json',
        }).done(loadPostResources);
    }
}



function loadPostResources(data) {
    gameLoader = new PIXI.Loader();
    gameLoader.add("images/postoffice/background.png")
    $.each(data, function(key, val) {
        gameLoader.add(key, "files/" + val.content);

        subtitleArray[key] = val.subtitle;

        gameSoundArray.push(key);
    })

    showPreloader();
    gameLoader.on('progress', preloadProgress);

    gameLoader.add("images/postoffice/Rulle_hjul.png")
        .add("images/postoffice/PackagePapir.png")
        .add("images/postoffice/Pakkebakker2.png")
        .add("images/postoffice/Pakkebakker3.png")
        .add("images/postoffice/gameover_BG.png")
        .add("images/postoffice/gameover_BG2.png")
        .add("images/postoffice/hand.png")
        .add("images/postoffice/introBG.png")
        .add("images/postoffice/postintro.json")
        .add("images/postoffice/trays.json")
        .add("images/postoffice/trayHighlight.png")
        .add("images/postoffice/eyes.json")
        .add("images/postoffice/levels.json")
        .add("images/postoffice/packageContent.json")
        .add("images/postoffice/pakker.json")
        .add("images/postoffice/posttruck.json")
        .load(initPostOffice);

}

var postGamePoints;

function initPostOffice(loader, resources) {
    var postBG = createSprite("images/postoffice/background.png", 80, 0, gameLoader);
    gameContainer.addChild(postBG);
    cleanUpArray.push(postBG);

    var eyes = createMCGC("Postmand_oejne00", 80, 387, 98);
    eyes.scale.x = -1;
    gameContainer.addChild(eyes);
    cleanUpArray.push(eyes);

    if (universeBtn) {
        gameContainer.addChild(universeBtn);
    } else {
        universeBtn = createMC("UniverseButton00", 2, 780, 10);
        universeBtn.gotoAndStop(0);
        gameContainer.addChild(universeBtn);
        makeButton(universeBtn, backToUniverse);
    }

    postGamePoints = createMCGC("Levels00", 9, 820, 115);
    postGamePoints.gotoAndStop(0);
    gameContainer.addChild(postGamePoints);
    cleanUpArray.push(postGamePoints);

    var rulleHjul;
    gameConfig.rulleHjulArrayBack = new Array();
    for (var i = 0; i < 8; i++) {
        rulleHjul = createSprite("images/postoffice/Rulle_hjul.png", 478 - (i * 60), 512, gameLoader);
        rulleHjul.scale.x = rulleHjul.scale.y = 0.5;
        rulleHjul.anchor.set(0.5);
        gameContainer.addChild(rulleHjul);
        gameConfig.rulleHjulArrayBack.push(rulleHjul);
        cleanUpArray.push(rulleHjul);
    }

    gameConfig.rulleHjulArrayForward = new Array();
    for (var i = 0; i < 8; i++) {
        rulleHjul = createSprite("images/postoffice/Rulle_hjul.png", 556 + (i * 60), 561, gameLoader);
        rulleHjul.scale.x = rulleHjul.scale.y = 0.5;
        rulleHjul.anchor.set(0.5);
        gameContainer.addChild(rulleHjul);
        gameConfig.rulleHjulArrayForward.push(rulleHjul);
        cleanUpArray.push(rulleHjul);
    }

    packageContainer = new PIXI.Container();
    gameContainer.addChild(packageContainer);
    cleanUpRemoveArray.push(packageContainer);

    showPostIntro();

    user.visitedPost = true;
    updateUserCookie();
}

function showPostIntro() {
    //gameConfig.playingSound = gameLoader.resources["speak_b_postoffice_welcome"].sound.play();
    gameConfig.playingSound = playSound("speak_b_postoffice_welcome", gameLoader);

    gamePopup = new PIXI.Container();
    gamePopup.x = 250;
    gamePopup.y = 100;
    gameContainer.addChild(gamePopup);

    var introBG = createSprite("images/postoffice/introBG.png", 0, 0, gameLoader);
    gamePopup.addChild(introBG);
    cleanUpArray.push(introBG);

    var introAnim = createMCGC("Spilinfo_egypten instance 100", 97, 52, 90);
    gamePopup.addChild(introAnim);
    cleanUpArray.push(introAnim);

    var nextBtn = createNextBtn();
    nextBtn.x = 360;
    nextBtn.y = 330;
    nextBtn.on('pointerdown', readyPostGame);
    gamePopup.addChild(nextBtn);
    cleanUpRemoveArray.push(nextBtn);
}

function readyPostGame() {
    gameConfig.playingSound.stop();
    gamePopup.parent.removeChild(gamePopup);

    startPostGame();
}

var postGameLevel;
var packageItemsCheap = new Array(0, 1, 2, 3, 4, 5, 6, 9, 11, 12);
var packageItemsMedium = new Array(7, 8, 10, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 30);
var packageItemsDear = new Array(25, 26, 27, 28, 29, 31, 32, 33, 34, 35, 36, 37, 38);

function startPostGame() {
    postGameLevel = 1;

    placePackages();

}

var postGameTray1;
var postGameTray2;
var postGameTray3;
var packageContainer;

function placePackages() {
    var item1index = packageItemsCheap[Math.floor(Math.random() * packageItemsCheap.length)];
    var item2index = packageItemsDear[Math.floor(Math.random() * packageItemsDear.length)];

    postGameTray1 = new PIXI.Container();
    postGameTray1.x = 190;
    postGameTray1.y = 365;
    var gameTrayHighlight = createSprite("images/postoffice/trayHighlight.png", -8, 58, gameLoader);
    cleanUpArray.push(gameTrayHighlight);
    postGameTray1.addChild(gameTrayHighlight);
    postGameTray1.children[0].visible = false;
    var gameTrayBG = createMCGC("tray00", 21, 0, 0)
    postGameTray1.addChild(gameTrayBG);
    postGameTray1.children[1].gotoAndStop(0);
    packageContainer.addChild(postGameTray1);
    cleanUpRemoveArray.push(postGameTray1);


    /*postGameTray2 = createMC("tray00",21,340,365);
    postGameTray2.gotoAndStop(7);
    packageContainer.addChild(postGameTray2);*/

    postGameTray2 = new PIXI.Container();
    postGameTray2.x = 340;
    postGameTray2.y = 365;
    gameTrayHighlight = createSprite("images/postoffice/trayHighlight.png", -8, 58, gameLoader);
    cleanUpRemoveArray.push(gameTrayHighlight);
    postGameTray2.addChild(gameTrayHighlight);
    postGameTray2.children[0].visible = false;
    gameTrayBG = createMCGC("tray00", 21, 0, 0);
    postGameTray2.addChild(gameTrayBG);
    postGameTray2.children[1].gotoAndStop(7);
    packageContainer.addChild(postGameTray2);
    cleanUpRemoveArray.push(postGameTray2);

    if (postGameLevel >= 5) {
        item1index = packageItemsCheap[Math.floor(Math.random() * packageItemsCheap.length)];
        item2index = packageItemsMedium[Math.floor(Math.random() * packageItemsMedium.length)];
        item3index = packageItemsDear[Math.floor(Math.random() * packageItemsDear.length)];

        postGameTray1.x = 70;
        postGameTray2.x = 210;

        /*
        postGameTray3 = createMC("tray00",21,350,365);
        postGameTray3.gotoAndStop(14);
        packageContainer.addChild(postGameTray3);
        */
        postGameTray3 = new PIXI.Container();
        postGameTray3.x = 350;
        postGameTray3.y = 365;
        gameTrayHighlight = createSprite("images/postoffice/trayHighlight.png", -8, 58, gameLoader);
        cleanUpRemoveArray.push(gameTrayHighlight);
        postGameTray3.addChild(gameTrayHighlight);
        postGameTray3.children[0].visible = false;
        gameTrayBG = createMCGC("tray00", 21, 0, 0);
        postGameTray3.addChild(gameTrayBG);
        postGameTray3.children[1].gotoAndStop(14);
        packageContainer.addChild(postGameTray3);
        cleanUpRemoveArray.push(postGameTray3);
    }


    var package1 = createMCGC("pakkeMC00", 6, 655, 515);
    package1.gotoAndStop(Math.floor(Math.random() * 6));
    packageContainer.addChild(package1);
    package1.interactive = true;
    package1.choords = [655, 515];
    package1.dragging = false;
    package1.pivot.set(55, 100);
    cleanUpArray.push(package1);

    var package2 = createMCGC("pakkeMC00", 6, 795, 515);
    package2.gotoAndStop(Math.floor(Math.random() * 6));
    packageContainer.addChild(package2);
    package2.interactive = true;
    package2.choords = [795, 515];
    package2.dragging = false;
    package2.pivot.set(55, 100);
    cleanUpArray.push(package2);

    package1Content = Math.floor(Math.random() * 2);
    if (package1Content == 0) {
        package1.content = [0, item1index];
        package2.content = [1, item2index];
    } else {
        package1.content = [1, item2index];
        package2.content = [0, item1index];
    }

    if (isMobile || isIPad) {
        package1.buttonMode = true;
        //package1.on("pointerover", packageHover);
        //package1.on("pointerout", packageEndHover);
        package1.on("pointerdown", packageDrag)
            .on('pointerup', packageDragEnd)
            .on('pointerupoutside', packageDragEnd)
            .on('pointermove', packageDragMove);

        package2.on("pointerdown", packageDrag)
            .on('pointerup', packageDragEnd)
            .on('pointerupoutside', packageDragEnd)
            .on('pointermove', packageDragMove);
    } else {
        package1.buttonMode = true;
        package1.on("pointerover", packageHover);
        package1.on("pointerout", packageEndHover);
        package1.on("pointerdown", packageDrag)
            .on('pointerup', packageDragEnd)
            .on('pointerupoutside', packageDragEnd)
            .on('pointermove', packageDragMove);

        package2.buttonMode = true;
        package2.on("pointerover", packageHover);
        package2.on("pointerout", packageEndHover);
        package2.on("pointerdown", packageDrag)
            .on('pointerup', packageDragEnd)
            .on('pointerupoutside', packageDragEnd)
            .on('pointermove', packageDragMove);
    }


    for (var i = 0; i < gameConfig.rulleHjulArrayForward.length; i++) {
        TweenMax.to(gameConfig.rulleHjulArrayForward[i], 1.2, {
            pixi: {
                rotation: "-=360"
            },
            ease: Power0.easeNone
        });
    }

    playSound("postoffice_left_belt", gameLoader);

    for (var i = 0; i < gameConfig.rulleHjulArrayBack.length; i++) {
        TweenMax.to(gameConfig.rulleHjulArrayBack[i], 1.2, {
            pixi: {
                rotation: "+=360"
            },
            ease: Power0.easeNone
        });
    }

    playSound("postoffice_right_belt", gameLoader);

    if (postGameLevel >= 5) {
        var package3 = createMCGC("pakkeMC00", 6, 870, 515);
        package3.gotoAndStop(Math.floor(Math.random() * 6));
        packageContainer.addChild(package3);
        package3.interactive = true;
        package3.choords = [870, 515];
        package3.dragging = false;
        package3.pivot.set(55, 100);
        cleanUpArray.push(package3);

        package1.x = 640;
        package2.x = 755;

        package1.choords = [640, 515];
        package2.choords = [755, 515];


        package1Content = Math.floor(Math.random() * 3);
        if (package1Content == 0) {
            package1.content = [0, item1index];
            package2Content = Math.floor(Math.random() * 2);
            if (package2Content == 0) {
                package2.content = [1, item2index];
                package3.content = [2, item3index];
            } else {
                package2.content = [2, item3index];
                package3.content = [1, item2index];
            }
        } else if (package1Content == 1) {
            package1.content = [1, item2index];
            package2Content = Math.floor(Math.random() * 2);
            if (package2Content == 0) {
                package2.content = [0, item1index];
                package3.content = [2, item3index];
            } else {
                package2.content = [2, item3index];
                package3.content = [0, item1index];
            }
        } else {
            package1.content = [2, item3index];
            package2Content = Math.floor(Math.random() * 2);
            if (package2Content == 0) {
                package2.content = [0, item1index];
                package3.content = [1, item2index];
            } else {
                package2.content = [1, item2index];
                package3.content = [0, item1index];
            }
        }

        if (isMobile || isIPad) {
            package3.on("pointerdown", packageDrag)
                .on('pointerup', packageDragEnd)
                .on('pointerupoutside', packageDragEnd)
                .on('pointermove', packageDragMove);
        } else {
            package3.buttonMode = true;
            package3.on("pointerover", packageHover);
            package3.on("pointerout", packageEndHover);
            package3.on("pointerdown", packageDrag)
                .on('pointerup', packageDragEnd)
                .on('pointerupoutside', packageDragEnd)
                .on('pointermove', packageDragMove);
        }

        TweenMax.from(package1, 1.2, {
            pixi: {
                x: 1140
            },
            ease: Power0.easeNone
        });
        TweenMax.from(package2, 1.2, {
            pixi: {
                x: 1255
            },
            ease: Power0.easeNone
        });
        TweenMax.from(package3, 1.2, {
            pixi: {
                x: 1370
            },
            ease: Power0.easeNone
        });

        TweenMax.from(postGameTray1, 1.2, {
            pixi: {
                x: -930
            },
            ease: Power0.easeNone
        });
        TweenMax.from(postGameTray2, 1.2, {
            pixi: {
                x: -790
            },
            ease: Power0.easeNone
        });
        TweenMax.from(postGameTray3, 1.2, {
            pixi: {
                x: -650
            },
            ease: Power0.easeNone
        });


    } else {
        TweenMax.from(package1, 1.2, {
            pixi: {
                x: 1155
            },
            ease: Power0.easeNone
        });
        TweenMax.from(package2, 1.2, {
            pixi: {
                x: 1295
            },
            ease: Power0.easeNone
        });
        TweenMax.from(postGameTray1, 1.2, {
            pixi: {
                x: -810
            },
            ease: Power0.easeNone
        });
        TweenMax.from(postGameTray2, 1.2, {
            pixi: {
                x: -660
            },
            ease: Power0.easeNone
        });
    }

}

function packageHover() {
    if (!this.dragging) {
        var paper = createSprite("images/postoffice/PackagePapir.png", -50, -95, gameLoader);
        this.addChild(paper);
        cleanUpArray.push(paper);
        var content = createMCGC("packageContent00", 40, 55, 0);
        content.anchor.set(0.5);
        content.gotoAndStop(this.content[1]);
        this.addChild(content);
        cleanUpArray.push(content);
    }
}

function packageEndHover() {
    this.removeChildren();

}

function packageDrag(event) {
    // store a reference to the data
    // the reason for this is because of multitouch
    // we want to track the movement of this particular touch
    this.data = event.data;
    this.dragging = true;

    if ((isMobile || isIPad) && this.x > 500) {
        var paper = createSprite("images/postoffice/PackagePapir.png", -50, -95, gameLoader);
        this.addChild(paper);
        cleanUpArray.push(paper);

        var content = createMCGC("packageContent00", 40, 55, 0);
        content.anchor.set(0.5);
        content.gotoAndStop(this.content[1]);
        this.addChild(content);
        cleanUpArray.push(content);

    } else if (isMobile || isIPad) {
        this.removeChildren();
    } else {
        this.removeChildren();
    }

}

function packageDragMove() {
    if (this.dragging) {
        var newPosition = this.data.getLocalPosition(this.parent);
        this.x = newPosition.x;
        this.y = newPosition.y;

        if (postGameLevel < 5) {
            if ((this.x > 200 && this.x < 314) && (this.y > 410 && this.y < 490)) {
                postGameTray1.children[0].visible = true;
                postGameTray2.children[0].visible = false;
            } else if ((this.x > 360 && this.x < 470) && (this.y > 410 && this.y < 490)) {
                postGameTray1.children[0].visible = false;
                postGameTray2.children[0].visible = true;
            } else {
                postGameTray1.children[0].visible = false;
                postGameTray2.children[0].visible = false;
            }
        } else {
            if ((this.x > 80 && this.x < 194) && (this.y > 410 && this.y < 490)) {
                postGameTray1.children[0].visible = true;
                postGameTray2.children[0].visible = false;
                postGameTray3.children[0].visible = false;
            } else if ((this.x > 220 && this.x < 334) && (this.y > 410 && this.y < 490)) {
                postGameTray1.children[0].visible = false;
                postGameTray2.children[0].visible = true;
                postGameTray3.children[0].visible = false;
            } else if ((this.x > 360 && this.x < 474) && (this.y > 410 && this.y < 490)) {
                postGameTray1.children[0].visible = false;
                postGameTray2.children[0].visible = false;
                postGameTray3.children[0].visible = true;
            } else {
                postGameTray1.children[0].visible = false;
                postGameTray2.children[0].visible = false;
                postGameTray3.children[0].visible = false;
            }

        }

        if ((isMobile || isIPad) && this.x > 500) {
            var paper = createSprite("images/postoffice/PackagePapir.png", -50, -95, gameLoader);
            this.addChild(paper);
            cleanUpArray.push(paper);

            var content = createMCGC("packageContent00", 40, 55, 0);
            content.anchor.set(0.5);
            content.gotoAndStop(this.content[1]);
            this.addChild(content);
            cleanUpArray.push(content);

        } else if (isMobile || isIPad) {
            this.removeChildren();
        }

    }
}

function packageDragEnd() {
    this.dragging = false;
    // set the interaction data to null
    this.data = null;

    if (postGameLevel < 5) {
        if ((this.x > 200 && this.x < 314) && (this.y > 410 && this.y < 490)) {
            //hit tray 1 - dear
            if (this.content[0] == 1) {
                this.visible = false;
                postGameTray1.children[1].gotoAndStop(this.currentFrame + 1);

                playSound("postoffice_ok", gameLoader);
            } else {
                //replace
                this.x = this.choords[0];
                this.y = this.choords[1];

                playSound("postoffice_error", gameLoader);
            }

        } else if ((this.x > 360 && this.x < 470) && (this.y > 410 && this.y < 490)) {
            //hit tray 2 - cheap
            if (this.content[0] == 0) {
                this.visible = false;
                postGameTray2.children[1].gotoAndStop(this.currentFrame + 8);

                playSound("postoffice_ok", gameLoader);
            } else {
                //replace
                this.x = this.choords[0];
                this.y = this.choords[1];

                playSound("postoffice_error", gameLoader);
            }
        } else {
            //replace
            this.x = this.choords[0];
            this.y = this.choords[1];

            playSound("postoffice_error", gameLoader);
        }
        postGameTray1.children[0].visible = false;
        postGameTray2.children[0].visible = false;

    } else {
        if ((this.x > 80 && this.x < 194) && (this.y > 410 && this.y < 490)) {
            //hit tray 1 - dear
            if (this.content[0] == 2) {
                this.visible = false;
                postGameTray1.children[1].gotoAndStop(this.currentFrame + 1);

                playSound("postoffice_ok", gameLoader);
            } else {
                //replace
                this.x = this.choords[0];
                this.y = this.choords[1];

                playSound("postoffice_error", gameLoader);
            }

        } else if ((this.x > 220 && this.x < 334) && (this.y > 410 && this.y < 490)) {
            //hit tray 2 - medium
            if (this.content[0] == 1) {
                this.visible = false;
                postGameTray2.children[1].gotoAndStop(this.currentFrame + 8);

                playSound("postoffice_ok", gameLoader);
            } else {
                //replace
                this.x = this.choords[0];
                this.y = this.choords[1];

                playSound("postoffice_error", gameLoader);
            }
        } else if ((this.x > 360 && this.x < 474) && (this.y > 410 && this.y < 490)) {
            //hit tray 3 - cheap
            if (this.content[0] == 0) {
                this.visible = false;
                postGameTray3.children[1].gotoAndStop(this.currentFrame + 15);

                playSound("postoffice_ok", gameLoader);
            } else {
                //replace
                this.x = this.choords[0];
                this.y = this.choords[1];

                playSound("postoffice_error", gameLoader);
            }
        } else {
            //replace
            this.x = this.choords[0];
            this.y = this.choords[1];

            playSound("postoffice_error", gameLoader);
        }

        postGameTray1.children[0].visible = false;
        postGameTray2.children[0].visible = false;
        postGameTray3.children[0].visible = false;

    }

    checkPostGameScore();
}

function checkPostGameScore() {
    if (postGameLevel < 5) {
        if (postGameTray1.children[1].currentFrame != 0 && postGameTray2.children[1].currentFrame != 7) {
            //completed - do animate
            postGamePoints.gotoAndStop(postGameLevel);
            postGameLevel++;

            for (var i = 0; i < gameConfig.rulleHjulArrayBack.length; i++) {
                TweenMax.to(gameConfig.rulleHjulArrayBack[i], 1.2, {
                    pixi: {
                        rotation: "-=360"
                    },
                    ease: Power0.easeNone
                });
            }
            TweenMax.to(postGameTray1, 1.2, {
                pixi: {
                    x: -510
                },
                ease: Power0.easeNone
            });
            TweenMax.to(postGameTray2, 1.2, {
                pixi: {
                    x: -360
                },
                ease: Power0.easeNone,
                onComplete: showPostTruck
            });

            playSound("postoffice_left_belt", gameLoader);

            var correctSound = Math.floor(Math.random() * 4);
            if (correctSound == 1) {

                playSound("speak_postoffice_correct_1", gameLoader);
            } else if (correctSound == 2) {

                playSound("speak_postoffice_correct_2", gameLoader);
            } else if (correctSound == 3) {

                playSound("speak_postoffice_correct_3", gameLoader);
            } else {

                playSound("speak_postoffice_correct_4", gameLoader);
            }
        }
    } else {
        if ((postGameTray1.children[1].currentFrame != 0 && postGameTray2.children[1].currentFrame != 7) && postGameTray3.children[1].currentFrame != 14) {
            //completed - do animate
            postGamePoints.gotoAndStop(postGameLevel);
            postGameLevel++;

            for (var i = 0; i < gameConfig.rulleHjulArrayBack.length; i++) {
                TweenMax.to(gameConfig.rulleHjulArrayBack[i], 1.2, {
                    pixi: {
                        rotation: "-=360"
                    },
                    ease: Power0.easeNone
                });
            }
            TweenMax.to(postGameTray1, 1.2, {
                pixi: {
                    x: -930
                },
                ease: Power0.easeNone
            });
            TweenMax.to(postGameTray2, 1.2, {
                pixi: {
                    x: -790
                },
                ease: Power0.easeNone
            });
            TweenMax.to(postGameTray3, 1.2, {
                pixi: {
                    x: -650
                },
                ease: Power0.easeNone,
                onComplete: showPostTruck
            });

            playSound("postoffice_left_belt", gameLoader);

            var correctSound = Math.floor(Math.random() * 4);
            if (correctSound == 1) {

                playSound("speak_postoffice_correct_1", gameLoader);
            } else if (correctSound == 2) {

                playSound("speak_postoffice_correct_2", gameLoader);
            } else if (correctSound == 3) {

                playSound("speak_postoffice_correct_3", gameLoader);
            } else {

                playSound("speak_postoffice_correct_4", gameLoader);

            }
        }
    }
}

function showPostTruck() {
    packageContainer.removeChildren();

    if (postGameLevel == 2) {
        gamePopup = new PIXI.Container();
        gamePopup.x = 250;
        gamePopup.y = 100;
        gameContainer.addChild(gamePopup);

        var truckBG = createSprite("images/postoffice/gameover_BG.png", 0, 0, gameLoader);
        gamePopup.addChild(truckBG);
        cleanUpArray.push(truckBG);

        var truckAnim = createMCGC("Postbil_pakker00", 9, 60, 160);
        truckAnim.gotoAndStop(0);
        gamePopup.addChild(truckAnim);
        cleanUpArray.push(truckAnim);

        var popupMask = new PIXI.Graphics();
        popupMask.beginFill(0x000000);
        popupMask.drawRect(5, 0, 506, 386);
        gamePopup.addChild(popupMask);
        cleanUpArray.push(popupMask);

        truckAnim.mask = popupMask;
    } else if (postGameLevel >= 9) {
        //postGameOver();
        gamePopup.visible = true;
    } else {
        gamePopup.visible = true;
    }

    gamePopup.children[1].gotoAndStop(postGameLevel - 2);

    TweenMax.delayedCall(1, postAddPackage);
}

function postAddPackage() {
    gamePopup.children[1].gotoAndStop(postGameLevel - 1);

    playSound("postoffice_truck_loads", gameLoader);

    if (postGameLevel >= 9) {
        TweenMax.to(gamePopup.children[1], 1.5, {
            pixi: {
                x: "-=400"
            },
            delay: 0.8,
            ease: Power2.easeIn,
            onComplete: postTruckGone
        });

        playSound("postoffice_truck_takes_off", gameLoader);


    } else {
        TweenMax.delayedCall(1, gotoNextPostLevel);
    }
}

function gotoNextPostLevel() {
    gamePopup.visible = false;
    placePackages();
}



function postTruckGone() {
    //ad next btn
    var gameOverBG = createSprite("images/postoffice/gameover_BG2.png", 0, 0, gameLoader);
    gamePopup.addChild(gameOverBG);
    cleanUpArray.push(gameOverBG);

    var hand = createSprite("images/postoffice/hand.png", 300, 300, gameLoader);
    hand.anchor.set(0.5);
    gamePopup.addChild(hand);
    TweenMax.set(hand, {
        pixi: {
            scale: 0.75
        }
    });
    TweenMax.to(hand, 1.5, {
        pixi: {
            scale: 1
        }
    });
    cleanUpArray.push(hand);

    var nextBtn = createNextBtn();
    nextBtn.x = 100;
    nextBtn.y = 95;
    nextBtn.on('pointerdown', restartPostGame);
    gamePopup.addChild(nextBtn);
    cleanUpRemoveArray.push(nextBtn);

    gameConfig.playingSound = playSound("speak_postoffice_done", gameLoader);

    updateWallet(5);
}


function restartPostGame() {
    gameConfig.playingSound.stop();
    postGameLevel = 1;
    gameContainer.removeChildren();
    initPostOffice();
}


//FARM GAME------------------------------------------------------------------------------------
function showFarmGame() {
    sendStatPoint("start-farm");
    if (this.sound) {
        this.sound.stop();
    }
    stopMayorSpeak();
    clearInterval(universeAmbientSoundsInterval);
    universeAmbientSoundsInterval = null;

    gameSoundArray = new Array();

    gameContainer.removeChildren();
    if (gameLoader) {
        gameLoader.reset();
    }

    if (localTest) {
        loadFarmResources({
            "speak_b_farm_feed_amount": {
                "contenttype": "sound",
                "content": "farm_feed_amount_92.mp3",
                "subtitle": "Er du sikker p\u00e5, at det er det rigtige antal?"
            },
            "speak_b_farm_intro": {
                "contenttype": "sound",
                "content": "farm_intro_59.mp3",
                "subtitle": "Velkommen til Bondeg\u00e5rden. Her skal du hj\u00e6lpe med at samle dyrene s\u00e5 de kan f\u00e5 noget at spise. F\u00f8rst skal du finde dyrene. Tr\u00e6k det rigtig antal dyr ind p\u00e5 midten af den store cirkel. Tryk p\u00e5 den gr\u00f8nne knap for at komme i gang."
            },
            "speak_farm_feed_cow": {
                "contenttype": "sound",
                "content": "farm_feed_cow_78.mp3",
                "subtitle": "Nu er k\u00f8erne samlet og nu skal de have mad. Hver s\u00e6k giver mad til 1 ko. Hvor mange s\u00e6kke skal du bruge? Tryk p\u00e5 den gr\u00f8nne knap n\u00e5r du har trukket det rigtige antal s\u00e6kke ind i cirklen"
            },
            "speak_farm_feed_duck": {
                "contenttype": "sound",
                "content": "farm_feed_ducks_67.mp3",
                "subtitle": "S\u00e5 er det spisetid for \u00e6nderne. Hver s\u00e6k giver mad til 4 \u00e6nder, s\u00e5 hvor mange s\u00e6kke skal du nu bruge? Tryk p\u00e5 den gr\u00f8nne knap n\u00e5r du har trukket det rigtige antal s\u00e6kke ind i cirklen"
            },
            "speak_farm_feed_horse": {
                "contenttype": "sound",
                "content": "farm_feed_horse_80.mp3",
                "subtitle": "Nu skal hestene have mad. Hver s\u00e6k giver mad til 2 heste. Hvor mange s\u00e6kke skal du bruge? Tryk p\u00e5 den gr\u00f8nne knap n\u00e5r du har trukket det rigtige antal s\u00e6kke ind i cirklen"
            },
            "speak_farm_feed_missing": {
                "contenttype": "sound",
                "content": "farm_feed_missing91.mp3",
                "subtitle": "Der mangler nogle s\u00e6kke i cirklen. Hvor mange mangler der?"
            },
            "speak_farm_feed_sheep": {
                "contenttype": "sound",
                "content": "farm_feed_sheep_81.mp3",
                "subtitle": "Nu giver hver s\u00e6k mad til 3 f\u00e5r. Hvor mange s\u00e6kke skal du bruge? Tryk p\u00e5 den gr\u00f8nne knap n\u00e5r du har trukket det rigtige antal s\u00e6kke ind i cirklen"
            },
            "speak_farm_feed_toomany": {
                "contenttype": "sound",
                "content": "farm_feed_toomany90.mp3",
                "subtitle": "Der er vist lidt for mange s\u00e6kke i cirklen. Hvor mange skal du tr\u00e6kke ud?"
            },
            "speak_farm_gather_cow": {
                "contenttype": "sound",
                "content": "farm_gather_cows.mp3",
                "subtitle": "Du skal hj\u00e6lpe mig med at finde 12 k\u00f8er. Tr\u00e6k dem ind i den store cirkel!"
            },
            "speak_farm_gather_duck": {
                "contenttype": "sound",
                "content": "farm_gather_ducks_83.mp3",
                "subtitle": "Du klarer det rigtig godt! S\u00e5 er vi ved at v\u00e6re f\u00e6rdige. Som det sidste skal du finde 12 \u00e6nder. Kan du det?"
            },
            "speak_farm_gather_horse": {
                "contenttype": "sound",
                "content": "farm_gather_horses_79.mp3",
                "subtitle": "Det var du god til. Nu skal du finde 12 heste."
            },
            "speak_farm_gather_sheep": {
                "contenttype": "sound",
                "content": "farm_gather_sheep_81.mp3",
                "subtitle": "S\u00e5 er det f\u00e5rnes tur til at f\u00e5 mad. Kan du finde 12 f\u00e5r?"
            },
            "speak_farm_gather_toomany": {
                "contenttype": "sound",
                "content": "farm_gather_toomany.mp3",
                "subtitle": "Nu er der vist lidt for mange dyr i cirklen. Hvor mange skal du tr\u00e6kke ud?"
            },
            "speak_farm_gold": {
                "contenttype": "sound",
                "content": "farm_gold_85.mp3",
                "subtitle": "Det var du god til. Som tak for hj\u00e6lpen f\u00e5r du her 1 guldm\u00f8nt, som du kan bruge i Karens Butik eller i Tidsmakinen. Har du lyst til at hj\u00e6lpe mig en gang til?"
            },
            "speak_farm_intro": {
                "contenttype": "sound",
                "content": "farm_intro_76.mp3",
                "subtitle": "Velkommen til Bondeg\u00e5rden. Her skal du hj\u00e6lpe med at samle dyrene s\u00e5 de kan f\u00e5 noget at spise. F\u00f8rst skal du finde dyrene. Tr\u00e6k det rigtig antal dyr ind p\u00e5 midten af den store cirkel. Tryk p\u00e5 den gr\u00f8nne knap for at komme i gang."
            },
            "speak_farm_motivation_1": {
                "contenttype": "sound",
                "content": "farm_motivation_88.mp3",
                "subtitle": "Jaja, nu er vi ved at v\u00e6re der"
            },
            "speak_farm_motivation_2": {
                "contenttype": "sound",
                "content": "farm_motivation_86.mp3",
                "subtitle": "Det er du god til!"
            },
            "speak_farm_motivation_3": {
                "contenttype": "sound",
                "content": "farm_motivation_87.mp3",
                "subtitle": "Det g\u00e5r godt - du har snart samlet alle dyrene"
            },
            "farm_correct": {
                "contenttype": "sound",
                "content": "farm_correct.mp3",
                "subtitle": ""
            },
            "farm_cow1": {
                "contenttype": "sound",
                "content": "ko.mp3",
                "subtitle": ""
            },
            "farm_cow2": {
                "contenttype": "sound",
                "content": "KO_02.mp3",
                "subtitle": ""
            },
            "farm_cow3": {
                "contenttype": "sound",
                "content": "KO_03.mp3",
                "subtitle": ""
            },
            "farm_cow4": {
                "contenttype": "sound",
                "content": "KO_04.mp3",
                "subtitle": ""
            },
            "farm_duck1": {
                "contenttype": "sound",
                "content": "goose.mp3",
                "subtitle": ""
            },
            "farm_duck2": {
                "contenttype": "sound",
                "content": "GAAS_01.mp3",
                "subtitle": ""
            },
            "farm_duck3": {
                "contenttype": "sound",
                "content": "GAAS_02.mp3",
                "subtitle": ""
            },
            "farm_duck4": {
                "contenttype": "sound",
                "content": "GAAS_03.mp3",
                "subtitle": ""
            },
            "farm_hay": {
                "contenttype": "sound",
                "content": "HOE_02.mp3",
                "subtitle": ""
            },
            "farm_hay_feed": {
                "contenttype": "sound",
                "content": "hay.mp3",
                "subtitle": ""
            },
            "farm_horse1": {
                "contenttype": "sound",
                "content": "horse.mp3",
                "subtitle": ""
            },
            "farm_horse2": {
                "contenttype": "sound",
                "content": "HEST_02.mp3",
                "subtitle": ""
            },
            "farm_horse3": {
                "contenttype": "sound",
                "content": "HEST_03.mp3",
                "subtitle": ""
            },
            "farm_horse4": {
                "contenttype": "sound",
                "content": "HEST_04.mp3",
                "subtitle": ""
            },
            "farm_sheep1": {
                "contenttype": "sound",
                "content": "sheep.mp3",
                "subtitle": ""
            },
            "farm_sheep2": {
                "contenttype": "sound",
                "content": "FAAR_01.mp3",
                "subtitle": ""
            },
            "farm_sheep3": {
                "contenttype": "sound",
                "content": "FAAR_02.mp3",
                "subtitle": ""
            },
            "farm_sheep4": {
                "contenttype": "sound",
                "content": "FAAR_03.mp3",
                "subtitle": ""
            }
        });
    } else {
        $.ajax({
            type: 'GET',
            url: 'gameadmin/getcontent/farm.json',
            contentType: 'application/json; charset=utf-8',
            dataType: 'json',
        }).done(loadFarmResources);
    }
}


function loadFarmResources(data) {
    gameLoader = new PIXI.Loader();
    $.each(data, function(key, val) {
        //console.log(val.content);
        gameLoader.add(key, "files/" + val.content);

        subtitleArray[key] = val.subtitle;

        gameSoundArray.push(key);
    })

    showPreloader();
    gameLoader.on('progress', preloadProgress);

    gameLoader.add("images/farm/farmbg.png")
        .add("images/farm/animal-shadow.png")
        .add("images/farm/farmIntroBG.png")
        .add("images/farm/hayGameBG.png")
        .add("images/farm/hayIntroBG.png")
        .add("images/farm/hayGameEndBG.png")
        .add("images/farm/OverlayOutro.png")
        .add("images/farm/hand.png")
        .add("images/farm/cowtrough.json")
        .add("images/farm/horsetrough.json")
        .add("images/farm/sheeptrough.json")
        .add("images/farm/ducktrough.json")
        .add("images/farm/troughHay.json")
        .add("images/farm/sack.json")
        .add("images/farm/farmIntro_anim.json")
        .add("images/farm/bottombar.json")
        .add("images/farm/topbar.json")
        .add("images/farm/topbarHay.json")
        .add("images/farm/cow1.json")
        .add("images/farm/cow2.json")
        .add("images/farm/cow1_drag.json")
        .add("images/farm/cow2_drag.json")
        .add("images/farm/hayIntroCow.json")
        .add("images/farm/hayIntroHorse.json")
        .add("images/farm/hayIntroSheep.json")
        .add("images/farm/hayIntroGoose.json")
        .add("images/farm/horse1.json")
        .add("images/farm/horse2.json")
        .add("images/farm/horse3.json")
        .add("images/farm/horse1_drag.json")
        .add("images/farm/horse2_drag.json")
        .add("images/farm/horse3_drag.json")
        .add("images/farm/sheep1.json")
        .add("images/farm/sheep2.json")
        .add("images/farm/sheep3.json")
        .add("images/farm/sheep1_drag.json")
        .add("images/farm/sheep2_drag.json")
        .add("images/farm/sheep3_drag.json")
        .add("images/farm/goose1.json")
        .add("images/farm/goose2.json")
        .add("images/farm/goose3.json")
        .add("images/farm/goose1_drag.json")
        .add("images/farm/goose2_drag.json")
        .load(initFarmGame);

}

//var gameplayContainer;

function initFarmGame(loader, resources) {
    gameConfig = {};
    gameConfig.farmLevel = 1;

    bottomBar.y = 550;

    var farmBG = createSprite("images/farm/farmbg.png", 50, -50, gameLoader);
    gameContainer.addChild(farmBG);
    cleanUpArray.push(farmBG);

    if (universeBtn) {
        gameContainer.addChild(universeBtn);
    } else {
        universeBtn = createMC("UniverseButton00", 2, 780, 10);
        universeBtn.gotoAndStop(0);
        gameContainer.addChild(universeBtn);
        makeButton(universeBtn, backToUniverse);
    }

    gameConfig.animalContainer = new PIXI.Container();
    gameContainer.addChild(gameConfig.animalContainer);
    cleanUpRemoveArray.push(gameConfig.animalContainer);

    gameConfig.farmPoints = createMCGC("pointsbar instance 100", 5, 280, 565);
    gameConfig.farmPoints.gotoAndStop(0);
    gameContainer.addChild(gameConfig.farmPoints);
    cleanUpRemoveArray.push(gameConfig.farmPoints);

    if (gameConfig.farmTop) {
        gameContainer.removeChild(gameConfig.farmTop);
    }
    gameConfig.farmTop = createMCGC("topbar_score00", 4, 385, -3);
    gameConfig.farmTop.gotoAndStop(0);
    gameContainer.addChild(gameConfig.farmTop);
    cleanUpRemoveArray.push(gameConfig.farmTop);


    if (gameConfig.scoreTF) {
        gameContainer.setChildIndex(gameConfig.scoreTFBG, gameContainer.children.length - 1);
        gameConfig.scoreTFBG.clear();
        gameConfig.scoreTFBG.beginFill(0xffffff);
        gameConfig.scoreTFBG.drawRect(0, 0, 73, 72);
        gameConfig.scoreTFBG.x = 565;
        cleanUpArray.push(gameConfig.scoreTFBG);

        gameContainer.setChildIndex(gameConfig.scoreTF, gameContainer.children.length - 1);
        gameConfig.scoreTF.text = "0";
        gameConfig.scoreTF.x = 586;
        cleanUpArray.push(gameConfig.scoreTF);
    } else {
        gameConfig.scoreTFBG = new PIXI.Graphics();
        gameConfig.scoreTFBG.beginFill(0xffffff);
        gameConfig.scoreTFBG.drawRect(0, 0, 73, 72);
        gameConfig.scoreTFBG.x = 565;
        gameConfig.scoreTFBG.y = 9;
        gameContainer.addChild(gameConfig.scoreTFBG);
        cleanUpArray.push(gameConfig.scoreTFBG);

        gameConfig.scoreTF = new PIXI.Text("0", scoreLabelStyle);
        gameConfig.scoreTF.x = 586;
        gameConfig.scoreTF.y = 15;
        gameContainer.addChild(gameConfig.scoreTF);
        cleanUpArray.push(gameConfig.scoreTF);
    }

    showFarmIntro();

    gameConfig.playingSound = playSound("speak_farm_intro");
}

function showFarmIntro() {
    gamePopup = new PIXI.Container();
    gamePopup.x = 250;
    gamePopup.y = 100;
    gameContainer.addChild(gamePopup);
    cleanUpRemoveArray.push(gamePopup);

    var introBG = createSprite("images/farm/farmIntroBG.png", 0, 0, gameLoader);
    gamePopup.addChild(introBG);
    cleanUpArray.push(introBG);

    var introAnim = createMCGC("Symbol 25200", 85, 245, 85);
    gamePopup.addChild(introAnim);
    cleanUpRemoveArray.push(introAnim);

    var nextBtn = createNextBtn();
    nextBtn.x = 360;
    nextBtn.y = 340;
    nextBtn.on('pointerdown', readyFarmGame);
    gamePopup.addChild(nextBtn);
    cleanUpRemoveArray.push(nextBtn);
}

function readyFarmGame() {
    gameConfig.playingSound.stop();
    gamePopup.parent.removeChild(gamePopup);

    startFarmLevel();
}

function startFarmLevel() {
    gameConfig.farmPoints.gotoAndStop(gameConfig.farmLevel);

    if (gameConfig.farmTop) {
        gameContainer.removeChild(gameConfig.farmTop);
    }

    gameConfig.farmTop = createMCGC("topbar_score00", 4, 385, -3);
    gameConfig.farmTop.gotoAndStop(gameConfig.farmLevel - 1);
    gameContainer.addChild(gameConfig.farmTop);
    cleanUpRemoveArray.push(gameConfig.farmTop);

    gameContainer.setChildIndex(gameConfig.scoreTFBG, gameContainer.children.length - 1);
    gameConfig.scoreTFBG.clear();
    gameConfig.scoreTFBG.beginFill(0xffffff);
    gameConfig.scoreTFBG.drawRect(0, 0, 73, 72);
    gameConfig.scoreTFBG.x = 565;

    gameContainer.setChildIndex(gameConfig.scoreTF, gameContainer.children.length - 1);
    gameConfig.scoreTF.text = "0";
    gameConfig.scoreTF.x = 586;

    gameConfig.scoreTFBG.clear();
    gameConfig.scoreTFBG.beginFill(0xffffff);
    gameConfig.scoreTFBG.drawRect(0, 0, 73, 72);

    gameConfig.farmGameHitArray = new Array();

    var animalArray = new Array();
    animalArray.length = 12;

    var animalPosArray = new Array([206, 423], [279, 477], [351, 546], [475, 416], [500, 494], [555, 536], [623, 385], [697, 449], [801, 514], [810, 390], [803, 327], [769, 251]);

    for (var i = 0; i < animalArray.length; i++) {
        animalArray[i] = placeAnimal();
        animalArray[i].x = animalPosArray[i][0];
        animalArray[i].y = animalPosArray[i][1];
        animalArray[i].choords = animalPosArray[i];
    }
}

function placeAnimal() {
    var animal = new PIXI.Container();
    var animalShadowSprite = createSprite("images/farm/animal-shadow.png", 0, 0, gameLoader);
    animal.addChild(animalShadowSprite);
    cleanUpArray.push(animalShadowSprite);

    if (gameConfig.farmLevel == 1) {
        gameConfig.animalType = "cow";
        playSound("speak_farm_gather_cow");

        var type = Math.floor(Math.random() * 2);
        var cow1 = createMCGC("cow1", 99, 80, -36);
        cleanUpArray.push(cow1);
        cow1.gotoAndPlay(Math.floor(Math.random() * 100));
        animal.addChild(cow1);
        var cow1_drag = createMCGC("cow1_drag", 31, 120, -22);
        cleanUpArray.push(cow1_drag);
        cow1_drag.scale.x = -1;
        cow1_drag.rotation = -0.3;
        cow1_drag.visible = false;
        animal.addChild(cow1_drag);
        animal.count = 1;

        if (type == 1) {
            animal.count = 2;
            cow1.scale.x = -1;
            cow1.x = 165;
            var cow2 = createMCGC("cow2", 99, 46, -12);
            cleanUpArray.push(cow2);
            cow2.gotoAndPlay(Math.floor(Math.random() * 100));
            animal.addChild(cow2);

            var cow2_drag = createMCGC("cow2_drag", 24, 46, -12);
            cleanUpArray.push(cow2_drag);
            cow2_drag.visible = false;
            animal.addChild(cow2_drag);
        }
    } else if (gameConfig.farmLevel == 2) {
        gameConfig.animalType = "horse";
        playSound("speak_farm_gather_horse");

        var type = Math.floor(Math.random() * 3);
        var horse1 = createMCGC("horse1", 99, 80, -40);
        cleanUpArray.push(horse1);
        horse1.gotoAndPlay(Math.floor(Math.random() * 100));
        animal.addChild(horse1);
        var horse1_drag = createMCGC("horse1_drag", 17, 90, -12);
        cleanUpArray.push(horse1_drag);
        //horse1_drag.scale.x=-1;
        //horse1_drag.rotation=-0.3;
        horse1_drag.visible = false;
        animal.addChild(horse1_drag);
        animal.count = 1;

        if (type >= 1) {
            animal.count = 2;
            horse1.x = 65;
            var horse2 = createMCGC("horse2", 99, 100, -32);
            cleanUpArray.push(horse2);
            horse2.gotoAndPlay(Math.floor(Math.random() * 100));
            animal.addChild(horse2);

            var horse2_drag = createMCGC("horse2_drag", 25, 70, -12);
            cleanUpArray.push(horse2_drag);
            horse2_drag.visible = false;
            animal.addChild(horse2_drag);
        }

        if (type >= 2) {
            animal.count = 3;
            horse1.x = 75;
            horse1.y = -50;
            horse2.x = 110;
            var horse3 = createMCGC("horse3", 99, 58, -34);
            horse3.gotoAndPlay(Math.floor(Math.random() * 100));
            cleanUpArray.push(horse3);
            animal.addChild(horse3);

            var horse3_drag = createMCGC("horse3_drag", 40, 46, -12);
            cleanUpArray.push(horse3_drag);
            horse3_drag.visible = false;
            animal.addChild(horse3_drag);
        }
    } else if (gameConfig.farmLevel == 3) {
        gameConfig.animalType = "sheep";
        playSound("speak_farm_gather_sheep");

        var type = Math.floor(Math.random() * 4);
        var sheep1 = createMCGC("sheep100", 99, 70, -18);
        sheep1.gotoAndPlay(Math.floor(Math.random() * 100));
        cleanUpArray.push(sheep1);
        animal.addChild(sheep1);
        var sheep1_drag = createMCGC("sheep1_drag00", 17, 80, -7);
        cleanUpArray.push(sheep1_drag);
        //sheep1_drag.scale.x=-1;
        //sheep1_drag.rotation=-0.3;
        sheep1_drag.visible = false;
        animal.addChild(sheep1_drag);
        animal.count = 1;

        if (type >= 1) {
            animal.count = 2;
            sheep1.x = 100;
            var sheep2 = createMCGC("sheep200", 99, 56, 0);
            cleanUpArray.push(sheep2);
            sheep2.gotoAndPlay(Math.floor(Math.random() * 100));
            animal.addChild(sheep2);

            var sheep2_drag = createMCGC("sheep2_drag00", 14, 46, -12);
            cleanUpArray.push(sheep2_drag);
            sheep2_drag.visible = false;
            animal.addChild(sheep2_drag);
        }

        if (type >= 2) {
            animal.count = 3;
            sheep1.y = -30;
            var sheep3 = createMCGC("sheep300", 99, 120, -12);
            cleanUpArray.push(sheep3);
            sheep3.gotoAndPlay(Math.floor(Math.random() * 100));
            animal.addChild(sheep3);

            var sheep3_drag = createMCGC("sheep3_drag00", 43, 66, -12);
            cleanUpArray.push(sheep3_drag);
            sheep3_drag.visible = false;
            animal.addChild(sheep3_drag);
        }

        if (type >= 3) {
            animal.count = 4;
            //cow1.scale.x=-1;
            //cow1.x=165;
            var sheep4 = createMCGC("sheep100", 99, 45, -12);
            cleanUpArray.push(sheep4);
            sheep4.gotoAndPlay(Math.floor(Math.random() * 100));
            animal.addChild(sheep4);

            var sheep4_drag = createMCGC("sheep1_drag00", 14, 46, -12);
            cleanUpArray.push(sheep4_drag);
            sheep4_drag.visible = false;
            animal.addChild(sheep4_drag);
        }
    } else if (gameConfig.farmLevel == 4) {
        gameConfig.animalType = "duck";
        playSound("speak_farm_gather_duck");

        var type = Math.floor(Math.random() * 5);
        var goose1 = createMCGC("goose100", 99, 80, -20);
        cleanUpArray.push(goose1);
        goose1.gotoAndPlay(Math.floor(Math.random() * 100));
        animal.addChild(goose1);

        var goose1_drag = createMCGC("goose1_drag00", 35, 80, 38);
        cleanUpArray.push(goose1_drag);
        goose1_drag.rotation = -1.57;
        goose1_drag.visible = false;
        animal.addChild(goose1_drag);
        animal.count = 1;

        if (type >= 1) {
            animal.count = 2;
            goose1.x = 100;
            var goose2 = createMCGC("goose200", 99, 56, -16);
            cleanUpArray.push(goose2);
            goose2.gotoAndPlay(Math.floor(Math.random() * 100));
            animal.addChild(goose2);

            var goose2_drag = createMCGC("goose2_drag00", 29, 130, -4);
            cleanUpArray.push(goose2_drag);
            goose2_drag.rotation = 1.57;
            goose2_drag.visible = false;
            animal.addChild(goose2_drag);
        }

        if (type >= 2) {
            animal.count = 3;
            //cow1.scale.x=-1;
            //cow1.x=165;
            var goose3 = createMCGC("goose300", 99, 70, -16);
            cleanUpArray.push(goose3);
            goose3.gotoAndPlay(Math.floor(Math.random() * 100));
            animal.addChild(goose3);

            var goose3_drag = createMCGC("goose1_drag00", 35, 80, 30);
            cleanUpArray.push(goose3_drag);
            goose3_drag.visible = false;
            goose3_drag.rotation = -1;
            animal.addChild(goose3_drag);
        }

        if (type >= 3) {
            animal.count = 4;
            //cow1.scale.x=-1;
            //cow1.x=165;
            var goose4 = createMCGC("goose100", 99, 90, -12);
            cleanUpArray.push(goose4);
            goose4.gotoAndPlay(Math.floor(Math.random() * 100));
            animal.addChild(goose4);

            var goose4_drag = createMCGC("goose2_drag00", 29, 86, -8);
            cleanUpArray.push(goose4_drag);
            goose4_drag.visible = false;
            animal.addChild(goose4_drag);
        }

        if (type >= 4) {
            animal.count = 5;

            var goose5 = createMCGC("goose300", 99, 35, -12);
            cleanUpArray.push(goose5);
            goose5.gotoAndPlay(Math.floor(Math.random() * 100));
            animal.addChild(goose5);

            var goose5_drag = createMCGC("goose1_drag00", 35, 140, -7);
            cleanUpArray.push(goose5_drag);
            goose5_drag.visible = false;
            goose5_drag.rotation = 1.3;
            animal.addChild(goose5_drag);
        }
    }

    //drag
    animal.interactive = true;
    animal.buttonMode = true;
    animal.pivot.set(100, 0);

    animal
        .on('pointerdown', onAnimalDragStart)
        .on('pointerup', onAnimalDragEnd)
        .on('pointerupoutside', onAnimalDragEnd)
        .on('pointermove', onAnimalDragMove);

    gameConfig.animalContainer.addChild(animal);
    cleanUpRemoveArray.push(animal);

    return animal;
}

function onAnimalDragStart(event) {
    // store a reference to the data
    // the reason for this is because of multitouch
    // we want to track the movement of this particular touch
    this.data = event.data;
    this.dragging = true;

    this.children[0].visible = false;
    if (this.children.length < 4) {
        playRandomSound(["farm_" + gameConfig.animalType + "1", "farm_" + gameConfig.animalType + "2", "farm_" + gameConfig.animalType + "3", "farm_" + gameConfig.animalType + "4"]);
        this.children[1].visible = false;
        this.children[2].visible = true;
        this.children[2].gotoAndPlay(Math.floor(Math.random() * 17));
    } else if (this.children.length < 6) {
        playRandomSound(["farm_" + gameConfig.animalType + "1", "farm_" + gameConfig.animalType + "2", "farm_" + gameConfig.animalType + "3", "farm_" + gameConfig.animalType + "4"]);
        playRandomSound(["farm_" + gameConfig.animalType + "1", "farm_" + gameConfig.animalType + "2", "farm_" + gameConfig.animalType + "3", "farm_" + gameConfig.animalType + "4"]);
        this.children[1].visible = false;
        this.children[2].visible = true;
        this.children[2].gotoAndPlay(Math.floor(Math.random() * 17));
        this.children[3].visible = false;
        this.children[4].visible = true;
        this.children[4].gotoAndPlay(Math.floor(Math.random() * 14));
    } else if (this.children.length < 8) {
        playRandomSound(["farm_" + gameConfig.animalType + "1", "farm_" + gameConfig.animalType + "2", "farm_" + gameConfig.animalType + "3", "farm_" + gameConfig.animalType + "4"]);
        playRandomSound(["farm_" + gameConfig.animalType + "1", "farm_" + gameConfig.animalType + "2", "farm_" + gameConfig.animalType + "3", "farm_" + gameConfig.animalType + "4"]);
        this.children[1].visible = false;
        this.children[2].visible = true;
        this.children[2].gotoAndPlay(Math.floor(Math.random() * 17));
        this.children[3].visible = false;
        this.children[4].visible = true;
        this.children[4].gotoAndPlay(Math.floor(Math.random() * 14));
        this.children[5].visible = false;
        this.children[6].visible = true;
        this.children[6].gotoAndPlay(Math.floor(Math.random() * 29));
    } else if (this.children.length < 10) {
        playRandomSound(["farm_" + gameConfig.animalType + "1", "farm_" + gameConfig.animalType + "2", "farm_" + gameConfig.animalType + "3", "farm_" + gameConfig.animalType + "4"]);
        playRandomSound(["farm_" + gameConfig.animalType + "1", "farm_" + gameConfig.animalType + "2", "farm_" + gameConfig.animalType + "3", "farm_" + gameConfig.animalType + "4"]);
        this.children[1].visible = false;
        this.children[2].visible = true;
        this.children[2].gotoAndPlay(Math.floor(Math.random() * 17));
        this.children[3].visible = false;
        this.children[4].visible = true;
        this.children[4].gotoAndPlay(Math.floor(Math.random() * 14));
        this.children[5].visible = false;
        this.children[6].visible = true;
        this.children[6].gotoAndPlay(Math.floor(Math.random() * 29));
        this.children[7].visible = false;
        this.children[8].visible = true;
        this.children[8].gotoAndPlay(Math.floor(Math.random() * 35));
    } else {
        playRandomSound(["farm_" + gameConfig.animalType + "1", "farm_" + gameConfig.animalType + "2", "farm_" + gameConfig.animalType + "3", "farm_" + gameConfig.animalType + "4"]);
        playRandomSound(["farm_" + gameConfig.animalType + "1", "farm_" + gameConfig.animalType + "2", "farm_" + gameConfig.animalType + "3", "farm_" + gameConfig.animalType + "4"]);
        this.children[1].visible = false;
        this.children[2].visible = true;
        this.children[2].gotoAndPlay(Math.floor(Math.random() * 17));
        this.children[3].visible = false;
        this.children[4].visible = true;
        this.children[4].gotoAndPlay(Math.floor(Math.random() * 14));
        this.children[5].visible = false;
        this.children[6].visible = true;
        this.children[6].gotoAndPlay(Math.floor(Math.random() * 29));
        this.children[7].visible = false;
        this.children[8].visible = true;
        this.children[8].gotoAndPlay(Math.floor(Math.random() * 35));
        this.children[9].visible = false;
        this.children[10].visible = true;
        this.children[10].gotoAndPlay(Math.floor(Math.random() * 35));
    }

    this.parent.setChildIndex(this, this.parent.children.length - 1);
}

function onAnimalDragEnd() {
    this.dragging = false;
    this.children[0].visible = true;
    if (this.children.length < 4) {
        this.children[1].visible = true;
        this.children[2].visible = false;
    } else if (this.children.length < 6) {
        this.children[1].visible = true;
        this.children[2].visible = false;
        this.children[3].visible = true;
        this.children[4].visible = false;
    } else if (this.children.length < 8) {
        this.children[1].visible = true;
        this.children[2].visible = false;
        this.children[3].visible = true;
        this.children[4].visible = false;
        this.children[5].visible = true;
        this.children[6].visible = false;
    } else if (this.children.length < 10) {
        this.children[1].visible = true;
        this.children[2].visible = false;
        this.children[3].visible = true;
        this.children[4].visible = false;
        this.children[5].visible = true;
        this.children[6].visible = false;
        this.children[7].visible = true;
        this.children[8].visible = false;
    } else {
        this.children[1].visible = true;
        this.children[2].visible = false;
        this.children[3].visible = true;
        this.children[4].visible = false;
        this.children[5].visible = true;
        this.children[6].visible = false;
        this.children[7].visible = true;
        this.children[8].visible = false;
        this.children[9].visible = true;
        this.children[10].visible = false;
    }

    // set the interaction data to null
    this.data = null;

    for (var i = 0; i < gameConfig.farmGameHitArray.length; i++) {
        if (gameConfig.farmGameHitArray[i] == this) {
            gameConfig.farmGameHitArray.splice(i, 1);
            break;
        }
    }

    if ((this.x > 145 && this.x < 650) && (this.y > 125 && this.y < 300)) {
        //hit
        gameConfig.farmGameHitArray.push(this);

    } else {
        //replace
        this.x = this.choords[0];
        this.y = this.choords[1];
    }

    checkFarmScore();
}

function onAnimalDragMove() {
    if (this.dragging) {
        var newPosition = this.data.getLocalPosition(this.parent);
        this.x = newPosition.x;
        this.y = newPosition.y;
    }
}

function checkFarmScore() {
    var score = 0;
    for (var i = 0; i < gameConfig.farmGameHitArray.length; i++) {
        score += gameConfig.farmGameHitArray[i].count;
    }

    if (score > 9) {
        gameConfig.scoreTF.x = 572;
    } else {
        gameConfig.scoreTF.x = 586;
    }
    gameConfig.scoreTF.text = score;

    if (score == 12) {
        gameConfig.scoreTFBG.clear();
        gameConfig.scoreTFBG.beginFill(0x00ff00);
        gameConfig.scoreTFBG.drawRect(0, 0, 73, 72);

        if (gameConfig.farmLevel >= 5) {
            //game over
            //restartGame();
        } else {
            //show hay game intro

            playSound("farm_correct");
            gameConfig.scoreTFBG.clear();
            gameConfig.scoreTFBG.beginFill(0x00ff00);
            gameConfig.scoreTFBG.drawRect(0, 0, 73, 72);

            gameConfig.initHayGameTimer = setTimeout(initHayGame, 1000);

            //nextLevelFarm();
        }
    } else if (score > 12) {
        gameConfig.playingSound = playSound("speak_farm_gather_toomany");

        gameConfig.scoreTFBG.clear();
        gameConfig.scoreTFBG.beginFill(0xff0000);
        gameConfig.scoreTFBG.drawRect(0, 0, 73, 72);
    } else {
        gameConfig.scoreTFBG.clear();
        gameConfig.scoreTFBG.beginFill(0xffffff);
        gameConfig.scoreTFBG.drawRect(0, 0, 73, 72);
    }
}

function initHayGame() {
    gameConfig.animalContainer.removeChildren();
    gameConfig.farmGameHitArray = new Array();

    gameConfig.hayGame = new PIXI.Container();
    gameConfig.animalContainer.addChild(gameConfig.hayGame);

    var hayGameBG = createSprite("images/farm/hayGameBG.png", 48, 0, gameLoader);
    gameConfig.hayGame.addChild(hayGameBG);
    cleanUpArray.push(hayGameBG);

    gameContainer.setChildIndex(universeBtn, gameContainer.children.length - 1);

    gameContainer.removeChild(gameConfig.farmTop);

    gameConfig.farmTop = createMCGC("topbarHay_score00", 4, 385, -3);
    gameConfig.farmTop.gotoAndStop(gameConfig.farmLevel - 1);
    gameContainer.addChild(gameConfig.farmTop);
    cleanUpArray.push(gameConfig.farmTop);

    gameContainer.setChildIndex(gameConfig.scoreTFBG, gameContainer.children.length - 1);
    gameConfig.scoreTFBG.clear();
    gameConfig.scoreTFBG.beginFill(0xffffff);
    gameConfig.scoreTFBG.drawRect(0, 0, 73, 72);
    gameConfig.scoreTFBG.x = 653;

    gameContainer.setChildIndex(gameConfig.scoreTF, gameContainer.children.length - 1);
    gameConfig.scoreTF.text = "0";
    gameConfig.scoreTF.x = 676;

    showHayIntro();
}


function showHayIntro() {
    gameConfig.playingSound = playSound("speak_farm_feed_" + gameConfig.animalType);

    gamePopup = new PIXI.Container();
    gamePopup.x = 250;
    gamePopup.y = 100;
    gameContainer.addChild(gamePopup);

    var introBG = createSprite("images/farm/hayIntroBG.png", 0, 0, gameLoader);
    gamePopup.addChild(introBG);
    cleanUpArray.push(introBG);

    if (gameConfig.farmLevel == 1) {
        var introAnim = createMCGC("hayIntroCow00", 61, 200, 40);
    } else if (gameConfig.farmLevel == 2) {
        introAnim = createMCGC("hayIntroHorse0", 124, 170, 40);
    } else if (gameConfig.farmLevel == 3) {
        introAnim = createMCGC("hayIntroSheep00", 72, 150, 40);
    } else if (gameConfig.farmLevel == 4) {
        introAnim = createMCGC("hayIntroGoose0", 107, 125, 40);
    }
    gamePopup.addChild(introAnim);
    cleanUpArray.push(introAnim);

    var nextBtn = createNextBtn();
    nextBtn.x = 360;
    nextBtn.y = 340;
    nextBtn.on('pointerdown', closeHayIntro);
    gamePopup.addChild(nextBtn);
    cleanUpRemoveArray.push(nextBtn);
}

function closeHayIntro() {
    gameConfig.playingSound.stop();
    gamePopup.parent.removeChild(gamePopup);

    showHayGame();
}

function showHayGame() {
    gameConfig.hayGameHitArray = new Array();

    gameConfig.hayAnimalArray = new Array();
    //show animals
    if (gameConfig.farmLevel == 1) {
        var cow;
        for (var i = 0; i < 12; i++) {
            cow = createMCGC("cowtrough", 124, 130 + (i * 65), 135); //95 eller 124
            cow.onFrameChange = function() {
                if (this.currentFrame == 95) {
                    this.gotoAndPlay(0);
                }
            }
            cow.gotoAndPlay(Math.floor(Math.random() * cow.totalFrames));
            gameConfig.hayGame.addChild(cow);
            gameConfig.hayAnimalArray.push(cow);
            cleanUpRemoveArray.push(cow);
        }
    } else if (gameConfig.farmLevel == 2) {
        var horse;
        for (var i = 0; i < 12; i++) {
            horse = createMCGC("horsetrough", 113, 130 + (i * 65), 130); //95 eller 113
            horse.onFrameChange = function() {
                if (this.currentFrame == 95) {
                    this.gotoAndPlay(0);
                }
            }
            horse.gotoAndPlay(Math.floor(Math.random() * horse.totalFrames));
            gameConfig.hayGame.addChild(horse);
            gameConfig.hayAnimalArray.push(horse);
            cleanUpRemoveArray.push(horse);
        }
    } else if (gameConfig.farmLevel == 3) {
        var sheep;
        for (var i = 0; i < 12; i++) {
            sheep = createMCGC("sheeptrough", 115, 130 + (i * 65), 145); //95 eller 115
            sheep.onFrameChange = function() {
                if (this.currentFrame == 95) {
                    this.gotoAndPlay(0);
                }
            }
            sheep.gotoAndPlay(Math.floor(Math.random() * sheep.totalFrames));

            gameConfig.hayGame.addChild(sheep);
            gameConfig.hayAnimalArray.push(sheep);
            cleanUpRemoveArray.push(sheep);
        }
    } else {
        var goose;
        for (var i = 0; i < 12; i++) {
            goose = createMCGC("goosetrough", 114, 130 + (i * 65), 148); //95 eller 114
            goose.onFrameChange = function() {
                if (this.currentFrame == 95) {
                    this.gotoAndPlay(0);
                }
            }
            goose.gotoAndPlay(Math.floor(Math.random() * goose.totalFrames));
            gameConfig.hayGame.addChild(goose);
            gameConfig.hayAnimalArray.push(goose);
            cleanUpRemoveArray.push(goose);
        }
    }

    //show sacks - drag sacks (get from animate)
    gameConfig.sackArray = new Array();
    var sack;
    var sackPos = new Array([866, 283], [884, 304], [843, 300], [890, 326], [808, 313], [840, 324], [897, 360], [891, 390], [850, 341], [849, 369], [805, 341], [818, 375], [904, 421], [855, 404], [859, 433], [810, 408]);
    for (i = 0; i < 16; i++) {
        sack = createMCGC("sack00", 5, sackPos[i][0], sackPos[i][1]);
        sack.choords = [sackPos[i][0], sackPos[i][1]];
        sack.gotoAndStop(0);
        gameConfig.hayGame.addChild(sack);
        cleanUpRemoveArray.push(sack);
        //setup dragging
        //drag
        sack.interactive = true;
        sack.buttonMode = true;
        sack.pivot.set(25, 25);

        sack
            .on('pointerdown', onSackDragStart)
            .on('pointerup', onSackDragEnd)
            .on('pointerupoutside', onSackDragEnd)
            .on('pointermove', onSackDragMove);

        gameConfig.sackArray.push(sack);
    }

    //count - if12
    //animate sack
    //animate trough hay
    //show animal-anim
    //goto next level

    gameConfig.hayNextBtn = createNextBtn();
    gameConfig.hayNextBtn.x = 190;
    gameConfig.hayNextBtn.y = 400;
    gameConfig.hayNextBtn.on('pointerdown', checkSackScore);
    gameConfig.hayGame.addChild(gameConfig.hayNextBtn);
    cleanUpRemoveArray.push(gameConfig.hayNextBtn);
}


function onSackDragStart(event) {
    // store a reference to the data
    // the reason for this is because of multitouch
    // we want to track the movement of this particular touch
    this.data = event.data;
    this.dragging = true;

    this.parent.setChildIndex(this, this.parent.children.length - 1);
}

function onSackDragEnd() {
    this.dragging = false;
    this.data = null;

    playSound("farm_hay");

    for (var i = 0; i < gameConfig.hayGameHitArray.length; i++) {
        if (gameConfig.hayGameHitArray[i] == this) {
            gameConfig.hayGameHitArray.splice(i, 1);
            break;
        }
    }

    if ((this.x > 300 && this.x < 690) && (this.y > 255 && this.y < 455)) {
        //hit
        gameConfig.hayGameHitArray.push(this);
    } else {
        //replace
        this.x = this.choords[0];
        this.y = this.choords[1];
    }

    updateSackScore();
}

function onSackDragMove() {
    if (this.dragging) {
        var newPosition = this.data.getLocalPosition(this.parent);
        this.x = newPosition.x;
        this.y = newPosition.y;
    }
}

function updateSackScore() {
    var score = 0;

    score = gameConfig.hayGameHitArray.length;

    if (score > 9) {
        gameConfig.scoreTF.x = 662;
    } else {
        gameConfig.scoreTF.x = 676;
    }
    gameConfig.scoreTF.text = score;

    gameConfig.scoreTFBG.clear();
    gameConfig.scoreTFBG.beginFill(0xffffff);
    gameConfig.scoreTFBG.drawRect(0, 0, 73, 72);
    gameConfig.scoreTFBG.x = 653;
}

function checkSackScore() {
    gameConfig.hayNextBtn.interactive = false;

    var score = 0;

    score = gameConfig.hayGameHitArray.length;

    if (score > 9) {
        gameConfig.scoreTF.x = 662;
    } else {
        gameConfig.scoreTF.x = 676;
    }
    gameConfig.scoreTF.text = score;

    score = score * gameConfig.farmLevel;

    if (score == 12) {
        playSound("farm_correct");
        gameConfig.scoreTFBG.clear();
        gameConfig.scoreTFBG.beginFill(0x00ff00);
        gameConfig.scoreTFBG.drawRect(0, 0, 73, 72);

        //stop dragging
        for (var i = 0; i < gameConfig.sackArray.length; i++) {
            gameConfig.sackArray[i].interactive = false;
        }

        gameConfig.troughAnimIndex = 0;
        playTroughAnim();
    } else if (score < 12) {
        var haySound = playSound("speak_farm_feed_missing");
        haySound.on('end', function() {
            gameConfig.hayNextBtn.interactive = true;
        });
        gameConfig.scoreTFBG.clear();
        gameConfig.scoreTFBG.beginFill(0xff0000);
        gameConfig.scoreTFBG.drawRect(0, 0, 73, 72);
    } else {
        haySound = playSound("speak_farm_feed_toomany");
        haySound.on('end', function() {
            gameConfig.hayNextBtn.interactive = true;
        });
        gameConfig.scoreTFBG.clear();
        gameConfig.scoreTFBG.beginFill(0xff0000);
        gameConfig.scoreTFBG.drawRect(0, 0, 73, 72);
    }
}

function playTroughAnim() {

    //open sacks and show hay
    gameConfig.hayGameHitArray[gameConfig.troughAnimIndex].loop = false;
    gameConfig.hayGameHitArray[gameConfig.troughAnimIndex].gotoAndPlay(1);

    setTimeout(addTroughHay, 300);

    setTimeout(animalEat, 450);

    setTimeout(nextTroughAnim, 600);
}

function nextTroughAnim() {
    gameConfig.troughAnimIndex++;
    if (gameConfig.troughAnimIndex >= (12 / gameConfig.farmLevel)) {
        setTimeout(playFarmEndAnim, 650);
    } else {
        playTroughAnim();
    }
}

function addTroughHay() {
    playSound("farm_hay_feed");
    if (gameConfig.farmLevel == 1) {
        hay = createMCGC("troughHay00", 4, 130 + (65 * gameConfig.troughAnimIndex), 176);
        hay.loop = false;
        gameConfig.hayGame.addChild(hay);
        cleanUpRemoveArray.push(hay);
    } else if (gameConfig.farmLevel == 2) {
        hay = createMCGC("troughHay00", 4, 130 + (65 * gameConfig.troughAnimIndex * gameConfig.farmLevel), 176);
        hay.loop = false;
        gameConfig.hayGame.addChild(hay);
        cleanUpRemoveArray.push(hay);

        hay = createMCGC("troughHay00", 4, 130 + (65 * (gameConfig.troughAnimIndex * gameConfig.farmLevel + 1)), 176);
        hay.loop = false;
        gameConfig.hayGame.addChild(hay);
        cleanUpRemoveArray.push(hay);
    } else if (gameConfig.farmLevel == 3) {
        hay = createMCGC("troughHay00", 4, 130 + (65 * gameConfig.troughAnimIndex * gameConfig.farmLevel), 176);
        hay.loop = false;
        gameConfig.hayGame.addChild(hay);
        cleanUpRemoveArray.push(hay);

        hay = createMCGC("troughHay00", 4, 130 + (65 * (gameConfig.troughAnimIndex * gameConfig.farmLevel + 1)), 176);
        hay.loop = false;
        gameConfig.hayGame.addChild(hay);
        cleanUpRemoveArray.push(hay);

        hay = createMCGC("troughHay00", 4, 130 + (65 * (gameConfig.troughAnimIndex * gameConfig.farmLevel + 2)), 176);
        hay.loop = false;
        gameConfig.hayGame.addChild(hay);
        cleanUpRemoveArray.push(hay);

    } else {
        hay = createMCGC("troughHay00", 4, 130 + (65 * gameConfig.troughAnimIndex * gameConfig.farmLevel), 176);
        hay.loop = false;
        gameConfig.hayGame.addChild(hay);
        cleanUpRemoveArray.push(hay);

        hay = createMCGC("troughHay00", 4, 130 + (65 * (gameConfig.troughAnimIndex * gameConfig.farmLevel + 1)), 176);
        hay.loop = false;
        gameConfig.hayGame.addChild(hay);
        cleanUpRemoveArray.push(hay);

        hay = createMCGC("troughHay00", 4, 130 + (65 * (gameConfig.troughAnimIndex * gameConfig.farmLevel + 2)), 176);
        hay.loop = false;
        gameConfig.hayGame.addChild(hay);
        cleanUpRemoveArray.push(hay);

        hay = createMCGC("troughHay00", 4, 130 + (65 * (gameConfig.troughAnimIndex * gameConfig.farmLevel + 3)), 176);
        hay.loop = false;
        gameConfig.hayGame.addChild(hay);
        cleanUpRemoveArray.push(hay);

    }
}

function animalEat() {
    if (gameConfig.farmLevel == 1) {
        var animal = gameConfig.hayAnimalArray[gameConfig.troughAnimIndex];
        animal.gotoAndPlay(96);
        animal.onFrameChange = function() {
            if (this.currentFrame == 124) {
                this.gotoAndPlay(96);
            }
        }

    } else if (gameConfig.farmLevel == 2) {
        animal = gameConfig.hayAnimalArray[gameConfig.troughAnimIndex * gameConfig.farmLevel];
        animal.gotoAndPlay(96);
        animal.onFrameChange = function() {
            if (this.currentFrame == 113) {
                this.gotoAndPlay(96);
            }
        }

        animal = gameConfig.hayAnimalArray[gameConfig.troughAnimIndex * gameConfig.farmLevel + 1];
        animal.gotoAndPlay(96);
        animal.onFrameChange = function() {
            if (this.currentFrame == 113) {
                this.gotoAndPlay(96);
            }
        }
    } else if (gameConfig.farmLevel == 3) {
        animal = gameConfig.hayAnimalArray[gameConfig.troughAnimIndex * gameConfig.farmLevel];
        animal.gotoAndPlay(96);
        animal.onFrameChange = function() {
            if (this.currentFrame == 115) {
                this.gotoAndPlay(96);
            }
        }
        animal = gameConfig.hayAnimalArray[gameConfig.troughAnimIndex * gameConfig.farmLevel + 1];
        animal.gotoAndPlay(96);
        animal.onFrameChange = function() {
            if (this.currentFrame == 115) {
                this.gotoAndPlay(96);
            }
        }
        animal = gameConfig.hayAnimalArray[gameConfig.troughAnimIndex * gameConfig.farmLevel + 2];
        animal.gotoAndPlay(96);
        animal.onFrameChange = function() {
            if (this.currentFrame == 115) {
                this.gotoAndPlay(96);
            }
        }
    } else {
        animal = gameConfig.hayAnimalArray[gameConfig.troughAnimIndex * gameConfig.farmLevel];
        animal.gotoAndPlay(96);
        animal.onFrameChange = function() {
            if (this.currentFrame == 114) {
                this.gotoAndPlay(96);
            }
        }
        animal = gameConfig.hayAnimalArray[gameConfig.troughAnimIndex * gameConfig.farmLevel + 1];
        animal.gotoAndPlay(96);
        animal.onFrameChange = function() {
            if (this.currentFrame == 114) {
                this.gotoAndPlay(96);
            }
        }
        animal = gameConfig.hayAnimalArray[gameConfig.troughAnimIndex * gameConfig.farmLevel + 2];
        animal.gotoAndPlay(96);
        animal.onFrameChange = function() {
            if (this.currentFrame == 114) {
                this.gotoAndPlay(96);
            }
        }
        animal = gameConfig.hayAnimalArray[gameConfig.troughAnimIndex * gameConfig.farmLevel + 3];
        animal.gotoAndPlay(96);
        animal.onFrameChange = function() {
            if (this.currentFrame == 114) {
                this.gotoAndPlay(96);
            }
        }
    }
}

function playFarmEndAnim() {
    gamePopup = new PIXI.Container();
    gamePopup.x = 250;
    gamePopup.y = 100;
    gameContainer.addChild(gamePopup);


    if (gameConfig.farmLevel == 4) {
        //END GAME
        var endBG = createSprite("images/farm/OverlayOutro.png", 0, 0, gameLoader);
        gamePopup.addChild(endBG);
        cleanUpArray.push(endBG);

        var hand = createSprite("images/farm/hand.png", 110, 345, gameLoader);
        hand.anchor.set(0.5);
        gamePopup.addChild(hand);
        cleanUpArray.push(hand);
        TweenMax.set(hand, {
            pixi: {
                scale: 0.75
            }
        });
        TweenMax.to(hand, 1.5, {
            pixi: {
                scale: 1
            }
        });

        var nextBtn = createNextBtn();
        nextBtn.x = 280;
        nextBtn.y = 270;
        nextBtn.on('pointerdown', nextLevelFarm);
        gamePopup.addChild(nextBtn);
        cleanUpRemoveArray.push(nextBtn);

        updateWallet(10);

    } else {
        endBG = createSprite("images/farm/hayGameEndBG.png", 0, 0, gameLoader);
        gamePopup.addChild(endBG);
        cleanUpArray.push(endBG);

        if (gameConfig.farmLevel == 1) {
            var animal = createMCGC("cow1", 99, 300, 300);
        } else if (gameConfig.farmLevel == 2) {
            animal = createMCGC("horse1", 99, 300, 300);
        } else if (gameConfig.farmLevel == 3) {
            animal = createMCGC("sheep100", 99, 300, 300);
        } else {
            animal = createMCGC("goose100", 99, 300, 300);
        }

        animal.gotoAndStop(0);
        gamePopup.addChild(animal);
        cleanUpRemoveArray.push(animal);

        var hand = createSprite("images/farm/hand.png", 110, 345, gameLoader);
        hand.anchor.set(0.5);
        gamePopup.addChild(hand);
        cleanUpArray.push(hand);
        TweenMax.set(hand, {
            pixi: {
                scale: 0.75
            }
        });
        TweenMax.to(hand, 1.5, {
            pixi: {
                scale: 1
            }
        });

        var nextBtn = createNextBtn();
        nextBtn.x = 382;
        nextBtn.y = 293;
        nextBtn.on('pointerdown', nextLevelFarm);
        gamePopup.addChild(nextBtn);
        cleanUpRemoveArray.push(nextBtn);

        updateWallet(10);
    }

    gameConfig.playingSound = playSound("speak_farm_gold");
}



function nextLevelFarm() {
    gameConfig.playingSound.stop();
    gamePopup.parent.removeChild(gamePopup);

    gameConfig.farmLevel++;

    if (gameConfig.farmLevel >= 5) {
        //end game
        gameConfig.farmLevel = 1;
    }

    gameConfig.animalContainer.removeChildren();
    gameConfig.farmPoints.gotoAndStop(0);

    gameConfig.farmGameHitArray = new Array();


    gameConfig.scoreTF.x = 586;
    gameConfig.scoreTF.text = "0";

    startFarmLevel();
}





//MONOPOLY_________________
var monoBubbleStyle = new PIXI.TextStyle({
    fontFamily: "Arial",
    fontSize: 16,
    fill: "black",
    fontWeight: "normal",
    wordWrap: true,
    wordWrapWidth: 200
});

var monoCalcStyle = new PIXI.TextStyle({
    fontFamily: "Arial",
    fontSize: 24,
    fill: "#d2e1e1",
    fontWeight: "bold"
});

var monoWrongTitleStyle = new PIXI.TextStyle({
    fontFamily: "Arial",
    fontSize: 20,
    fill: "black",
    fontWeight: "bold"
});

var monoWrongTextStyle = new PIXI.TextStyle({
    fontFamily: "Arial",
    fontSize: 16,
    fill: "black",
    fontWeight: "bold"
});

var smallTextStyle = new PIXI.TextStyle({
    fontFamily: "Arial",
    fontSize: 12,
    fill: "black",
    fontWeight: "normal",
    wordWrap: true,
    wordWrapWidth: 120
});

var smallBoldTextStyle = new PIXI.TextStyle({
    fontFamily: "Arial",
    fontSize: 12,
    fill: "black",
    fontWeight: "bold",
    wordWrap: true,
    wordWrapWidth: 120
});




//WIZARD
function showWizard() {
    sendStatPoint("start-wizard");
    if (this.sound) {
        this.sound.stop();
    }
    gameConfig = {};

    stopMayorSpeak();

    clearInterval(universeAmbientSoundsInterval);
    universeAmbientSoundsInterval = null;

    gameSoundArray = new Array();

    gameContainer.removeChildren();
    if (gameLoader) {
        gameLoader.reset();
    }

    if (localTest) {
        loadWizardResources(JSON.parse('{"speak_wizard_complete":{"contenttype":"sound","content":"dk_man_klarer_testen.mp3","subtitle":"Det var flot! Du svarede rigtigt p\u00e5 alle sp\u00f8rgsm\u00e5lene! Tryk p\u00e5 den gr\u00f8nne knap for at h\u00f8re min hemmelighed!"},"speak_wizard_not_complete":{"contenttype":"sound","content":"dk_man_klarer_ikke_testen.mp3","subtitle":"Du svarede ikke rigtig p\u00e5 alle sp\u00f8rgsm\u00e5lene, s\u00e5 du m\u00e5 vente med at h\u00f8re hemmeligheden. M\u00e5ske det var en god ide at bes\u00f8ge nogle af stederne i Pengeby igen?"},"speak_wizard_secret":{"contenttype":"sound","content":"dk_hemmelighed.mp3","subtitle":"P\u00e5 mit skattekort kan du se, hvor skatten ligger gemt i Pengeby! Pr\u00f8v at se, om du kan finde den - skatten er nemlig din! Du f\u00e5r ogs\u00e5 mit helt specielle diplom, som h\u00e6nger p\u00e5 dit v\u00e6relse, men du kan ogs\u00e5 printe det, hvis du vil. Tryk p\u00e5 den gr\u00f8nne knap for at finde skatten!"},"speak_wizard_welcome":{"contenttype":"sound","content":"dk_velkomst_og_forklaring_troldmanden.mp3","subtitle":"Jeg kan se p\u00e5 mit kort, at du har bes\u00f8gt alle stederne, s\u00e5 nu er du klar til at h\u00f8re min hemmelighed! Men f\u00f8r jeg fort\u00e6ller dig hemmeligheden, skal du svare p\u00e5 nogle sp\u00f8rgsm\u00e5l. Du kan eventuelt f\u00e5 en voksen til at hj\u00e6lpe dig med sp\u00f8rgsm\u00e5lene. Tryk p\u00e5 den gr\u00f8nne knap, n\u00e5r du er klar."},"wizard_completed_header":{"contenttype":"label","content":"Tillykke","subtitle":""},"wizard_completed_text":{"contenttype":"label","content":"Du har svaret rigtigt p\u00e5 alle sp\u00f8rgsm\u00e5lene! Tryk p\u00e5 den gr\u00f8nne knap for at h\u00f8re hemmeligheden","subtitle":""},"wizard_diplom":{"contenttype":"label","content":"DIPLOM","subtitle":""},"wizard_secret":{"contenttype":"label","content":"Dette diplom er givet til \u00e9n af de heldige, der har f\u00e5et fortalt Troldmandens hemmelighed i Pengeby","subtitle":""},"wizard_secret_button":{"contenttype":"label","content":"Der ligger en skat gemt!","subtitle":""},"wizard_start_quiz":{"contenttype":"label","content":"Start","subtitle":""},"wizard_wrong_header":{"contenttype":"label","content":"Du svarede forkert","subtitle":""},"wizard_wrong_text":{"contenttype":"label","content":"Du svarede ikke rigtigt p\u00e5 sp\u00f8rgsm\u00e5lene. M\u00e5ske du skulle bes\u00f8ge de forskellige steder i Pengeby igen?","subtitle":""},"question 1":{"contenttype":"question","content":"Hvor kan du ikke rejse hen med Tidsmaskinen?","subtitle":null,"option1":"Gr\u00f8nland","option2":"Det gamle Rom","option3":"Egypten","correctoption":"1","correcttext":null},"question 2":{"contenttype":"question","content":"Hvor i Pengeby kan du skifte dit t\u00f8j?","subtitle":null,"option1":"P\u00e5 Posthuset","option2":"I skabet p\u00e5 dit v\u00e6relse","option3":"I Tidsmaskinen","correctoption":"2","correcttext":null},"question 3":{"contenttype":"question","content":"Hvis noget er dyrt, betyder det","subtitle":null,"option1":"At det ikke koster mange penge","option2":"At det koster mange penge","option3":"","correctoption":"2","correcttext":null},"question 4":{"contenttype":"question","content":"Hvad koster flest penge?","subtitle":null,"option1":"En mobiltelefon","option2":"10 bananer","option3":"Et fjernsyn","correctoption":"3","correcttext":null},"question 5":{"contenttype":"question","content":"Hvad kan du f\u00e5 penge for at g\u00f8re?","subtitle":null,"option1":"At arbejde","option2":"At kl\u00f8 sig p\u00e5 maven","option3":"At g\u00e5 i skole","correctoption":"1","correcttext":null},"question 6":{"contenttype":"question","content":"Hvordan kan du ogs\u00e5 f\u00e5 penge?","subtitle":null,"option1":"Ved at s\u00e6lge noget","option2":"Ved at kigge under dynen","option3":"Ved at lede ude i haven","correctoption":"1","correcttext":null},"question 7":{"contenttype":"question","content":"Hvad g\u00f8r du, hvis der er en ting, du gerne vil k\u00f8be, men ikke har penge nok?","subtitle":null,"option1":"Jeg sl\u00e5r en kolb\u00f8tte","option2":"Jeg k\u00f8ber det alligevel","option3":"Jeg sparer op til det","correctoption":"3","correcttext":null},"question 8":{"contenttype":"question","content":"Hvad g\u00f8r du, hvis du \u00f8nsker dig to ting, men kun har penge til \u00e9n ting?","subtitle":null,"option1":"Jeg k\u00f8ber begge ting alligevel","option2":"Jeg k\u00f8ber den, jeg \u00f8nsker mig mest","option3":"","correctoption":"2","correcttext":null},"wizard_ambient_sound":{"contenttype":"sound","content":"wizard_magisk_musik_ambient.mp3","subtitle":""},"wizard_completed":{"contenttype":"sound","content":"wizard_complete_m._applaus_(finale).mp3","subtitle":""}}'));
    } else {
        $.ajax({
            type: 'GET',
            url: 'gameadmin/getcontent/wizard.json',
            contentType: 'application/json; charset=utf-8',
            dataType: 'json',
        }).done(loadWizardResources);
    }
}

var wizardData;

function loadWizardResources(data) {
    gameLoader = new PIXI.Loader();
    wizardData = data;

    $.each(data, function(key, val) {
        if (val.contenttype == "sound") {
            gameLoader.add(key, "files/" + val.content);

            subtitleArray[key] = val.subtitle;

            gameSoundArray.push(key);
        } else {

        }
    })

    showPreloader();
    gameLoader.on('progress', preloadProgress);

    gameLoader.add("images/wizard/completedScene.png")
        .add("images/wizard/Cross.png")
        .add("images/wizard/DiplomGfx.png")
        .add("images/wizard/KortOverlay.png")
        .add("images/wizard/Markering_aeble.png")
        .add("images/wizard/Markering_hjem.png")
        .add("images/wizard/Markering_karen.png")
        .add("images/wizard/Markering_port.png")
        .add("images/wizard/Markering_post.png")
        .add("images/wizard/Markering_tid.png")
        .add("images/wizard/Ok_spm.json")
        .add("images/wizard/Ok_spm.png")
        .add("images/wizard/QuizBg.png")
        .add("images/wizard/Skattekort.png")
        .add("images/wizard/Spm_ikon.json")
        .add("images/wizard/Spm_ikon.png")
        .add("images/wizard/StatusIcon.json")
        .add("images/wizard/StatusIcon.png")
        .add("images/wizard/wizard.json")
        .add("images/wizard/wizard.png")
        .add("twinkle", "files/Ok lyd 2.mp3")
    gameLoader.load(initWizard);
}


function initWizard(loader, resources) {
    gameConfig = {};

    var wizardBG = createSprite("images/wizard/Skattekort.png", 0, -40, gameLoader);
    gameContainer.addChild(wizardBG);
    cleanUpArray.push(wizardBG);

    wizardBG = createSprite("images/wizard/KortOverlay.png", 275, 80, gameLoader);
    gameContainer.addChild(wizardBG);
    cleanUpArray.push(wizardBG);

    var visitedAll = true;

    var icon = createMCGC("StatusIcon00", 2, 340, 184);
    gameContainer.addChild(icon);
    icon.gotoAndStop(0);
    cleanUpArray.push(icon);

    if (user.visitedApple) {
        var place = createSprite("images/wizard/Markering_aeble.png", 280, 130, gameLoader)
        place.scale.set(1.1);
        gameContainer.addChild(place);
        cleanUpArray.push(place);

        icon.gotoAndStop(1);
    } else {
        visitedAll = false;
    }
    gameContainer.setChildIndex(icon, gameContainer.children.length - 1);


    icon = createMCGC("StatusIcon00", 2, 290, 300);
    gameContainer.addChild(icon);
    icon.gotoAndStop(0);
    cleanUpArray.push(icon);

    if (user.visitedRoom) {
        place = createSprite("images/wizard/Markering_hjem.png", 274, 243, gameLoader)
        place.scale.set(1.1);
        gameContainer.addChild(place);
        cleanUpArray.push(place);

        icon.gotoAndStop(1);
    } else {
        visitedAll = false;
    }
    gameContainer.setChildIndex(icon, gameContainer.children.length - 1);


    icon = createMCGC("StatusIcon00", 2, 520, 220);
    gameContainer.addChild(icon);
    icon.gotoAndStop(0);
    cleanUpArray.push(icon);

    if (user.visitedKaren) {
        place = createSprite("images/wizard/Markering_karen.png", 445, 153, gameLoader)
        place.scale.set(1.1);
        gameContainer.addChild(place);
        cleanUpArray.push(place);

        icon.gotoAndStop(1);
    } else {
        visitedAll = false;
    }
    gameContainer.setChildIndex(icon, gameContainer.children.length - 1);

    icon = createMCGC("StatusIcon00", 2, 480, 470);
    gameContainer.addChild(icon);
    icon.gotoAndStop(0);
    cleanUpArray.push(icon);

    if (user.visitedGate) {
        place = createSprite("images/wizard/Markering_port.png", 433, 433, gameLoader)
        place.scale.set(1.1);
        gameContainer.addChild(place);
        cleanUpArray.push(place);

        icon.gotoAndStop(1);
    } else {
        visitedAll = false;
    }
    gameContainer.setChildIndex(icon, gameContainer.children.length - 1);


    icon = createMCGC("StatusIcon00", 2, 560, 350);
    gameContainer.addChild(icon);
    icon.gotoAndStop(0);
    cleanUpArray.push(icon);

    if (user.visitedPost) {
        place = createSprite("images/wizard/Markering_post.png", 521, 308, gameLoader)
        place.scale.set(1.1);
        gameContainer.addChild(place);
        cleanUpArray.push(place);

        icon.gotoAndStop(1);
    } else {
        visitedAll = false;
    }
    gameContainer.setChildIndex(icon, gameContainer.children.length - 1);


    icon = createMCGC("StatusIcon00", 2, 730, 230);
    gameContainer.addChild(icon);
    icon.gotoAndStop(0);
    cleanUpArray.push(icon);

    if (user.visitedTime) {
        place = createSprite("images/wizard/Markering_tid.png", 674, 186, gameLoader)
        place.scale.set(1.1);
        gameContainer.addChild(place);
        cleanUpArray.push(place);

        icon.gotoAndStop(1);
    } else {
        visitedAll = false;
    }
    gameContainer.setChildIndex(icon, gameContainer.children.length - 1);


    gameConfig.wizard = createMCGC("vogter00", 97, 100, 300);
    gameConfig.wizard.gotoAndStop(0);
    gameContainer.addChild(gameConfig.wizard)

    if (visitedAll) {
        wizardSpeak("speak_wizard_welcome");

        var nextBtn = createNextBtn();
        nextBtn.x = 650;
        nextBtn.y = 450;
        nextBtn.on('pointerup', startWizardGame);
        gameContainer.addChild(nextBtn);


    } else {
        wizardSpeak("speak_universe_wizard_not_ready", PIXI.Loader.shared);
    }

    if (universeBtn) {
        gameContainer.addChild(universeBtn);
    } else {
        universeBtn = createMC("UniverseButton00", 2, 780, 10);
        universeBtn.gotoAndStop(0);
        gameContainer.addChild(universeBtn);
        makeButton(universeBtn, backToUniverse);
    }


    wizardAmbientSounds();
}


function wizardAmbientSounds() {
    gameConfig.wizardAmbientSound = playSound("wizard_ambient_sound");
    gameConfig.wizardAmbientSound.volume = 0.05;
    gameConfig.wizardTimer = setTimeout(wizardAmbientSounds, 18000);
}

function startWizardGame() {
    stopWizardSpeak();

    gameConfig.questionIndex = -1;
    gameConfig.correctAnswers = 0;

    //remove elements
    while (gameContainer.children.length > 4) {
        gameContainer.removeChildAt(1);
    }
    gameContainer.removeChildAt(2);

    //setup elements
    gameConfig.wizardBG = createSprite("images/wizard/QuizBg.png", 285, 110, gameLoader);
    gameContainer.addChild(gameConfig.wizardBG);
    cleanUpArray.push(gameConfig.wizardBG);


    var pathIcon;
    gameConfig.pathIconArray = new Array();
    for (var i = 0; i < 8; i++) {
        pathIcon = new PIXI.Container();
        pathIcon.x = 365 + (i * 40);
        pathIcon.y = 180;
        pathIcon.addChild(createMCGC("Spm_ikon00", 2, 0, 0));
        pathIcon.children[0].gotoAndStop(0);

        var btnText = new PIXI.Text((i + 1), wizardPathIconStyle);
        btnText.x = 9;
        btnText.y = 6;
        pathIcon.addChild(btnText);

        gameContainer.addChild(pathIcon);
        gameConfig.pathIconArray.push(pathIcon);
        cleanUpArray.push(pathIcon);
    }

    showNextWizardQuestion();
}

var wizardTitleStyle = new PIXI.TextStyle({
    fontFamily: "Arial",
    fontSize: 16,
    fill: "black",
    fontWeight: "normal",
    wordWrap: true,
    wordWrapWidth: 400
});

var wizardTextStyle = new PIXI.TextStyle({
    fontFamily: "Arial",
    fontSize: 16,
    fill: "black",
    fontWeight: "bold"
});

var wizardBtnStyle = new PIXI.TextStyle({
    fontFamily: "Arial",
    fontSize: 24,
    fill: "white",
    fontWeight: "bold"
});

var wizardPathIconStyle = new PIXI.TextStyle({
    fontFamily: "Arial",
    fontSize: 16,
    fill: "white",
    fontWeight: "bold"
});

var wizardGameOverTextStyle = new PIXI.TextStyle({
    fontFamily: "Arial",
    fontSize: 20,
    fill: "white",
    fontWeight: "normal",
    wordWrap: true,
    wordWrapWidth: 130
});

var wizardGameOverTitleStyle = new PIXI.TextStyle({
    fontFamily: "Arial",
    fontSize: 36,
    fill: "black",
    fontWeight: "bold"
});

function showNextWizardQuestion() {
    gameConfig.questionIndex++;
    if (gameConfig.questionIndex >= 8) {
        wizardGameOver();
        return;
    }

    for (var i = 0; i < gameConfig.pathIconArray.length; i++) {
        if (i <= gameConfig.questionIndex) {
            gameConfig.pathIconArray[i].children[0].gotoAndStop(1);
        } else {
            gameConfig.pathIconArray[i].children[0].gotoAndStop(0);
        }
    }

    if (language == "dk") {
        var question = wizardData["question " + (gameConfig.questionIndex + 1)];
    } else {
        question = wizardData["question" + (gameConfig.questionIndex + 1)];
    }

    if (gameConfig.titleTF) {
        gameConfig.titleTF.text = question.content;
    } else {
        gameConfig.titleTF = new PIXI.Text(question.content, wizardTitleStyle);
        gameConfig.titleTF.x = 320;
        gameConfig.titleTF.y = 250;
        gameContainer.addChild(gameConfig.titleTF);
        cleanUpArray.push(gameConfig.titleTF);
    }

    if (gameConfig.q1Btn) {
        gameConfig.q1TF.text = question.option1;
    } else {
        gameConfig.q1Btn = new PIXI.Container();
        gameConfig.q1Btn.x = 350;
        gameConfig.q1Btn.y = 300;
        gameContainer.addChild(gameConfig.q1Btn);
        gameConfig.q1Btn.interactive = true;
        gameConfig.q1Btn.buttonMode = true;
        gameConfig.q1Btn.name = "1";
        gameConfig.q1Btn.on("pointerup", selectWizardAnswer);
        cleanUpRemoveArray.push(gameConfig.q1Btn);

        var btnIcon = createMCGC("Ok_spm00", 39, 0, 0);
        btnIcon.scale.set(0.75);
        gameConfig.q1Btn.addChild(btnIcon);
        cleanUpArray.push(btnIcon);

        var btnText = new PIXI.Text("1", wizardBtnStyle);
        btnText.x = 15;
        btnText.y = 7;
        gameConfig.q1Btn.addChild(btnText);
        cleanUpArray.push(btnText);

        gameConfig.q1TF = new PIXI.Text(question.option1, wizardTextStyle);
        gameConfig.q1TF.x = 50;
        gameConfig.q1TF.y = 10;
        gameConfig.q1Btn.addChild(gameConfig.q1TF);
        cleanUpArray.push(gameConfig.q1TF);
    }

    if (gameConfig.q2Btn) {
        gameConfig.q2TF.text = question.option2;
    } else {
        gameConfig.q2Btn = new PIXI.Container();
        gameConfig.q2Btn.x = 410;
        gameConfig.q2Btn.y = 350;
        gameContainer.addChild(gameConfig.q2Btn);
        gameConfig.q2Btn.interactive = true;
        gameConfig.q2Btn.buttonMode = true;
        gameConfig.q2Btn.name = "2";
        gameConfig.q2Btn.on("pointerup", selectWizardAnswer);
        cleanUpRemoveArray.push(gameConfig.q2Btn);

        btnIcon = createMC("Ok_spm00", 39, 0, 0);
        btnIcon.scale.set(0.75);
        gameConfig.q2Btn.addChild(btnIcon);
        cleanUpArray.push(btnIcon);

        btnText = new PIXI.Text("2", wizardBtnStyle);
        btnText.x = 15;
        btnText.y = 7;
        gameConfig.q2Btn.addChild(btnText);
        cleanUpArray.push(btnText);

        gameConfig.q2TF = new PIXI.Text(question.option2, wizardTextStyle);
        gameConfig.q2TF.x = 50;
        gameConfig.q2TF.y = 10;
        gameConfig.q2Btn.addChild(gameConfig.q2TF);
        cleanUpArray.push(gameConfig.q2TF);
    }

    if (gameConfig.q3Btn) {
        if (question.option3 == "") {
            gameConfig.q3Btn.visible = false;
        } else {
            gameConfig.q3Btn.visible = true;
            gameConfig.q3TF.text = question.option3;
        }

    } else {
        gameConfig.q3Btn = new PIXI.Container();
        gameConfig.q3Btn.x = 470;
        gameConfig.q3Btn.y = 400;
        gameContainer.addChild(gameConfig.q3Btn);
        gameConfig.q3Btn.interactive = true;
        gameConfig.q3Btn.buttonMode = true;
        gameConfig.q3Btn.name = "3";
        gameConfig.q3Btn.on("pointerup", selectWizardAnswer);
        cleanUpRemoveArray.push(gameConfig.q3Btn);

        btnIcon = createMC("Ok_spm00", 39, 0, 0);
        btnIcon.scale.set(0.75);
        gameConfig.q3Btn.addChild(btnIcon);
        cleanUpArray.push(btnIcon);

        btnText = new PIXI.Text("3", wizardBtnStyle);
        btnText.x = 15;
        btnText.y = 7;
        gameConfig.q3Btn.addChild(btnText);
        cleanUpArray.push(btnText);

        gameConfig.q3TF = new PIXI.Text(question.option3, wizardTextStyle);
        gameConfig.q3TF.x = 50;
        gameConfig.q3TF.y = 10;
        gameConfig.q3Btn.addChild(gameConfig.q3TF);
        cleanUpArray.push(gameConfig.q3TF);
    }


    gameConfig.correctWizardAnswer = question.correctoption;

}


function selectWizardAnswer() {
    playSound("twinkle")

    if (this.name == gameConfig.correctWizardAnswer) {
        gameConfig.correctAnswers++;
    }

    showNextWizardQuestion();
}


function wizardGameOver() {

    gameContainer.removeChild(gameConfig.q1Btn)
    gameContainer.removeChild(gameConfig.q2Btn)
    gameContainer.removeChild(gameConfig.q3Btn)

    gameContainer.removeChildAt(11)
    gameContainer.removeChildAt(10)
    gameContainer.removeChildAt(9)
    gameContainer.removeChildAt(8)
    gameContainer.removeChildAt(7)
    gameContainer.removeChildAt(6)
    gameContainer.removeChildAt(5)
    gameContainer.removeChildAt(4)

    if (gameConfig.correctAnswers >= 8) {
        //all good
        wizardSpeak("speak_wizard_complete");

        gameConfig.gameOverTitleTF = new PIXI.Text(wizardData.wizard_completed_header.content, wizardGameOverTitleStyle);
        gameConfig.gameOverTitleTF.x = 320;
        gameConfig.gameOverTitleTF.y = 200;
        gameContainer.addChild(gameConfig.gameOverTitleTF);
        cleanUpArray.push(gameConfig.gameOverTitleTF);

        gameConfig.titleTF.text = wizardData.wizard_completed_text.content;

        gameConfig.gameOverBlob = createSprite("images/wizard/completedScene.png", 500, 300, gameLoader)
        gameContainer.addChild(gameConfig.gameOverBlob);
        cleanUpArray.push(gameConfig.gameOverBlob);

        gameConfig.gameOverTextTF = new PIXI.Text(wizardData.wizard_secret_button.content, wizardGameOverTextStyle);
        gameConfig.gameOverTextTF.x = 555;
        gameConfig.gameOverTextTF.y = 335;
        gameConfig.gameOverTextTF.rotation = 0.25;
        gameContainer.addChild(gameConfig.gameOverTextTF);
        cleanUpArray.push(gameConfig.gameOverTextTF);

        gameConfig.gameOverNextBtn = createNextBtn();
        gameConfig.gameOverNextBtn.x = 400;
        gameConfig.gameOverNextBtn.y = 340;
        gameConfig.gameOverNextBtn.on('pointerup', showTreasureMap);
        gameContainer.addChild(gameConfig.gameOverNextBtn);
    } else {
        //no win
        gameConfig.gameOverTitleTF = new PIXI.Text(wizardData.wizard_wrong_header.content, wizardGameOverTitleStyle);
        gameConfig.gameOverTitleTF.x = 320;
        gameConfig.gameOverTitleTF.y = 200;
        gameContainer.addChild(gameConfig.gameOverTitleTF);
        cleanUpArray.push(gameConfig.gameOverTitleTF);

        gameConfig.titleTF.text = wizardData.wizard_wrong_text.content;

        wizardSpeak("speak_wizard_not_complete");

    }
}


function showTreasureMap() {
    stopWizardSpeak();
    var applause = playSound("wizard_completed");
    applause.volume = 0.1;
    wizardSpeak("speak_wizard_secret");

    gameContainer.removeChild(gameConfig.titleTF);
    gameContainer.removeChild(gameConfig.gameOverTextTF);
    gameContainer.removeChild(gameConfig.gameOverBlob);
    gameContainer.removeChild(gameConfig.gameOverTitleTF);
    gameContainer.removeChild(gameConfig.wizardBG);
    gameContainer.removeChild(gameConfig.gameOverNextBtn);

    var mapOverlay = createSprite("images/wizard/KortOverlay.png", 275, 80, gameLoader)
    gameContainer.addChild(mapOverlay);
    cleanUpArray.push(mapOverlay);

    user.wizardDone = true;
    updateUserCookie();


    var place = createSprite("images/wizard/Markering_aeble.png", 280, 130, gameLoader)
    place.scale.set(1.1);
    gameContainer.addChild(place);
    cleanUpArray.push(place);

    var icon = createMCGC("StatusIcon00", 2, 340, 184);
    icon.gotoAndStop(1);
    gameContainer.addChild(icon);
    cleanUpArray.push(icon);


    place = createSprite("images/wizard/Markering_hjem.png", 274, 243, gameLoader)
    place.scale.set(1.1);
    gameContainer.addChild(place);
    cleanUpArray.push(place);

    icon = createMCGC("StatusIcon00", 2, 290, 300);
    gameContainer.addChild(icon);
    icon.gotoAndStop(1);
    cleanUpArray.push(icon);


    place = createSprite("images/wizard/Markering_karen.png", 445, 153, gameLoader)
    place.scale.set(1.1);
    gameContainer.addChild(place);
    cleanUpArray.push(place);

    icon = createMCGC("StatusIcon00", 2, 520, 220);
    gameContainer.addChild(icon);
    icon.gotoAndStop(1);
    cleanUpArray.push(icon);


    place = createSprite("images/wizard/Markering_port.png", 433, 433, gameLoader)
    place.scale.set(1.1);
    gameContainer.addChild(place);
    cleanUpArray.push(place);

    icon = createMCGC("StatusIcon00", 2, 480, 470);
    gameContainer.addChild(icon);
    icon.gotoAndStop(1);
    cleanUpArray.push(icon);


    place = createSprite("images/wizard/Markering_post.png", 521, 308, gameLoader)
    place.scale.set(1.1);
    gameContainer.addChild(place);
    cleanUpArray.push(place);

    icon = createMCGC("StatusIcon00", 2, 560, 350);
    gameContainer.addChild(icon);
    icon.gotoAndStop(1);
    cleanUpArray.push(icon);


    place = createSprite("images/wizard/Markering_tid.png", 674, 186, gameLoader)
    place.scale.set(1.1);
    gameContainer.addChild(place);
    cleanUpArray.push(place);

    icon = createMCGC("StatusIcon00", 2, 730, 230);
    gameContainer.addChild(icon);
    icon.gotoAndStop(1);
    cleanUpArray.push(icon);


    gameContainer.setChildIndex(gameConfig.wizard, gameContainer.children.length - 1);

    var cross = createSprite("images/wizard/Cross.png", 470, 385, gameLoader);
    gameContainer.addChild(cross);
    cleanUpArray.push(cross);

    gameConfig.gameOverNextBtn = createNextBtn();
    gameConfig.gameOverNextBtn.x = 360;
    gameConfig.gameOverNextBtn.y = 367;
    gameConfig.gameOverNextBtn.on('pointerup', closeWizard);
    gameContainer.addChild(gameConfig.gameOverNextBtn);
    cleanUpRemoveArray.push()


}

function closeWizard() {
    backToUniverse(gameConfig.gameOverNextBtn);
}

function wizardSpeak(soundID, loader) {
    gameConfig.currentWizardSound = [soundID, loader];

    playWizard();
}

function stopWizardSpeak() {
    if (gameConfig.wizardIsSpeaking) {
        gameConfig.wizardSound.stop();
        gameConfig.currentWizardSound = null;
        gameConfig.wizard.gotoAndStop(0);

        gameConfig.wizardIsSpeaking = false;
    }
}

function playWizard() {
    if (gameConfig.currentWizardSound) {
        if (gameConfig.currentWizardSound[1] == undefined) {
            gameConfig.wizardSound = playSound(gameConfig.currentWizardSound[0]);
        } else {
            gameConfig.wizardSound = playSound(gameConfig.currentWizardSound[0], gameConfig.currentWizardSound[1]);
        }
        gameConfig.wizardSound.volume = 0.2;
    } else {

    }
    gameConfig.wizardIsSpeaking = true;

    gameConfig.wizardSound.on('end', function() {
        gameConfig.wizard.gotoAndStop(0);

        gameConfig.wizardIsSpeaking = false;
    });

    gameConfig.wizard.gotoAndPlay(1);
}



//city gate
function showGate() {
    sendStatPoint("start-citygate");
    gameConfig = {};
    cleanUpArray = new Array();

    stopMayorSpeak();

    clearInterval(universeAmbientSoundsInterval);
    universeAmbientSoundsInterval = null;

    gameSoundArray = new Array();

    gameContainer.removeChildren();
    if (gameLoader) {
        gameLoader.reset();
    }


    if (localTest) {
        loadGateResources(JSON.parse('{"speak_b_citygate_done":{"contenttype":"sound","content":"no_thank_you_no_reward.mp3","subtitle":"Ja, n\u00e5 er den blitt fin. Men du har allerede malt den &eacute;n gang i dag, s\u00e5 du f\u00e5r ikke penger for det."},"speak_b_citygate_done_create":{"contenttype":"sound","content":"no_thank_you.mp3","subtitle":"Oi, den er blitt s\u00e5 flott! Som takk for hjelpen f\u00e5r du ti s\u00f8lvmynter og det er det samme som en gullmynt."},"speak_b_citygate_next":{"contenttype":"sound","content":"faerdig_no.mp3","subtitle":"N\u00e5r du synes at den er ferdig, trykker du p\u00e5 den gr\u00f8nne knappen."},"speak_b_citygate_welcome":{"contenttype":"sound","content":"no_welcome_0.mp3","subtitle":"Velkommen til byporten. Den kan du male s\u00e5nn at den blir skikkelig fin og flott! Du skal trykke p\u00e5 spannene med maling for \u00e5 velge den fargen som du vil male med. Og n\u00e5r du har valgt en farge, kan du trykke forskjellige steder p\u00e5 byporten for \u00e5 male den. Trykk p\u00e5 den gr\u00f8nne knappen n\u00e5r du er klar."},"speak_b_createuser_citygate":{"contenttype":"sound","content":"no_paint_town_gate.mp3","subtitle":"N\u00e5 skal du hjelpe meg \u00e5 male porten til Pengeby. Den er blitt s\u00e5 slitt, s\u00e5 den trenger nye farger. Du skal trykke p\u00e5 spannene med maling for \u00e5 velge den fargen du vil male med. Og n\u00e5r du har valgt en farge, kan du trykke forskjellige steder p\u00e5 byporten for \u00e5 male den. Trykk p\u00e5 den gr\u00f8nne knappen n\u00e5r du er klar."},"speak_b_createuser_citygate_done":{"contenttype":"sound","content":"no_done_painting.mp3","subtitle":"Den er blitt veldig fin! Som takk for hjelpen f\u00e5r du ti s\u00f8lvmynter og det er det samme som en gullmynt. N\u00e5 skal du trykke p\u00e5 den gr\u00f8nne knappen for \u00e5 komme inn i Pengeby!"},"citygate_choose_bucket":{"contenttype":"sound","content":"citygate_vaelge_lyd_3.mp3","subtitle":""},"citygate_paint":{"contenttype":"sound","content":"citygate_handlings_lyd_2.mp3","subtitle":""}}'));
    } else {
        $.ajax({
            type: 'GET',
            url: 'gameadmin/getcontent/citygate.json',
            contentType: 'application/json; charset=utf-8',
            dataType: 'json',
        }).done(loadGateResources);
    }


}

function loadGateResources(data) {
    gameLoader = new PIXI.Loader();

    $.each(data, function(key, val) {
        if (val.contenttype == "sound") {
            gameLoader.add(key, "files/" + val.content);

            subtitleArray[key] = val.subtitle;

            gameSoundArray.push(key);
        } else {

        }
    })

    showPreloader();
    gameLoader.on('progress', preloadProgress);

    gameLoader.add("images/gate/paints.png")
        .add("images/gate/pensel-clean.png")
        .add("images/gate/pensel-paint.json")
        .add("images/gate/block.json")
        .add("images/gate/block2.json")
        .add("images/gate/port.png")
        .add("images/gate/portBG.png")
    gameLoader.load(initGate);
}


function initGate(loader, resources) {
    var gateBG = createSprite("images/gate/portBG.png", -50, -50, gameLoader);
    gameContainer.addChild(gateBG);
    cleanUpArray.push(gateBG);

    gateBG = createSprite("images/gate/port.png", 260, 20, gameLoader)
    gameContainer.addChild(gateBG);
    cleanUpArray.push(gateBG);

    mayorSpeak("speak_b_citygate_welcome");

    //show video
    gamePopup = new PIXI.Container();
    gamePopup.x = 250;
    gamePopup.y = 140;
    gameContainer.addChild(gamePopup);
    cleanUpRemoveArray.push(gamePopup);


    var videoTexture = PIXI.Texture.from('images/gate/port-intro.mp4');
    cleanUpArray.push(videoTexture);
    var videoElement = videoTexture.baseTexture.resource.source;

    var videoSprite = new PIXI.Sprite(videoTexture);
    videoSprite.width = 506;
    videoSprite.height = 386;
    gamePopup.addChild(videoSprite);
    cleanUpRemoveArray.push(videoSprite);

    videoElement.loop = true;
    videoElement.autoPlay = true;
    videoElement.muted = true;

    var nextBtn = createNextBtn();
    nextBtn.x = 350;
    nextBtn.y = 300;
    nextBtn.on('pointerdown', startGate);
    gamePopup.addChild(nextBtn);
    cleanUpRemoveArray.push(nextBtn);

    if (universeBtn) {
        gameContainer.addChild(universeBtn);
    } else {
        universeBtn = createMC("UniverseButton00", 2, 780, 10);
        universeBtn.gotoAndStop(0);
        gameContainer.addChild(universeBtn);
        makeButton(universeBtn, backToUniverse);
    }

    user.visitedGate = true;
    updateUserCookie();
}

function startGate() {
    stopMayorSpeak();

    gameContainer.removeChild(gamePopup);

    var gateBG = createSprite("images/gate/paints.png", 235, 450, gameLoader);
    gameContainer.addChild(gateBG);
    cleanUpArray.push(gateBG);

    var btn;
    var btnLocations = new Array([235, 480], [315, 525], [395, 490], [555, 495], [660, 505], [725, 450]);
    var btnNames = new Array("pink", "green", "blue", "red", "yellow", "white");
    for (var i = 0; i < 6; i++) {
        btn = new PIXI.Graphics();
        btn.beginFill(0xffffff);
        btn.drawRect(0, 0, 70, 70);
        btn.hitArea = new PIXI.Rectangle(0, 0, 100, 100);
        btn.x = btnLocations[i][0];
        btn.y = btnLocations[i][1];
        btn.alpha = 0;
        btn.name = btnNames[i];
        btn.index = i;
        btn.interactive = true;
        btn.on("pointerup", selectGateBrushColor);
        gameContainer.addChild(btn);
        cleanUpArray.push(btn);
    }


    //blocks
    btn = createMCGC("Symbol 4800", 7, 514, 259);
    btn.scale.set(0.85);
    btn.gotoAndStop(0);
    btn.interactive = true;
    btn.anchor.set(0.5);
    btn.on("pointerup", paintIT);
    btn.on("mouseover", blockHover);
    btn.on("mouseout", blockEndHover);
    btn.on("touchstart", blockHover);
    btn.on("touchend", blockEndHover);
    btn.on("touchendoutside", blockEndHover);
    gameContainer.addChild(btn);
    cleanUpArray.push(btn);

    btn = createMCGC("field300", 7, 383, 100);
    btn.blockWidth = 70;
    btn.blockHeight = 40;
    btn.width = btn.blockWidth;
    btn.height = btn.blockHeight;
    btn.gotoAndStop(0);
    btn.interactive = true;
    btn.anchor.set(0.5);
    btn.on("pointerup", paintIT);
    btn.on("mouseover", blockHover);
    btn.on("mouseout", blockEndHover);
    btn.on("touchstart", blockHover);
    btn.on("touchend", blockEndHover);
    btn.on("touchendoutside", blockEndHover);
    gameContainer.addChild(btn);
    cleanUpArray.push(btn);

    btn = createMCGC("field300", 7, 648, 100);
    btn.blockWidth = 70;
    btn.blockHeight = 40;
    btn.width = btn.blockWidth;
    btn.height = btn.blockHeight;
    btn.gotoAndStop(0);
    btn.interactive = true;
    btn.anchor.set(0.5);
    btn.on("pointerup", paintIT);
    btn.on("mouseover", blockHover);
    btn.on("mouseout", blockEndHover);
    btn.on("touchstart", blockHover);
    btn.on("touchend", blockEndHover);
    btn.on("touchendoutside", blockEndHover);
    gameContainer.addChild(btn);
    cleanUpArray.push(btn);

    btn = createMCGC("field300", 7, 373, 268);
    btn.blockWidth = 74;
    btn.blockHeight = 68;
    btn.width = btn.blockWidth;
    btn.height = btn.blockHeight;
    btn.gotoAndStop(0);
    btn.interactive = true;
    btn.anchor.set(0.5);
    btn.on("pointerup", paintIT);
    btn.on("mouseover", blockHover);
    btn.on("mouseout", blockEndHover);
    btn.on("touchstart", blockHover);
    btn.on("touchend", blockEndHover);
    btn.on("touchendoutside", blockEndHover);
    gameContainer.addChild(btn);
    cleanUpArray.push(btn);

    btn = createMCGC("field300", 7, 657, 268);
    btn.blockWidth = 74;
    btn.blockHeight = 68;
    btn.width = btn.blockWidth;
    btn.height = btn.blockHeight;
    btn.gotoAndStop(0);
    btn.interactive = true;
    btn.anchor.set(0.5);
    btn.on("pointerup", paintIT);
    btn.on("mouseover", blockHover);
    btn.on("mouseout", blockEndHover);
    btn.on("touchstart", blockHover);
    btn.on("touchend", blockEndHover);
    btn.on("touchendoutside", blockEndHover);
    gameContainer.addChild(btn);
    cleanUpArray.push(btn);

    btn = createMCGC("field300", 7, 293, 374);
    btn.blockWidth = 32;
    btn.blockHeight = 127;
    btn.width = btn.blockWidth;
    btn.height = btn.blockHeight;
    btn.gotoAndStop(0);
    btn.interactive = true;
    btn.anchor.set(0.5);
    btn.on("pointerup", paintIT);
    btn.on("mouseover", blockHover);
    btn.on("mouseout", blockEndHover);
    btn.on("touchstart", blockHover);
    btn.on("touchend", blockEndHover);
    btn.on("touchendoutside", blockEndHover);
    gameContainer.addChild(btn);
    cleanUpArray.push(btn);

    btn = createMCGC("field300", 7, 353, 374);
    btn.blockWidth = 32;
    btn.blockHeight = 127;
    btn.width = btn.blockWidth;
    btn.height = btn.blockHeight;
    btn.gotoAndStop(0);
    btn.interactive = true;
    btn.anchor.set(0.5);
    btn.on("pointerup", paintIT);
    btn.on("mouseover", blockHover);
    btn.on("mouseout", blockEndHover);
    btn.on("touchstart", blockHover);
    btn.on("touchend", blockEndHover);
    btn.on("touchendoutside", blockEndHover);
    gameContainer.addChild(btn);
    cleanUpArray.push(btn);

    btn = createMCGC("field300", 7, 394, 374);
    btn.blockWidth = 32;
    btn.blockHeight = 127;
    btn.width = btn.blockWidth;
    btn.height = btn.blockHeight;
    btn.gotoAndStop(0);
    btn.interactive = true;
    btn.anchor.set(0.5);
    btn.on("pointerup", paintIT);
    btn.on("mouseover", blockHover);
    btn.on("mouseout", blockEndHover);
    btn.on("touchstart", blockHover);
    btn.on("touchend", blockEndHover);
    btn.on("touchendoutside", blockEndHover);
    gameContainer.addChild(btn);
    cleanUpArray.push(btn);

    btn = createMCGC("field300", 7, 636, 374);
    btn.blockWidth = 32;
    btn.blockHeight = 127;
    btn.width = btn.blockWidth;
    btn.height = btn.blockHeight;
    btn.gotoAndStop(0);
    btn.interactive = true;
    btn.anchor.set(0.5);
    btn.on("pointerup", paintIT);
    btn.on("mouseover", blockHover);
    btn.on("mouseout", blockEndHover);
    btn.on("touchstart", blockHover);
    btn.on("touchend", blockEndHover);
    btn.on("touchendoutside", blockEndHover);
    gameContainer.addChild(btn);
    cleanUpArray.push(btn);

    btn = createMCGC("field300", 7, 677, 374);
    btn.blockWidth = 32;
    btn.blockHeight = 127;
    btn.width = btn.blockWidth;
    btn.height = btn.blockHeight;
    btn.gotoAndStop(0);
    btn.interactive = true;
    btn.anchor.set(0.5);
    btn.on("pointerup", paintIT);
    btn.on("mouseover", blockHover);
    btn.on("mouseout", blockEndHover);
    btn.on("touchstart", blockHover);
    btn.on("touchend", blockEndHover);
    btn.on("touchendoutside", blockEndHover);
    gameContainer.addChild(btn);
    cleanUpArray.push(btn);

    btn = createMCGC("field300", 7, 737, 374);
    btn.blockWidth = 32;
    btn.blockHeight = 127;
    btn.width = btn.blockWidth;
    btn.height = btn.blockHeight;
    btn.gotoAndStop(0);
    btn.interactive = true;
    btn.anchor.set(0.5);
    btn.on("pointerup", paintIT);
    btn.on("mouseover", blockHover);
    btn.on("mouseout", blockEndHover);
    btn.on("touchstart", blockHover);
    btn.on("touchend", blockEndHover);
    btn.on("touchendoutside", blockEndHover);
    gameContainer.addChild(btn);
    cleanUpArray.push(btn);




    gameConfig.brush = new PIXI.Container();
    var penselClean = createSprite("images/gate/pensel-clean.png", 0, 0, gameLoader);
    gameConfig.brush.addChild(penselClean);
    cleanUpArray.push(penselClean);
    cleanUpRemoveArray.push(gameConfig.brush);

    gameConfig.brush.paint = createMCGC("Symbol 8800", 6, 0, 0);
    gameConfig.brush.paint.gotoAndStop(0);
    gameConfig.brush.paint.visible = false;
    gameConfig.brush.addChild(gameConfig.brush.paint);
    cleanUpArray.push(gameConfig.brush.paint);

    gameConfig.brush.pivot.x = 32;
    gameConfig.brush.pivot.y = 5;
    gameContainer.addChild(gameConfig.brush);

    app.stage.hitArea = app.screen;
    app.stage.interactive = true;
    app.stage.on('pointermove', dragBrush); //see egypt game

    $("body").addClass("nocursor");



}

function selectGateBrushColor() {
    playSound("citygate_choose_bucket");
    gameConfig.isPainting = true;
    gameConfig.brush.children[0].visible = false;
    gameConfig.brush.paint.visible = true;
    gameConfig.brush.paint.gotoAndStop(this.index);

    gameConfig.color = this.name;

}

function paintIT() {
    if (gameConfig.isPainting) {
        playSound("citygate_paint");
        this.gotoAndStop(gameConfig.brush.paint.currentFrame + 1);

        if (gameConfig.continueBtn) {

        } else {
            gameConfig.continueBtn = createNextBtn();
            gameConfig.continueBtn.x = 455;
            gameConfig.continueBtn.y = 380;
            gameConfig.continueBtn.on('pointerup', endGateGame);
            gameContainer.addChild(gameConfig.continueBtn);
            cleanUpRemoveArray.push(gameConfig.continueBtn);

            gameContainer.setChildIndex(gameConfig.brush, gameContainer.children.length - 1);
        }

    }
}

function blockHover() {
    if (this.blockWidth) {
        TweenMax.to(this, 0.35, {
            pixi: {
                width: this.blockWidth * 1.1,
                height: this.blockHeight * 1.1
            },
            ease: Power2.easeIn
        });
    } else {
        TweenMax.to(this, 0.35, {
            pixi: {
                scale: 1
            },
            ease: Power2.easeIn
        });
    }

}

function blockEndHover() {
    if (this.blockWidth) {
        TweenMax.to(this, 0.35, {
            pixi: {
                width: this.blockWidth,
                height: this.blockHeight
            },
            ease: Power2.easeIn
        });
    } else {
        TweenMax.to(this, 0.35, {
            pixi: {
                scale: 0.85
            },
            ease: Power2.easeIn
        });
    }
}

function endGateGame() {
    app.stage.off('pointermove', dragBrush);

    $("body").removeClass("nocursor");

    mayorSpeak("speak_b_citygate_done_create");

    //show video
    gamePopup = new PIXI.Container();
    gamePopup.interactive = true;
    gamePopup.x = 250;
    gamePopup.y = 140;
    gameContainer.addChild(gamePopup);
    cleanUpRemoveArray.push(gamePopup);


    var videoTexture = PIXI.Texture.from('images/gate/port-outro.mp4');
    cleanUpArray.push(videoTexture);
    var videoElement = videoTexture.baseTexture.resource.source;

    var videoSprite = new PIXI.Sprite(videoTexture);
    videoSprite.width = 506;
    videoSprite.height = 386;
    gamePopup.addChild(videoSprite);
    cleanUpRemoveArray.push(videoSprite);

    videoElement.loop = false;
    videoElement.autoPlay = true;
    videoElement.muted = true;

    updateWallet(10);
    user.gateDone = true;

    updateUserCookie();


    var nextBtn = createNextBtn();
    nextBtn.x = 350;
    nextBtn.y = 300;
    nextBtn.on('pointerup', exitGate);
    gamePopup.addChild(nextBtn);
    cleanUpRemoveArray.push(nextBtn);
}

function exitGate() {
    backToUniverse();
}




//MONOPOLY
function showMonopolyPopup() {
    sendStatPoint("start-monopoly_test");
    stopMayorSpeak();

    gameConfig = {};

    gameConfig.bg = new PIXI.Graphics();
    gameConfig.bg.beginFill(0x000000);
    gameConfig.bg.hitArea = new PIXI.Rectangle(0, 0, 1100, 800);
    gameConfig.bg.interactive = true;
    gameConfig.bg.alpha = 0.3;
    gameConfig.bg.drawRect(0, 0, 1100, 800);
    gameContainer.addChild(gameConfig.bg);

    gamePopup = new PIXI.Container();
    gamePopup.x = 360;
    gamePopup.y = 130;
    gameContainer.addChild(gamePopup);

    gameConfig.popupBG = createMC("MonopolyAccessView00", 53, 0, 0)
    gameConfig.popupBG.gotoAndStop(0);
    gamePopup.addChild(gameConfig.popupBG);
    gameConfig.popupBG.interactive = true;

    var cancelBtn = createMC("exitbtn00", 2, 445, 20);
    cancelBtn.gotoAndStop(1);
    //make interactive on hover
    cancelBtn.interactive = true;
    cancelBtn.buttonMode = true;
    cancelBtn.on('pointerup', cancelMonopoly);
    gamePopup.addChild(cancelBtn);

    var bubbleTF = new PIXI.Text(universeData.monopolyAccess_calc_text.content, monoBubbleStyle);
    bubbleTF.x = 40;
    bubbleTF.y = 70;
    gamePopup.addChild(bubbleTF);

    //setup calc
    var num1 = Math.floor(Math.random() * 8) + 1;
    var num2 = Math.floor(Math.random() * 8) + 1;
    gameConfig.correct = num1 + num2;

    gameConfig.calcTF = new PIXI.Text(num1 + " + " + num2 + " =", monoCalcStyle);
    gameConfig.calcTF.x = 70;
    gameConfig.calcTF.y = 282;
    gamePopup.addChild(gameConfig.calcTF);

    var offsetx = 0;
    var offsety = 0;
    if (isIPad) {
        offsetx = -7;
        offsety = -4;
    }

    $("#monoinput").css("top", Math.floor((409 + offsety) * mobileScale) + "px");
    $("#monoinput").css("left", Math.floor(((160 + offsetx + gamePopup.x) * mobileScale) + gameContainer.x) + "px");
    $("#monoinput").show();


    var okBtn = createMC("okbtn00", 2, 205, 320);
    okBtn.gotoAndStop(1);
    //make interactive on hover
    okBtn.interactive = true;
    okBtn.buttonMode = true;
    okBtn.on('pointerup', checkMonoAccess);

    gamePopup.addChild(okBtn);

    gameContainer.addChild(gamePopup);

    setTimeout(playMonoAccessSpeak, 450);



}

function playMonoAccessSpeak() {
    mayorSpeak("speak_b_monopolyAccess_helpTxt", PIXI.Loader.shared);
}

function cancelMonopoly(e) {
    gameConfig.popupBG.onFrameChange = null;
    gameContainer.removeChild(gameConfig.bg);
    gamePopup.parent.removeChild(gamePopup);
    //e.preventDefault();

    $("#monoinput").hide();
    $("#monoinput input").val("");

}

function checkMonoAccess() {
    stopMayorSpeak();

    //if correct - show anim and show game
    //if false - show fail
    if (parseInt($("#monoinput input").val()) == gameConfig.correct) {
        if (gameConfig.wrongTitle) {
            gamePopup.removeChild(gameConfig.wrongNextBtn);
            gamePopup.removeChild(gameConfig.wrongText);
            gamePopup.removeChild(gameConfig.wrongTitle);
        }

        gameConfig.popupBG.gotoAndPlay(2);
        gameConfig.popupBG.onFrameChange = function() {
            if (this.currentFrame == 52) {
                this.gotoAndStop(52);
                showMonopoly();
                gameConfig.popupBG.onFrameChange = null;
                $("#monoinput").hide();
                $("#monoinput input").val("");
                gameContainer.removeChild(gameConfig.bg);

            }
        }

        gamePopup.removeChild(gameConfig.wrongNextBtn)
        gamePopup.removeChild(gameConfig.wrongText)
        gamePopup.removeChild(gameConfig.wrongTitle)

        mayorSpeak("speak_b_monopolyAccess_rightCode", PIXI.Loader.shared)
    } else {
        gameConfig.popupBG.gotoAndStop(1);
        gameConfig.wrongTitle = new PIXI.Text(universeData.monopolyAccess_wrong_header.content, monoWrongTitleStyle);
        gameConfig.wrongTitle.x = 310;
        gameConfig.wrongTitle.y = 230;
        gamePopup.addChild(gameConfig.wrongTitle);

        gameConfig.wrongText = new PIXI.Text(universeData.monopolyAccess_wrong_body.content, monoWrongTextStyle);
        gameConfig.wrongText.x = 310;
        gameConfig.wrongText.y = 255;
        gamePopup.addChild(gameConfig.wrongText);


        gameConfig.wrongNextBtn = createNextBtn();
        gameConfig.wrongNextBtn.scale.set(0.5);
        gameConfig.wrongNextBtn.x = 445;
        gameConfig.wrongNextBtn.y = 305;
        gameConfig.wrongNextBtn.on('pointerup', resetMonopolyAccess);
        gamePopup.addChild(gameConfig.wrongNextBtn);

        mayorSpeak("speak_b_monopolyAccess_wrongCode", PIXI.Loader.shared);
    }
}

function resetMonopolyAccess() {
    gameConfig.popupBG.gotoAndStop(0);
    gamePopup.removeChild(gameConfig.wrongNextBtn);
    gamePopup.removeChild(gameConfig.wrongText);
    gamePopup.removeChild(gameConfig.wrongTitle);

    var num1 = Math.floor(Math.random() * 8) + 1;
    var num2 = Math.floor(Math.random() * 8) + 1;
    gameConfig.correct = num1 + num2;

    gameConfig.calcTF.text = num1 + " + " + num2 + " =";
    $("#monoinput input").val("");

}


//MONOPOLY________________________________________________________________________________________________
function showMonopoly() {
    sendStatPoint("start-monopoly");
    if (gamePopup) {
        gamePopup.parent.removeChild(gamePopup);
    }

    stopMayorSpeak();
    clearInterval(universeAmbientSoundsInterval);
    universeAmbientSoundsInterval = null;

    gameSoundArray = new Array();

    gameContainer.removeChildren();
    if (gameLoader) {
        gameLoader.reset();
    }

    if (localTest) {
        loadMonopolyResources(JSON.parse('{"monopoly_add_point0":{"contenttype":"sound","content":"dk_diverse_speaks_3_0.mp3","subtitle":"Du har penge nok, s\u00e5 du f\u00e5r et point"},"monopoly_add_point1":{"contenttype":"sound","content":"dk_diverse_speaks_4_0.mp3","subtitle":"Du f\u00e5r et point, fordi du har penge nok"},"monopoly_withdraw_point":{"contenttype":"sound","content":"dk_diverse_speaks_2_0.mp3","subtitle":"Du har ikke penge nok, s\u00e5 du f\u00e5r trukket et point"},"speak_b_monopoly_bank_move":{"contenttype":"sound","content":"dk_roll_over_speak_paa_flytte_hus_ikon.mp3","subtitle":"Her kan du flytte til et andet hus og skifte familiens transportmiddel og k\u00e6ledyr. Men det koster penge at g\u00f8re det!"},"speak_b_monopoly_budgetView":{"contenttype":"sound","content":"dk_visning_af_opsparing_1.mp3","subtitle":"Her kan du se, hvad familiens penge er brugt til i denne m\u00e5ned - og hvor mange, der er tilbage til n\u00e6ste m\u00e5ned! Hvordan klarer du det?"},"speak_b_monopoly_create_family":{"contenttype":"sound","content":"dk_sammensaet_familie.mp3","subtitle":"Her skal du v\u00e6lge, hvem der skal v\u00e6re med i familien. Husk at give dem navne! Du bestemmer selv, om der skal v\u00e6re 1 eller 2 voksne. Og ogs\u00e5 hvor mange b\u00f8rn, der skal v\u00e6re. Du kan dog h\u00f8jst v\u00e6lge 6 b\u00f8rn i \u00e9n familie. N\u00e5r du har valgt en familie, s\u00e5 klik p\u00e5 den gr\u00f8nne knap!"},"speak_b_monopoly_create_house":{"contenttype":"sound","content":"dk_vaelg_bolig_mm.mp3","subtitle":"Nu skal du v\u00e6lge, hvordan familien skal bo, hvordan de skal komme rundt til familie og venner, og hvilket k\u00e6ledyr de skal have. Til h\u00f8jre kan du se, hvor mange penge familien f\u00e5r hver m\u00e5ned. Husk at tingene ikke koster det samme. N\u00e5r du er f\u00e6rdig, s\u00e5 klik p\u00e5 den gr\u00f8nne knap for at starte spillet."},"speak_b_monopoly_event_gotMoney0":{"contenttype":"sound","content":"dk_diverse_speaks_3.mp3","subtitle":"Du har penge nok, s\u00e5 du f\u00e5r et point"},"speak_b_monopoly_event_gotMoney1":{"contenttype":"sound","content":"dk_diverse_speaks_4.mp3","subtitle":"Du f\u00e5r et point, fordi du har penge nok"},"speak_b_monopoly_event_noMoney":{"contenttype":"sound","content":"dk_diverse_speaks_2.mp3","subtitle":"Du har ikke penge nok, s\u00e5 du f\u00e5r trukket et point"},"speak_b_monopoly_gameOver":{"contenttype":"sound","content":"dk_slut_paa_spil.mp3","subtitle":"S\u00e5 er spillet slut! Her kan du se, hvor mange point du fik! Hvordan synes du, at du klarede det? Du kan pr\u00f8ve igen, hvis du gerne vil se, om du kan g\u00f8re det endnu bedre"},"speak_b_monopoly_leaveGame":{"contenttype":"sound","content":"dk_ved_luk_klik_paa_pengebyikon.mp3","subtitle":"Klik p\u00e5 den gr\u00f8nne knap, hvis du gerne vil gemme dit spil, s\u00e5 du kan spille videre p\u00e5 et andet tidspunkt. Hvis du ikke vil gemme dit spil, klikker du i stedet p\u00e5 den r\u00f8de knap."},"speak_b_monopoly_newYearsEve_helptxt":{"contenttype":"sound","content":"dk_aarsafslutning.mp3","subtitle":"S\u00e5 er \u00e5ret g\u00e5et - og d\u00e9t skal fejres med en stor fest! Nu kan du bruge de sidste af de penge, du har sparet op. Klik p\u00e5 de ting, du gerne vil k\u00f8be til festen!"},"speak_b_monopoly_next_month1":{"contenttype":"sound","content":"dk_maanedskift_1.mp3","subtitle":"N\u00e5r du vil g\u00e5 til n\u00e6ste m\u00e5ned, s\u00e5 klik p\u00e5 den gr\u00f8nne knap."},"speak_b_monopoly_next_month2":{"contenttype":"sound","content":"dk_maanedskift_2.mp3","subtitle":"Er du klar til n\u00e6ste m\u00e5ned? S\u00e5 klik p\u00e5 den gr\u00f8nne knap."},"speak_b_monopoly_rollOver_bank":{"contenttype":"sound","content":"dk_diverse_speaks_1.mp3","subtitle":"Det her er banken. Her kan du se, hvor mange penge familien har lige nu."},"speak_b_monopoly_saveUpMoney_gotMoney":{"contenttype":"sound","content":"dk_visning_af_opsparing_1_0.mp3","subtitle":"Hvis der er penge i overskud, er det en god id\u00e9 at spare nogle af dem op nu."},"speak_b_monopoly_saveUpMoney_noMoney":{"contenttype":"sound","content":"dk_visning_af_opsparing_2.mp3","subtitle":"Der er ikke nogle penge. Derfor kan du ikke spare op lige nu."},"speak_b_monopoly_summerHoliday_helpTxt":{"contenttype":"sound","content":"dk_sommerferie.mp3","subtitle":"Nu skal familien rejse p\u00e5 sommerferie! Hvor synes du, at rejsen skal g\u00e5 til? Klik p\u00e5 den gr\u00f8nne knap p\u00e5 det sted, hvor du vil hen. Husk at du skal have sparet nok penge op til rejsen."},"speak_b_monopoly_summerHoliday_moveOn":{"contenttype":"sound","content":"dk_diverse_speaks_5.mp3","subtitle":"S\u00e5 er sommerferien slut. Hvordan klarede du dig? Klik p\u00e5 den gr\u00f8nne knap for at forts\u00e6tte spillet."},"speak_b_monopoly_toolbar_point":{"contenttype":"sound","content":"dk_roll_over_speak_paa_point.mp3","subtitle":"Det her er dine point. Pointene f\u00e5r du for hj\u00e6lpe familien med at betale for de ting, der sker i l\u00f8bet af \u00e5ret og for at s\u00f8rge for familiens k\u00e6ledyr og transportmiddel."},"speak_b_monopoly_toolbar_savings":{"contenttype":"sound","content":"dk_revideret_speak_til_roll_over_paa_sparegrisen.mp3","subtitle":"Det her er sparegrisen. Her kan du se, hvor mange penge familien har f\u00e5et sparet op til sommerferie og til fest."},"speak_b_monopoly_velkomst_og_forklaring":{"contenttype":"sound","content":"dk_velkomst_og_forklaring.mp3","subtitle":"Velkommen til Familiespillet! Her skal du hj\u00e6lpe en familie med at betale for de ting, der vil ske i l\u00f8bet af \u00e5ret. Du skal ogs\u00e5 s\u00f8rge for, at give familiens k\u00e6ledyr mad og du skal vaske og passe p\u00e5 familiens transportmiddel, s\u00e5 de altid kan komme rundt og bes\u00f8ge familie og venner. Du f\u00e5r point for begge dele, hvis du klarer det godt! Men husk, at det er ogs\u00e5 vigtigt at spare penge op, s\u00e5 familien har r\u00e5d til at komme p\u00e5 en god sommerferie og til at holde en stor fest, n\u00e5r \u00e5ret er slut. Klik p\u00e5 den gr\u00f8nne knap for at g\u00e5 i gang."},"speak_b_monopoly_velkomst_og_forklaring_hentSpil":{"contenttype":"sound","content":"dk_velkomst_og_forklaring-savedGame.mp3","subtitle":"Velkommen til Familiespillet! Her skal du hj\u00e6lpe en familie med at betale for de ting, der vil ske i l\u00f8bet af \u00e5ret. Du skal ogs\u00e5 s\u00f8rge for, at give familiens k\u00e6ledyr mad og du skal vaske og passe p\u00e5 familiens transportmiddel, s\u00e5 de altid kan komme rundt og bes\u00f8ge familie og venner. Du f\u00e5r point for begge dele, hvis du klarer det godt! Men husk, at det er ogs\u00e5 vigtigt at spare penge op, s\u00e5 familien har r\u00e5d til at komme p\u00e5 en god sommerferie og til at holde en stor fest, n\u00e5r \u00e5ret er slut. Hvis du har gemt et spil, kan du hente det nu. Ellers kan du ogs\u00e5 starte et helt nyt spil!"},"monopolyAccess_calc_text":{"contenttype":"label","content":"For at \u00e5bne bommen skal du regne koden rigtigt ud!","subtitle":""},"monopolyAccess_wrong_body":{"contenttype":"label","content":"Pr\u00f8v igen","subtitle":""},"monopolyAccess_wrong_header":{"contenttype":"label","content":"FORKERT SVAR","subtitle":""},"monopoly_bank_change_items":{"contenttype":"label","content":"Skift bolig, k\u00e6ledyr eller transportmiddel","subtitle":""},"monopoly_bank_equals":{"contenttype":"label","content":"I alt","subtitle":""},"monopoly_bank_fee":{"contenttype":"label","content":"Flytning","subtitle":""},"monopoly_bank_header1":{"contenttype":"label","content":"Denne m\u00e5neds h\u00e6ndelser","subtitle":""},"monopoly_bank_header2":{"contenttype":"label","content":"N\u00e6ste m\u00e5neds l\u00f8n og udgifter","subtitle":""},"monopoly_bank_house":{"contenttype":"label","content":"Bolig","subtitle":""},"monopoly_bank_income":{"contenttype":"label","content":"L\u00f8n","subtitle":""},"monopoly_bank_mechanic":{"contenttype":"label","content":"MEKANIKER\\nDu vedligeholdte ikke transportmidlet","subtitle":""},"monopoly_bank_pet":{"contenttype":"label","content":"K\u00e6ledyr","subtitle":""},"monopoly_bank_petdoctor":{"contenttype":"label","content":"<b>Dyrl\u00e6ge<\/b><br>Du glemte at give k\u00e6ledyret mad","subtitle":""},"monopoly_bank_savings":{"contenttype":"label","content":"SPAR OP TIL SOMMERFERIE OG NYT\u00c5R!","subtitle":""},"monopoly_bank_transaction":{"contenttype":"label","content":"Overf\u00f8rsel","subtitle":""},"monopoly_bank_transaction_mechanic":{"contenttype":"label","content":"Mekaniker","subtitle":""},"monopoly_bank_transaction_petdoctor":{"contenttype":"label","content":"Dyrl\u00e6ge","subtitle":""},"monopoly_bank_transport":{"contenttype":"label","content":"Transportmiddel","subtitle":""},"monopoly_highscore_on_highscore":{"contenttype":"label","content":"p\u00e5 highscorelisten...","subtitle":""},"monopoly_highscore_play_again":{"contenttype":"label","content":"Spil igen","subtitle":""},"monopoly_highscore_small_header":{"contenttype":"label","content":"Din score =","subtitle":""},"monopoly_highscore_veiw_highscore":{"contenttype":"label","content":"Se highscorelisten!","subtitle":""},"monopoly_highscore_you_are":{"contenttype":"label","content":"Du ligger nummer ","subtitle":""},"monopoly_highscore_your_best_score":{"contenttype":"label","content":"Din bedste score =","subtitle":""},"monopoly_highscore_your_score":{"contenttype":"label","content":"Din Score =","subtitle":""},"monopoly_intro_new_game":{"contenttype":"label","content":"Nyt spil","subtitle":""},"monopoly_intro_saved_game":{"contenttype":"label","content":"Gemt spil","subtitle":""},"monopoly_occ_status_eco_neg_balance":{"contenttype":"label","content":"Du havde ikke nok penge p\u00e5 din konto","subtitle":""},"monopoly_occ_status_eco_pos_balance":{"contenttype":"label","content":"Du havde nok penge p\u00e5 din konto","subtitle":""},"monopoly_occ_status_label":{"contenttype":"label","content":"Samlet pris","subtitle":""},"monopoly_print_score":{"contenttype":"label","content":"har opn\u00e5et en score p\u00e5:","subtitle":""},"monopoly_save_game":{"contenttype":"label","content":"Vil du gemme spillet?","subtitle":""},"monopoly_startup_enter_name":{"contenttype":"label","content":"skriv navn","subtitle":""},"monopoly_startup_family_label_adults":{"contenttype":"label","content":"VOKSNE (Max 2)","subtitle":""},"monopoly_startup_family_label_boys":{"contenttype":"label","content":"Drenge","subtitle":""},"monopoly_startup_family_label_children":{"contenttype":"label","content":"B\u00d8RN (Max 6)","subtitle":""},"monopoly_startup_family_label_girls":{"contenttype":"label","content":"Piger","subtitle":""},"monopoly_startup_family_label_men":{"contenttype":"label","content":"M\u00e6nd","subtitle":""},"monopoly_startup_family_label_woman":{"contenttype":"label","content":"Kvinder","subtitle":""},"monopoly_startup_items_label_appartment":{"contenttype":"label","content":"Lejlighed","subtitle":""},"monopoly_startup_items_label_castle":{"contenttype":"label","content":"Slot","subtitle":""},"monopoly_startup_items_label_city":{"contenttype":"label","content":"By","subtitle":""},"monopoly_startup_items_label_color":{"contenttype":"label","content":"Farve","subtitle":""},"monopoly_startup_items_label_country":{"contenttype":"label","content":"Landet","subtitle":""},"monopoly_startup_items_label_expences":{"contenttype":"label","content":"UDGIFTER","subtitle":""},"monopoly_startup_items_label_farm":{"contenttype":"label","content":"Bondeg\u00e5rd","subtitle":""},"monopoly_startup_items_label_fee":{"contenttype":"label","content":"GEBYR","subtitle":""},"monopoly_startup_items_label_house":{"contenttype":"label","content":"Hus","subtitle":""},"monopoly_startup_items_label_income":{"contenttype":"label","content":"L\u00d8N","subtitle":""},"monopoly_startup_items_label_name":{"contenttype":"label","content":"NAVN","subtitle":""},"monopoly_startup_items_label_pet":{"contenttype":"label","content":"K\u00c6LEDYR","subtitle":""},"monopoly_startup_items_label_place":{"contenttype":"label","content":"STED","subtitle":""},"monopoly_startup_items_label_residence":{"contenttype":"label","content":"BOLIG","subtitle":""},"monopoly_startup_items_label_revenue":{"contenttype":"label","content":"TILBAGE","subtitle":""},"monopoly_startup_items_label_rowhouse":{"contenttype":"label","content":"R\u00e6kkehus","subtitle":""},"monopoly_startup_items_label_transport":{"contenttype":"label","content":"TRANSPORTmiddel","subtitle":""},"monopoly_startup_toolbar_family":{"contenttype":"label","content":"LAV EN FAMILIE\\nDin familie skal minimum best\u00e5 af \u00e9n voksen og \u00e9t barn. N\u00e5r du har valgt en figur, skal du give den et navn.","subtitle":""},"monopoly_startup_toolbar_items":{"contenttype":"label","content":"FAMILIENS UDGIFTER\\nHer skal du v\u00e6lge, hvor din familie skal bo, hvordan de skal komme rundt til familie og venner og hvilket k\u00e6ledyr de skal have.<br>Ovre til h\u00f8jre kan du se, hvor meget familien tjener, og hvad de forskellige ting koster.","subtitle":""},"monopoly_summer_africa":{"contenttype":"label","content":"Afrika","subtitle":""},"monopoly_summer_antarctic":{"contenttype":"label","content":"Antarktisk","subtitle":""},"monopoly_summer_asia":{"contenttype":"label","content":"Asien","subtitle":""},"monopoly_summer_australia":{"contenttype":"label","content":"Australien","subtitle":""},"monopoly_summer_europe":{"contenttype":"label","content":"Europa","subtitle":""},"monopoly_summer_header":{"contenttype":"label","content":"Hvor vil du gerne rejse hen?","subtitle":""},"monopoly_summer_no_more_answers":{"contenttype":"label","content":"Der er ikke flere sp\u00f8rgsm\u00e5l","subtitle":""},"monopoly_summer_north_america":{"contenttype":"label","content":"Nordamerika","subtitle":""},"monopoly_summer_right_answer":{"contenttype":"label","content":"Rigtigt svar","subtitle":""},"monopoly_summer_south_america":{"contenttype":"label","content":"Sydamerika","subtitle":""},"monopoly_summer_wrong_answer":{"contenttype":"label","content":"Forkert svar","subtitle":""},"q1":{"contenttype":"question","content":"I hvilket land kan man se Eiffelt\u00e5rnet?","subtitle":"europe","option1":"Frankrig","option2":"Tyskland","option3":"Danmark","correctoption":"1","correcttext":"Eiffelt\u00e5rnet ligger Frankrig. Faktisk ligger det i Paris, som er hovedstanden i Frankrig."},"q2":{"contenttype":"question","content":"Hvilket land ligger ikke i Europa?","subtitle":"europe","option1":"Japan","option2":"\u00d8strig","option3":"Finland","correctoption":"1","correcttext":"Japan ligger ikke i Europa. Det ligger i Asien."},"q3":{"contenttype":"question","content":"Hvad kalder man de penge, som mange af landene i Europa har?","subtitle":"europe","option1":"Loggi","option2":"Mark","option3":"Euro","correctoption":"3","correcttext":"Mange af landene i Europa har Euro. Det har de blandt andet i Tyskland, Spanien, Holland og Gr\u00e6kenland."},"q4":{"contenttype":"question","content":"Hvilket dyr lever ikke i Europa?","subtitle":"europe","option1":"K\u00f8er","option2":"Elefanter","option3":"Bj\u00f8rne","correctoption":"2","correcttext":"Elefanter lever ikke i Europa. De lever kun i Afrika og i Indien."},"q5":{"contenttype":"question","content":"Hvis du st\u00e5r i byen Rom, hvilket land er du s\u00e5 i?","subtitle":"northamerica","option1":"Belgien","option2":"Spanien","option3":"Italien","correctoption":"3","correcttext":"Hvis du st\u00e5r i Rom, er du i Italien. Rom er nemlig hovedstaden i Italien."},"q6":{"contenttype":"question","content":"Hvad hedder de penge, som mange af de store lande i Nordamerika har?","subtitle":"northamerica","option1":"Euro","option2":"Dollar","option3":"Mark","correctoption":"2","correcttext":"De hedder Dollars. Dem har de blandt andet i USA og Canada."},"q7":{"contenttype":"question","content":"Hvilket land stammer musikken reggae fra?","subtitle":"northamerica","option1":"Cuba","option2":"USA","option3":"Jamaica","correctoption":"3","correcttext":"Reggae stammer fra landet Jamaica."},"q8":{"contenttype":"question","content":"Hvilket land ligger ikke i Nordamerika?","subtitle":"northamerica","option1":"Argentina","option2":"Canada","option3":"Mexico","correctoption":"1","correcttext":"Argentina ligger ikke i Nordamerika. Det ligger i Sydamerika."},"q9":{"contenttype":"question","content":"Hvad hedder pr\u00e6sidenten i USA?","subtitle":"northamerica","option1":"George Bush","option2":"Bill Clinton","option3":"Donald Trump","correctoption":"3","correcttext":"Pr\u00e6sidenten i USA hedder Donald Trump. De andre var pr\u00e6sidenter f\u00f8r ham."},"q10":{"contenttype":"question","content":"Hvilket dyr lever ikke i Nordamerika?","subtitle":"northamerica","option1":"K\u00e6nguro","option2":"F\u00e5r","option3":"Hest","correctoption":"1","correcttext":"K\u00e6nguroer lever ikke i Nordamerika. De lever i Australien."},"q11":{"contenttype":"question","content":"Hvad hedder den st\u00f8rste og mest kendte flod i Syd Amerika?","subtitle":"southamerica","option1":"Amazon floden","option2":"Nilen","option3":"Storfloden","correctoption":"1","correcttext":"Den st\u00f8rste og mest kendte flod hedder Amazonfloden. Den l\u00f8ber hovedsageligt igennem Brasilien."},"q12":{"contenttype":"question","content":"I hvilket land danser man meget samba?","subtitle":"southamerica","option1":"Chile","option2":"Argentina","option3":"Brasilien","correctoption":"3","correcttext":"Det g\u00f8r man i Brasilien. Der er hvert \u00e5r et karneval i byen Rio de Janeiro, hvor de danser meget samba!"},"q13":{"contenttype":"question","content":"Hvilket land ligger ikke i Sydamerika?","subtitle":"southamerica","option1":"Peru","option2":"Etiopien","option3":"Uruguay","correctoption":"2","correcttext":"Etiopien ligger ikke i Sydamerika. Det ligger i Afrika."},"q14":{"contenttype":"question","content":"Hvilket dyr, som er kendt for at spytte, lever i Sydamerika?","subtitle":"northamerica","option1":"L\u00f8ve","option2":"Lama","option3":"Isbj\u00f8rne","correctoption":"2","correcttext":"Lamaer lever i Sydamerika. De er kendt for at spytte, n\u00e5r de f\u00f8ler sig truet."},"q15":{"contenttype":"question","content":"Hvilket gammelt folkef\u00e6rd stammer fra Sydamerika?","subtitle":"southamerica","option1":"Munke","option2":"Beduiner","option3":"Inkaer","correctoption":"3","correcttext":"Inkaerne stammer fra Sydamerika. De var engang et af verdens st\u00f8rste samfund."},"q16":{"contenttype":"question","content":"Der ligger en meget stor \u00f8rken i Afrika. Hvad kalder man den?","subtitle":"africa","option1":"Sarah","option2":"Sahara","option3":"Ohara","correctoption":"2","correcttext":"\u00d8rkenen hedder Sahara, og det er verdens st\u00f8rste \u00f8rken. Der kan blive over 55 grader varmt!"},"q17":{"contenttype":"question","content":"Hvilken stor og meget lang flod ligger i Afrika?","subtitle":"northamerica","option1":"Mississippi","option2":"Amazon floden","option3":"Nilen","correctoption":"1","correcttext":"Nilen ligger i Afrika. Den er meget lang, nemlig over 6.500 kilometer."},"q18":{"contenttype":"question","content":"Hvilket dyr lever i Afrika?","subtitle":"africa","option1":"Elefant","option2":"Tiger","option3":"Lama","correctoption":"3","correcttext":"Elefanten lever i Afrika - men ogs\u00e5 i Indien. Forskellen p\u00e5 dem er, at de afrikanske elefanter har meget store \u00f8rer, og de indiske har meget sm\u00e5 \u00f8rer."},"q19":{"contenttype":"question","content":"Hvilket land ligger ikke i Afrika?","subtitle":"africa","option1":"Uruguay","option2":"Madagaskar","option3":"Ghana","correctoption":"1","correcttext":"Uruguay ligger ikke i Afrika. Det ligger i Syd Amerika."},"q20":{"contenttype":"question","content":"Hvad hedder det h\u00f8jeste bjerg i Afrika?","subtitle":"africa","option1":"Alperne","option2":"Kilimanjaro","option3":"Mount Everest","correctoption":"2","correcttext":"Kilimanjaro er det h\u00f8jeste bjerg i Afrika. Det er over 5.800 meter!"},"q21":{"contenttype":"question","content":"Hvad kalder man de indf\u00f8dte i Australien?","subtitle":"australia","option1":"Indianere","option2":"Aboriginies","option3":"Beduiner","correctoption":"2","correcttext":"Aboriginies er Australiens indf\u00f8dte befolkning. De har levet der i over 30.000 \u00e5r!"},"q22":{"contenttype":"question","content":"Hvilket gammelt v\u00e5ben kommer fra Australien?","subtitle":"australia","option1":"Pistol","option2":"Sabel","option3":"Boomerang","correctoption":"3","correcttext":"Boomerangen kommer fra Australien. Den kommer tilbage, n\u00e5r man kaster den."},"q23":{"contenttype":"question","content":"I Australien ligger verdens st\u00f8rste sten. Hvad hedder den?","subtitle":"australia","option1":"Flintstone","option2":"Ayers Rock","option3":"Hard Rock","correctoption":"2","correcttext":"Verdens st\u00f8rste sten hedder Ayers Rock. Man kan genkende den p\u00e5 sin r\u00f8de farve."},"q24":{"contenttype":"question","content":"Hvilket instrument kommer fra Australien?","subtitle":"northamerica","option1":"Digeridoo","option2":"Trommer","option3":"Tuba","correctoption":"1","correcttext":"Digeridooen kommer fra Australien. Det er n\u00e6rmest et langt r\u00f8r af tr\u00e6, og siger en helt specielt lyd!"},"q25":{"contenttype":"question","content":"Koalabj\u00f8rnen lever i Australien. Men hvad spiser den?","subtitle":"australia","option1":"Korn","option2":"Andre dyr","option3":"Eukalyptus blade","correctoption":"3","correcttext":"Koalabj\u00f8rnen spiser eukalyptus blade!"},"q26":{"contenttype":"question","content":"Hvilket sprog taler man ikke i Asien?","subtitle":"asia","option1":"Gr\u00e6sk","option2":"Kinesisk","option3":"Indisk","correctoption":"1","correcttext":"Man taler ikke gr\u00e6sk i Asien. Det g\u00f8r man nemlig i Gr\u00e6kenland."},"q27":{"contenttype":"question","content":"Hvilket land stammer ris fra?","subtitle":"asia","option1":"Indien","option2":"Filippinerne","option3":"Kina","correctoption":"2","correcttext":"Ris stammer fra Kina, men man spiser det ogs\u00e5 i de andre lande."},"q28":{"contenttype":"question","content":"Hvilket land ligger ikke i Asien?","subtitle":"asia","option1":"Japan","option2":"Vietnam","option3":"Peru","correctoption":"3","correcttext":"Peru ligger ikke i Asien. Det ligger i Sydamerika."},"q29":{"contenttype":"question","content":"Hvilket land bor der flest mennesker i?","subtitle":"asia","option1":"Vietnam","option2":"Kina","option3":"Taiwan","correctoption":"2","correcttext":"Det g\u00f8r der i Kina. Faktisk bor der over 1,3 milliard mennesker!"},"q30":{"contenttype":"question","content":"Hvad hedder hovedstaden i Japan?","subtitle":"asia","option1":"Tokyo","option2":"Beijing","option3":"Berlin","correctoption":"1","correcttext":"Hovedstaden i Japan hedder Tokyo. Beijing ligger i Kina, og Berlin ligger i Tyskland."},"monopoly_occurence_button_show":{"contenttype":"sound","content":"postoffice_fejl_lyd_3_0.mp3","subtitle":""},"monopoly_pointSound_smiley":{"contenttype":"sound","content":"Ok lyd 2.mp3","subtitle":""},"monopoly_select_bigCar":{"contenttype":"sound","content":"bil horn big car.mp3","subtitle":""},"monopoly_select_cat":{"contenttype":"sound","content":"Kat.mp3","subtitle":""},"monopoly_select_cykel":{"contenttype":"sound","content":"cykel ringeklokke.mp3","subtitle":""},"monopoly_select_dog":{"contenttype":"sound","content":"Hund.mp3","subtitle":""},"monopoly_select_fisk":{"contenttype":"sound","content":"Fisk2.mp3","subtitle":""},"monopoly_select_fugl":{"contenttype":"sound","content":"Fugl.mp3","subtitle":""},"monopoly_select_hamster":{"contenttype":"sound","content":"Hamster.mp3","subtitle":""},"monopoly_select_motorCykel":{"contenttype":"sound","content":"motorcykel horn.mp3","subtitle":""},"monopoly_select_smallCar":{"contenttype":"sound","content":"bil horn small car.mp3","subtitle":""},"monopoly_select_spider":{"contenttype":"sound","content":"Edderkop.mp3","subtitle":""},"monopoly_select_van":{"contenttype":"sound","content":"bil horn small car_0.mp3","subtitle":""},"monopoly_startMonth_sound":{"contenttype":"sound","content":"newMonth.mp3","subtitle":""},"monopoly_summerHoliday_musicLoop":{"contenttype":"sound","content":"summerholiday.mp3","subtitle":""},"Arv":{"shortname":"Arv","contenttype":"event","month":"random","eventtext":"Familien arvede pludselig 5 guldm\u00f8nter fra en rig og ukendt onkel i Amerika!","person":"all","facteventmoney":"50","facteventsatisfaction":"","consequence1title":"","consequence1text":"","consequence1money":"","consequence2title":"","consequence2text":"","consequence2money":"","consequence3title":"","consequence3text":"","consequence3money":""},"B\u00f8de for r\u00f8dt lys":{"shortname":"B\u00f8de for r\u00f8dt lys","contenttype":"event","month":"random","eventtext":"En i familien har f\u00e5et en b\u00f8de p\u00e5 3 guldm\u00f8nter for at k\u00f8re over for r\u00f8dt lys. Det var dumt.","person":"all","facteventmoney":"-30","facteventsatisfaction":"","consequence1title":"","consequence1text":"","consequence1money":"","consequence2title":"","consequence2text":"","consequence2money":"","consequence3title":"","consequence3text":"","consequence3money":""},"Bold smadrer rude":{"shortname":"Bold smadrer rude","contenttype":"event","month":"july","eventtext":"Familien spiller bold i haven. Bolden rammer et vindue, der smadrer. Hvad vil du g\u00f8re?","person":"all","facteventmoney":"","facteventsatisfaction":"","consequence1title":"F\u00e5 en glarmester til at s\u00e6tte en ny vinduesrude i til 8 s\u00f8lvm\u00f8nter","consequence1text":"Glarmesteren skulle ogs\u00e5 have 1 guldm\u00f8nt og 6 s\u00f8lvm\u00f8nter i l\u00f8n og 4 s\u00f8lvm\u00f8nter for at k\u00f8re ud til familien","consequence1money":"-28","consequence2title":"K\u00f8be en ny rude til 8 s\u00f8lvm\u00f8nter og selv reparere vinduet","consequence2text":"Reparationen gik heldigvis fint","consequence2money":"-8","consequence3title":"Lade vinduesruden v\u00e6re som den er. Lige nu er det jo sommer og varmt","consequence3text":"En fugl fl\u00f8j ind gennem den smadrede rude, og der r\u00f8g en fin vase p\u00e5 gulvet. Vasen kostede 1 guldm\u00f8nt","consequence3money":"-10"},"Ekstra regning":{"shortname":"Ekstra regning","contenttype":"event","month":"random","eventtext":"Familien fik en uventet regning. De skulle derfor betale 4 guldm\u00f8nter med det samme!","person":"all","facteventmoney":"-40","facteventsatisfaction":"","consequence1title":"","consequence1text":"","consequence1money":"","consequence2title":"","consequence2text":"","consequence2money":"","consequence3title":"","consequence3text":"","consequence3money":""},"En fugl \u00f8del\u00e6gger skorstenen":{"shortname":"En fugl \u00f8del\u00e6gger skorstenen","contenttype":"event","month":"december","eventtext":"En fugl har bygget rede i skorstenen. Desv\u00e6rre g\u00e5r skorstenen i stykker, og 5 sten falder af. Hvad vil du g\u00f8re?","person":"all","facteventmoney":"","facteventsatisfaction":"","consequence1title":"K\u00f8be et skorstensr\u00f8r af st\u00e5l til 1 guldm\u00f8nt og 2 s\u00f8lvm\u00f8nter og s\u00e6tte det op i stedet","consequence1text":"Skorstenen blev ikke s\u00e5 p\u00e6n, men det virkede","consequence1money":"-12","consequence2title":"K\u00f8be nogle nye mursten og fors\u00f8ge selv at reparere skorstenen","consequence2text":"Familien k\u00f8bte 5 sten til 1 s\u00f8lvm\u00f8nter pr. stk. Reparationen gik heldigvis fint","consequence2money":"-5","consequence3title":"F\u00e5 en murer til at lave det","consequence3text":"Mureren skulle have 2 s\u00f8lvm\u00f8nter for hver sten plus en l\u00f8n p\u00e5 1 guldm\u00f8nt og 7 s\u00f8lvm\u00f8nter","consequence3money":"-27"},"Faldt p\u00e5 sk\u00f8jter":{"shortname":"Faldt p\u00e5 sk\u00f8jter","contenttype":"event","month":"january","eventtext":"<name> var ude for at st\u00e5 p\u00e5 sk\u00f8jter p\u00e5 isen og faldt og slog hovedet. Hvad vil du g\u00f8re?","person":"all","facteventmoney":"","facteventsatisfaction":"","consequence1title":"Ringe efter en ambulance","consequence1text":"Ambulancen kom med det samme og k\u00f8rte <name> p\u00e5 sygehuset. Der var heldigvis ikke sket noget alvorligt","consequence1money":"","consequence2title":"Give <name> nogle hovedpinepiller","consequence2text":"Der var ikke flere hovedpinepiller tilbage. Det kostede 7 s\u00f8lvm\u00f8nter at k\u00f8be nogle nye\u00a0","consequence2money":"-7","consequence3title":"Ringe efter en l\u00e6ge","consequence3text":"L\u00e6gen sagde, at der ikke var sket noget, men at familien skulle k\u00f8be nogle bestemte hovedpinepiller til 5 s\u00f8lvm\u00f8nter til <name>","consequence3money":"-5"},"Familief\u00f8dselsdag":{"shortname":"Familief\u00f8dselsdag","contenttype":"event","month":"september","eventtext":"Familien bliver inviteret til en familief\u00f8dselsdag i den anden ende af landet. Hvad vil du g\u00f8re?","person":"all","facteventmoney":"","facteventsatisfaction":"","consequence1title":"Takke ja til invitationen og k\u00f8be en fin gave til 1 guldm\u00f8nt og 5 s\u00f8lvm\u00f8nter","consequence1text":"Familien tog toget over til f\u00f8dselsdagen. Turen kostede i alt 1 guldm\u00f8nt","consequence1money":"-25","consequence2title":"Melde afbud for at kunne spare de 1 guldm\u00f8nt og 5 s\u00f8lvm\u00f8nter til gaven","consequence2text":"Familien valgte at g\u00e5 p\u00e5 restaurant om aftenen i stedet for. Det kostede 1 guldm\u00f8nt og 5 s\u00f8lvm\u00f8nter","consequence2money":"-15","consequence3title":"Melde afbud, men stadig sende en f\u00f8dselsdaggave til 1 guldm\u00f8nt med posten","consequence3text":"Posten kostede 3 s\u00f8lvm\u00f8nter","consequence3money":"-13"},"Fartb\u00f8de":{"shortname":"Fartb\u00f8de","contenttype":"event","month":"random","eventtext":"<name> havde k\u00f8rt for hurtigt, og fik en fartb\u00f8de p\u00e5 4 guldm\u00f8nter. Det var dumt.","person":"all","facteventmoney":"-40","facteventsatisfaction":"","consequence1title":"","consequence1text":"","consequence1money":"","consequence2title":"","consequence2text":"","consequence2money":"","consequence3title":"","consequence3text":"","consequence3money":""},"Fjernsyn g\u00e5et i stykker":{"shortname":"Fjernsyn g\u00e5et i stykker","contenttype":"event","month":"november","eventtext":"En stol v\u00e6lter pludselig ind i fjernsynet, s\u00e5 det g\u00e5r i stykker. Hvad vil du g\u00f8re?","person":"all","facteventmoney":"","facteventsatisfaction":"","consequence1title":"Holde op med at se fjernsyn","consequence1text":"Familien skal ikke l\u00e6ngere betale 1 guldm\u00f8nt i tv-licens","consequence1money":"10","consequence2title":"K\u00f8be et andet fjernsyn til 2 guldm\u00f8nter og f\u00e5 det bragt ud","consequence2text":"Det viste sig, at familien ogs\u00e5 skulle betale 5 s\u00f8lvm\u00f8nter for at f\u00e5 fjernsynet bragt ud","consequence2money":"-25","consequence3title":"F\u00e5 fjernsynet repareret for 1 guldm\u00f8nt samt 5 s\u00f8lvm\u00f8nter i transport","consequence3text":"Det viste sig, at familien ogs\u00e5 skulle betale 5 s\u00f8lvm\u00f8nter for at f\u00e5 fjernsynet sat op","consequence3money":"-20"},"Fodbold":{"shortname":"Fodbold","contenttype":"event","month":"july","eventtext":"<name> vil gerne spille fodbold, men mangler t\u00f8j og fodboldst\u00f8vler. Hvad vil du g\u00f8re?","person":"all","facteventmoney":"","facteventsatisfaction":"","consequence1title":"Sige til <name>, at der ikke er r\u00e5d til at spille fodbold lige nu","consequence1text":"<name> blev ked af det, og familien valgte derfor at g\u00e5 i biografen som tr\u00f8st. Biografbiletterne kostede 4 s\u00f8lvm\u00f8nter","consequence1money":"-4","consequence2title":"K\u00f8be nyt t\u00f8j og fodboldst\u00f8vler til <name> til 1 guldm\u00f8nt og 2 s\u00f8lvm\u00f8nter","consequence2text":"Det kostede ogs\u00e5 1 guldm\u00f8nt og 1 s\u00f8lvm\u00f8nt for at g\u00e5 til fodbold og at komme derud med bussen","consequence2money":"-23","consequence3title":"L\u00e5ne noget t\u00f8j og nogle fodboldst\u00f8vler af en kammerat","consequence3text":"Det kostede 1 guldm\u00f8nt og 1 s\u00f8lvm\u00f8nt for at g\u00e5 til fodbold og at komme derud med bussen","consequence3money":"-11"},"Forsikringen stiger":{"shortname":"Forsikringen stiger","contenttype":"event","month":"june","eventtext":"Familiens forsikring til deres transportmiddel stiger. Hvad vil du g\u00f8re?","person":"all","facteventmoney":"","facteventsatisfaction":"","consequence1title":"V\u00e6lge ikke at ville have en forsikring","consequence1text":"Transportmidlet blev skadet kort efter, og familien m\u00e5tte selv betale for skaden. Den kostede 3 guldm\u00f8nter og 7 s\u00f8lvm\u00f8nter","consequence1money":"-37","consequence2title":"V\u00e6lge at f\u00e5 en anden forsikring, som familien har set en reklame for","consequence2text":"Den anden forsikring viste sig desv\u00e6rre at v\u00e6re 1 guldm\u00f8nt dyrere end den pris, familien havde set i reklamen","consequence2money":"-10","consequence3title":"Unders\u00f8ge hvor familien f\u00e5r den bedste forsikring","consequence3text":"Den bedste forsikring var 6 s\u00f8lvm\u00f8nter dyrere end den gamle. Til geng\u00e6ld betalte forsikringen hele skaden, da transportmidlet kort efter kom til skade","consequence3money":"-6"},"Fort\u00e6nder kn\u00e6kket":{"shortname":"Fort\u00e6nder kn\u00e6kket","contenttype":"event","month":"december","eventtext":"Familien g\u00e5r en tur i skoven. Desv\u00e6rre glider <name> i sneen og kn\u00e6kker to fort\u00e6nder. Hvad vil du g\u00f8re?","person":"all","facteventmoney":"","facteventsatisfaction":"","consequence1title":"F\u00e5 <name> til tandl\u00e6gen med det samme, s\u00e5 t\u00e6nderne kan blive repareret. Det koster 1 guldm\u00f8nt og 5 s\u00f8lvm\u00f8nter for hver tand","consequence1text":"Der var heldigvis julerabat p\u00e5 5 s\u00f8lvm\u00f8nter for hver tand","consequence1money":"-20","consequence2title":"F\u00e5 fort\u00e6nderne lavet hos en billigere tandl\u00e6ge i udlandet, hvor det kun koster 1 guldm\u00f8nt for hver tand","consequence2text":"Rejsen til udlandet kostede 5 s\u00f8lvm\u00f8nter","consequence2money":"-25","consequence3title":"F\u00e5 en nem og hurtig tandreparation til 5 s\u00f8lvm\u00f8nter for hver tand","consequence3text":"Tandreparationen var d\u00e5rlig. Den faldt af i l\u00f8bet af en uge, og det kostede 3 guldm\u00f8nter at f\u00e5 lavet t\u00e6nderne ordentligt hos tandl\u00e6ge","consequence3money":"-40"},"Frosne vandr\u00f8r":{"shortname":"Frosne vandr\u00f8r","contenttype":"event","month":"january","eventtext":"Vandet i et vandr\u00f8r er frosset til is, fordi det har v\u00e6ret uhyggelig koldt udenfor. Hvad vil du g\u00f8re?","person":"all","facteventmoney":"","facteventsatisfaction":"","consequence1title":"Ringe til en h\u00e5ndv\u00e6rker med det samme","consequence1text":"H\u00e5ndv\u00e6rkeren fik varmet vandr\u00f8ret op igen. Det kostede dog 8 s\u00f8lvm\u00f8nter","consequence1money":"-8","consequence2title":"Lave et b\u00e5l under vandr\u00f8ret, s\u00e5 isen inde i vandr\u00f8ret kan smelte","consequence2text":"Der gik desv\u00e6rre ild i et gardin til 1 guldm\u00f8nt og 5 s\u00f8lvm\u00f8nter","consequence2money":"-15","consequence3title":"Vikle nogle klude om vandr\u00f8ret for at f\u00e5 det til at t\u00f8 op","consequence3text":"Det hjalp ikke. Vandr\u00f8ret gik i stykker, og der kom vand over det hele. Det kostede 1 guldm\u00f8nt at f\u00e5 det repareret","consequence3money":"-10"},"Fugl":{"shortname":"Fugl","contenttype":"event","month":"june","eventtext":"En stor fugl kom ud af kurs og \u00f8delagde 2 vinduesruder. Hvad vil du g\u00f8re?","person":"all","facteventmoney":"","facteventsatisfaction":"","consequence1title":"S\u00e6tte 2 tr\u00e6plader op i stedet for. Hver tr\u00e6plade koster 5 s\u00f8lvm\u00f8nter","consequence1text":"Tr\u00e6pladerne var ikke s\u00e5 gode til at holde p\u00e5 varmen. Det kostede familien 2 guldm\u00f8nter ekstra p\u00e5 varmeregningen","consequence1money":"-20","consequence2title":"K\u00f8be to nye ruder til 1 guldm\u00f8nt pr. stk.","consequence2text":"De nye ruder var s\u00e5 meget bedre end de gamle, at de sparede 6 s\u00f8lvm\u00f8nter p\u00e5 varmeregningen","consequence2money":"-14","consequence3title":"Fjerne ruderne helt, s\u00e5 fuglene kan flyve igennem","consequence3text":"Det kostede 3 guldm\u00f8nter ekstra i varme","consequence3money":"-30"},"G\u00e6st \u00f8delagde dyrt glas":{"shortname":"G\u00e6st \u00f8delagde dyrt glas","contenttype":"event","month":"october","eventtext":"En af familiens g\u00e6ster kom til at sl\u00e5 et dyrt glas i stykker, fordi hun faldt over noget leget\u00f8j, der l\u00e5 p\u00e5 gulvet. Hvad vil du g\u00f8re?","person":"all","facteventmoney":"","facteventsatisfaction":"","consequence1title":"Smide g\u00e6sten ud","consequence1text":"G\u00e6sten blev s\u00e5 ked af det, at hun kom til at tabe et glas mere p\u00e5 gulvet. De to nye glas kostede i alt 2 guldm\u00f8nter og 2 s\u00f8lvm\u00f8nter","consequence1money":"-22","consequence2title":"Bede g\u00e6sten om at k\u00f8be et nyt glas","consequence2text":"G\u00e6sten lovede, at hun ville k\u00f8be et nyt glas til familien","consequence2money":"0","consequence3title":"Sige skidt med det, fordi familien heldigvis har masser af glas","consequence3text":"Familien klarede sig fint uden det smadrede glas","consequence3money":"0"},"Glemt at slukke for vandhanen":{"shortname":"Glemt at slukke for vandhanen","contenttype":"event","month":"november","eventtext":"En i familien har glemt at slukke for vandhanen p\u00e5 badev\u00e6relset. Derfor er der vand p\u00e5 hele badev\u00e6relsesgulvet. Hvad vil du g\u00f8re?","person":"all","facteventmoney":"","facteventsatisfaction":"","consequence1title":"\u00c5bne d\u00f8ren til badev\u00e6relset, s\u00e5 vandet kan l\u00f8be ud","consequence1text":"Vandet l\u00f8b ud p\u00e5 et dyrt gulvt\u00e6ppe, der derfor m\u00e5tte sendes til rensning. Det kostede 4 guldm\u00f8nter","consequence1money":"-40","consequence2title":"Ringe til en blikkenslager","consequence2text":"Blikkenslageren var forsinket. Der n\u00e5ede at l\u00f8be 1000 liter vand ud til en pris p\u00e5 1 guldm\u00f8nt og 5 s\u00f8lvm\u00f8nter. Blikkenslageren skulle desuden have 8 s\u00f8lvm\u00f8nter for at lukke for vandet","consequence2money":"-23","consequence3title":"Slukke for vandhanen","consequence3text":"For at slukke vandhanen skulle badev\u00e6relsesd\u00f8ren \u00e5bnes. Vandet l\u00f8b ud p\u00e5 tr\u00e6gulvet, og familien m\u00e5tte leje en t\u00f8rremaskine til 2 guldm\u00f8nter, s\u00e5 gulvet ikke blev \u00f8delagt","consequence3money":"-40"},"Glemt biblioteksbog":{"shortname":"Glemt biblioteksbog","contenttype":"event","month":"november","eventtext":"<name> har glemt at aflevere en bog til biblioteket. Biblioteksbogen har ligget p\u00e5 v\u00e6relset i mange m\u00e5neder! Hvad vil du g\u00f8re?","person":"all","facteventmoney":"","facteventsatisfaction":"","consequence1title":"Lade som ingenting. Det dukker vel nok op","consequence1text":"Familien modtog flere rykkere fra biblioteket og en b\u00f8de p\u00e5 i alt 1 guldm\u00f8nt og 2 s\u00f8lvm\u00f8nter","consequence1money":"-12","consequence2title":"F\u00e5 afleveret bogen i en fart, selvom det stadig koster et rykkergebyr","consequence2text":"Rykkergebyret viste sig at koste 5 s\u00f8lvm\u00f8nter","consequence2money":"-5","consequence3title":"K\u00f8be biblioteksbogen af biblioteket og lade <name> beholde den","consequence3text":"Bogen kostede 1 guldm\u00f8nt og 5 s\u00f8lvm\u00f8nter","consequence3money":"-15"},"Glemte n\u00f8gler":{"shortname":"Glemte n\u00f8gler","contenttype":"event","month":"march","eventtext":"<name> har glemt sine n\u00f8gler. Hvad vil du g\u00f8re?","person":"all","facteventmoney":"","facteventsatisfaction":"","consequence1title":"Sl\u00e5 et vindue i stykker, s\u00e5 <name> kan kravle ind","consequence1text":"<name> fandt det mindste vindue og kom ind, men det kostede 2 guldm\u00f8nter og 4 s\u00f8lvm\u00f8nter at f\u00e5 en ny rude","consequence1money":"-24","consequence2title":"Ringe efter l\u00e5sesmeden, s\u00e5 han kunne komme og l\u00e5se d\u00f8ren op","consequence2text":"Det tog lang tid for l\u00e5sesmeden at f\u00e5 l\u00e5sen op. L\u00e5sesmeden skulle betales 1 guldm\u00f8nt og 2 s\u00f8lvm\u00f8nter i l\u00f8n og 3 s\u00f8lvm\u00f8nter i transport","consequence2money":"-15","consequence3title":"Vente til der kommer nogle hjem","consequence3text":"Der kom nogle hjem kort tid efter, s\u00e5 <name> kom hurtigt ind","consequence3money":"0"},"Havem\u00f8bler frem":{"shortname":"Havem\u00f8bler frem","contenttype":"event","month":"april","eventtext":"Havem\u00f8blerne skal stilles frem. Familien opdager, at nogle af br\u00e6dderne er r\u00e5dnet. Hvad vil du g\u00f8re?","person":"all","facteventmoney":"","facteventsatisfaction":"","consequence1title":"Smide alle havem\u00f8blerne ud og k\u00f8be nogle nye, der er lige s\u00e5 gode","consequence1text":"De nye havem\u00f8bler kostede 2 guldm\u00f8nter og 2 s\u00f8lvm\u00f8nter","consequence1money":"-22","consequence2title":"K\u00f8be nogle billigere havem\u00f8bler, der dog ikke er s\u00e5 stabile","consequence2text":"De nye, billige havem\u00f8bler kostede 1 guldm\u00f8nt og 1 s\u00f8lvm\u00f8nt","consequence2money":"-11","consequence3title":"K\u00f8be nye br\u00e6dder og selv reparere havem\u00f8blerne","consequence3text":"De nye br\u00e6dder kostede 6 s\u00f8lvm\u00f8nter, og s\u00f8m og skruer kostede 3 s\u00f8lvm\u00f8nter","consequence3money":"-9"},"Kabel tv":{"shortname":"Kabel tv","contenttype":"event","month":"march","eventtext":"Familien vil gerne have kabel-tv, s\u00e5 de kan se mange forskellige tv-kanaler. Hvad vil du g\u00f8re?","person":"all","facteventmoney":"","facteventsatisfaction":"","consequence1title":"K\u00f8be den mindste kabel-tv pakke, der ikke kan vise s\u00e5 mange kanaler. Til geng\u00e6ld koster den kun 5 s\u00f8lvm\u00f8nter","consequence1text":"Familien blev glade for de nye tv-kanaler","consequence1money":"-5","consequence2title":"K\u00f8be den allerst\u00f8rste kabel-tv pakke, der kan vise flest kanaler. Den koster 2 guldm\u00f8nter","consequence2text":"Familien blev glade for flere af kanalerne, men der var ogs\u00e5 rigtig mange af kanalerne, som de aldrig s\u00e5","consequence2money":"-20","consequence3title":"K\u00f8be en mellem kabel-tv pakke med tv-kanaler for alle i familien til 1 guldm\u00f8nt og 3 s\u00f8lvm\u00f8nter","consequence3text":"Familien blev glade for de nye kanaler","consequence3money":"-13"},"K\u00e6ledyr har f\u00e5et allergi":{"shortname":"K\u00e6ledyr har f\u00e5et allergi","contenttype":"event","month":"june","eventtext":"Familiens k\u00e6ledyr har f\u00e5et allergi og skal derfor have noget s\u00e6rligt dyrt mad. Hvad vil du g\u00f8re?","person":"all","facteventmoney":"","facteventsatisfaction":"","consequence1title":"F\u00e5 aflivet k\u00e6ledyret hos dyrl\u00e6gen, selvom det er trist","consequence1text":"Dyrl\u00e6gen gav familien en regning p\u00e5 2 guldm\u00f8nter og 3 s\u00f8lvm\u00f8nter","consequence1money":"-23","consequence2title":"K\u00f8be den dyre mad henne i dyreforretningen. Maden koster 1 guldm\u00f8nt og 2 s\u00f8lvm\u00f8nter","consequence2text":"Det hjalp familiens k\u00e6ledyr! Dyret blev hurtigt rask igen","consequence2money":"-12","consequence3title":"S\u00f8rge for at k\u00e6ledyret ikke f\u00e5r det at spise, som den ikke kan t\u00e5le","consequence3text":"Det viste sig, at maden blev billigere p\u00e5 den m\u00e5de. Familien sparede derfor 1 guldm\u00f8nt og 7 s\u00f8lvm\u00f8nter","consequence3money":"17"},"Klaverspil":{"shortname":"Klaverspil","contenttype":"event","month":"october","eventtext":"<name> vil gerne g\u00e5 i musikskole og l\u00e6re at spille klaver. Hvad vil du g\u00f8re?","person":"all","facteventmoney":"","facteventsatisfaction":"","consequence1title":"Leje et klaver til 5 s\u00f8lvm\u00f8nter","consequence1text":"<name> skulle leje klaveret i mindst 6 m\u00e5neder, men blev rigtig god til at spille p\u00e5 det","consequence1money":"-30","consequence2title":"K\u00f8be et klaver til 2 guldm\u00f8nter","consequence2text":"<name> blev rigtig god til at spille p\u00e5 klaveret","consequence2money":"-20","consequence3title":"Opfordre <name> til at g\u00e5 til blokfl\u00f8jte i stedet, fordi blokfl\u00f8jten kun koster 1 guldm\u00f8nt","consequence3text":"<name> blev god til at spille blokfl\u00f8jte, men ville stadig gerne g\u00e5 til klaver. S\u00e5 familien endte med at skulle betale for begge dele","consequence3money":"-30"},"Knuste briller":{"shortname":"Knuste briller","contenttype":"event","month":"january","eventtext":"<name> glider p\u00e5 gulvet i badev\u00e6relset og falder og sl\u00e5r sine briller itu. Hvad vil du g\u00f8re?","person":"all","facteventmoney":"","facteventsatisfaction":"","consequence1title":"<name> m\u00e5 klare sig uden briller i fremtiden","consequence1text":"<name> kom til at sl\u00e5 ting i stykker for 1 guldm\u00f8nt, fordi det var sv\u00e6rt at se ordentligt \u00a0","consequence1money":"-10","consequence2title":"F\u00e5 brilleglassene skiftet ud med nogle nye. Hvert glas koster 7 s\u00f8lvm\u00f8nter","consequence2text":"Det viste sig, at det ogs\u00e5 kostede 3 s\u00f8lvm\u00f8nter i l\u00f8n til brillemanden","consequence2money":"-17","consequence3title":"K\u00f8be helt nye briller til 1 guldm\u00f8nt for brillestellet og 5 s\u00f8lvm\u00f8nter for hvert af glassene","consequence3text":"<name> s\u00e5 meget bedre med de nye briller","consequence3money":"-20"},"Konkurrence":{"shortname":"Konkurrence","contenttype":"event","month":"random","eventtext":"<name> har vundet 2 guldm\u00f8nter i en konkurrence. Alle i familien giver <name> et stort knus og siger tillykke!","person":"all","facteventmoney":"20","facteventsatisfaction":"","consequence1title":"","consequence1text":"","consequence1money":"","consequence2title":"","consequence2text":"","consequence2money":"","consequence3title":"","consequence3text":"","consequence3money":""},"L\u00e5nt cykel \u00f8delagt":{"shortname":"L\u00e5nt cykel \u00f8delagt","contenttype":"event","month":"may","eventtext":"<name> havde l\u00e5nt en vens cykel. Cyklen blev dog \u00f8delagt af en bil, der k\u00f8rte over den. Hvad vil du g\u00f8re?","person":"all","facteventmoney":"","facteventsatisfaction":"","consequence1title":"Sende cyklen til reparation. Det kostede 1 guldm\u00f8nt og 7 s\u00f8lvm\u00f8nter at f\u00e5 den til at k\u00f8re igen","consequence1text":"Cyklen blev s\u00e5 god som ny","consequence1money":"-17","consequence2title":"F\u00e5 bilisten til at betale for, at cyklen bliver repareret","consequence2text":"Desv\u00e6rre havde alle glemt at skrive nummerpladen p\u00e5 bilen ned. Derfor kunne de ikke finde bilisten, og de m\u00e5tte selv betale for reparationen","consequence2money":"-17","consequence3title":"K\u00f8be en ny cykel til vennen","consequence3text":"Familien havde heldigvis en forsikring, der betalte for den nye cykel","consequence3money":"0"},"Lopper":{"shortname":"Lopper","contenttype":"event","month":"may","eventtext":"Familiens k\u00e6ledyr har f\u00e5et lopper. Hvad vil du g\u00f8re?","person":"all","facteventmoney":"","facteventsatisfaction":"","consequence1title":"Fors\u00f8ge at fange lopperne","consequence1text":"Det var helt umuligt. I fors\u00f8get faldt <name> over en stor potteplante, s\u00e5 den gik i stykker. Den kostede 1 guldm\u00f8nt og 5 s\u00f8lvm\u00f8nter","consequence1money":"-15","consequence2title":"G\u00e5 til dyrl\u00e6gen for at f\u00e5 hj\u00e6lp, selvom det koster 2 guldm\u00f8nter og 3 s\u00f8lvm\u00f8nter","consequence2text":"Dyrl\u00e6gen fik fjernet alle lopperne","consequence2money":"-23","consequence3title":"K\u00f8be et loppemiddel til 1 guldm\u00f8nt og 4 s\u00f8lvm\u00f8nter","consequence3text":"Loppemidlet viste sig at v\u00e6re p\u00e5 tilbud. S\u00e5 familien sparede 6 s\u00f8lvm\u00f8nter","consequence3money":"-8"},"Mistet bankkort":{"shortname":"Mistet bankkort","contenttype":"event","month":"march","eventtext":"Familiens h\u00e6vekort er blevet v\u00e6k, fordi jakken, hvor det l\u00e5 i, er forsvundet. Hvad vil du g\u00f8re?","person":"all","facteventmoney":"","facteventsatisfaction":"","consequence1title":"Lade som ingenting. Det dukker vel nok op","consequence1text":"Familien opdagede, at h\u00e6vekortet ikke bare var forsvundet. Det var blevet stj\u00e5let. Tyven havde brugt kortet, og det kom til at koste familien 1 guldm\u00f8nt og 5 s\u00f8lvm\u00f8nter","consequence1money":"-15","consequence2title":"Bede alle i familien om at lede i hele huset, indtil h\u00e6vekortet er fundet","consequence2text":"<name> fandt jakken med h\u00e6vekortet i","consequence2money":"0","consequence3title":"Ringe til banken, og bede dem lukke h\u00e6vekortet, s\u00e5 ingen kan bruge det, hvis det nu er blevet stj\u00e5let","consequence3text":"H\u00e6vekortet var blevet stj\u00e5let. Men fordi der hurtigt blev ringet til banken, havde tyven ikke n\u00e5et at bruge det","consequence3money":"0"},"Mus p\u00e5 loftet":{"shortname":"Mus p\u00e5 loftet","contenttype":"event","month":"august","eventtext":"Familien har i lang tid haft bes\u00f8g af en mus, der har larmet og gnavet i familiens ting p\u00e5 loftet. Hvad vil du g\u00f8re?","person":"all","facteventmoney":"","facteventsatisfaction":"","consequence1title":"H\u00e5be at den l\u00f8ber over til naboen","consequence1text":"Det gjorde den faktisk. S\u00e5 der var familien heldige","consequence1money":"0","consequence2title":"K\u00f8be en musef\u00e6lde til 1 guldm\u00f8nt","consequence2text":"Musen havnede hurtigt i f\u00e6lden, fordi den blev lokket af den gode ost, familien havde brugt som lokkemad","consequence2money":"-10","consequence3title":"Lade som om det ikke betyder noget","consequence3text":"Musen \u00f8delagde tagets isolering, der derfor m\u00e5tte skiftes for 2 guldm\u00f8nter","consequence3money":"-20"},"Ny computer":{"shortname":"Ny computer","contenttype":"event","month":"random","eventtext":"Familiens computer er g\u00e5et i stykker, og de skal k\u00f8be en ny. Hvad vil du g\u00f8re?","person":"all","facteventmoney":"","facteventsatisfaction":"","consequence1title":"K\u00f8be en ny computer med det samme, s\u00e5 familien ikke skal undv\u00e6re en computer for l\u00e6nge. Den koster dog 3 guldm\u00f8nter","consequence1text":"Computeren var dyr, men til geng\u00e6ld sparede den str\u00f8m. Derfor faldt el-regningen med 1 guldm\u00f8nt","consequence1money":"-20","consequence2title":"Leje en ny computer. Det koster 4 s\u00f8lvm\u00f8nter hver m\u00e5ned i 6 m\u00e5neder","consequence2text":"Den nye computer sparede str\u00f8m. Derfor faldt el-regningen med 1 guldm\u00f8nt","consequence2money":"-14","consequence3title":"Give familien tid til at tjekke priser i forskellige forretninger. Familien er uden computer i 14 dage, men finder en billig computer til 2 guldm\u00f8nter","consequence3text":"Den nye computer sparede str\u00f8m. Derfor faldt el-regningen med 1 guldm\u00f8nt","consequence3money":"-10"},"P\u00e5ske\u00e6g":{"shortname":"P\u00e5ske\u00e6g","contenttype":"event","month":"april","eventtext":"<name> havde k\u00f8bt store p\u00e5ske\u00e6g til hele familien. Desv\u00e6rre r\u00f8g alle p\u00e5ske\u00e6ggene p\u00e5 jorden og gik i stykker, fordi <name> blev forskr\u00e6kket, da en cyklist susede forbi i h\u00f8j fart. Hvad vil du g\u00f8re?","person":"all","facteventmoney":"","facteventsatisfaction":"","consequence1title":"K\u00f8be nye p\u00e5ske\u00e6g, men kun til b\u00f8rnene. \u00c6ggene koster 4 s\u00f8lvm\u00f8nter","consequence1text":"B\u00f8rnene blev glade og n\u00f8d deres store p\u00e5ske\u00e6g","consequence1money":"-4","consequence2title":"Servere de knuste p\u00e5ske\u00e6g og give b\u00f8rnene 2 s\u00f8lvm\u00f8nter ekstra i lommepenge som tr\u00f8st","consequence2text":"B\u00f8rnene overtalte <name> til at give dem 4 s\u00f8lvm\u00f8nter i stedet","consequence2money":"-4","consequence3title":"Smide de knuste p\u00e5ske\u00e6g ud og k\u00f8be nogle nye til hele familien til i alt 6 s\u00f8lvm\u00f8nter","consequence3text":"Hele familien blev glade for de nye, l\u00e6kre p\u00e5ske\u00e6g","consequence3money":"-6"},"P\u00e6re i loftlampe sprunget":{"shortname":"P\u00e6re i loftlampe sprunget","contenttype":"event","month":"june","eventtext":"P\u00e6ren i en loftlampe er sprunget, s\u00e5 der er helt m\u00f8rkt. <name> falder ned ad trappen og sl\u00e5r sig. Hvad vil du g\u00f8re?","person":"all","facteventmoney":"","facteventsatisfaction":"","consequence1title":"Give <name> plaster p\u00e5. Et plaster koster 1 s\u00f8lvm\u00f8nt","consequence1text":"Plasteret skulle skiftes hver dag i en uge","consequence1money":"-7","consequence2title":"S\u00e6tte ny p\u00e6re i lampen til 2 s\u00f8lvm\u00f8nter","consequence2text":"Det viste sig, at der skulle to p\u00e6rer i lampen","consequence2money":"-4","consequence3title":"Tr\u00f8ste <name>","consequence3text":"<name> blev hurtigt glad igen","consequence3money":"0"},"Printer v\u00e6ltet":{"shortname":"Printer v\u00e6ltet","contenttype":"event","month":"march","eventtext":"Familiens skrivebord v\u00e6ltede, s\u00e5 printeren faldt ned p\u00e5 gulvet og blev \u00f8delagt. Hvad vil du g\u00f8re?","person":"all","facteventmoney":"","facteventsatisfaction":"","consequence1title":"Holde op med at printe derhjemme","consequence1text":"Fordi familien ikke selv kunne printe mere, m\u00e5tte de g\u00e5 p\u00e5 biblioteket, hver gang de skulle printe. Det kostede 1 s\u00f8lvm\u00f8nt pr. side. Hver m\u00e5ned printede familien 9 sider","consequence1money":"-9","consequence2title":"F\u00e5 printeren sendt til reparation i en computerforretning. Det koster 4 s\u00f8lvm\u00f8nter for en reservedel og 2 s\u00f8lvm\u00f8nter til forretningen","consequence2text":"Desv\u00e6rre tog forretningen ogs\u00e5 2 s\u00f8lvm\u00f8nter for at sende printeren hjem til familien, efter de havde repareret den","consequence2money":"-8","consequence3title":"K\u00f8be en brugt printer af naboen. Naboen skulle have 2 guldm\u00f8nter for printeren, men endte alligevel med at give familien 4 s\u00f8lvm\u00f8nter i rabat","consequence3text":"Den brugte printer fra naboen kunne mange flere ting end familiens gamle printer","consequence3money":"-16"},"Ridning":{"shortname":"Ridning","contenttype":"event","month":"may","eventtext":"<name> vil gerne g\u00e5 til ridning, men har ikke noget rideudstyr. Hvad vil du g\u00f8re?","person":"all","facteventmoney":"","facteventsatisfaction":"","consequence1title":"Bede <name> om at spare sammen til rideudstyret","consequence1text":"<name> sparede 2 guldm\u00f8nter op","consequence1money":"20","consequence2title":"Overtale <name> til at v\u00e6lge en anden sport, der ikke er s\u00e5 dyr","consequence2text":"<name> valgte i stedet at g\u00e5 til badminton. Det kom dog til at koste 8 s\u00f8lvm\u00f8nter for badmintonsko og 1 guldm\u00f8nt og 2 s\u00f8lvm\u00f8nter for at spille i en badmintonklub","consequence2money":"-20","consequence3title":"K\u00f8be alt det n\u00f8dvendige udstyr til ridning med det samme","consequence3text":"Ridehjelmen, ridest\u00f8vlerne og handskerne kostede i alt 2 guldm\u00f8nter","consequence3money":"-20"},"Spejl g\u00e5et i stykker":{"shortname":"Spejl g\u00e5et i stykker","contenttype":"event","month":"december","eventtext":"Familiens store spejl faldt ned p\u00e5 gulvet og gik i stykker, fordi der blev spillet bold i entreen. Hvad vil du g\u00f8re?","person":"all","facteventmoney":"","facteventsatisfaction":"","consequence1title":"Holde op med at kigge i spejlet","consequence1text":"Det bet\u00f8d, at <name> gik p\u00e5 arbejde med uglet h\u00e5r og tandpasta p\u00e5 kinden. <name> blev derfor sendt hjem igen i en taxa. Det kostede 8 s\u00f8lvm\u00f8nter","consequence1money":"-8","consequence2title":"Pr\u00f8ve at lime spejlet sammen igen med en st\u00e6rk lim til 4 s\u00f8lvm\u00f8nter","consequence2text":"Det holdt ikke l\u00e6nge. Spejlet m\u00e5tte smides ud, og familien k\u00f8bte et nyt til 1 guldm\u00f8nt og 2 s\u00f8lvm\u00f8nter","consequence2money":"-16","consequence3title":"K\u00f8be et nyt spejl til 2 guldm\u00f8nter og en snor til 2 s\u00f8lvm\u00f8nter, som spejlet kan h\u00e6nge i","consequence3text":"Det nye spejl holdt i mange \u00e5r","consequence3money":"-26"},"Stormskade":{"shortname":"Stormskade","contenttype":"event","month":"october","eventtext":"Under en storm bl\u00e6ser familiens hovedd\u00f8r op. En stor rude i d\u00f8ren g\u00e5r desv\u00e6rre i stykker. Hvad vil du g\u00f8re?","person":"all","facteventmoney":"","facteventsatisfaction":"","consequence1title":"K\u00f8be en helt ny d\u00f8r til 3 guldm\u00f8nter","consequence1text":"Den nye d\u00f8r viste sig at v\u00e6re bedre end den gamle. Den var s\u00e5 god til at holde p\u00e5 varmen, at familien sparede 1 guldm\u00f8nt p\u00e5 varmeregningen","consequence1money":"-20","consequence2title":"S\u00e6tte en plade p\u00e5 i stedet for en ny rude. Pladen koster 3 s\u00f8lvm\u00f8nter, og s\u00f8mmene koster 1 s\u00f8lvm\u00f8nt","consequence2text":"Pladen holdt desv\u00e6rre ikke. Det kostede 1 guldm\u00f8nt og 5 s\u00f8lvm\u00f8nter at f\u00e5 d\u00f8ren repareret","consequence2money":"-19","consequence3title":"K\u00f8be en ny rude. Den koster 5 s\u00f8lvm\u00f8nter, og glarmesteren skal have 1 guldm\u00f8nt for at s\u00e6tte ruden i","consequence3text":"D\u00f8ren blev repareret, og familien var glade","consequence3money":"-15"},"Str\u00f8mafbrydelse":{"shortname":"Str\u00f8mafbrydelse","contenttype":"event","month":"august","eventtext":"Der har v\u00e6ret str\u00f8mafbrydelse p\u00e5 hele vejen, hvor familien bor. Derfor er al maden i fryseren t\u00f8et op. Hvad vil du g\u00f8re?","person":"all","facteventmoney":"","facteventsatisfaction":"","consequence1title":"Invitere en masse g\u00e6ster, s\u00e5 de kan spise al den opt\u00f8ede mad","consequence1text":"Familien m\u00e5tte ud og k\u00f8be drikkevarer til alle g\u00e6sterne for 1 guldm\u00f8nt og 6 s\u00f8lvm\u00f8nter. Til geng\u00e6ld havde de en festlig aften","consequence1money":"-16","consequence2title":"Fryse den opt\u00f8ede mad ned igen","consequence2text":"Der var nogle f\u00e5 ting, der godt kunne fryses ned igen. Men det meste af maden blev d\u00e5rlig og m\u00e5tte smides v\u00e6k. Den \u00f8delagte mad kostede 1 guldm\u00f8nt","consequence2money":"-10","consequence3title":"Smide al maden v\u00e6k og k\u00f8be noget nyt","consequence3text":"Familien m\u00e5tte k\u00f8be ny mad til fryseren. Det blev dyrt. De kom af med 2 guldm\u00f8nter og 1 s\u00f8lvm\u00f8nt","consequence3money":"-21"},"Tabt mobil":{"shortname":"Tabt mobil","contenttype":"event","month":"january","eventtext":"<name> var p\u00e5 toilettet. Mobilen gled ud af lommen og faldt i toilettet, s\u00e5 den gik i stykker. Hvad vil du g\u00f8re?","person":"all","facteventmoney":"","facteventsatisfaction":"","consequence1title":"Fiske mobilen op igen med det samme og t\u00f8rre den godt med et h\u00e5ndkl\u00e6de","consequence1text":"Mobilen kunne ikke t\u00e5le vand, og det hjalp ikke at t\u00f8rre den. Mobilen var derfor \u00f8delagt, og <name> m\u00e5tte k\u00f8be en ny til 2 guldm\u00f8nter","consequence1money":"-20","consequence2title":"Bede <name> om at spare sammen til en ny","consequence2text":"Mens <name> sparede sammen, blev computeren brugt flittigt. Og fordi computeren hele tiden var optaget, m\u00e5tte de andre tale mere i telefon. Det kostede 8 s\u00f8lvm\u00f8nter p\u00e5 telefonregningen","consequence2money":"-8","consequence3title":"K\u00f8be en ny mobil til <name> til 2 guldm\u00f8nter","consequence3text":"<name> fik en ny telefon, som <name> blev rigtig glad for","consequence3money":"-20"},"Tapetet \u00f8delagt":{"shortname":"Tapetet \u00f8delagt","contenttype":"event","month":"february","eventtext":"Sneen p\u00e5 taget smelter, og der l\u00f8ber vand ind i huset, s\u00e5 tapetet p\u00e5 v\u00e6ggen falder af. Hvad vil du g\u00f8re?","person":"all","facteventmoney":"","facteventsatisfaction":"","consequence1title":"Lime tapetet op igen med en lim til 2 s\u00f8lvm\u00f8nter","consequence1text":"Det holdt heldigvis rigtig godt og l\u00e6nge","consequence1money":"-2","consequence2title":"Tage det \u00f8delagte tapet ned og h\u00e5be p\u00e5, at man stadigv\u00e6k kan k\u00f8be mere af det samme tapet igen","consequence2text":"Man kunne ikke f\u00e5 tapet i samme m\u00f8nster, som det der var i stuen. Hele stuen skulle derfor have nyt tapet. Det kr\u00e6vede 8 ruller tapet til 3 s\u00f8lvm\u00f8nter pr. rulle","consequence2money":"-24","consequence3title":"H\u00e6nge et t\u00e6ppe hen over stedet, hvor tapetet er faldet af","consequence3text":"T\u00e6ppet blev \u00f8delagt af fugt. Det kostede 8 s\u00f8lvm\u00f8nter. Familien m\u00e5tte leje en t\u00f8rremaskine i en hel uge til 1 guldm\u00f8nt og 3 s\u00f8lvm\u00f8nter. De k\u00f8bte derefter en rulle tapet til 3 s\u00f8lvm\u00f8nter og satte det selv op","consequence3money":"-24"},"Toilet itu":{"shortname":"Toilet itu","contenttype":"event","month":"february","eventtext":"Familiens toilet er g\u00e5et i stykker, s\u00e5 det ikke kan bruges. Hvad vil du g\u00f8re?","person":"all","facteventmoney":"","facteventsatisfaction":"","consequence1title":"Grave et hul i jorden","consequence1text":"Ingen i familien ville grave, s\u00e5 de m\u00e5tte k\u00f8be et nyt toilet til 2 guldm\u00f8nter","consequence1money":"-20","consequence2title":"Lime toilettet sammen med lim til 6 s\u00f8lvm\u00f8nter","consequence2text":"Det viste sig desv\u00e6rre, at limen ikke var st\u00e6rk nok. Pengene var derfor spildt, og familien m\u00e5tte k\u00f8be et nyt toilet til 2 guldm\u00f8nter.","consequence2money":"-26","consequence3title":"K\u00f8be et smart nyt toilet til 2 guldm\u00f8nter","consequence3text":"Det nye toilet var bedre end det gamle. Det brugte nemlig mindre vand. Derfor sparede familien 4 s\u00f8lvm\u00f8nter p\u00e5 vandregningen","consequence3money":"-16"},"Uden buskort":{"shortname":"Uden buskort","contenttype":"event","month":"december","eventtext":"<name> vil tage bussen hjem, men har glemt sit buskort. Hvad synes du, <name> skal g\u00f8re?","person":"all","facteventmoney":"","facteventsatisfaction":"","consequence1title":"Tage chancen og pr\u00f8ve at komme med bussen alligevel","consequence1text":"Det gik ikke s\u00e5 godt. Buskontroll\u00f8ren kom forbi og gav en b\u00f8de p\u00e5 2 guldm\u00f8nter","consequence1money":"-20","consequence2title":"G\u00e5 hjem, selvom der er lidt langt","consequence2text":"Det tog over en time, men g\u00e5turen var gratis","consequence2money":"0","consequence3title":"K\u00f8be en billet til bussen","consequence3text":"Billetten kostede 2 s\u00f8lvm\u00f8nter","consequence3money":"-2"},"Uden komfur":{"shortname":"Uden komfur","contenttype":"event","month":"july","eventtext":"Familiens komfur er g\u00e5et i stykker. Hvad vil du g\u00f8re?","person":"all","facteventmoney":"","facteventsatisfaction":"","consequence1title":"Lave mad p\u00e5 b\u00e5l i haven","consequence1text":"Det var forbudt at t\u00e6nde b\u00e5l, der hvor familien boede, s\u00e5 familien fik en b\u00f8de p\u00e5 2 guldm\u00f8nter","consequence1money":"-20","consequence2title":"Spise kold mad i lang tid","consequence2text":"Det viste sig at blive en dyr forn\u00f8jelse. Faktisk kostede den kolde mad 1 guldm\u00f8nt og 5 s\u00f8lvm\u00f8nter","consequence2money":"-15","consequence3title":"K\u00f8be et nyt komfur","consequence3text":"Det nye komfur kostede 2 guldm\u00f8nter og 6 s\u00f8lvm\u00f8nter, men familien blev meget glad for det","consequence3money":"-26"},"Uden varme":{"shortname":"Uden varme","contenttype":"event","month":"february","eventtext":"Radiatorerne virker pludselig ikke mere. Hvad vil du g\u00f8re?","person":"all","facteventmoney":"","facteventsatisfaction":"","consequence1title":"Hele familien m\u00e5 tage varmt t\u00f8j p\u00e5. Der kan ikke g\u00f8res noget lige nu","consequence1text":"Det blev en lang vinter, hvor alle gik med meget t\u00f8j p\u00e5. Familien sparede dog 3 guldm\u00f8nter p\u00e5 varmeregningen","consequence1money":"30","consequence2title":"Pr\u00f8ve selv at reparere skaden","consequence2text":"Det kunne godt lade sig g\u00f8re, men det kr\u00e6vede dog, at familien skulle k\u00f8be en reservedel til 6 s\u00f8lvm\u00f8nter","consequence2money":"-6","consequence3title":"Ringe til en h\u00e5ndv\u00e6rker","consequence3text":"H\u00e5ndv\u00e6rkeren kom og ordnede familiens radiatorer. H\u00e5ndv\u00e6rkeren gav dog familien en regning p\u00e5 1 guldm\u00f8nt og 7 s\u00f8lvm\u00f8nter","consequence3money":"-17"},"Vaskemaskine":{"shortname":"Vaskemaskine","contenttype":"event","month":"august","eventtext":"Familiens vaskemaskine gik pludselig i stykker. Hvad vil du g\u00f8re?","person":"all","facteventmoney":"","facteventsatisfaction":"","consequence1title":"K\u00f8be en brugt vaskemaskine til 2 guldm\u00f8nter og 1 s\u00f8lvm\u00f8nt","consequence1text":"Den brugte vaskemaskine viste sig at v\u00e6re rigtig god og holde l\u00e6nge","consequence1money":"-21","consequence2title":"K\u00f8be en ny vaskemaskine til 3 guldm\u00f8nter","consequence2text":"Den nye vaskemaskine viste sig at v\u00e6re billig i str\u00f8m og bruge mindre vand. Regningen p\u00e5 str\u00f8m og vand faldt derfor med 5 s\u00f8lvm\u00f8nter","consequence2money":"-25","consequence3title":"K\u00f8be en meget dyr vaskemaskine til 4 guldm\u00f8nter, der er rigtig god for milj\u00f8et","consequence3text":"Med den nye vaskemaskine sparede familien hele 2 guldm\u00f8nter i str\u00f8m og vand","consequence3money":"-20"},"V\u00e5d computer":{"shortname":"V\u00e5d computer","contenttype":"event","month":"september","eventtext":"<name> har glemt at lukke et vindue. Derfor har det regnet ind p\u00e5 familiens computer hele natten. Hvad vil du g\u00f8re?","person":"all","facteventmoney":"","facteventsatisfaction":"","consequence1title":"Stille computeren over p\u00e5 en radiator, s\u00e5 den kan t\u00f8rre","consequence1text":"Det virkede desv\u00e6rre ikke. Computeren m\u00e5tte sendes til reparation. Det kostede 2 guldm\u00f8nter","consequence1money":"-20","consequence2title":"Lukke for vinduet og vente med at bruge computeren til den er helt t\u00f8r","consequence2text":"Det tog lang tid. Derfor lejede familien en computer i ventetiden. Det kostede 1 guldm\u00f8nt. Da den gamle computer var t\u00f8r, duede den ikke og m\u00e5tte alligevel sendes til reparation. Det kostede 2 guldm\u00f8nter","consequence2money":"-30","consequence3title":"K\u00f8be en ny computer til 3 guldm\u00f8nter","consequence3text":"Den nye computer var rigtig god og brugte mindre str\u00f8m end den gamle. Familien sparede derfor 6 s\u00f8lvm\u00f8nter i str\u00f8m","consequence3money":"-24"},"V\u00e6ltet p\u00e5 cykel":{"shortname":"V\u00e6ltet p\u00e5 cykel","contenttype":"event","month":"april","eventtext":"<name> v\u00e6ltede p\u00e5 sin cykel og slog sit kn\u00e6. Der kom et stort hul i bukserne. Hvad vil du g\u00f8re?","person":"all","facteventmoney":"","facteventsatisfaction":"","consequence1title":"F\u00e5 bukserne lappet og plaster p\u00e5 kn\u00e6et","consequence1text":"Familien fandt en gratis lap og et plaster til 1 s\u00f8lvm\u00f8nt","consequence1money":"-1","consequence2title":"K\u00f8be et par nye bukser magen til dem, der gik i stykker. De kostede 1 guldm\u00f8nt og 6 s\u00f8lvm\u00f8nter","consequence2text":"Bukserne var desv\u00e6rre steget i pris. Derfor kostede de nu 2 guldm\u00f8nter og 2 s\u00f8lvm\u00f8nter","consequence2money":"-22","consequence3title":"Smide bukserne v\u00e6k og finde et andet par","consequence3text":"Familien var heldige at finde et par nye bukser p\u00e5 udsalg til 1 guldm\u00f8nt og 3 s\u00f8lvm\u00f8nter","consequence3money":"-13"},"Vundet i Lotto":{"shortname":"Vundet i Lotto","contenttype":"event","month":"random","eventtext":"Der var en stor gevinst p\u00e5 3 guldm\u00f8nter p\u00e5 den Lotto-kupon, familien havde k\u00f8bt","person":"all","facteventmoney":"30","facteventsatisfaction":"0","consequence1title":"","consequence1text":"","consequence1money":"","consequence2title":"","consequence2text":"","consequence2money":"","consequence3title":"","consequence3text":"","consequence3money":""}}'));
    } else {
        $.ajax({
            type: 'GET',
            url: 'gameadmin/getcontent/monopoly.json',
            contentType: 'application/json; charset=utf-8',
            dataType: 'json',
        }).done(loadMonopolyResources);
    }
}

var monopolyData = new Array();
var monoData;

function loadMonopolyResources(data) {
    gameLoader = new PIXI.Loader();
    monoData = data;

    $.each(data, function(key, val) {
        if (val.contenttype == "sound") {
            gameLoader.add(key, "files/" + val.content);

            subtitleArray[key] = val.subtitle;

            gameSoundArray.push(key);
        } else if (val.contenttype == "event") {
            monopolyData.push(val);
        }
    })

    showPreloader();
    gameLoader.on('progress', preloadProgress);

    gameLoader.add("images/monopoly/monopolyCalendar.json")
        .add("images/monopoly/MonopolyIntroBG.png")
        .add("images/monopoly/monoPlayGameBtn.png")
        .add("images/monopoly/MonopolyStartup.png")
        .add("images/monopoly/MonopolyFamilyMember.json")
        .add("images/monopoly/MonopolyStartupMemberButton.json")
        .add("images/monopoly/MonopolyStartupFamily.png")
        .add("images/monopoly/MonopolyStartupToolbar.json")
        .add("images/monopoly/MonopolyStartupItems.png")
        .add("images/monopoly/MonopolyStartupCountryBtn.json")
        .add("images/monopoly/MonopolyStartupCityBtn.json")
        .add("images/monopoly/MonopolyQuestionMark.png")
        .add("images/monopoly/monoToolbar.png")
        .add("images/monopoly/monoBottomToolbar.png")
        .add("images/monopoly/monoEventFactBG.png")
        .add("images/monopoly/monoEventBG.png")
        .add("images/monopoly/MonopolyStartupPets.json")
        .add("images/monopoly/MonopolyStartupTransportsBtn.json")
        .add("images/monopoly/MonopolyStartupHouses.json")
        .add("images/monopoly/MonopolyStartupTransports.json")
        .add("images/monopoly/monoAlert.json")
        .add("images/monopoly/wallet.png")
        .add("images/monopoly/smiley.png")
        .add("images/monopoly/monoEventConsequenceBG.json")
        .add("images/monopoly/monoEventSelectBtn.json")
        .add("images/monopoly/monoBankBG.png")
        .add("images/monopoly/monoBankSaveBG.png")
        .add("images/monopoly/monoBankMechanic.png")
        .add("images/monopoly/monoBankPetDoctor.png")
        .add("images/monopoly/monoBankSaveBtn.json")
        .add("images/monopoly/monopolyBankCardRow.json")
        .add("images/monopoly/plusminus.json")
        .add("images/monopoly/sq/MonopolySQMap.png")
        .add("images/monopoly/sq/MonopolySQTravelButton.png")
        .add("images/monopoly/sq/questionBG.png")
        .add("images/monopoly/sq/sqBG.json")
        .add("images/monopoly/sq/sqCounterBtn.json")
        .add("images/monopoly/sq/sqTravelBtn.json")
        .add("images/monopoly/monoGameNextMonthBtn.json")
        .add("images/monopoly/sq/sqFinishedIcon.png")
        .add("images/monopoly/ny/MonopolyNewYearBG.png")
        .add("images/monopoly/ny/MonopolyNewYearFrame.png")
        .add("images/monopoly/ny/jukebox.json")
        .add("images/monopoly/ny/Balloner.png")
        .add("images/monopoly/ny/Blomsterranker.png")
        .add("images/monopoly/ny/cerpentiner.png")
        .add("images/monopoly/ny/Guirlander.png")
        .add("images/monopoly/ny/blomster.png")
        .add("images/monopoly/ny/hatte.png")
        .add("images/monopoly/ny/drinks.png")
        .add("images/monopoly/ny/Tallerkner.png")
        .add("images/monopoly/ny/cake.json")
        .add("images/monopoly/ny/lysestage.json")
        .add("images/monopoly/ny/konfetti.png")
        .add("images/monopoly/ny/diskokugle.json")
        .add("images/monopoly/ny/MonopolyHighscoreYourScore.png")
        .add("images/monopoly/MonopolyStartupExpencesIcon.png")
        .add("images/monopoly/transport.json")
        .add("images/monopoly/oil.json")
        .add("images/monopoly/food.json")
        .add("images/monopoly/dog.json")
        .add("images/monopoly/fish.json")
        .add("images/monopoly/bird.json")
        .add("images/monopoly/spider.json")
        .add("images/monopoly/cat.json")
        .add("images/monopoly/hamster.json")
        .add("images/monopoly/MonopolySaveGamePopup.png")
        .add("images/monopoly/MonopolyCancelGameButton.png")
        .add("images/monopoly/MonopolySaveGameButton.png")
        .add("images/monopoly/monopolyGetSavedGame.png")
    gameLoader.load(initMonopoly);
}


function initMonopoly(loader, resources) {
    gameConfig = {};

    var monoIntroBG = createSprite("images/monopoly/MonopolyIntroBG.png", 0, 0, gameLoader);
    gameContainer.addChild(monoIntroBG);
    cleanUpArray.push(monoIntroBG);

    var videoTexture = PIXI.Texture.from('images/monopoly/monoIntro.mp4');
    cleanUpArray.push(videoTexture);
    var videoElement = videoTexture.baseTexture.resource.source;

    var videoSprite = new PIXI.Sprite(videoTexture);
    videoSprite.width = 640;
    videoSprite.height = 480;
    videoSprite.x = 165;
    videoSprite.y = 50;
    gameContainer.addChild(videoSprite);
    cleanUpRemoveArray.push(videoSprite);

    videoElement.loop = true;
    videoElement.autoPlay = true;
    videoElement.muted = true;

    //add mayor speak
    mayorSpeak("speak_b_monopoly_velkomst_og_forklaring");

    //hide mayor and wishlist
    mayor.visible = false;
    wishlist.btn.visible = false;

    var introBtn = createSprite("images/monopoly/monoPlayGameBtn.png", 700, 460, gameLoader);
    introBtn.interactive = true;
    introBtn.buttonMode = true;
    introBtn.on('pointerup', monoSelectFamily);
    gameContainer.addChild(introBtn);
    cleanUpArray.push(introBtn);

    var nextBtn = createNextBtn();
    nextBtn.scale.set(0.5);
    nextBtn.x = 650;
    nextBtn.y = 500;
    nextBtn.on('pointerup', monoSelectFamily);
    gameContainer.addChild(nextBtn);
    cleanUpRemoveArray.push(nextBtn);

    var label = new PIXI.Text(monoData.monopoly_intro_new_game.content, {
        fontFamily: "Arial",
        fontSize: 16,
        fill: "white",
        fontWeight: "bold"
    });
    label.x = 680;
    label.y = 550;
    gameContainer.addChild(label);
    cleanUpArray.push(label);

    //check for saved game
    if ($.isEmptyObject(user.mono)) {

    } else {
        var introBtn = createSprite("images/monopoly/monopolyGetSavedGame.png", 840, 360, gameLoader);
        introBtn.interactive = true;
        introBtn.buttonMode = true;
        introBtn.on('pointerup', monoStartSavedGame);
        gameContainer.addChild(introBtn);
        cleanUpArray.push(introBtn);

        var nextBtn = createNextBtn();
        nextBtn.scale.set(0.5);
        nextBtn.x = 790;
        nextBtn.y = 400;
        nextBtn.on('pointerup', monoStartSavedGame);
        gameContainer.addChild(nextBtn);
        cleanUpRemoveArray.push(nextBtn);

        var label = new PIXI.Text(monoData.monopoly_intro_saved_game.content, {
            fontFamily: "Arial",
            fontSize: 16,
            fill: "white",
            fontWeight: "bold"
        });
        label.x = 820;
        label.y = 455;
        gameContainer.addChild(label);
        cleanUpArray.push(label);
    }

    if (universeBtn) {
        gameContainer.addChild(universeBtn);
    } else {
        universeBtn = createMC("UniverseButton00", 2, 780, 10);
        universeBtn.gotoAndStop(0);
        gameContainer.addChild(universeBtn);
        makeButton(universeBtn, backToUniverse);
    }
}

function monoStartSavedGame() {
    gameConfig.holidayNotHeld = user.mono.holidayNotHeld;
    gameConfig.money = user.mono.money;
    gameConfig.currentMonth = user.mono.currentMonth;
    gameConfig.points = user.mono.points;
    gameConfig.saved = user.mono.saved;

    gameConfig.selectedAdults = new Array();
    var adultNamesArray = user.mono.selectedAdults.split(",");
    for (var i = 0; i < adultNamesArray.length; i++) {
        gameConfig.selectedAdults.push({
            name: adultNamesArray[i]
        });
    }

    gameConfig.selectedChildren = new Array();
    var childNamesArray = user.mono.selectedChildren.split(",");
    for (var i = 0; i < childNamesArray.length; i++) {
        gameConfig.selectedChildren.push({
            name: childNamesArray[i]
        });
    }

    gameConfig.userCar = user.mono.userCar;
    gameConfig.userCarPrice = user.mono.userCarPrice;
    gameConfig.userHouse = user.mono.userHouse;
    gameConfig.userHousePrice = user.mono.userHousePrice;
    gameConfig.userPet = user.mono.userPet;
    gameConfig.userPetPrice = user.mono.userPetPrice;

    monoInitGameFromSave();


}

function monoSelectFamily() {
    stopMayorSpeak();
    mayorSpeak("speak_b_monopoly_create_family");

    if (user.mono) {
        delete user.mono;
    }
    updateUserCookie();

    gameContainer.removeChildren();
    //cleanup();

    gameConfig.startupBG = createSprite("images/monopoly/MonopolyStartup.png", 0, 0, gameLoader);
    gameContainer.addChild(gameConfig.startupBG);
    cleanUpArray.push(gameConfig.startupBG);

    gameConfig.startupFamilyBG = createSprite("images/monopoly/MonopolyStartupFamily.png", 200, 40, gameLoader);
    gameContainer.addChild(gameConfig.startupFamilyBG);
    cleanUpArray.push(gameConfig.startupFamilyBG);

    gameConfig.familyHolder = new PIXI.Container();
    gameConfig.familyHolder.x = 200;
    gameConfig.familyHolder.y = 200;
    gameContainer.addChild(gameConfig.familyHolder);
    cleanUpRemoveArray.push(gameConfig.familyHolder);

    gameConfig.adultButtons = new Array();
    gameConfig.childButtons = new Array();
    gameConfig.selectedAdults = new Array();
    gameConfig.selectedChildren = new Array();
    var familyButton;
    var familyButtonBG;
    var familyButtonPerson;
    //women
    for (var i = 0; i < 8; i++) {
        familyButton = new PIXI.Container();
        familyButton.index = i + 1;
        familyButton.name = "";
        familyButtonBG = createMCGC("MonopolyStartupMemberButton00", 4, 0, 0);
        familyButtonBG.gotoAndStop(0);
        familyButton.addChild(familyButtonBG);
        cleanUpArray.push(familyButtonBG);

        familyButtonPerson = createMCGC("MonopolyFamilyMember00", 34, 4, 8);
        familyButtonPerson.gotoAndStop(i + 1);
        familyButton.addChild(familyButtonPerson);
        cleanUpArray.push(familyButtonPerson);

        familyButton.x = 240 + (46 * (i % 4));
        familyButton.y = 97 + (Math.floor(i / 4) * 73);

        gameContainer.addChild(familyButton);
        gameConfig.adultButtons.push(familyButton);
        cleanUpRemoveArray.push(familyButton);

        familyButton.interactive = true;
        familyButton.buttonMode = true;
        familyButton.on("pointerup", familyButtonParentSelect);
    }

    //men
    for (var i = 0; i < 8; i++) {
        familyButton = new PIXI.Container();
        familyButton.index = i + 9;
        familyButton.name = "";
        familyButtonBG = createMCGC("MonopolyStartupMemberButton00", 4, 0, 0);
        familyButtonBG.gotoAndStop(0);
        familyButton.addChild(familyButtonBG);
        cleanUpArray.push(familyButtonBG);

        familyButtonPerson = createMCGC("MonopolyFamilyMember00", 34, 4, 8);
        familyButtonPerson.gotoAndStop(i + 9);
        familyButton.addChild(familyButtonPerson);
        cleanUpArray.push(familyButtonPerson);

        familyButton.x = 444 + (46 * (i % 4));
        familyButton.y = 97 + (Math.floor(i / 4) * 73);

        gameContainer.addChild(familyButton);
        gameConfig.adultButtons.push(familyButton);
        cleanUpRemoveArray.push(familyButton);

        familyButton.interactive = true;
        familyButton.buttonMode = true;
        familyButton.on("pointerup", familyButtonParentSelect);
    }

    //børn label

    //children 1
    for (var i = 0; i < 8; i++) {
        familyButton = new PIXI.Container();
        familyButton.index = i + 17;
        familyButton.name = "";
        familyButtonBG = createMCGC("MonopolyStartupMemberButton00", 4, 0, 0);
        familyButtonBG.gotoAndStop(0);
        familyButton.addChild(familyButtonBG);
        cleanUpArray.push(familyButtonBG);

        familyButtonPerson = createMCGC("MonopolyFamilyMember00", 34, 4, 8);
        familyButtonPerson.gotoAndStop(i + 17);
        familyButton.addChild(familyButtonPerson);
        cleanUpArray.push(familyButtonPerson);

        familyButton.x = 712 + (46 * (i % 4));
        familyButton.y = 197 + (Math.floor(i / 4) * 73);

        gameContainer.addChild(familyButton);
        gameConfig.childButtons.push(familyButton);
        cleanUpRemoveArray.push(familyButton);

        familyButton.interactive = true;
        familyButton.buttonMode = true;
        familyButton.on("pointerup", familyButtonChildSelect);
    }

    //children 2
    for (var i = 0; i < 8; i++) {
        familyButton = new PIXI.Container();
        familyButton.index = i + 25;
        familyButton.name = "";
        familyButtonBG = createMCGC("MonopolyStartupMemberButton00", 4, 0, 0);
        familyButtonBG.gotoAndStop(0);
        familyButton.addChild(familyButtonBG);
        cleanUpArray.push(familyButtonBG);

        familyButtonPerson = createMCGC("MonopolyFamilyMember00", 34, 4, 8);
        familyButtonPerson.gotoAndStop(i + 25);
        familyButton.addChild(familyButtonPerson);
        cleanUpArray.push(familyButtonPerson);

        familyButton.x = 712 + (46 * (i % 4));
        familyButton.y = 381 + (Math.floor(i / 4) * 73);

        gameContainer.addChild(familyButton);
        gameConfig.childButtons.push(familyButton);
        cleanUpRemoveArray.push(familyButton);

        familyButton.interactive = true;
        familyButton.buttonMode = true;
        familyButton.on("pointerup", familyButtonChildSelect);
    }

    gameConfig.startupNextBtn = createNextBtn();
    gameConfig.startupNextBtn.x = 850;
    gameConfig.startupNextBtn.y = 620;
    gameConfig.startupNextBtn.on('pointerup', monoCheckNames);
    frontGround.addChild(gameConfig.startupNextBtn);
    cleanUpRemoveArray.push(gameConfig.startupNextBtn);


    //Frontground
    gameConfig.startupFrontgroundBG = new PIXI.Graphics();
    gameConfig.startupFrontgroundBG.beginFill(0x1b7dbc);
    gameConfig.startupFrontgroundBG.drawRect(150, 0, 10, 600);
    gameConfig.startupFrontgroundBG.beginFill(0x5e8e13);
    gameConfig.startupFrontgroundBG.drawRect(-200, 0, 350, 600);
    gameConfig.startupFrontgroundBG.x = 0;
    gameConfig.startupFrontgroundBG.y = 0;
    frontGround.addChild(gameConfig.startupFrontgroundBG);
    cleanUpArray.push(gameConfig.startupFrontgroundBG);


    gameConfig.startupLeft = createMCGC("MonopolyStartupToolbar00", 2, 0, 100)
    gameConfig.startupLeft.gotoAndStop(0);
    frontGround.addChild(gameConfig.startupLeft);
    //show help text
    gameConfig.startupLeftText = new PIXI.Text(monoData.monopoly_startup_toolbar_family.content, smallTextStyle);
    gameConfig.startupLeftText.x = 10;
    gameConfig.startupLeftText.y = 230;
    frontGround.addChild(gameConfig.startupLeftText);
    cleanUpArray.push(gameConfig.startupLeftText);

    var smallText = createSmallTextBold(monoData.monopoly_startup_family_label_adults.content, 240, 50);
    gameContainer.addChild(smallText);
    cleanUpArray.push(smallText);

    smallText = createSmallTextBold(monoData.monopoly_startup_family_label_children.content, 710, 150);
    gameContainer.addChild(smallText);
    cleanUpArray.push(smallText);

    frontGround.setChildIndex(frontGround.avatarBG, frontGround.children.length - 1);
    frontGround.setChildIndex(avatar, frontGround.children.length - 1);
    frontGround.setChildIndex(frontGround.logo, frontGround.children.length - 1);

    TweenMax.to(bottomBar, 0.3, {
        pixi: {
            y: 580
        }
    });

    if (universeBtn) {
        gameContainer.addChild(universeBtn);
    } else {
        universeBtn = createMC("UniverseButton00", 2, 780, 10);
        universeBtn.gotoAndStop(0);
        gameContainer.addChild(universeBtn);
        makeButton(universeBtn, backToUniverse);
    }
}

function createSmallText(string, xPos, yPos) {
    var tf = new PIXI.Text(string, smallTextStyle);
    tf.x = xPos;
    tf.y = yPos;
    return tf;
}

function createSmallTextBold(string, xPos, yPos) {
    var tf = new PIXI.Text(string, smallBoldTextStyle);
    tf.x = xPos;
    tf.y = yPos;
    return tf;
}

function familyButtonParentSelect() {
    if (this.children[0].currentFrame == 3) {
        this.children[0].gotoAndStop(0);
        for (var i = 0; i < gameConfig.selectedAdults.length; i++) {
            if (this == gameConfig.selectedAdults[i]) {
                gameConfig.selectedAdults.splice(i, 1);
                break;
            }
        }

    } else {
        if (gameConfig.selectedAdults.length >= 2) {

        } else {
            this.children[0].gotoAndStop(3);
            gameConfig.selectedAdults.push(this);
        }
    }

    if (gameConfig.selectedAdults.length >= 2) {
        for (var i = 0; i < gameConfig.adultButtons.length; i++) {
            var isSelected = false;
            for (var j = 0; j < gameConfig.selectedAdults.length; j++) {
                if (gameConfig.adultButtons[i] == gameConfig.selectedAdults[j]) {
                    isSelected = true;
                    break;
                }
            }
            if (isSelected) {
                gameConfig.adultButtons[i].children[1].alpha = 1;
            } else {
                gameConfig.adultButtons[i].children[1].alpha = 0.5;
            }
        }

    } else {
        for (var i = 0; i < gameConfig.adultButtons.length; i++) {
            gameConfig.adultButtons[i].children[1].alpha = 1;
        }
    }

    redrawPersons();
}

function familyButtonChildSelect() {
    if (this.children[0].currentFrame == 3) {
        this.children[0].gotoAndStop(0);
        for (var i = 0; i < gameConfig.selectedChildren.length; i++) {
            if (this == gameConfig.selectedChildren[i]) {
                gameConfig.selectedChildren.splice(i, 1);
                break;
            }
        }

    } else {
        if (gameConfig.selectedChildren.length >= 6) {

        } else {
            this.children[0].gotoAndStop(3);
            gameConfig.selectedChildren.push(this);
        }
    }

    if (gameConfig.selectedChildren.length >= 6) {
        for (var i = 0; i < gameConfig.childButtons.length; i++) {
            var isSelected = false;
            for (var j = 0; j < gameConfig.selectedChildren.length; j++) {
                if (gameConfig.childButtons[i] == gameConfig.selectedChildren[j]) {
                    isSelected = true;
                    break;
                }
            }
            if (isSelected) {
                gameConfig.childButtons[i].children[1].alpha = 1;
            } else {
                gameConfig.childButtons[i].children[1].alpha = 0.5;
            }

        }

    } else {
        for (var i = 0; i < gameConfig.childButtons.length; i++) {
            gameConfig.childButtons[i].children[1].alpha = 1;
        }
    }

    redrawPersons();
}


function redrawPersons() {
    gameConfig.familyHolder.removeChildren();

    $(".mononameinput").hide();

    var person;
    for (var i = 0; i < gameConfig.selectedAdults.length; i++) {
        person = createMCGC("MonopolyFamilyMember00", 34, 130 + (i * 110), 100);
        person.gotoAndStop(gameConfig.selectedAdults[i].index);
        gameConfig.familyHolder.addChild(person);
        cleanUpArray.push(person);

        $("#mononameinput" + i).show();
    }

    for (var i = 0; i < gameConfig.selectedChildren.length; i++) {
        person = createMCGC("MonopolyFamilyMember00", 34, 100 + (i % 3 * 110), 200 + (100 * Math.floor(i / 3)));
        person.gotoAndStop(gameConfig.selectedChildren[i].index);
        gameConfig.familyHolder.addChild(person);
        cleanUpArray.push(person);

        $("#mononameinput" + (i + 2)).show();
    }
}


function monoCheckNames() {
    var namesSet = true;

    for (var i = 0; i < gameConfig.selectedAdults.length; i++) {
        if ($("#mononameinput" + i + " input").val() == "") {
            namesSet = false;
            $("#mononameinput" + i + " input").css("border", "2px solid red");
            break;
        } else {
            gameConfig.selectedAdults[i].name = $("#mononameinput" + i + " input").val();
            $("#mononameinput" + i + " input").css("border", "1px solid #a9a9a9");
        }
    }

    for (var i = 0; i < gameConfig.selectedChildren.length; i++) {
        if ($("#mononameinput" + (i + 2) + " input").val() == "") {
            namesSet = false;
            $("#mononameinput" + (i + 2) + " input").css("border", "2px solid red");
            break;
        } else {
            gameConfig.selectedChildren[i].name = $("#mononameinput" + (i + 2) + " input").val();
            $("#mononameinput" + (i + 2) + " input").css("border", "1px solid #a9a9a9");
        }
    }


    if (namesSet) {
        if (gameConfig.selectedAdults.length > 0 && gameConfig.selectedChildren.length > 0) {
            $(".mononameinput").val("");
            $(".mononameinput").hide();

            monoSelectHouse();
        } else {
            alert("Please select at least one parent and one child.");
        }
    }
}



function monoSelectHouse() {
    if (gameConfig.selectedAdults.length >= 1 && gameConfig.selectedChildren.length >= 1) {
        gameConfig.startupNextBtn.off('pointerup', monoCheckNames);
        gameConfig.startupNextBtn.on('pointerup', monoInitGame);

        gameConfig.familyHolder.removeChildren();

        stopMayorSpeak();
        mayorSpeak("speak_b_monopoly_create_house");

        gameConfig.startupLeft.gotoAndStop(1);
        //show help text
        gameConfig.startupLeftText.text = monoData.monopoly_startup_toolbar_items.content;

        gameContainer.removeChildren();

        gameConfig.startupBG = createSprite("images/monopoly/MonopolyStartup.png", 0, 0, gameLoader);
        gameContainer.addChild(gameConfig.startupBG);
        cleanUpArray.push(gameConfig.startupBG);

        gameConfig.startupHouseBG = createSprite("images/monopoly/MonopolyStartupItems.png", 135, 15, gameLoader);
        gameContainer.addChild(gameConfig.startupHouseBG);
        cleanUpArray.push(gameConfig.startupHouseBG);

        //play chime sound
        playSound("monopoly_pointSound_smiley", gameLoader);


        gameConfig.carButtons = new Array();
        gameConfig.houseButtons = new Array();
        gameConfig.petButtons = new Array();

        //cars
        var startupItem;
        var startupItemBG;
        var startupItemItem;
        var priceArray = new Array(10, 20, 2, 6, 15);
        for (var i = 0; i < 5; i++) {
            startupItem = new PIXI.Container();
            startupItem.index = i;
            startupItem.price = priceArray[i];
            startupItemBG = createMCGC("$transport000", 4, 0, 0);
            startupItemBG.gotoAndStop(0);
            startupItem.addChild(startupItemBG);
            cleanUpArray.push(startupItemBG);
            cleanUpRemoveArray.push(startupItem);

            startupItemItem = createMCGC("$transport00", 5, 10, 4);
            startupItemItem.gotoAndStop(i);
            startupItemItem.scale.set(0.5);
            startupItem.addChild(startupItemItem);
            cleanUpArray.push(startupItemItem);

            var gold = Math.floor(parseInt(priceArray[i]) / 10);
            var silver = parseInt(priceArray[i]) % 10;

            var tf = createSmallText(gold, 20, 45);
            cleanUpArray.push(tf);
            startupItem.addChild(tf)
            tf = createSmallText(silver, 44, 45)
            cleanUpArray.push(tf);
            startupItem.addChild(tf)

            startupItem.x = 237 + (70 * i);
            startupItem.y = 55;

            gameContainer.addChild(startupItem);
            gameConfig.carButtons.push(startupItem);

            startupItem.interactive = true;
            startupItem.buttonMode = true;
            startupItem.on("pointerup", selectCar);
        }


        //house
        var priceArray = new Array(30, 10, 20, 30, 10, 30, 50);
        for (var i = 0; i < 7; i++) {
            startupItem = new PIXI.Container();
            startupItem.index = i;
            startupItem.price = priceArray[i];
            startupItemBG = createMCGC("$transport000", 4, 0, 0);
            startupItemBG.gotoAndStop(0);
            startupItem.addChild(startupItemBG);
            cleanUpArray.push(startupItemBG);
            cleanUpRemoveArray.push(startupItem);

            startupItemItem = createMCGC("Bolig_samlet_login_PV2_8900", 14, 12, 4);
            startupItemItem.gotoAndStop(i * 2);
            startupItemItem.scale.set(0.85);
            startupItem.addChild(startupItemItem);
            cleanUpArray.push(startupItemItem);

            var gold = Math.floor(parseInt(priceArray[i]) / 10);
            var silver = parseInt(priceArray[i]) % 10;

            tf = createSmallText(gold, 20, 45);
            cleanUpArray.push(tf);
            startupItem.addChild(tf)

            tf = createSmallText(silver, 44, 45);
            cleanUpArray.push(tf);
            startupItem.addChild(tf);

            startupItem.y = 230;
            if (i == 0) {
                startupItem.x = 158;
            } else if (i == 1) {
                startupItem.x = 228;
            } else if (i == 2) {
                startupItem.x = 321;
            } else if (i == 3) {
                startupItem.x = 410;
            } else if (i == 4) {
                startupItem.x = 158;
                startupItem.y = 324;
            } else if (i == 5) {
                startupItem.x = 228;
                startupItem.y = 324;
            } else if (i == 6) {
                startupItem.x = 321;
                startupItem.y = 324;
            }

            gameContainer.addChild(startupItem);
            gameConfig.houseButtons.push(startupItem);

            startupItem.interactive = true;
            startupItem.buttonMode = true;
            startupItem.on("pointerup", selectMonoHouse);

        }


        //city / country
        startupItem = new PIXI.Container();
        startupItemBG = createMCGC("MonopolyStartupItemCountryButton00", 4, 0, 0);
        startupItemBG.gotoAndStop(0);
        startupItem.addChild(startupItemBG);
        cleanUpArray.push(startupItemBG);
        cleanUpRemoveArray.push(startupItem);

        startupItem.x = 227;
        startupItem.y = 393;

        gameContainer.addChild(startupItem);
        gameConfig.monoCountrySelect = startupItem;

        startupItem.interactive = true;
        startupItem.buttonMode = true;
        startupItem.on("pointerup", selectCountry);

        startupItem = new PIXI.Container();
        startupItemBG = createMCGC("MonopolyStartupItemCityButton00", 4, 0, 0);
        startupItemBG.gotoAndStop(0);
        startupItem.addChild(startupItemBG);
        cleanUpArray.push(startupItemBG);
        cleanUpRemoveArray.push(startupItem);

        startupItem.x = 365;
        startupItem.y = 393;

        gameContainer.addChild(startupItem);
        gameConfig.monoCitySelect = startupItem;

        startupItem.interactive = true;
        startupItem.buttonMode = true;
        startupItem.on("pointerup", selectCity);

        //Pets
        var priceArray = new Array(5, 1, 2, 3, 4, 3);
        for (var i = 0; i < 6; i++) {
            startupItem = new PIXI.Container();
            startupItem.index = i;
            startupItem.price = priceArray[i];
            startupItemBG = createMCGC("$transport000", 4, 0, 0);
            startupItemBG.gotoAndStop(0);
            startupItem.addChild(startupItemBG);
            cleanUpArray.push(startupItemBG);
            cleanUpRemoveArray.push(startupItem);

            startupItemItem = createMCGC("$pet00", 6, 12, 3);
            startupItemItem.gotoAndStop(i);
            startupItemItem.scale.set(0.4);
            startupItem.addChild(startupItemItem);
            cleanUpArray.push(startupItemItem);

            var gold = Math.floor(parseInt(priceArray[i]) / 10);
            var silver = parseInt(priceArray[i]) % 10;

            tf = createSmallText(gold, 20, 45);
            cleanUpArray.push(tf);
            startupItem.addChild(tf);
            tf = createSmallText(silver, 44, 45);
            cleanUpArray.push(tf);
            startupItem.addChild(tf);

            startupItem.x = 334 + (70 * (i % 3));
            startupItem.y = 481 + (66 * Math.floor(i / 3));

            gameContainer.addChild(startupItem);
            gameConfig.petButtons.push(startupItem);

            startupItem.interactive = true;
            startupItem.buttonMode = true;
            startupItem.on("pointerup", selectPet);
        }

        gameConfig.userCar = -1;
        gameConfig.userHouse = -1;
        gameConfig.userPet = -1;

        gameConfig.expenceHolder = new PIXI.Container();
        gameConfig.expenceHolder.x = 575;
        gameConfig.expenceHolder.y = 100;
        gameContainer.addChild(gameConfig.expenceHolder);

        if (universeBtn) {
            gameContainer.addChild(universeBtn);
        } else {
            universeBtn = createMC("UniverseButton00", 2, 780, 10);
            universeBtn.gotoAndStop(0);
            gameContainer.addChild(universeBtn);
            makeButton(universeBtn, backToUniverse);
        }
    }
}



function selectCar() {
    for (var i = 0; i < gameConfig.carButtons.length; i++) {
        gameConfig.carButtons[i].children[0].gotoAndStop(0);
    }
    this.children[0].gotoAndStop(3);
    gameConfig.userCar = this.index;
    gameConfig.userCarPrice = this.price;

    if (this.index == 0) {
        playSound("monopoly_select_smallCar");
    } else if (this.index == 1) {
        playSound("monopoly_select_bigCar");
    } else if (this.index == 2) {
        playSound("monopoly_select_cykel");
    } else if (this.index == 3) {
        playSound("monopoly_select_motorCykel");
    } else {
        playSound("monopoly_select_van")
    }

    redrawExpences();
}

function selectMonoHouse() {
    var houseIndex;
    for (var i = 0; i < gameConfig.houseButtons.length; i++) {
        gameConfig.houseButtons[i].children[0].gotoAndStop(0);
        houseIndex = gameConfig.houseButtons[i].index;
        gameConfig.houseButtons[i].children[1].gotoAndStop(houseIndex * 2);
    }
    this.children[0].gotoAndStop(3);
    this.children[1].gotoAndStop((this.index * 2) + 1);
    gameConfig.userHouse = this.index;
    gameConfig.userHousePrice = this.price;

    redrawExpences();
}

function selectCountry() {
    gameConfig.monoCitySelect.children[0].gotoAndStop(0);
    gameConfig.monoCountrySelect.children[0].gotoAndStop(2);
    gameConfig.userLocation = "country";
}

function selectCity() {
    gameConfig.monoCitySelect.children[0].gotoAndStop(2);
    gameConfig.monoCountrySelect.children[0].gotoAndStop(0);
    gameConfig.userLocation = "city";
}

function selectPet() {
    for (var i = 0; i < gameConfig.petButtons.length; i++) {
        gameConfig.petButtons[i].children[0].gotoAndStop(0);
    }
    this.children[0].gotoAndStop(3);
    gameConfig.userPet = this.index;
    gameConfig.userPetPrice = this.price;

    if (this.index == 0) {
        playSound("monopoly_select_dog");
    } else if (this.index == 1) {
        playSound("monopoly_select_fisk");
    } else if (this.index == 2) {
        playSound("monopoly_select_fugl");
    } else if (this.index == 3) {
        playSound("monopoly_select_spider");
    } else if (this.index == 4) {
        playSound("monopoly_select_cat");
    } else {
        playSound("monopoly_select_hamster")
    }

    redrawExpences();
}


function redrawExpences() {
    gameConfig.expenceHolder.removeChildren();

    var total = 80;

    //pay
    var label = new PIXI.Text(monoData.monopoly_startup_items_label_income.content, {
        fontFamily: "Arial",
        fontSize: 16,
        fill: "black",
        fontWeight: "bold"
    });
    label.x = 130;
    label.y = 87;
    gameConfig.expenceHolder.addChild(label);
    cleanUpArray.push(label);

    var priceIcon = createPriceIcon(80, 210, 87);
    gameConfig.expenceHolder.addChild(priceIcon);
    cleanUpArray.push(priceIcon);

    //transport
    if (gameConfig.userCar != -1) {
        var transportItem = createMCGC("$transport00", 5, 65, 130);
        transportItem.gotoAndStop(gameConfig.userCar);
        gameConfig.expenceHolder.addChild(transportItem);
        cleanUpArray.push(transportItem);

        priceIcon = createPriceIcon(gameConfig.userCarPrice, 210, 159);
        gameConfig.expenceHolder.addChild(priceIcon);
        cleanUpArray.push(priceIcon);

        total -= gameConfig.userCarPrice;
    }

    //house
    if (gameConfig.userHouse != -1) {
        var houseItem = createMCGC("Bolig_samlet_login_PV2_8900", 14, 103, 220);
        houseItem.gotoAndStop((gameConfig.userHouse * 2) + 1);
        gameConfig.expenceHolder.addChild(houseItem);
        cleanUpArray.push(houseItem);

        priceIcon = createPriceIcon(gameConfig.userHousePrice, 210, 233);
        gameConfig.expenceHolder.addChild(priceIcon);
        cleanUpArray.push(priceIcon);

        total -= gameConfig.userHousePrice;
    }

    //pet
    if (gameConfig.userPet != -1) {
        var petItem = createMCGC("$pet00", 6, 74, 270);
        petItem.gotoAndStop(gameConfig.userPet);
        gameConfig.expenceHolder.addChild(petItem);
        cleanUpArray.push(petItem);

        priceIcon = createPriceIcon(gameConfig.userPetPrice, 210, 307);
        gameConfig.expenceHolder.addChild(priceIcon);
        cleanUpArray.push(priceIcon);

        total -= gameConfig.userPetPrice;
    }

    //total
    var label = new PIXI.Text(monoData.monopoly_startup_items_label_revenue.content, {
        fontFamily: "Arial",
        fontSize: 16,
        fill: "black",
        fontWeight: "bold"
    });
    label.x = 93;
    label.y = 382;
    gameConfig.expenceHolder.addChild(label);
    cleanUpArray.push(label);

    var priceIcon = createPriceIcon(total, 210, 382);
    cleanUpArray.push(priceIcon);
    gameConfig.expenceHolder.addChild(priceIcon);
}

function createPriceIcon(price, xPos, yPos) {
    var icon = new PIXI.Container();
    icon.x = xPos;
    icon.y = yPos;
    icon.addChild(createSprite("images/monopoly/MonopolyStartupExpencesIcon.png", 15, 0, gameLoader));

    var gold = Math.floor(parseInt(price) / 10);
    var silver = parseInt(price) % 10;

    var goldTF = new PIXI.Text(gold, {
        fontFamily: "Arial",
        fontSize: 16,
        fill: "black",
        fontWeight: "bold"
    });
    goldTF.x = 0;
    goldTF.y = 1;
    icon.addChild(goldTF);

    var silverTF = new PIXI.Text(silver, {
        fontFamily: "Arial",
        fontSize: 16,
        fill: "black",
        fontWeight: "bold"
    });
    silverTF.x = 45;
    silverTF.y = 1;
    icon.addChild(silverTF);

    return icon;
}


//monopoly game
function monoInitGame() {
    if (gameConfig.userCar != -1 && (gameConfig.userHouse != -1 && gameConfig.userPet != -1)) {
        stopMayorSpeak();

        gameContainer.removeChildren();
        gameConfig.startupNextBtn.parent.removeChild(gameConfig.startupNextBtn);
        //cleanup();

        gameConfig.currentMonth = 1;
        gameConfig.money = 80 - parseInt(gameConfig.userHousePrice) - parseInt(gameConfig.userPetPrice) - parseInt(gameConfig.userCarPrice);
        gameConfig.points = 0;
        gameConfig.saved = 0;
        gameConfig.holidayNotHeld = true;

        //frontground
        gameConfig.startupFrontgroundBG.clear();
        gameConfig.startupFrontgroundBG.beginFill(0x002e5d);
        gameConfig.startupFrontgroundBG.drawRect(-200, 0, 340, 600);

        frontGround.removeChild(gameConfig.startupLeft);
        frontGround.removeChild(gameConfig.startupLeftText);

        gameConfig.monoGameFrontgroundBG = createSprite("images/monopoly/monoToolbar.png", 0, 140, gameLoader);
        frontGround.addChild(gameConfig.monoGameFrontgroundBG);
        cleanUpArray.push(gameConfig.monoGameFrontgroundBG);

        frontGround.setChildIndex(frontGround.avatarBG, frontGround.children.length - 1);
        frontGround.setChildIndex(avatar, frontGround.children.length - 1);

        gameConfig.monoBG = new PIXI.Container();
        gameContainer.addChild(gameConfig.monoBG);


        if ((isMobile || isIPad) && gameContainer.x > 75) {
            frontGround.avatarBG.y = 470;
            avatar.y = 530;
        }

        //bottombar

        //month
        gameConfig.month = createMCGC("MonopolyCalender00", 15, -100, -33);
        gameConfig.month.gotoAndStop(0);
        gameContainer.addChild(gameConfig.month);
        cleanUpArray.push(gameConfig.month);

        monoUpdateSidebar();
        setupMonoBG();

        startMonoMonth();


        var exitMonoBtn = createMC("UniverseButton00", 2, 780, 10);
        exitMonoBtn.gotoAndStop(0);
        gameContainer.addChild(exitMonoBtn);
        exitMonoBtn.interactive = true;
        exitMonoBtn.buttonMode = true;
        exitMonoBtn.on("pointerup", exitMono);
        cleanUpRemoveArray.push(exitMonoBtn);
    }
}



function monoInitGameFromSave() {
    stopMayorSpeak();

    gameContainer.removeChildren();

    //frontground
    gameConfig.startupFrontgroundBG = new PIXI.Graphics();
    gameConfig.startupFrontgroundBG.beginFill(0x002e5d);
    gameConfig.startupFrontgroundBG.drawRect(-200, 0, 340, 600);
    gameConfig.startupFrontgroundBG.x = 0;
    gameConfig.startupFrontgroundBG.y = 0;
    frontGround.addChild(gameConfig.startupFrontgroundBG);
    cleanUpArray.push(gameConfig.startupFrontgroundBG);

    gameConfig.monoGameFrontgroundBG = createSprite("images/monopoly/monoToolbar.png", 0, 140, gameLoader);
    frontGround.addChild(gameConfig.monoGameFrontgroundBG);
    cleanUpArray.push(gameConfig.monoGameFrontgroundBG);

    frontGround.setChildIndex(frontGround.avatarBG, frontGround.children.length - 1);
    frontGround.setChildIndex(avatar, frontGround.children.length - 1);
    frontGround.setChildIndex(frontGround.logo, frontGround.children.length - 1);

    gameConfig.monoBG = new PIXI.Container();
    gameContainer.addChild(gameConfig.monoBG);


    if ((isMobile || isIPad) && gameContainer.x > 75) {
        frontGround.avatarBG.y = 470;
        avatar.y = 530;
    }

    //month
    gameConfig.month = createMCGC("MonopolyCalender00", 15, -100, -33);
    gameConfig.month.gotoAndStop(0);
    gameContainer.addChild(gameConfig.month);
    cleanUpArray.push(gameConfig.month);

    monoUpdateSidebar();
    setupMonoBG();

    startMonoMonth();


    var exitMonoBtn = createMC("UniverseButton00", 2, 780, 10);
    exitMonoBtn.gotoAndStop(0);
    gameContainer.addChild(exitMonoBtn);
    exitMonoBtn.interactive = true;
    exitMonoBtn.buttonMode = true;
    exitMonoBtn.on("pointerup", exitMono);
    cleanUpRemoveArray.push(exitMonoBtn);
}


function exitMono() {
    var exitBase = new PIXI.Graphics();
    exitBase.beginFill(0x000000);
    exitBase.hitArea = new PIXI.Rectangle(0, 0, 1100, 800);
    exitBase.interactive = true;
    exitBase.alpha = 0.3;
    exitBase.drawRect(0, 0, 1100, 800);
    gameContainer.addChild(exitBase);
    cleanUpArray.push(exitBase);

    var exitBG = createSprite("images/monopoly/MonopolySaveGamePopup.png", 370, 200, gameLoader);
    gameContainer.addChild(exitBG);
    cleanUpArray.push(exitBG);
    debug = exitBG;

    var exitLabel = new PIXI.Text(monoData.monopoly_save_game.content, {
        fontFamily: "Arial",
        fontSize: 16,
        fill: "white",
        fontWeight: "bold"
    });
    exitLabel.x = 430;
    exitLabel.y = 250;
    gameContainer.addChild(exitLabel);
    cleanUpArray.push(exitLabel);

    var saveBtn = createSprite("images/monopoly/MonopolySaveGameButton.png", 410, 300, gameLoader);
    saveBtn.interactive = true;
    saveBtn.buttonMode = true;
    saveBtn.on("pointerup", doSaveMono);
    gameContainer.addChild(saveBtn);
    cleanUpArray.push(saveBtn);

    var cancelBtn = createSprite("images/monopoly/MonopolyCancelGameButton.png", 530, 300, gameLoader);
    cancelBtn.interactive = true;
    cancelBtn.buttonMode = true;
    cancelBtn.on("pointerup", doExitMono);
    gameContainer.addChild(cancelBtn);
    cleanUpArray.push(cancelBtn);
}

function doExitMono() {
    if (user.mono) {
        delete user.mono;
    }

    updateUserCookie();

    backToUniverse();
}

function doSaveMono() {
    user.mono = {};
    user.mono.holidayNotHeld = gameConfig.holidayNotHeld;
    user.mono.money = gameConfig.money;
    user.mono.currentMonth = gameConfig.currentMonth;
    user.mono.points = gameConfig.points;
    user.mono.saved = gameConfig.saved;
    var adultsArray = new Array();
    for (var i = 0; i < gameConfig.selectedAdults.length; i++) {
        adultsArray.push(gameConfig.selectedAdults[i].name);
    }
    user.mono.selectedAdults = adultsArray.join();
    var childrenArray = new Array();
    for (var i = 0; i < gameConfig.selectedChildren.length; i++) {
        childrenArray.push(gameConfig.selectedChildren[i].name);
    }
    user.mono.selectedChildren = childrenArray.join();
    user.mono.userCar = gameConfig.userCar;
    user.mono.userCarPrice = gameConfig.userCarPrice;
    user.mono.userHouse = gameConfig.userHouse;
    user.mono.userHousePrice = gameConfig.userHousePrice;
    user.mono.userPet = gameConfig.userPet;
    user.mono.userPetPrice = gameConfig.userPetPrice;

    updateUserCookie();

    backToUniverse();
}




function setupMonoBG() {
    gameConfig.monoBG.removeChildren();

    if (gameConfig.userLocation == "country") {
        if (gameConfig.currentMonth <= 2 || gameConfig.currentMonth == 12) {
            var gameBG = PIXI.Sprite.from('images/monopoly/monoGameCountryWinter.png');
        } else if (gameConfig.currentMonth >= 3 && gameConfig.currentMonth <= 5) {
            gameBG = PIXI.Sprite.from('images/monopoly/monoGameCountrySpring.png');
        } else if (gameConfig.currentMonth >= 6 && gameConfig.currentMonth <= 8) {
            gameBG = PIXI.Sprite.from('images/monopoly/monoGameCountrySummer.png');
        } else {
            gameBG = PIXI.Sprite.from('images/monopoly/monoGameCountryFall.png');
        }
    } else {
        if (gameConfig.currentMonth <= 2 || gameConfig.currentMonth == 12) {
            gameBG = PIXI.Sprite.from('images/monopoly/monoGameCityWinter.png');
        } else if (gameConfig.currentMonth >= 3 && gameConfig.currentMonth <= 5) {
            gameBG = PIXI.Sprite.from('images/monopoly/monoGameCitySpring.png');
        } else if (gameConfig.currentMonth >= 6 && gameConfig.currentMonth <= 8) {
            gameBG = PIXI.Sprite.from('images/monopoly/monoGameCitySummer.png');
        } else {
            gameBG = PIXI.Sprite.from('images/monopoly/monoGameCityFall.png');
        }
    }

    gameBG.x = -20;
    gameBG.y = -30;

    gameConfig.monoBG.addChild(gameBG);
    cleanUpArray.push(gameBG);

    var houseNumber = 1 + (gameConfig.userHouse * 4);

    if (gameConfig.currentMonth <= 2 || gameConfig.currentMonth == 12) {

    } else if (gameConfig.currentMonth >= 3 && gameConfig.currentMonth <= 5) {
        houseNumber += 1;
    } else if (gameConfig.currentMonth >= 6 && gameConfig.currentMonth <= 8) {
        houseNumber += 2;
    } else {
        houseNumber += 3;
    }

    if (houseNumber < 10) {
        houseNumber = "0" + houseNumber;
    }

    var gameHouse = PIXI.Sprite.from('images/monopoly/monoGameHouse00' + houseNumber + '.png');
    gameHouse.x = 220;
    gameHouse.y = 130;
    gameConfig.monoBG.addChild(gameHouse);
    cleanUpArray.push(gameHouse);

    gameConfig.month.gotoAndStop(gameConfig.currentMonth);
    if (gameConfig.currentMonth > 6) {
        gameConfig.month.gotoAndStop(gameConfig.currentMonth + 1);
    }

    gameConfig.eventContainer = new PIXI.Container();

}

function startMonoMonth() {
    playSound("monopoly_startMonth_sound");

    gameConfig.petCare = false;
    gameConfig.transportCare = false;

    gameConfig.monthTimeOut = setTimeout(showEventStar, 2000 + Math.floor(Math.random() * 2000));

    if (gameConfig.careBar) {
        gameConfig.careBar.visible = true;

        if (gameConfig.userPet == 0) { //hund
            gameConfig.careBarPet.onFrameChange = function() {
                if (this.currentFrame == 252) {
                    this.gotoAndPlay(0);
                }
            }
        } else if (gameConfig.userPet == 1) { //fish
            gameConfig.careBarPet.onFrameChange = function() {
                if (this.currentFrame == 160) {
                    this.gotoAndPlay(0);
                }
            }
        } else if (gameConfig.userPet == 2) { //bird
            gameConfig.careBarPet.onFrameChange = function() {
                if (this.currentFrame == 150) {
                    this.gotoAndPlay(0);
                }
            }
        } else if (gameConfig.userPet == 3) { //spider
            gameConfig.careBarPet.onFrameChange = function() {
                if (this.currentFrame == 240) {
                    this.gotoAndPlay(0);
                }
            }
        } else if (gameConfig.userPet == 4) { //cat
            gameConfig.careBarPet.onFrameChange = function() {
                if (this.currentFrame == 245) {
                    this.gotoAndPlay(0);
                }
            }
        } else if (gameConfig.userPet == 5) { //hamster
            gameConfig.careBarPet.onFrameChange = function() {
                if (this.currentFrame == 150) {
                    this.gotoAndPlay(0);
                }
            }
        }

        gameConfig.careBarPet.gotoAndPlay(0);


    } else {
        showCareBar();
    }
}

function showCareBar() {
    gameConfig.careBar = new PIXI.Container();
    gameConfig.careBar.x = 50;
    gameConfig.careBar.y = 520;
    frontGround.addChild(gameConfig.careBar);

    frontGround.setChildIndex(frontGround.avatarBG, frontGround.children.length - 1);
    frontGround.setChildIndex(avatar, frontGround.children.length - 1);
    frontGround.setChildIndex(frontGround.muteBtn, frontGround.children.length - 1);

    var careBarBG = createSprite("images/monopoly/monoBottomToolbar.png", 0, 0, gameLoader);
    gameConfig.careBar.addChild(careBarBG);
    cleanUpArray.push(careBarBG);

    if (gameConfig.userPet == 0) { //hund
        gameConfig.careBarPet = createMCGC("dog0", 491, 542, 35);
        gameConfig.careBarPet.onFrameChange = function() {
            if (this.currentFrame == 252) {
                this.gotoAndPlay(0);
            }
        }
    } else if (gameConfig.userPet == 1) { //fish
        gameConfig.careBarPet = createMCGC("fish0", 389, 542, 35);
        gameConfig.careBarPet.onFrameChange = function() {
            if (this.currentFrame == 160) {
                this.gotoAndPlay(0);
            }
        }
    } else if (gameConfig.userPet == 2) { //bird
        gameConfig.careBarPet = createMCGC("bird0", 360, 542, 35);
        gameConfig.careBarPet.onFrameChange = function() {
            if (this.currentFrame == 150) {
                this.gotoAndPlay(0);
            }
        }
    } else if (gameConfig.userPet == 3) { //spider
        gameConfig.careBarPet = createMCGC("spider0", 514, 542, 35);
        gameConfig.careBarPet.onFrameChange = function() {
            if (this.currentFrame == 240) {
                this.gotoAndPlay(0);
            }
        }
    } else if (gameConfig.userPet == 4) { //cat
        gameConfig.careBarPet = createMCGC("cat0", 516, 542, 35);
        gameConfig.careBarPet.onFrameChange = function() {
            if (this.currentFrame == 245) {
                this.gotoAndPlay(0);
            }
        }
    } else if (gameConfig.userPet == 5) { //hamster
        gameConfig.careBarPet = createMCGC("hamster0", 360, 542, 35);
        gameConfig.careBarPet.onFrameChange = function() {
            if (this.currentFrame == 150) {
                this.gotoAndPlay(0);
            }
        }
    }
    gameConfig.careBar.addChild(gameConfig.careBarPet);
    cleanUpArray.push(gameConfig.careBarPet);

    //show pet - loop anim

    //after return from event show bad anim if petcare = false

    //show transport
    gameConfig.careBarCar = createMCGC("careBarCar00", 5, 820, 15);
    gameConfig.careBarCar.gotoAndStop(gameConfig.userCar);
    gameConfig.careBar.addChild(gameConfig.careBarCar);
    cleanUpArray.push(gameConfig.careBarCar);


    //setup pet food btn - show pet happy on click
    gameConfig.careBarFoodBtn = createMCGC("$bomb00", 6, 450, 130);
    gameConfig.careBarFoodBtn.gotoAndStop(gameConfig.userCar);
    gameConfig.careBar.addChild(gameConfig.careBarFoodBtn);
    gameConfig.careBarFoodBtn.interactive = true;
    gameConfig.careBarFoodBtn.buttonMode = true;
    gameConfig.careBarFoodBtn.on("pointerup", givePetFood);
    cleanUpArray.push(gameConfig.careBarFoodBtn);

    //setup transport oil - show oil on click
    gameConfig.careBarOilAnim = createMCGC("$wash00", 70, 840, 30);
    gameConfig.careBarOilAnim.gotoAndStop(0);
    gameConfig.careBarOilAnim.visible = false;
    gameConfig.careBarOilAnim.onFrameChange = function() {
        if (this.currentFrame == 0) {
            this.gotoAndStop(0);
            gameConfig.careBarOilAnim.visible = false;
        }
    }
    gameConfig.careBar.addChild(gameConfig.careBarOilAnim);
    cleanUpArray.push(gameConfig.careBarOilAnim);

    gameConfig.careBarOilBtn = new PIXI.Graphics();
    gameConfig.careBarOilBtn.beginFill(0x000000);
    gameConfig.careBarOilBtn.drawRect(0, 0, 50, 50);
    gameConfig.careBarOilBtn.hitArea = new PIXI.Rectangle(0, 0, 50, 50);
    gameConfig.careBarOilBtn.interactive = true;
    gameConfig.careBarOilBtn.buttonMode = true;
    gameConfig.careBarOilBtn.alpha = 0;
    gameConfig.careBarOilBtn.x = 760;
    gameConfig.careBarOilBtn.y = 50;
    gameConfig.careBarOilBtn.on("pointerup", giveCarOil)
    gameConfig.careBar.addChild(gameConfig.careBarOilBtn);
    cleanUpArray.push(gameConfig.careBarOilBtn);


}

function givePetFood() {
    if (gameConfig.petCare) {

    } else {
        gameConfig.points++;
        monoUpdateSidebar();

        if (gameConfig.userPet == 0) {
            gameConfig.careBarPet.gotoAndPlay(368);
            gameConfig.careBarPet.onFrameChange = function() {
                if (this.currentFrame == 490) {
                    this.gotoAndStop(490);
                }
            }
        } else if (gameConfig.userPet == 1) {
            gameConfig.careBarPet.gotoAndPlay(240);
            gameConfig.careBarPet.onFrameChange = function() {
                if (this.currentFrame == 388) {
                    this.gotoAndStop(388);
                }
            }
        } else if (gameConfig.userPet == 2) {
            gameConfig.careBarPet.gotoAndPlay(226);
            gameConfig.careBarPet.onFrameChange = function() {
                if (this.currentFrame == 359) {
                    this.gotoAndStop(359);
                }
            }
        } else if (gameConfig.userPet == 3) {
            gameConfig.careBarPet.gotoAndPlay(362);
            gameConfig.careBarPet.onFrameChange = function() {
                if (this.currentFrame == 513) {
                    this.gotoAndStop(513);
                }
            }
        } else if (gameConfig.userPet == 4) {
            gameConfig.careBarPet.gotoAndPlay(372);
            gameConfig.careBarPet.onFrameChange = function() {
                if (this.currentFrame == 514) {
                    this.gotoAndStop(514);
                }
            }
        } else if (gameConfig.userPet == 5) {
            gameConfig.careBarPet.gotoAndPlay(226);
            gameConfig.careBarPet.onFrameChange = function() {
                if (this.currentFrame == 358) {
                    this.gotoAndStop(358);
                }
            }
        }

        gameConfig.petCare = true;
    }
}

function giveCarOil() {
    if (gameConfig.transportCare) {

    } else {
        gameConfig.points++;
        monoUpdateSidebar();

        gameConfig.careBarOilAnim.gotoAndPlay(1);
        gameConfig.transportCare = true;
        gameConfig.careBarOilAnim.visible = true;
    }
}

function showEventStar() {
    playSound("monopoly_occurence_button_show");

    if (gameConfig.alertBtn) {
        gameConfig.alertBtn.x = 200 + (Math.random() * 600);
        gameConfig.alertBtn.y = 200 + (Math.random() * 200);
        gameContainer.addChild(gameConfig.alertBtn);
    } else {
        gameConfig.alertBtn = createMCGC("MonopolyGameAlertSymbol00", 10, 0, 0);
        gameConfig.alertBtn.x = 200 + (Math.random() * 600);
        gameConfig.alertBtn.y = 200 + (Math.random() * 200);
        gameConfig.alertBtn.on('pointerup', monoSelectAlert);
        gameConfig.alertBtn.interactive = true;
        gameConfig.alertBtn.buttonMode = true;
        gameContainer.addChild(gameConfig.alertBtn);
        cleanUpArray.push(gameConfig.alertBtn);
    }
}

var monoEventTextStyle = new PIXI.TextStyle({
    fontFamily: "Arial",
    fontSize: 13,
    fill: "black",
    fontWeight: "bold",
    wordWrap: true,
    wordWrapWidth: 350
});

var monoBtnTextStyle = new PIXI.TextStyle({
    fontFamily: "Arial",
    fontSize: 13,
    fill: "black",
    fontWeight: "normal",
    wordWrap: true,
    wordWrapWidth: 300
});

function monoSelectAlert() {
    gameConfig.selectedNameEvent = ""; //clear name for event
    var potentialEventsArray = new Array();
    for (var i = 0; i < monopolyData.length; i++) {
        if (monopolyData[i].month == getMonthString()) {
            potentialEventsArray.push(i);
            potentialEventsArray.push(i);
        } else if (monopolyData[i].month == "random") {
            if (Math.random() < 0.5) {
                potentialEventsArray.push(i);
            }
        }
    }

    gameConfig.eventContainer.removeChildren();
    gameContainer.addChild(gameConfig.eventContainer);

    var eventIndex = Math.floor(Math.random() * potentialEventsArray.length);
    gameConfig.eventData = monopolyData[potentialEventsArray[eventIndex]];

    gameConfig.removeEventIndex = potentialEventsArray[eventIndex];

    if (gameConfig.eventData.consequence1title == "") {
        gameConfig.eventType = "fact";

        var eventBG = createSprite("images/monopoly/monoEventFactBG.png", 300, 150, gameLoader);
        gameConfig.eventContainer.addChild(eventBG);
        cleanUpArray.push(eventBG);

        var plusminus = createMCGC("plusminus00", 3, 570, 340);
        if (parseInt(gameConfig.eventData.facteventmoney) < 0) {
            plusminus.gotoAndStop(1);
        } else {
            plusminus.gotoAndStop(0);
        }
        gameConfig.eventContainer.addChild(plusminus);
        cleanUpArray.push(plusminus);


        gameConfig.eventText = new PIXI.Text(getEventText("eventtext"), monoEventTextStyle);
        gameConfig.eventText.x = 430;
        gameConfig.eventText.y = 400;
        gameConfig.eventContainer.addChild(gameConfig.eventText);
        cleanUpArray.push(gameConfig.eventText);

        //udfør konsekvens
        gameConfig.money += parseInt(gameConfig.eventData.facteventmoney);
        gameConfig.currentEventPrice = parseInt(gameConfig.eventData.facteventmoney);
        monoUpdateSidebar();

        gameConfig.currentEventShortTitle = gameConfig.eventData.shortname;

        var nextBtn = createNextBtn();
        nextBtn.x = 620;
        nextBtn.y = 450;
        nextBtn.on('pointerup', closeFactEvent);
        gameConfig.eventContainer.addChild(nextBtn);
        cleanUpRemoveArray.push(nextBtn);

    } else {
        gameConfig.eventType = "event";

        eventBG = createSprite("images/monopoly/monoEventBG.png", 180, 130, gameLoader);
        gameConfig.eventContainer.addChild(eventBG);
        cleanUpArray.push(eventBG);


        gameConfig.eventText = new PIXI.Text(getEventText("eventtext"), monoEventTextStyle);
        gameConfig.eventText.x = 350;
        gameConfig.eventText.y = 200;
        gameConfig.eventContainer.addChild(gameConfig.eventText);
        cleanUpArray.push(gameConfig.eventText);

        gameConfig.currentEventShortTitle = gameConfig.eventData.shortname;

        //vis tre knapper m konsekvens
        gameConfig.answerBtn0 = createMonoAnswerBtn(0);
        //gameConfig.answerBtn0.name=0;
        gameConfig.answerBtn0.x = 350;
        gameConfig.answerBtn0.y = 270;
        gameConfig.eventContainer.addChild(gameConfig.answerBtn0);
        cleanUpArray.push(gameConfig.answerBtn0);

        gameConfig.answerBtn1 = createMonoAnswerBtn(1);
        //gameConfig.answerBtn0.name=1;
        gameConfig.answerBtn1.x = 350;
        gameConfig.answerBtn1.y = 330;
        gameConfig.eventContainer.addChild(gameConfig.answerBtn1);
        cleanUpArray.push(gameConfig.answerBtn1);

        gameConfig.answerBtn2 = createMonoAnswerBtn(2);
        //gameConfig.answerBtn0.name=2;
        gameConfig.answerBtn2.x = 350;
        gameConfig.answerBtn2.y = 390;
        gameConfig.eventContainer.addChild(gameConfig.answerBtn2);
        cleanUpArray.push(gameConfig.answerBtn2);
    }

    //alert remove
    gameContainer.removeChild(gameConfig.alertBtn);

}

function closeFactEvent() {
    gameConfig.eventContainer.removeChildren();
    endMonth();
}

function monoAnswerClick() {
    //console.log(this.name);

    //udfør konsekvens
    if (gameConfig.eventData["consequence" + (parseInt(this.name) + 1) + "money"] == "") {
        var price = 0;
    } else {
        var price = parseInt(gameConfig.eventData["consequence" + (parseInt(this.name) + 1) + "money"]);
    }
    gameConfig.currentEventPrice = price;

    gameConfig.eventText.text = getEventText("consequence" + (parseInt(this.name) + 1) + "text");

    gameConfig.eventContainer.removeChild(gameConfig.answerBtn0)
    gameConfig.eventContainer.removeChild(gameConfig.answerBtn1)
    gameConfig.eventContainer.removeChild(gameConfig.answerBtn2)

    //udregn point og vis smiley eller sur smiley - samt tilføj point i sidebar

    var resultBG = createMCGC("MonopolyGameOccurenceResult00", 2, 350, 380);
    if ((gameConfig.money + price) < 0) {
        resultBG.gotoAndStop(1);
        gameConfig.points--;
        if (gameConfig.points <= 0) {
            gameConfig.points = 0;
        }
        mayorSpeak("speak_b_monopoly_event_noMoney");
        var label = new PIXI.Text(monoData.monopoly_occ_status_eco_neg_balance.content, {
            fontFamily: "Arial",
            fontSize: 12,
            fill: "black",
            fontWeight: "normal",
            wordWrap: true,
            wordWrapWidth: 150
        });
    } else {
        resultBG.gotoAndStop(0);
        gameConfig.points++;
        mayorSpeak("speak_b_monopoly_event_gotMoney0");
        playSound("monopoly_pointSound_smiley");
        label = new PIXI.Text(monoData.monopoly_occ_status_eco_pos_balance.content, {
            fontFamily: "Arial",
            fontSize: 12,
            fill: "black",
            fontWeight: "normal",
            wordWrap: true,
            wordWrapWidth: 150
        });


    }
    gameConfig.eventContainer.addChild(resultBG);
    cleanUpArray.push(resultBG);
    label.x = 366;
    label.y = 442;
    gameConfig.eventContainer.addChild(label);
    cleanUpArray.push(label);

    gameConfig.money += price;
    monoUpdateSidebar();

    var resultTitle = new PIXI.Text(monoData.monopoly_occ_status_label.content, monoEventTextStyle);
    resultTitle.x = 350;
    resultTitle.y = 340;
    gameConfig.eventContainer.addChild(resultTitle);
    cleanUpArray.push(resultTitle);

    price = price * -1;
    var gold = Math.floor(parseInt(price) / 10);
    var silver = parseInt(price) % 10;

    var resultPriceGold = new PIXI.Text(gold, monoEventTextStyle);
    resultPriceGold.x = 380;
    resultPriceGold.y = 382;
    gameConfig.eventContainer.addChild(resultPriceGold);
    cleanUpArray.push(resultPriceGold);

    var resultPriceSilver = new PIXI.Text(silver, monoEventTextStyle);
    resultPriceSilver.x = 423;
    resultPriceSilver.y = 382;
    gameConfig.eventContainer.addChild(resultPriceSilver);
    cleanUpArray.push(resultPriceSilver);

    var nextBtn = createNextBtn();
    nextBtn.x = 550;
    nextBtn.y = 450;
    nextBtn.on('pointerup', endMonth);
    gameConfig.eventContainer.addChild(nextBtn);
    cleanUpRemoveArray.push(nextBtn);
}

function endMonth() {
    gameConfig.careBar.visible = false;
    gameConfig.eventContainer.removeChildren();
    //gameContainer.removeChild(gameConfig.eventContainer);

    stopMayorSpeak();
    mayorSpeak("speak_b_monopoly_budgetView");

    bottomBar.y = 650;

    var endMonthBG = createSprite("images/monopoly/monoBankBG.png", 300, 150, gameLoader);
    gameConfig.eventContainer.addChild(endMonthBG);
    cleanUpArray.push(endMonthBG);

    //insert regnskab
    //titel
    var title = new PIXI.Text(monoData.monopoly_bank_header1.content, {
        fontFamily: "Arial",
        fontSize: 16,
        fill: "black",
        fontWeight: "normal"
    });
    title.x = 443;
    title.y = 182;
    gameConfig.eventContainer.addChild(title);
    cleanUpArray.push(title);

    //overførsel
    var totalAmount = gameConfig.money;
    var yPos = 200;
    var xPos = 440;

    if (gameConfig.currentEventPrice < 0) {
        gameConfig.eventContainer.addChild(createMonoRow("Overførsel", 0, (totalAmount + (-1 * gameConfig.currentEventPrice)), xPos, yPos));
    } else {
        gameConfig.eventContainer.addChild(createMonoRow("Overførsel", 0, (totalAmount - gameConfig.currentEventPrice), xPos, yPos));
    }
    yPos += 25;

    //event shortcode
    var eventAmount = parseInt(gameConfig.currentEventPrice);
    if (eventAmount >= 0) {
        gameConfig.eventContainer.addChild(createMonoRow(gameConfig.currentEventShortTitle, 0, eventAmount, xPos, yPos));
        //totalAmount=totalAmount+eventAmount; //has already been applied
    } else {
        eventAmount = eventAmount * -1;
        gameConfig.eventContainer.addChild(createMonoRow(gameConfig.currentEventShortTitle, 1, eventAmount, xPos, yPos));
        //totalAmount=totalAmount-eventAmount; //has already been applied
    }
    yPos += 25;


    //petcare
    if (gameConfig.petCare) {

    } else {
        gameConfig.eventContainer.addChild(createMonoRow(monoData.monopoly_bank_transaction_petdoctor.content, 1, 1, xPos, yPos));
        yPos += 25;
        totalAmount -= 1;

        var petDocIcon = createSprite("images/monopoly/monoBankPetDoctor.png", xPos - 220, yPos - 155, gameLoader);
        cleanUpArray.push(petDocIcon);
        gameConfig.eventContainer.addChild(petDocIcon);

        var label = new PIXI.Text(monoData.monopoly_bank_petdoctor.content, {
            fontFamily: "Arial",
            fontSize: 13,
            fill: "black",
            fontWeight: "normal",
            wordWrap: true,
            wordWrapWidth: 140
        });
        label.x = xPos - 180;
        label.y = yPos - 75;
        gameConfig.eventContainer.addChild(label);
        cleanUpArray.push(label);
    }

    //transportcare
    if (gameConfig.transportCare) {

    } else {
        gameConfig.eventContainer.addChild(createMonoRow(monoData.monopoly_bank_transaction_mechanic.content, 1, 1, xPos, yPos));
        yPos += 25;
        totalAmount -= 1;

        var autoRepIcon = createSprite("images/monopoly/monoBankMechanic.png", xPos - 220, yPos - 35, gameLoader);
        cleanUpArray.push(autoRepIcon);
        gameConfig.eventContainer.addChild(autoRepIcon);

        var label = new PIXI.Text(monoData.monopoly_bank_mechanic.content, {
            fontFamily: "Arial",
            fontSize: 13,
            fill: "black",
            fontWeight: "normal",
            wordWrap: true,
            wordWrapWidth: 140
        });
        label.x = xPos - 180;
        label.y = yPos + 45;
        gameConfig.eventContainer.addChild(label);
        cleanUpArray.push(label);
    }

    //subtotal
    gameConfig.eventContainer.addChild(createMonoRow("I alt", 2, totalAmount, xPos, yPos));
    yPos += 50;

    //titel
    var title = new PIXI.Text(monoData.monopoly_bank_header2.content, {
        fontFamily: "Arial",
        fontSize: 16,
        fill: "black",
        fontWeight: "normal"
    });
    title.x = xPos + 3;
    title.y = yPos;
    gameConfig.eventContainer.addChild(title);
    cleanUpArray.push(title);
    yPos += 18;

    //wages = 80
    totalAmount += 80;
    gameConfig.eventContainer.addChild(createMonoRow(monoData.monopoly_bank_income.content, 0, 80, xPos, yPos));
    yPos += 25;

    //transport
    gameConfig.eventContainer.addChild(createMonoRow(monoData.monopoly_bank_transport.content, 1, parseInt(gameConfig.userCarPrice), xPos, yPos));
    totalAmount -= parseInt(gameConfig.userCarPrice);
    yPos += 25;

    //house
    gameConfig.eventContainer.addChild(createMonoRow(monoData.monopoly_bank_house.content, 1, parseInt(gameConfig.userHousePrice), xPos, yPos));
    totalAmount -= parseInt(gameConfig.userHousePrice);
    yPos += 25;

    //pet
    gameConfig.eventContainer.addChild(createMonoRow(monoData.monopoly_bank_pet.content, 1, parseInt(gameConfig.userPetPrice), xPos, yPos));
    totalAmount -= parseInt(gameConfig.userPetPrice);
    yPos += 25;

    //total
    gameConfig.eventContainer.addChild(createMonoRow(monoData.monopoly_bank_equals.content, 2, totalAmount, xPos, yPos));

    gameConfig.money = totalAmount;
    monoUpdateSidebar();

    var gold = Math.floor(parseInt(totalAmount) / 10);
    var silver = parseInt(totalAmount) % 10;

    label = new PIXI.Text(gold, {
        fontFamily: "Arial",
        fontSize: 15,
        fill: "white",
        fontWeight: "normal"
    });
    label.x = 829;
    label.y = 519;
    gameConfig.eventContainer.addChild(label);
    cleanUpArray.push(label);

    label = new PIXI.Text(silver, {
        fontFamily: "Arial",
        fontSize: 15,
        fill: "white",
        fontWeight: "normal"
    });
    label.x = 857;
    label.y = 519;
    gameConfig.eventContainer.addChild(label);
    cleanUpArray.push(label);

    var nextBtn = createNextBtn();
    nextBtn.x = 817;
    nextBtn.y = 590;
    nextBtn.on('pointerup', showSavings);
    gameConfig.eventContainer.addChild(nextBtn);
    cleanUpRemoveArray.push(nextBtn);
}

function showSavings() {
    stopMayorSpeak();
    if (gameConfig.money > 0) {
        mayorSpeak("speak_b_monopoly_saveUpMoney_gotMoney");
    } else {
        mayorSpeak("speak_b_monopoly_saveUpMoney_noMoney");
    }

    gameConfig.eventContainer.removeChildren();

    gameConfig.bg = new PIXI.Graphics();
    gameConfig.bg.beginFill(0x000000);
    gameConfig.bg.hitArea = new PIXI.Rectangle(0, 0, 1100, 800);
    gameConfig.bg.interactive = true;
    gameConfig.bg.alpha = 0.3;
    gameConfig.bg.drawRect(0, 0, 1100, 800);
    gameConfig.eventContainer.addChild(gameConfig.bg);
    cleanUpArray.push(gameConfig.bg);

    var savingBG = createSprite("images/monopoly/monoBankSaveBG.png", 280, 180, gameLoader);
    gameConfig.eventContainer.addChild(savingBG);
    cleanUpArray.push(savingBG);

    gameConfig.saveGoldBtn = createMCGC("MonopolyBlueButton00", 2, 405, 280);
    gameConfig.saveGoldBtn.gotoAndStop(0);
    gameConfig.saveGoldBtn.interactive = true;
    gameConfig.saveGoldBtn.buttonMode = true;
    gameConfig.saveGoldBtn.on("pointerup", doSaveGold);
    gameConfig.eventContainer.addChild(gameConfig.saveGoldBtn);
    cleanUpArray.push(gameConfig.saveGoldBtn);

    gameConfig.saveSilverBtn = createMCGC("MonopolyBlueButton00", 2, 465, 280);
    gameConfig.saveSilverBtn.gotoAndStop(0);
    gameConfig.saveSilverBtn.interactive = true;
    gameConfig.saveSilverBtn.buttonMode = true;
    gameConfig.saveSilverBtn.on("pointerup", doSaveSilver);
    gameConfig.eventContainer.addChild(gameConfig.saveSilverBtn);
    cleanUpArray.push(gameConfig.saveSilverBtn);

    var label = new PIXI.Text(monoData.monopoly_bank_savings.content, {
        fontFamily: "Arial",
        fontSize: 14,
        fill: "black",
        fontWeight: "bold",
        wordWrap: true,
        wordWrapWidth: 150
    });
    label.x = 625;
    label.y = 300;
    gameConfig.eventContainer.addChild(label);
    cleanUpArray.push(label);

    var gold = Math.floor(parseInt(gameConfig.money) / 10);
    var silver = parseInt(gameConfig.money) % 10;

    gameConfig.goldLabel = new PIXI.Text(gold, {
        fontFamily: "Arial",
        fontSize: 30,
        fill: "white",
        fontWeight: "normal"
    });
    gameConfig.goldLabel.x = 409;
    gameConfig.goldLabel.y = 210;
    gameConfig.eventContainer.addChild(gameConfig.goldLabel);
    cleanUpArray.push(gameConfig.goldLabel);

    gameConfig.silverLabel = new PIXI.Text(silver, {
        fontFamily: "Arial",
        fontSize: 30,
        fill: "white",
        fontWeight: "normal"
    });
    gameConfig.silverLabel.x = 475;
    gameConfig.silverLabel.y = 210;
    gameConfig.eventContainer.addChild(gameConfig.silverLabel);
    cleanUpArray.push(gameConfig.silverLabel);

    gold = Math.floor(parseInt(gameConfig.saved) / 10);
    silver = parseInt(gameConfig.saved) % 10;

    gameConfig.goldSaveLabel = new PIXI.Text(gold, {
        fontFamily: "Arial",
        fontSize: 13,
        fill: "black",
        fontWeight: "bold"
    });
    gameConfig.goldSaveLabel.x = 433;
    gameConfig.goldSaveLabel.y = 517;
    gameConfig.eventContainer.addChild(gameConfig.goldSaveLabel);
    cleanUpArray.push(gameConfig.goldSaveLabel);

    gameConfig.silverSaveLabel = new PIXI.Text(silver, {
        fontFamily: "Arial",
        fontSize: 13,
        fill: "black",
        fontWeight: "bold"
    });
    gameConfig.silverSaveLabel.x = 470;
    gameConfig.silverSaveLabel.y = 517;
    gameConfig.eventContainer.addChild(gameConfig.silverSaveLabel);
    cleanUpArray.push(gameConfig.silverSaveLabel);

    var nextBtn = createNextBtn();
    nextBtn.x = 817;
    nextBtn.y = 590;
    nextBtn.on('pointerup', backToCurrentMonth);
    gameConfig.eventContainer.addChild(nextBtn);
    cleanUpRemoveArray.push(nextBtn);

}

function doSaveGold() {
    if (gameConfig.money < 10) {
        //deactivate goldbtn
    } else {
        gameConfig.money -= 10;
        gameConfig.saved += 10;
    }

    updateSaveNumbers();
    monoUpdateSidebar();
}

function doSaveSilver() {
    if (gameConfig.money < 1) {
        //deactivate silverbtn
    } else {
        //husk at fjerne guld hvis der fjernes sølv efter tierne
        gameConfig.money -= 1;
        gameConfig.saved += 1;
    }

    updateSaveNumbers()
    monoUpdateSidebar();
}

function updateSaveNumbers() {
    var gold = Math.floor(parseInt(gameConfig.money) / 10);
    var silver = parseInt(gameConfig.money) % 10;

    gameConfig.goldLabel.text = gold;
    gameConfig.silverLabel.text = silver;

    gold = Math.floor(parseInt(gameConfig.saved) / 10);
    silver = parseInt(gameConfig.saved) % 10;

    gameConfig.goldSaveLabel.text = gold;
    gameConfig.silverSaveLabel.text = silver;
}

function backToCurrentMonth() {
    gameConfig.careBar.visible = true;
    gameConfig.eventContainer.removeChildren();

    if (gameConfig.currentMonth == 6 && gameConfig.holidayNotHeld) {
        gameConfig.monthTimeOut = setTimeout(showHoliday, 2000 + Math.floor(Math.random() * 2000));
    } else if (gameConfig.currentMonth == 12) {
        gameConfig.monthTimeOut = setTimeout(showNewYearsParty, 2000 + Math.floor(Math.random() * 2000));
    } else {
        gameConfig.monthTimeOut = setTimeout(showNextMonthBtn, 2000 + Math.floor(Math.random() * 2000));
    }

}

function showNextMonthBtn() {
    stopMayorSpeak();
    if (Math.random() < 0.5) {
        mayorSpeak("speak_b_monopoly_next_month1") //speak_b_monopoly_next_month2
    } else {
        mayorSpeak("speak_b_monopoly_next_month2");
    }

    var nextMonthBtn = createMCGC("$okButton00", 12, 250, 200)
    //nextMonthBtn.gotoAndStop(gameConfig.currentMonth-1);
    nextMonthBtn.gotoAndStop(gameConfig.currentMonth);
    nextMonthBtn.interactive = true;
    nextMonthBtn.buttonMode = true;
    nextMonthBtn.on("pointerup", gotoNextMonoMonth);
    gameConfig.eventContainer.addChild(nextMonthBtn);
    cleanUpArray.push(nextMonthBtn);
}


function gotoNextMonoMonth() {
    gameConfig.eventContainer.removeChildren();

    monopolyData.splice(gameConfig.removeEventIndex, 1);

    if (gameConfig.currentMonth > 12) {
        //gameover - new years party
        showNewYearsParty();



    } else {
        gameConfig.currentMonth++;

        //gameConfig.month.gotoAndStop(gameConfig.currentMonth-1);

        if (gameConfig.currentMonth >= 6) {
            gameConfig.month.gotoAndStop(gameConfig.currentMonth + 1);
        } else {
            gameConfig.month.gotoAndStop(gameConfig.currentMonth - 1);
        }

        setupMonoBG();

        startMonoMonth();
    }

}

function showNewYearsParty() {
    gameConfig.careBar.visible = false;

    stopMayorSpeak();
    mayorSpeak("speak_b_monopoly_newYearsEve_helptxt");

    var nySprite = createSprite("images/monopoly/ny/MonopolyNewYearBG.png", -80, -120, gameLoader);
    gameConfig.eventContainer.addChild(nySprite);
    cleanUpArray.push(nySprite);
    nySprite = createSprite("images/monopoly/ny/MonopolyNewYearFrame.png", 205, 110, gameLoader);
    gameConfig.eventContainer.addChild(nySprite);
    cleanUpArray.push(nySprite);

    var nyItemPosArray = new Array([106, 271], [96, 469], [206, 581], [276, 643], [371, 624], [488, 651], [548, 620], [654, 589], [728, 581], [818, 593], [840, 499], [815, 373], [846, 246]);
    var nyItemPriceArray = new Array(200, 30, 10, 1, 5, 300, 3, 2, 3, 4, 10, 10, 60);
    var btn;
    var btnGraphics;
    gameConfig.nyBtnArray = new Array();
    gameConfig.nyItemArray = new Array();

    gameConfig.saved = 600;
    monoUpdateSidebar();

    for (var i = 0; i < 13; i++) {
        btn = new PIXI.Container();
        btn.x = nyItemPosArray[i][0];
        btn.y = nyItemPosArray[i][1];

        btn.price = nyItemPriceArray[i];
        btn.index = i;

        btnGraphics = new PIXI.Graphics();
        btnGraphics.beginFill(0x00152b);
        btnGraphics.drawRect(0, 0, 76, 30);
        btnGraphics.alpha = 0.3;
        cleanUpArray.push(btnGraphics);
        btn.addChild(btnGraphics);

        gold = Math.floor(btn.price / 10);
        silver = parseInt(btn.price) % 10;

        gameConfig.goldSaveLabel = new PIXI.Text(gold, {
            fontFamily: "Arial",
            fontSize: 12,
            fill: "black",
            fontWeight: "bold"
        });
        gameConfig.goldSaveLabel.x = 16;
        gameConfig.goldSaveLabel.y = 4;
        btn.addChild(gameConfig.goldSaveLabel);
        cleanUpArray.push(gameConfig.goldSaveLabel);

        gameConfig.silverSaveLabel = new PIXI.Text(silver, {
            fontFamily: "Arial",
            fontSize: 12,
            fill: "black",
            fontWeight: "bold"
        });
        gameConfig.silverSaveLabel.x = 47;
        gameConfig.silverSaveLabel.y = 4;
        btn.addChild(gameConfig.silverSaveLabel);
        cleanUpArray.push(gameConfig.silverSaveLabel);

        btn.hitArea = new PIXI.Rectangle(0, 0, 76, 30);
        btn.interactive = true;
        btn.buttonMode = true;
        btn.on("pointerup", buyNYItem);

        gameConfig.nyBtnArray.push(btn);

        if (btn.price > gameConfig.saved) {
            btn.interactive = false;
            btnGraphics.alpha = 0.8;
        }

        gameConfig.eventContainer.addChild(btn);

        cleanUpRemoveArray.push(btn);
    }

    gameConfig.nyPartyHolder = new PIXI.Container();
    gameConfig.eventContainer.addChild(gameConfig.nyPartyHolder);
    cleanUpRemoveArray.push(gameConfig.nyPartyHolder);

    gameConfig.nextBtn = createNextBtn();
    gameConfig.nextBtn.x = 720;
    gameConfig.nextBtn.y = 610;
    gameConfig.nextBtn.on('pointerup', showMonoFinalScore);
    gameConfig.eventContainer.addChild(gameConfig.nextBtn);
    cleanUpRemoveArray.push(gameConfig.nextBtn);

}

function buyNYItem() {
    gameConfig.nyItemArray.push(this.index);

    this.children[0].alpha = 0.8;
    this.interactive = false;

    gameConfig.saved -= this.price;

    monoUpdateSidebar();

    var btn;
    for (var i = 0; i < gameConfig.nyBtnArray.length; i++) {
        btn = gameConfig.nyBtnArray[i];
        if (btn.price > gameConfig.saved) {
            btn.interactive = false;
            btn.children[0].alpha = 0.8;
        }
    }


    //placeItems
    gameConfig.nyPartyHolder.removeChildren();

    //konfetti
    for (i = 0; i < gameConfig.nyItemArray.length; i++) {
        if (gameConfig.nyItemArray[i] == 4) {
            var nyItemSprite = createSprite("images/monopoly/ny/konfetti.png", 203, 110, gameLoader)
            gameConfig.nyPartyHolder.addChild(nyItemSprite);
            cleanUpArray.push(nyItemSprite);
            break;
        }
    }


    //diskokugle
    for (i = 0; i < gameConfig.nyItemArray.length; i++) {
        if (gameConfig.nyItemArray[i] == 5) {
            nyItemSprite = createMCGC("MonopolyNewYearFrame00", 24, 203, 110);
            gameConfig.nyPartyHolder.addChild(nyItemSprite);
            cleanUpArray.push(nyItemSprite);
            break;
        }
    }


    //jukebox
    for (i = 0; i < gameConfig.nyItemArray.length; i++) {
        if (gameConfig.nyItemArray[i] == 0) {
            nyItemSprite = createMCGC("$question00", 19, 210, 335);
            gameConfig.nyPartyHolder.addChild(nyItemSprite);
            cleanUpArray.push(nyItemSprite);
            break;
        }
    }

    //tallerkener
    for (i = 0; i < gameConfig.nyItemArray.length; i++) {
        if (gameConfig.nyItemArray[i] == 9) {
            nyItemSprite = createSprite("images/monopoly/ny/Tallerkner.png", 250, 460, gameLoader);
            gameConfig.nyPartyHolder.addChild(nyItemSprite);
            cleanUpArray.push(nyItemSprite);
            break;
        }
    }

    //cake
    for (i = 0; i < gameConfig.nyItemArray.length; i++) {
        if (gameConfig.nyItemArray[i] == 12) {
            nyItemSprite = createMCGC("$cake00", 8, 450, 250);
            gameConfig.nyPartyHolder.addChild(nyItemSprite);
            cleanUpArray.push(nyItemSprite);
            break;
        }
    }

    //lys
    for (i = 0; i < gameConfig.nyItemArray.length; i++) {
        if (gameConfig.nyItemArray[i] == 1) {
            nyItemSprite = createMCGC("Lysestage_PV2_8900", 22, 660, 300);
            gameConfig.nyPartyHolder.addChild(nyItemSprite);
            cleanUpArray.push(nyItemSprite);
            break;
        }
    }



    //blomster
    for (i = 0; i < gameConfig.nyItemArray.length; i++) {
        if (gameConfig.nyItemArray[i] == 8) {
            nyItemSprite = createSprite("images/monopoly/ny/blomster.png", 210, 500, gameLoader);
            gameConfig.nyPartyHolder.addChild(nyItemSprite);
            cleanUpArray.push(nyItemSprite);
            break;
        }
    }

    //hatte
    for (i = 0; i < gameConfig.nyItemArray.length; i++) {
        if (gameConfig.nyItemArray[i] == 7) {
            nyItemSprite = createSprite("images/monopoly/ny/hatte.png", 210, 480, gameLoader);
            gameConfig.nyPartyHolder.addChild(nyItemSprite);
            cleanUpArray.push(nyItemSprite);
            break;
        }
    }

    //drinks
    for (i = 0; i < gameConfig.nyItemArray.length; i++) {
        if (gameConfig.nyItemArray[i] == 3) {
            nyItemSprite = createSprite("images/monopoly/ny/drinks.png", 270, 425, gameLoader);
            gameConfig.nyPartyHolder.addChild(nyItemSprite);
            cleanUpArray.push(nyItemSprite);
            break;
        }
    }


    //ballon
    for (i = 0; i < gameConfig.nyItemArray.length; i++) {
        if (gameConfig.nyItemArray[i] == 10) {
            nyItemSprite = createSprite("images/monopoly/ny/cerpentiner.png", 210, 110, gameLoader);
            gameConfig.nyPartyHolder.addChild(nyItemSprite);
            cleanUpArray.push(nyItemSprite);
            break;
        }
    }

    //blomsterranker
    for (i = 0; i < gameConfig.nyItemArray.length; i++) {
        if (gameConfig.nyItemArray[i] == 11) {
            nyItemSprite = createSprite("images/monopoly/ny/Blomsterranker.png", 210, 110, gameLoader);
            gameConfig.nyPartyHolder.addChild(nyItemSprite);
            cleanUpArray.push(nyItemSprite);
            break;
        }
    }

    //guirlander
    for (i = 0; i < gameConfig.nyItemArray.length; i++) {
        if (gameConfig.nyItemArray[i] == 2) {
            nyItemSprite = createSprite("images/monopoly/ny/Guirlander.png", 200, 110, gameLoader);
            gameConfig.nyPartyHolder.addChild(nyItemSprite);
            cleanUpArray.push(nyItemSprite);
            break;
        }
    }



    //cerpentiner
    for (i = 0; i < gameConfig.nyItemArray.length; i++) {
        if (gameConfig.nyItemArray[i] == 7) {
            nyItemSprite = createSprite("images/monopoly/ny/Balloner.png", 210, 100, gameLoader);
            gameConfig.nyPartyHolder.addChild(nyItemSprite);
            cleanUpArray.push(nyItemSprite);
            break;
        }
    }

}


function showMonoFinalScore() {

    stopMayorSpeak();
    mayorSpeak("speak_b_monopoly_gameOver");

    gameConfig.eventContainer.removeChild(gameConfig.nextBtn);

    var bg = new PIXI.Graphics();
    bg.beginFill(0x000000);
    bg.hitArea = new PIXI.Rectangle(0, 0, 1100, 800);
    bg.interactive = true;
    bg.alpha = 0.3;
    bg.drawRect(0, 0, 1100, 800);
    gameConfig.eventContainer.addChild(bg);
    cleanUpArray.push(bg);

    var monoScoreSprite = createSprite("images/monopoly/ny/MonopolyHighscoreYourScore.png", 350, 160, gameLoader);
    gameConfig.eventContainer.addChild(monoScoreSprite);
    cleanUpArray.push(monoScoreSprite);

    var pointsTF = new PIXI.Text(gameConfig.points, {
        fontFamily: "Arial",
        fontSize: 14,
        fill: "white",
        fontWeight: "normal"
    });
    pointsTF.x = 516;
    pointsTF.y = 233;
    gameConfig.eventContainer.addChild(pointsTF);
    cleanUpArray.push(pointsTF);

    pointsTF = new PIXI.Text(monoData.monopoly_highscore_small_header.content + " " + gameConfig.points, {
        fontFamily: "Arial",
        fontSize: 14,
        fill: "black",
        fontWeight: "bold"
    });
    pointsTF.x = 472;
    pointsTF.y = 270;
    gameConfig.eventContainer.addChild(pointsTF);
    cleanUpArray.push(pointsTF);

    pointsTF = new PIXI.Text(monoData.monopoly_highscore_play_again.content, {
        fontFamily: "Arial",
        fontSize: 14,
        fill: "white",
        fontWeight: "bold"
    });
    pointsTF.x = 490;
    pointsTF.y = 440;
    gameConfig.eventContainer.addChild(pointsTF);
    cleanUpArray.push(pointsTF);

    var nextBtn = createNextBtn();
    nextBtn.scale.set(0.75);
    nextBtn.x = 485;
    nextBtn.y = 370;
    nextBtn.on('pointerup', replayMonopoly);
    gameConfig.eventContainer.addChild(nextBtn);
    cleanUpRemoveArray.push(nextBtn);
}

function replayMonopoly() {

    backToUniverse();
}






function showHoliday() {
    stopMayorSpeak();
    mayorSpeak("speak_b_monopoly_summerHoliday_helpTxt");

    gameConfig.careBar.visible = false;

    gameConfig.eventContainer.removeChildren();

    var holidayMapSprite = createSprite("images/monopoly/sq/MonopolySQMap.png", 75, 6, gameLoader);
    gameConfig.eventContainer.addChild(holidayMapSprite);
    cleanUpArray.push(holidayMapSprite);

    //header
    var label = new PIXI.Text(monoData.monopoly_summer_header.content, {
        fontFamily: "Arial",
        fontSize: 36,
        fill: "white",
        fontWeight: "bold"
    });
    label.x = 285;
    label.y = 140;
    gameConfig.eventContainer.addChild(label);
    cleanUpArray.push(label);


    //Nordamerika
    var countrySelect = new PIXI.Container();
    countrySelect.x = 210;
    countrySelect.y = 275;

    var countrySprite = createSprite("images/monopoly/sq/MonopolySQTravelButton.png", 0, 0, gameLoader)
    countrySelect.addChild(countrySprite);
    cleanUpArray.push(countrySprite);

    var btnTitle = monoData.monopoly_summer_north_america.content;

    var label = new PIXI.Text(btnTitle, {
        fontFamily: "Arial",
        fontSize: 12,
        fill: "black",
        fontWeight: "bold"
    });
    label.x = 0;
    label.y = -13;
    countrySelect.addChild(label);
    cleanUpArray.push(label);

    label = new PIXI.Text("4", {
        fontFamily: "Arial",
        fontSize: 12,
        fill: "black",
        fontWeight: "bold"
    });
    label.x = 17;
    label.y = 5;
    countrySelect.addChild(label);
    cleanUpArray.push(label);

    label = new PIXI.Text("0", {
        fontFamily: "Arial",
        fontSize: 12,
        fill: "black",
        fontWeight: "bold"
    });
    label.x = 50;
    label.y = 5;
    countrySelect.addChild(label);
    cleanUpArray.push(label);

    var btn = createMCGC("sqTravelBtn00", 2, 40, 25);
    btn.gotoAndStop(0);
    btn.interactive = true;
    btn.buttonMode = true;
    btn.countryIndex = 6;
    btn.countryBGIndex = 0;
    btn.price = -40;
    btn.name = btnTitle;
    btn.on("pointerup", showHolidayQuiz);
    countrySelect.addChild(btn);
    cleanUpArray.push(btn);

    gameConfig.eventContainer.addChild(countrySelect);

    if ((gameConfig.saved + btn.price) < 0) {
        btn.interactive = false;
        countrySelect.interactive = false;
        countrySelect.alpha = 0.5;
    }


    //Europa
    countrySelect = new PIXI.Container();
    countrySelect.x = 535;
    countrySelect.y = 275;

    countrySprite = createSprite("images/monopoly/sq/MonopolySQTravelButton.png", 0, 0, gameLoader);
    countrySelect.addChild(countrySprite);
    cleanUpArray.push(countrySprite);

    var btnTitle = monoData.monopoly_summer_europe.content;

    var label = new PIXI.Text(btnTitle, {
        fontFamily: "Arial",
        fontSize: 12,
        fill: "black",
        fontWeight: "bold"
    });
    label.x = 0;
    label.y = -13;
    countrySelect.addChild(label);
    cleanUpArray.push(label);

    label = new PIXI.Text("0", {
        fontFamily: "Arial",
        fontSize: 12,
        fill: "black",
        fontWeight: "bold"
    });
    label.x = 17;
    label.y = 5;
    countrySelect.addChild(label);
    cleanUpArray.push(label);

    label = new PIXI.Text("0", {
        fontFamily: "Arial",
        fontSize: 12,
        fill: "black",
        fontWeight: "bold"
    });
    label.x = 50;
    label.y = 5;
    countrySelect.addChild(label);
    cleanUpArray.push(label);

    var btn = createMCGC("sqTravelBtn00", 2, 40, 25);
    btn.gotoAndStop(0);
    btn.interactive = true;
    btn.buttonMode = true;
    btn.countryIndex = 1;
    btn.countryBGIndex = 3;
    btn.price = 0;
    btn.name = btnTitle;
    btn.on("pointerup", showHolidayQuiz);
    countrySelect.addChild(btn);
    cleanUpArray.push(btn);

    gameConfig.eventContainer.addChild(countrySelect);


    //Asien
    countrySelect = new PIXI.Container();
    countrySelect.x = 700;
    countrySelect.y = 260;

    countrySprite = createSprite("images/monopoly/sq/MonopolySQTravelButton.png", 0, 0, gameLoader);
    countrySelect.addChild(countrySprite);
    cleanUpArray.push(countrySprite);

    var btnTitle = monoData.monopoly_summer_asia.content;

    var label = new PIXI.Text(btnTitle, {
        fontFamily: "Arial",
        fontSize: 12,
        fill: "black",
        fontWeight: "bold"
    });
    label.x = 0;
    label.y = -13;
    countrySelect.addChild(label);
    cleanUpArray.push(label);

    label = new PIXI.Text("12", {
        fontFamily: "Arial",
        fontSize: 12,
        fill: "black",
        fontWeight: "bold"
    });
    label.x = 13;
    label.y = 5;
    countrySelect.addChild(label);
    cleanUpArray.push(label);

    label = new PIXI.Text("0", {
        fontFamily: "Arial",
        fontSize: 12,
        fill: "black",
        fontWeight: "bold"
    });
    label.x = 50;
    label.y = 5;
    countrySelect.addChild(label);
    cleanUpArray.push(label);

    var btn = createMCGC("sqTravelBtn00", 2, 40, 25);
    btn.gotoAndStop(0);
    btn.interactive = true;
    btn.buttonMode = true;
    btn.countryIndex = 26;
    btn.countryBGIndex = 5;
    btn.price = -120;
    btn.name = btnTitle;
    btn.on("pointerup", showHolidayQuiz);
    countrySelect.addChild(btn);
    cleanUpArray.push(btn);

    gameConfig.eventContainer.addChild(countrySelect);

    if ((gameConfig.saved + btn.price) < 0) {
        btn.interactive = false;
        countrySelect.interactive = false;
        countrySelect.alpha = 0.5;
    }


    //south america
    countrySelect = new PIXI.Container();
    countrySelect.x = 320; //210
    countrySelect.y = 490; //275

    countrySprite = createSprite("images/monopoly/sq/MonopolySQTravelButton.png", 0, 0, gameLoader);
    countrySelect.addChild(countrySprite);
    cleanUpArray.push(countrySprite);

    var btnTitle = monoData.monopoly_summer_south_america.content;

    var label = new PIXI.Text(btnTitle, {
        fontFamily: "Arial",
        fontSize: 12,
        fill: "black",
        fontWeight: "bold"
    });
    label.x = 0;
    label.y = -13;
    countrySelect.addChild(label);
    cleanUpArray.push(label);

    label = new PIXI.Text("16", {
        fontFamily: "Arial",
        fontSize: 12,
        fill: "black",
        fontWeight: "bold"
    });
    label.x = 13;
    label.y = 5;
    countrySelect.addChild(label);
    cleanUpArray.push(label);

    label = new PIXI.Text("0", {
        fontFamily: "Arial",
        fontSize: 12,
        fill: "black",
        fontWeight: "bold"
    });
    label.x = 50;
    label.y = 5;
    countrySelect.addChild(label);
    cleanUpArray.push(label);

    var btn = createMCGC("sqTravelBtn00", 2, 40, 25);
    btn.gotoAndStop(0);
    btn.interactive = true;
    btn.buttonMode = true;
    btn.countryIndex = 11;
    btn.countryBGIndex = 1;
    btn.price = -160;
    btn.name = btnTitle;
    btn.on("pointerup", showHolidayQuiz);
    countrySelect.addChild(btn);
    cleanUpArray.push(btn);

    gameConfig.eventContainer.addChild(countrySelect);

    if ((gameConfig.saved + btn.price) < 0) {
        btn.interactive = false;
        countrySelect.interactive = false;
        countrySelect.alpha = 0.5;
    }


    //africa
    countrySelect = new PIXI.Container();
    countrySelect.x = 540; //210
    countrySelect.y = 425; //275

    countrySprite = createSprite("images/monopoly/sq/MonopolySQTravelButton.png", 0, 0, gameLoader);
    countrySelect.addChild(countrySprite);
    cleanUpArray.push(countrySprite);

    var btnTitle = monoData.monopoly_summer_africa.content;

    var label = new PIXI.Text(btnTitle, {
        fontFamily: "Arial",
        fontSize: 12,
        fill: "black",
        fontWeight: "bold"
    });
    label.x = 0;
    label.y = -13;
    countrySelect.addChild(label);
    cleanUpArray.push(label);

    label = new PIXI.Text("8", {
        fontFamily: "Arial",
        fontSize: 12,
        fill: "black",
        fontWeight: "bold"
    });
    label.x = 17;
    label.y = 5;
    countrySelect.addChild(label);
    cleanUpArray.push(label);

    label = new PIXI.Text("0", {
        fontFamily: "Arial",
        fontSize: 12,
        fill: "black",
        fontWeight: "bold"
    });
    label.x = 50;
    label.y = 5;
    countrySelect.addChild(label);
    cleanUpArray.push(label);

    var btn = createMCGC("sqTravelBtn00", 2, 40, 25);
    btn.gotoAndStop(0);
    btn.interactive = true;
    btn.buttonMode = true;
    btn.countryIndex = 16;
    btn.countryBGIndex = 4;
    btn.price = -80;
    btn.name = btnTitle;
    btn.on("pointerup", showHolidayQuiz);
    countrySelect.addChild(btn);
    cleanUpArray.push(btn);

    gameConfig.eventContainer.addChild(countrySelect);

    if ((gameConfig.saved + btn.price) < 0) {
        btn.interactive = false;
        countrySelect.interactive = false;
        countrySelect.alpha = 0.5;
    }


    //australia
    countrySelect = new PIXI.Container();
    countrySelect.x = 830; //210
    countrySelect.y = 505; //275

    countrySprite = createSprite("images/monopoly/sq/MonopolySQTravelButton.png", 0, 0, gameLoader);
    countrySelect.addChild(countrySprite);
    cleanUpArray.push(countrySprite);

    var btnTitle = monoData.monopoly_summer_australia.content;

    var label = new PIXI.Text(btnTitle, {
        fontFamily: "Arial",
        fontSize: 12,
        fill: "black",
        fontWeight: "bold"
    });
    label.x = 0;
    label.y = -13;
    countrySelect.addChild(label);
    cleanUpArray.push(label);

    label = new PIXI.Text("20", {
        fontFamily: "Arial",
        fontSize: 12,
        fill: "black",
        fontWeight: "bold"
    });
    label.x = 13;
    label.y = 5;
    countrySelect.addChild(label);
    cleanUpArray.push(label);

    label = new PIXI.Text("0", {
        fontFamily: "Arial",
        fontSize: 12,
        fill: "black",
        fontWeight: "bold"
    });
    label.x = 50;
    label.y = 5;
    countrySelect.addChild(label);
    cleanUpArray.push(label);

    var btn = createMCGC("sqTravelBtn00", 2, 40, 25);
    btn.gotoAndStop(0);
    btn.interactive = true;
    btn.buttonMode = true;
    btn.countryIndex = 21;
    btn.countryBGIndex = 6;
    btn.price = -200;
    btn.name = btnTitle;
    btn.on("pointerup", showHolidayQuiz);
    countrySelect.addChild(btn);
    cleanUpArray.push(btn);

    gameConfig.eventContainer.addChild(countrySelect);

    if ((gameConfig.saved + btn.price) < 0) {
        btn.interactive = false;
        countrySelect.interactive = false;
        countrySelect.alpha = 0.5;
    }


    //south pole
    countrySelect = new PIXI.Container();
    countrySelect.x = 400; //210
    countrySelect.y = 625; //275

    countrySprite = createSprite("images/monopoly/sq/MonopolySQTravelButton.png", 0, 0, gameLoader);
    countrySelect.addChild(countrySprite);
    cleanUpArray.push(countrySprite);

    var btnTitle = monoData.monopoly_summer_antarctic.content;

    var label = new PIXI.Text(btnTitle, {
        fontFamily: "Arial",
        fontSize: 12,
        fill: "black",
        fontWeight: "bold"
    });
    label.x = 0;
    label.y = -13;
    countrySelect.addChild(label);
    cleanUpArray.push(label);

    label = new PIXI.Text("24", {
        fontFamily: "Arial",
        fontSize: 12,
        fill: "black",
        fontWeight: "bold"
    });
    label.x = 13;
    label.y = 5;
    countrySelect.addChild(label);
    cleanUpArray.push(label);

    label = new PIXI.Text("0", {
        fontFamily: "Arial",
        fontSize: 12,
        fill: "black",
        fontWeight: "bold"
    });
    label.x = 50;
    label.y = 5;
    countrySelect.addChild(label);
    cleanUpArray.push(label);

    var btn = createMCGC("sqTravelBtn00", 2, 40, 25);
    btn.gotoAndStop(0);
    btn.interactive = true;
    btn.buttonMode = true;
    btn.countryIndex = 21;
    btn.countryBGIndex = 2;
    btn.price = -240;
    btn.name = btnTitle;
    btn.on("pointerup", showHolidayQuiz);
    countrySelect.addChild(btn);
    cleanUpArray.push(btn);

    gameConfig.eventContainer.addChild(countrySelect);

    if ((gameConfig.saved + btn.price) < 0) {
        btn.interactive = false;
        countrySelect.interactive = false;
        countrySelect.alpha = 0.5;
    }

}

function showHolidayQuiz() {

    playSQAmbient();

    gameConfig.saved += this.price;
    monoUpdateSidebar();

    gameConfig.eventContainer.removeChildren();

    var countryBG = createMCGC("MonopolyGameSummerQuiz00", 7, 0, 0);
    countryBG.gotoAndStop(this.countryBGIndex);
    gameConfig.eventContainer.addChild(countryBG);
    cleanUpArray.push(countryBG);

    var countryQBG = createSprite("images/monopoly/sq/questionBG.png", 200, 150, gameLoader);
    gameConfig.eventContainer.addChild(countryQBG);
    cleanUpArray.push(countryQBG);

    gameConfig.sqProgressArray = new Array();
    gameConfig.corrects = 0;

    var qBtn = createMCGC("MonopolySQspIcon00", 4, 230, 220);
    qBtn.gotoAndStop(0);
    gameConfig.eventContainer.addChild(qBtn);
    gameConfig.sqProgressArray.push(qBtn);
    var label = new PIXI.Text("1", {
        fontFamily: "Arial",
        fontSize: 16,
        fill: "white",
        fontWeight: "bold"
    });
    label.x = 240;
    label.y = 225;
    gameConfig.eventContainer.addChild(label);
    cleanUpArray.push(qBtn);
    cleanUpArray.push(label);

    qBtn = createMCGC("MonopolySQspIcon00", 4, 270, 220);
    qBtn.gotoAndStop(3);
    gameConfig.eventContainer.addChild(qBtn);
    gameConfig.sqProgressArray.push(qBtn);
    label = new PIXI.Text("2", {
        fontFamily: "Arial",
        fontSize: 16,
        fill: "white",
        fontWeight: "bold"
    });
    label.x = 280;
    label.y = 225;
    gameConfig.eventContainer.addChild(label);
    cleanUpArray.push(qBtn);
    cleanUpArray.push(label);

    qBtn = createMCGC("MonopolySQspIcon00", 4, 310, 220);
    qBtn.gotoAndStop(3);
    gameConfig.eventContainer.addChild(qBtn);
    gameConfig.sqProgressArray.push(qBtn);
    label = new PIXI.Text("3", {
        fontFamily: "Arial",
        fontSize: 16,
        fill: "white",
        fontWeight: "bold"
    });
    label.x = 320;
    label.y = 225;
    gameConfig.eventContainer.addChild(label);
    cleanUpArray.push(qBtn);
    cleanUpArray.push(label);

    qBtn = createMCGC("MonopolySQspIcon00", 4, 350, 220);
    qBtn.gotoAndStop(3);
    gameConfig.eventContainer.addChild(qBtn);
    gameConfig.sqProgressArray.push(qBtn);
    label = new PIXI.Text("4", {
        fontFamily: "Arial",
        fontSize: 16,
        fill: "white",
        fontWeight: "bold"
    });
    label.x = 360;
    label.y = 225;
    gameConfig.eventContainer.addChild(label);
    cleanUpArray.push(qBtn);
    cleanUpArray.push(label);

    qBtn = createMCGC("MonopolySQspIcon00", 4, 390, 220);
    qBtn.gotoAndStop(3);
    gameConfig.eventContainer.addChild(qBtn);
    gameConfig.sqProgressArray.push(qBtn);
    label = new PIXI.Text("5", {
        fontFamily: "Arial",
        fontSize: 16,
        fill: "white",
        fontWeight: "bold"
    });
    label.x = 400;
    label.y = 225;
    gameConfig.eventContainer.addChild(label);
    cleanUpArray.push(qBtn);
    cleanUpArray.push(label);



    label = new PIXI.Text(this.name, {
        fontFamily: "Arial",
        fontSize: 24,
        fill: "black",
        fontWeight: "bold"
    });
    label.x = 230;
    label.y = 180;
    gameConfig.eventContainer.addChild(label);
    cleanUpArray.push(label);

    gameConfig.sqSelectedCountry = this.countryIndex;
    gameConfig.sqIndex = 0;

    showSQQuestion();






}

function playSQAmbient() {
    gameConfig.playingSound = playSound("monopoly_summerHoliday_musicLoop")

    gameConfig.ambientTimer = setTimeout(playSQAmbient, 27000);
}


function showSQQuestion() {
    var qIndex = gameConfig.sqSelectedCountry + gameConfig.sqIndex;
    if (language == "dk") {
        var question = monoData["q" + qIndex];
    } else {
        question = monoData["question" + qIndex];
    }

    gameConfig.eventText = new PIXI.Text(question.content, monoEventTextStyle);
    gameConfig.eventText.x = 280;
    gameConfig.eventText.y = 265;
    gameConfig.eventContainer.addChild(gameConfig.eventText);

    //vis tre knapper m konsekvens
    gameConfig.answerBtn0 = createSQAnswerBtn(0, question.option1);
    gameConfig.answerBtn0.x = 280;
    gameConfig.answerBtn0.y = 310;
    gameConfig.eventContainer.addChild(gameConfig.answerBtn0);

    gameConfig.answerBtn1 = createSQAnswerBtn(1, question.option2);
    gameConfig.answerBtn1.x = 280;
    gameConfig.answerBtn1.y = 370;
    gameConfig.eventContainer.addChild(gameConfig.answerBtn1);

    gameConfig.answerBtn2 = createSQAnswerBtn(2, question.option3);
    gameConfig.answerBtn2.x = 280;
    gameConfig.answerBtn2.y = 430;
    gameConfig.eventContainer.addChild(gameConfig.answerBtn2);

}

function sqAnswerClick() {
    var qIndex = gameConfig.sqSelectedCountry + gameConfig.sqIndex;
    if (language == "dk") {
        var question = monoData["q" + qIndex];
    } else {
        question = monoData["question" + qIndex];
    }

    var correctOption = parseInt(question.correctoption);


    gameConfig.eventContainer.removeChild(gameConfig.eventText);
    gameConfig.eventContainer.removeChild(gameConfig.answerBtn0);
    gameConfig.eventContainer.removeChild(gameConfig.answerBtn1);
    gameConfig.eventContainer.removeChild(gameConfig.answerBtn2);


    if ((this.index + 1) == correctOption) {
        gameConfig.sqProgressArray[gameConfig.sqIndex].gotoAndStop(1);

        gameConfig.eventText = new PIXI.Text(monoData.monopoly_summer_right_answer.content, monoEventTextStyle);
        gameConfig.eventText.x = 280;
        gameConfig.eventText.y = 265;
        gameConfig.eventContainer.addChild(gameConfig.eventText);
        cleanUpArray.push(gameConfig.eventText);

        gameConfig.corrects++;
    } else {
        gameConfig.sqProgressArray[gameConfig.sqIndex].gotoAndStop(2);

        gameConfig.eventText = new PIXI.Text(monoData.monopoly_summer_wrong_answer.content, monoEventTextStyle);
        gameConfig.eventText.x = 280;
        gameConfig.eventText.y = 265;
        gameConfig.eventContainer.addChild(gameConfig.eventText);
        cleanUpArray.push(gameConfig.eventText);
    }


    gameConfig.sqCorrectLabel = new PIXI.Text(question.correcttext, {
        fontFamily: "Arial",
        fontSize: 14,
        fill: "black",
        fontWeight: "normal",
        wordWrap: true,
        wordWrapWidth: 370
    });
    gameConfig.sqCorrectLabel.x = 280;
    gameConfig.sqCorrectLabel.y = 340;
    gameConfig.eventContainer.addChild(gameConfig.sqCorrectLabel);
    cleanUpArray.push(gameConfig.sqCorrectLabel);

    gameConfig.sqNextBtn = createNextBtn();
    gameConfig.sqNextBtn.x = 280;
    gameConfig.sqNextBtn.y = 400;
    gameConfig.sqNextBtn.on('pointerup', sqNextQuestion);
    gameConfig.eventContainer.addChild(gameConfig.sqNextBtn);
    cleanUpRemoveArray.push(gameConfig.sqNextBtn);


}

function sqNextQuestion() {
    gameConfig.eventContainer.removeChild(gameConfig.sqNextBtn);
    gameConfig.eventContainer.removeChild(gameConfig.sqCorrectLabel);
    gameConfig.eventContainer.removeChild(gameConfig.eventText);

    gameConfig.sqIndex++
        if (gameConfig.sqIndex < 5) {
            showSQQuestion();
        } else {
            sqGameOver();
        }
}

function sqGameOver() {
    mayorSpeak("speak_b_monopoly_summerHoliday_moveOn");

    gameConfig.eventText = new PIXI.Text(monoData.monopoly_summer_no_more_answers.content, monoEventTextStyle);
    gameConfig.eventText.x = 280;
    gameConfig.eventText.y = 265;
    gameConfig.eventContainer.addChild(gameConfig.eventText);
    cleanUpArray.push(gameConfig.eventText);

    var finishedIcon = createSprite("images/monopoly/sq/sqFinishedIcon.png", 280, 310, gameLoader);
    gameConfig.eventContainer.addChild(finishedIcon);
    cleanUpArray.push(finishedIcon);

    gameConfig.sqCorrectLabel = new PIXI.Text(gameConfig.corrects, {
        fontFamily: "Arial",
        fontSize: 20,
        fill: "black",
        fontWeight: "bold"
    });
    gameConfig.sqCorrectLabel.x = 355;
    gameConfig.sqCorrectLabel.y = 340;
    gameConfig.eventContainer.addChild(gameConfig.sqCorrectLabel);
    cleanUpArray.push(gameConfig.sqCorrectLabel);

    gameConfig.points += gameConfig.corrects;

    monoUpdateSidebar();

    gameConfig.sqNextBtn = createNextBtn();
    gameConfig.sqNextBtn.x = 280;
    gameConfig.sqNextBtn.y = 400;
    gameConfig.sqNextBtn.on('pointerup', exitSQ);
    gameConfig.eventContainer.addChild(gameConfig.sqNextBtn);
    cleanUpRemoveArray.push(gameConfig.sqNextBtn);
}

function exitSQ() {
    gameConfig.eventContainer.removeChildren();

    if (gameConfig.ambientTimer) {
        clearInterval(gameConfig.ambientTimer);
        gameConfig.ambientTimer = null;
    }

    if (gameConfig.playingSound) {
        gameConfig.playingSound.stop();
    }

    gameConfig.holidayNotHeld = false;
    gameConfig.monthTimeOut = setTimeout(showNextMonthBtn, 2000 + Math.floor(Math.random() * 2000));
    gameConfig.careBar.visible = true;
}



//mono utils
function createMonoRow(labelString, frame, amount, xPos, yPos) {
    var row = new PIXI.Container();
    row.x = xPos;
    row.y = yPos;
    cleanUpRemoveArray.push(row);

    var bg = createMCGC("MonopolyBankCardRow00", 3, 0, 0);
    bg.gotoAndStop(frame);
    row.addChild(bg);
    cleanUpArray.push(bg);

    var label = new PIXI.Text(labelString, {
        fontFamily: "Arial",
        fontSize: 13,
        fill: "black",
        fontWeight: "bold"
    });
    label.x = 5;
    label.y = 5;
    row.addChild(label);
    cleanUpArray.push(label);

    var gold = Math.floor(parseInt(amount) / 10);
    var silver = parseInt(amount) % 10;

    label = new PIXI.Text(gold, {
        fontFamily: "Arial",
        fontSize: 13,
        fill: "black",
        fontWeight: "bold"
    });
    label.x = 375;
    label.y = 5;
    row.addChild(label);
    cleanUpArray.push(label);

    label = new PIXI.Text(silver, {
        fontFamily: "Arial",
        fontSize: 13,
        fill: "black",
        fontWeight: "bold"
    });
    label.x = 405;
    label.y = 5;
    row.addChild(label);
    cleanUpArray.push(label);

    return row;

}


function createSQAnswerBtn(index, answerString) {
    var btn = new PIXI.Container();
    var icon = createMCGC("Ok_spm_PV2_8900", 39, 0, 0);
    icon.scale.set(0.75);
    btn.addChild(icon);
    cleanUpRemoveArray.push(btn);

    var iconNumber = new PIXI.Text(index + 1, {
        fontFamily: "Arial",
        fontSize: 18,
        fill: "white",
        fontWeight: "bold"
    });
    iconNumber.x = 17;
    iconNumber.y = 14;
    btn.addChild(iconNumber);
    cleanUpArray.push(iconNumber);

    var txt = new PIXI.Text(answerString, monoBtnTextStyle);
    txt.x = 60;
    txt.y = 15;
    btn.addChild(txt);
    cleanUpArray.push(txt);

    btn.interactive = true;
    btn.buttonMode = true;
    btn.on("pointerup", sqAnswerClick)

    btn.index = index;

    return btn
}



function createMonoAnswerBtn(index) {
    var btn = new PIXI.Container();
    var icon = createMCGC("Ok_spm_PV2_8900", 39, 0, 0);
    icon.scale.set(0.75);
    btn.addChild(icon)

    var iconNumber = new PIXI.Text(index + 1, {
        fontFamily: "Arial",
        fontSize: 18,
        fill: "white",
        fontWeight: "bold"
    });
    iconNumber.x = 17;
    iconNumber.y = 14;
    btn.addChild(iconNumber);

    var txt = new PIXI.Text(getEventText("consequence" + (index + 1) + "title"), monoBtnTextStyle);
    txt.x = 60;
    txt.y = 15;
    btn.addChild(txt);

    btn.interactive = true;
    btn.buttonMode = true;
    btn.on("pointerup", monoAnswerClick)

    btn.name = index;

    return btn
}

function getEventText(field) { //consequence skal huske valgte name
    var eventString = gameConfig.eventData[field];

    if (eventString.indexOf("<name>") == -1) {
        return eventString;
    } else {
        if (gameConfig.selectedNameEvent != "") {
            newName = gameConfig.selectedNameEvent;
        } else {
            if (gameConfig.eventData.person == "all") {
                if (Math.random() < 0.5) {
                    var newName = gameConfig.selectedAdults[Math.floor(Math.random() * gameConfig.selectedAdults.length)].name;
                } else {
                    newName = gameConfig.selectedChildren[Math.floor(Math.random() * gameConfig.selectedChildren.length)].name;
                }
            } else if (gameConfig.eventData.person == "child") {
                newName = gameConfig.selectedChildren[Math.floor(Math.random() * gameConfig.selectedChildren.length)].name;
            } else {
                newName = gameConfig.selectedAdults[Math.floor(Math.random() * gameConfig.selectedAdults.length)].name;
            }
            gameConfig.selectedNameEvent = newName;
        }

        while (eventString.indexOf("<name>") > -1) {
            eventString = eventString.replace("<name>", newName);
        }
        return eventString;
    }
}


function getMonthString() {
    if (gameConfig.currentMonth == 1) {
        return "january";
    } else if (gameConfig.currentMonth == 2) {
        return "february";
    } else if (gameConfig.currentMonth == 3) {
        return "march";
    } else if (gameConfig.currentMonth == 4) {
        return "april";
    } else if (gameConfig.currentMonth == 5) {
        return "may";
    } else if (gameConfig.currentMonth == 6) {
        return "june";
    } else if (gameConfig.currentMonth == 7) {
        return "july";
    } else if (gameConfig.currentMonth == 8) {
        return "august";
    } else if (gameConfig.currentMonth == 9) {
        return "september";
    } else if (gameConfig.currentMonth == 10) {
        return "october";
    } else if (gameConfig.currentMonth == 11) {
        return "november";
    } else if (gameConfig.currentMonth == 12) {
        return "december";
    }

}

function monoUpdateSidebar() {

    //showFamily

    //show points
    if (gameConfig.sideBar_pointsTF) {
        gameConfig.sideBar_pointsTF.text = gameConfig.points;
    } else {
        gameConfig.sideBar_pointsTF = new PIXI.Text(gameConfig.points, {
            fontFamily: 'Arial',
            fontSize: 14,
            fill: 0xffffff
        });
        gameConfig.sideBar_pointsTF.x = 64;
        gameConfig.sideBar_pointsTF.y = 314;
        frontGround.addChild(gameConfig.sideBar_pointsTF);
        cleanUpArray.push(gameConfig.sideBar_pointsTF);
    }

    //show saved
    var gold = Math.floor(parseInt(gameConfig.saved) / 10);
    var silver = parseInt(gameConfig.saved) % 10;

    if (gameConfig.sideBar_savedGoldTF) {
        gameConfig.sideBar_savedGoldTF.text = gold;
    } else {
        gameConfig.sideBar_savedGoldTF = new PIXI.Text(gold, {
            fontFamily: 'Arial',
            fontSize: 14,
            fill: 0x000000
        });
        gameConfig.sideBar_savedGoldTF.x = 85;
        gameConfig.sideBar_savedGoldTF.y = 354;
        gameConfig.sideBar_savedGoldTF.rotation = -0.175;
        frontGround.addChild(gameConfig.sideBar_savedGoldTF);
        cleanUpArray.push(gameConfig.sideBar_savedGoldTF);
    }

    if (gameConfig.sideBar_savedSilverTF) {
        gameConfig.sideBar_savedSilverTF.text = silver;
    } else {
        gameConfig.sideBar_savedSilverTF = new PIXI.Text(silver, {
            fontFamily: 'Arial',
            fontSize: 14,
            fill: 0x000000
        });
        gameConfig.sideBar_savedSilverTF.x = 108;
        gameConfig.sideBar_savedSilverTF.y = 350;
        gameConfig.sideBar_savedSilverTF.rotation = -0.175;
        frontGround.addChild(gameConfig.sideBar_savedSilverTF);
        cleanUpArray.push(gameConfig.sideBar_savedSilverTF);
    }


    //show money
    gold = Math.floor(parseInt(gameConfig.money) / 10);
    silver = parseInt(gameConfig.money) % 10;

    if (gameConfig.sideBar_goldTF) {
        gameConfig.sideBar_goldTF.text = gold;
    } else {
        gameConfig.sideBar_goldTF = new PIXI.Text(gold, {
            fontFamily: 'Arial',
            fontSize: 14,
            fill: 0xffffff
        });
        gameConfig.sideBar_goldTF.x = 92;
        gameConfig.sideBar_goldTF.y = 420;
        gameConfig.sideBar_goldTF.rotation = 0.175;
        frontGround.addChild(gameConfig.sideBar_goldTF);
        cleanUpArray.push(gameConfig.sideBar_goldTF);
    }

    if (gameConfig.sideBar_silverTF) {
        gameConfig.sideBar_silverTF.text = silver;
    } else {
        gameConfig.sideBar_silverTF = new PIXI.Text(silver, {
            fontFamily: 'Arial',
            fontSize: 14,
            fill: 0xffffff
        });
        gameConfig.sideBar_silverTF.x = 115;
        gameConfig.sideBar_silverTF.y = 425;
        gameConfig.sideBar_silverTF.rotation = 0.175;
        frontGround.addChild(gameConfig.sideBar_silverTF);
        cleanUpArray.push(gameConfig.sideBar_silverTF);
    }
}




//UTILS
function updateUserCookie() {
    if (allowCookies) {
        // Put the user object into storage
        localStorage.setItem('pengeby-user', JSON.stringify(user));
    } else {

    }
}

function getUserCookie() {
    // Retrieve the user object from storage
    var retrievedObject = localStorage.getItem('pengeby-user');
    user = JSON.parse(retrievedObject);
}


function cleanup() { //only for sprites
    /*for (var i = cleanUpArray.length-1; i >= 0; i--) {
        console.log(i);
        if(cleanUpArray[i].textureCacheIds){
            console.log(cleanUpArray[i].textureCacheIds[0]);
        }
    }*/

    for (var i = cleanUpArray.length - 1; i >= 0; i--) {
        //console.log(i);
        cleanUpArray[i].destroy(true);
    }

    cleanUpArray = new Array();

    for (var i = cleanUpRemoveArray.length - 1; i >= 0; i--) {
        // console.log(i);
        // console.log(cleanUpRemoveArray[i]);
        // console.log(cleanUpRemoveArray[i].texture);

        if (cleanUpRemoveArray[i].texture == null) {} else {
            cleanUpRemoveArray[i].destroy();
        }
    }

    cleanUpRemoveArray = new Array();
}

function createSprite(textureName, xPos, yPos, loader) {
    if (loader == undefined) {
        loader = PIXI.Loader.shared;
    }
    var spriteItem = new PIXI.Sprite(loader.resources[textureName].texture);
    spriteItem.x = xPos;
    spriteItem.y = yPos;
    return spriteItem;
}

function createNextBtn() {
    btnContainer = new PIXI.Container();
    btnContainer.interactive = true;
    btnContainer.buttonMode = true;

    var btnBG = createMC("Ok instance 100", 39, 0, 0);
    btnContainer.addChild(btnBG);
    var btnIcon = createMC("Ok_btn00", 2, 22, 15);
    btnIcon.gotoAndStop(0);
    btnContainer.addChild(btnIcon);

    btnContainer.on('pointerover', function() {
        this.children[1].gotoAndStop(1);
    });

    btnContainer.on('pointerout', function() {
        this.children[1].gotoAndStop(0);
    });

    return btnContainer;
}

function createMC(textureName, frames, xPos, yPos) {
    var framesArray = [];
    if (frames < 100) {
        for (var i = 0; i < frames; i++) {
            var val = i < 10 ? '0' + i : i;
            framesArray.push(PIXI.Texture.from(textureName + val));
        }
    } else {
        for (var i = 0; i < frames; i++) {
            if (i < 10) {
                var val = "00" + i;
            } else if (i < 100) {
                val = "0" + i;
            } else {
                val = i;
            }
            framesArray.push(PIXI.Texture.from(textureName + val));
        }
    }

    // create an AnimatedSprite
    var anim = new PIXI.AnimatedSprite(framesArray);
    anim.x = xPos;
    anim.y = yPos;
    anim.animationSpeed = 0.4;
    anim.play();
    return anim;
}

function createMCGC(textureName, frames, xPos, yPos) {
    var framesArray = [];
    var val;
    var texture;
    if (frames < 100) {
        for (var i = 0; i < frames; i++) {
            val = i < 10 ? '0' + i : i;
            texture = PIXI.Texture.from(textureName + val)
            framesArray.push(texture);
            cleanUpArray.push(texture);
        }
    } else {
        for (var i = 0; i < frames; i++) {
            if (i < 10) {
                val = "00" + i;
            } else if (i < 100) {
                val = "0" + i;
            } else {
                val = i;
            }
            texture = PIXI.Texture.from(textureName + val);
            framesArray.push(texture);
            cleanUpArray.push(texture);
        }
    }

    // create an AnimatedSprite
    var anim = new PIXI.AnimatedSprite(framesArray);
    anim.x = xPos;
    anim.y = yPos;
    anim.animationSpeed = 0.4;
    anim.play();
    return anim;
}

function makeButton(sprite, callback) {
    sprite.interactive = true;
    sprite.buttonMode = true;
    sprite.on('pointerdown', callback);
}


var mayor;

function initMayor() {
    mayor = new PIXI.Container();
    mayor.addChild(createSprite("images/mayor_button.png", -100, -160));

    mayor.mouth = createMC("MayorMouth00", 27, -53, -100);
    mayor.mouth.gotoAndStop(0);
    mayor.mouth.scale.set(0.75);
    mayor.addChild(mayor.mouth);
    mayor.isSpeaking = false;

    mayor.scale.set(0.65);

    makeButton(mayor, onClickMayor);
    mayor.x = 1024;
    mayor.y = 700;

    frontGround.addChild(mayor);
}

function onClickMayor() {
    stopMayorSpeak();
    playMayor();
}

var currentMayorSound;

function mayorSpeak(soundID, loader) {
    currentMayorSound = [soundID, loader];

    playMayor();
}

function stopMayorSpeak() {
    if (mayor.isSpeaking) {
        mayor.mayorSound.stop();
        //currentMayorSound = null;
        mayor.mouth.gotoAndStop(0);
        TweenMax.to(mayor, 0.35, {
            pixi: {
                scale: 0.65
            }
        });
        mayor.isSpeaking = false;
    }
}

function playMayor() {
    if (currentMayorSound) {
        if (currentMayorSound[1] == undefined) {
            mayor.mayorSound = playSound(currentMayorSound[0]);
        } else {
            mayor.mayorSound = playSound(currentMayorSound[0], currentMayorSound[1]);
        }
    } else {
        //play universal sound - er der noget jeg kan hjælpe dig med
        //mayor.mayorSound = playSound(currentMayorSound[0]);
    }
    mayor.isSpeaking = true;

    mayor.mayorSound.on('end', function() {
        mayor.mouth.gotoAndStop(0);
        TweenMax.to(mayor, 0.35, {
            pixi: {
                scale: 0.65
            }
        });
        mayor.isSpeaking = false;
    });

    mayor.mouth.gotoAndPlay(1);
    TweenMax.to(mayor, 0.35, {
        pixi: {
            scale: 1
        }
    });
}

//sitecatalyst
function sendStatPoint(statString) {
    if (allowCookies && doTrack) {
        flashEventFunction(statString + "_" + language, '', '', '');
    } else {
        //console.log("no track "+statString);
    }
}


//sounds
function playSound(soundID, loader) {
    /*
    if(loader == undefined){
        var soundInstance = gameLoader.resources[soundID].sound.play();
    }else{
        soundInstance = loader.resources[soundID].sound.play();
    }
    */
    var soundInstance = PIXI.sound.play(soundID);

    if (subtitleArray[soundID] == undefined) {

    } else {
        if (subtitleArray[soundID] == "") {

        } else {
            frontGround.subtitlesLabel.text = subtitleArray[soundID];
        }
    }

    return soundInstance;
}

function playRandomSound(soundIDArray) {
    var soundIndex = Math.floor(Math.random() * soundIDArray.length);

    var soundInstance = PIXI.sound.play(soundIDArray[soundIndex]);
    return soundInstance;
}

function playRandomSoundPixi(soundIDArray) {
    var soundIndex = Math.floor(Math.random() * soundIDArray.length);

    var soundInstance = PIXI.sound.play(soundIDArray[soundIndex]);
    return soundInstance;
}

function muteSound() {
    if (PIXI.sound.toggleMuteAll()) {
        this.gotoAndStop(1);
    } else {
        this.gotoAndStop(0);
    }


}

function keyboard(keyCode) {
    var key = {};
    key.code = keyCode;
    key.isDown = false;
    key.isUp = true;
    key.press = undefined;
    key.release = undefined;

    //The `downHandler`
    key.downHandler = function(event) {
        if (event.keyCode === key.code) {
            if (key.isUp && key.press) key.press();
            key.isDown = true;
            key.isUp = false;
        }
        event.preventDefault();
    };

    //The `upHandler`
    key.upHandler = function(event) {
        if (event.keyCode === key.code) {
            if (key.isDown && key.release) key.release();
            key.isDown = false;
            key.isUp = true;
        }
        event.preventDefault();
    };

    //Attach event listeners
    window.addEventListener(
        "keydown", key.downHandler.bind(key), false
    );
    window.addEventListener(
        "keyup", key.upHandler.bind(key), false
    );
    return key;
}
/*
function releaseKeyboard(){
    window.removeEventListener(
        "keydown", key.downHandler.bind(key), false
    );

    window.addEventListener(
        "keyup", key.upHandler.bind(key), false
    );
}*/

/**
 * jQuery.browser.mobile (http://detectmobilebrowser.com/)
 *
 * jQuery.browser.mobile will be true if the browser is a mobile device
 *
 **/
(function(a) {
    (jQuery.browser = jQuery.browser || {}).mobile = /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|android|ipad|playbook|silk|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))
})(navigator.userAgent || navigator.vendor || window.opera);