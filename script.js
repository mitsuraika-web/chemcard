// ========================================
// ХИМКАРТОЧКИ
// Основной JavaScript
// ========================================


// ========================================
// НАХОДИМ ЭЛЕМЕНТЫ СТРАНИЦЫ
// ========================================
// ========================================
// SUPABASE
// ========================================

const SUPABASE_URL = "https://itoljitbusamycafwmps.supabase.co";

const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_JFMVTNy1Yjcz4YHaB_go-g_VPFQTyXR";

const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_PUBLISHABLE_KEY
    );

// ========================================
// АВТОРИЗАЦИЯ — ИНТЕРФЕЙС
// ========================================

const authButton = document.querySelector("#auth-button");
const authModal = document.querySelector("#auth-modal");
const authCloseButton = document.querySelector("#auth-close-button");
const authTitle = document.querySelector("#auth-title");
const authSubmitButton = document.querySelector("#auth-submit-button");
const authSwitchButton = document.querySelector("#auth-switch-button");
const authMessage = document.querySelector("#auth-message");

let authMode = "login";

let currentAuthSession = null;

authButton.addEventListener("click", async () => {
    if (currentAuthSession) {
        await supabaseClient.auth.signOut();
        return;
    }

    authModal.classList.remove("hidden");
    authMessage.textContent = "";
});

// ========================================
// СОСТОЯНИЕ АВТОРИЗАЦИИ
// ========================================

function updateAuthButton(session) {
    currentAuthSession = session;

    if (session) {
        authButton.textContent = "Выйти";
    } else {
        authButton.textContent = "Войти";
    }
}

supabaseClient.auth.getSession().then(({ data }) => {
    updateAuthButton(data.session);
});

supabaseClient.auth.onAuthStateChange((_event, session) => {
    updateAuthButton(session);
});

authCloseButton.addEventListener("click", () => {
    authModal.classList.add("hidden");
});

authModal.addEventListener("click", (event) => {
    if (event.target === authModal) {
        authModal.classList.add("hidden");
    }
});

authSwitchButton.addEventListener("click", () => {
    authMode = authMode === "login" ? "signup" : "login";

    if (authMode === "login") {
        authTitle.textContent = "Вход";
        authSubmitButton.textContent = "Войти";
        authSwitchButton.textContent =
            "Нет аккаунта? Зарегистрироваться";
    } else {
        authTitle.textContent = "Регистрация";
        authSubmitButton.textContent = "Зарегистрироваться";
        authSwitchButton.textContent =
            "Уже есть аккаунт? Войти";
    }

    authMessage.textContent = "";
});     

// ========================================
// АВТОРИЗАЦИЯ — ВХОД И РЕГИСТРАЦИЯ
// ========================================

authSubmitButton.addEventListener("click", async () => {
    const email = document.querySelector("#auth-email").value.trim();
    const password = document.querySelector("#auth-password").value;

    if (!email || !password) {
        authMessage.textContent =
            "Введите электронную почту и пароль.";
        return;
    }

    authMessage.textContent = "Подождите...";

    if (authMode === "signup") {
        const { error } = await supabaseClient.auth.signUp({
            email: email,
            password: password
        });

        if (error) {
            authMessage.textContent =
                "Ошибка: " + error.message;
            return;
        }

        authMessage.textContent =
            "Регистрация выполнена! Проверьте почту для подтверждения.";
    } else {
        const { error } = await supabaseClient.auth.signInWithPassword({
            email: email,
            password: password
        });

        if (error) {
            authMessage.textContent =
                "Ошибка: " + error.message;
            return;
        }

        authMessage.textContent = "Вы вошли в аккаунт!";
        authModal.classList.add("hidden");
    }
});

const homePage = document.querySelector("#home-page");
const creatorPage = document.querySelector("#creator-page");

const editSetButton =
    document.querySelector("#edit-set-button");

let editingSetIndex = null;

const setPage =
    document.querySelector("#set-page");

const setBackButton =
    document.querySelector("#set-back-button");

const selectedSetTitle =
    document.querySelector("#selected-set-title");

const selectedSetCount =
    document.querySelector("#selected-set-count");

const createSetButton =
    document.querySelector("#create-set-button");

const backButton =
    document.querySelector(".back-button");

const addCardButton =
    document.querySelector("#add-card-button");

const saveSetButton =
    document.querySelector("#save-set-button");

const creatorTitle =
    document.querySelector("#creator-title");

const cardsContainer =
    document.querySelector("#cards-container");

    // ========================================
// ГРУППОВОЙ КОНСТРУКТОР
// ========================================

const groupingCreator =
    document.querySelector("#grouping-creator");


const groupsContainer =
    document.querySelector("#groups-container");


// ========================================
// ХИМИЧЕСКОЕ ФОРМАТИРОВАНИЕ ТЕКСТА
// ========================================

function sanitizeRichHTML(value = "") {

    const source = String(value);

    if (!/<(?:sub|sup|br)\b/i.test(source)) {
        const holder = document.createElement("div");
        holder.textContent = source;
        return holder.innerHTML;
    }

    const parser = new DOMParser();
    const root = parser.parseFromString(
        `<div>${source}</div>`,
        "text/html"
    ).body.firstElementChild;

    function cleanNode(node) {
        if (node.nodeType === Node.TEXT_NODE) {
            return document.createTextNode(node.nodeValue || "");
        }

        if (node.nodeType !== Node.ELEMENT_NODE) {
            return document.createDocumentFragment();
        }

        if (node.tagName === "BR") {
            return document.createElement("br");
        }

        if (node.tagName === "SUB" || node.tagName === "SUP") {
            const cleanElement = document.createElement(
                node.tagName.toLowerCase()
            );

            Array.from(node.childNodes).forEach(function(child) {
                cleanElement.appendChild(cleanNode(child));
            });

            return cleanElement;
        }

        const fragment = document.createDocumentFragment();

        Array.from(node.childNodes).forEach(function(child) {
            fragment.appendChild(cleanNode(child));
        });

        return fragment;
    }

    const result = document.createElement("div");

    Array.from(root.childNodes).forEach(function(child) {
        result.appendChild(cleanNode(child));
    });

    return result.innerHTML;
}


function setRichTextValue(editor, value = "") {

    const stringValue = String(value);

    if (/<(?:sub|sup|br)\b/i.test(stringValue)) {
        editor.innerHTML = sanitizeRichHTML(stringValue);
    } else {
        editor.textContent = stringValue;
    }
}


function getRichTextValue(editor) {

    const text = (editor.innerText || "")
        .replace(/\u00a0/g, " ")
        .trim();

    if (text === "") {
        return "";
    }

    return sanitizeRichHTML(editor.innerHTML).trim();
}


function setRichTextContent(element, value = "") {

    const stringValue = String(value);

    if (/<(?:sub|sup|br)\b/i.test(stringValue)) {
        element.innerHTML = sanitizeRichHTML(stringValue);
    } else {
        element.textContent = stringValue;
    }
}


function getPlainRichText(value = "") {

    const holder = document.createElement("div");
    setRichTextContent(holder, value);

    return holder.textContent || "";
}


function createRichTextField(className, placeholder, value = "") {

    const wrapper = document.createElement("div");
    wrapper.className = "rich-text-field";

    const toolbar = document.createElement("div");
    toolbar.className = "rich-text-toolbar";

    const subButton = document.createElement("button");
    subButton.type = "button";
    subButton.className = "rich-format-button";
    subButton.innerHTML = "x<sub>2</sub>";
    subButton.title = "Подстрочный индекс";
    subButton.setAttribute("aria-label", "Подстрочный индекс");

    const supButton = document.createElement("button");
    supButton.type = "button";
    supButton.className = "rich-format-button";
    supButton.innerHTML = "x<sup>2</sup>";
    supButton.title = "Надстрочный индекс / заряд";
    supButton.setAttribute("aria-label", "Надстрочный индекс / заряд");

    toolbar.appendChild(subButton);
    toolbar.appendChild(supButton);

    const editor = document.createElement("div");
    editor.className = className + " rich-text-editor";
    editor.contentEditable = "true";
    editor.setAttribute("role", "textbox");
    editor.setAttribute("aria-multiline", "true");
    editor.setAttribute("data-placeholder", placeholder);
    editor.spellcheck = true;

    setRichTextValue(editor, value);

    function applyFormat(command) {
        editor.focus();
        document.execCommand(command, false, null);
    }

    // Не даём кнопке забрать выделение текста.
    subButton.addEventListener("mousedown", function(event) {
        event.preventDefault();
    });

    supButton.addEventListener("mousedown", function(event) {
        event.preventDefault();
    });

    subButton.addEventListener("click", function() {
        applyFormat("subscript");
    });

    supButton.addEventListener("click", function() {
        applyFormat("superscript");
    });

    wrapper.appendChild(toolbar);
    wrapper.appendChild(editor);

    return wrapper;
}

const addGroupButton =
    document.querySelector("#add-group-button");

const setsContainer =
    document.querySelector("#sets-container");


// ========================================
// ПРАВИЛЬНОЕ СКЛОНЕНИЕ "КАРТОЧКА"
// ========================================

function getCardWord(number) {

    const lastTwo = number % 100;
    const lastOne = number % 10;

    if (lastTwo >= 11 && lastTwo <= 14) {
        return "карточек";
    }

    if (lastOne === 1) {
        return "карточка";
    }

    if (lastOne >= 2 && lastOne <= 4) {
        return "карточки";
    }

    return "карточек";
}

// ========================================
// ПРАВИЛЬНОЕ СКЛОНЕНИЕ "ГРУППА"
// ========================================

function getGroupWord(number) {

    if (
        number % 10 === 1 &&
        number % 100 !== 11
    ) {
        return "группа";
    }

    if (
        number % 10 >= 2 &&
        number % 10 <= 4 &&
        (
            number % 100 < 10 ||
            number % 100 >= 20
        )
    ) {
        return "группы";
    }

    return "групп";
}


// ========================================
// ОТКРЫВАЕМ СОЗДАНИЕ НАБОРА
// ========================================

createSetButton.addEventListener(
    "click",
    function() {

        editingSetIndex = null;

        creatorTitle.textContent = "Создание набора";
        saveSetButton.textContent = "Сохранить набор";

        homePage.classList.add("hidden");
        creatorPage.classList.remove("hidden");

        // Если конструктор пустой —
        // сразу создаём первую карточку
        if (cardsContainer.children.length === 0) {
            addCard();
        }
    }
);


// ========================================
// ВОЗВРАЩАЕМСЯ ИЗ СОЗДАНИЯ НАБОРА
// ========================================

backButton.addEventListener(
    "click",
    function() {

        creatorPage.classList.add("hidden");
        homePage.classList.remove("hidden");

        renderSets();
    }
);


// ========================================
// ОБНОВЛЯЕМ НОМЕРА КАРТОЧЕК
// ========================================

function updateCardNumbers() {

    const cards =
        document.querySelectorAll(".card");

    cards.forEach(
        function(card, index) {

            const title =
                card.querySelector(".card-title");

            title.textContent = index + 1;
        }
    );
}


// ========================================
// ДОБАВЛЕНИЕ КАРТОЧКИ
// ========================================

function addCard(termValue = "", answerValue = "") {

    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
        <div class="card-header">
            <strong class="card-title">1</strong>
            <button class="delete-card" type="button">🗑</button>
        </div>

        <label>Термин</label>
        <div class="term-editor-host"></div>

        <label>Ответ</label>
        <div class="answer-editor-host"></div>
    `;

    card.querySelector(".term-editor-host").appendChild(
        createRichTextField(
            "term-input",
            "Например: Na₂CO₃",
            termValue
        )
    );

    card.querySelector(".answer-editor-host").appendChild(
        createRichTextField(
            "answer-input",
            "Например: Na",
            answerValue
        )
    );

    cardsContainer.appendChild(card);

    card.querySelector(".delete-card").addEventListener(
        "click",
        function() {
            card.remove();
            updateCardNumbers();
        }
    );

    updateCardNumbers();
}

// ========================================
// ДОБАВЛЕНИЕ ГРУППЫ
// ========================================

function addGroup(groupTitle = "", items = []) {

    const group = document.createElement("div");
    group.className = "group-card";

    group.innerHTML = `
        <div class="group-card-header">
            <div class="group-title-editor-host"></div>
            <button class="delete-group" type="button">🗑</button>
        </div>

        <div class="group-items"></div>

        <button class="add-group-item" type="button">
            + Добавить элемент
        </button>
    `;

    groupsContainer.appendChild(group);

    group.querySelector(".group-title-editor-host").appendChild(
        createRichTextField(
            "group-title-input",
            "Название группы",
            groupTitle
        )
    );

    const itemsContainer = group.querySelector(".group-items");
    const addItemButton = group.querySelector(".add-group-item");

    function addItem(value = "") {

        const item = document.createElement("div");
        item.className = "group-item";

        item.innerHTML = `
            <div class="group-item-editor-host"></div>
            <button class="delete-group-item" type="button">🗑</button>
        `;

        item.querySelector(".group-item-editor-host").appendChild(
            createRichTextField(
                "group-item-input",
                "Например: CO₂",
                value
            )
        );

        itemsContainer.appendChild(item);

        item.querySelector(".delete-group-item").addEventListener(
            "click",
            function() {
                item.remove();
            }
        );
    }

    addItemButton.addEventListener("click", function() {
        addItem();
    });

    if (items.length > 0) {
        items.forEach(function(item) {
            addItem(item);
        });
    } else {
        addItem();
    }

    group.querySelector(".delete-group").addEventListener(
        "click",
        function() {
            group.remove();
            updateGroupNumbers();
        }
    );

    updateGroupNumbers();
}

// ========================================
// НУМЕРАЦИЯ ГРУПП
// ========================================

function updateGroupNumbers() {
    // Нумерация больше не нужна:
    // название группы находится прямо в её шапке.
}


// ========================================
// КНОПКА "ДОБАВИТЬ ГРУППУ"
// ========================================

addGroupButton.addEventListener(
    "click",
    function() {

        addGroup();

    }
);

// ========================================
// ПЕРЕКЛЮЧЕНИЕ ТИПА НАБОРА
// ========================================

document
    .querySelectorAll(
        'input[name="set-type"]'
    )
    .forEach(
        function(radio) {

            radio.addEventListener(
                "change",
                function() {

                    if (
                        this.value ===
                        "grouping"
                    ) {

                        cardsContainer
                            .classList
                            .add("hidden");

                        addCardButton
                            .classList
                            .add("hidden");

                        groupingCreator
                            .classList
                            .remove("hidden");


                        // Если групп ещё нет —
                        // создаём первую.

                        if (
                            groupsContainer
                                .children
                                .length === 0
                        ) {

                            addGroup();

                        }

                    } else {

                        cardsContainer
                            .classList
                            .remove("hidden");

                        addCardButton
                            .classList
                            .remove("hidden");

                        groupingCreator
                            .classList
                            .add("hidden");

                    }

                }
            );

        }
    );

// ========================================
// КНОПКА "+ ДОБАВИТЬ КАРТОЧКУ"
// ========================================

addCardButton.addEventListener(
    "click",
    function() {

        addCard();
    }
);

// ========================================
// СОХРАНЕНИЕ НАБОРА
// ========================================

// ========================================
// СОХРАНЕНИЕ НАБОРА
// ========================================

saveSetButton.addEventListener(
    "click",
    async function() {

        const title =
            document
                .querySelector("#set-title")
                .value
                .trim();


        if (title === "") {

            alert(
                "Введите название набора."
            );

            return;

        }


        const setType =
            document
                .querySelector(
                    'input[name="set-type"]:checked'
                )
                .value;


        // ========================================
        // ОБЫЧНЫЙ НАБОР
        // ========================================

        if (setType === "cards") {

            const cards = [];

            const allCards =
                document.querySelectorAll(
                    ".card"
                );


            allCards.forEach(
                function(card) {

                    const term =
                        getRichTextValue(
                            card.querySelector(
                                ".term-input"
                            )
                        );


                    const answer =
                        getRichTextValue(
                            card.querySelector(
                                ".answer-input"
                            )
                        );


                    if (
                        term !== "" ||
                        answer !== ""
                    ) {

                        cards.push({
                            term: term,
                            answer: answer
                        });

                    }

                }
            );


            if (cards.length === 0) {

                alert(
                    "Добавьте хотя бы одну карточку."
                );

                return;

            }


            saveSetButton.disabled = true;

            await saveSetData({
                title: title,
                cards: cards
            });

            saveSetButton.disabled = false;


            return;

        }


        // ========================================
        // ГРУППОВОЙ НАБОР
        // ========================================

        const groups = [];


        const groupElements =
            groupsContainer.querySelectorAll(
                ".group-card"
            );


        groupElements.forEach(
            function(group) {

                const groupTitle =
                    getRichTextValue(
                        group.querySelector(
                            ".group-title-input"
                        )
                    );


                const items = [];


                group
                    .querySelectorAll(
                        ".group-item-input"
                    )
                    .forEach(
                        function(input) {

                            const value =
                                getRichTextValue(input);


                            if (
                                value !== ""
                            ) {

                                items.push(
                                    value
                                );

                            }

                        }
                    );


                if (
                    groupTitle !== "" &&
                    items.length > 0
                ) {

                    groups.push({
                        title: groupTitle,
                        items: items
                    });

                }

            }
        );


        if (groups.length < 2) {

            alert(
                "Добавьте хотя бы две группы."
            );

            return;

        }


        saveSetButton.disabled = true;

        await saveSetData({
            title: title,
            type: "grouping",
            groups: groups
        });

        saveSetButton.disabled = false;

    }
);


// ========================================
// СОХРАНЕНИЕ ДАННЫХ В LOCALSTORAGE
// ========================================

async function saveSetData(setData) {

    const {
        data: { session }
    } = await supabaseClient.auth.getSession();

    // Если пользователь не вошёл —
    // пока сохраняем набор только локально
    if (!session) {

        const savedSets =
            JSON.parse(
                localStorage.getItem("chemSets")
            ) || [];

        if (
            editingSetIndex !== null &&
            savedSets[editingSetIndex]
        ) {
            savedSets[editingSetIndex] = setData;

            alert(
                "Изменения сохранены!"
            );

        } else {
            savedSets.push(setData);

            alert(
                "Набор сохранён!"
            );
        }

        localStorage.setItem(
            "chemSets",
            JSON.stringify(savedSets)
        );

        editingSetIndex = null;

        document
            .querySelector("#set-title")
            .value = "";

        cardsContainer.innerHTML = "";
        groupsContainer.innerHTML = "";

        const cardsRadio =
            document.querySelector(
                'input[name="set-type"][value="cards"]'
            );

        if (cardsRadio) {
            cardsRadio.checked = true;
        }

        cardsContainer
            .classList
            .remove("hidden");

        addCardButton
            .classList
            .remove("hidden");

        groupingCreator
            .classList
            .add("hidden");

        creatorPage
            .classList
            .add("hidden");

        setPage
            .classList
            .add("hidden");

        homePage
            .classList
            .remove("hidden");

        renderSets();

        return;
    }


    // ========================================
    // ПРОВЕРЯЕМ, ЯВЛЯЕТСЯ ЛИ ПОЛЬЗОВАТЕЛЬ АВТОРОМ
    // ========================================

    const { data: authorData } =
        await supabaseClient
            .from("author_users")
            .select("user_id")
            .eq("user_id", session.user.id)
            .maybeSingle();

    const isAuthor =
        !!authorData;


    // ========================================
    // СОХРАНЯЕМ В SUPABASE
    // ========================================

    const cloudData = {
        title: setData.title,
        type: setData.type || "cards",
        data: {
            cards: setData.cards || [],
            groups: setData.groups || []
        },
        owner_id: session.user.id,
        is_author: isAuthor
    };


    let savedCloudSet = null;
    let cloudError = null;


    // ========================================
    // НОВЫЙ НАБОР
    // ========================================

    if (
        editingSetIndex === null
    ) {

        const result =
            await supabaseClient
                .from("sets")
                .insert(cloudData)
                .select()
                .single();

        savedCloudSet = result.data;
        cloudError = result.error;

    } else {

        const savedSets =
            JSON.parse(
                localStorage.getItem("chemSets")
            ) || [];

        const oldSet =
            savedSets[editingSetIndex];


        if (oldSet && oldSet.id) {

            const result =
                await supabaseClient
                    .from("sets")
                    .update(cloudData)
                    .eq("id", oldSet.id)
                    .select()
                    .single();

            savedCloudSet = result.data;
            cloudError = result.error;

        } else {

            const result =
                await supabaseClient
                    .from("sets")
                    .insert(cloudData)
                    .select()
                    .single();

            savedCloudSet = result.data;
            cloudError = result.error;
        }
    }


    // ========================================
    // ЕСЛИ SUPABASE ВЕРНУЛА ОШИБКУ
    // ========================================

    if (cloudError) {

        console.error(
            "Ошибка сохранения набора в Supabase:",
            cloudError
        );

        alert(
            "Не удалось сохранить набор в облако.\n\n" +
            cloudError.message
        );

        return;
    }


    // ========================================
    // СОХРАНЯЕМ ОБЛАЧНЫЙ НАБОР ЛОКАЛЬНО
    // ========================================

    const localSets =
        JSON.parse(
            localStorage.getItem("chemSets")
        ) || [];


    const localSet = {
        id: savedCloudSet.id,
        title: savedCloudSet.title,
        type: savedCloudSet.type,
        ...(savedCloudSet.data || {}),
        owner_id: savedCloudSet.owner_id,
        is_author: savedCloudSet.is_author
    };


    if (
        editingSetIndex !== null &&
        localSets[editingSetIndex]
    ) {
        localSets[editingSetIndex] =
            localSet;

        alert(
            "Изменения сохранены!"
        );

    } else {

        localSets.push(localSet);

        alert(
            isAuthor
                ? "Авторский набор сохранён!"
                : "Набор сохранён!"
        );
    }


    localStorage.setItem(
        "chemSets",
        JSON.stringify(localSets)
    );


    // ========================================
    // ОЧИЩАЕМ РЕДАКТОР
    // ========================================

    editingSetIndex = null;

    document
        .querySelector("#set-title")
        .value = "";

    cardsContainer.innerHTML = "";
    groupsContainer.innerHTML = "";


    const cardsRadio =
        document.querySelector(
            'input[name="set-type"][value="cards"]'
        );

    if (cardsRadio) {
        cardsRadio.checked = true;
    }


    cardsContainer
        .classList
        .remove("hidden");

    addCardButton
        .classList
        .remove("hidden");

    groupingCreator
        .classList
        .add("hidden");

    creatorPage
        .classList
        .add("hidden");

    setPage
        .classList
        .add("hidden");

    homePage
        .classList
        .remove("hidden");


    renderSets();
}

// ========================================
// ЗАГРУЗКА НАБОРОВ ИЗ SUPABASE
// ========================================

async function loadSetsFromSupabase() {

    const { data, error } =
        await supabaseClient
            .from("sets")
            .select("*")
            .order("created_at", {
                ascending: true
            });

    if (error) {

        console.error(
            "Ошибка загрузки наборов из Supabase:",
            error
        );

        return null;
    }

    return data.map(function(row) {

        return {
            id: row.id,
            title: row.title,
            type: row.type,
            ...(row.data || {}),
            owner_id: row.owner_id,
            is_author: row.is_author
        };

    });
}

// ========================================
// СИНХРОНИЗАЦИЯ НАБОРОВ С SUPABASE
// ========================================

async function syncSetsFromSupabase() {

    const cloudSets =
        await loadSetsFromSupabase();

    if (!cloudSets) {
        return;
    }

    const localSets =
        JSON.parse(
            localStorage.getItem("chemSets")
        ) || [];


    cloudSets.forEach(function(cloudSet) {

        const existingIndex =
            localSets.findIndex(function(localSet) {
                return localSet.id === cloudSet.id;
            });


        if (existingIndex === -1) {

            localSets.push(cloudSet);

        } else {

            localSets[existingIndex] =
                cloudSet;

        }

    });


    localStorage.setItem(
        "chemSets",
        JSON.stringify(localSets)
    );


    renderSets();
}

// ========================================
// ПОКАЗЫВАЕМ СОХРАНЁННЫЕ НАБОРЫ
// ========================================

function renderSets() {

    // ========================================
    // СКОЛЬКО ЭЛЕМЕНТОВ ПОКАЗЫВАЕМ У НАБОРА
    // ========================================

    function getSetItemCount(set) {

        // Для группового набора —
        // количество групп
        if (
            set.type === "grouping" &&
            set.groups
        ) {
            return set.groups.length;
        }

        // Для обычного набора —
        // количество карточек
        return set.cards
            ? set.cards.length
            : 0;
    }


    // ========================================
    // ОЧИЩАЕМ КОНТЕЙНЕР
    // ========================================

    setsContainer.innerHTML = "";


    // ========================================
    // ПОЛУЧАЕМ НАБОРЫ
    // ========================================

    const savedSets =
        JSON.parse(
            localStorage.getItem("chemSets")
        ) || [];


    // ========================================
    // ЕСЛИ НАБОРОВ НЕТ
    // ========================================

    if (savedSets.length === 0) {

        setsContainer.innerHTML = `
            <div class="empty-sets">
                Пока нет наборов.
                <br><br>
                Создай свой первый набор!
            </div>
        `;

        return;
    }


    // ========================================
    // СОЗДАЁМ КАРТОЧКУ КАЖДОГО НАБОРА
    // ========================================

    savedSets.forEach(
        function(set, index) {

            const setElement =
                document.createElement("div");

            setElement.className =
                "set-item";


            // ========================================
            // ОПРЕДЕЛЯЕМ КОЛИЧЕСТВО
            // ========================================

            const itemCount =
                getSetItemCount(set);


            // ========================================
            // ТЕКСТ КОЛИЧЕСТВА
            // ========================================

            let countText;

            if (set.type === "grouping") {

                countText =
                    itemCount +
                    " " +
                    getGroupWord(itemCount);

            } else {

                countText =
                    itemCount +
                    " " +
                    getCardWord(itemCount);

            }


            // ========================================
            // СОЗДАЁМ КАРТОЧКУ НАБОРА
            // ========================================

            setElement.innerHTML = `

                <h3>
                    ${set.title}
                </h3>

                <div class="set-count">
                    ${countText}
                </div>

                <div class="set-actions">

                    <button
                        class="open-set-button"
                        type="button"
                    >
                        Открыть
                    </button>

                    <button
                        class="delete-set-button"
                        type="button"
                    >
                        🗑
                    </button>

                </div>

            `;


            // ========================================
            // УДАЛЕНИЕ НАБОРА
            // ========================================

            const deleteButton =
                setElement.querySelector(
                    ".delete-set-button"
                );


            deleteButton.addEventListener(
                "click",
                function() {

                    savedSets.splice(
                        index,
                        1
                    );


                    localStorage.setItem(
                        "chemSets",
                        JSON.stringify(savedSets)
                    );


                    renderSets();

                }
            );


            // ========================================
            // КНОПКА "ОТКРЫТЬ"
            // ========================================

            const openButton =
                setElement.querySelector(
                    ".open-set-button"
                );


            openButton.addEventListener(
                "click",
                function() {

                    // Прячем главную
                    homePage.classList.add(
                        "hidden"
                    );


                    // Показываем страницу набора
                    setPage.classList.remove(
                        "hidden"
                    );


                    // Название
                    selectedSetTitle.textContent =
                        set.title;


                    // ========================================
                    // КОЛИЧЕСТВО ЭЛЕМЕНТОВ
                    // ========================================

                    const count =
                        set.type === "grouping"
                            ? set.groups.reduce(
                                function(total, group) {
                                    return total +
                                        group.items.length;
                                },
                                0
                            )
                            : set.cards.length;


                    // ========================================
                    // ДЛЯ ГРУППОВОГО НАБОРА
                    // ПОКАЗЫВАЕМ КОЛИЧЕСТВО ГРУПП
                    // ========================================

                    if (
                        set.type === "grouping"
                    ) {

                        selectedSetCount.textContent =
                            set.groups.length +
                            " " +
                            getGroupWord(
                                set.groups.length
                            );

                    } else {

                        selectedSetCount.textContent =
                            count +
                            " " +
                            getCardWord(count);

                    }


                    // Запоминаем открытый набор
                    editingSetIndex = index;


                    // ========================================
                    // ПОКАЗЫВАЕМ НУЖНЫЕ РЕЖИМЫ
                    // ========================================

                    const modeButtons =
                        document.querySelectorAll(
                            ".mode-card"
                        );


                    modeButtons.forEach(
                        function(button) {

                            if (
                                set.type === "grouping"
                            ) {

                                // У группового набора
                                // оставляем только
                                // групповую сортировку

                                if (
                                    button.dataset.mode ===
                                    "grouping"
                                ) {

                                    button.classList.remove(
                                        "hidden"
                                    );

                                } else {

                                    button.classList.add(
                                        "hidden"
                                    );

                                }

                            } else {

                                // У обычного набора
                                // показываем обычные режимы

                                if (
                                    button.dataset.mode ===
                                    "grouping"
                                ) {

                                    button.classList.add(
                                        "hidden"
                                    );

                                } else {

                                    button.classList.remove(
                                        "hidden"
                                    );

                                }

                            }

                        }
                    );

                }
            );


            // ========================================
            // ДОБАВЛЯЕМ НАБОР НА СТРАНИЦУ
            // ========================================

            setsContainer.appendChild(
                setElement
            );

        }
    );

}


// ========================================
// ПОКАЗЫВАЕМ НАБОРЫ ПРИ ЗАПУСКЕ
// ========================================

syncSetsFromSupabase();

// ========================================
// НАЗАД СО СТРАНИЦЫ НАБОРА
// ========================================

setBackButton.addEventListener(
    "click",
    function() {

        setPage.classList.add(
            "hidden"
        );

        homePage.classList.remove(
            "hidden"
        );

        renderSets();

        
    }
);

// ========================================
// РЕДАКТИРОВАНИЕ НАБОРА
// ========================================

editSetButton.addEventListener(
    "click",
    function() {

        if (
            editingSetIndex === null
        ) {
            return;
        }


        const savedSets =
            JSON.parse(
                localStorage.getItem(
                    "chemSets"
                )
            ) || [];


        const set =
            savedSets[
                editingSetIndex
            ];


        if (!set) {
            return;
        }


        setPage
            .classList
            .add("hidden");

        creatorPage
            .classList
            .remove("hidden");


        creatorTitle.textContent =
            "Редактирование набора";

        saveSetButton.textContent =
            "Сохранить изменения";


        document.querySelector(
            "#set-title"
        ).value =
            set.title;


        cardsContainer.innerHTML = "";
        groupsContainer.innerHTML = "";


        // ========================================
        // ОБЫЧНЫЙ НАБОР
        // ========================================

        if (
            set.type !== "grouping"
        ) {

            document
                .querySelector(
                    'input[name="set-type"][value="cards"]'
                )
                .checked = true;


            cardsContainer
                .classList
                .remove("hidden");

            addCardButton
                .classList
                .remove("hidden");

            groupingCreator
                .classList
                .add("hidden");


            set.cards.forEach(
                function(cardData) {

                    addCard(
                        cardData.term,
                        cardData.answer
                    );

                }
            );


            updateCardNumbers();

            return;

        }


        // ========================================
        // ГРУППОВОЙ НАБОР
        // ========================================

        document
            .querySelector(
                'input[name="set-type"][value="grouping"]'
            )
            .checked = true;


        cardsContainer
            .classList
            .add("hidden");

        addCardButton
            .classList
            .add("hidden");

        groupingCreator
            .classList
            .remove("hidden");


        set.groups.forEach(
            function(groupData) {

                addGroup(
                    groupData.title,
                    groupData.items
                );

            }
        );

        updateGroupNumbers();

    }
);

// ========================================
// РЕЖИМ "КАРТОЧКИ"
// ========================================

const flashcardsPage =
    document.querySelector("#flashcards-page");

const flashcardsBackButton =
    document.querySelector("#flashcards-back-button");

const flashcardsSetTitle =
    document.querySelector("#flashcards-set-title");

const flashcardsProgress =
    document.querySelector("#flashcards-progress");

const flashcard =
    document.querySelector("#flashcard");

const flashcardTerm =
    document.querySelector("#flashcard-term");

const flashcardAnswer =
    document.querySelector("#flashcard-answer");

const flashcardPrev =
    document.querySelector("#flashcard-prev");

const flashcardNext =
    document.querySelector("#flashcard-next");

let flashcardsIndex = 0;
let flashcardShowingAnswer = false;


// ========================================
// ОТКРЫВАЕМ РЕЖИМ КАРТОЧЕК
// ========================================

document.querySelectorAll(".mode-card").forEach(
    function(modeButton) {

        modeButton.addEventListener(
            "click",
            function() {

                const mode =
                    modeButton.dataset.mode;

                if (mode !== "flashcards") {
                    return;
                }

                if (editingSetIndex === null) {
                    return;
                }

                const savedSets =
                    JSON.parse(
                        localStorage.getItem("chemSets")
                    ) || [];

                const set =
                    savedSets[editingSetIndex];

                if (!set || set.cards.length === 0) {
                    return;
                }

                // Начинаем с первой карточки
                flashcardsIndex = 0;
                flashcardShowingAnswer = false;

                // Скрываем страницу набора
                setPage.classList.add("hidden");

                // Показываем карточки
                flashcardsPage.classList.remove("hidden");

                // Показываем название набора
                flashcardsSetTitle.textContent =
                    "🃏 " + set.title;

                showFlashcard();
            }
        );

    }
);


// ========================================
// ПОКАЗЫВАЕМ ТЕКУЩУЮ КАРТОЧКУ
// ========================================

function showFlashcard() {

    const savedSets =
        JSON.parse(
            localStorage.getItem("chemSets")
        ) || [];

    const set =
        savedSets[editingSetIndex];

    if (!set || !set.cards.length) {
        return;
    }

    const card =
        set.cards[flashcardsIndex];

    // Показываем термин
    setRichTextContent(
        flashcardTerm,
        card.term
    );

    // Показываем ответ
    setRichTextContent(
        flashcardAnswer,
        card.answer
    );

    // Возвращаем карточку на лицевую сторону
    flashcard.classList.remove("flipped");

    flashcardShowingAnswer = false;

    // Номер карточки
    flashcardsProgress.textContent =
        (flashcardsIndex + 1) +
        " / " +
        set.cards.length;

    // На первой карточке назад нельзя
    flashcardPrev.disabled =
        flashcardsIndex === 0;

    // На последней карточке меняем текст кнопки
    if (
        flashcardsIndex ===
        set.cards.length - 1
    ) {

        flashcardNext.textContent =
            "Завершить";

    } else {

        flashcardNext.textContent =
            "Далее →";

    }
}


// ========================================
// ОТКРЫВАЕМ / СКРЫВАЕМ ОТВЕТ
// ========================================

flashcard.addEventListener(
    "click",
    function() {

        if (flashcardShowingAnswer) {

            flashcard.classList.remove("flipped");

            flashcardShowingAnswer = false;

        } else {

            flashcard.classList.add("flipped");

            flashcardShowingAnswer = true;

        }

    }
);


// ========================================
// СЛЕДУЮЩАЯ КАРТОЧКА
// ========================================

flashcardNext.addEventListener(
    "click",
    function() {

        const savedSets =
            JSON.parse(
                localStorage.getItem("chemSets")
            ) || [];

        const set =
            savedSets[editingSetIndex];

        if (!set) {
            return;
        }

        // Если это последняя карточка
        if (
            flashcardsIndex ===
            set.cards.length - 1
        ) {

            flashcardsPage.classList.add("hidden");
            setPage.classList.remove("hidden");

            return;
        }

        flashcardsIndex++;

        showFlashcard();
    }
);


// ========================================
// ПРЕДЫДУЩАЯ КАРТОЧКА
// ========================================

flashcardPrev.addEventListener(
    "click",
    function() {

        if (flashcardsIndex === 0) {
            return;
        }

        flashcardsIndex--;

        showFlashcard();
    }
);


// ========================================
// НАЗАД ИЗ РЕЖИМА КАРТОЧЕК
// ========================================

flashcardsBackButton.addEventListener(
    "click",
    function() {

        flashcardsPage.classList.add("hidden");

        setPage.classList.remove("hidden");

        // Снова показываем правильное количество
        const savedSets =
            JSON.parse(
                localStorage.getItem("chemSets")
            ) || [];

        const set =
            savedSets[editingSetIndex];

        if (set) {

            selectedSetTitle.textContent =
                set.title;

            selectedSetCount.textContent =
                set.cards.length +
                " " +
                getCardWord(set.cards.length);

        }

    }
);

// ========================================
// РЕЖИМ "ВИКТОРИНА"
// ========================================

const quizPage =
    document.querySelector("#quiz-page");

const quizBackButton =
    document.querySelector("#quiz-back-button");

const quizSetTitle =
    document.querySelector("#quiz-set-title");

const quizProgress =
    document.querySelector("#quiz-progress");

const quizTerm =
    document.querySelector("#quiz-term");

const quizOptions =
    document.querySelector("#quiz-options");

const quizNext =
    document.querySelector("#quiz-next");

let quizIndex = 0;
let quizScore = 0;
let quizAnswered = false;

let quizCards = [];

// ========================================
// ПЕРЕМЕШИВАНИЕ
// ========================================

function shuffleArray(array) {

    const shuffled =
        [...array];

    for (
        let i = shuffled.length - 1;
        i > 0;
        i--
    ) {

        const j =
            Math.floor(
                Math.random() * (i + 1)
            );

        [
            shuffled[i],
            shuffled[j]
        ] =
        [
            shuffled[j],
            shuffled[i]
        ];
    }

    return shuffled;
}


// ========================================
// ОТКРЫВАЕМ ВИКТОРИНУ
// ========================================

document.querySelectorAll(".mode-card").forEach(
    function(modeButton) {

        modeButton.addEventListener(
            "click",
            function() {

                const mode =
                    modeButton.dataset.mode;

                if (mode !== "quiz") {
                    return;
                }

                if (editingSetIndex === null) {
                    return;
                }

                const savedSets =
                    JSON.parse(
                        localStorage.getItem("chemSets")
                    ) || [];

                const set =
                    savedSets[editingSetIndex];

                if (!set || set.cards.length === 0) {
                    return;
                }

                // Начинаем викторину сначала
                quizIndex = 0;
                quizScore = 0;
                quizAnswered = false;

                // Перемешиваем карточки
                quizCards =
                    shuffleArray(set.cards);

                document
                    .querySelector(".quiz-question")
                    .style.display = "block";

                quizNext.style.display = "block";

                document
                    .querySelector(".quiz-question")
                    .style.display = "block";

                quizNext.style.display = "block";

                // Скрываем страницу набора
                setPage.classList.add("hidden");

                // Показываем викторину
                quizPage.classList.remove("hidden");

                // Название набора
                quizSetTitle.textContent =
                    "🎯 " + set.title;

                // Показываем первый вопрос
                showQuizQuestion();
            }
        );

    }
);


// ========================================
// ПОКАЗЫВАЕМ ВОПРОС
// ========================================

function showQuizQuestion() {

    const savedSets =
        JSON.parse(
            localStorage.getItem("chemSets")
        ) || [];

    const set =
        savedSets[editingSetIndex];

    if (!set || !set.cards.length) {
        return;
    }

    const currentCard =
        quizCards[quizIndex];

    // Номер вопроса
    quizProgress.textContent =
        (quizIndex + 1) +
        " / " +
        quizCards.length;

    // Показываем термин
    setRichTextContent(
        quizTerm,
        currentCard.term
    );

    // Очищаем старые варианты
    quizOptions.innerHTML = "";

    quizAnswered = false;

    // ========================================
    // СОЗДАЁМ ВАРИАНТЫ ОТВЕТОВ
    // ========================================

    const correctAnswer =
        currentCard.answer;

    const otherAnswers =
        quizCards
            .filter(
                function(card, index) {
                    return index !== quizIndex;
                }
            )
            .map(
                function(card) {
                    return card.answer;
                }
            );

     // Перемешиваем неправильные ответы
    const shuffledWrongAnswers =
        shuffleArray(otherAnswers);

    // Берём максимум 3 неправильных ответа
    const wrongAnswers =
        otherAnswers.slice(0, 3);

    // Добавляем правильный ответ
    const answers = [
        correctAnswer,
        ...wrongAnswers
    ];

    // Перемешиваем все варианты
    const shuffledAnswers =
        shuffleArray(answers);

    // ========================================
    // СОЗДАЁМ КНОПКИ
    // ========================================

    shuffledAnswers.forEach(
        function(answer) {

            const button =
                document.createElement("button");

            button.className =
                "quiz-option";

            button.type =
                "button";

            setRichTextContent(
                button,
                answer
            );

            button.dataset.answer = answer;

            button.addEventListener(
                "click",
                function() {

                    checkQuizAnswer(
                        button,
                        answer,
                        correctAnswer
                    );

                }
            );

            quizOptions.appendChild(button);
        }
    );

    // Кнопка "Далее" сначала отключена
    quizNext.disabled = true;

    if (
        quizIndex ===
        set.cards.length - 1
    ) {

        quizNext.textContent =
            "Завершить";

    } else {

        quizNext.textContent =
            "Далее →";

    }
}


// ========================================
// ПРОВЕРЯЕМ ОТВЕТ
// ========================================

function checkQuizAnswer(
    selectedButton,
    selectedAnswer,
    correctAnswer
) {

    // Если уже отвечали — ничего не делаем
    if (quizAnswered) {
        return;
    }

    quizAnswered = true;

    // Находим все варианты
    const allButtons =
        quizOptions.querySelectorAll(
            ".quiz-option"
        );

    // Отключаем все кнопки
    allButtons.forEach(
        function(button) {
            button.disabled = true;
        }
    );

    // Проверяем ответ
    if (
        selectedAnswer ===
        correctAnswer
    ) {

        selectedButton.classList.add(
            "correct"
        );

        quizScore++;

    } else {

        selectedButton.classList.add(
            "incorrect"
        );

        // Показываем правильный ответ
        allButtons.forEach(
            function(button) {

                if (
                    button.dataset.answer ===
                    correctAnswer
                ) {

                    button.classList.add(
                        "correct"
                    );

                }

            }
        );
    }

    // Разрешаем перейти дальше
    quizNext.disabled = false;
}


// ========================================
// СЛЕДУЮЩИЙ ВОПРОС
// ========================================

quizNext.addEventListener(
    "click",
    function() {

        const savedSets =
            JSON.parse(
                localStorage.getItem("chemSets")
            ) || [];

        const set =
            savedSets[editingSetIndex];

        if (!set) {
            return;
        }

        // Если это последний вопрос
        if (
            quizIndex ===
            quizCards.length - 1
        ) {

            showQuizResult();

            return;
        }

        quizIndex++;

        showQuizQuestion();
    }
);


// ========================================
// ПОКАЗЫВАЕМ РЕЗУЛЬТАТ
// ========================================

function showQuizResult() {

    quizProgress.textContent = "";

    quizOptions.innerHTML = "";

    quizTerm.textContent = "";

    // Убираем блок с вопросом
    document
        .querySelector(".quiz-question")
        .style.display = "none";

    quizNext.style.display = "none";

    const result =
        document.createElement("div");

    result.className =
        "quiz-result";

    const resultTitle =
        document.createElement("h2");

    resultTitle.textContent =
        "Викторина завершена! 🎉";

    const resultText =
        document.createElement("p");

    resultText.textContent =
        "Правильных ответов: " +
        quizScore +
        " из " +
        getCardCount();

    result.appendChild(resultTitle);
    result.appendChild(resultText);

    quizOptions.appendChild(result);

    // Кнопка возврата
    const backToSetButton =
        document.createElement("button");

    backToSetButton.className =
        "create-button";

    backToSetButton.type =
        "button";

    backToSetButton.textContent =
        "Вернуться к набору";

    backToSetButton.addEventListener(
        "click",
        function() {

            quizPage.classList.add(
                "hidden"
            );

            setPage.classList.remove(
                "hidden"
            );

            quizNext.style.display =
                "block";

        }
    );

    result.appendChild(
        backToSetButton
    );
}


// ========================================
// ПОЛУЧАЕМ КОЛИЧЕСТВО КАРТОЧЕК
// ========================================

function getCardCount() {

    const savedSets =
        JSON.parse(
            localStorage.getItem("chemSets")
        ) || [];

    const set =
        savedSets[editingSetIndex];

    if (!set) {
        return 0;
    }

    return set.cards.length;
}


// ========================================
// НАЗАД ИЗ ВИКТОРИНЫ
// ========================================

quizBackButton.addEventListener(
    "click",
    function() {

        quizPage.classList.add(
            "hidden"
        );

        setPage.classList.remove(
            "hidden"
        );

        quizNext.style.display =
            "block";

    }
);

// ========================================
// РЕЖИМ "ТЕСТ"
// ========================================


const testPage =
    document.querySelector("#test-page");

const testBackButton =
    document.querySelector("#test-back-button");

const testSetTitle =
    document.querySelector("#test-set-title");

const testSetup =
    document.querySelector("#test-setup");

const startTestButton =
    document.querySelector("#start-test-button");

const testContent =
    document.querySelector("#test-content");

const testProgress =
    document.querySelector("#test-progress");

const testTerm =
    document.querySelector("#test-term");

const testOptions =
    document.querySelector("#test-options");

const testInputArea =
    document.querySelector("#test-input-area");

const testAnswerInput =
    document.querySelector("#test-answer-input");

const testCheckButton =
    document.querySelector("#test-check-button");

const testFeedback =
    document.querySelector("#test-feedback");

const testNextButton =
    document.querySelector("#test-next-button");

const testResult =
    document.querySelector("#test-result");


let testIndex = 0;

let testScore = 0;

let testAnswered = false;

let testSelectedAnswer = null;

let testCards = [];

let testMode = "choice";


// ========================================
// ОТКРЫВАЕМ ТЕСТ
// ========================================

document.querySelectorAll(".mode-card").forEach(
    function(modeButton) {

        modeButton.addEventListener(
            "click",
            function() {

                const mode =
                    modeButton.dataset.mode;

                if (mode !== "test") {
                    return;
                }


                if (editingSetIndex === null) {
                    return;
                }


                const savedSets =
                    JSON.parse(
                        localStorage.getItem("chemSets")
                    ) || [];


                const set =
                    savedSets[editingSetIndex];


                if (
                    !set ||
                    set.cards.length === 0
                ) {
                    return;
                }


                // Начинаем новый тест
                testIndex = 0;

                testScore = 0;

                testAnswered = false;


                // Перемешиваем вопросы
                testCards =
                    shuffleArray(set.cards);


                // Показываем страницу теста
                setPage.classList.add(
                    "hidden"
                );

                testPage.classList.remove(
                    "hidden"
                );


                // Название набора
                testSetTitle.textContent =
                    "📝 " + set.title;


                // Показываем настройки
                testSetup.classList.remove(
                    "hidden"
                );

                testContent.classList.add(
                    "hidden"
                );

                testResult.classList.add(
                    "hidden"
                );


                // По умолчанию:
                // варианты ответа
                document
                    .querySelector(
                        'input[name="test-mode"][value="choice"]'
                    )
                    .checked = true;


                testMode = "choice";

            }
        );

    }
);


// ========================================
// ВЫБОР СПОСОБА ОТВЕТА
// ========================================

document.querySelectorAll(
    'input[name="test-mode"]'
).forEach(
    function(radio) {

        radio.addEventListener(
            "change",
            function() {

                testMode =
                    radio.value;

            }
        );

    }
);


// ========================================
// НАЧАТЬ ТЕСТ
// ========================================

startTestButton.addEventListener(
    "click",
    function() {

        testSetup.classList.add(
            "hidden"
        );

        testContent.classList.remove(
            "hidden"
        );

        testResult.classList.add(
            "hidden"
        );


        showTestQuestion();

    }
);


// ========================================
// ПОКАЗЫВАЕМ ВОПРОС
// ========================================

function showTestQuestion() {

    if (!testCards.length) {
        return;
    }


    const currentCard =
        testCards[testIndex];


    // Прогресс
    testProgress.textContent =
        (testIndex + 1) +
        " / " +
        testCards.length;


    // Термин
    setRichTextContent(
        testTerm,
        currentCard.term
    );


    // Сбрасываем результат
    testFeedback.textContent = "";

    testFeedback.classList.add(
        "hidden"
    );

    testFeedback.classList.remove(
        "correct",
        "incorrect"
    );


    // Пока не отвечено —
    // "Далее" скрыта
    testNextButton.style.display =
        "none";


    testAnswered = false;

    testSelectedAnswer = null;


    // ========================================
    // ВАРИАНТЫ ОТВЕТА
    // ========================================

    if (testMode === "choice") {

        testOptions.classList.remove(
            "hidden"
        );

        testInputArea.classList.add(
            "hidden"
        );


        showTestOptions();

    }


    // ========================================
    // ВВОД ОТВЕТА
    // ========================================

    else {

        testOptions.classList.add(
            "hidden"
        );

        testInputArea.classList.remove(
            "hidden"
        );


        testAnswerInput.value = "";

        testAnswerInput.disabled = false;

        testCheckButton.disabled = false;


        testAnswerInput.focus();

    }

}


// ========================================
// СОЗДАЁМ ВАРИАНТЫ
// ========================================

function showTestOptions() {

    const currentCard =
        testCards[testIndex];


    const correctAnswer =
        currentCard.answer;


    // Получаем ответы других карточек
    const otherAnswers =
        testCards
            .filter(
                function(card, index) {

                    return index !== testIndex;

                }
            )
            .map(
                function(card) {

                    return card.answer;

                }
            );


    // Убираем дубликаты
    const uniqueAnswers =
        [...new Set(otherAnswers)];


    // Перемешиваем
    const shuffledWrongAnswers =
        shuffleArray(
            uniqueAnswers
        );


    // Берём максимум 3 неправильных
    const wrongAnswers =
        shuffledWrongAnswers.slice(
            0,
            3
        );


    // Добавляем правильный
    const answers = [
        correctAnswer,
        ...wrongAnswers
    ];


    // Перемешиваем варианты
    const shuffledAnswers =
        shuffleArray(answers);


    // Очищаем старые кнопки
    testOptions.innerHTML = "";


    // Создаём новые
    shuffledAnswers.forEach(
        function(answer) {

            const button =
                document.createElement(
                    "button"
                );


            button.className =
                "test-option";


            button.type =
                "button";


            setRichTextContent(
                button,
                answer
            );


            button.addEventListener(
                "click",
                function() {

                    checkTestChoice(
                        button,
                        answer,
                        correctAnswer
                    );

                }
            );


            testOptions.appendChild(
                button
            );

        }
    );

}


// ========================================
// ПРОВЕРЯЕМ ВАРИАНТ
// ========================================

function checkTestChoice(
    selectedButton,
    selectedAnswer,
    correctAnswer
) {

    // Запоминаем выбранный вариант
    testSelectedAnswer = selectedAnswer;


    // Убираем выделение со всех вариантов
    const allButtons =
        testOptions.querySelectorAll(
            ".test-option"
        );


    allButtons.forEach(
        function(button) {

            button.classList.remove(
                "selected"
            );

        }
    );


    // Выделяем новый выбранный вариант
    selectedButton.classList.add(
        "selected"
    );


    // Пока ответ не засчитываем
    testAnswered = false;


    // Показываем кнопку "Далее"
    showTestNextButton();

}


// ========================================
// ПРОВЕРЯЕМ ВВЕДЁННЫЙ ОТВЕТ
// ========================================

function checkTestInput() {

    if (testAnswered) {
        return;
    }


    const currentCard =
        testCards[testIndex];


    const userAnswer =
        normalizeTestAnswer(
            testAnswerInput.value
        );


    const correctAnswer =
        normalizeTestAnswer(
            currentCard.answer
        );


    // Пустое поле
    if (!userAnswer) {

        showTestFeedback(
            "Сначала введи ответ.",
            "incorrect"
        );

        return;
    }


    testAnswered = true;


    testAnswerInput.disabled =
        true;

    testCheckButton.disabled =
        true;


    // Правильно
    if (
        userAnswer ===
        correctAnswer
    ) {

        testScore++;


        showTestFeedback(
            "✓ Правильно!",
            "correct"
        );

    }


    // Неправильно
    else {

        showTestFeedback(
            "✗ Неправильно.<br>" +
            "Правильный ответ: " +
            sanitizeRichHTML(currentCard.answer),
            "incorrect"
        );

    }


    showTestNextButton();

}


// ========================================
// НОРМАЛИЗАЦИЯ ОТВЕТА
// ========================================

function normalizeTestAnswer(answer) {

    return getPlainRichText(answer)
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "");

}


// ========================================
// ПОКАЗЫВАЕМ СООБЩЕНИЕ
// ========================================

function showTestFeedback(
    message,
    type
) {

    testFeedback.innerHTML =
        message;


    testFeedback.classList.remove(
        "hidden"
    );


    testFeedback.classList.remove(
        "correct",
        "incorrect"
    );


    testFeedback.classList.add(
        type
    );

}


// ========================================
// ПОКАЗЫВАЕМ "ДАЛЕЕ"
// ========================================

function showTestNextButton() {

    testNextButton.style.display =
        "block";


    if (
        testIndex ===
        testCards.length - 1
    ) {

        testNextButton.textContent =
            "Завершить";

    } else {

        testNextButton.textContent =
            "Далее →";

    }

}


// ========================================
// КНОПКА "ПРОВЕРИТЬ"
// ========================================

testCheckButton.addEventListener(
    "click",
    function() {

        checkTestInput();

    }
);


// ========================================
// ENTER
// ========================================

testAnswerInput.addEventListener(
    "keydown",
    function(event) {

        if (
            event.key === "Enter" &&
            !testAnswered
        ) {

            checkTestInput();

        }

    }
);


// ========================================
// ДАЛЕЕ
// ========================================

testNextButton.addEventListener(
    "click",
    function() {

        // Для варианта с выбором ответа
        if (testMode === "choice") {

            // Если пользователь ничего не выбрал
            if (testSelectedAnswer === null) {
                return;
            }


            // Если ответ ещё не был засчитан
            if (!testAnswered) {

                const currentCard =
                    testCards[testIndex];


                const correctAnswer =
                    currentCard.answer;


                // Засчитываем ответ только сейчас
                if (
                    testSelectedAnswer ===
                    correctAnswer
                ) {

                    testScore++;

                }


                testAnswered = true;

            }

        }


        // Для ручного ввода ответ уже
        // был проверен кнопкой "Проверить"


        // Последний вопрос
        if (
            testIndex ===
            testCards.length - 1
        ) {

            showTestResult();

            return;

        }


        // Переходим к следующему вопросу
        testIndex++;


        // Сбрасываем выбранный вариант
        testSelectedAnswer = null;

        testAnswered = false;


        showTestQuestion();

    }
);


// ========================================
// РЕЗУЛЬТАТ
// ========================================

function showTestResult() {

    testContent.classList.add(
        "hidden"
    );


    testResult.classList.remove(
        "hidden"
    );


    const total =
        testCards.length;


    const percent =
        Math.round(
            (testScore / total) * 100
        );


    let resultClass = "";

    let resultText = "";

    let stars = "";


    // ========================================
    // 100%
    // ========================================

    if (percent === 100) {

        resultClass =
            "test-result-perfect";

        resultText =
            "Тест пройден!";

        stars =
            "⭐ ✨ ⭐";

    }


    // ========================================
    // 81–99%
    // ========================================

    else if (percent > 80) {

        resultClass =
            "test-result-high";

        resultText =
            "Тест пройден";

    }


    // ========================================
    // 40–80%
    // ========================================

    else if (percent >= 40) {

        resultClass =
            "test-result-medium";

        resultText =
            "Тест пройден";

    }


    // ========================================
    // 0–39%
    // ========================================

    else {

        resultClass =
            "test-result-low";

        resultText =
            "Тест не пройден";

    }


    testResult.innerHTML = `

        <div
            class="test-result-card ${resultClass}"
        >

            ${
                stars
                    ? `
                        <div class="test-stars">
                            ${stars}
                        </div>
                    `
                    : ""
            }


            <div class="test-result-percent">
                ${percent}%
            </div>


            <div class="test-result-text">
                ${resultText}
            </div>


            <div class="test-result-score">
                Правильных ответов:
                ${testScore} из ${total}
            </div>


            <button
                id="test-return-button"
                class="create-button"
                type="button"
            >
                Вернуться к набору
            </button>

        </div>

    `;


    document
        .querySelector("#test-return-button")
        .addEventListener(
            "click",
            function() {

                testPage.classList.add(
                    "hidden"
                );

                setPage.classList.remove(
                    "hidden"
                );

                resetTestPage();

            }
        );

}


// ========================================
// СБРОС ТЕСТА
// ========================================

function resetTestPage() {

    testSetup.classList.remove(
        "hidden"
    );

    testContent.classList.add(
        "hidden"
    );

    testResult.classList.add(
        "hidden"
    );


    testFeedback.classList.add(
        "hidden"
    );


    testNextButton.style.display =
        "none";


    testCheckButton.style.display =
        "block";


    testAnswerInput.disabled =
        false;


    testCheckButton.disabled =
        false;


    testResult.innerHTML =
        "";

}


// ========================================
// НАЗАД ИЗ ТЕСТА
// ========================================

testBackButton.addEventListener(
    "click",
    function() {

        testPage.classList.add(
            "hidden"
        );

        setPage.classList.remove(
            "hidden"
        );

        resetTestPage();

    }
);

// ========================================
// РЕЖИМ "СОПОСТАВЛЕНИЕ"
// ========================================


const matchingPage =
    document.querySelector("#matching-page");

const matchingBackButton =
    document.querySelector("#matching-back-button");

const matchingSetTitle =
    document.querySelector("#matching-set-title");

const matchingProgress =
    document.querySelector("#matching-progress");

const matchingGame =
    document.querySelector("#matching-game");

const matchingTerms =
    document.querySelector("#matching-terms");

const matchingAnswers =
    document.querySelector("#matching-answers");

const matchingNextButton =
    document.querySelector("#matching-next-button");

const matchingResult =
    document.querySelector("#matching-result");


// ========================================
// ДАННЫЕ ИГРЫ
// ========================================

let matchingCards = [];

let matchingRounds = [];

let matchingRoundIndex = 0;

let matchingRoundCards = [];

let matchingFound = 0;

let matchingTotalFound = 0;


// ========================================
// ПЕРЕМЕШИВАНИЕ
// ========================================

function shuffleMatching(array) {

    const shuffled = [...array];

    for (
        let i = shuffled.length - 1;
        i > 0;
        i--
    ) {

        const j =
            Math.floor(
                Math.random() * (i + 1)
            );

        [
            shuffled[i],
            shuffled[j]
        ] =
        [
            shuffled[j],
            shuffled[i]
        ];

    }

    return shuffled;
}


// ========================================
// СОЗДАЁМ РАУНДЫ СОПОСТАВЛЕНИЯ
// ========================================

function createMatchingRounds(cards) {

    const total = cards.length;

    // ========================================
    // 1–7 карточек:
    // всё показываем сразу
    // ========================================

    if (total <= 7) {

        return [
            shuffleMatching(cards)
        ];

    }


    // ========================================
    // Перемешиваем весь набор один раз
    // ========================================

    const shuffledCards =
        shuffleMatching(cards);


    const rounds = [];

    const fullRounds =
        Math.floor(total / 5);

    const remainder =
        total % 5;


    // ========================================
    // Если остаток 0:
    //
    // 10 = 5 + 5
    // 15 = 5 + 5 + 5
    // 20 = 5 + 5 + 5 + 5
    // ========================================

    if (remainder === 0) {

        for (
            let i = 0;
            i < fullRounds;
            i++
        ) {

            rounds.push(
                shuffledCards.slice(
                    i * 5,
                    i * 5 + 5
                )
            );

        }

    }


    // ========================================
    // Остаток 3 или 4:
    //
    // 8  = 5 + 3
    // 9  = 5 + 4
    //
    // 13 = 5 + 5 + 3
    // 14 = 5 + 5 + 4
    // ========================================

    else if (
        remainder === 3 ||
        remainder === 4
    ) {

        // Все обычные пятёрки
        for (
            let i = 0;
            i < fullRounds;
            i++
        ) {

            rounds.push(
                shuffledCards.slice(
                    i * 5,
                    i * 5 + 5
                )
            );

        }


        // Последний остаток
        rounds.push(
            shuffledCards.slice(
                fullRounds * 5
            )
        );

    }


    // ========================================
    // Остаток 1:
    //
    // 11 = 5 + 6
    // 16 = 5 + 5 + 6
    // 21 = 5 + 5 + 5 + 6
    // ========================================

    else if (remainder === 1) {

        // Оставляем все пятёрки,
        // кроме последней.
        for (
            let i = 0;
            i < fullRounds - 1;
            i++
        ) {

            rounds.push(
                shuffledCards.slice(
                    i * 5,
                    i * 5 + 5
                )
            );

        }


        // Последняя пятёрка
        // получает ещё 1 карточку.
        const start =
            (fullRounds - 1) * 5;

        rounds.push(
            shuffledCards.slice(
                start
            )
        );

    }


    // ========================================
    // Остаток 2:
    //
    // 12 = 5 + 7
    // 17 = 5 + 5 + 7
    // 22 = 5 + 5 + 5 + 7
    // ========================================

    else if (remainder === 2) {

        // Оставляем все пятёрки,
        // кроме последней.
        for (
            let i = 0;
            i < fullRounds - 1;
            i++
        ) {

            rounds.push(
                shuffledCards.slice(
                    i * 5,
                    i * 5 + 5
                )
            );

        }


        // Последняя пятёрка
        // получает ещё 2 карточки.
        const start =
            (fullRounds - 1) * 5;

        rounds.push(
            shuffledCards.slice(
                start
            )
        );

    }


    return rounds;

}


// ========================================
// ОТКРЫВАЕМ СОПОСТАВЛЕНИЕ
// ========================================

document
    .querySelectorAll(".mode-card")
    .forEach(
        function(modeButton) {

            modeButton.addEventListener(
                "click",
                function() {

                    const mode =
                        modeButton.dataset.mode;


                    if (
                        mode !== "matching"
                    ) {
                        return;
                    }


                    if (
                        editingSetIndex === null
                    ) {
                        return;
                    }


                    const savedSets =
                        JSON.parse(
                            localStorage.getItem(
                                "chemSets"
                            )
                        ) || [];


                    const set =
                        savedSets[
                            editingSetIndex
                        ];


                    if (
                        !set ||
                        !set.cards ||
                        set.cards.length === 0
                    ) {
                        return;
                    }


                    // Сохраняем карточки
                    matchingCards =
                        [...set.cards];


                    // Создаём раунды
                    matchingRounds =
                        createMatchingRounds(
                            matchingCards
                        );


                    matchingRoundIndex = 0;
                    matchingTotalFound = 0;


                    // Открываем страницу
                    setPage.classList.add(
                        "hidden"
                    );

                    matchingPage.classList.remove(
                        "hidden"
                    );


                    matchingSetTitle.textContent =
                        "🔗 " + set.title;


                    showMatchingRound();

                }
            );

        }
    );


// ========================================
// НАЗАД ИЗ РЕЖИМА СОПОСТАВЛЕНИЯ
// ========================================

matchingBackButton.addEventListener(
    "click",
    function() {

        // Выходим из режима
        matchingPage.classList.add(
            "hidden"
        );

        // Возвращаемся на страницу набора
        setPage.classList.remove(
            "hidden"
        );


        // Сбрасываем состояние игры
        resetMatchingPage();

    }
);

    // ========================================
// ПОКАЗЫВАЕМ РАУНД
// ========================================

function showMatchingRound() {

    matchingTerms.innerHTML = "";
    matchingAnswers.innerHTML = "";

    matchingResult.classList.add(
        "hidden"
    );

    matchingNextButton.classList.add(
        "hidden"
    );


    matchingFound = 0;


    matchingRoundCards =
        matchingRounds[
            matchingRoundIndex
        ];


    if (
        !matchingRoundCards ||
        matchingRoundCards.length === 0
    ) {
        return;
    }


    // ========================================
    // НЕЗАВИСИМО ПЕРЕМЕШИВАЕМ
    // ТЕРМИНЫ И ОТВЕТЫ
    // ========================================

    const shuffledTerms =
        shuffleMatching(
            matchingRoundCards
        );


    const shuffledAnswers =
        shuffleMatching(
            matchingRoundCards
        );


    // ========================================
    // ПРОГРЕСС
    // ========================================

    matchingProgress.textContent =
        matchingTotalFound +
        " / " +
        matchingCards.length;


    // ========================================
    // СОЗДАЁМ ТЕРМИНЫ
    // ========================================

    shuffledTerms.forEach(
        function(card) {

            const row =
                document.createElement(
                    "div"
                );

            row.className =
                "matching-row";


            // --------------------------------
            // ТЕРМИН
            // --------------------------------

            const term =
                document.createElement(
                    "div"
                );

            term.className =
                "matching-term";

            setRichTextContent(
                term,
                card.term
            );


            // --------------------------------
            // МЕСТО ДЛЯ ОТВЕТА
            // --------------------------------

            const dropzone =
                document.createElement(
                    "div"
                );

            dropzone.className =
                "matching-dropzone";


            dropzone.dataset.cardIndex =
                matchingRoundCards.indexOf(
                    card
                );


            // --------------------------------
            // DRAG & DROP
            // --------------------------------

            dropzone.addEventListener(
                "dragover",
                function(event) {

                    event.preventDefault();

                }
            );


            dropzone.addEventListener(
                "drop",
                function(event) {

                    event.preventDefault();

                    handleMatchingDrop(
                        event,
                        dropzone,
                        term
                    );

                }
            );


            row.appendChild(term);
            row.appendChild(dropzone);

            matchingTerms.appendChild(row);

        }
    );


    // ========================================
    // СОЗДАЁМ ОТВЕТЫ
    // ========================================

    shuffledAnswers.forEach(
        function(card) {

            const answer =
                document.createElement(
                    "div"
                );

            answer.className =
                "matching-answer";

            setRichTextContent(
                answer,
                card.answer
            );

            answer.draggable = true;


            answer.dataset.cardIndex =
                matchingRoundCards.indexOf(
                    card
                );


            // --------------------------------
            // НАЧАЛО ПЕРЕТАСКИВАНИЯ
            // --------------------------------

            answer.addEventListener(
                "dragstart",
                function(event) {

                    // Правильную пару
                    // больше нельзя трогать.
                    if (
                        answer.classList.contains(
                            "matched"
                        )
                    ) {

                        event.preventDefault();

                        return;

                    }


                    event.dataTransfer.setData(
                        "text/plain",
                        answer.dataset.cardIndex
                    );


                    event.dataTransfer.effectAllowed =
                        "move";


                    answer.classList.remove(
                        "wrong"
                    );

                }
            );


            matchingAnswers.appendChild(
                answer
            );

        }
    );

}


// ========================================
// ОБРАБОТКА ПЕРЕТАСКИВАНИЯ
// ========================================

function handleMatchingDrop(
    event,
    dropzone,
    term
) {

    const answerIndex =
        Number(
            event.dataTransfer.getData(
                "text/plain"
            )
        );


    const answer =
        document.querySelector(
            `.matching-answer[data-card-index="${answerIndex}"]`
        );


    if (!answer) {
        return;
    }


    // Нельзя вставлять что-то
    // в уже найденную пару.
    if (
        dropzone.classList.contains(
            "matched"
        )
    ) {
        return;
    }


    // ========================================
    // ЕСЛИ В ЯЧЕЙКЕ УЖЕ ЕСТЬ
    // НЕПРАВИЛЬНЫЙ ОТВЕТ
    // ========================================

    const oldAnswer =
        dropzone.querySelector(
            ".matching-answer"
        );


    if (
        oldAnswer &&
        oldAnswer !== answer
    ) {

        // Правильная пара сюда
        // попасть не может.
        if (
            oldAnswer.classList.contains(
                "matched"
            )
        ) {
            return;
        }


        // Возвращаем старый ответ
        // обратно в правую колонку.
        oldAnswer.classList.remove(
            "wrong"
        );

        matchingAnswers.appendChild(
            oldAnswer
        );

    }


    // ========================================
    // ПЕРЕМЕЩАЕМ ОТВЕТ В ЯЧЕЙКУ
    // ========================================

    dropzone.appendChild(
        answer
    );


    // ========================================
    // ПРОВЕРЯЕМ
    // ========================================

    const termIndex =
        Number(
            dropzone.dataset.cardIndex
        );


    const isCorrect =
        answerIndex === termIndex;


    // ========================================
    // ПРАВИЛЬНО
    // ========================================

    if (isCorrect) {

        answer.classList.remove(
            "wrong"
        );

        answer.classList.add(
            "matched"
        );


        answer.draggable = false;


        dropzone.classList.add(
            "matched"
        );


        term.classList.add(
            "matched"
        );


        matchingFound++;
        matchingTotalFound++;

        matchingProgress.textContent =
            matchingTotalFound +
            " / " +
            matchingCards.length;


        // Все пары найдены
        if (
            matchingFound ===
            matchingRoundCards.length
        ) {

            finishMatchingRound();

        }

        return;
    }


    // ========================================
    // НЕПРАВИЛЬНО
    // ========================================
    //
    // Ответ ОСТАЁТСЯ в ячейке.
    // Он краснеет и вздрагивает.
    // Его можно снова перетащить.
    // ========================================

    answer.classList.remove(
        "wrong"
    );


    // Перезапускаем animation,
    // чтобы вздрагивание работало
    // даже при повторной ошибке.
    void answer.offsetWidth;


    answer.classList.add(
        "wrong"
    );

}


// ========================================
// ПРАВИЛЬНОЕ ОКОНЧАНИЕ СЛОВА в результате сопоставления
// ========================================

function getMatchingPlural(number) {

    if (
        number % 10 === 1 &&
        number % 100 !== 11
    ) {

        return "карточку";

    }


    if (
        number % 10 >= 2 &&
        number % 10 <= 4 &&
        (
            number % 100 < 10 ||
            number % 100 >= 20
        )
    ) {

        return "карточки";

    }


    return "карточек";

}

// ========================================
// ЗАВЕРШЕНИЕ РАУНДА
// ========================================

function finishMatchingRound() {

    // Если это последний раунд —
    // показываем только финальный результат.
    if (
        matchingRoundIndex >=
        matchingRounds.length - 1
    ) {

        showMatchingResult();

        return;
    }


    // Раунд решён.
    // Игровое поле оставляем на экране.
    // Просто показываем кнопку "Далее".

    matchingNextButton.classList.remove(
        "hidden"
    );

}


// ========================================
// КНОПКА "ДАЛЕЕ"
// ========================================

matchingNextButton.addEventListener(
    "click",
    function() {

        // Пока все пары текущего раунда
        // не найдены — переход запрещён.

        if (
            matchingFound !==
            matchingRoundCards.length
        ) {

            return;

        }


        // Переходим к следующему раунду
        matchingRoundIndex++;


        // Прячем кнопку
        matchingNextButton.classList.add(
            "hidden"
        );


        // Следующий раунд снова показывает
        // прогресс и игровое поле.

        matchingProgress.classList.remove(
            "hidden"
        );

        matchingGame.classList.remove(
            "hidden"
        );

        matchingResult.classList.add(
            "hidden"
        );


        showMatchingRound();

    }
);


// ========================================
// РЕЗУЛЬТАТ
// ========================================

function showMatchingResult() {

    matchingGame.classList.add(
        "hidden"
    );

    matchingNextButton.classList.add(
        "hidden"
    );

    matchingProgress.classList.add(
        "hidden"
    );


    matchingResult.classList.remove(
        "hidden"
    );


    matchingResult.innerHTML = `

        <div class="matching-result-card">

            <h2>
                🎉 Всё сопоставлено!
            </h2>

            <p>
                Ты правильно соединил
                все термины и ответы.
            </p>

            <button
                id="matching-return-button"
                class="create-button"
                type="button"
            >
                Вернуться к набору
            </button>

        </div>

    `;


    document
        .querySelector("#matching-return-button")
        .addEventListener(
            "click",
            function() {

                matchingPage.classList.add(
                    "hidden"
                );

                setPage.classList.remove(
                    "hidden"
                );

                resetMatchingPage();

            }
        );

}


// ========================================
// СБРОС
// ========================================

function resetMatchingPage() {

    matchingRoundIndex = 0;
    matchingRoundCards = [];
    matchingFound = 0;
    matchingTotalFound = 0;
    matchingRounds = [];

    matchingGame.classList.remove(
        "hidden"
    );

    matchingProgress.classList.remove(
        "hidden"
    );

    matchingResult.classList.add(
        "hidden"
    );

    matchingNextButton.classList.add(
        "hidden"
    );

    matchingTerms.innerHTML = "";
    matchingAnswers.innerHTML = "";

}

// ========================================
// РЕЖИМ "ГРУППОВАЯ СОРТИРОВКА"
// ========================================

const groupingPage =
    document.querySelector(
        "#grouping-page"
    );

const groupingBackButton =
    document.querySelector(
        "#grouping-back-button"
    );

const groupingSetTitle =
    document.querySelector(
        "#grouping-set-title"
    );

const groupingProgress =
    document.querySelector(
        "#grouping-progress"
    );

const groupingItems =
    document.querySelector(
        "#grouping-items"
    );

const groupingGroups =
    document.querySelector(
        "#grouping-groups"
    );

const groupingResult =
    document.querySelector(
        "#grouping-result"
    );


let groupingData = [];

let groupingTotalItems = 0;

let groupingCorrectItems = 0;


// ========================================
// ОТКРЫТИЕ РЕЖИМА
// ========================================

document
    .querySelectorAll(".mode-card")
    .forEach(
        function(modeButton) {

            modeButton.addEventListener(
                "click",
                function() {

                    if (
                        modeButton.dataset.mode !==
                        "grouping"
                    ) {
                        return;
                    }


                    if (
                        editingSetIndex === null
                    ) {
                        return;
                    }


                    const savedSets =
                        JSON.parse(
                            localStorage.getItem(
                                "chemSets"
                            )
                        ) || [];


                    const set =
                        savedSets[
                            editingSetIndex
                        ];


                    if (
                        !set ||
                        set.type !==
                        "grouping"
                    ) {
                        return;
                    }


                    groupingData =
                        set.groups;


                    groupingTotalItems =
                        groupingData.reduce(
                            function(total, group) {

                                return total +
                                    group.items.length;

                            },
                            0
                        );


                    groupingCorrectItems = 0;


                    setPage
                        .classList
                        .add("hidden");

                    groupingPage
                        .classList
                        .remove("hidden");


                    groupingSetTitle.textContent =
                        "🗂️ " + set.title;


                    groupingResult
                        .classList
                        .add("hidden");


                    groupingItems
                        .classList
                        .remove("hidden");

                    groupingGroups
                        .classList
                        .remove("hidden");


                    showGroupingGame();

                }
            );

        }
    );


// ========================================
// ПОКАЗ ИГРЫ
// ========================================

function showGroupingGame() {

    groupingItems.innerHTML = "";
    groupingGroups.innerHTML = "";


    // Определяем количество групп
    groupingGroups.classList.remove(
        "grouping-count-5",
        "grouping-count-6",
        "grouping-count-7",
        "grouping-count-8"
    );

    if (
        groupingData.length >= 5 &&
        groupingData.length <= 8
    ) {
        groupingGroups.classList.add(
            "grouping-count-" +
            groupingData.length
        );
    }

    groupingProgress.textContent =
        "0 / " +
        groupingTotalItems;


    // ========================================
    // СОЗДАЁМ ВСЕ КАРТОЧКИ
    // ========================================

    const allItems = [];

    groupingData.forEach(
        function(group, groupIndex) {
            group.items.forEach(
                function(item, itemIndex) {
                    allItems.push({
                        id:
                            groupIndex +
                            "-" +
                            itemIndex,
                        text: item,
                        groupIndex:
                            groupIndex
                    });
                }
            );
        }
    );


    const shuffledItems =
        shuffleArray(allItems);


    shuffledItems.forEach(
        function(item, index) {

            const card =
                document.createElement("div");


            card.className =
                "grouping-item";


            setRichTextContent(
                card,
                item.text
            );


            card.draggable = true;


            card.dataset.groupIndex =
                item.groupIndex;

            card.dataset.itemIndex =
                index;

            card.dataset.itemId =
                item.id;


            // --------------------------------
            // DRAG START
            // --------------------------------

            card.addEventListener(
                "dragstart",
                function(event) {

                    if (
                        card.classList.contains(
                            "grouping-correct"
                        )
                    ) {

                        event.preventDefault();

                        return;

                    }


                    event.dataTransfer
                        .setData(
                            "text/plain",
                            item.id
                        );

                    card.classList.add(
                        "grouping-dragging"
                    );

                }
            );


            card.addEventListener(
                "dragend",
                function() {

                    card.classList.remove(
                        "grouping-dragging"
                    );

                }
            );


            groupingItems.appendChild(
                card
            );

        }
    );


    // ========================================
    // СОЗДАЁМ ГРУППЫ
    // ========================================

    groupingData.forEach(
        function(group, groupIndex) {

            const groupElement =
                document.createElement(
                    "div"
                );


            groupElement.className =
                "grouping-target";


            groupElement.dataset.groupIndex =
                groupIndex;


            groupElement.innerHTML = `

                <h2 class="grouping-target-title"></h2>

                <div
                    class="grouping-target-items"
                >
                    <div
                        class="grouping-drop-hint"
                    >
                        Перетащи элементы сюда
                    </div>
                </div>

            `;


            setRichTextContent(
                groupElement.querySelector(
                    ".grouping-target-title"
                ),
                group.title
            );


            const target =
                groupElement.querySelector(
                    ".grouping-target-items"
                );


            // --------------------------------
            // НАД ГРУППОЙ
            // --------------------------------

            target.addEventListener(
                "dragover",
                function(event) {

                    event.preventDefault();

                    target.classList.add(
                        "grouping-drag-over"
                    );

                }
            );


            target.addEventListener(
                "dragleave",
                function() {

                    target.classList.remove(
                        "grouping-drag-over"
                    );

                }
            );


            // --------------------------------
            // БРОСАЕМ КАРТОЧКУ
            // --------------------------------

            target.addEventListener(
                "drop",
                function(event) {

                    event.preventDefault();


                    target.classList.remove(
                        "grouping-drag-over"
                    );


                    const itemId =
                        event.dataTransfer.getData(
                            "text/plain"
                        );

                    const card =
                        document.querySelector(
                            `.grouping-item[data-item-id="${itemId}"]`
                        );


                    if (!card) {
                        return;
                    }


                    const correctGroup =
                        Number(
                            card.dataset.groupIndex
                        );


                    const targetGroup =
                        Number(
                            groupElement.dataset
                                .groupIndex
                        );


                    // ========================================
                    // ПЕРЕМЕЩАЕМ В ГРУППУ
                    // ========================================

                    target.appendChild(
                        card
                    );


                    // ========================================
                    // ПРАВИЛЬНО
                    // ========================================

                    if (
                        correctGroup ===
                        targetGroup
                    ) {

                        // Если карточка до этого была в неправильной группе,
                        // убираем красное состояние
                        card.classList.remove(
                            "grouping-wrong"
                        );

                        // Теперь показываем правильное состояние
                        card.classList.add(
                            "grouping-correct"
                        );

                        card.draggable = false;


                        groupingCorrectItems++;


                        groupingProgress.textContent =
                            groupingCorrectItems +
                            " / " +
                            groupingTotalItems;


                        if (
                            groupingCorrectItems ===
                            groupingTotalItems
                        ) {

                            showGroupingResult();

                        }


                        return;

                    }


                    // ========================================
                    // НЕПРАВИЛЬНО
                    // ========================================

                    card.classList.remove(
                        "grouping-wrong"
                    );


                    void card.offsetWidth;


                    card.classList.add(
                        "grouping-wrong"
                    );

                }
            );


            groupingGroups.appendChild(
                groupElement
            );

        }
    );

}


// ========================================
// ФИНАЛЬНЫЙ РЕЗУЛЬТАТ
// ========================================

function showGroupingResult() {

    groupingItems
        .classList
        .add("hidden");

    groupingGroups
        .classList
        .add("hidden");


    groupingProgress
        .classList
        .add("hidden");


    groupingResult
        .classList
        .remove("hidden");


    groupingResult.innerHTML = `

        <div class="grouping-result-card">

            <h2>
                🎉 Всё распределено!
            </h2>

            <p>
                Ты правильно распределил
                все элементы по группам.
            </p>

            <button
                id="grouping-return-button"
                class="create-button"
                type="button"
            >
                Вернуться к набору
            </button>

        </div>

    `;


    document
        .querySelector(
            "#grouping-return-button"
        )
        .addEventListener(
            "click",
            function() {

                groupingPage
                    .classList
                    .add("hidden");

                setPage
                    .classList
                    .remove("hidden");

                resetGroupingPage();

            }
        );

}


// ========================================
// НАЗАД
// ========================================

groupingBackButton.addEventListener(
    "click",
    function() {

        groupingPage
            .classList
            .add("hidden");

        setPage
            .classList
            .remove("hidden");

        resetGroupingPage();

    }
);


// ========================================
// СБРОС
// ========================================

function resetGroupingPage() {

    groupingData = [];

    groupingTotalItems = 0;

    groupingCorrectItems = 0;


    groupingItems.innerHTML = "";
    groupingGroups.innerHTML = "";


    groupingItems
        .classList
        .remove("hidden");

    groupingGroups
        .classList
        .remove("hidden");

    groupingProgress
        .classList
        .remove("hidden");

    groupingResult
        .classList
        .add("hidden");

}