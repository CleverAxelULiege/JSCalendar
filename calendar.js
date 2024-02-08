import { SmartInput } from "./SmartInput.js";

class CalendarInput {
    /**
     * @param {HTMLDivElement} mainSelector 
     * @param {string} dayPlaceHolder 
     * @param {string} monthPlaceHolder 
     * @param {string} yearPlaceHolder 
     * @param {string} separatorPlaceHolder 
     */
    constructor(mainSelector, dayPlaceHolder, monthPlaceHolder, yearPlaceHolder, separatorPlaceHolder) {
        this.dayPlaceHolder = dayPlaceHolder;
        this.monthPlaceHolder = monthPlaceHolder;
        this.yearPlaceHolder = yearPlaceHolder;
        this.separatorPlaceHolder = separatorPlaceHolder;


        /**
         * Date d'aujourd'hui, normalement fixe
         * @type {Date}
        */
        this.todayDate = new Date();

        /**
         * @type {HTMLDivElement}
        */
        this.mainSelector = mainSelector;
        this.mainSelector.setAttribute("data-active", "false");

        /** @type {HTMLInputElement}*/
        this.inputTxtCalendar = mainSelector.querySelector("input[type=tel]");

        if(this.inputTxtCalendar == null){
            window.alert("Error the input needs to be of type 'tel' for the input date");
        }

        
        /**
         * Date sélectionnée par l'input ou l'utilisateur
         * @type {Date|null}
        */
       this.selectedDate = null;
       
       if(this.checkIfDateFromInputIsValid(this.inputTxtCalendar.value)){
           this.selectedDate = this.getDateFromInput();
           this.setDateInInput();
        } else {
            this.selectedDate = new Date();
            if(this.inputTxtCalendar.value != "" || (this.inputTxtCalendar.value == "" && mainSelector.getAttribute("data-set-today-date-if-blank") == "true")){
                this.setDateInInput();
            }
        }
        
        this.smartInput = new SmartInput(this.inputTxtCalendar, dayPlaceHolder, monthPlaceHolder, yearPlaceHolder, separatorPlaceHolder, this.callBackUpdateCalendar());
        this.maxYearSelectable = mainSelector.getAttribute("data-max-year-selectable") ? parseInt(mainSelector.getAttribute("data-max-year-selectable")) : this.todayDate.getFullYear();
        this.minYearSelectable = mainSelector.getAttribute("data-min-year-selectable") ? parseInt(mainSelector.getAttribute("data-min-year-selectable")) : 1900;


        /**
         * Le calendrier sélectionné quand l'on change de mois/année sans toucher à selectedDate
         * @type {Date}
         */
        this.selectedCalendar = new Date(this.selectedDate.getFullYear(), this.selectedDate.getMonth(), 1);

        this.createBaseCalendar();
        this.addEventListenerToSelects();
        this.addEventListenerToButtonsInsideCalendar();
        this.addEventListenerToButtonToggle();

        this.inputTxtCalendar.addEventListener("blur", () => {
            //nextElementSibling doit être l'input hidden.
            if (this.inputTxtCalendar.nextElementSibling.value != "" && !this.checkIfDateFromInputIsValid(this.inputTxtCalendar.nextElementSibling.value)) {
                this.invalidDate();
            } else {
                this.inputTxtCalendar.classList.remove("invalid");
            }
        });

        this.updateCalendarAndSetNewMonth();

    }

    /**
     * Regarde si la date venant de l'input est dans un format valide et est valide
     * @param {string} inputValue 
     */
    checkIfDateFromInputIsValid(inputValue) {
        if (inputValue.trim() == "") {
            return false
        }

        let inputWithoutSeparator = this.removeSeparatorsFromInput(inputValue);

        if (inputWithoutSeparator.length != 8) {
            return false
        }

        let year = parseInt(inputWithoutSeparator.substring(4, 10));
        let month = parseInt(inputWithoutSeparator.substring(2, 4));
        let day = parseInt(inputWithoutSeparator.substring(0, 2));

        if (isNaN(year) || isNaN(month) || isNaN(day)) {
            return false
        }

        if (this.minYearSelectable != null && this.maxYearSelectable != null) {
            if (year < this.minYearSelectable || year > this.maxYearSelectable) {
                return false;
            }
        }

        return this.isDateValid(year, month, day);
    }

    isDateValid(year, month, day) {
        month = month - 1;
        if ([0, 2, 4, 6, 7, 9, 11].includes(month) && day <= 31) {
            return true;
        }

        if ([3, 5, 8, 10].includes(month) && day <= 30) {
            return true
        }

        if (month == 1 && ((year % 4 == 0 && year % 100 != 0) || year % 400 == 0) && day <= 29) {
            return true;
        }

        if (month == 1 && day <= 28) {
            return true;
        }

        return false;
    }

    getDateFromInput() {
        let inputWithoutSeparator = this.removeSeparatorsFromInput(this.inputTxtCalendar.value);
        let year = parseInt(inputWithoutSeparator.substring(4, 10));
        let month = parseInt(inputWithoutSeparator.substring(2, 4));
        let day = parseInt(inputWithoutSeparator.substring(0, 2));

        return new Date(year, month - 1, day);
    }

    /**
     * Formate la date dd mm yyyy dans l'input
     */
    setDateInInput() {
        let month = this.selectedDate.getMonth() + 1;
        let day = this.selectedDate.getDate();
        this.inputTxtCalendar.value = `${(day < 10 ? "0" + day : day).toString()}${this.separatorPlaceHolder}${(month < 10 ? "0" + month : month).toString()}${this.separatorPlaceHolder}${this.selectedDate.getFullYear().toString()}`;
    }

    setSelectedDate(year, month, day) {
        this.selectedDate.setFullYear(year);
        this.selectedDate.setMonth(month);
        this.selectedDate.setDate(day);
    }

    setSelectedDateFromInput() {
        this.selectedDate = this.getDateFromInput();
    }

    /**
     * @param {string} inputValue 
     * @returns {string} La date de l'input sans séparateurs "/" ou "-"
     */
    removeSeparatorsFromInput(inputValue) {
        return inputValue.replace(/\//g, "").replace(/-/g, "");
    }



    /*******************************************************
     * Cette partie permet de créer le calendrier de base.
     * Les boutons prev/next pour permettre d'avancer d'un mois/année
     * Ou des select pour choisir l'année précise/mois précis.
     * C'est ici aussi que l'on crée les labels des jours de la semaine
     *******************************************************/
    createBaseCalendar() {
        let table = document.createElement("table");
        table.classList.add("calendar")
        table.style.display = "none";

        let tbody = document.createElement("tbody");
        tbody.appendChild(this.createSelectMonthYear());
        tbody.appendChild(this.createWeekDaysName());

        table.appendChild(tbody);
        this.mainSelector.appendChild(table);

    }

    createSelectMonthYear() {
        let tr = document.createElement("tr")
        tr.classList.add("month_year_container")
        let td = document.createElement("td");
        td.classList.add("month_year");
        td.setAttribute("colspan", 7);

        //contiendra les boutons/select pour changer de mois/année
        let divContainer = document.createElement("div");

        //divPrev & divNext contiennent les boutons pour avancer d'un mois/année
        let divPrev = document.createElement("div");
        let divNext = document.createElement("div");
        divPrev.classList.add("prev");
        divNext.classList.add("next");
        divPrev.appendChild(this.createButtonMonthYear("prev_year", `<svg width="22" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--!Font Awesome Free 6.5.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M493.6 445c-11.2 5.3-24.5 3.6-34.1-4.4L288 297.7V416c0 12.4-7.2 23.7-18.4 29s-24.5 3.6-34.1-4.4L64 297.7V416c0 17.7-14.3 32-32 32s-32-14.3-32-32V96C0 78.3 14.3 64 32 64s32 14.3 32 32V214.3L235.5 71.4c9.5-7.9 22.8-9.7 34.1-4.4S288 83.6 288 96V214.3L459.5 71.4c9.5-7.9 22.8-9.7 34.1-4.4S512 83.6 512 96V416c0 12.4-7.2 23.7-18.4 29z"/></svg>`));
        divPrev.appendChild(this.createButtonMonthYear("prev_month", `<svg width="15" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512"><!--!Font Awesome Free 6.5.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M267.5 440.6c9.5 7.9 22.8 9.7 34.1 4.4s18.4-16.6 18.4-29V96c0-12.4-7.2-23.7-18.4-29s-24.5-3.6-34.1 4.4l-192 160L64 241V96c0-17.7-14.3-32-32-32S0 78.3 0 96V416c0 17.7 14.3 32 32 32s32-14.3 32-32V271l11.5 9.6 192 160z"/></svg>`));

        divNext.appendChild(this.createButtonMonthYear("next_month", `<svg width="15" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512"><!--!Font Awesome Free 6.5.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M52.5 440.6c-9.5 7.9-22.8 9.7-34.1 4.4S0 428.4 0 416V96C0 83.6 7.2 72.3 18.4 67s24.5-3.6 34.1 4.4l192 160L256 241V96c0-17.7 14.3-32 32-32s32 14.3 32 32V416c0 17.7-14.3 32-32 32s-32-14.3-32-32V271l-11.5 9.6-192 160z"/></svg>`));
        divNext.appendChild(this.createButtonMonthYear("next_year", `<svg width="22" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--!Font Awesome Free 6.5.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M18.4 445c11.2 5.3 24.5 3.6 34.1-4.4L224 297.7V416c0 12.4 7.2 23.7 18.4 29s24.5 3.6 34.1-4.4L448 297.7V416c0 17.7 14.3 32 32 32s32-14.3 32-32V96c0-17.7-14.3-32-32-32s-32 14.3-32 32V214.3L276.5 71.4c-9.5-7.9-22.8-9.7-34.1-4.4S224 83.6 224 96V214.3L52.5 71.4c-9.5-7.9-22.8-9.7-34.1-4.4S0 83.6 0 96V416c0 12.4 7.2 23.7 18.4 29z"/></svg>    `));

        divContainer.appendChild(divPrev);
        divContainer.appendChild(divNext);

        divContainer.appendChild(this.createSelectMonth(this.selectedDate.getMonth()));
        divContainer.appendChild(this.createSelectYear(
            this.minYearSelectable,
            this.maxYearSelectable,
            this.selectedDate.getFullYear())
        );

        let divTodaySelectedDate = document.createElement("div");
        divTodaySelectedDate.classList.add("buttons_today_selected_date_container")
        divTodaySelectedDate.appendChild(this.createButtonTodaySelectedDate("Revenir à aujourd'hui", () => {
            this.selectedCalendar.setFullYear(this.todayDate.getFullYear(), this.todayDate.getMonth(), this.todayDate.getDate());
        }));

        divTodaySelectedDate.appendChild(this.createButtonTodaySelectedDate("Revenir à la date sélectionnée", () => {
            this.selectedCalendar.setFullYear(this.selectedDate.getFullYear(), this.selectedDate.getMonth(), this.selectedDate.getDate());
        }));
        td.appendChild(divContainer);
        td.appendChild(divTodaySelectedDate);
        tr.appendChild(td);

        return tr;
    }


    createButtonTodaySelectedDate(innerText, functionEvent) {
        let button = document.createElement("button");
        button.innerText = innerText;
        button.addEventListener("click", (e) => {
            e.preventDefault();
            functionEvent();
            this.updateCalendarAndSetNewMonth();
            this.updateSelectYearMonth();
        })
        return button;
    }

    /**
     * Permet de créer un bouton pour avancer d'un mois ou une année
     * @param {string} className 
     * @param {string} inner 
     * @returns 
     */
    createButtonMonthYear(className, inner) {
        let button = document.createElement("button");
        button.classList.add(className);
        button.innerHTML = inner;

        return button;
    }

    createSelectYear(startYear, endYear, selectedYear) {
        let selectYear = document.createElement("select");
        selectYear.setAttribute("id", "select_year");

        for (let i = startYear; i <= endYear; i++) {
            let option = document.createElement("option");
            option.value = i.toString();
            option.textContent = i;
            option.selected = selectedYear == i;
            selectYear.appendChild(option);
        }

        return selectYear;
    }

    createSelectMonth(selectedMonth) {
        const monthes = [
            "Janvier",
            "Février",
            "Mars",
            "Avril",
            "Mai",
            "Juin",
            "Juillet",
            "Août",
            "Septembre",
            "Octobre",
            "Novembre",
            "Décembre"
        ];

        let selectMonth = document.createElement("select");
        selectMonth.setAttribute("id", "select_month");
        for (let i = 0; i < monthes.length; i++) {
            let option = document.createElement("option");
            option.value = i;
            option.textContent = monthes[i];
            option.selected = i == selectedMonth;
            selectMonth.appendChild(option);
        }

        return selectMonth;
    }

    createWeekDaysName() {
        const days = [
            "LUN",
            "MAR",
            "MER",
            "JEU",
            "VEN",
            "SAM",
            "DIM"
        ];

        let tr = document.createElement("tr");
        for (let i = 0; i < days.length; i++) {
            let td = document.createElement("td");
            td.innerText = days[i];
            tr.appendChild(td);
        }

        return tr;
    }
    /*******************************************************
     * Fin du calendrier de base
     *******************************************************/

    addEventListenerToSelects() {
        let selectYear = this.mainSelector.querySelector("#select_year");
        let selectMonth = this.mainSelector.querySelector("#select_month");

        selectYear.addEventListener("change", (e) => {
            this.selectedCalendar.setFullYear(selectYear.value);
            this.updateCalendarAndSetNewMonth();
        });

        selectMonth.addEventListener("change", () => {
            this.selectedCalendar.setMonth(selectMonth.value);
            this.updateCalendarAndSetNewMonth();
        });
    }

    addEventListenerToButtonToggle() {
        let calendar = this.mainSelector.querySelector(".calendar");
        if (calendar == null) {
            window.alert("calendar null");
            return;
        }

        this.mainSelector.querySelector("#toggle_button").addEventListener("click", (e) => {
            e.preventDefault();
            if (calendar.style.display == "none") {
                calendar.style.display = "block";
                this.mainSelector.setAttribute("data-active", "true");
            } else {
                calendar.style.display = "none";
                this.mainSelector.setAttribute("data-active", "false");
            }
        });
    }

    addEventListenerToButtonsInsideCalendar() {
        this.mainSelector.querySelector(".prev_year").addEventListener("click", (e) => {
            e.preventDefault();
            this.prevOrNextMonthOrYear(-1, "year");
            this.updateCalendarAndSetNewMonth();
        });

        this.mainSelector.querySelector(".next_year").addEventListener("click", (e) => {
            e.preventDefault();
            this.prevOrNextMonthOrYear(1, "year");
            this.updateCalendarAndSetNewMonth();
        });

        this.mainSelector.querySelector(".prev_month").addEventListener("click", (e) => {
            e.preventDefault();
            this.prevOrNextMonthOrYear(-1, "month");
            this.updateCalendarAndSetNewMonth();
        });

        this.mainSelector.querySelector(".next_month").addEventListener("click", (e) => {
            e.preventDefault();

            this.prevOrNextMonthOrYear(1, "month");
            this.updateCalendarAndSetNewMonth();
        });
    }

    invalidDate() {
        this.inputTxtCalendar.classList.add("invalid");
        this.inputTxtCalendar.classList.add("animate");

        this.inputTxtCalendar.addEventListener("animationend", () => { this.inputTxtCalendar.classList.remove("animate") }, { once: true });
    }

    callBackUpdateCalendar() {
        return (inputValue) => {
            if (!this.checkIfDateFromInputIsValid(inputValue) && /(\d{2})(.)(\d{2})(.)(\d{4})/.test(inputValue)) {
                this.invalidDate();
            }

            if (this.checkIfDateFromInputIsValid(inputValue)) {
                this.setSelectedDateFromInput();
                this.selectedCalendar.setFullYear(this.selectedDate.getFullYear(), this.selectedDate.getMonth(), this.selectedDate.getDate());
                this.updateCalendarAndSetNewMonth();
                this.updateSelectYearMonth();
                this.inputTxtCalendar.classList.remove("invalid");
            }
        }
    }

    prevOrNextMonthOrYear(step, target) {
        if (step != 1 && step != -1)
            throw new Error("The step should be 1 or -1");

        let year = this.selectedCalendar.getFullYear();
        let month = this.selectedCalendar.getMonth();

        if (target == "month") {
            this.selectedCalendar.setMonth(month + step);
        }
        else if (target == "year") {
            this.selectedCalendar.setFullYear(year + step);
        } else {
            throw new Error("The target should be 'month' or 'year'");
        }


        //sers de rollback
        if (step == -1) {
            if (this.selectedCalendar.getFullYear() < this.minYearSelectable) {
                this.selectedCalendar.setMonth(month);
                this.selectedCalendar.setFullYear(year);
                console.log(this.selectedCalendar);
            }
        } else if (step == 1) {
            if (this.selectedCalendar.getFullYear() > this.maxYearSelectable) {
                this.selectedCalendar.setMonth(month);
                this.selectedCalendar.setFullYear(year);
            }
        }

        this.updateSelectYearMonth();
    }

    updateSelectYearMonth() {
        this.mainSelector.querySelector('#select_month option[value="' + this.selectedCalendar.getMonth() + '"]').selected = true;
        this.mainSelector.querySelector('#select_year option[value="' + this.selectedCalendar.getFullYear() + '"]').selected = true;
    }

    /***************************************************/

    updateCalendarAndSetNewMonth() {
        this.updateCalendar();
        this.createRowsOfDays();
    }

    updateCalendar() {
        let table = this.mainSelector.querySelector("table");
        let numberRows = table.querySelectorAll(".number_row");

        numberRows.forEach((row) => {
            table.removeChild(row);
        });
    }

    getDaysInMonth(month, year) {
        if ([0, 2, 4, 6, 7, 9, 11].includes(month)) {
            return 31;
        }

        if ([3, 5, 8, 10].includes(month)) {
            return 30
        }

        if (month == 1 && ((year % 4 == 0 && year % 100 != 0) || year % 400 == 0)) {
            return 29;
        }
        return 28;
    }

    createRowsOfDays() {
        let table = this.mainSelector.querySelector("table");
        let daysInMonth = this.getDaysInMonth(this.selectedCalendar.getMonth(), this.selectedCalendar.getFullYear());
        //met au premier jour du mois
        this.selectedCalendar.setDate(1);

        /**
         * Je recherche le premier jour du mois (Lundi, mardi etc..).
         * Cette condition sert à modifier l'OFFSET mis en place par les américains pour eux le premier
         * jour de la semaine(donc == 0) est le dimanche, donc je remets le lundi à == 0.
         */
        let firstDayOfMonth = this.selectedCalendar.getDay() == 0 ? 6 : this.selectedCalendar.getDay() - 1;
        let nbrRows = 0;
        let counterDay = 1;

        while (counterDay <= daysInMonth) {
            let tr = document.createElement("tr");
            tr.classList.add("number_row");

            //si counterDay == 1, cela veut dire que c'est la première semaine
            //et que le premier jour n'est pas forcément un lundi donc j'attends
            //d'être au bon jour de la semaine dans la boucle for
            if (counterDay == 1) {
                for (let i = 0; i < 7; i++) {
                    let td = document.createElement("td");

                    //i a atteint le jour (Lundi, mardi, etc..) auquel le mois commence je peux commencer à incrémenter le compteur du nombre de jour dans le mois
                    if (i >= firstDayOfMonth) {
                        td.appendChild(this.createButtonForNumberDay(this.selectedCalendar.getFullYear(), this.selectedCalendar.getMonth(), counterDay));
                        td.classList.add("number_day");

                        if (this.isSelectedDate(this.selectedCalendar.getFullYear(), this.selectedCalendar.getMonth(), counterDay)) {
                            td.classList.add("selected_date");
                        }
                        if (this.isToday(this.selectedCalendar.getFullYear(), this.selectedCalendar.getMonth(), counterDay)) {
                            td.classList.add("today_date");
                        }

                        counterDay++;
                    }

                    tr.appendChild(td);
                }
            } else {
                for (let i = 0; i < 7; i++) {
                    let td = document.createElement("td");

                    //ne pas dépasser le nombre de jour dans le mois
                    if (counterDay <= daysInMonth) {
                        td.appendChild(this.createButtonForNumberDay(this.selectedCalendar.getFullYear(), this.selectedCalendar.getMonth(), counterDay));
                        td.classList.add("number_day");

                        if (this.isSelectedDate(this.selectedCalendar.getFullYear(), this.selectedCalendar.getMonth(), counterDay)) {
                            td.classList.add("selected_date");
                        }
                        if (this.isToday(this.selectedCalendar.getFullYear(), this.selectedCalendar.getMonth(), counterDay)) {
                            td.classList.add("today_date");
                        }
                    }

                    tr.appendChild(td);
                    counterDay++;
                }
            }
            table.appendChild(tr);
            nbrRows++;
        }

        //Les mois n'ont pas le même nombre de "ligne"
        //Cette fonction n'est là que pour être purement esthétique pour éviter
        //que le calendrier ne change de hauteur.
        while (nbrRows < 6) {
            this.createAdditionnalEmptyRow(table);
            nbrRows++;
        }
    }

    createButtonForNumberDay(year, month, counterDay) {
        let button = document.createElement("button");
        button.innerText = counterDay.toString();

        button.addEventListener("click", (e) => {
            e.preventDefault();
            this.inputTxtCalendar.classList.remove("invalid");
            let selected = this.mainSelector.querySelector(".selected_date");
            if (selected) {
                selected.classList.remove("selected_date");
            }
            button.parentElement.classList.add("selected_date");
            this.setSelectedDate(year, month, counterDay);
            this.setDateInInput();
        });
        return button;
    }

    createAdditionnalEmptyRow(tableToAppend) {
        let tr = document.createElement("tr");
        tr.classList.add("number_row");
        let td = document.createElement("td");
        td.setAttribute("colspan", "7");
        tr.appendChild(td);
        tableToAppend.appendChild(tr);
    }

    isSelectedDate(year, month, day) {
        return year == this.selectedDate.getFullYear() && month == this.selectedDate.getMonth() && day == this.selectedDate.getDate();
    }

    isToday(year, month, day) {
        return year == this.todayDate.getFullYear() && month == this.todayDate.getMonth() && day == this.todayDate.getDate();
    }

}

// let calendar = new CalendarInput(document.querySelector(".calendar_input"));
let calendarsArray = new Array();

/**
 * @param {string} day 
 * @param {string} month 
 * @param {string} year 
 * @param {string} separator 
 */
function validatePlaceHolders(day, month, year, separator){
    if(day.length != 2){
        throw new Error("The day placeholder must have a length of 2 characters");
    }
    if(month.length != 2){
        throw new Error("The month placeholder must have a length of 2 characters");
    }
    if(year.length != 4){
        throw new Error("The year placeholder must have a length of 4 characters");
    }
    if(separator.length != 1){
        throw new Error("The separator placeholder must have a length of 1 character");
    }
}

document.querySelectorAll(".calendar_input").forEach((calendar) => {
    let dayPlaceHolder = calendar.getAttribute("data-day-placeholder") ? calendar.getAttribute("data-day-placeholder") : "jj";
    let monthPlaceHolder = calendar.getAttribute("data-month-placeholder") ? calendar.getAttribute("data-month-placeholder") : "mm";
    let yearPlaceHolder = calendar.getAttribute("data-year-placeholder") ? calendar.getAttribute("data-year-placeholder") : "aaaa";
    let separatorPlaceHolder = calendar.getAttribute("data-separator-placeholder") ? calendar.getAttribute("data-separator-placeholder") : "/";
    validatePlaceHolders(dayPlaceHolder, monthPlaceHolder, yearPlaceHolder, separatorPlaceHolder);
    calendarsArray.push(new CalendarInput(calendar, dayPlaceHolder, monthPlaceHolder, yearPlaceHolder, separatorPlaceHolder));
});

let oldCalendarActive = null;
window.addEventListener("click", (e) => {
    let target = e.target.closest(".calendar_input[data-active=true]");


    if (oldCalendarActive == null) {
        oldCalendarActive = target;
    }

    if (target != oldCalendarActive) {
        oldCalendarActive.setAttribute("data-active", "false");
        oldCalendarActive.querySelector(".calendar").style.display = "none";
        oldCalendarActive = target;
    }
});