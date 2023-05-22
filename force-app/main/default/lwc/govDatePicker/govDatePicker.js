/* eslint-disable eqeqeq */
/* eslint-disable consistent-return */
/* eslint-disable no-redeclare */
/* eslint-disable vars-on-top */
/* eslint-disable @lwc/lwc/no-async-operation */
/* eslint-disable @lwc/lwc/no-api-reassignments */
import { LightningElement, track, api, wire } from 'lwc';
import iconsStackSVG from '@salesforce/resourceUrl/iconsStackSVG';
import { MessageContext, publish, subscribe, unsubscribe } from 'lightning/messageService';
import REGISTER_MC from '@salesforce/messageChannel/registrationMessage__c';
import VALIDATION_MC from '@salesforce/messageChannel/validateMessage__c';
import VALIDATION_STATE_MC from '@salesforce/messageChannel/validationStateMessage__c';
//import StayInTouchSignature from '@salesforce/schema/User.StayInTouchSignature';

export default class GovDatePicker extends LightningElement {
    // messaging attributes
    @wire(MessageContext) messageContext;
    validateSubscription;

    today = new Date();
    currentMonth = this.today.getMonth();
    currentYear = this.today.getFullYear();

    months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    displayedMonthLabel;
    modalOpen = false;

    @api isDateRequired; // flow property - validation
    @api fieldLabel;
    
    // Excluded (unselectable) date range
    @api excludedStartDate;
    @api excludedEndDate;

    @api selectedDate;
    @api fieldId = "date picker";
    @api errorMessage;
    
    @track calendarData = [];
    @track displayedYear;
    @track displayedMonth;
    @track selectedDay;
    @track displayedDate = 'dd/mm/YYYY';
    @track hasErrors;
    @track dateInputClass = "ds_input  ds_input--fixed-10";

    calendarTodaySVG = `${iconsStackSVG}#calendar_today`;
    chevronLeftSVG = `${iconsStackSVG}#chevron_left`;
    chevronRightSVG = `${iconsStackSVG}#chevron_right`;
    doubleChevronLeftSVG = `${iconsStackSVG}#double_chevron_left`;
    doubleChevronRightSVG = `${iconsStackSVG}#double_chevron_right`;

    // other attributes
    components = [];
    noFocus = false; // used when selecting date using arrow keys
    selDate;

    connectedCallback(){
        //console.log('Required: ' + this.isDateRequired);
        console.log("Excluded Start Date: " + this.excludedStartDate + "; Excluded End Date: " + this.excludedEndDate);
        this.subscribeMCs();

        if(this.selectedDate == null) {
            this.selectedDate = this.today;
            this.selDate = this.selectedDate;
            
            if(!this.isDateInRange(this.excludedStartDate, 
                this.excludedEndDate, 
                new Date(this.selectedDate.getFullYear(), this.selectedDate.getMonth(), this.selectedDate.getDate()))){
                    this.selectedDay = this.selectedDate.getDate();
            } else if(this.isDateInRange(this.excludedStartDate, 
                this.excludedEndDate, 
                new Date(this.selectedDate.getFullYear(), this.selectedDate.getMonth(), this.selectedDate.getDate()))){
                // if today falls within the range of excluded days, select the next available day by default
                //console.log("Date is in excluded range, selecting the next available...");
                this.selectedDay = new Date(this.excludedEndDate).getDate() + 1;
                this.selectedDate = new Date(this.selectedDate.getFullYear(), this.selectedDate.getMonth(), new Date(this.excludedEndDate).getDate() + 1);
            }
        } else {
            this.selectedDate = new Date(this.selectedDate);
            this.selectedDay = this.selectedDate.getDate();
        }
        this.displayedDate = this.formatSelectedDate(this.selectedDate);

        this.displayedMonth = this.selectedDate.getMonth();
        this.displayedYear = this.selectedDate.getFullYear();
        
        this.generateCalendar(this.displayedYear, this.displayedMonth, this.selectedDay, this.noFocus);

        setTimeout(() => {
            publish(this.messageContext, REGISTER_MC, {componentId:this.fieldId});
        }, 100);
    }

    disconnectedCallback(){
        this.unsubscribeMCs();
    }

    renderedCallback(){
        
    }

    // Messaging related functions
    subscribeMCs() {
        if (this.validationSubscription) {
            return;
        }
        this.validationSubscription = subscribe (
            this.messageContext,
            VALIDATION_MC, (message) => {
                this.handleValidateMessage(message);
            });
    }

    unsubscribeMCs() {
        unsubscribe(this.validateSubscription);
         this.validateSubscription = null;
    }

    handleValidateMessage(message) {
        this.handleValidate()
    }

    @api handleValidate() {
        this.hasErrors = false;

        if(this.isDateRequired && this.displayedDate === 'dd/mm/YYYY') {
            this.hasErrors = true;
            this.dateInputClass = "ds_input  ds_input--fixed-10 ds_input--error";
        } else {
            this.hasErrors = false;
        }

        //console.log('CHECKBOX: Sending validation state message');
        publish(this.messageContext, VALIDATION_STATE_MC, {
            componentId: this.fieldId,
            isValid: !this.hasErrors,
            error: this.errorMessage
        });
    }

    @api clearError() {
        this.hasErrors = false;
    }

    handleKeyDown(event){
        switch (event.which){
            // up
            case 38: 
                console.log("up");
                if(this.template.querySelector('.ds_selected')){
                    this.focusDateAbove(this.template.querySelector('.ds_selected'));
                }
                break;
            // down
            case 40: 
                console.log("down");
                if(this.template.querySelector('.ds_selected')){
                    this.focusDateBelow(this.template.querySelector('.ds_selected'));
                }
                break;
            // left
            case 37: 
                console.log("left");
                if(this.template.querySelector('.ds_selected')){
                    this.focusPreviousDate(this.template.querySelector('.ds_selected'));
                }
                break;
            // right
            case 39: 
                //console.log("right");
                if(this.template.querySelector('.ds_selected')){
                    this.focusNextDate(this.template.querySelector('.ds_selected'));
                }
                break;
            // esc
            case 27: 
                //console.log("esc");
                if(this.modalOpen){this.toggleModal()}
                break;
            // tab & shift + tab
            case 9: 
                //console.log("tab");
                if(event.shiftKey){
                    //console.log('Shift + tab');
                    this.focusPreviousTabElement();
                } else {
                    this.focusNextTabElement();
                }
                break;
            // page up & shift + page up
            case 33: 
                if(event.shiftKey){
                    //console.log('Shift + page up');
                    this.prevYear();
                    this.focusElement(`[data-value="`+this.selectedDay+`"]`, 100);
                } else {
                    //console.log('page up');
                    this.prevMonth();
                    this.focusElement(`[data-value="`+this.selectedDay+`"]`, 100);
                }
                break;
            // page down & shift + page down
            case 34: 
                if(event.shiftKey){
                    //console.log('Shift + page down');
                    this.nextYear();
                    this.focusElement(`[data-value="`+this.selectedDay+`"]`, 100);
                } else {
                    //console.log('page down');
                    this.nextMonth();
                    this.focusElement(`[data-value="`+this.selectedDay+`"]`, 100);
                }
                break;
            // home
            case 36: 
                //console.log("home");
                if(this.template.querySelector('.ds_selected')){
                    this.goToFirstDayInWeek(this.template.querySelector('.ds_selected'));
                }
                break;
            // everything else
            default:
                //console.log("Other key");
        }
    }

    focusNextDate(currentCell){
        // Check if this is last cell in row
        if(currentCell.parentElement.nextElementSibling){
            var nextCell = currentCell.parentElement.nextElementSibling.firstChild;
        } else {
            var nextCell = null;
        }

        if(nextCell && nextCell.disabled){
            //console.log('Next cell is disabled');
            return false;
        } else if(nextCell){
            // If this is not the last cell in the row, focus next cell
            this.selectNextCellFocus(currentCell, nextCell);
        } else {
            // Otherwise, check if this is last row of cells
            if(currentCell.parentElement.parentElement.nextElementSibling && currentCell.parentElement.parentElement.nextElementSibling.cells.length > 0){
                nextCell = currentCell.parentElement.parentElement.nextElementSibling.firstChild.firstChild;
                this.selectNextCellFocus(currentCell, nextCell);
            } else {
                this.template.querySelector('.ds_selected').classList.remove('ds_selected');
                this.noFocus = true;
                this.nextMonth();
                setTimeout(() => {
                    var firstDatNextMonth = this.template.querySelector(`[data-value="1"]`);
                    firstDatNextMonth.classList.add('ds_selected');
                    firstDatNextMonth.focus();
                }, 150);
                this.noFocus = false;
            }
        }
    }

    focusPreviousDate(currentCell){
        // Check if this is first cell in row
        if(currentCell.parentElement.previousElementSibling && currentCell.parentElement.previousElementSibling.firstChild.style.display == 'block'){
            var prevCell = currentCell.parentElement.previousElementSibling.firstChild;
        } else {
            var prevCell = null;
        }
        
        if(prevCell && prevCell.disabled){
            //console.log('Prev cell is disabled');
            return false;
        } else if(prevCell){
            // If this is not the last cell in the row, focus next cell
            this.selectNextCellFocus(currentCell, prevCell);
        } else {
            // Otherwise, check if this is first row of cells
            if(currentCell.parentElement.parentElement.previousElementSibling && currentCell.parentElement.parentElement.previousElementSibling.cells.length > 0){
                prevCell = currentCell.parentElement.parentElement.previousElementSibling.lastChild.firstChild;
                this.selectNextCellFocus(currentCell, prevCell);
            } else {
                // If first row
                this.template.querySelector('.ds_selected').classList.remove('ds_selected');
                this.noFocus = true;
                this.prevMonth();
                setTimeout(() => {
                    var lastDatePrevMonth = this.template.querySelector(`[data-value="`+ this.getDaysInMonth(this.displayedYear, this.displayedMonth) +`"]`);
                    lastDatePrevMonth.classList.add('ds_selected');
                    lastDatePrevMonth.focus();
                }, 150);
                this.noFocus = false;
            }
        }
    }

    focusDateAbove(currentCell){
        var cellIndex = currentCell.parentElement.dataset.id;
        if(currentCell.parentElement.parentElement.previousElementSibling && 
            currentCell.parentElement.parentElement.previousElementSibling.cells[cellIndex].firstChild.style.display == 'block'){

            var prevCell = currentCell.parentElement.parentElement.previousElementSibling.cells[cellIndex].firstChild;
        } else {
            var prevCell = null;
        }

        if(prevCell && prevCell.disabled){
            console.log('Prev cell is disabled');
            return false;
        } else if(prevCell){
            this.selectNextCellFocus(currentCell, prevCell);
        } else {
            // First row, switch to previous month, last day
            // If first row
            this.template.querySelector('.ds_selected').classList.remove('ds_selected');
            this.noFocus = true;
            this.prevMonth();
            setTimeout(() => {
                if(this.template.querySelector(`[data-value="`+ this.getDaysInMonth(this.displayedYear, this.displayedMonth) +`"]`).parentElement.parentElement.cells[cellIndex]){
                    //console.log('Valid last day of month');
                    var lastDatePrevMonth = this.template.querySelector(`[data-value="`+ this.getDaysInMonth(this.displayedYear, this.displayedMonth) +`"]`).parentElement.parentElement.cells[cellIndex].firstChild;
                } else {
                    //console.log('Invalid last day, moving to prev week');
                    var lastDatePrevMonth = this.template.querySelector(`[data-value="`+ this.getDaysInMonth(this.displayedYear, this.displayedMonth) +`"]`).parentElement.parentElement.previousElementSibling.cells[cellIndex].firstChild;
                }
                lastDatePrevMonth.classList.add('ds_selected');
                lastDatePrevMonth.focus();
            }, 150);
            this.noFocus = false;
        }
    }

    focusDateBelow(currentCell){
        var cellIndex = currentCell.parentElement.dataset.id;
        if(currentCell.parentElement.parentElement.nextElementSibling && 
            currentCell.parentElement.parentElement.nextElementSibling.cells[cellIndex] &&
            currentCell.parentElement.parentElement.nextElementSibling.cells[cellIndex].firstChild.style.display == 'block'){

            var nextCell = currentCell.parentElement.parentElement.nextElementSibling.cells[cellIndex].firstChild;
        } else {
            var nextCell = null;
        }

        if(nextCell && nextCell.disabled){
            console.log('Next cell is disabled');
            return false;
        } else if(nextCell){
            this.selectNextCellFocus(currentCell, nextCell);
        } else {
            // First row, switch to next month, first day
            // If first row
            this.template.querySelector('.ds_selected').classList.remove('ds_selected');
            this.noFocus = true;
            this.nextMonth();
            setTimeout(() => {
                if(this.template.querySelector(`[data-value="1"]`).parentElement.parentElement.cells[cellIndex].firstChild.style.display == 'block'){
                    console.log('Valid first day of month');
                    var firstDateNextMonth = this.template.querySelector(`[data-value="1"]`).parentElement.parentElement.cells[cellIndex].firstChild;
                } else {
                    console.log('Invalid first day, moving to prev week');
                    var firstDateNextMonth = this.template.querySelector(`[data-value="1"]`).parentElement.parentElement.nextElementSibling.cells[cellIndex].firstChild;
                }
                firstDateNextMonth.classList.add('ds_selected');
                firstDateNextMonth.focus();
            }, 200);
            this.noFocus = false;
        }
    }

    selectNextCellFocus(currentCell, nextCell){
        nextCell.classList.add('ds_selected');
        currentCell.classList.remove('ds_selected');
        nextCell.focus();
    }

    focusNextTabElement(){
        // if any calendar day is focused
        if(this.template.activeElement.dataset.value){
            // focus the cancel button
            this.focusElement('.js-datepicker-cancel', 10);
        }
    }

    goToFirstDayInWeek(currentCell){
        currentCell.classList.remove('ds_selected');
        let siblings = [...currentCell.parentElement.parentElement.children];
        console.log('Going to first day in week');
        for(let i = 0; i < siblings.length; i++){
            console.log(siblings[i].firstChild.dataset.value);
            if(siblings[i].firstChild.dataset.value > 0 && !siblings[i].firstChild.disabled){
                siblings[i].firstChild.classList.add('ds_selected');
                siblings[i].firstChild.focus();
                break;
            }
        }
    }

    focusPreviousTabElement(){
        if(this.template.activeElement.dataset.value){
            // focus next year button
            this.focusElement('.js-datepicker-next-year', 10);
        }
    }

    toggleModal(){
        this.modalOpen = !this.modalOpen;
        if(this.modalOpen === true){
            this.generateCalendar(this.displayedYear, this.displayedMonth, this.selectedDay, this.noFocus);
            this.focusElement('.ds_selected', 50);
        } else {
            this.displayedDate = this.formatSelectedDate(this.selectedDate);
            this.displayedMonth = this.selectedDate.getMonth();
            this.displayedYear = this.selectedDate.getFullYear();
            this.focusElement('.js-calendar-button', 100);
        }
    }

    focusElement(element, delay){
        setTimeout(() => {
            this.template.querySelector(element).focus();
        }, delay);
    }

    getDaysInMonth(year, month){
        return new Date(year, month + 1, 0).getDate();
    }
    
    prevMonth(){
        if(this.displayedMonth === 0){
            this.displayedMonth = 11;
            this.displayedYear--;
        } else {
            this.displayedMonth--;
        }
        this.generateCalendar(this.displayedYear, this.displayedMonth, this.selectedDay, this.noFocus);
    }

    nextMonth(){
        if(this.displayedMonth === 11){
            this.displayedMonth = 0;
            this.displayedYear++;
        } else {
            this.displayedMonth++;
        }
        
        this.generateCalendar(this.displayedYear, this.displayedMonth, this.selectedDay, this.noFocus);
    }

    prevYear(){
        this.displayedYear--;
        this.generateCalendar(this.displayedYear, this.displayedMonth, this.selectedDay, this.noFocus);
    }

    nextYear(){
        this.displayedYear++;
        this.generateCalendar(this.displayedYear, this.displayedMonth, this.selectedDay, this.noFocus);
    }

    handleDateSelect(event){
        this.selectedDay = event.target.dataset.value;
        console.log("Selected Day: " + this.selectedDay);
        this.selectedDate = this.convertUTCDateToLocalDate(new Date(this.displayedYear, this.displayedMonth, this.selectedDay));
        this.displayedDate = this.formatSelectedDate(this.selectedDate);
        console.log("Date has been selected: " + this.selectedDate);
        console.log("Displayed date is: " + this.displayedDate);
        this.generateCalendar(this.displayedYear, this.displayedMonth, this.selectedDay, this.noFocus);
        // close modal
        this.modalOpen = false;
        // focus calendar button
        this.focusElement('.js-calendar-button', 100);
    }

    handleInputSelect(){
        //console.log('handling input select...');
        //open modal
        //this.modalOpen = true;
    }

    handleOK(){
        // Add today's date if no other date selected
        this.displayedDate = this.formatSelectedDate(this.selectedDate);
        this.toggleModal();
    }

    handleCancel(){
        this.toggleModal();
    }

    // Date functions
    handleDateInputChange(event){
        console.log('Date has changed, new value is: ' + event.target.value);
        if(event.target.value && this.isValidDate(event.target.value)){
            // Valid date
            console.info("Date entered is valid.");
            let dateComps = event.target.value.split("/");
            let newDate = new Date(dateComps[2], dateComps[1] - 1, dateComps[0]);
            this.selectedDay = newDate.getDate();
            // Test
            this.selectedDate = this.convertUTCDateToLocalDate(newDate);
            this.displayedDate = this.formatSelectedDate(this.selectedDate);
            this.displayedMonth = this.selectedDate.getMonth();
            this.displayedYear = this.selectedDate.getFullYear();
        } else {
            // Invalid date
            // if input field is left blank, populate today's date
            console.error("Invalid Date value entered. Please enter a valid date.");
            this.selectedDate = this.today;
            this.displayedDate = this.formatSelectedDate(this.selectedDate);
            this.displayedMonth = this.selectedDate.getMonth();
            this.displayedYear = this.selectedDate.getFullYear();
            //this.displayedDate = this.formatSelectedDate(this.today);
            
        }
    }

    isValidDate(inputString){
        let parsedDate = Date.parse(this.convertDateString(inputString));
        console.log("the parsed date: " + parsedDate);
        if(isNaN(parsedDate)){
            console.log(inputString + ' isValidDate: date not valid');
            return false;
        // eslint-disable-next-line no-else-return
        } else {
            console.log(inputString + ' isValidDate: date valid');
            return true;
        }
    }

    convertUTCDateToLocalDate(date) {
        var newDate = new Date(date.getTime() - date.getTimezoneOffset()*60*1000);
        return newDate;   
    }

    formatSelectedDate(date){
        //let formattedDate = date.toDateString('en-US', {day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'UTC'});
        var day = date.getDate();
        if(date.getDate() < 10){
            day = "0" + date.getDate();
        }
        var monthValue = date.getMonth() + 1;
        var month = monthValue.toString();
        if(monthValue < 10){
            month = "0" + month;
        }
        var formattedDate = day + "/" + month + "/" + date.getFullYear();
        console.log("And the formatted date is: " + formattedDate);
        return formattedDate;
    }

    isDateInRange(startDate, endDate, currentDate){
        let _startDate = new Date(startDate);
        let _endDate = new Date(endDate);
        let _currentDate = new Date(currentDate);
        return _startDate <= _currentDate && _currentDate <= _endDate;
    }

    convertDateString(date){
        // Converts date string from DD/MM/YYYY to MM/DD/YYYY
        let dateComps = date.split("/");
        return dateComps[1] + "/" + dateComps[0] + "/" + dateComps[2];
    }

    // Function to build calendar data
    // Each month is an array of arrays of objects
    // Each calendar row (week) is an array of objects, each day is an object
    generateCalendar(year, month, calDay, noFocus){
        this.calendarData = [];
        this.displayedMonthLabel = this.months[this.displayedMonth];
        let firstDay = new Date(this.displayedYear, this.displayedMonth);
        let noOfDaysInMonth = this.getDaysInMonth(year, month);
        let date = 1;
        // iterate over weeks
        for(let i = 0; i < 6; i++){
            // declare week object
            let week = { id: i, days: []};
            // iterate over days in week
            for(let j = 0; j < 7; j++){
                // declare day object
                let day = { "id": j };
                // Display selected date - defaults to today if no user selection
                if(date == calDay 
                    && this.displayedMonth === this.selectedDate.getMonth() 
                    && this.displayedYear === this.selectedDate.getFullYear()
                    /* && this.isDateInRange(this.excludedStartDate, 
                        this.excludedEndDate, 
                        new Date(this.displayedYear, this.displayedMonth, date))*/
                    && !noFocus){
                        day.class = "ds_selected";
                        day.tabindex = "0";
                }
                // Handle excluded days
                if (this.isDateInRange(this.excludedStartDate, 
                                       this.excludedEndDate, 
                                       new Date(this.displayedYear, this.displayedMonth, date))){
                    day.disabled = "true";
                    day.ariaSelected = "true";
                    day.class="";
                }
                // Hide calendar days that do not have a value
                if(i === 0 && j < firstDay.getDay()){
                    day.value = 0;
                    day.tabindex = "-1";
                    day.style = "display: none;";
                    day.class = "";
                } else if (date > noOfDaysInMonth){
                    break;
                } else {
                    day.value = date;
                    day.tabindex = day.tabindex ? day.tabindex : "0";
                    day.style = "display: block;";
                    date++
                }
                // Add current day (calendar cell) to week array
                week.days.push(day);
            }
            // Add current week to calendar data collection
            this.calendarData.push(week);
        }
    }
}