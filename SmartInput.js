const RESET_COUNTER = -1;

export class SmartInput {
    /**
     * @param {HTMLInputElement} input 
     * @param {string} dayPlaceHolder 
     * @param {string} monthPlaceHolder 
     * @param {string} yearPlaceHolder 
     * @param {string} separatorPlaceHolder 
     * @param {(inputValue:string) => void} callbackUpdateCalendar 
     * @param {{day:number, month:number, year:number}} substringPositionDate
     * @param {{day:number, month:number, year:number}} indexDate 
     */
    constructor(input, dayPlaceHolder, monthPlaceHolder, yearPlaceHolder, separatorPlaceHolder, callbackUpdateCalendar, substringPositionDate, indexDate) {
        /**@type {HTMLInputElement} */
        this.input = input;

        /**@type {HTMLElement|HTMLInputElement|null} */
        this.hiddenInput = input.nextElementSibling;


        if(!this.hiddenInput || (this.hiddenInput.tagName.toUpperCase() != "INPUT" || this.hiddenInput.getAttribute("type") != "hidden")){
            window.alert("An input tag needs to be added just below the input tel with the type 'hidden'");
        }

        /**@type {{day:number, month:number, year:number}} */
        this.indexDate = indexDate;

        this.datePlaceHolder = new Array(3);
        this.datePlaceHolder[indexDate.day] = dayPlaceHolder;
        this.datePlaceHolder[indexDate.month] = monthPlaceHolder;
        this.datePlaceHolder[indexDate.year] = yearPlaceHolder;

        this.partSelected = new Array(3);
        this.partSelected[indexDate.day] = "";
        this.partSelected[indexDate.month] = "";
        this.partSelected[indexDate.year] = "";

        this.dayPlaceHolder = dayPlaceHolder;
        this.monthPlaceHolder = monthPlaceHolder;
        this.yearPlaceHolder = yearPlaceHolder;
        this.separatorPlaceHolder = separatorPlaceHolder;

        /**@type {(inputValue:string) => void} */
        this.callbackUpdateCalendar = callbackUpdateCalendar;

        this.selectionPosition = -1;

        this.selectedDay = "";
        this.counterInputDay = RESET_COUNTER;

        this.selectedMonth = "";
        this.counterInputMonth = RESET_COUNTER;

        this.selectedYear = "";
        this.counterInputYear = RESET_COUNTER;

        this.selection = {
            day: {
                start: substringPositionDate.day,
                end: substringPositionDate.day + 2,
            },
            month: {
                start: substringPositionDate.month,
                end: substringPositionDate.month + 2,
            },
            year: {
                start: substringPositionDate.year,
                end: substringPositionDate.year + 4,
            },
        }

        if(input.value.trim() == ""){
            this.updateValueInInput();
        }

        if(this.input.value == `${this.dayPlaceHolder}${this.separatorPlaceHolder}${this.monthPlaceHolder}${this.separatorPlaceHolder}${this.yearPlaceHolder}`){
            this.hiddenInput.value = "";
        } else {
            this.hiddenInput.value = this.input.value;
        }

        this.initEventListeners();
    }

    initEventListeners() {
        this.input.addEventListener("keydown", this.onInput.bind(this));
        this.input.addEventListener("click", this.onClick.bind(this));
        // this.input.addEventListener("select", (e) => {
        //     console.log(this.input.selectionStart);
        //     console.log(this.input.selectionEnd);
        // })
    }

    /** @param {KeyboardEvent} event  */
    onInput(event) {
        let key = event.key || String.fromCharCode(event.charCode);

        if(key != "Tab"){
            event.preventDefault();
        }
        
        if (key == "Backspace" || key == "Delete") {
            this.clearDate();
        }

        if (key == "ArrowRight") {
            if (this.input.selectionStart == this.selection.day.start) {
                this.input.setSelectionRange(this.selection.month.start, this.selection.month.end);
            }
            else if (this.input.selectionStart == this.selection.month.start) {
                this.input.setSelectionRange(this.selection.year.start, this.selection.year.end);
            }
        }

        if (key == "ArrowLeft") {
            if (this.input.selectionStart == this.selection.year.start) {
                this.input.setSelectionRange(this.selection.month.start, this.selection.month.end);
            }
            else if (this.input.selectionStart == this.selection.month.start) {
                this.input.setSelectionRange(this.selection.day.start, this.selection.day.end);
            }
        }

        if (/^\d$/.test(key)) {
            if (this.input.selectionStart == this.selection.day.start) {
                this.inputOnDay(key);
            }
            else if (this.input.selectionStart == this.selection.month.start) {
                this.inputOnMonth(key);
            }
            else if (this.input.selectionStart == this.selection.year.start) {
                this.inputOnYear(key);
            }

            //update
            this.hiddenInput.value = this.input.value;
            this.callbackUpdateCalendar(this.hiddenInput.value);
        }


    }

    /**@param {Event} e  */
    onClick(e) {
        if (this.input.selectionStart == 10) {
            this.input.setSelectionRange(this.selection.day.start, this.selection.day.end);
            return;
        }

        if (this.input.selectionStart == this.input.selectionEnd) {
            if (this.input.selectionStart >= this.selection.day.start && this.input.selectionStart <= this.selection.day.end) {
                this.input.setSelectionRange(this.selection.day.start, this.selection.day.end);
            }
            else if (this.input.selectionStart >= this.selection.month.start && this.input.selectionStart <= this.selection.month.end) {
                this.input.setSelectionRange(this.selection.month.start, this.selection.month.end);
            }
            else if (this.input.selectionStart >= this.selection.year.start && this.input.selectionStart < this.selection.year.end) {
                this.input.setSelectionRange(this.selection.year.start, this.selection.year.end);
            }
        }
    }

    inputOnDay(key) {
        if (this.counterInputDay == RESET_COUNTER) {
            this.counterInputDay = 0;
            this.partSelected[this.indexDate.day] = "";
            // this.selectedDay = "";
        }

        let parsedDay = parseInt(key);

        if (isNaN(parsedDay)) {
            throw new Error("Day is NaN");
        }

        if (parsedDay > 3 && this.partSelected[this.indexDate.day] == "") {
            this.partSelected[this.indexDate.day] = "0" + key;
            this.counterInputDay = 10;
        } else {
            parsedDay = parseInt(this.partSelected[this.indexDate.day] + key);

            if (isNaN(parsedDay)) {
                throw new Error("Day is NaN");
            }

            if (this.partSelected[this.indexDate.day] != "" && (parsedDay > 31 || parsedDay <= 0)) {
                return;
            }

            this.counterInputDay++;
            this.partSelected[this.indexDate.day] = this.partSelected[this.indexDate.day] + key;
        }

        this.updateValueInInput();

        if (this.counterInputDay > 1) {
            this.counterInputDay = RESET_COUNTER;
            this.input.setSelectionRange(this.selection.month.start, this.selection.month.end);
            return
        }
        this.input.setSelectionRange(this.selection.day.start, this.selection.day.end);
    }

    inputOnMonth(key) {
        if (this.counterInputMonth == RESET_COUNTER) {
            this.counterInputMonth = 0;
            this.selectedMonth = "";
        }

        let parsedMonth = parseInt(key);

        if (isNaN(parsedMonth)) {
            throw new Error("Month is NaN");
        }

        if (parsedMonth > 1 && this.selectedMonth == "") {
            this.selectedMonth = "0" + key;
            this.counterInputMonth = 10;
        } else {

            parsedMonth = parseInt(this.selectedMonth + key);

            if (isNaN(parsedMonth)) {
                throw new Error("Month is NaN");
            }

            if (this.selectedMonth != "" && (parsedMonth > 12 || parsedMonth <= 0)) {
                return;
            }

            this.selectedMonth = this.selectedMonth + key;
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

    inputOnYear(key) {
        if (this.counterInputYear == RESET_COUNTER) {
            this.counterInputYear = 0;
            this.selectedYear = "";
        }

        this.selectedYear = this.selectedYear + key;

        this.updateValueInInput();
        this.counterInputYear++;

        this.input.setSelectionRange(this.selection.year.start, this.selection.year.end);
        if (this.counterInputYear > 3) {
            this.counterInputYear = RESET_COUNTER;
        }
    }

    updateValueInInput() {
        // this.input.value = this.datePlaceHolder
        this.input.value = `${this.replaceMissingPartByPlaceHolder(this.partSelected[this.indexDate.day], this.dayPlaceHolder)}${this.separatorPlaceHolder}${this.replaceMissingPartByPlaceHolder(this.selectedMonth, this.monthPlaceHolder)}${this.separatorPlaceHolder}${this.replaceMissingPartByPlaceHolder(this.selectedYear, this.yearPlaceHolder)}`
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

        if(this.input.value == `${this.dayPlaceHolder}${this.separatorPlaceHolder}${this.monthPlaceHolder}${this.separatorPlaceHolder}${this.yearPlaceHolder}`){
            this.hiddenInput.value = "";
        } else {
            this.hiddenInput.value = this.input.value;
        }

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