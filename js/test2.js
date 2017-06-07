// Tax estimation - avoids all prototype and inheritance misuses of javascript - solely for learning syntax
// Written by Leo Scarano

// Data structures for tax bracket and tax schedule data
function TaxBracket (cutoff, percentage, base){
	this.cutoff = cutoff; // how much money to be in this bracket 
	this.percentage = percentage; // what the tax is in this bracket
	this.base = base; // combinied tax from all lower brackets
}

// A tax schedule is just 5 brackets
function TaxSchedule(b0, b1, b2, b3, b4){
	this[0] = b0; this[1] = b1; this[2] = b2; this[3] = b3; this[4] = b4;
}

// Taxes are computed using a tax schedule that depends on your filing status,
// so we just need to create an array to store the different scheudles
var Schedules = new Array(4);

// Schedule X: Single
Schedules[0] =  new TaxSchedule(new TaxBracket(263750, .396, 84020.5),
    new TaxBracket(121300, .36, 32738.5), new TaxBracket(58150, .31, 13162),
    new TaxBracket(24000, .28, 3600), new TaxBracket(0, .15, 0));

// Schedule Z: Head of Household
Schedules[1] = new TaxSchedule(new TaxBracket(263750, .396, 81554),
    new TaxBracket(134500, .36, 35024), new TaxBracket(83050, .31, 19074.5),
    new TaxBracket(32150, .28, 4822.5), new TaxBracket(0, .15, 0));

// Schedule Y1: Married,  Filing Jointly
Schedules[2] = new TaxSchedule(new TaxBracket(263750, .396, 79445),
    new TaxBracket(147700, .36, 37667), new TaxBracket(96900, .31, 21919),
    new TaxBracket(40100, .28, 6015), new TaxBracket(0, .15, 0));

// Schedule Y2: Married, Filing Separately
Schedules[3] = new TaxSchedule(new TaxBracket(131875, .396, 39722.5),
    new TaxBracket(73850, .36, 18833.5), new TaxBracket(48450, .31, 10959.5),
    new TaxBracket(20050, .28, 3007.5),  new TaxBracket(0, .15, 0));


// Standard deductions allowed by tax law depend on filing status
// The deductions are stored in an array as well
var StandardDeductions = new Object();
StandardDeductions[0] = 4000; // single
StandardDeductions[1] = 5900; // head of household
StandardDeductions[2] = 6700; // married - filing jointly
StandardDeductions[3] = 3350; // married - filing separately

// This function computes the tax and updates all the elements in the form.
// It is triggered whenever anything changes, and makes sure that
// all elements of the form contains legal values and are consistent.

function compute(f){

	var f = document.taxcalc; // This is the form we'll we working with
	
	// Get filing status
	var status = f.status.selectedIndex;
	
	// line 1, adjusted gross income
	var income = parseFloat(f.income.value);
	if (isNaN(income)) { 
		income = 0;
		f.income.value = "0";
		alert("You entered a wrong income value, please try again");
	}
	f.income.value = Math.round(income);
	
	// line 2, the standard or itemized deduction 
	var deduction;
	if(f.standard.checked){
		deduction = StandardDeductions[status];
	} else {
		deduction = parseFloat(f.deduction.value);
		if (isNaN(deduction)){
			deduction = 0;
			f.deduction.value = 0;
			alert("You entered an invalid deduction, please try again");
		}
		if (deduction  < StandardDeductions[status]){
			deduction = StandardDeductions[status];
			f.standard.checked = true;
			}
	}
	f.deduction.value = Math.round(deduction);
	
	// line 3 - subtract
	var line3 = income - deduction;
	if(line3 < 0) {
		line3 = 0;
	}
	f.line3.value = line3;
	
	// line 4: exemptions
	var num_exemptions = f.num_exemptions.value;
	if(isNaN(num_exemptions)){
		num_exemptions = 1;
		f.num_exemptions.value = num_exemptions;
	}
	var exemption = num_exemptions * 2550;
	f.exemption.value = exemption;
	
	// line 5: subtract line 4 from line 3
	var line5 = line3 - exemption;
	if(line5 < 0) line5 = 0;
	f.line5.value = line5;
	
	// line 6: tax from schedules
	// Determines what tax scheudle to use based on filing status
	var schedules = Schedules[status];
	
	// Determines what tax bracket to use
	for(var i = 0; i < 5; i++){
		if (line5 >= schedules[i].cutoff) {
			var bracket = schedules[i];
			break;
		}
	}
	
	// DEBUG

	
//	var bracket = schedule[i];
	// computes tax based on bracket 
	var tax = (line5 - bracket.cutoff) * bracket.percentage + bracket.base;
	f.tax.value = Math.round(tax);
}