export class SmartInput {
    /**
     * @param {HTMLInputElement} input 
     * @param {string} dayPlaceHolder 
     * @param {string} monthPlaceHolder 
     * @param {string} yearPlaceHolder 
     * @param {string} separatorPlaceHolder 
     * @param {(inputValue:string) => void} callbackUpdateCalendar 
     * @param {{day:number, month:number, year:number}} substringPositionDate
     * @param {{day:number, month:number, year:number}} index 
     */
    constructor(input, dayPlaceHolder, monthPlaceHolder, yearPlaceHolder, separatorPlaceHolder, callbackUpdateCalendar, substringPositionDate, index) {
        /**@type {HTMLInputElement} */
        this.input = input;

        /**@type {HTMLElement|HTMLInputElement|null} */
        this.hiddenInput = input.nextElementSibling;


        if (!this.hiddenInput || (this.hiddenInput.tagName.toUpperCase() != "INPUT" || this.hiddenInput.getAttribute("type") != "hidden")) {
            window.alert("An input tag needs to be added just below the input tel with the type 'hidden'");
        }

        /**@type {{day:number, month:number, year:number}} */
        this.index = index;

        this.datePlaceHolder = new Array(3);
        this.datePlaceHolder[index.day] = dayPlaceHolder;
        this.datePlaceHolder[index.month] = monthPlaceHolder;
        this.datePlaceHolder[index.year] = yearPlaceHolder;

        this.partSelected = new Array(3);
        this.partSelected[index.day] = input.value.trim() == "" ? "" : input.value.substring(substringPositionDate.day, substringPositionDate.day + 2);
        this.partSelected[index.month] = input.value.trim() == "" ? "" : input.value.substring(substringPositionDate.month, substringPositionDate.month + 2);
        this.partSelected[index.year] = input.value.trim() == "" ? "" : input.value.substring(substringPositionDate.year, substringPositionDate.year + 4);

        this.separatorPlaceHolder = separatorPlaceHolder;

        /**@type {(inputValue:string) => void} */
        this.callbackUpdateCalendar = callbackUpdateCalendar;

        this.shouldResetDayPart = true;
        this.shouldResetMonthPart = true;
        this.shouldResetYearPart = true;
        this.indexPositionPart = 0;

        /**@type {{start:number, end:number}[]} */
        this.selectionPosition = new Array(3);

        this.selectionPosition[index.day] = {
            start: substringPositionDate.day,
            end: substringPositionDate.day + 2,
        };
        this.selectionPosition[index.month] = {
            start: substringPositionDate.month,
            end: substringPositionDate.month + 2,
        };
        this.selectionPosition[index.year] = {
            start: substringPositionDate.year,
            end: substringPositionDate.year + 4,
        };

        if (input.value.trim() == "") {
            this.updateValueInInput();
        }

        this.updateHiddenValue();
        this.initEventListeners();
    }

    initEventListeners() {
        this.input.addEventListener("keydown", this.onInput.bind(this));
        this.input.addEventListener("click", this.onClick.bind(this));
    }

    /** @param {KeyboardEvent} event  */
    onInput(event) {
        let key = event.key || String.fromCharCode(event.charCode);

        if (key != "Tab") {
            event.preventDefault();
        }

        if (key == "Backspace" || key == "Delete") {
            this.clearDate();
        }

        if (key == "ArrowRight") {
            if (this.indexPositionPart < 2) {
                this.indexPositionPart++;
                this.input.setSelectionRange(this.selectionPosition[this.indexPositionPart].start, this.selectionPosition[this.indexPositionPart].end);
            }
        }

        if (key == "ArrowLeft") {
            if (this.indexPositionPart > 0) {
                this.indexPositionPart--;
                this.input.setSelectionRange(this.selectionPosition[this.indexPositionPart].start, this.selectionPosition[this.indexPositionPart].end);
            }
        }

        if (/^\d$/.test(key)) {
            if (this.input.selectionStart == this.selectionPosition[this.index.day].start) {
                this.inputOnDay(key);
            }
            else if (this.input.selectionStart == this.selectionPosition[this.index.month].start) {
                this.inputOnMonth(key);
            }
            else if (this.input.selectionStart == this.selectionPosition[this.index.year].start) {
                this.inputOnYear(key);
            }

            this.updateHiddenValue();
            this.callbackUpdateCalendar(this.hiddenInput.value);
        }


    }

    /**@param {Event} e  */
    onClick(e) {
        if (this.input.selectionStart == 10) {
            this.input.setSelectionRange(this.selectionPosition[0].start, this.selectionPosition[0].end);
            this.indexPositionPart = 0;
            return;
        }

        if (this.input.selectionStart == this.input.selectionEnd) {
            for (let i = 0; i < 3; i++) {
                if (this.input.selectionStart >= this.selectionPosition[i].start && this.input.selectionStart <= this.selectionPosition[i].end) {
                    this.input.setSelectionRange(this.selectionPosition[i].start, this.selectionPosition[i].end);
                    this.indexPositionPart = i;
                    break;
                }
            }
        }
    }

    inputOnDay(key) {
        if (this.shouldResetDayPart) {
            this.shouldResetDayPart = false;
            this.partSelected[this.index.day] = "";
        }

        let parsedDay = parseInt(key);

        if (isNaN(parsedDay)) {
            throw new Error("Day is NaN");
        }

        //si parseDay est supérieur à 3, je fais de l'auto complétion en rajoutant un zéro devant car aucun jour ne peut commencer par un "4". Il n'y a pas de 41ème jours.
        if (parsedDay > 3 && this.partSelected[this.index.day] == "") {
            this.partSelected[this.index.day] = "0" + key;
        } else {
            parsedDay = parseInt(this.partSelected[this.index.day] + key);

            if (isNaN(parsedDay)) {
                throw new Error("Day is NaN");
            }

            //si il y a un input dans la partie du jour et que ce n'est pas au dessus de 31 et en dessous ou égal à 0
            //j'update la partie consacrée au jour
            if (!(this.partSelected[this.index.day] != "" && (parsedDay > 31 || parsedDay <= 0))) {
                this.partSelected[this.index.day] = this.partSelected[this.index.day] + key;
            }

        }

        this.updateValueInInput();

        if (this.partSelected[this.index.day].length >= 2) {
            this.shouldResetDayPart = true;

            if (this.indexPositionPart < 2) {
                this.indexPositionPart++;
            }
        }
        
        this.input.setSelectionRange(this.selectionPosition[this.indexPositionPart].start, this.selectionPosition[this.indexPositionPart].end);
    }

    inputOnMonth(key) {
        if (this.shouldResetMonthPart) {
            this.shouldResetMonthPart = false;
            this.partSelected[this.index.month] = "";
        }

        let parsedMonth = parseInt(key);

        if (isNaN(parsedMonth)) {
            throw new Error("Month is NaN");
        }

        //si parsedMonth est supérieur à 1, je fais de l'auto complétion en rajoutant un zéro devant car aucun mois ne peut commencer par un "2". Il n'y a pas de 20ème mois.
        if (parsedMonth > 1 && this.partSelected[this.index.month] == "") {
            this.partSelected[this.index.month] = "0" + key;
        } else {

            parsedMonth = parseInt(this.partSelected[this.index.month] + key);

            if (isNaN(parsedMonth)) {
                throw new Error("Month is NaN");
            }

            //si il y a un input dans la partie du mois et que ce n'est pas au dessus de 12 et en dessous ou égal à 0
            //j'update la partie consacrée au mois.
            if (!(this.partSelected[this.index.month] != "" && (parsedMonth > 12 || parsedMonth <= 0))) {
                this.partSelected[this.index.month] = this.partSelected[this.index.month] + key;
                this.counterInputMonth++;
            }

        }

        this.updateValueInInput();

        if (this.partSelected[this.index.month].length >= 2) {
            this.shouldResetMonthPart = true;
            
            if (this.indexPositionPart < 2) {
                this.indexPositionPart++;
            }
        }

        this.input.setSelectionRange(this.selectionPosition[this.indexPositionPart].start, this.selectionPosition[this.indexPositionPart].end);
    }

    inputOnYear(key) {
        if (this.shouldResetYearPart) {
            this.shouldResetYearPart = false;
            this.partSelected[this.index.year] = "";
        }

        this.partSelected[this.index.year] = this.partSelected[this.index.year] + key;

        this.updateValueInInput();

        if (this.partSelected[this.index.year].length >= 4) {
            this.shouldResetYearPart = true;

            if (this.indexPositionPart < 2) {
                this.indexPositionPart++;
            }
        }

        this.input.setSelectionRange(this.selectionPosition[this.indexPositionPart].start, this.selectionPosition[this.indexPositionPart].end);
    }

    updateValueInInput() {
        this.input.value = this.datePlaceHolder.map((d, index) => this.replaceMissingPartByPlaceHolder(this.partSelected[index], d)).join(this.separatorPlaceHolder);
    }

    /**
     * @param {string} currentValue 
     * @param {string} placeholder 
     */
    replaceMissingPartByPlaceHolder(currentValue, placeholder) {
        if (currentValue.length == placeholder.length) {
            return currentValue;
        }

        let partToConcatenate = placeholder.substring(0, placeholder.length - currentValue.length);
        return partToConcatenate + currentValue;
    }

    clearDate() {
        let date = this.datePlaceHolder.map((d, index) => this.replaceMissingPartByPlaceHolder(this.partSelected[index], d)).join(this.separatorPlaceHolder);
        for (let i = 0; i < date.length; i++) {
            if (i >= this.input.selectionStart && i < this.input.selectionEnd && date[i] != this.separatorPlaceHolder) {
                if (i >= this.selectionPosition[this.index.day].start && i < this.selectionPosition[this.index.day].end) {
                    this.partSelected[this.index.day] = "";
                    this.shouldResetDayPart = true;
                }
                if (i >= this.selectionPosition[this.index.month].start && i < this.selectionPosition[this.index.month].end) {
                    this.partSelected[this.index.month] = "";
                    this.shouldResetMonthPart = true;
                }
                if (i >= this.selectionPosition[this.index.year].start && i < this.selectionPosition[this.index.year].end) {
                    this.partSelected[this.index.year] = "";
                    this.shouldResetYearPart = true;
                }
            }
        }
        this.updateValueInInput();
        this.updateHiddenValue();

        for (let i = 0; i < 3; i++) {
            if (this.partSelected[i] == "") {
                this.input.setSelectionRange(this.selectionPosition[i].start, this.selectionPosition[i].end);
                this.indexPositionPart = i;
                break;
            }
        }
    }

    updateHiddenValue() {
        if (this.input.value == this.datePlaceHolder.join(this.separatorPlaceHolder)) {
            this.hiddenInput.value = "";
        } else {
            this.hiddenInput.value = this.input.value;
        }
    }
}