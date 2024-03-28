/// <reference path="../../src/config.ts" />
/// <reference path="../../src/app-default.ts" />
/// <reference path="../../src/main.ts" />
/// <reference path="../../src/systemsvehicle.ts" />
/// <reference path="../../src/systemsuserprofile.ts" />
/// <reference path="../../src/appspopups.ts" />
/// <reference path="../../src/appsappinput.ts" />
/// <reference path="../../src/appsappmedia.ts" />
/// <reference path="../../src/appsappcontext.ts" />
/// <reference path="../../src/systemsappsnavihmi.ts" />
/// <reference path="../../src/systemsappssetuphmi.ts" />
/// <reference path="../../src/systemstelephony.ts" />
/// <reference path="../../src/systemsbluetooth.ts" />
/// <reference path="../../src/appstexttospeech.ts" />
/// <reference path="../../src/appsvoicerecognizer.ts" />
'use strict';
let globalLogger = undefined;
window.onload = function () {
    globalLogger = {
        log: (...args) => {
            console.log('[OverridenLogger]', ...args);
        }
    };
    const _consoleArea = document.getElementById('consoleArea');
    _consoleArea.setAttribute('readOnly', '');
    function printToConsoleArea(...args) {
        let fullLog = '';
        args.forEach(item => {
            if (typeof item === 'object')
                item = JSON.stringify(item);
            fullLog += item + ' ';
        });
        _consoleArea.value += '\n' + fullLog;
        _consoleArea.scrollTop = _consoleArea.scrollHeight;
    }
    const customConsole = (function (originalConsole) {
        return {
            log: function (...args) {
                originalConsole.log(...args);
                printToConsoleArea(...args);
            },
            warn: function (...args) {
                originalConsole.warn(...args);
                printToConsoleArea('[warn]', ...args);
            },
            error: function (...args) {
                originalConsole.error(...args);
                printToConsoleArea('[error]', ...args);
            },
            info: function (...args) {
                originalConsole.info(...args);
                printToConsoleArea('[info]', ...args);
            }
        };
    }(window.console));
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    window["console"] = customConsole;
    const ccOSBox = document.getElementById('ccOS');
    ccOSBox.appendChild(createUserprofileBox());
    ccOSBox.appendChild(createVehicleBox());
    ccOSBox.appendChild(createVSMBox());
    ccOSBox.appendChild(createPopupsBox());
    ccOSBox.appendChild(createAppInputBox());
    ccOSBox.appendChild(createAppMediaBox());
    ccOSBox.appendChild(createAppContextBox());
    ccOSBox.appendChild(createNavigationBox());
    ccOSBox.appendChild(createSetupHMIBox());
    ccOSBox.appendChild(createTelephonyBox());
    ccOSBox.appendChild(createBluetoothBox());
    ccOSBox.appendChild(createTextToSpeechBox());
    ccOSBox.appendChild(createVoiceRecognizerBox());
    ccOSBox.appendChild(createHeaderBox());
};
function createHeaderBox() {
    var _a;
    const APIs = [];
    (_a = document.body.querySelectorAll('#ccOS > div')) === null || _a === void 0 ? void 0 : _a.forEach(ele => APIs.push(ele.id));
    const toggleBox = FormSet.createElement('div', { id: 'headerBox', className: 'm5', innerText: `ccOS Web API v${ccOS.version}\t` });
    toggleBox.innerText = `ccOS Web API ${(ccOS === null || ccOS === void 0 ? void 0 : ccOS.version) || ''}\t`;
    const setAlert = FormSet.cbSetAlert(toggleBox);
    if (!(ccOS === null || ccOS === void 0 ? void 0 : ccOS.version))
        setAlert('ccOS undefined');
    const createRefreshBtn = () => {
        const btn = FormSet.createButton({ className: 'm2 btnReload', innerText: 'reload' });
        btn.onclick = (evt) => {
            location.reload();
        };
        toggleBox.appendChild(btn);
    };
    createRefreshBtn();
    const createBtn = (name) => {
        const btn = FormSet.createButton({ className: 'm2 btnToggle', innerText: name });
        btn.onclick = (evt) => {
            const apiBox = document.body.querySelector(`#${name}`);
            if (!apiBox) {
                return;
            }
            apiBox.classList.toggle('displayNone');
            evt.target.classList.toggle('hidden');
        };
        toggleBox.appendChild(btn);
    };
    const createToggleAllBtn = () => {
        const btn = FormSet.createButton({ className: 'm2 btnToggle', innerText: 'All' });
        let isShow = true;
        btn.onclick = (evt) => {
            isShow = !isShow;
            const coll = document.querySelectorAll('#headerBox .btnToggle' + (isShow && '.hidden' || ''));
            coll.forEach((target) => {
                if (evt.target === target)
                    return;
                target.click();
            });
            evt.target.classList.toggle('hidden');
        };
        toggleBox.appendChild(btn);
    };
    APIs.forEach(createBtn);
    createBtn('console');
    createToggleAllBtn();
    return toggleBox;
}
function createVSMBox() {
    const box = createBox('vsm');
    const label = FormSet.createElement('label', { id: 'vsmlabel' });
    const btnGetInstance = FormSet.createButton({ innerText: 'getInstance', className: 'm5' });
    const input = FormSet.createElement('input', { id: 'vsminput', type: 'text', value: 'Vehicle.Body', className: 'm5', placeholder: 'id' });
    box.appendChild(input);
    box.appendChild(btnGetInstance);
    const setAlert = FormSet.cbSetAlert(box, label);
    if (!ccOS.VehicleSignalModel)
        setAlert('ccOS.VehicleSignalModel undefined');
    btnGetInstance.onclick = () => {
        var _a, _b;
        const id = (_a = document.getElementById('vsminput')) === null || _a === void 0 ? void 0 : _a.value;
        const elements = document.body.querySelectorAll(`#vsm div[data-id="${id}"`);
        if ((elements === null || elements === void 0 ? void 0 : elements.length) > 0) {
            setAlert(`already exist instance of "${id}"`);
            return;
        }
        label && (label.innerHTML = '');
        (_b = ccOS.VehicleSignalModel) === null || _b === void 0 ? void 0 : _b.getInstance({ id, _debugOptions: { logLevel: ccOS.Logger.TRACE, output: globalLogger } }).then(vsm => {
            log('vsm instance is created', vsm);
            const properties = [
                { name: 'value', type: 'json', initSetInput: true }
            ];
            new TestForm({ instance: vsm, properties, parentElement: box });
        }).catch(e => {
            console.warn(e);
            setAlert(e);
        });
    };
    return box;
}
function createAppContextBox() {
    const box = createBox('appcontext');
    const appInputTestBox = FormSet.createDiv({ id: 'appContextTestBox', className: 'm5' });
    const btnGetInstance = FormSet.createButton({ innerText: 'getInstance', className: 'm5' });
    box.appendChild(btnGetInstance);
    box.appendChild(appInputTestBox);
    const setAlert = FormSet.cbSetAlert(box);
    // usage of ccOS 'appcontext'  [[
    if (!ccOS.AppContext) {
        setAlert('ccOS.AppContext undefined');
    }
    else {
        const getInstance = () => {
            var _a;
            (_a = ccOS.AppContext) === null || _a === void 0 ? void 0 : _a.getInstance({
                _debugOptions: { logLevel: ccOS.Logger.TRACE, output: globalLogger }
            }).then((appcontext) => {
                log('appcontext instance is created', appcontext);
                const methods = [
                    { name: 'clearAppHistory' },
                    { name: 'focusOnSystem' }
                ];
                const properties = [
                    {
                        name: 'behaviorUserBack', type: 'selection', hasSet: false,
                        selection: [ccOS.AppContext.VALUE_BEHAVIOR_USER_BACK_APP_HISTORY_BACK, ccOS.AppContext.VALUE_BEHAVIOR_USER_BACK_NATIVE_BACK]
                    },
                    {
                        name: 'focusOwner', type: 'selection', hasSet: false,
                        selection: [ccOS.AppContext.VALUE_FOCUS_OWNER_APP, ccOS.AppContext.VALUE_FOCUS_OWNER_SYSTEM]
                    }
                ];
                new TestForm({
                    instance: appcontext, properties, methods, parentElement: box,
                    onDestroy: () => {
                        btnGetInstance.disabled = false;
                    }
                });
            }).catch(e => {
                console.warn(e);
                setAlert(e);
            });
        };
        btnGetInstance.onclick = getInstance;
    }
    return box;
}
function createAppMediaBox() {
    const box = createBox('appmedia');
    const appInputTestBox = FormSet.createDiv({ id: 'appMediaTestBox', className: 'm5' });
    const btnGetInstance = FormSet.createButton({ innerText: 'getInstance', className: 'm5' });
    box.appendChild(btnGetInstance);
    box.appendChild(appInputTestBox);
    const setAlert = FormSet.cbSetAlert(box);
    // usage of ccOS 'appmedia'  [[
    if (!ccOS.AppMedia) {
        setAlert('ccOS.AppMedia undefined');
    }
    else {
        const getInstance = () => {
            var _a;
            (_a = ccOS.AppMedia) === null || _a === void 0 ? void 0 : _a.getInstance({
                _debugOptions: { logLevel: ccOS.Logger.TRACE, output: globalLogger }
            }).then((appmedia) => {
                log('appmedia instance is created', appmedia);
                const properties = [
                    {
                        name: 'videoZoom', type: 'selection',
                        selection: [ccOS.AppMedia.VALUE_VIDEO_ZOOM_NORMAL, ccOS.AppMedia.VALUE_VIDEO_ZOOM_ZOOM_FILL_SCREEN],
                        initSetInput: true
                    }
                ];
                new TestForm({ instance: appmedia, properties, parentElement: box });
            }).catch(e => {
                console.warn(e);
                setAlert(e);
            });
        };
        btnGetInstance.onclick = getInstance;
    }
    return box;
}
function createAppInputBox() {
    const box = createBox('appinput');
    const appInputTestBox = FormSet.createDiv({ id: 'appInputTestBox', className: 'm5' });
    const btnGetInstance = FormSet.createButton({ innerText: 'getInstance', className: 'm5' });
    box.appendChild(btnGetInstance);
    box.appendChild(appInputTestBox);
    const setAlert = FormSet.cbSetAlert(box);
    // usage of ccOS 'appinput'  [[
    if (!ccOS.AppInput) {
        setAlert('ccOS.AppInput undefined');
    }
    else {
        const testInput = FormSet.createElement('input', { type: 'text', id: 'txtForTestOfAppInput', placeholder: 'Please enter "a" or "아".' });
        appInputTestBox.appendChild(testInput);
        const koArr = [
            // top 1 ~ 50
            '명량', '극한직업', '신과함께-죄와 벌', '국제시장', '어벤져스: 엔드게임', '겨울왕국 2', '아바타', '베테랑', '괴물', '도둑들', '7번방의 선물', '암살', '범죄도시 2', '알라딘', '광해, 왕이 된 남자', '왕의 남자', '신과함께-인과 연', '택시운전사', '태극기 휘날리며', '부산행', '해운대', '변호인', '어벤져스: 인피니티 워', '실미도', '어벤져스: 에이지 오브 울트론', '기생충', '겨울왕국', '인터스텔라', '보헤미안 랩소디', '검사외전', '엑시트', '설국열차', '관상', '아이언맨 3', '캡틴 아메리카: 시빌 워', '해적: 바다로 간 산적', '수상한 그녀', '국가대표', '디워', '백두산', '과속스캔들', '탑건: 매버릭', '스파이더맨: 파 프롬 홈', '웰컴 투 동막골', '공조', '트랜스포머 3', '히말라야', '미션임파서블:고스트프로토콜', '스파이더맨: 노 웨이 홈', '트랜스포머: 패자의 역습',
            // top 51 ~ 100
            '밀정', '최종병기 활', '트랜스포머', '써니', '화려한 휴가', '한산: 용의 출현', '스파이더맨: 홈 커밍', '1987', '베를린', '마스터', '터널', '어벤져스', '내부자들', '인천상륙작전', '럭키', '은밀하게 위대하게', '공조2: 인터내셔날', '곡성', '범죄도시', '타짜', '좋은 놈, 나쁜 놈, 이상한 놈', '늑대소년', '미녀는 괴로워', '군함도', '미션 임파서블: 폴아웃', '다크 나이트 라이즈', '아저씨', '사도', '전우치', '킹스맨 : 시크릿 에이전트', '미션 임파서블: 로그네이션', '투사부일체', '연평해전', '반지의 제왕 : 왕의 귀환', '인셉션', '레미제라블', '닥터 스트레인지: 대혼돈의 멀티버스', '쉬리', '캡틴 마블', '미션 임파서블 3', '쥬라기 월드: 폴른 킹덤', '청년경찰', '가문의 위기(가문의 영광2)', '숨바꼭질', '덕혜옹주', '더 테러 라이브', '쥬라기 월드', '감시자들', '의형제', '2012'
        ];
        const enArr = [
            // top 1 ~ 100
            'Top Gun: Maverick', 'Doctor Strange in the Multi…', 'Jurassic World: Dominion', 'Black Panther: Wakanda Forever', 'Minions: The Rise of Gru', 'The Batman', 'Thor: Love and Thunder', 'Spider-Man: No Way Home', 'Sonic the Hedgehog 2', 'Black Adam', 'Elvis', 'Uncharted', 'Nope', 'Lightyear', 'Smile', 'The Lost City', 'Bullet Train', 'The Bad Guys', 'Fantastic Beasts: The Secre…', 'DC League of Super Pets', 'Where the Crawdads Sing', 'The Black Phone', 'Sing 2', 'Scream', 'Morbius', 'Everything Everywhere All A…', 'The Woman King', 'Ticket to Paradise', 'Halloween Ends', 'Dog', 'jackass forever', 'Death on the Nile', 'Don’t Worry, Darling', 'Lyle, Lyle, Crocodile', 'Downton Abbey: A New Era', 'Barbarian', 'The Northman', 'Jujutsu Kaisen 0: The Movie', 'Dragon Ball Super: Super Hero', 'The Bob’s Burgers Movie', 'Beast', 'Carnal Knowledge', 'The Invitation', 'Avatar', 'Marry Me', 'Ambulance', 'The King’s Man', 'Father Stu', 'The Unbearable Weight of Ma…', 'The Menu', 'Strange World', 'Prey for the Devil', 'Moonfall', 'Paws of Fury: The Legend of…', 'Amsterdam', 'The 355', 'American Underdog: The Kurt…', 'RRR: Rise, Roar, Revolt', 'Glass Onion: A Knives Out M…', 'The Chosen Season 3: Episod…', 'Easter Sunday', 'One Piece Film: Red', 'Jaws', 'X', 'Bros', 'Bodies Bodies Bodies', 'Licorice Pizza', 'Terrifier 2', 'Mrs. Harris Goes to Paris', 'West Side Story', 'Devotion', 'Blacklight', 'Firestarter', 'See How They Run', 'The Matrix Resurrections', 'Pearl', 'Redeeming Love', 'Till', 'Three Thousand Years of Lon…', 'The Banshees of Inisherin', 'Brahmastra Part 1: Shiva', 'Men', 'Memory', 'Fall', 'Ghostbusters: Afterlife', 'BTS Permission to Dance on …', 'K.G.F: Chapter 2', 'Marcel the Shell with Shoes On', 'Encanto', 'Orphan: First Kill', 'Tucker: The Man and His Dream', 'TÁR', 'Lifemark', 'Ponniyin Selvan: Part One', 'House of Gucci', 'Mississippi Masala', 'She Said', 'The Cursed', 'Bones and All',
            // top 101 ~ 200
            'ET: The Extra-Terrestrial', 'Vengeance', 'Moonage Daydream', 'Clerks III', 'Belle', 'Triangle of Sadness', 'Family Camp', 'The Fabelmans', 'Cyrano', 'Nightmare Alley', 'Laal Singh Chaddha', 'The Outfit', 'The Worst Person in the World', 'Breaking', 'Honk for Jesus. Save Your S…', 'Mack & Rita', 'Studio 666', 'A Journal for Jordan', 'Crimes of the Future', 'Belfast', 'Gigi & Nate', 'The Good House', 'Parallel Mothers', 'Emily the Criminal', 'The Wolf and the Lion', 'Umma', 'Jeepers Creepers: Reborn', 'Drive My Car', 'Watcher', 'Mr. Malcolm’s List', 'Decision to Leave', 'Armageddon Time', '2022 Oscar Shorts', 'Radhe Shyam', 'The King’s Daughter', 'Infinite Storm', 'Jugjugg Jeeyo', 'The Duke', 'Running The Bases', 'Y Como Es El', 'The Kashmir Files', '2000 Mules', 'The Servant', 'The Godfather', 'Acharya', 'Medieval', 'Rogue One: A Star Wars Story', 'Dune', 'Fire of Love', 'Hallelujah: Leonard Cohen, …', 'Drishyam 2', 'The Contractor', 'After Ever Happy', 'The Beatles Get Back: The R…', 'Venom: Let There be Carnage', 'Twenty One Pilots: Cinema E…', 'Hansan: Rising Dragon', 'The Tiger Rising', 'Petite maman', 'Aftersun', 'The Phantom of the Open', 'Aline', 'Ante Sundaraniki', 'The Roundup', 'Official Competition', 'Cuando Sea Joven', 'Runway 34', 'Confess, Fletch', 'The Legend of Maula Jatt', 'Call Jane', 'God’s Country', 'Deep in the Heart: A Texas …', 'The Railway Children', 'Brian and Charles', 'Beast', 'Emergency Declaration', 'Facing Nolan', 'Superspreader', 'King Richard', 'Yashoda', 'Tyson’s Run', 'Alice', 'Selena', 'Inu-Oh', 'The Forgiven', 'Godzilla Against MechaGodzilla', 'Red Rocket', 'Mad God', 'Clean', 'Waterman', 'Meet Me in the Bathroom', 'The Deer King', 'Montana Story', 'Flee', 'A Love Song', 'Mothering Sunday', 'Kaathu Vaakula Rendu Kadhal', 'Gone in the Night', 'You Won’t Be Alone', 'Paul’s Promise', 'The Automat'
        ];
        const setAppInputTestAlert = FormSet.cbSetAlert(appInputTestBox, null, { color: 'blue' });
        const arr = enArr.concat(koArr);
        const ARRAY_LEN_LIMIT = 10;
        let appInput;
        const inputEvtHandler = (evt) => {
            // todo: Unknown if ccOS instance is destroyed: Need an interface to know that ccOS instance is destroyed?
            if (!ccOS.WebResource._instances[ccOS.AppInput.URI] || !appInput) {
                setAppInputTestAlert('AppInput instance undefined.', 'red');
                ccOS.AppInput.getInstance({ _debugOptions: { logLevel: ccOS.Logger.TRACE, output: globalLogger } })
                    .then(instance => {
                    appInput = instance;
                    inputEvtHandler(evt);
                });
                return;
            }
            const value = evt.target.value;
            const regex = new RegExp(value);
            const suggestions = !value ? [] : arr.filter(item => regex.test(item) || regex.test(item.toLowerCase()))
                .splice(0, ARRAY_LEN_LIMIT);
            appInput.setSuggestionsText(suggestions);
            setAppInputTestAlert("setSuggestionsText " + JSON.stringify(suggestions));
        };
        testInput.oninput = inputEvtHandler;
    }
    const getInstance = () => {
        var _a;
        setAlert('');
        (_a = ccOS.AppInput) === null || _a === void 0 ? void 0 : _a.getInstance({ _debugOptions: { logLevel: ccOS.Logger.TRACE, output: globalLogger } }).then(instance => {
            btnGetInstance.disabled = true;
            const properties = [{
                    name: 'suggestionsText',
                    type: 'text',
                    inputType: 'object',
                    initSetInput: true
                },
                {
                    name: 'userLoggedIn',
                    type: 'selection',
                    initSetInput: true,
                    inputType: 'boolean',
                    selection: [true, false]
                }
            ];
            new TestForm({
                instance, properties, parentElement: box,
                onDestroy: () => {
                    btnGetInstance.disabled = false;
                }
            });
        }).catch(e => {
            log('failed to get instance:', e);
            setAlert(e);
        });
    };
    btnGetInstance.onclick = getInstance;
    // getInstance();
    // ]] usage of ccOS 'appinput'
    return box;
}
function createTelephonyBox() {
    const box = createBox('telephony');
    const btnGetInstance = FormSet.createButton({ innerText: 'getInstance', className: 'm5' });
    box.appendChild(btnGetInstance);
    const setAlert = FormSet.cbSetAlert(box);
    // usage of ccOS 'telephony'  [[
    if (!ccOS.Telephony)
        setAlert('ccOS.Telephony undefined');
    const getInstance = () => {
        var _a;
        setAlert('');
        (_a = ccOS.Telephony) === null || _a === void 0 ? void 0 : _a.getInstance({ _debugOptions: { logLevel: ccOS.Logger.TRACE, output: globalLogger } }).then(instance => {
            btnGetInstance.disabled = true;
            const properties = [
                {
                    name: 'phoneNumber',
                    type: 'text',
                    hasSet: false,
                    selection: []
                },
                {
                    name: 'iccidNumber',
                    type: 'text',
                    hasSet: false,
                    selection: []
                }
            ];
            new TestForm({
                instance, properties, parentElement: box,
                onDestroy: () => {
                    btnGetInstance.disabled = false;
                }
            });
        }).catch(e => {
            log('failed to get instance:', e);
            setAlert(e);
        });
    };
    btnGetInstance.onclick = getInstance;
    // getInstance();
    // ]] usage of ccOS 'telephony'
    return box;
}
function createUserprofileBox() {
    const box = createBox('userprofile');
    const btnGetInstance = FormSet.createButton({ innerText: 'getInstance', className: 'm5' });
    box.appendChild(btnGetInstance);
    const setAlert = FormSet.cbSetAlert(box);
    // usage of ccOS 'userprofile'  [[
    if (!ccOS.Userprofile)
        setAlert('ccOS.Userprofile undefined');
    const getInstance = () => {
        var _a;
        setAlert('');
        (_a = ccOS.Userprofile) === null || _a === void 0 ? void 0 : _a.getInstance({ _debugOptions: { logLevel: ccOS.Logger.TRACE, output: globalLogger } }).then(instance => {
            btnGetInstance.disabled = true;
            const properties = [{
                    name: 'name',
                    type: 'text',
                    hasSet: false,
                    selection: []
                }];
            new TestForm({
                instance, properties, parentElement: box,
                onDestroy: () => {
                    btnGetInstance.disabled = false;
                }
            });
        }).catch(e => {
            log('failed to get instance:', e);
            setAlert(e);
        });
    };
    btnGetInstance.onclick = getInstance;
    // getInstance();
    // ]] usage of ccOS 'vehicle'
    return box;
}
function createVehicleBox() {
    const box = createBox('vehicle');
    const btnGetInstance = FormSet.createButton({ innerText: 'getInstance', className: 'm5' });
    box.appendChild(btnGetInstance);
    const setAlert = FormSet.cbSetAlert(box);
    // usage of ccOS 'vehicle' [[
    if (!ccOS.Vehicle)
        setAlert('ccOS.Vehicle undefined');
    const getInstance = () => {
        var _a;
        setAlert('');
        (_a = ccOS.Vehicle) === null || _a === void 0 ? void 0 : _a.getInstance({ _debugOptions: { logLevel: ccOS.Logger.TRACE, output: globalLogger } }).then(vehicleInstance => {
            btnGetInstance.disabled = true;
            const properties = [{
                    name: 'regulationState',
                    type: 'text',
                    hasSet: false,
                    selection: []
                },
                {
                    name: 'vehicleId',
                    type: 'text',
                    hasSet: false,
                    selection: []
                }];
            new TestForm({ instance: vehicleInstance, properties, parentElement: box,
                onDestroy: () => {
                    btnGetInstance.disabled = false;
                } });
            // log('vehicle dump:', vehicleInstance.dump());
            // setInterval( () => {
            //   if ((vehicleInstance as ccOS.Vehicle).getRegulationState() === ccOS.Vehicle.VALUE_REGULATION_STATE_ACTIVE)
            //     /* only for DEV, illegal usage */
            //     vehicleInstance._wrappedData['regulationState'] = ccOS.Vehicle.VALUE_REGULATION_STATE_INACTIVE;
            //   else
            //     vehicleInstance._wrappedData['regulationState'] = ccOS.Vehicle.VALUE_REGULATION_STATE_ACTIVE;
            // }, 2000);
        }).catch(e => {
            log('failed to get instance:', e);
            setAlert(e);
        });
    };
    // ]] usage of ccOS 'vehicle'
    btnGetInstance.onclick = getInstance;
    // getInstance();
    return box;
}
function createPopupsBox() {
    var _a, _b, _c, _d, _e;
    const box = createBox('popups');
    const typeBox = FormSet.createDiv({ className: 'solid m10 p5 getInstance flexBox' });
    const requiredBox = FormSet.createDiv({ className: 'solid m5 p5 required flexBox' });
    const optionBox = FormSet.createDiv({ className: 'm5 p5 option flexBox' });
    const optionsOfType = [((_a = ccOS === null || ccOS === void 0 ? void 0 : ccOS.Popup) === null || _a === void 0 ? void 0 : _a.VALUE_TYPE_OSD) || 'osd', ((_b = ccOS.Popup) === null || _b === void 0 ? void 0 : _b.VALUE_TYPE_TOAST) || 'toast', ((_c = ccOS.Popup) === null || _c === void 0 ? void 0 : _c.VALUE_TYPE_CONFIRM) || 'confirm'];
    const radioType = FormSet.createRadio(optionsOfType, 'type', { optClass: 'initPopupType', coverClass: 'type' });
    const inputText = FormSet.createText('text', { value: 'new text', coverClass: 'text', textClass: 'm5 initPopupText' });
    const optionsOfStatus = [((_d = ccOS.Popup) === null || _d === void 0 ? void 0 : _d.VALUE_STATUS_SHOWN) || 'shown', ((_e = ccOS.Popup) === null || _e === void 0 ? void 0 : _e.VALUE_STATUS_HIDDEN) || 'hidden'];
    const radioStatus = FormSet.createRadio(optionsOfStatus, 'status', { checkedIndex: -1, optClass: 'initPopupStatus', coverClass: 'status' });
    const inputTitle = FormSet.createText('title', { value: '', coverClass: 'title', textClass: 'm5' });
    const inputConfirmTextOk = FormSet.createText('confirmTextOk', { value: '', coverClass: 'confirmTextOk', textClass: 'm5' });
    const inputConfirmTextCancel = FormSet.createText('confirmTextCancel', { value: '', coverClass: 'confirmTextCancel', textClass: 'm5' });
    const btnGetInstance = FormSet.createButton({ innerText: 'getInstance', className: 'm5' });
    requiredBox.appendChild(radioType);
    requiredBox.appendChild(inputText);
    optionBox.appendChild(radioStatus);
    optionBox.appendChild(inputTitle);
    optionBox.appendChild(inputConfirmTextOk);
    optionBox.appendChild(inputConfirmTextCancel);
    typeBox.appendChild(requiredBox);
    typeBox.appendChild(optionBox);
    typeBox.appendChild(btnGetInstance);
    box.appendChild(typeBox);
    const setAlert = FormSet.cbSetAlert(typeBox);
    if (!ccOS.Popup)
        setAlert('ccOS.Popup undefined');
    btnGetInstance.onclick = () => {
        var _a, _b, _c;
        setAlert('');
        const initData = {};
        // required
        const text = (_a = requiredBox.querySelector('input[type="text"]')) === null || _a === void 0 ? void 0 : _a.value;
        const typeValue = (_b = requiredBox.querySelector('input[type="radio"]:checked')) === null || _b === void 0 ? void 0 : _b.value;
        // etc
        const statusCheckedRadio = optionBox.querySelector('input[type="radio"]:checked');
        const txtTitle = optionBox.querySelector('.title input[type="text"]');
        const txtConfirmTextOk = optionBox.querySelector('.confirmTextOk input[type="text"]');
        const txtConfirmTextCancel = optionBox.querySelector('.confirmTextCancel input[type="text"]');
        const status = statusCheckedRadio === null || statusCheckedRadio === void 0 ? void 0 : statusCheckedRadio.value;
        const title = txtTitle === null || txtTitle === void 0 ? void 0 : txtTitle.value;
        const confirmTextOk = txtConfirmTextOk === null || txtConfirmTextOk === void 0 ? void 0 : txtConfirmTextOk.value;
        const confirmTextCancel = txtConfirmTextCancel === null || txtConfirmTextCancel === void 0 ? void 0 : txtConfirmTextCancel.value;
        if (status)
            initData['status'] = status;
        if (title)
            initData['title'] = title;
        if (confirmTextOk)
            initData['confirmTextOk'] = confirmTextOk;
        if (confirmTextCancel)
            initData['confirmTextCancel'] = confirmTextCancel;
        if (statusCheckedRadio)
            statusCheckedRadio.checked = false;
        [txtTitle, txtConfirmTextOk, txtConfirmTextCancel].forEach((input) => input.value = '');
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        (_c = ccOS.Popup) === null || _c === void 0 ? void 0 : _c.getInstance(Object.assign(Object.assign({ text, type: typeValue }, initData), { _debugOptions: { logLevel: ccOS.Logger.TRACE, output: globalLogger } })).then((popup) => {
            log('popup instance is created', popup);
            const properties = [
                {
                    name: 'type', type: 'selection',
                    selection: [ccOS.Popup.VALUE_TYPE_OSD, ccOS.Popup.VALUE_TYPE_TOAST, ccOS.Popup.VALUE_TYPE_CONFIRM],
                    initSetInput: true
                },
                { name: 'title', type: 'text' },
                { name: 'text', type: 'text' },
                {
                    name: 'status', type: 'custom',
                    createCustomSetBtn: (instance) => {
                        const divBox = FormSet.createDiv();
                        const btnShow = FormSet.createButton({ innerText: 'show' });
                        const btnHide = FormSet.createButton({ innerText: 'hide' });
                        divBox.appendChild(btnShow);
                        divBox.appendChild(btnHide);
                        btnShow.onclick = () => { instance && instance.show(); };
                        btnHide.onclick = () => { instance && instance.hide(); };
                        return divBox;
                    }
                },
                { name: 'result', type: 'text', hasSet: false },
                { name: 'confirmTextOk', type: 'text' },
                { name: 'confirmTextCancel', type: 'text' }
            ];
            new TestForm({ instance: popup, properties, parentElement: box });
        }).catch(e => {
            console.warn(e);
            setAlert(e);
        });
    };
    return box;
}
function createSetupHMIBox() {
    const box = createBox('setupHMI');
    const btnGetInstance = FormSet.createButton({ innerText: 'getInstance', className: 'm5' });
    box.appendChild(btnGetInstance);
    const setAlert = FormSet.cbSetAlert(box);
    // usage of ccOS 'SetupHMI'  [[
    if (!ccOS.SetupHMI) {
        setAlert('ccOS.SetupHMI undefined');
    }
    const getInstance = () => {
        var _a;
        setAlert('');
        (_a = ccOS.SetupHMI) === null || _a === void 0 ? void 0 : _a.getInstance({ _debugOptions: { logLevel: ccOS.Logger.TRACE, output: globalLogger } }).then(instance => {
            instance.applyDebugOptions({ logLevel: ccOS.Logger.TRACE, output: globalLogger });
            btnGetInstance.disabled = true;
            const methods = [
                { name: 'launchDeviceConnectionScene' }
            ];
            const properties = [
                { name: 'state', type: 'text', hasSet: false, hasGet: false },
            ];
            new TestForm({
                instance, properties, methods, parentElement: box,
                onDestroy: () => {
                    btnGetInstance.disabled = false;
                }
            });
        }).catch(e => {
            log('failed to get instance:', e);
            setAlert(e);
        });
    };
    btnGetInstance.onclick = getInstance;
    // getInstance();
    // ]] usage of ccOS 'SetupHMI'
    return box;
}
function createNavigationBox() {
    const box = createBox('navigation');
    const btnGetInstance = FormSet.createButton({ innerText: 'getInstance', className: 'm5' });
    box.appendChild(btnGetInstance);
    const setAlert = FormSet.cbSetAlert(box);
    // usage of ccOS 'Navigation'  [[
    if (!ccOS.Navigation) {
        setAlert('ccOS.Navigation undefined');
    }
    const getInstance = () => {
        var _a;
        setAlert('');
        (_a = ccOS.Navigation) === null || _a === void 0 ? void 0 : _a.getInstance({ _debugOptions: { logLevel: ccOS.Logger.TRACE, output: globalLogger } }).then(instance => {
            instance.applyDebugOptions({ logLevel: ccOS.Logger.TRACE, output: globalLogger });
            btnGetInstance.disabled = true;
            const methods = [
                { name: 'launchMainScene' },
                { name: 'launchPrevDestinationScene' },
                {
                    name: 'launchSearchResultScene',
                    arguments: [
                        { name: 'keyword', type: 'text', option: { placeholder: 'keyword' } }
                    ]
                }
            ];
            const properties = [
                { name: 'state', type: 'text', hasSet: false, hasGet: false },
            ];
            new TestForm({
                instance, properties, methods, parentElement: box,
                onDestroy: () => {
                    btnGetInstance.disabled = false;
                }
            });
        }).catch(e => {
            log('failed to get instance:', e);
            setAlert(e);
        });
    };
    btnGetInstance.onclick = getInstance;
    // getInstance();
    // ]] usage of ccOS 'Navigation'
    return box;
}
function createBluetoothBox() {
    const box = createBox('bluetooth');
    const bluetoothTestBox = FormSet.createDiv({ id: 'bluetoothTestBox', className: 'm5' });
    const btnGetInstance = FormSet.createButton({ innerText: 'getInstance', className: 'm5' });
    box.appendChild(btnGetInstance);
    box.appendChild(bluetoothTestBox);
    const setAlert = FormSet.cbSetAlert(box);
    // usage of ccOS 'Bluetooth'  [[
    if (!ccOS.Bluetooth) {
        setAlert('ccOS.Bluetooth undefined');
    }
    const getInstance = () => {
        var _a;
        setAlert('');
        (_a = ccOS.Bluetooth) === null || _a === void 0 ? void 0 : _a.getInstance({ _debugOptions: { logLevel: ccOS.Logger.TRACE, output: globalLogger } }).then(instance => {
            btnGetInstance.disabled = true;
            const properties = [{
                    name: 'bleDevices',
                    type: 'text',
                    inputType: 'object',
                    hasSet: false
                },
                {
                    name: 'bleScanStatus', type: 'custom',
                    hasGet: false,
                    createCustomSetBtn: (instance) => {
                        const divBox = FormSet.createDiv();
                        const btnScan = FormSet.createButton({ innerText: 'bleScan' });
                        divBox.appendChild(btnScan);
                        btnScan.onclick = () => { instance && instance.bleScan(); };
                        return divBox;
                    }
                }
            ];
            new TestForm({
                instance, properties, parentElement: box,
                onDestroy: () => {
                    btnGetInstance.disabled = false;
                }
            });
        }).catch(e => {
            log('failed to get instance:', e);
            setAlert(e);
        });
    };
    btnGetInstance.onclick = getInstance;
    // getInstance();
    // ]] usage of ccOS 'Bluetooth'
    return box;
}
function createTextToSpeechBox() {
    const box = createBox('textToSpeech');
    const voiceRecognizerTestBox = FormSet.createDiv({ id: 'textToSpeechTestBox', className: 'm5' });
    const btnGetInstance = FormSet.createButton({ innerText: 'getInstance', className: 'm5' });
    box.appendChild(btnGetInstance);
    box.appendChild(voiceRecognizerTestBox);
    const setAlert = FormSet.cbSetAlert(box);
    // usage of ccOS 'textToSpeech'  [[
    if (!ccOS.TextToSpeech) {
        setAlert('ccOS.TextToSpeech undefined');
    }
    const getInstance = () => {
        var _a;
        setAlert('');
        (_a = ccOS.TextToSpeech) === null || _a === void 0 ? void 0 : _a.getInstance({ _debugOptions: { logLevel: ccOS.Logger.TRACE, output: globalLogger } }).then(instance => {
            btnGetInstance.disabled = true;
            const properties = [
                { name: 'state', type: 'text', hasSet: false, hasGet: false },
                {
                    name: 'voiceStyle', type: 'selection',
                    selection: [
                        ccOS.TextToSpeech.VALUE_VOICE_STAYLE_STYLE_0,
                        ccOS.TextToSpeech.VALUE_VOICE_STAYLE_STYLE_1,
                        ccOS.TextToSpeech.VALUE_VOICE_STAYLE_STYLE_2,
                        ccOS.TextToSpeech.VALUE_VOICE_STAYLE_STYLE_3,
                        ccOS.TextToSpeech.VALUE_VOICE_STAYLE_STYLE_4,
                        ccOS.TextToSpeech.VALUE_VOICE_STAYLE_STYLE_5,
                        ccOS.TextToSpeech.VALUE_VOICE_STAYLE_STYLE_6,
                        ccOS.TextToSpeech.VALUE_VOICE_STAYLE_STYLE_7,
                        ccOS.TextToSpeech.VALUE_VOICE_STAYLE_STYLE_8,
                        ccOS.TextToSpeech.VALUE_VOICE_STAYLE_STYLE_9,
                        ccOS.TextToSpeech.VALUE_VOICE_STAYLE_DEFAULT,
                        ccOS.TextToSpeech.VALUE_VOICE_STAYLE_KR_KO_FEMALE,
                        ccOS.TextToSpeech.VALUE_VOICE_STAYLE_KR_KO_MALE
                    ]
                },
                {
                    name: 'action', type: 'custom',
                    createCustomSetBtn: (instance) => {
                        const actionDivBox = FormSet.createDiv();
                        const inputText = FormSet.createElement('input', Object.assign({
                            type: 'text', className: 'text', value: '말씀하세요'
                        }));
                        const beepTypes = ccOS.TextToSpeech.COLLECTION_VALUE_BEEP_TYPE;
                        const contentTypes = ccOS.TextToSpeech.COLLECTION_VALUE_CONTENT_TYPE;
                        const radioBeepType = FormSet.createRadio(beepTypes, 'beepTypes');
                        const radioContentType = FormSet.createRadio(contentTypes, 'contentTypes');
                        const playEarconDivBox = FormSet.createDiv({ className: 'flexBox p2' });
                        const btnPlayEarcon = FormSet.createButton({ innerText: 'playEarcon' });
                        const speakDivBox = FormSet.createDiv({ className: 'flexBox p2' });
                        const btnSpeak = FormSet.createButton({ innerText: 'speak' });
                        const btnStop = FormSet.createButton({ innerText: 'stop' });
                        const btn_100 = FormSet.createButton({ innerText: '100byte' });
                        const btn_300 = FormSet.createButton({ innerText: '300byte' });
                        const btn_500 = FormSet.createButton({ innerText: '500byte' });
                        const btn_1000 = FormSet.createButton({ innerText: '1000byte' });
                        const btn_2000 = FormSet.createButton({ innerText: '2000byte' });
                        const btn_3000 = FormSet.createButton({ innerText: '3000byte' });
                        const btn_ko100 = FormSet.createButton({ innerText: '한글 100byte' });
                        const btn_ko300 = FormSet.createButton({ innerText: '한글 300byte' });
                        const btn_ko500 = FormSet.createButton({ innerText: '한글 500byte' });
                        const btn_ko1000 = FormSet.createButton({ innerText: '한글 1000byte' });
                        const btn_ko1500 = FormSet.createButton({ innerText: '한글 1500byte' });
                        const btn_ko2000 = FormSet.createButton({ innerText: '한글 2000byte' });
                        const btn_ko3000 = FormSet.createButton({ innerText: '한글 3000byte' });
                        playEarconDivBox.appendChild(btnPlayEarcon);
                        playEarconDivBox.appendChild(radioBeepType);
                        actionDivBox.appendChild(playEarconDivBox);
                        speakDivBox.appendChild(btnSpeak);
                        speakDivBox.appendChild(inputText);
                        speakDivBox.appendChild(radioContentType);
                        actionDivBox.appendChild(speakDivBox);
                        actionDivBox.appendChild(btnStop);
                        actionDivBox.appendChild(btn_100);
                        actionDivBox.appendChild(btn_300);
                        actionDivBox.appendChild(btn_500);
                        actionDivBox.appendChild(btn_1000);
                        actionDivBox.appendChild(btn_2000);
                        actionDivBox.appendChild(btn_3000);
                        actionDivBox.appendChild(btn_ko100);
                        actionDivBox.appendChild(btn_ko300);
                        actionDivBox.appendChild(btn_ko500);
                        actionDivBox.appendChild(btn_ko1000);
                        actionDivBox.appendChild(btn_ko1500);
                        actionDivBox.appendChild(btn_ko2000);
                        actionDivBox.appendChild(btn_ko3000);
                        btnPlayEarcon.onclick = (evt) => {
                            const checkedOpt = evt.target.parentElement.querySelector('input[type="radio"]:checked');
                            const beepType = checkedOpt.value;
                            instance && instance.playEarcon(beepType);
                        };
                        btnSpeak.onclick = (evt) => {
                            const checkedOpt = evt.target.parentElement.querySelector('input[type="radio"]:checked');
                            const contentType = checkedOpt.value;
                            const inputEleText = evt.target.parentElement.querySelector('.text');
                            const text = inputEleText.value;
                            instance && instance.speak(text, contentType);
                        };
                        btnStop.onclick = () => { instance && instance.stop(); };
                        const getUtf8Length = function (str) {
                            let bts, ii, chr; // 한글 3byte
                            for (bts = ii = 0; (chr = str.charCodeAt(ii++)); bts += chr >> 11 ? 3 : chr >> 7 ? 2 : 1)
                                ;
                            return bts;
                        };
                        const getTextLength = function (str) {
                            let len = 0;
                            for (let i = 0; i < str.length; i++) {
                                if (escape(str.charAt(i)).length == 6) {
                                    len++;
                                }
                                len++;
                            }
                            return len;
                        };
                        btn_100.onclick = () => {
                            // 123 자
                            const text = "In the quiet woods, sunlight filtered through leaves, creating a tranquil scene. Nature's beauty whispered in every rustle.";
                            console.log(getTextLength(text));
                            instance && instance.speak(text);
                        };
                        btn_300.onclick = () => {
                            // 279 자
                            const text = "As dawn broke, painting the sky in hues of pink and orange, Sarah stood at the water's edge. The gentle waves whispered tales of adventure, urging her to embark on a journey into the unknown. With a heart full of anticipation, she set sail, guided by the promise of new horizons.";
                            console.log(getTextLength(text));
                            instance && instance.speak(text);
                        };
                        btn_500.onclick = () => {
                            // 615 자
                            const text = "Amidst the urban chaos, Ella found solace in her rooftop garden. The city's symphony of sirens was replaced by the rustling leaves. Each potted plant held a story, a small rebellion against the concrete jungle. Ella, a modern alchemist, nurtured life in the heart of steel and glass. Her sanctuary became a haven for tired souls, a reminder that amidst the relentless pace, pockets of serenity could be cultivated. The rooftop garden, an oasis in the sky, reflected Ella's belief that even in the midst of the bustling city, one could find refuge and create a space where nature and humanity harmoniously coexisted.";
                            console.log(getTextLength(text));
                            instance && instance.speak(text);
                        };
                        btn_1000.onclick = () => {
                            // 1012 자
                            const text = "In the quaint village of Eldridge, nestled between rolling hills and meandering streams, lived a woman named Clara. Her days were woven with threads of simplicity and grace. Clara was known for her time-honored bakery, a cozy haven where the aroma of freshly baked bread wafted through the air. \nEach morning, the village awakened to the warm embrace of Clara's baked delights. The villagers, young and old, would gather at Clara's bakery, not just for the delicious pastries but for the sense of community she fostered. The bakery became a communal hub, where laughter echoed alongside the clinking of coffee cups. \nClara's love for baking was more than a skill; it was a way of connecting with people. Her recipes, passed down through generations, carried a legacy of tradition and comfort. The secret ingredient, she believed, was the genuine joy infused into each creation. \nOne day, a renowned food critic visited Eldridge. Clara's quaint bakery caught his attention, and he decided to sample her offerings.";
                            console.log(getTextLength(text));
                            instance && instance.speak(text);
                        };
                        btn_2000.onclick = () => {
                            // 2024 자
                            const text = "In the heart of London, where history and modernity intertwine, lived a young architect named Oliver. His days were a blend of sketches and blueprints, as he navigated the city's architectural wonders. London, with its iconic landmarks and diverse neighborhoods, fueled Oliver's creative spirit.Oliver's latest project was a fusion of tradition and innovation—a contemporary art gallery nestled in the historic district of Kensington. The challenge was to seamlessly integrate modern design into the tapestry of Victorian architecture. As he sketched, visions of a structure that harmonized the old and the new danced across his imagination.Months of meticulous planning and collaboration followed. Oliver worked closely with local artisans, drawing inspiration from the intricate details of Kensington's Victorian mansions. The result was a masterpiece that paid homage to the past while embracing the future—a gallery with a façade adorned in ornate ironwork, yet with sleek glass panels that reflected the city's skyline.The opening night was a celebration of artistic vision and architectural brilliance. The gallery's walls adorned with avant-garde paintings, it became a beacon for art enthusiasts. The fusion of historical charm and contemporary elegance resonated with the city's soul, earning the gallery a place among London's cultural gems.Beyond the realm of architecture, Oliver found inspiration in London's cultural diversity. He frequented the vibrant markets of Camden, where eclectic stalls offered a kaleidoscope of global flavors. From the historic theaters of the West End to the serene parks like Hyde Park, every corner of the city contributed to Oliver's evolving artistic palette.As seasons changed, so did London's allure. Spring brought a carpet of blossoms in Regent's Park, while autumn painted Hampstead Heath in warm hues. Oliver's sketches mirrored the city's metamorphosis, capturing the essence of each neighborhood's unique character.London's river, the Thames, became a muse for Oliver.";
                            console.log(getTextLength(text));
                            instance && instance.speak(text);
                        };
                        btn_3000.onclick = () => {
                            // 3004 자
                            const text = "In the bustling city of New York, where the vibrant energy of the streets meets the towering skyscrapers that scrape the sky, a young artist named Emily found her inspiration. Born and raised in Brooklyn, Emily always had a deep connection to the city that never sleeps. Her days were filled with exploring hidden gems in Central Park, sketching the diverse faces in the subway, and capturing the essence of the city's pulse in her artwork.\n As an aspiring painter, Emily spent countless hours in her cozy studio apartment overlooking the Brooklyn Bridge. The walls adorned with her canvases, each telling a unique story of the city's spirit. Her favorite subject was the skyline at sunset, where the warm hues painted the buildings in a golden glow, creating a breathtaking backdrop for her creations.\n One fateful day, Emily received a letter inviting her to showcase her art in a prestigious gallery in Chelsea. The excitement and nervousness intertwined as she prepared her best pieces for the exhibition. This opportunity was a dream come true for Emily, a validation of her passion and dedication to her craft. As the opening night approached, the anticipation grew, and Emily couldn't help but reflect on her journey as an artist.\n The gallery buzzed with people from all walks of life on the night of the exhibition. Emily's heart raced as she watched attendees admire and analyze her paintings. Among the crowd, art enthusiasts, critics, and potential buyers mingled, creating an electric atmosphere. The positive feedback from viewers fueled Emily's confidence, and she found herself engaged in deep conversations about her artistic process and the inspiration behind each piece.\n The night turned into a turning point for Emily's career. Not only did she sell several paintings, but she also received commissions for custom pieces. The exposure from the gallery catapulted her into the spotlight, and soon, her artwork adorned the walls of art lovers around the world. Emily's story became an inspiration for aspiring artists, a testament to the transformative power of passion and perseverance.\n As Emily continued to evolve as an artist, she never forgot her roots in the vibrant city that ignited her creativity. Her paintings continued to reflect the ever-changing landscape of New York, capturing the essence of its people, culture, and architecture. In the midst of success, Emily remained humble, attributing her achievements to the city that shaped her identity as an artist.\n In the end, Emily's journey was not just about the strokes of her brush on canvas; it was a celebration of resilience, creativity, and the profound connection between an artist and the city that inspired her to reach new heights. And as the sun set over the New York skyline, Emily stood on her studio balcony, grateful for the journey that led her to this moment – a moment where her art spoke louder than words in the city that never ceased to inspire.Sunset painted the sky; waves whispered on the shore.";
                            console.log(getTextLength(text));
                            instance && instance.speak(text);
                        };
                        btn_ko100.onclick = () => {
                            // 98 byte
                            const text = "세심한 예술가 지은은 작업실에서 창의적인 미술작품을 창조하고 있었다.";
                            console.log(getUtf8Length(text));
                            instance && instance.speak(text);
                        };
                        btn_ko300.onclick = () => {
                            // 300 byte
                            const text = "서울의 한복판에서, 세심한 예술가 지은은 작업실에서 창의적인 미술작품을 창조하고 있었다. 그녀는 도시의 소음과 혼잡 속에서도 자신만의 평화로운 세계를 창조하며 예술에 대한 열정을 살렸다. 그랬었다고 누가 했다 한다.";
                            console.log(getUtf8Length(text));
                            instance && instance.speak(text);
                        };
                        btn_ko500.onclick = () => {
                            // 500 byte
                            const text = "서울의 한복판에서, 세심한 예술가 지은은 작업실에서 창의적인 미술작품을 창조하고 있었다. 그녀는 도시의 소음과 혼잡 속에서도 자신만의 평화로운 세계를 창조하며 예술에 대한 열정을 살렸다. 지은의 작품은 도시의 복잡성과 대조되는 아름다움을 담아내어 많은 이들에게 감동을 전하고 있었다.봄에는 색다른 풍경을 만들어내는 튤립과 수선화가 피어났었다. 그렇다한다.";
                            console.log(getUtf8Length(text));
                            instance && instance.speak(text);
                        };
                        btn_ko1000.onclick = () => {
                            // 998 byte
                            const text = "한 평화로운 마을인 청산리에 살고 있는 여성 지은은, 오래 전부터 그리워하던 정원을 가꾸기로 결심했다. 지은은 어린 시절 할머니로부터 전해진 신비로운 식물들에 대한 이야기를 항상 기억하고 있었다. 그녀는 아침이면 마을의 사람들에게 신선한 채소를 나누어 주고, 오후에는 자신의 정원에서 평온한 시간을 보내곤 했다. 계절이 변할 때마다 정원의 풍경도 변화했다. 봄에는 색다른 풍경을 만들어내는 튤립과 수선화가 피어났고, 여름에는 장미와 부드러운 향기가 공중을 가득 메웠다. 가을에는 단풍이 내리면서 정원은 주홍과 주황빛으로 물들었고, 겨울에는 정원에 흰 눈이 내려 평화로운 풍경을 만들어냈다.어느 날, 지은은 정원에서 이상한 씨앗을 발견했다. 그 씨앗은 이국적인 빛을 띠고 있었고, 주위에 신비한 분위기가 느껴졌다. 그렇다네.";
                            console.log(getUtf8Length(text));
                            instance && instance.speak(text);
                        };
                        btn_ko1500.onclick = () => {
                            // 1499 byte
                            const text = "한 평화로운 마을인 청산리에 살고 있는 여성 지은은, 오래 전부터 그리워하던 정원을 가꾸기로 결심했다. 지은은 어린 시절 할머니로부터 전해진 신비로운 식물들에 대한 이야기를 항상 기억하고 있었다. 그녀는 아침이면 마을의 사람들에게 신선한 채소를 나누어 주고, 오후에는 자신의 정원에서 평온한 시간을 보내곤 했다. 계절이 변할 때마다 정원의 풍경도 변화했다. 봄에는 색다른 풍경을 만들어내는 튤립과 수선화가 피어났고, 여름에는 장미와 부드러운 향기가 공중을 가득 메웠다. 가을에는 단풍이 내리면서 정원은 주홍과 주황빛으로 물들었고, 겨울에는 정원에 흰 눈이 내려 평화로운 풍경을 만들어냈다.어느 날, 지은은 정원에서 이상한 씨앗을 발견했다. 그 씨앗은 이국적인 빛을 띠고 있었고, 주위에 신비한 분위기가 느껴졌다. 호기심에 휩싸인 그녀는 특별한 구역에 그 씨앗을 심었고, 그것이 자라나면서 지은이 본 적이 없는 식물이 피어났다. 그 식물의 잎은 빛나는 무늬를 지니고 있었고, 꽃은 아름다운 색의 연속으로 피어났다.이 신비로운 식물의 소식은 빠르게 퍼져, 식물학자들과 과학자들이 찾아왔다. 지은은 정원이 탐험과 발견의 중심지로 변하면서, 그 곳은 마치 작은 식물 연구소가 된 것처럼 번영했다.";
                            console.log(getUtf8Length(text));
                            instance && instance.speak(text);
                        };
                        btn_ko2000.onclick = () => {
                            // 2000 byte
                            const text = "한 평화로운 마을인 청산리에 살고 있는 여성 지은은, 오래 전부터 그리워하던 정원을 가꾸기로 결심했다. 지은은 어린 시절 할머니로부터 전해진 신비로운 식물들에 대한 이야기를 항상 기억하고 있었다. 그녀는 아침이면 마을의 사람들에게 신선한 채소를 나누어 주고, 오후에는 자신의 정원에서 평온한 시간을 보내곤 했다. 계절이 변할 때마다 정원의 풍경도 변화했다. 봄에는 색다른 풍경을 만들어내는 튤립과 수선화가 피어났고, 여름에는 장미와 부드러운 향기가 공중을 가득 메웠다. 가을에는 단풍이 내리면서 정원은 주홍과 주황빛으로 물들었고, 겨울에는 정원에 흰 눈이 내려 평화로운 풍경을 만들어냈다.어느 날, 지은은 정원에서 이상한 씨앗을 발견했다. 그 씨앗은 이국적인 빛을 띠고 있었고, 주위에 신비한 분위기가 느껴졌다. 호기심에 휩싸인 그녀는 특별한 구역에 그 씨앗을 심었고, 그것이 자라나면서 지은이 본 적이 없는 식물이 피어났다. 그 식물의 잎은 빛나는 무늬를 지니고 있었고, 꽃은 아름다운 색의 연속으로 피어났다.이 신비로운 식물의 소식은 빠르게 퍼져, 식물학자들과 과학자들이 찾아왔다. 지은은 자신의 정원이 탐험과 발견의 중심지로 변하면서, 그 곳은 마치 작은 식물 연구소가 된 것처럼 번영했다. 그런 가운데, 지은은 정원을 보호하면서도 특별한 식물의 비밀을 풀고자 했다. 그녀는 전문가들과 협력하고 연구에 참여하여 자신이 발견한 식물의 기원을 파헤쳤다. 최종적으로, 그 식물의 기원은 알 수 없는 미스터리로 남았지만, 그것의 영향력은 부정할 수 없었다. 청산리는 한때는 조용한 곳이었지만, 이제는 자연애호가와 식물 연구자들이 모여드는 명소가 되었다.";
                            console.log(getUtf8Length(text));
                            instance && instance.speak(text);
                        };
                        btn_ko3000.onclick = () => {
                            // 2999 byte
                            const text = "한 평화로운 마을인 청산리에 살고 있는 여성 지은은, 오래 전부터 그리워하던 정원을 가꾸기로 결심했다. 지은은 어린 시절 할머니로부터 전해진 신비로운 식물들에 대한 이야기를 항상 기억하고 있었다. 그녀는 아침이면 마을의 사람들에게 신선한 채소를 나누어 주고, 오후에는 자신의 정원에서 평온한 시간을 보내곤 했다. 계절이 변할 때마다 정원의 풍경도 변화했다. 봄에는 색다른 풍경을 만들어내는 튤립과 수선화가 피어났고, 여름에는 장미와 부드러운 향기가 공중을 가득 메웠다. 가을에는 단풍이 내리면서 정원은 주홍과 주황빛으로 물들었고, 겨울에는 정원에 흰 눈이 내려 평화로운 풍경을 만들어냈다.어느 날, 지은은 정원에서 이상한 씨앗을 발견했다. 그 씨앗은 이국적인 빛을 띠고 있었고, 주위에 신비한 분위기가 느껴졌다. 호기심에 휩싸인 그녀는 특별한 구역에 그 씨앗을 심었고, 그것이 자라나면서 지은이 본 적이 없는 식물이 피어났다. 그 식물의 잎은 빛나는 무늬를 지니고 있었고, 꽃은 아름다운 색의 연속으로 피어났다.이 신비로운 식물의 소식은 빠르게 퍼져, 식물학자들과 과학자들이 찾아왔다. 지은은 자신의 정원이 탐험과 발견의 중심지로 변하면서, 그 곳은 마치 작은 식물 연구소가 된 것처럼 번영했다. 그런 가운데, 지은은 정원을 보호하면서도 특별한 식물의 비밀을 풀고자 했다. 그녀는 전문가들과 협력하고 연구에 참여하여 자신이 발견한 식물의 기원을 파헤쳤다. 최종적으로, 그 식물의 기원은 알 수 없는 미스터리로 남았지만, 그것의 영향력은 부정할 수 없었다. 청산리는 한때는 조용한 곳이었지만, 이제는 자연 애호가들과 식물 연구자들이 모여드는 명소가 되었다. 지은의 정원은 전 세계의 예술 애호가들에게 알려지게 되었고, 그녀의 이야기는 열정과 끈질긴 노력이 어떻게 예술과 자연이 하나로 어우러져 새로운 높이를 창조할 수 있는지를 보여주는 훌륭한 사례가 되었다. 청산리의 정원은 지은이 예술과 자연의 조화를 찾아가는 여정의 일환으로 남았다.청산리의 정원은 지은이 예술과 자연의 조화를 찾아가는 여정의 일환으로 남았다. 그녀의 놀라운 발견은 마을을 넘어 예술과 과학의 교감지점이 되어, 작은 곳에서 큰 영향을 미치는 힘을 보여 주었다.청산리의 정원은 지은이 예술과 자연의 조화를 찾아가는 여정의 일환으로 남았다. 그녀의 놀라운 발견은 마을을 넘어 예술과 과학의 교감지점이 되어, 작은 곳에서 큰 영향을 미치는 힘을 보여 주었다. 그랬었다고 했다고 한다. 그랬다라고 누가 했다 한다.";
                            console.log(getUtf8Length(text));
                            instance && instance.speak(text);
                        };
                        return actionDivBox;
                    }, hasGet: false
                },
            ];
            new TestForm({
                instance, properties, parentElement: box,
                onDestroy: () => {
                    btnGetInstance.disabled = false;
                }
            });
        }).catch(e => {
            log('failed to get instance:', e);
            setAlert(e);
        });
    };
    btnGetInstance.onclick = getInstance;
    // getInstance();
    // ]] usage of ccOS 'textToSpeech'
    return box;
}
function createVoiceRecognizerBox() {
    const box = createBox('voiceRecognizer');
    const voiceRecognizerTestBox = FormSet.createDiv({ id: 'voiceRecognizerTestBox', className: 'm5' });
    const btnGetInstance = FormSet.createButton({ innerText: 'getInstance', className: 'm5' });
    box.appendChild(btnGetInstance);
    box.appendChild(voiceRecognizerTestBox);
    const setAlert = FormSet.cbSetAlert(box);
    // usage of ccOS 'voiceRecognizer'  [[
    if (!ccOS.VoiceRecognizer) {
        setAlert('ccOS.VoiceRecognizer undefined');
    }
    const getInstance = () => {
        var _a;
        setAlert('');
        (_a = ccOS.VoiceRecognizer) === null || _a === void 0 ? void 0 : _a.getInstance({ _debugOptions: { logLevel: ccOS.Logger.TRACE, output: globalLogger } }).then(instance => {
            btnGetInstance.disabled = true;
            const properties = [
                { name: 'state', type: 'text', hasSet: false, hasGet: false },
                {
                    name: 'result',
                    type: 'json', hasSet: false, hasGet: false
                },
                {
                    name: 'partialResult',
                    type: 'json', hasSet: false, hasGet: false
                },
                {
                    name: 'errorString',
                    type: 'text', hasSet: false, hasGet: true
                },
                {
                    name: 'action', type: 'custom',
                    createCustomSetBtn: (instance) => {
                        const divBox = FormSet.createDiv();
                        const btnStart = FormSet.createButton({ innerText: 'start' });
                        const btnStop = FormSet.createButton({ innerText: 'stop' });
                        divBox.appendChild(btnStart);
                        divBox.appendChild(btnStop);
                        btnStart.onclick = () => {
                            instance && instance.start();
                        };
                        btnStop.onclick = () => {
                            instance && instance.stop();
                        };
                        return divBox;
                    }, hasGet: false
                },
            ];
            new TestForm({
                instance, properties, parentElement: box,
                onDestroy: () => {
                    btnGetInstance.disabled = false;
                }
            });
        }).catch(e => {
            log('failed to get instance:', e);
            setAlert(e);
        });
    };
    btnGetInstance.onclick = getInstance;
    // getInstance();
    // ]] usage of ccOS 'voiceRecognizer'
    return box;
}
// function updateProp(prop: string, value: string, box: HTMLElement) {
//   const stateValue = box.querySelector(`#${prop}value`);
//   (stateValue as HTMLElement).innerText = typeof value === "object" ? JSON.stringify(value, null, 2) : value;
// }
// function createPropertyBox(id: string, propVal = '') {
//   const box = FormSet.createDiv( {id});
//   const name = FormSet.createElement('span', {innerText: id + ':'});
//   const value = FormSet.createElement('span', {id: id + 'value', innerText: propVal});
//   box.appendChild(name);
//   box.appendChild(value);
//   return box;
// }
function createBox(id) {
    const box = FormSet.createDiv({ id, className: 'solid m10 p10' });
    box.innerHTML = '<b>' + id + '</b>';
    return box;
}
class FormSet {
}
FormSet.toUpperCaseOfFirst = str => str.replace(/./, v => v.toUpperCase());
/**
 *
 * @param options {target, setInstance, getInitData, setAlert} {target{ccOS.WebResource}, setTarget{function}, getInitData{function}, setAlert{function}}
 * @returns HTMLButtonElement
 */
FormSet.createGetInstanceBtn = (options) => {
    const { target, setInstance, getInitData, setAlert } = Object.assign({
        target: null, setInstance: undefined, getInitData: () => ({}), setAlert: undefined
    }, options);
    const btnGetInstance = FormSet.createButton({ innerHTML: 'getInstance' });
    btnGetInstance.onclick = () => {
        const initData = (getInitData && getInitData()) || {};
        target === null || target === void 0 ? void 0 : target['getInstance'](initData).then(setInstance).catch(e => {
            console.warn(e);
            setAlert && setAlert(e);
        });
    };
    return btnGetInstance;
};
FormSet.createElement = (name, options = {}) => Object.assign(document.createElement(name), options);
FormSet.createDiv = (options = {}) => Object.assign(document.createElement("div"), options);
FormSet.createButton = (options = {}) => Object.assign(document.createElement("button"), options);
/**
 * Returns span.alert html tag containing str as a string.
 * like `<span class="alert">${str.toString()}</span>`
 * @param str {string|Error} alert phrases
 * @param color {string|undefined} alert text color(default:'red')
 */
FormSet.alertSpan = (str, color = 'red') => `<span class="alert" style="color: ${color}">${str.toString()}</span>`;
/**
 * Returns callback to set alert string and color in label
 * @param box{HTMLElement|null} parent element of label
 * @param lbl{HTMLElement|null|undefined} target to apply alertSpan
 * @param options{Object|undefined} color{string}: alert text color(default:'red')
 * @returns function (str:string, color:string|undefined) : void
 * @example
 * const cb = FormSet.cbSetAlert(box, label);
 * cb('test', 'blue');
 * FormSet.cbSetAlert(box);
 * const cb2 = * FormSet.cbSetAlert(box, null, {color:'blue'});
 * cb2('notification!!', 'red');
 * FormSet.cbSetAlert(null, label);
 */
FormSet.cbSetAlert = (box = null, lbl = null, options = {}) => {
    const { color } = Object.assign({ color: 'red' }, options);
    const lblAlert = lbl || FormSet.createElement('label');
    if (box)
        box.appendChild(lblAlert);
    return (str, pColor = color) => lblAlert && (lblAlert.innerHTML = FormSet.alertSpan(str, pColor));
};
FormSet.InputType = { object: 'object', string: 'string', number: 'number', boolean: 'boolean' };
FormSet.nameOfSetFunc = name => `set${name.replace(/./, v => v.toUpperCase())}`;
/**
 * Returns a div HTMLElement that has an HTMLInputElement whose type is text as a child.
 * @param selection {string[]} string array for selection
 * @param name {string} element representative name
 * @param options {{checkedIndex, coverClass, optClass}} options for radio element
 * (checkedIndex: checked index, coverClass: className of cover element, optClass: className of options element)
 */
FormSet.createRadio = function (selection, name, options = {}) {
    const { checkedIndex, optClass, coverClass } = Object.assign({ checkedIndex: 0, optClass: '', coverClass: '' }, options);
    let rndOpt;
    const rndName = parseInt(Math.random() * 1000 + "");
    const radioOptId = (option) => `radio_${rndOpt}_${name}_${option}`;
    const radioName = `radio_${rndName}_${name}`;
    const divCtx = FormSet.createDiv({ name, className: coverClass });
    const createRadioOption = (option, props = {}) => FormSet.createElement('input', Object.assign({ type: 'radio', name: radioName, id: radioOptId(option), value: option, innerText: option, className: optClass }, props));
    const createOptionLabel = option => {
        const lbl = FormSet.createElement('label', { for: 'radio' + option + name, innerText: option, className: 'p5' });
        lbl.setAttribute('for', radioOptId(option));
        return lbl;
    };
    let checked = 0;
    selection.forEach(opt => {
        rndOpt = parseInt(Math.random() * 1000 + "");
        const radio = createRadioOption(opt, { checked: checkedIndex === checked++ });
        const lbl = createOptionLabel(opt);
        divCtx.appendChild(radio);
        divCtx.appendChild(lbl);
    });
    return divCtx;
};
/**
 * Returns a div HTMLElement that has an HTMLInputElement whose type is text as a child.
 * @param propName
 * @param options {placeholder, value, coverClass, textClass}
 */
FormSet.createText = function (propName, options = {}) {
    const { placeholder, value, coverClass, textClass, inputType } = Object.assign({ placeholder: propName, value: '', textClass: '', coverClass: '', inputType: 'text' }, options);
    const divCtx = FormSet.createDiv({ className: coverClass });
    //const inputText = FormSet.createElement('input', {type: 'text', placeholder, value, className: textClass, ...options});
    const inputText = FormSet.createElement('input', Object.assign({ type: (inputType !== 'number' ? 'text' : 'number'), placeholder, value, className: textClass }, options));
    divCtx.appendChild(inputText);
    return divCtx;
};
/**
 * Returns button htmlElement to apply setXxx of instance
 * @param instance {ccOS.WebResource} instance call to setXxxx
 * @param propName {string} property name
 * @param options {{form, inputType}}
 * form {string} - form type like text, radio
 * inputType {string} - object|string property type
 * @example
 * const setBtn = FormSet.createSetBtn(vsm, 'value', {form:'text', inputType: 'object'});
 */
FormSet.createSetBtn = function (instance, propName, options = {}) {
    const funcName = FormSet.nameOfSetFunc(propName);
    const btnSet = FormSet.createButton({ innerText: funcName, className: 'm2' });
    const { inputType, form } = Object.assign({ form: 'text', inputType: FormSet.InputType.string }, options);
    const createClickHandler = (instance, name, form) => evt => {
        const parent = evt.target.parentElement;
        let value;
        const displayErr = e => {
            console.warn(e.toString());
            btnSet.innerHTML = `${funcName}<span class="alert">${e.toString()}</span>`;
        };
        if (form === 'radio') {
            const checkedOpt = parent.querySelector(`input[type="radio"]:checked`);
            value = checkedOpt.value;
            if (inputType === 'boolean') {
                value = (value === 'true');
            }
            else if (inputType === 'number') {
                try {
                    value = parseFloat(value);
                }
                catch (e) {
                    console.warn(e);
                }
            }
        }
        if (form === 'json') {
            const txtEle = parent.querySelectorAll(`input`);
            value = {};
            txtEle.forEach(item => {
                if (item.type === 'number') {
                    try {
                        value[item.placeholder] = parseFloat(item.value);
                    }
                    catch (e) {
                        console.warn(e);
                    }
                }
                else {
                    value[item.placeholder] = item.value;
                }
            });
        }
        if (form === 'text') {
            const txtEle = parent.querySelector(`input`);
            value = txtEle.value;
            try {
                if (inputType === 'object')
                    value = JSON.parse(value);
                else if (txtEle.type === 'number')
                    value = parseFloat(value);
            }
            catch (e) {
                return displayErr(e);
            }
        }
        try {
            if (value !== undefined)
                instance[funcName](value);
        }
        catch (e) {
            return displayErr(e);
        }
        btnSet.innerHTML = `${funcName}`;
    };
    btnSet.onclick = createClickHandler(instance, propName, form);
    return btnSet;
};
var testType;
(function (testType) {
    testType["text"] = "text";
    testType["custom"] = "custom";
    testType["selection"] = "selection";
    testType["json"] = "json";
})(testType || (testType = {}));
class TestForm {
    /**
     *
     * @param instance
     * @param properties
     * @param methods
     * @param parentElement
     * @param options
     * @param onDestroy
     */
    constructor({ instance, properties, methods = [], parentElement, options = {}, onDestroy = undefined }) {
        this._beautify = false;
        this._instance = instance;
        this._options = options;
        this._parentElement = parentElement;
        this._properties = properties;
        this._methods = methods;
        this._handleDestroy = onDestroy;
        this.createInstanceForm();
    }
    setProperty(propertyName, value) {
        var _a, _b;
        const fcName = `set${FormSet.toUpperCaseOfFirst(propertyName)}`;
        return (_b = (_a = this._instance) === null || _a === void 0 ? void 0 : _a[fcName]) === null || _b === void 0 ? void 0 : _b.call(_a, value);
    }
    getProperty(propertyName) {
        var _a, _b;
        const fcName = `get${FormSet.toUpperCaseOfFirst(propertyName)}`;
        return (_b = (_a = this._instance) === null || _a === void 0 ? void 0 : _a[fcName]) === null || _b === void 0 ? void 0 : _b.call(_a);
    }
    onClickBtnDestroy() {
        this._instance.destroy();
        this._handleDestroy && this._handleDestroy();
        this._parentElement.removeChild(this._instanceForm);
    }
    getBeautifyState() {
        return this._beautify ? 'uglify' : 'beautify';
    }
    onClickBtnBeautify(e) {
        this._beautify = !this._beautify;
        e.target.innerText = this.getBeautifyState();
    }
    onClickBtnClear() {
        this._txtAreaProp.value = '';
        this._txtAreaProp.scrollTop = this._txtAreaProp.scrollHeight;
    }
    onClickBtnGetProp(name) {
        this.addText({ [name]: this.getProperty(name) });
    }
    addText(data) {
        const txtAreaProp = this._txtAreaProp;
        const timestamp = new Date().toJSON();
        const str = JSON.stringify(Object.assign({ timestamp }, data), null, this._beautify ? 2 : 0);
        txtAreaProp.value += '\n' + str;
        txtAreaProp.scrollTop = txtAreaProp.scrollHeight;
    }
    createInstanceForm() {
        var _a, _b;
        const instanceForm = FormSet.createDiv({ className: 'm5 p2 solid instanceForm' });
        const headForm = FormSet.createDiv({ className: 'm5 head' });
        const btnDestroy = FormSet.createButton({ innerText: 'destroy' });
        const btnBeautify = FormSet.createButton({ innerText: this.getBeautifyState(), className: 'floatRight' });
        const btnClear = FormSet.createButton({ innerText: 'clear', className: 'floatRight' });
        const divTextareaForm = FormSet.createDiv({ className: 'flexBox wP100' });
        const txtAreaProp = FormSet.createElement('textarea', { className: 'm5 flex1', readOnly: true });
        this._instanceForm = instanceForm;
        this._txtAreaProp = txtAreaProp;
        const defaultPropertyOption = {
            name: '', type: '', selection: [], createCustomSetBtn: null, initSetInput: false, inputType: 'text',
            hasGet: true, hasSet: true, hasChangeEvent: true
        };
        const defaultProperties = [{ name: 'id' }, { name: 'uri' }];
        defaultProperties.forEach(info => {
            const { name } = Object.assign(Object.assign({}, defaultPropertyOption), info);
            const spanProp = FormSet.createElement('span', {
                innerHTML: `${name}: ${this.getProperty(name)}`,
                className: 'fontBolder mr5 p5'
            });
            if ('id' === name)
                instanceForm.setAttribute('data-id', this.getProperty(name));
            headForm.appendChild(spanProp);
        });
        headForm.appendChild(btnDestroy);
        headForm.appendChild(btnClear);
        headForm.appendChild(btnBeautify);
        divTextareaForm.appendChild(txtAreaProp);
        instanceForm.appendChild(headForm);
        instanceForm.appendChild(divTextareaForm);
        btnClear.onclick = this.onClickBtnClear.bind(this);
        btnBeautify.onclick = this.onClickBtnBeautify.bind(this);
        btnDestroy.onclick = this.onClickBtnDestroy.bind(this);
        this._parentElement.appendChild(instanceForm);
        defaultProperties.forEach(info => {
            const { name } = Object.assign(Object.assign({}, defaultPropertyOption), info);
            const btnGetProp = FormSet.createButton({ innerText: `get${FormSet.toUpperCaseOfFirst(name)}` });
            headForm.appendChild(btnGetProp);
            btnGetProp.onclick = () => this.onClickBtnGetProp(name);
        });
        (_a = this._properties) === null || _a === void 0 ? void 0 : _a.forEach(info => {
            let isAddedEventHandler = false;
            const { name, type, selection, createCustomSetBtn, initSetInput, inputType, hasSet, hasGet, hasChangeEvent } = Object.assign(Object.assign({}, defaultPropertyOption), info);
            const eventName = `${name.toLowerCase()}change`;
            const getEvtName = (isAdd = true) => `<span>${isAdd ? 'addEventListener' : 'removeEventListener'}:"${eventName}"</span>`;
            const eventHandler = (evt) => this.addText({ method: 'event', [name]: evt.detail[name] });
            const divProp = FormSet.createDiv({
                innerHTML: `<span class="fontBolder mr5">${name}</span>`,
                className: 'p5 prop'
            });
            const divBtnBox = FormSet.createDiv({ className: 'flexBox p2' });
            const btnGetProp = FormSet.createButton({ innerText: `get${FormSet.toUpperCaseOfFirst(name)}` });
            const btnToggleChangeEvent = FormSet.createButton({ innerHTML: getEvtName() });
            divProp.appendChild(divBtnBox);
            if (hasGet)
                divBtnBox.appendChild(btnGetProp);
            if (hasSet) {
                let inputEle;
                if (testType.custom && createCustomSetBtn) {
                    inputEle = createCustomSetBtn(this._instance);
                }
                else {
                    let btnSetProp;
                    switch (type) {
                        case testType.text: {
                            let value = this.getProperty(name);
                            const inputType = typeof value;
                            inputEle = FormSet.createText(name, { inputType });
                            inputEle.classList.add('setPropBox');
                            btnSetProp = FormSet.createSetBtn(this._instance, name, { inputType, form: 'text' });
                            if (initSetInput) {
                                if (inputType === FormSet.InputType.object) {
                                    try {
                                        value = JSON.stringify(value);
                                    }
                                    catch (e) {
                                        console.error(e);
                                    }
                                }
                                inputEle.firstChild.value = value;
                            }
                            break;
                        }
                        case testType.json: {
                            const buildInputsForJson = (parentBox, value) => {
                                for (const newName in value) {
                                    let newItem;
                                    if (typeof value[newName] !== 'object') {
                                        newItem = FormSet.createElement('div', {
                                            innerHTML: `${newName}:`,
                                            className: 'fontBolder mr5 p5'
                                        });
                                        // TODO: support radio for boolean
                                        const inputType = typeof value[newName];
                                        console.log('checking:', value[newName], inputType);
                                        const newInItem = FormSet.createText(newName, { inputType });
                                        initSetInput && (newInItem.firstChild["value"] = value[newName]);
                                        newItem.appendChild(newInItem);
                                    }
                                    else {
                                        newItem = FormSet.createDiv({
                                            innerHTML: `<span class="fontBolder mr5">${newName}</span>`,
                                            className: 'p5 prop'
                                        });
                                        buildInputsForJson(newItem, value[newName]);
                                    }
                                    parentBox.appendChild(newItem);
                                }
                                return;
                            };
                            inputEle = FormSet.createDiv({
                                innerHTML: `<div class="fontBolder mr5">${name}</div>`,
                                className: 'p5 prop'
                            });
                            buildInputsForJson(inputEle, this.getProperty(name));
                            btnSetProp = FormSet.createSetBtn(this._instance, name, { inputType, form: 'json' });
                            break;
                        }
                        case testType.selection: {
                            const radioOptions = {};
                            initSetInput && (radioOptions['checkedIndex'] = selection.findIndex(val => val === this.getProperty(name)));
                            inputEle = FormSet.createRadio(selection, name, radioOptions);
                            inputEle.classList.add('setPropBox');
                            btnSetProp = FormSet.createSetBtn(this._instance, name, { inputType: typeof this.getProperty(name), form: 'radio' });
                            break;
                        }
                    }
                    inputEle.appendChild(btnSetProp);
                }
                divBtnBox.appendChild(inputEle);
            }
            if (hasChangeEvent)
                divBtnBox.appendChild(btnToggleChangeEvent);
            instanceForm.appendChild(divProp);
            if (hasGet)
                btnGetProp.onclick = () => this.onClickBtnGetProp(name);
            if (hasChangeEvent)
                btnToggleChangeEvent.onclick = () => {
                    btnToggleChangeEvent.disabled = true;
                    if (isAddedEventHandler) {
                        this._instance.removeEventListener(eventName, eventHandler);
                        btnToggleChangeEvent.innerHTML = getEvtName();
                    }
                    else {
                        this._instance.addEventListener(eventName, eventHandler);
                        btnToggleChangeEvent.innerHTML = getEvtName(false);
                    }
                    isAddedEventHandler = !isAddedEventHandler;
                    btnToggleChangeEvent.disabled = false;
                };
        });
        const props = {};
        defaultProperties.concat(this._properties).forEach(({ name }) => props[name] = this.getProperty(name));
        this.addText(props);
        const defaultMethodOption = { name: '', arguments: [] };
        let divMethod;
        if (this._methods && this._methods.length > 0) {
            divMethod = FormSet.createDiv({
                innerHTML: `<span class="fontBolder mr5">method</span>`,
                className: 'p5 method'
            });
        }
        (_b = this._methods) === null || _b === void 0 ? void 0 : _b.forEach(info => {
            var _a;
            const { name } = Object.assign(Object.assign({}, defaultMethodOption), info);
            const divArgsBox = FormSet.createDiv({ className: 'p2' });
            const btnCall = FormSet.createButton({ innerText: `${name}` });
            divArgsBox.appendChild(btnCall);
            divMethod.appendChild(divArgsBox);
            (_a = info.arguments) === null || _a === void 0 ? void 0 : _a.forEach(argInfo => {
                const argName = argInfo.name;
                const argType = argInfo.type;
                let inputEle;
                switch (argType) {
                    case 'text':
                        inputEle = FormSet.createElement('input', { type: 'text', placeholder: argName });
                }
                if (inputEle)
                    divArgsBox.appendChild(inputEle);
            });
            btnCall.onclick = () => {
                var _a, _b, _c;
                const arg = [];
                (_a = info.arguments) === null || _a === void 0 ? void 0 : _a.forEach((val, idx) => {
                    const input = divArgsBox.children.item(idx + 1);
                    arg.push(input.value);
                });
                (_c = (_b = this._instance) === null || _b === void 0 ? void 0 : _b[name]) === null || _c === void 0 ? void 0 : _c.call(_b, ...arg);
            };
            instanceForm.appendChild(divMethod);
        });
    }
}
TestForm.getChangeEventName = propertyName => `${propertyName.toLowerCase()}change`;
//window['console2'] = window.console;
function log(...arg) {
    console.log(`[${location.origin}]`, ...arg);
}
//# sourceMappingURL=main.js.map