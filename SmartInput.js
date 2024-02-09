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
        this.partSelected[index.day] = "";
        this.partSelected[index.month] = "";
        this.partSelected[index.year] = "";

        this.separatorPlaceHolder = separatorPlaceHolder;

        /**@type {(inputValue:string) => void} */
        this.callbackUpdateCalendar = callbackUpdateCalendar;

        this.counterInputDay = RESET_COUNTER;
        this.counterInputMonth = RESET_COUNTER;
        this.counterInputYear = RESET_COUNTER;
        this.counterSelectionPosition = 0;

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
            if(this.counterSelectionPosition < 2){
                this.counterSelectionPosition++;
                this.input.setSelectionRange(this.selectionPosition[this.counterSelectionPosition].start, this.selectionPosition[this.counterSelectionPosition].end);
            }
        }

        if (key == "ArrowLeft") {
            if(this.counterSelectionPosition > 0){
                this.counterSelectionPosition--;
                this.input.setSelectionRange(this.selectionPosition[this.counterSelectionPosition].start, this.selectionPosition[this.counterSelectionPosition].end);
            }
            return;
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
            this.counterSelectionPosition = 0;
            return;
        }

        if (this.input.selectionStart == this.input.selectionEnd) {
            if (this.input.selectionStart >= this.selectionPosition[this.index.day].start && this.input.selectionStart <= this.selectionPosition[this.index.day].end) {
                this.input.setSelectionRange(this.selectionPosition[this.index.day].start, this.selectionPosition[this.index.day].end);
                this.counterSelectionPosition = this.index.day;
            }
            else if (this.input.selectionStart >= this.selectionPosition[this.index.month].start && this.input.selectionStart <= this.selectionPosition[this.index.month].end) {
                this.input.setSelectionRange(this.selectionPosition[this.index.month].start, this.selectionPosition[this.index.month].end);
                this.counterSelectionPosition = this.index.month;
            }
            else if (this.input.selectionStart >= this.selectionPosition[this.index.year].start && this.input.selectionStart < this.selectionPosition[this.index.year].end) {
                this.input.setSelectionRange(this.selectionPosition[this.index.year].start, this.selectionPosition[this.index.year].end);
                this.counterSelectionPosition = this.index.year;
            }
            
        }
    }

    inputOnDay(key) {
        if (this.counterInputDay == RESET_COUNTER) {
            this.counterInputDay = 0;
            this.partSelected[this.index.day] = "";
        }

        let parsedDay = parseInt(key);

        if (isNaN(parsedDay)) {
            throw new Error("Day is NaN");
        }

        if (parsedDay > 3 && this.partSelected[this.index.day] == "") {
            this.partSelected[this.index.day] = "0" + key;
            this.counterInputDay = 10;
        } else {
            parsedDay = parseInt(this.partSelected[this.index.day] + key);

            if (isNaN(parsedDay)) {
                throw new Error("Day is NaN");
            }

            if (this.partSelected[this.index.day] != "" && (parsedDay > 31 || parsedDay <= 0)) {
                return;
            }

            this.counterInputDay++;
            this.partSelected[this.index.day] = this.partSelected[this.index.day] + key;
        }

        this.updateValueInInput();

        if (this.counterInputDay > 1) {
            this.counterInputDay = RESET_COUNTER;

            if(this.counterSelectionPosition < 2){
                this.counterSelectionPosition++;
            }
            this.input.setSelectionRange(this.selectionPosition[this.counterSelectionPosition].start, this.selectionPosition[this.counterSelectionPosition].end);

            return
        }

        this.input.setSelectionRange(this.selectionPosition[this.index.day].start, this.selectionPosition[this.index.day].end);
    }

    inputOnMonth(key) {
        if (this.counterInputMonth == RESET_COUNTER) {
            this.counterInputMonth = 0;
            this.partSelected[this.index.month] = "";
        }

        let parsedMonth = parseInt(key);

        if (isNaN(parsedMonth)) {
            throw new Error("Month is NaN");
        }

        if (parsedMonth > 1 && this.partSelected[this.index.month] == "") {
            this.partSelected[this.index.month] = "0" + key;
            this.counterInputMonth = 10;
        } else {

            parsedMonth = parseInt(this.partSelected[this.index.month] + key);

            if (isNaN(parsedMonth)) {
                throw new Error("Month is NaN");
            }

            if (this.partSelected[this.index.month] != "" && (parsedMonth > 12 || parsedMonth <= 0)) {
                return;
            }

            this.partSelected[this.index.month] = this.partSelected[this.index.month] + key;
            this.counterInputMonth++;
        }

        this.updateValueInInput();

        if (this.counterInputMonth > 1) {
            this.counterInputMonth = RESET_COUNTER;
            if(this.counterSelectionPosition < 2){
                this.counterSelectionPosition++;
            }
            this.input.setSelectionRange(this.selectionPosition[this.counterSelectionPosition].start, this.selectionPosition[this.counterSelectionPosition].end);
            return
        }
        this.input.setSelectionRange(this.selectionPosition[this.index.month].start, this.selectionPosition[this.index.month].end);
    }

    inputOnYear(key) {
        if (this.counterInputYear == RESET_COUNTER) {
            this.counterInputYear = 0;
            this.partSelected[this.index.year] = "";
        }

        this.partSelected[this.index.year] = this.partSelected[this.index.year] + key;

        this.updateValueInInput();
        this.counterInputYear++;

        if (this.counterInputYear > 3) {
            this.counterInputYear = RESET_COUNTER;
            if(this.counterSelectionPosition < 2){
                this.counterSelectionPosition++;
            }
            this.input.setSelectionRange(this.selectionPosition[this.counterSelectionPosition].start, this.selectionPosition[this.counterSelectionPosition].end);
            return
        }
        this.input.setSelectionRange(this.selectionPosition[this.counterSelectionPosition].start, this.selectionPosition[this.counterSelectionPosition].end);
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
                    this.counterInputDay = RESET_COUNTER;
                }
                if (i >= this.selectionPosition[this.index.month].start && i < this.selectionPosition[this.index.month].end) {
                    this.partSelected[this.index.month] = "";
                    this.counterInputMonth = RESET_COUNTER;
                }
                if (i >= this.selectionPosition[this.index.year].start && i < this.selectionPosition[this.index.year].end) {
                    this.partSelected[this.index.year] = "";
                    this.counterInputYear = RESET_COUNTER;
                }
            }
        }
        this.updateValueInInput();
        this.updateHiddenValue();

        for(let i = 0; i < 3; i++){
            if(this.partSelected[i] == ""){
                this.input.setSelectionRange(this.selectionPosition[i].start, this.selectionPosition[i].end);
                this.counterSelectionPosition = i;
                break;
            }
        }
    }

    updateHiddenValue(){
        if (this.input.value == this.datePlaceHolder.join(this.separatorPlaceHolder)) {
            this.hiddenInput.value = "";
        } else {
            this.hiddenInput.value = this.input.value;
        }
    }
}