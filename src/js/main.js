import { localeList } from "./locale/locale_files/locale_list.js";
import { LocaleManager } from "./locale/locale_manager.js";
import { setupMainMenu } from "./main_menu.js";
import { isMobile } from "./is_mobile.js";

let selectedLocale = "en";
for (const lan of navigator.languages) {
    if (localeList[lan] !== undefined) {
        selectedLocale = lan;
    }
}
const lan = localStorage.getItem("language");
if (lan !== null) {
    selectedLocale = lan;
}

const localeManager = new LocaleManager(selectedLocale);
// apply language to all elements
for (const el of document.querySelectorAll("*")) {
    if (el.hasAttribute("translate-path")) {
        localeManager.bindObjectProperty(el, "textContent", el.getAttribute("translate-path"));
    }
}

const languageSelect = document.getElementById("language_select");
for (const lan of Object.keys(localeList)) {
    const option = document.createElement("option");
    const languageSelectPrompt = document.createElement("span");
    localeManager.bindObjectProperty(languageSelectPrompt, "textContent", "locale.menuButtons.selectedLanguage");
    const languageName = document.createElement("span");
    languageName.textContent = localeList[lan].localeName;
    option.value = lan;
    option.appendChild(languageSelectPrompt);
    option.appendChild(languageName);
    languageSelect.appendChild(option);
}
languageSelect.value = selectedLocale;
languageSelect.onchange = () => {
    localeManager.changeGlobalLocale(languageSelect.value);
    localStorage.setItem("language", languageSelect.value);
}

if (!isMobile) {
    document.getElementsByClassName("main")[0].classList.add("pc");
}

setupMainMenu(localeManager);