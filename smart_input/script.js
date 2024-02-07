const RESET_COUNTER = -1;

class SmartInput {
    constructor() {
        /**@type {HTMLInputElement} */
        this.input = document.querySelector("input");
        this.dayPlaceHolder = "jj";
        this.monthPlaceHolder = "mm";
        this.yearPlaceHolder = "aaaa";
        this.separatorPlaceHolder = "/";

        this.selectionPosition = -1;

        this.selectedDay = "";
        this.counterInputDay = RESET_COUNTER;

        this.selectedMonth = "";
        this.counterInputMonth = RESET_COUNTER;

        this.selectedYear = "";
        this.counterInputYear = RESET_COUNTER;

        this.selection = {
            day: {
                start: 0,
                end: 2,
            },
            month: {
                start: 3,
                end: 5,
            },
            year: {
                start: 6,
                end: 10,
            },
        }


        this.updateValueInInput();
        this.initEventListeners();
    }

    initEventListeners() {
        this.input.addEventListener("keydown", this.onInput.bind(this));
        this.input.addEventListener("click", this.onClick.bind(this));
        this.input.addEventListener("select", (e) => {
            // console.log(this.input.selectionStart);
            // console.log(this.input.selectionEnd);
        })
    }

    /** @param {KeyboardEvent} event  */
    onInput(event) {
        event.preventDefault();
        let key = event.key || String.fromCharCode(event.charCode)
        if (e.key == "Backspace" || e.key == "Delete") {
            this.clearDate();
        }
        // return;

        if (e.key == "ArrowRight") {
            if (this.input.selectionStart == this.selection.day.start) {
                this.input.setSelectionRange(this.selection.month.start, this.selection.month.end);
            }
            else if (this.input.selectionStart == this.selection.month.start) {
                this.input.setSelectionRange(this.selection.year.start, this.selection.year.end);
            }
        }

        if (e.key == "ArrowLeft") {
            if (this.input.selectionStart == this.selection.year.start) {
                this.input.setSelectionRange(this.selection.month.start, this.selection.month.end);
            }
            else if (this.input.selectionStart == this.selection.month.start) {
                this.input.setSelectionRange(this.selection.day.start, this.selection.day.end);
            }
        }

        if (/^\d$/.test(e.key)) {
            if (this.input.selectionStart == this.selection.day.start) {
                this.inputOnDay(e);
            }
            else if (this.input.selectionStart == this.selection.month.start) {
                this.inputOnMonth(e);
            }
            else if (this.input.selectionStart == this.selection.year.start) {
                this.inputOnYear(e);
            }
        }


    }

    /**@param {Event} e  */
    onClick(e) {
        if (this.input.selectionStart == 10) {
            this.input.setSelectionRange(this.selection.day.start, this.selection.day.end);
            return;
        }

        if (this.input.selectionStart == this.input.selectionEnd) {
            if (this.input.selectionStart >= this.selection.day.start && this.input.selectionStart < this.selection.day.end) {
                this.input.setSelectionRange(this.selection.day.start, this.selection.day.end);
            }
            else if (this.input.selectionStart >= this.selection.month.start && this.input.selectionStart < this.selection.month.end) {
                this.input.setSelectionRange(this.selection.month.start, this.selection.month.end);
            }
            else if (this.input.selectionStart >= this.selection.year.start && this.input.selectionStart < this.selection.year.end) {
                this.input.setSelectionRange(this.selection.year.start, this.selection.year.end);
            }
        }
    }

    inputOnDay(e) {
        if (this.counterInputDay == RESET_COUNTER) {
            this.counterInputDay = 0;
            this.selectedDay = "";
        }

        let parsedDay = parseInt(e.key);

        if (isNaN(parsedDay)) {
            throw new Error("Day is NaN");
        }

        if (parsedDay > 3 && this.selectedDay == "") {
            this.selectedDay = "0" + e.key;
            this.counterInputDay = 10;
        } else {
            parsedDay = parseInt(this.selectedDay + e.key);

            if (isNaN(parsedDay)) {
                throw new Error("Day is NaN");
            }

            if (this.selectedDay != "" && (parsedDay > 31 || parsedDay <= 0)) {
                return;
            }

            this.counterInputDay++;
            this.selectedDay = this.selectedDay + e.key;
        }

        this.updateValueInInput();

        if (this.counterInputDay > 1) {
            this.counterInputDay = RESET_COUNTER;
            this.input.setSelectionRange(this.selection.month.start, this.selection.month.end);
            return
        }
        this.input.setSelectionRange(this.selection.day.start, this.selection.day.end);
    }

    inputOnMonth(e) {
        if (this.counterInputMonth == RESET_COUNTER) {
            this.counterInputMonth = 0;
            this.selectedMonth = "";
        }

        let parsedMonth = parseInt(e.key);

        if (isNaN(parsedMonth)) {
            throw new Error("Month is NaN");
        }

        if (parsedMonth > 1 && this.selectedMonth == "") {
            this.selectedMonth = "0" + e.key;
            this.counterInputMonth = 10;
        } else {

            parsedMonth = parseInt(this.selectedMonth + e.key);

            if (isNaN(parsedMonth)) {
                throw new Error("Month is NaN");
            }

            if (this.selectedMonth != "" && (parsedMonth > 12 || parsedMonth <= 0)) {
                return;
            }

            this.selectedMonth = this.selectedMonth + e.key;
            this.counterInputMonth++;
        }

        this.updateValueInInput();

        if (this.counterInputMonth > 1) {
            this.counterInputMonth = RESET_COUNTER;
            this.input.setSelectionRange(this.selection.year.start, this.selection.year.end);
            return
        }
        this.input.setSelectionRange(this.selection.month.start, this.selection.month.end);
    }

    inputOnYear(e) {
        if (this.counterInputYear == RESET_COUNTER) {
            this.counterInputYear = 0;
            this.selectedYear = "";
        }

        this.selectedYear = this.selectedYear + e.key;

        this.updateValueInInput();
        this.counterInputYear++;

        this.input.setSelectionRange(this.selection.year.start, this.selection.year.end);
        if (this.counterInputYear > 3) {
            this.counterInputYear = RESET_COUNTER;
        }
    }

    updateValueInInput() {
        this.input.value = `${this.replaceMissingPartByPlaceHolder(this.selectedDay, this.dayPlaceHolder)}${this.separatorPlaceHolder}${this.replaceMissingPartByPlaceHolder(this.selectedMonth, this.monthPlaceHolder)}${this.separatorPlaceHolder}${this.replaceMissingPartByPlaceHolder(this.selectedYear, this.yearPlaceHolder)}`
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
        let date = `${this.replaceMissingPartByPlaceHolder(this.selectedDay, this.dayPlaceHolder)}${this.separatorPlaceHolder}${this.replaceMissingPartByPlaceHolder(this.selectedMonth, this.monthPlaceHolder)}${this.separatorPlaceHolder}${this.replaceMissingPartByPlaceHolder(this.selectedYear, this.yearPlaceHolder)}`;
        let newDate = "";

        for (let i = 0; i < date.length; i++) {
            if (i >= this.input.selectionStart && i < this.input.selectionEnd && date[i] != this.separatorPlaceHolder) {
                if (i >= this.selection.day.start && i < this.selection.day.end) {
                    this.selectedDay = "";
                    this.counterInputDay = RESET_COUNTER;
                }
                if (i >= this.selection.month.start && i < this.selection.month.end) {
                    this.selectedMonth = "";
                    this.counterInputMonth = RESET_COUNTER;
                }
                if (i >= this.selection.year.start && i < this.selection.year.end) {
                    this.selectedYear = "";
                    this.counterInputYear = RESET_COUNTER;
                }
            }
        }
        this.updateValueInInput();
        if(this.selectedDay == ""){
            this.input.setSelectionRange(this.selection.day.start, this.selection.day.end);
        }
        else if(this.selectedMonth == ""){
            this.input.setSelectionRange(this.selection.month.start, this.selection.month.end);
        }
        else if(this.selectedYear == ""){
            this.input.setSelectionRange(this.selection.year.start, this.selection.year.end);
        }
    }
}


let smartinput = new SmartInput();