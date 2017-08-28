//wraps the game
$(document).ready(function () {
	
//declares the game variables	
	var questionBank=new Array;
	var wordArray=new Array;
	var previousGuesses=new Array;
 	var currentWord;
	var currentClue;
	var wrongAnswerCount;
	
 
//selects the words from json from wordBank file 
 		$.getJSON('wordBank.json', function(data) { 
//maps sub-arrays to index values
		for(i=0;i<data.wordlist.length;i++){ 
			questionBank[i]=new Array;
			questionBank[i][0]=data.wordlist[i].word;
			questionBank[i][1]=data.wordlist[i].clue;
		}
		titleScreen();
		})//gtjson

 //title screen provides intentional entry into game screen
function titleScreen(){
	$('#gameContent').append('<div id="gameTitle">HANGMAN</div><div id="startButton" class="button" background-color: red>BEGIN</div>');		
	$('#startButton').on("click",function (){gameScreen()});
}//display game
	
	
//empties out the titleScreen from game content, and creates the gameScreen by appending relevant divs to the gameContent main div	
function gameScreen(){
	$('#gameContent').empty();
	$('#gameContent').append('<div id="pixHolder"><img id="hangman" src="assets/images/hangman.png"></div>');
	$('#gameContent').append('<div id="wordHolder"></div>');
	$('#gameContent').append('<div id="clueHolder"></div>');
	$('#gameContent').append('<div id="guesses">Previous guesses:</div>');
	$('#gameContent').append('<div id="feedback"></div>');
	$('#gameContent').append('<div id="pixFeedback"><img id="hangmanFeedbackGameOnV1" src="assets/images/hangmanFeedbackGameOnV1.png"></div>');
	$('#gameContent').append('<form><input type="text" id="dummy" ></form>');

//the getword function, defined on line 62, and then creates the approptiate number of tiles
//this block also initiates the WAC count and the PG array. 			
	getWord();
	var numberOfTiles=currentWord.length;
	wrongAnswerCount=0;
	previousGuesses=[];
// Need to display wrongAnswerCount	as a score at top...

//based onthe number of letters in the current word, this creates the appropriate number of tiles
// in div wordHolder by appending new tile class divs (#t) It iterates through the collection,
// concatenations div #t for each item in the loop per the i loop counter.
	for(i=0;i<numberOfTiles;i++){
		$('#wordHolder').append('<div class="tile" id=t'+i+'></div>');
	}
//appends clue to its div		
	$('#clueHolder').append("HINT: "+currentClue);
 
 //on keyup calls the handlekeyup main function
	$(document).on("keyup",handleKeyUp);
//mobile screen trick for  virtual keyboard access.	
	$(document).on("click",function(){$('#dummy').focus();});
	$('#dummy').focus();
}//gamescreen
			
//selects random from the wordBank, then sets currentWord equal to index [0] of JSON subarray (declared at top), 
//splits it up and creates a wordArray, variable defined at the top, to be used in the handleKeyUp option.			
//split() method is used to split a string into an array of substrings, and returns the new array.
//If an empty string ("") is used as the separator, the string is split between each character.
function getWord(){
	var rnd=Math.floor(Math.random()*questionBank.length);
	currentWord=questionBank[rnd][0];
	currentClue=questionBank[rnd][1];
	questionBank.splice(rnd,1); 
	wordArray=currentWord.split("");			
}//getword
			

			
//this block reads, validates, and operates on the input from keyboard			
function handleKeyUp(event) {
	
//this line deals with glitch in recent versions of android
	if(event.keyCode==229){event.keyCode=$('#dummy').val().slice($('#dummy').val().length-1,$('#dummy').val().length).toUpperCase().charCodeAt(0);}

//limits the keyboard input to just the alphabet..then execute the code block..		
	if(event.keyCode>64 && event.keyCode<91){
//declare and initiate some variables to a false start state		
		var found=false;
		var previouslyEntered=false;
//declare and initiate the input, important, also used for form entry in the gamecontent div form,
//code converts keycode to lower case string value		
		var input=String.fromCharCode(event.keyCode).toLowerCase();
		
//for loop the length of the previousGuesses array, declared at top and instantiated above, and 
//tests whther the input value is among the previous guesses array, and if so, it flags as previouslyEntered 	
		for(i=0;i<previousGuesses.length;i++){if(input==previousGuesses[i]){previouslyEntered=true;}}

//if block that if 'input' is not flagged as PreviouslyEntered (boolean test), take the previousGuesses
		if(!previouslyEntered)
//and use the push() method to add new items to the end of an array, and return the new length.				
		{
			previousGuesses.push(input);
//for loop iterates through the wordArray comparing the input charater with the wordArray of the currentWord			
			for(i=0;i<wordArray.length;i++){
//if the input character = a character in the wordArray of the currentWord, then set 'found' flag to true				
//and appends the key input letter to the div tile of the same matching index value
				if(input==wordArray[i]){found=true;$('#t'+i).append(input);}	
			}//for
//if found is true, then run the checkAnswer function				
			if(found){checkAnswer();}
//if the input is a wrongAnswer, run the wrongAnswer function and pass 'input' as a parameter
			else{wrongAnswer(input);}
		}//if
	}//if
}//handlekeyup
	

function checkAnswer(){
//clear current answer variable
	var currentAnswer="";	

	for(i=0;i<currentWord.length;i++){
//sets currentAnswer variable equal to the cumulative iteration of tiles set to text, which is basically
//the current state of the currentWord-Answer...so the currentWordAnswer is built tile by tile.		
		currentAnswer+=($('#t'+i).text());
	}
//tests whether the currentAnswer (built above) is equal to the currentWord yet, ot needs more iterations.			
	if(currentAnswer==currentWord){
		victoryMessage();
	};
}//STILL TO DO: checkanswer, add victory song/audio and victory picture, and increment points by 1.

//called and passed in 'input' variable/argument as is expects to be passed 'a' 		
function wrongAnswer(a){
//increment the wrongAnswer count
	wrongAnswerCount++;
//set position equal to wrongAnswer count times -75px (basically a cumulative effect on image position)	
	var pos=(wrongAnswerCount*-75) +"px"
//guesses div is where we display the content of the previousGuesses Array.
//appends a space and the 'input' that was passed for 'a'
	$('#guesses').append("  "+a);
//shift hangman picture position
	$('#hangman').css("left",pos);
//Trigger defeat message if wronganswerCount is 6
	if(wrongAnswerCount==6){
		defeatMessage();}
}//wronganswer

// Need to manage focus
//NOTE that: The keyup event is sent to an element when the user releases a key on the keyboard.
//It can be attached to any element, but the event is only sent to the element that has the focus.
//Focusable elements can vary between browsers, but form elements can always get focus 
//so are reasonable candidates for this event type. (from https://api.jquery.com/keyup/).		
function victoryMessage(){
//The blur() method is used to remove focus from an element.	
	document.activeElement.blur();
//As the .keyup() method is just a shorthand for .on( "keyup", handler ), 
//detaching is possible using .off( "keyup" ).	
	$(document).off("keyup", handleKeyUp);

	$('#feedback').append("LIFE SPARED!<br><br><div id='replay' class='button'>CONTINUE</div>");
//if button is clicked, reset by calling gameScreen and if questionBank still has words else end game gracefully.
	$('#replay').on("click",function (){
		if(questionBank.length>0){
			gameScreen()}
		else{finalPage()}
	});
}//victory

//same code aas victoryMessage, except for defeat scenario		
function defeatMessage(){
	document.activeElement.blur();
	$(document).off("keyup", handleKeyUp);
	$('#feedback').append("Hanged for stupidity!<br>(answer= "+ currentWord +")<div id='replay' class='button'>CONTINUE</div>");

	$('#replay').on("click",function (){
		if(questionBank.length>0){
			gameScreen()}
		else{finalPage()}
	});
}//defeat

function finalPage(){
	$('#gameContent').empty();
	$('#gameContent').append('<div id="finalMessage">You conquered all our challenge words...Go home to you loved ones now!</div>');
}//finalpage
	
	});//doc ready